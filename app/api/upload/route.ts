import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";
import { validateCampaignWorkbook } from "@/lib/parsers/validate";
import { parseWorkbook } from "@/lib/parsers/parse";

export async function POST(req: NextRequest) {
  const token = req.headers.get("Authorization")?.split("Bearer ")[1];
  if (!token) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let firebaseUid: string;
  let userEmail: string | undefined;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    firebaseUid = decoded.uid;
    userEmail = decoded.email;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ errors: ["No file provided"] }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer" });

  // Validate
  const validationErrors = validateCampaignWorkbook(workbook);
  if (validationErrors.length > 0) {
    return NextResponse.json({ errors: validationErrors }, { status: 422 });
  }

  // Parse
  const data = parseWorkbook(workbook);

  // Check slug uniqueness for this user
  const existing = await prisma.campaign.findFirst({
    where: { firebaseUid, slug: data.meta.slug },
  });
  if (existing) {
    return NextResponse.json(
      { errors: [`A campaign with slug "${data.meta.slug}" already exists.`] },
      { status: 409 },
    );
  }

  // Upsert user record
  await prisma.user.upsert({
    where: { firebaseUid },
    update: {},
    create: {
      firebaseUid,
      email: userEmail ?? firebaseUid,
    },
  });

  const user = await prisma.user.findUnique({ where: { firebaseUid } });
  if (!user) {
    return NextResponse.json(
      { errors: ["User record error"] },
      { status: 500 },
    );
  }

  // Write campaign
  await prisma.campaign.create({
    data: {
      firebaseUid,
      userId: user.id,
      name: data.meta.name,
      slug: data.meta.slug,
      status: data.meta.status,
      startDate: data.meta.start_date,
      endDate: data.meta.end_date,
      budget: data.meta.budget,
      spend: data.meta.spend,
      roi: data.meta.roi,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tofSummary: data.tofSummary as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tofTvc: data.tofTvc as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tofKol: data.tofKol as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tofKolPerformers: data.tofKolPerformers as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tofOrganic: data.tofOrganic as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tofPr: data.tofPr as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mofSummary: data.mofSummary as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mofMeta: data.mofMeta as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mofTiktok: data.mofTiktok as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mofX: data.mofX as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mofBranding: data.mofBranding as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      bofSummary: data.bofSummary as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      bofInapp: data.bofInapp as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      bofLanding: data.bofLanding as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      bofDeeplinks: data.bofDeeplinks as any,
    },
  });

  return NextResponse.json({ slug: data.meta.slug }, { status: 201 });
}
