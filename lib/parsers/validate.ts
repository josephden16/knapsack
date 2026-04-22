import * as XLSX from "xlsx";

const REQUIRED_SHEETS = [
  "campaign",
  "tof_summary",
  "tof_tvc",
  "tof_kol",
  "tof_kol_performers",
  "tof_organic",
  "tof_pr",
  "mof_summary",
  "mof_meta",
  "mof_tiktok",
  "mof_x",
  "mof_branding",
  "bof_summary",
  "bof_inapp",
  "bof_landing",
  "bof_deeplinks",
];

const MONTH_RE = /^\d{4}-\d{2}$/;

function getSheetRows(
  wb: XLSX.WorkBook,
  sheetName: string,
): Record<string, unknown>[] {
  const sheet = wb.Sheets[sheetName];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];
}

function isFiniteNum(v: unknown): boolean {
  if (typeof v === "number") return isFinite(v);
  if (typeof v === "string") return isFinite(parseFloat(v));
  return false;
}

export function validateCampaignWorkbook(wb: XLSX.WorkBook): string[] {
  const errors: string[] = [];

  // Check all required sheets exist
  for (const name of REQUIRED_SHEETS) {
    if (!wb.Sheets[name]) {
      errors.push(`Missing sheet: "${name}"`);
    }
  }

  // If any sheet is missing, return early — rest of validation will fail
  if (errors.length > 0) return errors;

  // campaign sheet: exactly 1 data row
  const campaignRows = getSheetRows(wb, "campaign");
  if (campaignRows.length !== 1) {
    errors.push(
      `Sheet "campaign" must have exactly 1 data row (found ${campaignRows.length})`,
    );
  } else {
    const row = campaignRows[0];
    const numericCols = ["budget", "spend", "roi"];
    for (const col of numericCols) {
      if (!isFiniteNum(row[col])) {
        errors.push(`campaign.${col} must be a finite number`);
      }
    }
    if (!row["name"]) errors.push(`campaign.name is required`);
    if (!row["slug"]) errors.push(`campaign.slug is required`);
    if (row["status"] !== "active" && row["status"] !== "completed") {
      errors.push(`campaign.status must be "active" or "completed"`);
    }
    if (!MONTH_RE.test(String(row["start_date"]))) {
      errors.push(`campaign.start_date must be in YYYY-MM format`);
    }
    if (!MONTH_RE.test(String(row["end_date"]))) {
      errors.push(`campaign.end_date must be in YYYY-MM format`);
    }
  }

  // Time-series sheets: validate month format and numeric fields
  const timeSeriesSheets: Record<string, string[]> = {
    tof_summary: [
      "reach",
      "grps",
      "brand_recall_pct",
      "sov_pct",
      "sentiment",
      "spend",
    ],
    tof_tvc: ["reach", "grps", "frequency", "ad_recall_pct", "spend", "cpr"],
    tof_kol: ["reach", "engagement_pct", "sentiment", "cost", "roi"],
    tof_organic: [
      "impressions",
      "likes",
      "comments",
      "shares",
      "engagement_rate_pct",
    ],
    tof_pr: ["mentions", "earned_pct", "paid_pct", "sov_pct"],
    mof_summary: ["clicks", "avg_ctr_pct", "avg_cpc", "avg_roas", "spend"],
    mof_meta: ["clicks", "ctr_pct", "cpc", "cpm", "vtr_pct", "roas"],
    mof_tiktok: ["clicks", "ctr_pct", "cpc", "cpm", "vtr_pct", "roas"],
    mof_x: ["clicks", "ctr_pct", "cpc", "cpm", "vtr_pct", "roas"],
    mof_branding: ["impressions", "ctr_pct", "cpm", "vtr_pct", "roas", "spend"],
    bof_summary: [
      "sign_ups",
      "installs",
      "drop_off_pct",
      "cpa",
      "conv_rate_pct",
      "spend",
    ],
    bof_inapp: [
      "page_views",
      "sign_ups",
      "drop_off_pct",
      "bounce_pct",
      "conv_rate_pct",
      "avg_time_seconds",
    ],
    bof_landing: [
      "clicks",
      "conversions",
      "bounce_pct",
      "cto_pct",
      "conv_rate_pct",
    ],
    bof_deeplinks: [
      "clicks",
      "installs",
      "cto_pct",
      "app_opens",
      "conv_rate_pct",
    ],
  };

  for (const [sheet, numCols] of Object.entries(timeSeriesSheets)) {
    const rows = getSheetRows(wb, sheet);
    rows.forEach((row, i) => {
      if (!MONTH_RE.test(String(row["month"]))) {
        errors.push(`${sheet} row ${i + 1}: "month" must be in YYYY-MM format`);
      }
      for (const col of numCols) {
        if (!isFiniteNum(row[col])) {
          errors.push(
            `${sheet} row ${i + 1}: "${col}" must be a finite number`,
          );
        }
      }
    });
  }

  // KOL sentiment sum check
  const kolRows = getSheetRows(wb, "tof_kol");
  kolRows.forEach((row, i) => {
    const pos = Number(row["sentiment_positive_pct"] ?? 0);
    const neu = Number(row["sentiment_neutral_pct"] ?? 0);
    const neg = Number(row["sentiment_negative_pct"] ?? 0);
    const sum = pos + neu + neg;
    if (Math.abs(sum - 100) > 2) {
      errors.push(
        `tof_kol row ${i + 1}: sentiment percentages must sum to 100 (got ${sum})`,
      );
    }
  });

  return errors;
}
