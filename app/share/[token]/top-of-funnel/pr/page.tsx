"use client";

import { useParams } from "next/navigation";
import { GranularityProvider, KpiStrip, ChartPair, PageHeader, Breadcrumb } from "@/components/ui";
import type { KpiMetric, MonthlyPoint, QuarterlyPoint } from "@/components/ui";
import { aggregateQuarterly } from "@/lib/quarter";
import {
  useShareCampaign, LoadingScreen, ErrorScreen, ReadOnlyBadge, SharePageFooter,
  DataRow, sumField, avgField, lastField, round1, formatDateRange,
} from "../../share-utils";

const TOF_GREEN = "#00B140";
const TOF_FILL = "#E6F7ED";
function toMonthly(rows: DataRow[], key: string): MonthlyPoint[] { return rows.map((r) => ({ month: String(r.month), value: Number(r[key]) || 0 })); }
function toQ(rows: DataRow[], key: string, t: "sum" | "avg" = "sum"): QuarterlyPoint[] { return aggregateQuarterly(toMonthly(rows, key), t); }

export default function SharePrPage() {
  const { token } = useParams<{ token: string }>();
  const base = `/share/${token}`;
  const { data, error, isLoading } = useShareCampaign(token);

  if (isLoading) return <LoadingScreen />;
  if (error || !data?.campaign) return <ErrorScreen backHref={`${base}/top-of-funnel`} />;

  const campaign = data.campaign;
  const dateRange = formatDateRange(campaign.startDate, campaign.endDate);
  const prRows = (campaign.tofPr ?? []) as DataRow[];

  const kpiMetrics: KpiMetric[] = [
    { label: "MENTIONS", value: sumField(prRows, "mentions"), format: "number" },
    { label: "EARNED", value: round1(avgField(prRows, "earned_pct")), format: "percent" },
    { label: "PAID", value: round1(avgField(prRows, "paid_pct")), format: "percent" },
    { label: "SOV", value: round1(avgField(prRows, "sov_pct")), format: "percent" },
    { label: "TOP OUTLET", value: lastField(prRows, "top_outlet"), format: "text" },
    { label: "TONE", value: lastField(prRows, "tone"), format: "text" },
  ];

  return (
    <GranularityProvider>
      <div className="min-h-screen bg-page">
        <PageHeader campaignName={campaign.name} subLabel="Top of Funnel · PR / Media" dateRange={dateRange} budget={campaign.budget} stagePill="AWARENESS" stagePillColor={TOF_GREEN} />
        <ReadOnlyBadge />
        <main className="max-w-[1160px] mx-auto px-6 py-10">
          <div className="mb-8">
            <Breadcrumb segments={[{ label: "Shared Report", href: base }, { label: campaign.name, href: base }, { label: "Top of Funnel", href: `${base}/top-of-funnel` }, { label: "PR / Media" }]} />
          </div>
          <section className="mb-8"><KpiStrip metrics={kpiMetrics} funnelColor={TOF_GREEN} /></section>
          <section className="flex flex-col gap-4">
            <ChartPair metric="Mentions" monthlyData={toMonthly(prRows, "mentions")} quarterlyData={toQ(prRows, "mentions")} color={TOF_GREEN} fillColor={TOF_FILL} />
            <ChartPair metric="Earned (%)" monthlyData={toMonthly(prRows, "earned_pct")} quarterlyData={toQ(prRows, "earned_pct", "avg")} color={TOF_GREEN} fillColor={TOF_FILL} />
            <ChartPair metric="SOV (%)" monthlyData={toMonthly(prRows, "sov_pct")} quarterlyData={toQ(prRows, "sov_pct", "avg")} color={TOF_GREEN} fillColor={TOF_FILL} />
          </section>
        </main>
        <SharePageFooter />
      </div>
    </GranularityProvider>
  );
}
