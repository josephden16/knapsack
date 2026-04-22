"use client";

import { useParams } from "next/navigation";
import {
  GranularityProvider,
  KpiStrip,
  ChartPair,
  SentimentDonut,
  KolTable,
  PageHeader,
  Breadcrumb,
} from "@/components/ui";
import type {
  KpiMetric,
  MonthlyPoint,
  QuarterlyPoint,
  KolRow,
} from "@/components/ui";
import { aggregateQuarterly } from "@/lib/quarter";
import {
  useShareCampaign,
  LoadingScreen,
  ErrorScreen,
  ReadOnlyBadge,
  SharePageFooter,
  DataRow,
  sumField,
  avgField,
  lastField,
  round1,
  formatDateRange,
} from "../../share-utils";

const TOF_GREEN = "#00B140";
const TOF_FILL = "#E6F7ED";

function toMonthly(rows: DataRow[], key: string): MonthlyPoint[] {
  return rows.map((r) => ({
    month: String(r.month),
    value: Number(r[key]) || 0,
  }));
}
function toQ(
  rows: DataRow[],
  key: string,
  t: "sum" | "avg" = "sum",
): QuarterlyPoint[] {
  return aggregateQuarterly(toMonthly(rows, key), t);
}

export default function ShareKolPage() {
  const { token } = useParams<{ token: string }>();
  const base = `/share/${token}`;
  const { data, error, isLoading } = useShareCampaign(token);

  if (isLoading) return <LoadingScreen />;
  if (error || !data?.campaign)
    return <ErrorScreen backHref={`${base}/top-of-funnel`} />;

  const campaign = data.campaign;
  const dateRange = formatDateRange(campaign.startDate, campaign.endDate);
  const kolRows = (campaign.tofKol ?? []) as DataRow[];
  const kolPerformers = (campaign.tofKolPerformers ?? []) as DataRow[];

  const kpiMetrics: KpiMetric[] = [
    { label: "REACH", value: sumField(kolRows, "reach"), format: "number" },
    {
      label: "ENGAGEMENT",
      value: round1(avgField(kolRows, "engagement_pct")),
      format: "percent",
    },
    {
      label: "SENTIMENT",
      value: Math.round(avgField(kolRows, "sentiment")),
      format: "ratio",
    },
    { label: "COST", value: sumField(kolRows, "cost"), format: "currency" },
    { label: "TOP KOL", value: lastField(kolRows, "top_kol"), format: "text" },
    {
      label: "ROI",
      value: round1(avgField(kolRows, "roi")),
      format: "multiplier",
    },
  ];

  const positivePct = Math.round(avgField(kolRows, "sentiment_positive_pct"));
  const neutralPct = Math.round(avgField(kolRows, "sentiment_neutral_pct"));
  const negativePct = Math.round(avgField(kolRows, "sentiment_negative_pct"));

  const kolTableRows: KolRow[] = kolPerformers.map((r) => ({
    kol_name: String(r.kol_name ?? ""),
    reach: Number(r.reach) || 0,
    engagement_pct: Number(r.engagement_pct) || 0,
    cost: Number(r.cost) || 0,
    roi: Number(r.roi) || 0,
  }));

  return (
    <GranularityProvider>
      <div className="min-h-screen bg-page">
        <PageHeader
          campaignName={campaign.name}
          subLabel="Top of Funnel · KOL / Influencer"
          dateRange={dateRange}
          budget={campaign.budget}
          stagePill="AWARENESS"
          stagePillColor={TOF_GREEN}
        />
        <ReadOnlyBadge />
        <main className="max-w-[1160px] mx-auto px-6 py-10">
          <div className="mb-8">
            <Breadcrumb
              segments={[
                { label: "Shared Report", href: base },
                { label: campaign.name, href: base },
                { label: "Top of Funnel", href: `${base}/top-of-funnel` },
                { label: "KOL / Influencer" },
              ]}
            />
          </div>
          <section className="mb-8">
            <KpiStrip metrics={kpiMetrics} funnelColor={TOF_GREEN} />
          </section>
          <section className="flex flex-col gap-4 mb-6">
            <ChartPair
              metric="Reach (K)"
              monthlyData={toMonthly(kolRows, "reach")}
              quarterlyData={toQ(kolRows, "reach")}
              color={TOF_GREEN}
              fillColor={TOF_FILL}
            />
            <ChartPair
              metric="Engagement (%)"
              monthlyData={toMonthly(kolRows, "engagement_pct")}
              quarterlyData={toQ(kolRows, "engagement_pct", "avg")}
              color={TOF_GREEN}
              fillColor={TOF_FILL}
            />
            <ChartPair
              metric="Sentiment"
              monthlyData={toMonthly(kolRows, "sentiment")}
              quarterlyData={toQ(kolRows, "sentiment", "avg")}
              color={TOF_GREEN}
              fillColor={TOF_FILL}
            />
          </section>
          <section className="flex gap-5 items-start">
            <div style={{ width: "30%" }}>
              <SentimentDonut
                positive={positivePct}
                neutral={neutralPct}
                negative={negativePct}
              />
            </div>
            <div className="flex-1">
              <KolTable rows={kolTableRows} />
            </div>
          </section>
        </main>
        <SharePageFooter />
      </div>
    </GranularityProvider>
  );
}
