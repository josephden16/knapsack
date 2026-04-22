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

const MOF_BLUE = "#0066CC";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MofChannelOverviewPage() {
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
            style={{ backgroundColor: MOF_BLUE }}
          >
            ← Back to Campaigns
          </button>
        </div>
      </div>
    );
  }

  const campaign = data.campaign;
  const dateRange = formatDateRange(campaign.startDate, campaign.endDate);

  // ── Summary KPIs from mofSummary ─────────────────────────────────────────
  const mofRows = (campaign.mofSummary ?? []) as DataRow[];
  const summaryMetrics: KpiMetric[] = [
    { label: "CLICKS", value: sumField(mofRows, "clicks"), format: "number" },
    {
      label: "AVG CTR",
      value: round1(avgField(mofRows, "avg_ctr_pct")),
      format: "percent",
    },
    {
      label: "AVG CPC",
      value: round2(avgField(mofRows, "avg_cpc")),
      format: "currency",
    },
    {
      label: "AVG ROAS",
      value: round1(avgField(mofRows, "avg_roas")),
      format: "multiplier",
    },
    { label: "SPEND", value: sumField(mofRows, "spend"), format: "currency" },
    {
      label: "TOP",
      value: lastField(mofRows, "top_channel"),
      format: "text",
    },
  ];

  // ── Meta Ads card ─────────────────────────────────────────────────────────
  const metaRows = (campaign.mofMeta ?? []) as DataRow[];
  const metaMetrics: ChannelMetric[] = [
    { label: "Clicks", value: sumField(metaRows, "clicks"), format: "number" },
    {
      label: "CTR",
      value: round1(avgField(metaRows, "ctr_pct")),
      format: "percent",
    },
    {
      label: "CPC",
      value: round2(avgField(metaRows, "cpc")),
      format: "currency",
    },
    {
      label: "CPM",
      value: round2(avgField(metaRows, "cpm")),
      format: "currency",
    },
    {
      label: "VTR",
      value: round1(avgField(metaRows, "vtr_pct")),
      format: "percent",
    },
    {
      label: "ROAS",
      value: round1(avgField(metaRows, "roas")),
      format: "multiplier",
    },
  ];

  // ── TikTok Ads card ───────────────────────────────────────────────────────
  const tiktokRows = (campaign.mofTiktok ?? []) as DataRow[];
  const tiktokMetrics: ChannelMetric[] = [
    {
      label: "Clicks",
      value: sumField(tiktokRows, "clicks"),
      format: "number",
    },
    {
      label: "CTR",
      value: round1(avgField(tiktokRows, "ctr_pct")),
      format: "percent",
    },
    {
      label: "CPC",
      value: round2(avgField(tiktokRows, "cpc")),
      format: "currency",
    },
    {
      label: "CPM",
      value: round2(avgField(tiktokRows, "cpm")),
      format: "currency",
    },
    {
      label: "VTR",
      value: round1(avgField(tiktokRows, "vtr_pct")),
      format: "percent",
    },
    {
      label: "ROAS",
      value: round1(avgField(tiktokRows, "roas")),
      format: "multiplier",
    },
  ];

  // ── X Ads card ────────────────────────────────────────────────────────────
  const xRows = (campaign.mofX ?? []) as DataRow[];
  const xMetrics: ChannelMetric[] = [
    { label: "Clicks", value: sumField(xRows, "clicks"), format: "number" },
    {
      label: "CTR",
      value: round1(avgField(xRows, "ctr_pct")),
      format: "percent",
    },
    {
      label: "CPC",
      value: round2(avgField(xRows, "cpc")),
      format: "currency",
    },
    {
      label: "CPM",
      value: round2(avgField(xRows, "cpm")),
      format: "currency",
    },
    {
      label: "VTR",
      value: round1(avgField(xRows, "vtr_pct")),
      format: "percent",
    },
    {
      label: "ROAS",
      value: round1(avgField(xRows, "roas")),
      format: "multiplier",
    },
  ];

  // ── Branding / Perf. Ads card ─────────────────────────────────────────────
  const brandingRows = (campaign.mofBranding ?? []) as DataRow[];
  const brandingMetrics: ChannelMetric[] = [
    {
      label: "Impressions",
      value: sumField(brandingRows, "impressions"),
      format: "number",
    },
    {
      label: "CTR",
      value: round1(avgField(brandingRows, "ctr_pct")),
      format: "percent",
    },
    {
      label: "CPM",
      value: round2(avgField(brandingRows, "cpm")),
      format: "currency",
    },
    {
      label: "VTR",
      value: round1(avgField(brandingRows, "vtr_pct")),
      format: "percent",
    },
    {
      label: "ROAS",
      value: round1(avgField(brandingRows, "roas")),
      format: "multiplier",
    },
    {
      label: "Spend",
      value: sumField(brandingRows, "spend"),
      format: "currency",
    },
  ];

  return (
    <GranularityProvider>
      <div className="min-h-screen bg-page">
        {/* ── Sticky page header ──────────────────────────────────── */}
        <PageHeader
          campaignName={campaign.name}
          subLabel="Consideration — Channel overview"
          dateRange={dateRange}
          budget={campaign.budget}
          stagePill="CONSIDERATION"
          stagePillColor={MOF_BLUE}
        />

        <main className="max-w-[1160px] mx-auto px-6 py-10">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Breadcrumb
              segments={[
                { label: "Campaigns", href: "/" },
                { label: campaign.name, href: `/${campaignSlug}` },
                { label: "Middle of Funnel" },
              ]}
            />
          </div>

          {/* ── Summary KPI strip ───────────────────────────────────── */}
          <section className="mb-8">
            <KpiStrip metrics={summaryMetrics} funnelColor={MOF_BLUE} />
          </section>

          {/* ── 4-column channel card grid ──────────────────────────── */}
          <section className="grid grid-cols-4 gap-4">
            <ChannelCard
              title="Meta Ads"
              metrics={metaMetrics}
              drillPath={`/${campaignSlug}/middle-of-funnel/meta`}
              funnelColor={MOF_BLUE}
            />
            <ChannelCard
              title="TikTok Ads"
              metrics={tiktokMetrics}
              drillPath={`/${campaignSlug}/middle-of-funnel/tiktok`}
              funnelColor={MOF_BLUE}
            />
            <ChannelCard
              title="X Ads"
              metrics={xMetrics}
              drillPath={`/${campaignSlug}/middle-of-funnel/x-ads`}
              funnelColor={MOF_BLUE}
            />
            <ChannelCard
              title="Branding / Perf. Ads"
              metrics={brandingMetrics}
              drillPath={`/${campaignSlug}/middle-of-funnel/branding`}
              funnelColor={MOF_BLUE}
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
