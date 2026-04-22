/**
 * Generates /public/knapsack-template.xlsx with all 15 sheets,
 * column headers filled, and one example data row per sheet.
 * Run once: node scripts/generate-template.mjs
 */

import * as XLSX from "xlsx";
import { mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "../public");
const OUT_FILE = join(OUT_DIR, "knapsack-template.xlsx");

mkdirSync(OUT_DIR, { recursive: true });

const wb = XLSX.utils.book_new();

function addSheet(wb, name, headers, exampleRow) {
  const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
  XLSX.utils.book_append_sheet(wb, ws, name);
}

// campaign
addSheet(
  wb,
  "campaign",
  [
    "name",
    "slug",
    "status",
    "start_date",
    "end_date",
    "budget",
    "spend",
    "roi",
  ],
  [
    "My Campaign",
    "my-campaign",
    "active",
    "2025-01",
    "2025-06",
    1000000,
    850000,
    3.2,
  ],
);

// tof_summary
addSheet(
  wb,
  "tof_summary",
  [
    "month",
    "reach",
    "grps",
    "brand_recall_pct",
    "sov_pct",
    "sentiment",
    "spend",
  ],
  ["2025-01", 12400000, 284, 74, 42, 82, 620000],
);

// tof_tvc
addSheet(
  wb,
  "tof_tvc",
  [
    "month",
    "reach",
    "grps",
    "frequency",
    "ad_recall_pct",
    "spend",
    "cpr",
    "channel_ait_grp",
    "channel_channelstv_grp",
    "channel_nta_grp",
    "channel_stv_grp",
    "channel_others_grp",
  ],
  ["2025-01", 8000000, 180, 3.2, 68, 320000, 0.04, 45, 52, 38, 30, 15],
);

// tof_kol
addSheet(
  wb,
  "tof_kol",
  [
    "month",
    "reach",
    "engagement_pct",
    "sentiment",
    "cost",
    "top_kol",
    "roi",
    "sentiment_positive_pct",
    "sentiment_neutral_pct",
    "sentiment_negative_pct",
  ],
  ["2025-01", 3200000, 4.8, 78, 120000, "Davido", 3.1, 68, 24, 8],
);

// tof_kol_performers
addSheet(
  wb,
  "tof_kol_performers",
  ["campaign_slug", "kol_name", "reach", "engagement_pct", "cost", "roi"],
  ["my-campaign", "Davido", 1200000, 5.2, 45000, 3.4],
);

// tof_organic
addSheet(
  wb,
  "tof_organic",
  [
    "month",
    "impressions",
    "likes",
    "comments",
    "shares",
    "engagement_rate_pct",
    "top_post",
  ],
  ["2025-01", 2100000, 48000, 5200, 12000, 3.1, "Cashback"],
);

// tof_pr
addSheet(
  wb,
  "tof_pr",
  [
    "month",
    "mentions",
    "earned_pct",
    "paid_pct",
    "sov_pct",
    "top_outlet",
    "tone",
  ],
  ["2025-01", 340, 62, 38, 28, "TechCabal", "Positive"],
);

// mof_summary
addSheet(
  wb,
  "mof_summary",
  [
    "month",
    "clicks",
    "avg_ctr_pct",
    "avg_cpc",
    "avg_roas",
    "spend",
    "top_channel",
  ],
  ["2025-01", 420000, 2.4, 0.38, 4.1, 160000, "TikTok"],
);

// mof_meta
addSheet(
  wb,
  "mof_meta",
  ["month", "clicks", "ctr_pct", "cpc", "cpm", "vtr_pct", "roas"],
  ["2025-01", 95000, 2.1, 0.42, 8.8, 28, 3.8],
);

// mof_tiktok
addSheet(
  wb,
  "mof_tiktok",
  ["month", "clicks", "ctr_pct", "cpc", "cpm", "vtr_pct", "roas"],
  ["2025-01", 180000, 3.2, 0.28, 6.4, 42, 5.2],
);

// mof_x
addSheet(
  wb,
  "mof_x",
  ["month", "clicks", "ctr_pct", "cpc", "cpm", "vtr_pct", "roas"],
  ["2025-01", 62000, 1.8, 0.51, 11.2, 19, 2.9],
);

// mof_branding
addSheet(
  wb,
  "mof_branding",
  ["month", "impressions", "ctr_pct", "cpm", "vtr_pct", "roas", "spend"],
  ["2025-01", 5800000, 1.4, 7.2, 35, 3.1, 41700],
);

// bof_summary
addSheet(
  wb,
  "bof_summary",
  [
    "month",
    "sign_ups",
    "installs",
    "drop_off_pct",
    "cpa",
    "conv_rate_pct",
    "spend",
  ],
  ["2025-01", 28000, 41000, 34, 1.42, 6.8, 59700],
);

// bof_inapp
addSheet(
  wb,
  "bof_inapp",
  [
    "month",
    "page_views",
    "sign_ups",
    "drop_off_pct",
    "bounce_pct",
    "conv_rate_pct",
    "avg_time_seconds",
  ],
  ["2025-01", 410000, 28000, 34, 22, 6.8, 134],
);

// bof_landing
addSheet(
  wb,
  "bof_landing",
  [
    "month",
    "clicks",
    "conversions",
    "bounce_pct",
    "cto_pct",
    "conv_rate_pct",
    "top_page",
  ],
  ["2025-01", 85000, 7200, 41, 38, 8.5, "/promo"],
);

// bof_deeplinks
addSheet(
  wb,
  "bof_deeplinks",
  [
    "month",
    "clicks",
    "installs",
    "cto_pct",
    "app_opens",
    "conv_rate_pct",
    "top_link",
  ],
  ["2025-01", 62000, 41000, 66, 38000, 66.1, "opay://"],
);

XLSX.writeFile(wb, OUT_FILE);
console.log(`Template written to ${OUT_FILE}`);
