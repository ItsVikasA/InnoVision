import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { content, title } = await request.json();

    if (!content || !title) {
      return NextResponse.json(
        { error: "Content and title are required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
<<<<<<< HEAD
      model: "gemini-3.7-flash",
=======
      model: "gemini-2.5-flash",
>>>>>>> 3775a552789c8288a6474aff86f000af9934623d
    });

    const prompt = `
Enhance the following educational content to make it clearer, more engaging, and student-friendly.

Guidelines:
- Keep the original structure
- Improve clarity and readability
- Add simple, relevant examples where helpful
- Improve explanations without changing meaning
- Output ONLY the enhanced content in Markdown format

Title:
${title}

Content:
${content}
`;

    const result = await model.generateContent(prompt);
    const enhanced = result.response.text();

    return NextResponse.json({ enhanced });
  } catch (error) {
    console.error("❌ Error enhancing content:", error);
    return NextResponse.json(
      { error: "Failed to enhance content" },
      { status: 500 }
    );
  }
}
