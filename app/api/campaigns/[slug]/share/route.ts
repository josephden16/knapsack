import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

type RouteParams = { params: { slug: string } };

/**
 * POST /api/campaigns/[slug]/share
 *
 * Generates (or returns the existing) share token for a campaign.
 * Requires Firebase auth — only the campaign owner can create a share link.
 *
 * Response: { shareToken: string }
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
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
    select: { id: true, shareToken: true },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Re-use existing token or mint a new one
  const shareToken =
    campaign.shareToken ??
    (await prisma.campaign
      .update({
        where: { id: campaign.id },
        data: { shareToken: randomUUID() },
        select: { shareToken: true },
      })
      .then((c) => c.shareToken!));

  return NextResponse.json({ shareToken });
}

/**
 * DELETE /api/campaigns/[slug]/share
 *
 * Revokes the share token so the link stops working.
 */
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
    select: { id: true },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { shareToken: null },
  });

  return NextResponse.json({ success: true });
}
