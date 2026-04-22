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

function formatAvgTime(rows: DataRow[], key: string): string {
  if (!rows.length) return "—";
  const avg =
    rows.reduce((acc, r) => acc + (Number(r[key]) || 0), 0) / rows.length;
  const totalSeconds = Math.round(avg);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${s}s`;
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

const BOF_AMBER = "#F5A623";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BofChannelOverviewPage() {
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
            style={{ backgroundColor: BOF_AMBER }}
          >
            ← Back to Campaigns
          </button>
        </div>
      </div>
    );
  }

  const campaign = data.campaign;
  const dateRange = formatDateRange(campaign.startDate, campaign.endDate);

  // ── Summary KPIs from bofSummary ─────────────────────────────────────────
  const bofRows = (campaign.bofSummary ?? []) as DataRow[];
  const summaryMetrics: KpiMetric[] = [
    {
      label: "SIGN-UPS",
      value: sumField(bofRows, "sign_ups"),
      format: "number",
    },
    {
      label: "INSTALLS",
      value: sumField(bofRows, "installs"),
      format: "number",
    },
    {
      label: "DROP-OFF",
      value: round1(avgField(bofRows, "drop_off_pct")),
      format: "percent",
    },
    {
      label: "CPA",
      value: round2(avgField(bofRows, "cpa")),
      format: "currency",
    },
    {
      label: "CONV RATE",
      value: round1(avgField(bofRows, "conv_rate_pct")),
      format: "percent",
    },
    {
      label: "SPEND",
      value: sumField(bofRows, "spend"),
      format: "currency",
    },
  ];

  // ── In-App Pages card ─────────────────────────────────────────────────────
  const inappRows = (campaign.bofInapp ?? []) as DataRow[];
  const inappMetrics: ChannelMetric[] = [
    {
      label: "Page Views",
      value: sumField(inappRows, "page_views"),
      format: "number",
    },
    {
      label: "Sign-ups",
      value: sumField(inappRows, "sign_ups"),
      format: "number",
    },
    {
      label: "Drop-off",
      value: round1(avgField(inappRows, "drop_off_pct")),
      format: "percent",
    },
    {
      label: "Bounce",
      value: round1(avgField(inappRows, "bounce_pct")),
      format: "percent",
    },
    {
      label: "Conv Rate",
      value: round1(avgField(inappRows, "conv_rate_pct")),
      format: "percent",
    },
    {
      label: "Avg Time",
      value: formatAvgTime(inappRows, "avg_time_seconds"),
      format: "text",
    },
  ];

  // ── Landing Pages card ────────────────────────────────────────────────────
  const landingRows = (campaign.bofLanding ?? []) as DataRow[];
  const landingMetrics: ChannelMetric[] = [
    {
      label: "Clicks",
      value: sumField(landingRows, "clicks"),
      format: "number",
    },
    {
      label: "Conversions",
      value: sumField(landingRows, "conversions"),
      format: "number",
    },
    {
      label: "Bounce",
      value: round1(avgField(landingRows, "bounce_pct")),
      format: "percent",
    },
    {
      label: "CTO",
      value: round1(avgField(landingRows, "cto_pct")),
      format: "percent",
    },
    {
      label: "Conv Rate",
      value: round1(avgField(landingRows, "conv_rate_pct")),
      format: "percent",
    },
    {
      label: "Top Page",
      value: lastField(landingRows, "top_page"),
      format: "text",
    },
  ];

  // ── Deep Links card ───────────────────────────────────────────────────────
  const deeplinksRows = (campaign.bofDeeplinks ?? []) as DataRow[];
  const deeplinksMetrics: ChannelMetric[] = [
    {
      label: "Clicks",
      value: sumField(deeplinksRows, "clicks"),
      format: "number",
    },
    {
      label: "Installs",
      value: sumField(deeplinksRows, "installs"),
      format: "number",
    },
    {
      label: "CTO",
      value: round1(avgField(deeplinksRows, "cto_pct")),
      format: "percent",
    },
    {
      label: "App Opens",
      value: sumField(deeplinksRows, "app_opens"),
      format: "number",
    },
    {
      label: "Conv Rate",
      value: round1(avgField(deeplinksRows, "conv_rate_pct")),
      format: "percent",
    },
    {
      label: "Top Link",
      value: lastField(deeplinksRows, "top_link"),
      format: "text",
    },
  ];

  return (
    <GranularityProvider>
      <div className="min-h-screen bg-page">
        {/* ── Sticky page header ──────────────────────────────────── */}
        <PageHeader
          campaignName={campaign.name}
          subLabel="Conversion — Channel overview"
          dateRange={dateRange}
          budget={campaign.budget}
          stagePill="CONVERSION"
          stagePillColor={BOF_AMBER}
        />

        <main className="max-w-[1160px] mx-auto px-6 py-10">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Breadcrumb
              segments={[
                { label: "Campaigns", href: "/" },
                { label: campaign.name, href: `/${campaignSlug}` },
                { label: "Bottom of Funnel" },
              ]}
            />
          </div>

          {/* ── Summary KPI strip ───────────────────────────────────── */}
          <section className="mb-8">
            <KpiStrip metrics={summaryMetrics} funnelColor={BOF_AMBER} />
          </section>

          {/* ── 3-column channel card grid ──────────────────────────── */}
          <section className="grid grid-cols-3 gap-4">
            <ChannelCard
              title="In-App Pages"
              metrics={inappMetrics}
              drillPath={`/${campaignSlug}/bottom-of-funnel/in-app`}
              funnelColor={BOF_AMBER}
            />
            <ChannelCard
              title="Landing Pages"
              metrics={landingMetrics}
              drillPath={`/${campaignSlug}/bottom-of-funnel/landing`}
              funnelColor={BOF_AMBER}
            />
            <ChannelCard
              title="Deep Links"
              metrics={deeplinksMetrics}
              drillPath={`/${campaignSlug}/bottom-of-funnel/deep-links`}
              funnelColor={BOF_AMBER}
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
