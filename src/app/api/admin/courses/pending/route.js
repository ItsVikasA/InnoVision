import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { getServerSession } from "@/lib/auth-server";

const SUPER_ADMIN_EMAIL = "vickkie028@gmail.com";

export async function GET(request) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is super admin
    if (session.user.email !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    // Get all pending courses
    const coursesRef = adminDb.collection("published_courses");
    const pendingQuery = coursesRef.where("approvalStatus", "==", "pending");
    const querySnapshot = await pendingQuery.get();

    const courses = [];
    querySnapshot.forEach((doc) => {
      courses.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Sort by submission date (newest first)
    courses.sort((a, b) => {
      const dateA = new Date(a.submittedAt || a.publishedAt || 0);
      const dateB = new Date(b.submittedAt || b.publishedAt || 0);
      return dateB - dateA;
    });

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("Error fetching pending courses:", error);
    return NextResponse.json({ error: "Failed to fetch pending courses" }, { status: 500 });
  }
}
