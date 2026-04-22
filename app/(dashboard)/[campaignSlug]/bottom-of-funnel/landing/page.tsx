"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  GranularityProvider,
  KpiStrip,
  ChartPair,
  PageHeader,
  Breadcrumb,
} from "@/components/ui";
import type { KpiMetric, MonthlyPoint, QuarterlyPoint } from "@/components/ui";
import { aggregateQuarterly } from "@/lib/quarter";

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

function toMonthly(rows: DataRow[], key: string): MonthlyPoint[] {
  return rows.map((r) => ({
    month: String(r.month),
    value: Number(r[key]) || 0,
  }));
}

function toQuarterly(
  rows: DataRow[],
  key: string,
  aggType: "sum" | "avg" = "sum",
): QuarterlyPoint[] {
  return aggregateQuarterly(toMonthly(rows, key), aggType);
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
const BOF_FILL = "#FEF3DC";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPagesDetailPage() {
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
  const landingRows = (campaign.bofLanding ?? []) as DataRow[];

  // ── KPI strip ─────────────────────────────────────────────────────────────
  const kpiMetrics: KpiMetric[] = [
    {
      label: "CLICKS",
      value: sumField(landingRows, "clicks"),
      format: "number",
    },
    {
      label: "CONVERSIONS",
      value: sumField(landingRows, "conversions"),
      format: "number",
    },
    {
      label: "BOUNCE",
      value: round1(avgField(landingRows, "bounce_pct")),
      format: "percent",
    },
    {
      label: "CTO",
      value: round1(avgField(landingRows, "cto_pct")),
      format: "percent",
    },
    {
      label: "CONV RATE",
      value: round1(avgField(landingRows, "conv_rate_pct")),
      format: "percent",
    },
    {
      label: "TOP PAGE",
      value: lastField(landingRows, "top_page"),
      format: "text",
    },
  ];

  // ── Chart data ────────────────────────────────────────────────────────────
  const clicksMonthly = toMonthly(landingRows, "clicks");
  const clicksQuarterly = toQuarterly(landingRows, "clicks", "sum");

  const conversionsMonthly = toMonthly(landingRows, "conversions");
  const conversionsQuarterly = toQuarterly(landingRows, "conversions", "sum");

  const bounceMonthly = toMonthly(landingRows, "bounce_pct");
  const bounceQuarterly = toQuarterly(landingRows, "bounce_pct", "avg");

  return (
    <GranularityProvider>
      <div className="min-h-screen bg-page">
        {/* ── Sticky page header ──────────────────────────────────── */}
        <PageHeader
          campaignName={campaign.name}
          subLabel="Bottom of Funnel · Landing Pages"
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
                {
                  label: "Bottom of Funnel",
                  href: `/${campaignSlug}/bottom-of-funnel`,
                },
                { label: "Landing Pages" },
              ]}
            />
          </div>

          {/* ── KPI strip ───────────────────────────────────────────── */}
          <section className="mb-8">
            <KpiStrip metrics={kpiMetrics} funnelColor={BOF_AMBER} />
          </section>

          {/* ── Chart rows ──────────────────────────────────────────── */}
          <section className="flex flex-col gap-4">
            <ChartPair
              metric="Clicks (K)"
              monthlyData={clicksMonthly}
              quarterlyData={clicksQuarterly}
              color={BOF_AMBER}
              fillColor={BOF_FILL}
            />
            <ChartPair
              metric="Conversions"
              monthlyData={conversionsMonthly}
              quarterlyData={conversionsQuarterly}
              color={BOF_AMBER}
              fillColor={BOF_FILL}
            />
            <ChartPair
              metric="Bounce Rate (%)"
              monthlyData={bounceMonthly}
              quarterlyData={bounceQuarterly}
              color={BOF_AMBER}
              fillColor={BOF_FILL}
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
