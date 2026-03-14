import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { getServerSession } from "@/lib/auth-server";

const SUPER_ADMIN_EMAIL = "vickkie028@gmail.com";

export async function POST(request) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is super admin
    if (session.user.email !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const { courseId, action, rejectionReason } = await request.json();

    if (!courseId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    const courseRef = adminDb.collection("published_courses").doc(courseId);
    const courseDoc = await courseRef.get();

    if (!courseDoc.exists) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const updateData = {
      approvalStatus: action === "approve" ? "approved" : "rejected",
      status: action === "approve" ? "published" : "rejected",
      reviewedBy: session.user.email,
      reviewedAt: new Date().toISOString(),
    };

    if (action === "reject" && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    if (action === "approve") {
      updateData.publishedAt = new Date().toISOString();
      
      // Notify instructor of approval
      const courseData = courseDoc.data();
      if (courseData.createdBy) {
        try {
          const { createNotification } = await import("@/lib/create-notification");
          await createNotification(adminDb, {
            userId: courseData.createdBy,
            title: "Course Approved!",
            body: `Your course "${courseData.title}" has been approved and is now published.`,
            type: "achievement",
            link: "/courses",
          });
        } catch (notifError) {
          console.warn("Failed to create approval notification:", notifError);
        }
      }
    } else if (action === "reject") {
      // Notify instructor of rejection
      const courseData = courseDoc.data();
      if (courseData.createdBy) {
        try {
          const { createNotification } = await import("@/lib/create-notification");
          await createNotification(adminDb, {
            userId: courseData.createdBy,
            title: "Course Needs Revision",
            body: `Your course "${courseData.title}" was not approved. Reason: ${rejectionReason || "Please review and resubmit."}`,
            type: "warning",
            link: "/studio",
          });
        } catch (notifError) {
          console.warn("Failed to create rejection notification:", notifError);
        }
      }
    }

    await courseRef.update(updateData);

    return NextResponse.json({ 
      success: true,
      message: action === "approve" ? "Course approved and published" : "Course rejected"
    });
  } catch (error) {
    console.error("Error approving/rejecting course:", error);
    return NextResponse.json({ error: "Failed to process course approval" }, { status: 500 });
  }
}
