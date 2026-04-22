"use client";

import { useParams } from "next/navigation";
import {
  GranularityProvider,
  KpiStrip,
  ChartPair,
  HorizontalBarChart,
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

export default function ShareTvcPage() {
  const { token } = useParams<{ token: string }>();
  const base = `/share/${token}`;
  const { data, error, isLoading } = useShareCampaign(token);

  if (isLoading) return <LoadingScreen />;
  if (error || !data?.campaign)
    return <ErrorScreen backHref={`${base}/top-of-funnel`} />;

  const campaign = data.campaign;
  const dateRange = formatDateRange(campaign.startDate, campaign.endDate);
  const tvcRows = (campaign.tofTvc ?? []) as DataRow[];

  const kpiMetrics: KpiMetric[] = [
    { label: "REACH", value: sumField(tvcRows, "reach"), format: "number" },
    { label: "GRPS", value: sumField(tvcRows, "grps"), format: "number" },
    {
      label: "FREQUENCY",
      value: round1(avgField(tvcRows, "frequency")),
      format: "number",
    },
    {
      label: "AD RECALL",
      value: round1(avgField(tvcRows, "ad_recall_pct")),
      format: "percent",
    },
    { label: "SPEND", value: sumField(tvcRows, "spend"), format: "currency" },
    {
      label: "CPR",
      value: round2(avgField(tvcRows, "cpr")),
      format: "currency",
    },
  ];

  const grpChannelData = [
    { label: "AIT", value: sumField(tvcRows, "channel_ait_grp") },
    {
      label: "Channels TV",
      value: sumField(tvcRows, "channel_channelstv_grp"),
    },
    { label: "NTA", value: sumField(tvcRows, "channel_nta_grp") },
    { label: "STV", value: sumField(tvcRows, "channel_stv_grp") },
    { label: "Others", value: sumField(tvcRows, "channel_others_grp") },
  ].filter((d) => d.value > 0);

  return (
    <GranularityProvider>
      <div className="min-h-screen bg-page">
        <PageHeader
          campaignName={campaign.name}
          subLabel="Top of Funnel · TVC / Broadcast"
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
                { label: "TVC / Broadcast" },
              ]}
            />
          </div>
          <section className="mb-8">
            <KpiStrip metrics={kpiMetrics} funnelColor={TOF_GREEN} />
          </section>
          <section className="flex flex-col gap-4 mb-6">
            <ChartPair
              metric="Reach (K)"
              monthlyData={toMonthly(tvcRows, "reach")}
              quarterlyData={toQ(tvcRows, "reach")}
              color={TOF_GREEN}
              fillColor={TOF_FILL}
            />
            <ChartPair
              metric="GRPs"
              monthlyData={toMonthly(tvcRows, "grps")}
              quarterlyData={toQ(tvcRows, "grps")}
              color={TOF_GREEN}
              fillColor={TOF_FILL}
            />
            <ChartPair
              metric="Frequency"
              monthlyData={toMonthly(tvcRows, "frequency")}
              quarterlyData={toQ(tvcRows, "frequency", "avg")}
              color={TOF_GREEN}
              fillColor={TOF_FILL}
            />
            <ChartPair
              metric="Ad Recall (%)"
              monthlyData={toMonthly(tvcRows, "ad_recall_pct")}
              quarterlyData={toQ(tvcRows, "ad_recall_pct", "avg")}
              color={TOF_GREEN}
              fillColor={TOF_FILL}
            />
          </section>
          {grpChannelData.length > 0 && (
            <div style={{ width: "45%" }}>
              <HorizontalBarChart
                title="GRP by Broadcast Channel"
                data={grpChannelData}
                color={TOF_GREEN}
              />
            </div>
          )}
        </main>
        <SharePageFooter />
      </div>
    </GranularityProvider>
  );
}
