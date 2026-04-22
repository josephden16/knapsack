import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import prisma from "@/lib/prisma";

type RouteParams = { params: { slug: string } };

export async function GET(req: NextRequest, { params }: RouteParams) {
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

  const campaign = await prisma.campaign.findFirst({
    where: { slug: params.slug, firebaseUid },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ campaign });
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
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

  const campaign = await prisma.campaign.findFirst({
    where: { slug: params.slug, firebaseUid },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.campaign.delete({ where: { id: campaign.id } });

  return NextResponse.json({ success: true });
}
