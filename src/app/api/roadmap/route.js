// app/api/roadmap/route.js
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { roadmapId } = await req.json();
    if (!roadmapId) return NextResponse.json({ message: "Missing ID" }, { status: 400 });

    // Try public first, then fallback to user-specific (optional)
    let docRef = doc(db, "public_roadmaps", roadmapId); // if you make some public
    let snap = await getDoc(docRef);

    if (!snap.exists()) {
      // Or remove this block if all are private
      return NextResponse.json({ process: "not_found" }, { status: 404 });
    }

    return NextResponse.json({ ...snap.data(), id: roadmapId });
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}