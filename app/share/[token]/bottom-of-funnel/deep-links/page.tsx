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

export default function ShareDeepLinksPage() {
  const { token } = useParams<{ token: string }>();
  const base = `/share/${token}`;
  const { data, error, isLoading } = useShareCampaign(token);

  if (isLoading) return <LoadingScreen />;
  if (error || !data?.campaign)
    return <ErrorScreen backHref={`${base}/bottom-of-funnel`} />;

  const campaign = data.campaign;
  const dateRange = formatDateRange(campaign.startDate, campaign.endDate);
  const deepRows = (campaign.bofDeeplinks ?? []) as DataRow[];

  const kpiMetrics: KpiMetric[] = [
    { label: "CLICKS", value: sumField(deepRows, "clicks"), format: "number" },
    {
      label: "INSTALLS",
      value: sumField(deepRows, "installs"),
      format: "number",
    },
    {
      label: "CTO",
      value: round2(avgField(deepRows, "cto_pct")),
      format: "percent",
    },
    {
      label: "CPI",
      value: round2(avgField(deepRows, "cpi")),
      format: "currency",
    },
    {
      label: "RE-ENGAGEMENTS",
      value: sumField(deepRows, "reengagements"),
      format: "number",
    },
    { label: "SPEND", value: sumField(deepRows, "spend"), format: "currency" },
  ];

  return (
    <GranularityProvider>
      <div className="min-h-screen bg-page">
        <PageHeader
          campaignName={campaign.name}
          subLabel="Bottom of Funnel · Deep Links"
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
                { label: "Deep Links" },
              ]}
            />
          </div>
          <section className="mb-8">
            <KpiStrip metrics={kpiMetrics} funnelColor={BOF_AMBER} />
          </section>
          <section className="flex flex-col gap-4">
            <ChartPair
              metric="Clicks (K)"
              monthlyData={toMonthly(deepRows, "clicks")}
              quarterlyData={toQ(deepRows, "clicks")}
              color={BOF_AMBER}
              fillColor={BOF_FILL}
            />
            <ChartPair
              metric="Installs (K)"
              monthlyData={toMonthly(deepRows, "installs")}
              quarterlyData={toQ(deepRows, "installs")}
              color={BOF_AMBER}
              fillColor={BOF_FILL}
            />
            <ChartPair
              metric="CTO (%)"
              monthlyData={toMonthly(deepRows, "cto_pct")}
              quarterlyData={toQ(deepRows, "cto_pct", "avg")}
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
