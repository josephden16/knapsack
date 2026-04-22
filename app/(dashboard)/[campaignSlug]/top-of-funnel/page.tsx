"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  GranularityProvider,
  KpiStrip,
  ChannelCard,
  PageHeader,
  Breadcrumb,
} from "@/components/ui";
import type { KpiMetric, ChannelMetric } from "@/components/ui";

// ─── Helpers ──────────────────────────────────────────────────────────────────

type DataRow = Record<string, unknown>;

function sumField(rows: DataRow[], key: string): number {
  return rows.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);
}

function avgField(rows: DataRow[], key: string): number {
  if (!rows.length) return 0;
  return rows.reduce((acc, r) => acc + (Number(r[key]) || 0), 0) / rows.length;
}

function lastField(rows: DataRow[], key: string): string {
  if (!rows.length) return "—";
  return String(rows[rows.length - 1][key] ?? "—");
}

function round1(n: number): number {
  return parseFloat(n.toFixed(1));
}

function round2(n: number): number {
  return parseFloat(n.toFixed(2));
}

async function fetcher([url, token]: [string, string]) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch campaign");
  return res.json();
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatDateRange(startDate: string, endDate: string): string {
  const [sY, sM] = startDate.split("-");
  const [eY, eM] = endDate.split("-");
  const sLabel = MONTHS[parseInt(sM) - 1];
  const eLabel = MONTHS[parseInt(eM) - 1];
  if (sY === eY) return `${sLabel} — ${eLabel} ${sY}`;
  return `${sLabel} ${sY} — ${eLabel} ${eY}`;
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-page">
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "#00B140" }}
        >
          <span className="text-white font-bold text-lg">K</span>
        </div>
        <p className="text-[13px] text-text-muted">Loading campaign…</p>
      </div>
    </div>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TOF_GREEN = "#00B140";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TofChannelOverviewPage() {
  const { campaignSlug } = useParams<{ campaignSlug: string }>();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      const t = await user.getIdToken();
      setToken(t);
      setAuthReady(true);
    });
  }, [router]);

  const { data, error, isLoading } = useSWR(
    authReady && token ? [`/api/campaigns/${campaignSlug}`, token] : null,
    fetcher,
  );

  if (!authReady || isLoading) return <LoadingScreen />;

  if (error || !data?.campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page">
        <div className="flex flex-col items-center gap-4 text-center max-w-xs">
          <p className="text-[16px] font-semibold text-text-primary">
            Campaign not found
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white"
            style={{ backgroundColor: TOF_GREEN }}
          >
            ← Back to Campaigns
          </button>
        </div>
      </div>
    );
  }

  const campaign = data.campaign;
  const dateRange = formatDateRange(campaign.startDate, campaign.endDate);

  // ── Summary KPIs from tofSummary ─────────────────────────────────────────
  const tofRows = (campaign.tofSummary ?? []) as DataRow[];
  const summaryMetrics: KpiMetric[] = [
    { label: "REACH", value: sumField(tofRows, "reach"), format: "number" },
    { label: "GRPS", value: sumField(tofRows, "grps"), format: "number" },
    {
      label: "BRAND RECALL",
      value: round1(avgField(tofRows, "brand_recall_pct")),
      format: "percent",
    },
    {
      label: "SOV",
      value: round1(avgField(tofRows, "sov_pct")),
      format: "percent",
    },
    {
      label: "SENTIMENT",
      value: Math.round(avgField(tofRows, "sentiment")),
      format: "ratio",
    },
    { label: "SPEND", value: sumField(tofRows, "spend"), format: "currency" },
  ];

  // ── TVC / Broadcast card ──────────────────────────────────────────────────
  const tvcRows = (campaign.tofTvc ?? []) as DataRow[];
  const tvcMetrics: ChannelMetric[] = [
    { label: "Reach", value: sumField(tvcRows, "reach"), format: "number" },
    { label: "GRPs", value: sumField(tvcRows, "grps"), format: "number" },
    {
      label: "Frequency",
      value: round1(avgField(tvcRows, "frequency")),
      format: "number",
    },
    {
      label: "Ad Recall",
      value: round1(avgField(tvcRows, "ad_recall_pct")),
      format: "percent",
    },
    { label: "Spend", value: sumField(tvcRows, "spend"), format: "currency" },
    {
      label: "CPR",
      value: round2(avgField(tvcRows, "cpr")),
      format: "currency",
    },
  ];

  // ── KOL / Influencer card ─────────────────────────────────────────────────
  const kolRows = (campaign.tofKol ?? []) as DataRow[];
  const kolMetrics: ChannelMetric[] = [
    { label: "Reach", value: sumField(kolRows, "reach"), format: "number" },
    {
      label: "Engagement",
      value: round1(avgField(kolRows, "engagement_pct")),
      format: "percent",
    },
    {
      label: "Sentiment",
      value: Math.round(avgField(kolRows, "sentiment")),
      format: "ratio",
    },
    { label: "Cost", value: sumField(kolRows, "cost"), format: "currency" },
    { label: "Top KOL", value: lastField(kolRows, "top_kol"), format: "text" },
    {
      label: "ROI",
      value: round1(avgField(kolRows, "roi")),
      format: "multiplier",
    },
  ];

  // ── Organic Social card ───────────────────────────────────────────────────
  const organicRows = (campaign.tofOrganic ?? []) as DataRow[];
  const organicMetrics: ChannelMetric[] = [
    {
      label: "Impressions",
      value: sumField(organicRows, "impressions"),
      format: "number",
    },
    { label: "Likes", value: sumField(organicRows, "likes"), format: "number" },
    {
      label: "Comments",
      value: sumField(organicRows, "comments"),
      format: "number",
    },
    {
      label: "Shares",
      value: sumField(organicRows, "shares"),
      format: "number",
    },
    {
      label: "Eng. Rate",
      value: round1(avgField(organicRows, "engagement_rate_pct")),
      format: "percent",
    },
    {
      label: "Top Post",
      value: lastField(organicRows, "top_post"),
      format: "text",
    },
  ];

  // ── PR / Media card ───────────────────────────────────────────────────────
  const prRows = (campaign.tofPr ?? []) as DataRow[];
  const prMetrics: ChannelMetric[] = [
    {
      label: "Mentions",
      value: sumField(prRows, "mentions"),
      format: "number",
    },
    {
      label: "Earned%",
      value: round1(avgField(prRows, "earned_pct")),
      format: "percent",
    },
    {
      label: "Paid%",
      value: round1(avgField(prRows, "paid_pct")),
      format: "percent",
    },
    {
      label: "SOV",
      value: round1(avgField(prRows, "sov_pct")),
      format: "percent",
    },
    {
      label: "Top Outlet",
      value: lastField(prRows, "top_outlet"),
      format: "text",
    },
    { label: "Tone", value: lastField(prRows, "tone"), format: "text" },
  ];

  return (
    <GranularityProvider>
      <div className="min-h-screen bg-page">
        {/* ── Sticky page header ──────────────────────────────────── */}
        <PageHeader
          campaignName={campaign.name}
          subLabel="Awareness — Channel overview"
          dateRange={dateRange}
          budget={campaign.budget}
          stagePill="AWARENESS"
          stagePillColor={TOF_GREEN}
        />

        <main className="max-w-[1160px] mx-auto px-6 py-10">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Breadcrumb
              segments={[
                { label: "Campaigns", href: "/" },
                { label: campaign.name, href: `/${campaignSlug}` },
                { label: "Top of Funnel" },
              ]}
            />
          </div>

          {/* ── Summary KPI strip ───────────────────────────────────── */}
          <section className="mb-8">
            <KpiStrip metrics={summaryMetrics} funnelColor={TOF_GREEN} />
          </section>

          {/* ── 4-column channel card grid ──────────────────────────── */}
          <section className="grid grid-cols-4 gap-4">
            <ChannelCard
              title="TVC / Broadcast"
              metrics={tvcMetrics}
              drillPath={`/${campaignSlug}/top-of-funnel/tvc`}
              funnelColor={TOF_GREEN}
            />
            <ChannelCard
              title="KOL / Influencer"
              metrics={kolMetrics}
              drillPath={`/${campaignSlug}/top-of-funnel/kol`}
              funnelColor={TOF_GREEN}
            />
            <ChannelCard
              title="Organic Social"
              metrics={organicMetrics}
              drillPath={`/${campaignSlug}/top-of-funnel/organic`}
              funnelColor={TOF_GREEN}
            />
            <ChannelCard
              title="PR / Media"
              metrics={prMetrics}
              drillPath={`/${campaignSlug}/top-of-funnel/pr`}
              funnelColor={TOF_GREEN}
            />
          </section>
        </main>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <footer className="pb-10 pt-4 text-center">
          <p className="text-[12px] text-text-muted">
            KnapSack — Campaign Reporting Platform · OPay Marketing
          </p>
        </footer>
      </div>
    </GranularityProvider>
  );
}
