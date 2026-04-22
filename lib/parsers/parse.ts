import * as XLSX from "xlsx";

function getRows(
  wb: XLSX.WorkBook,
  sheetName: string,
): Record<string, unknown>[] {
  const sheet = wb.Sheets[sheetName];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];
}

export interface CampaignMeta {
  name: string;
  slug: string;
  status: string;
  start_date: string;
  end_date: string;
  budget: number;
  spend: number;
  roi: number;
}

export interface ParsedWorkbook {
  meta: CampaignMeta;
  tofSummary: Record<string, unknown>[];
  tofTvc: Record<string, unknown>[];
  tofKol: Record<string, unknown>[];
  tofKolPerformers: Record<string, unknown>[];
  tofOrganic: Record<string, unknown>[];
  tofPr: Record<string, unknown>[];
  mofSummary: Record<string, unknown>[];
  mofMeta: Record<string, unknown>[];
  mofTiktok: Record<string, unknown>[];
  mofX: Record<string, unknown>[];
  mofBranding: Record<string, unknown>[];
  bofSummary: Record<string, unknown>[];
  bofInapp: Record<string, unknown>[];
  bofLanding: Record<string, unknown>[];
  bofDeeplinks: Record<string, unknown>[];
}

export function parseWorkbook(wb: XLSX.WorkBook): ParsedWorkbook {
  const campaignRow = getRows(wb, "campaign")[0];

  const meta: CampaignMeta = {
    name: String(campaignRow["name"]),
    slug: String(campaignRow["slug"]),
    status: String(campaignRow["status"]),
    start_date: String(campaignRow["start_date"]),
    end_date: String(campaignRow["end_date"]),
    budget: Number(campaignRow["budget"]),
    spend: Number(campaignRow["spend"]),
    roi: Number(campaignRow["roi"]),
  };

  return {
    meta,
    tofSummary: getRows(wb, "tof_summary"),
    tofTvc: getRows(wb, "tof_tvc"),
    tofKol: getRows(wb, "tof_kol"),
    tofKolPerformers: getRows(wb, "tof_kol_performers"),
    tofOrganic: getRows(wb, "tof_organic"),
    tofPr: getRows(wb, "tof_pr"),
    mofSummary: getRows(wb, "mof_summary"),
    mofMeta: getRows(wb, "mof_meta"),
    mofTiktok: getRows(wb, "mof_tiktok"),
    mofX: getRows(wb, "mof_x"),
    mofBranding: getRows(wb, "mof_branding"),
    bofSummary: getRows(wb, "bof_summary"),
    bofInapp: getRows(wb, "bof_inapp"),
    bofLanding: getRows(wb, "bof_landing"),
    bofDeeplinks: getRows(wb, "bof_deeplinks"),
  };
}
