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

export default function ShareXAdsPage() {
  const { token } = useParams<{ token: string }>();
  const base = `/share/${token}`;
  const { data, error, isLoading } = useShareCampaign(token);

  if (isLoading) return <LoadingScreen />;
  if (error || !data?.campaign)
    return <ErrorScreen backHref={`${base}/middle-of-funnel`} />;

  const campaign = data.campaign;
  const dateRange = formatDateRange(campaign.startDate, campaign.endDate);
  const xRows = (campaign.mofX ?? []) as DataRow[];

  const kpiMetrics: KpiMetric[] = [
    { label: "CLICKS", value: sumField(xRows, "clicks"), format: "number" },
    {
      label: "CTR",
      value: round2(avgField(xRows, "ctr_pct")),
      format: "percent",
    },
    { label: "CPC", value: round2(avgField(xRows, "cpc")), format: "currency" },
    {
      label: "ENGAGEMENTS",
      value: sumField(xRows, "engagements"),
      format: "number",
    },
    {
      label: "ROAS",
      value: round1(avgField(xRows, "roas")),
      format: "multiplier",
    },
    { label: "SPEND", value: sumField(xRows, "spend"), format: "currency" },
  ];

  return (
    <GranularityProvider>
      <div className="min-h-screen bg-page">
        <PageHeader
          campaignName={campaign.name}
          subLabel="Middle of Funnel · X Ads"
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
                { label: "X Ads" },
              ]}
            />
          </div>
          <section className="mb-8">
            <KpiStrip metrics={kpiMetrics} funnelColor={MOF_BLUE} />
          </section>
          <section className="flex flex-col gap-4">
            <ChartPair
              metric="Clicks (K)"
              monthlyData={toMonthly(xRows, "clicks")}
              quarterlyData={toQ(xRows, "clicks")}
              color={MOF_BLUE}
              fillColor={MOF_FILL}
            />
            <ChartPair
              metric="CTR (%)"
              monthlyData={toMonthly(xRows, "ctr_pct")}
              quarterlyData={toQ(xRows, "ctr_pct", "avg")}
              color={MOF_BLUE}
              fillColor={MOF_FILL}
            />
            <ChartPair
              metric="CPC (₦)"
              monthlyData={toMonthly(xRows, "cpc")}
              quarterlyData={toQ(xRows, "cpc", "avg")}
              color={MOF_BLUE}
              fillColor={MOF_FILL}
            />
            <ChartPair
              metric="ROAS (×)"
              monthlyData={toMonthly(xRows, "roas")}
              quarterlyData={toQ(xRows, "roas", "avg")}
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
