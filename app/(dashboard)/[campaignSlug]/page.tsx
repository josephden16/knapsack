"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  GranularityProvider,
  KpiStrip,
  FunnelBanner,
  PageHeader,
  Breadcrumb,
} from "@/components/ui";
import type { KpiMetric } from "@/components/ui";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

type DataRow = Record<string, unknown>;

function sumField(rows: DataRow[], key: string): number {
  return rows.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);
}

function avgField(rows: DataRow[], key: string): number {
  if (!rows.length) return 0;
  return sumField(rows, key) / rows.length;
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CampaignOverviewPage() {
  const { campaignSlug } = useParams<{ campaignSlug: string }>();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Resolve Firebase auth and grab an ID token for API calls
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
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#FEF3DC" }}
          >
            <span className="text-[24px]">⚠</span>
          </div>
          <p className="text-[16px] font-semibold text-text-primary">
            Campaign not found
          </p>
          <p className="text-[13px] text-text-muted">
            This campaign doesn&apos;t exist or you don&apos;t have access to
            it.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white transition-colors"
            style={{ backgroundColor: "#00B140" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#008F33")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#00B140")
            }
          >
            ← Back to Campaigns
          </button>
        </div>
      </div>
    );
  }

  const campaign = data.campaign;
  const dateRange = formatDateRange(campaign.startDate, campaign.endDate);

  // ── ToF KPI aggregates ───────────────────────────────────────────────────
  const tofRows = (campaign.tofSummary ?? []) as DataRow[];
  const tofMetrics: KpiMetric[] = [
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

  // ── MoF KPI aggregates ───────────────────────────────────────────────────
  const mofRows = (campaign.mofSummary ?? []) as DataRow[];
  const mofMetrics: KpiMetric[] = [
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
      label: "TOP CHANNEL",
      value: lastField(mofRows, "top_channel"),
      format: "text",
    },
  ];

  // ── BoF KPI aggregates ───────────────────────────────────────────────────
  const bofRows = (campaign.bofSummary ?? []) as DataRow[];
  const bofMetrics: KpiMetric[] = [
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
    { label: "SPEND", value: sumField(bofRows, "spend"), format: "currency" },
  ];

  return (
    <GranularityProvider>
      <div className="min-h-screen bg-page">
        {/* ── Sticky page header ──────────────────────────────────── */}
        <PageHeader
          campaignName={campaign.name}
          subLabel="Campaign Overview"
          dateRange={dateRange}
          budget={campaign.budget}
        />

        <main className="max-w-[1160px] mx-auto px-6 py-10">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Breadcrumb
              segments={[
                { label: "Campaigns", href: "/" },
                { label: campaign.name },
              ]}
            />
          </div>

          {/* ── Top of Funnel — Awareness ─────────────────────────── */}
          <section className="flex flex-col gap-4">
            <FunnelBanner
              stageName="Top of Funnel"
              label="Awareness"
              drillPath={`/${campaignSlug}/top-of-funnel`}
              color="#00B140"
            />
            <KpiStrip metrics={tofMetrics} funnelColor="#00B140" />
          </section>

          {/* ── Middle of Funnel — Consideration ─────────────────── */}
          <section className="flex flex-col gap-4 mt-12">
            <FunnelBanner
              stageName="Middle of Funnel"
              label="Consideration"
              drillPath={`/${campaignSlug}/middle-of-funnel`}
              color="#0066CC"
            />
            <KpiStrip metrics={mofMetrics} funnelColor="#0066CC" />
          </section>

          {/* ── Bottom of Funnel — Conversion ────────────────────── */}
          <section className="flex flex-col gap-4 mt-12">
            <FunnelBanner
              stageName="Bottom of Funnel"
              label="Conversion"
              drillPath={`/${campaignSlug}/bottom-of-funnel`}
              color="#F5A623"
            />
            <KpiStrip metrics={bofMetrics} funnelColor="#F5A623" />
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
