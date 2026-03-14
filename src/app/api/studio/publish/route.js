import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { createNotification } from "@/lib/create-notification";

export async function POST(request) {
  try {
    const courseData = await request.json();

    // Save to published courses collection with pending status for admin approval
    const docRef = await adminDb.collection("published_courses").add({
      ...courseData,
      status: "pending",
      approvalStatus: "pending",
      submittedAt: new Date().toISOString(),
    });

    // Create notification for the creator
    if (courseData.createdBy) {
      try {
        await createNotification(adminDb, {
          userId: courseData.createdBy,
          title: "Course Submitted for Review",
          body: `Your course "${courseData.title}" has been submitted and is awaiting admin approval.`,
          type: "info",
          link: "/studio",
        });
      } catch (notifError) {
        console.warn("Failed to create submission notification:", notifError);
      }
    }

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: "Course submitted for approval",
    });
  } catch (error) {
    console.error("Error publishing course:", error);
    return NextResponse.json({ error: "Failed to publish course" }, { status: 500 });
  }
}
