import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.headers.get("Authorization")?.split("Bearer ")[1];
  if (!token) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let firebaseUid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    firebaseUid = decoded.uid;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const campaigns = await prisma.campaign.findMany({
    where: { firebaseUid },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      startDate: true,
      endDate: true,
      budget: true,
      spend: true,
      roi: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ campaigns });
}
