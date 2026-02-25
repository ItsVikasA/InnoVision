import { NextResponse } from "next/server";
import { getAdminDb, FieldValue } from "@/lib/firebase-admin";
import { nanoid } from "nanoid";

export async function POST(request) {
  let body;
  try {
    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json(
        { success: false, error: "Database not available. Check server configuration." },
        { status: 500 }
      );
    }

    body = await request.json();
    const { userId, courseId } = body;

    // Guard: both fields required
    if (!userId || !courseId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: userId and courseId" },
        { status: 400 }
      );
    }

    // Get course details — userId is user.email (project primary key)
    const courseSnap = await adminDb.collection("users").doc(userId).collection("roadmaps").doc(courseId).get();

    if (!courseSnap.exists) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    const courseData = courseSnap.data();

    // Check all chapters are completed
    const chapters = courseData.chapters || [];
    const allChaptersCompleted =
      chapters.length > 0 && chapters.every((ch) => ch.completed);

    if (!allChaptersCompleted) {
      return NextResponse.json(
        { success: false, error: "Course not completed yet" },
        { status: 400 }
      );
    }

    // Return existing certificate if already generated
    const certificatesRef = adminDb.collection("users").doc(userId).collection("certificates");
    const existingCerts = await certificatesRef.where("courseId", "==", courseId).get();

    if (!existingCerts.empty) {
      const existingDoc = existingCerts.docs[0];
      const existingData = existingDoc.data();

      // Safely serialize issuedAt — Firestore Timestamp is not JSON-safe
      let issuedAt = null;
      if (existingData.issuedAt) {
        try {
          issuedAt =
            typeof existingData.issuedAt.toDate === "function"
              ? existingData.issuedAt.toDate().toISOString()
              : String(existingData.issuedAt);
        } catch {
          issuedAt = new Date().toISOString();
        }
      }

      return NextResponse.json({
        success: true,
        certificate: {
          id: existingDoc.id,
          certificateId: existingData.certificateId,
          userId: existingData.userId,
          courseId: existingData.courseId,
          courseTitle: existingData.courseTitle,
          userName: existingData.userName,
          completionDate: existingData.completionDate,
          chapterCount: existingData.chapterCount,
          issuedAt,
          verified: existingData.verified,
        },
      });
    }

    // Generate unique certificate ID
    const certificateId = nanoid(12);

    // Get user display name — guard against missing user doc
    let userName = "Student";
    const userSnap = await adminDb.collection("users").doc(userId).get();
    if (userSnap.exists) {
      const userData = userSnap.data();
      userName = userData.displayName || userData.name || userData.email || "Student";
    }

    // Resolve course title with fallback
    const courseTitle =
      courseData.courseTitle || courseData.title || "Untitled Course";

    const chapterCount = chapters.length;

    const completionDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const issuedAtISO = new Date().toISOString();

    // Save to Firestore with serverTimestamp (not JSON-serialized)
    const certDocData = {
      certificateId,
      userId,
      courseId,
      courseTitle,
      userName,
      completionDate,
      chapterCount,
      issuedAt: FieldValue.serverTimestamp(),
      verified: true,
    };

    const certRef = await certificatesRef.add(certDocData);

    // Return plain JSON-safe response (no serverTimestamp)
    return NextResponse.json({
      success: true,
      certificate: {
        id: certRef.id,
        certificateId,
        userId,
        courseId,
        courseTitle,
        userName,
        completionDate,
        chapterCount,
        issuedAt: issuedAtISO,
        verified: true,
      },
    });
  } catch (error) {
    // Enhanced error logging with context
    console.error("Certificate generation error:", {
      operation: "certificate_generation",
      userId: body?.userId,
      courseId: body?.courseId,
      errorType: error.code || error.name || "UnknownError",
      errorMessage: error.message,
      errorStack: error.stack,
    });

    // Detect specific error types and return appropriate responses
    let errorType = "ServerError";
    let errorMessage = "Failed to generate certificate";
    let statusCode = 500;
    let details = error.message;

    // Firestore-specific errors
    if (error.code) {
      if (error.code === "permission-denied") {
        errorType = "PermissionDenied";
        errorMessage = "Permission denied accessing database";
        statusCode = 403;
        details = "You don't have permission to access this resource";
      } else if (error.code === "not-found") {
        errorType = "NotFound";
        errorMessage = "Resource not found";
        statusCode = 404;
        details = "The requested resource could not be found";
      } else if (error.code === "unavailable" || error.code === "deadline-exceeded") {
        errorType = "DatabaseTimeout";
        errorMessage = "Database connection timeout";
        statusCode = 503;
        details = "Database is temporarily unavailable. Please try again.";
      } else if (error.code === "failed-precondition" || error.code === "aborted") {
        errorType = "DatabaseError";
        errorMessage = "Database operation failed";
        statusCode = 500;
        details = "A database error occurred. Please try again.";
      }
    }

    // Missing or invalid data errors
    if (error.message && (
      error.message.includes("undefined") ||
      error.message.includes("null") ||
      error.message.includes("Cannot read")
    )) {
      errorType = "InvalidData";
      errorMessage = "Invalid or missing data";
      statusCode = 500;
      details = "Required data is missing or invalid. Please try again.";
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        errorType,
        details,
      },
      { status: statusCode }
    );
  }
}
