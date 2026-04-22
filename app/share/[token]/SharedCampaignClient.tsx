"use client";

import {
  GranularityProvider,
  KpiStrip,
  PageHeader,
  Breadcrumb,
} from "@/components/ui";
import type { KpiMetric } from "@/components/ui";
import {
  useShareCampaign,
  LoadingScreen,
  ErrorScreen,
  ReadOnlyBadge,
  ShareFunnelBanner,
  SharePageFooter,
  DataRow,
  sumField,
  avgField,
  lastField,
  round1,
  round2,
  formatDateRange,
} from "./share-utils";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SharedCampaignClient({
  shareToken,
}: {
  shareToken: string;
}) {
  const base = `/share/${shareToken}`;
  const { data, error, isLoading } = useShareCampaign(shareToken);

  if (isLoading) return <LoadingScreen />;
  if (error || !data?.campaign) return <ErrorScreen backHref="/" />;

  const campaign = data.campaign;
  const dateRange = formatDateRange(campaign.startDate, campaign.endDate);

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
        <PageHeader
          campaignName={campaign.name}
          subLabel="Shared Campaign Report"
          dateRange={dateRange}
          budget={campaign.budget}
        />

        <ReadOnlyBadge />

        <main className="max-w-[1160px] mx-auto px-6 py-8">
          <div className="mb-8">
            <Breadcrumb
              segments={[{ label: "Shared Report" }, { label: campaign.name }]}
            />
          </div>

          <section className="flex flex-col gap-4">
            <ShareFunnelBanner
              stageName="Top of Funnel"
              label="Awareness"
              drillPath={`${base}/top-of-funnel`}
              color="#00B140"
            />
            <KpiStrip metrics={tofMetrics} funnelColor="#00B140" />
          </section>

          <section className="flex flex-col gap-4 mt-12">
            <ShareFunnelBanner
              stageName="Middle of Funnel"
              label="Consideration"
              drillPath={`${base}/middle-of-funnel`}
              color="#0066CC"
            />
            <KpiStrip metrics={mofMetrics} funnelColor="#0066CC" />
          </section>

          <section className="flex flex-col gap-4 mt-12">
            <ShareFunnelBanner
              stageName="Bottom of Funnel"
              label="Conversion"
              drillPath={`${base}/bottom-of-funnel`}
              color="#F5A623"
            />
            <KpiStrip metrics={bofMetrics} funnelColor="#F5A623" />
          </section>
        </main>

        <SharePageFooter />
      </div>
    </GranularityProvider>
  );
}
