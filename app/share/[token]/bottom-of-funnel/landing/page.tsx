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
  round1,
  round2,
  formatDateRange,
  formatAvgTime,
} from "../../share-utils";

const BOF_AMBER = "#F5A623";
const BOF_FILL = "#FEF3DC";
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

export default function ShareLandingPage() {
  const { token } = useParams<{ token: string }>();
  const base = `/share/${token}`;
  const { data, error, isLoading } = useShareCampaign(token);

  if (isLoading) return <LoadingScreen />;
  if (error || !data?.campaign)
    return <ErrorScreen backHref={`${base}/bottom-of-funnel`} />;

  const campaign = data.campaign;
  const dateRange = formatDateRange(campaign.startDate, campaign.endDate);
  const landingRows = (campaign.bofLanding ?? []) as DataRow[];

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
      label: "CONV. RATE",
      value: round2(avgField(landingRows, "conversion_rate_pct")),
      format: "percent",
    },
    {
      label: "BOUNCE RATE",
      value: round1(avgField(landingRows, "bounce_rate_pct")),
      format: "percent",
    },
    {
      label: "AVG TIME",
      value: formatAvgTime(landingRows, "avg_time_on_page_s"),
      format: "text",
    },
    {
      label: "SPEND",
      value: sumField(landingRows, "spend"),
      format: "currency",
    },
  ];

  return (
    <GranularityProvider>
      <div className="min-h-screen bg-page">
        <PageHeader
          campaignName={campaign.name}
          subLabel="Bottom of Funnel · Landing Pages"
          dateRange={dateRange}
          budget={campaign.budget}
          stagePill="CONVERSION"
          stagePillColor={BOF_AMBER}
        />
        <ReadOnlyBadge />
        <main className="max-w-[1160px] mx-auto px-6 py-10">
          <div className="mb-8">
            <Breadcrumb
              segments={[
                { label: "Shared Report", href: base },
                { label: campaign.name, href: base },
                { label: "Bottom of Funnel", href: `${base}/bottom-of-funnel` },
                { label: "Landing Pages" },
              ]}
            />
          </div>
          <section className="mb-8">
            <KpiStrip metrics={kpiMetrics} funnelColor={BOF_AMBER} />
          </section>
          <section className="flex flex-col gap-4">
            <ChartPair
              metric="Clicks (K)"
              monthlyData={toMonthly(landingRows, "clicks")}
              quarterlyData={toQ(landingRows, "clicks")}
              color={BOF_AMBER}
              fillColor={BOF_FILL}
            />
            <ChartPair
              metric="Conversions (K)"
              monthlyData={toMonthly(landingRows, "conversions")}
              quarterlyData={toQ(landingRows, "conversions")}
              color={BOF_AMBER}
              fillColor={BOF_FILL}
            />
            <ChartPair
              metric="Bounce Rate (%)"
              monthlyData={toMonthly(landingRows, "bounce_rate_pct")}
              quarterlyData={toQ(landingRows, "bounce_rate_pct", "avg")}
              color={BOF_AMBER}
              fillColor={BOF_FILL}
            />
          </section>
        </main>
        <SharePageFooter />
      </div>
    </GranularityProvider>
  );
}
