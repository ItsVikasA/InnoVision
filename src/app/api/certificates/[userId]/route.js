import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET(request, { params }) {
  try {
    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json(
        { success: false, error: "Database not available. Check server configuration." },
        { status: 500 }
      );
    }

    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // userId is the email (URL-decoded automatically by Next.js)
    const certificatesRef = adminDb.collection("users").doc(userId).collection("certificates");

    let snapshot;
    try {
      // Try ordered query first (requires Firestore index on issuedAt)
      snapshot = await certificatesRef.orderBy("issuedAt", "desc").get();
    } catch {
      // Fallback: fetch all and sort in-memory if index not ready
      snapshot = await certificatesRef.get();
    }

    const certificates = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();

      // Safely serialize issuedAt — Firestore Timestamp is not JSON-safe
      let issuedAt = null;
      if (data.issuedAt) {
        try {
          issuedAt =
            typeof data.issuedAt.toDate === "function"
              ? data.issuedAt.toDate().toISOString()
              : String(data.issuedAt);
        } catch {
          issuedAt = null;
        }
      }

      return {
        id: docSnap.id,
        certificateId: data.certificateId,
        userId: data.userId,
        courseId: data.courseId,
        courseTitle: data.courseTitle,
        userName: data.userName,
        completionDate: data.completionDate,
        chapterCount: data.chapterCount,
        issuedAt,
        verified: data.verified,
      };
    });

    // Sort in-memory descending by issuedAt as a safety net
    certificates.sort((a, b) => {
      if (!a.issuedAt) return 1;
      if (!b.issuedAt) return -1;
      return new Date(b.issuedAt) - new Date(a.issuedAt);
    });

    return NextResponse.json({
      success: true,
      certificates,
      count: certificates.length,
    });
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}
