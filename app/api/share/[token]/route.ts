import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteParams = { params: { token: string } };

/**
 * GET /api/share/[token]
 *
 * Public endpoint — no authentication required.
 * Returns campaign data for a valid share token so management can view
 * reports without logging in.
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  if (!params.token || params.token.length < 10) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const campaign = await prisma.campaign.findUnique({
    where: { shareToken: params.token },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Strip internal / ownership fields before sending
  const {
    firebaseUid: _uid,
    userId: _userId,
    shareToken: _st,
    ...publicData
  } = campaign;

  return NextResponse.json({ campaign: publicData });
}
