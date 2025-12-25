import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { db } from "@/lib/firebase";
import {
  doc,
  updateDoc,
  increment,
  setDoc,
  query,
  collection,
  getDocs,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { nanoid } from "nanoid";
import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash", 
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json", 
  },
  safetySettings: [
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
  ],
});


async function updateDatabase(details, id, user, retries = 3) {
  const docRef = doc(db, "users", user.email, "roadmaps", id);
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await setDoc(docRef, { ...details, updatedAt: serverTimestamp() }, { merge: true });
      return true;
    } catch (error) {
      console.error(`DB Attempt ${attempt} failed:`, error);
      if (attempt === retries) return false;
      await new Promise((res) => setTimeout(res, 1000 * attempt));
    }
  }
  return false;
}


function cleanJsonResponse(text) {
  return text
    .replace(/^```json\s?/, "")
    .replace(/^```\s?/, "")
    .replace(/\s?```$/, "")
    .trim();
}


async function generateRoadmap(prompt, id, session, user_prompt) {
  const docRef = doc(db, "users", session.user.email, "roadmaps", id);

  try {
    const result = await model.generateContent(`
You are an expert curriculum designer. Generate a complete learning roadmap in strict JSON format.

Return ONLY valid JSON (no markdown, no explanations) with this exact structure:
{
  "courseTitle": "string",
  "courseDescription": "string",
  "chapters": [
    {
      "chapterNumber": 1,
      "chapterTitle": "string",
      "chapterDescription": "1 short sentence",
      "learningObjectives": ["Start with action verbs like Understand, Apply, Analyze..."],
      "contentOutline": ["Key topics as bullet points"]
    }
  ]
}

If the topic is not suitable for a structured course, return exactly: {"error": "unsuitable"}

Topic: ${prompt}
    `);

    const response = result.response;
    const rawText = response.text();
    const cleanedText = cleanJsonResponse(rawText);

    let parsed;
    try {
      parsed = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("JSON Parse failed:", cleanedText);
      throw new Error(`Invalid JSON from Gemini: ${parseError.message}`);
    }

    
    if (parsed.error === "unsuitable") {
      await updateDatabase(
        {
          message: "This topic is not suitable for a structured course.",
          process: "unsuitable",
        },
        id,
        session.user
      );
      return;
    }

    
    const difficulty =
      user_prompt.difficulty === "in-depth" ? "inDepth" : user_prompt.difficulty;

    await setDoc(
      doc(db, "users", session.user.email),
      {
        email: session.user.email,
        createdAt: serverTimestamp(),
        roadmapLevel: {},
      },
      { merge: true }
    );

    await updateDatabase(
      {
        ...parsed,
        createdAt: Date.now(),
        difficulty,
        process: "completed",
      },
      id,
      session.user
    );

  } catch (error) {
    console.error("Gemini generation failed:", error);

    let userMessage = "There was an error while generating your roadmap.";
    if (error.message?.includes("SAFETY")) {
      userMessage = "Content was blocked by safety filters. Try simpler wording.";
    } else if (error.message?.includes("quota") || error.status === 429) {
      userMessage = "Rate limit reached. Please wait a minute and try again.";
    } else if (error.message?.includes("token") || error.message?.includes("maximum")) {
      userMessage = "Topic too long. Try fewer modules or shorter names.";
    } else if (error.message?.includes("JSON")) {
      userMessage = "AI returned invalid format. Please try again.";
    }

    await updateDatabase(
      {
        message: userMessage,
        process: "error",
        errorDetails: error.message,
      },
      id,
      session.user
    );
  }
}


async function checkEligible(session) {
  try {
    const q = query(
      collection(db, "users", session.user.email, "roadmaps"),
      where("process", "==", "completed")
    );
    const snapshot = await getDocs(q);
    return snapshot.size < 6; 
  } catch (error) {
    console.error("Eligibility check failed:", error);
    return false;
  }
}


export async function POST(req) {
  try {
    const user_prompt = await req.json();
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!user_prompt?.prompt || user_prompt.prompt.trim().length === 0) {
      return NextResponse.json({ message: "Prompt is required" }, { status: 400 });
    }

    if (user_prompt.prompt.length > 1500) {
      return NextResponse.json(
        { message: "Prompt too long. Maximum 1500 characters." },
        { status: 400 }
      );
    }

    const isEligible = await checkEligible(session);
    if (!isEligible) {
      return NextResponse.json(
        { message: "You already have 6 courses. Delete one to create a new one." },
        { status: 403 }
      );
    }

    const roadmapId = nanoid(20);

    
    const dbSuccess = await updateDatabase(
      { process: "pending", createdAt: Date.now() },
      roadmapId,
      session.user
    );

    if (!dbSuccess) {
      return NextResponse.json(
        { message: "Failed to initialize roadmap" },
        { status: 500 }
      );
    }

    
    setTimeout(() => {
      generateRoadmap(user_prompt.prompt, roadmapId, session, user_prompt);
    }, 0);

    return NextResponse.json(
      { process: "pending", id: roadmapId },
      { status: 202 }
    );
  } catch (error) {
    console.error("POST /api/user_prompt error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
