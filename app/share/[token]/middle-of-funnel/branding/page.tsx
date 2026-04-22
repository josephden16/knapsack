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
} from "../../share-utils";

const MOF_BLUE = "#0066CC";
const MOF_FILL = "#E6F0FA";
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

export default function ShareBrandingPage() {
  const { token } = useParams<{ token: string }>();
  const base = `/share/${token}`;
  const { data, error, isLoading } = useShareCampaign(token);

  if (isLoading) return <LoadingScreen />;
  if (error || !data?.campaign)
    return <ErrorScreen backHref={`${base}/middle-of-funnel`} />;

  const campaign = data.campaign;
  const dateRange = formatDateRange(campaign.startDate, campaign.endDate);
  const brandingRows = (campaign.mofBranding ?? []) as DataRow[];

  const kpiMetrics: KpiMetric[] = [
    {
      label: "IMPRESSIONS",
      value: sumField(brandingRows, "impressions"),
      format: "number",
    },
    {
      label: "CLICKS",
      value: sumField(brandingRows, "clicks"),
      format: "number",
    },
    {
      label: "CTR",
      value: round2(avgField(brandingRows, "ctr_pct")),
      format: "percent",
    },
    {
      label: "CPC",
      value: round2(avgField(brandingRows, "cpc")),
      format: "currency",
    },
    {
      label: "BRAND LIFT",
      value: round1(avgField(brandingRows, "brand_lift_pct")),
      format: "percent",
    },
    {
      label: "SPEND",
      value: sumField(brandingRows, "spend"),
      format: "currency",
    },
  ];

  return (
    <GranularityProvider>
      <div className="min-h-screen bg-page">
        <PageHeader
          campaignName={campaign.name}
          subLabel="Middle of Funnel · Branding / Display"
          dateRange={dateRange}
          budget={campaign.budget}
          stagePill="CONSIDERATION"
          stagePillColor={MOF_BLUE}
        />
        <ReadOnlyBadge />
        <main className="max-w-[1160px] mx-auto px-6 py-10">
          <div className="mb-8">
            <Breadcrumb
              segments={[
                { label: "Shared Report", href: base },
                { label: campaign.name, href: base },
                { label: "Middle of Funnel", href: `${base}/middle-of-funnel` },
                { label: "Branding / Display" },
              ]}
            />
          </div>
          <section className="mb-8">
            <KpiStrip metrics={kpiMetrics} funnelColor={MOF_BLUE} />
          </section>
          <section className="flex flex-col gap-4">
            <ChartPair
              metric="Impressions (K)"
              monthlyData={toMonthly(brandingRows, "impressions")}
              quarterlyData={toQ(brandingRows, "impressions")}
              color={MOF_BLUE}
              fillColor={MOF_FILL}
            />
            <ChartPair
              metric="Clicks (K)"
              monthlyData={toMonthly(brandingRows, "clicks")}
              quarterlyData={toQ(brandingRows, "clicks")}
              color={MOF_BLUE}
              fillColor={MOF_FILL}
            />
            <ChartPair
              metric="CTR (%)"
              monthlyData={toMonthly(brandingRows, "ctr_pct")}
              quarterlyData={toQ(brandingRows, "ctr_pct", "avg")}
              color={MOF_BLUE}
              fillColor={MOF_FILL}
            />
            <ChartPair
              metric="Brand Lift (%)"
              monthlyData={toMonthly(brandingRows, "brand_lift_pct")}
              quarterlyData={toQ(brandingRows, "brand_lift_pct", "avg")}
              color={MOF_BLUE}
              fillColor={MOF_FILL}
            />
          </section>
        </main>
        <SharePageFooter />
      </div>
    </GranularityProvider>
  );
}
