"use client";

import { useParams } from "next/navigation";
import {
  GranularityProvider,
  KpiStrip,
  ChartPair,
  PageHeader,
  Breadcrumb,
} from "@/components/ui";
import type { KpiMetric, MonthlyPoint, QuarterlyPoint } from "@/components/ui";
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

export default function ShareOrganicPage() {
  const { token } = useParams<{ token: string }>();
  const base = `/share/${token}`;
  const { data, error, isLoading } = useShareCampaign(token);

  if (isLoading) return <LoadingScreen />;
  if (error || !data?.campaign)
    return <ErrorScreen backHref={`${base}/top-of-funnel`} />;

  const campaign = data.campaign;
  const dateRange = formatDateRange(campaign.startDate, campaign.endDate);
  const organicRows = (campaign.tofOrganic ?? []) as DataRow[];

  const kpiMetrics: KpiMetric[] = [
    {
      label: "IMPRESSIONS",
      value: sumField(organicRows, "impressions"),
      format: "number",
    },
    { label: "LIKES", value: sumField(organicRows, "likes"), format: "number" },
    {
      label: "COMMENTS",
      value: sumField(organicRows, "comments"),
      format: "number",
    },
    {
      label: "SHARES",
      value: sumField(organicRows, "shares"),
      format: "number",
    },
    {
      label: "ENG. RATE",
      value: round1(avgField(organicRows, "engagement_rate_pct")),
      format: "percent",
    },
    {
      label: "TOP POST",
      value: lastField(organicRows, "top_post"),
      format: "text",
    },
  ];

  return (
    <GranularityProvider>
      <div className="min-h-screen bg-page">
        <PageHeader
          campaignName={campaign.name}
          subLabel="Top of Funnel · Organic Social"
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
                { label: "Organic Social" },
              ]}
            />
          </div>
          <section className="mb-8">
            <KpiStrip metrics={kpiMetrics} funnelColor={TOF_GREEN} />
          </section>
          <section className="flex flex-col gap-4">
            <ChartPair
              metric="Impressions (K)"
              monthlyData={toMonthly(organicRows, "impressions")}
              quarterlyData={toQ(organicRows, "impressions")}
              color={TOF_GREEN}
              fillColor={TOF_FILL}
            />
            <ChartPair
              metric="Likes (K)"
              monthlyData={toMonthly(organicRows, "likes")}
              quarterlyData={toQ(organicRows, "likes")}
              color={TOF_GREEN}
              fillColor={TOF_FILL}
            />
            <ChartPair
              metric="Shares (K)"
              monthlyData={toMonthly(organicRows, "shares")}
              quarterlyData={toQ(organicRows, "shares")}
              color={TOF_GREEN}
              fillColor={TOF_FILL}
            />
          </section>
        </main>
        <SharePageFooter />
      </div>
    </GranularityProvider>
  );
}
