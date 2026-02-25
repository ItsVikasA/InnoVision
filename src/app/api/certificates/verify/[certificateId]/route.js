import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET(request, { params }) {
  try {
    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json(
        { error: "Database not available. Check server configuration." },
        { status: 500 }
      );
    }

    const { certificateId } = params;

    if (!certificateId) {
      return NextResponse.json(
        { error: "Certificate ID is required" },
        { status: 400 }
      );
    }

    // Search for certificate across all users
    const usersSnapshot = await adminDb.collection("users").get();

    for (const userDoc of usersSnapshot.docs) {
      const certSnapshot = await adminDb
        .collection("users")
        .doc(userDoc.id)
        .collection("certificates")
        .where("certificateId", "==", certificateId)
        .get();

      if (!certSnapshot.empty) {
        const certData = certSnapshot.docs[0].data();
        return NextResponse.json({
          success: true,
          valid: true,
          certificate: {
            userName: certData.userName,
            courseTitle: certData.courseTitle,
            completionDate: certData.completionDate,
            chapterCount: certData.chapterCount,
            verified: certData.verified,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      valid: false,
      message: "Certificate not found",
    });
  } catch (error) {
    console.error("Error verifying certificate:", error);
    return NextResponse.json(
      { error: "Failed to verify certificate" },
      { status: 500 }
    );
  }
}
