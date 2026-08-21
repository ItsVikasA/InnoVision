import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chapterModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    maxOutputTokens: 8192,
  },
});

async function updateDatabase(content, chapter, roadmapId, session) {
  const docRef = adminDb
    .collection("users")
    .doc(session.user.email)
    .collection("roadmaps")
    .doc(roadmapId)
    .collection("chapters")
    .doc(chapter);

  try {
    const { tasks, ...chapterNew } = content;

    await docRef.update({ content: chapterNew, process: "completed" });

    const taskDocRef = docRef.collection("tasks").doc("task");

    await taskDocRef.set({ ...tasks });
  } catch (error) {
    console.error("Error updating database:", error);
    await docRef.delete();
  }
}

async function generateChapter(prompt, number, roadmapId, session) {
  const docRef = adminDb
    .collection("users")
    .doc(session.user.email)
    .collection("roadmaps")
    .doc(roadmapId)
    .collection("chapters")
    .doc(number);

  try {
<<<<<<< HEAD
    const response = await openai.chat.completions.create({
      model: "gemini-3.7-flash",
      messages: [
        {
          role: "system",
          content:
            "You are a chapter content generator that creates structured, engaging, and detailed educational content across various subjects based on provided chapter details in JSON format , including title, learningObjectives, and contentOutline, returning a JSON response with title, chapterNumber, learningObjectives, chapterDescription, subtopics (each with a header, title, content as an array of {type: (header1, header2, header3, para, points, code), content: (text)}, where points are in markdown, let the content be array of points for points type. If type is code, content is a Markdown-formatted string in the exact format: ```(programming language name) (code)```, otherResources which properly align with the topic(upto 5 resources), along with the well-balanced tasks (upto 3 tasks) in JSON format (multiple-choice|fill-in-the-blank|match-the-following), ensuring task type aligns with key concepts, fill-in-the-blanks strictly use '________' for blanks and include an array of acceptableAnswers with synonyms or variations of the correct answer and include an answer, multiple-choice tasks have four options, match-the-following has terms element containing lhs array and rhs array, and their match indexes as the answer array and an explanation, and answers are formatted properly while maintaining a structured and explanation is provided for all the tasks, let everything be simple string don't give latex responses.",
        },
        {
          role: "user",
          content: JSON.stringify(prompt),
        },
      ],
    });
=======
    const systemInstruction = "You are a chapter content generator that creates structured, engaging, and detailed educational content across various subjects based on provided chapter details in JSON format, including title, learningObjectives, and contentOutline, returning a JSON response with title, chapterNumber, learningObjectives, chapterDescription, subtopics (each with a header, title, content as an array of {type: (header1, header2, header3, para, points, code), content: (text)}, where points are in markdown, let the content be array of points for points type. If type is code, content is a Markdown-formatted string in the exact format: ```(programming language name) (code)```, otherResources which properly align with the topic(upto 5 resources), along with the well-balanced tasks (upto 3 tasks) in JSON format (multiple-choice|fill-in-the-blank|match-the-following), ensuring task type aligns with key concepts, fill-in-the-blanks strictly use '________' for blanks and include an array of acceptableAnswers with synonyms or variations of the correct answer and include an answer, multiple-choice tasks have four options, match-the-following has terms element containing lhs array and rhs array, and their match indexes as the answer array and an explanation, and answers are formatted properly while maintaining a structured and explanation is provided for all the tasks, let everything be simple string don't give latex responses.";
>>>>>>> 3775a552789c8288a6474aff86f000af9934623d

    const result = await chapterModel.generateContent(`${systemInstruction}\n\nChapter details: ${JSON.stringify(prompt)}`);
    const rawText = result.response.text();
    const data = JSON.parse(rawText);

    await updateDatabase(data, number, roadmapId, session);
  } catch (error) {
    console.error("Error generating chapter:", error);
    await docRef.update({ process: "failed", error: error.message });
  }
}

async function cleanupStuckChapters(session, roadmapId, number) {
  const docRef = adminDb
    .collection("users")
    .doc(session.user.email)
    .collection("roadmaps")
    .doc(roadmapId)
    .collection("chapters")
    .doc(number);

  const docSnap = await docRef.get();
  if (docSnap.exists) {
    const data = docSnap.data();
    const timeDiff = Date.now() - (data.timestamp || 0);

    // Timeout after 2 minutes (120 * 1000)
    if (data.process === "pending" && timeDiff > 120 * 1000) {
      console.log(`Marking stuck chapter as failed: ${number}`);
      await docRef.update({ process: "failed", error: "Generation timed out" });
    }
  }
}

export async function POST(req) {
  const { prompt, number, roadmapId } = await req.json();
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const chapterDocRef = adminDb
      .collection("users")
      .doc(session.user.email)
      .collection("roadmaps")
      .doc(roadmapId)
      .collection("chapters")
      .doc(number);

    await chapterDocRef.set({
      process: "pending",
      timestamp: Date.now(),
    });

    setTimeout(() => {
      cleanupStuckChapters(session, roadmapId, number);
    }, 125 * 1000); // Wait slightly longer than the 2-min timeout check

    generateChapter(prompt, number, roadmapId, session);

    return NextResponse.json({ process: "pending" }, { status: 202 });
  } catch (error) {
    console.error("POST request error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
