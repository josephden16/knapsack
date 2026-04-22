"use client";

import { useParams } from "next/navigation";
import {
  GranularityProvider,
  KpiStrip,
  ChannelCard,
  PageHeader,
  Breadcrumb,
} from "@/components/ui";
import type { KpiMetric, ChannelMetric } from "@/components/ui";
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
} from "../share-utils";

const BOF_AMBER = "#F5A623";

export default function ShareBofPage() {
  const { token } = useParams<{ token: string }>();
  const base = `/share/${token}`;
  const { data, error, isLoading } = useShareCampaign(token);

  if (isLoading) return <LoadingScreen />;
  if (error || !data?.campaign) return <ErrorScreen backHref={base} />;

  const campaign = data.campaign;
  const dateRange = formatDateRange(campaign.startDate, campaign.endDate);

  const bofRows = (campaign.bofSummary ?? []) as DataRow[];
  const summaryMetrics: KpiMetric[] = [
    {
      label: "SIGN-UPS",
      value: sumField(bofRows, "signups"),
      format: "number",
    },
    {
      label: "PAGE VIEWS",
      value: sumField(bofRows, "page_views"),
      format: "number",
    },
    {
      label: "CONVERSIONS",
      value: sumField(bofRows, "conversions"),
      format: "number",
    },
    {
      label: "CONV. RATE",
      value: round2(avgField(bofRows, "conversion_rate_pct")),
      format: "percent",
    },
    {
      label: "BOUNCES",
      value: round1(avgField(bofRows, "bounce_rate_pct")),
      format: "percent",
    },
    { label: "SPEND", value: sumField(bofRows, "spend"), format: "currency" },
  ];

  const inappRows = (campaign.bofInapp ?? []) as DataRow[];
  const inappMetrics: ChannelMetric[] = [
    {
      label: "Page Views",
      value: sumField(inappRows, "page_views"),
      format: "number",
    },
    {
      label: "Sign-ups",
      value: sumField(inappRows, "signups"),
      format: "number",
    },
    {
      label: "Drop-off",
      value: round1(avgField(inappRows, "drop_off_pct")),
      format: "percent",
    },
    {
      label: "Bounce Rate",
      value: round1(avgField(inappRows, "bounce_rate_pct")),
      format: "percent",
    },
    {
      label: "Avg Time",
      value: formatAvgTime(inappRows, "avg_time_on_page_s"),
      format: "text",
    },
    {
      label: "Conversions",
      value: sumField(inappRows, "conversions"),
      format: "number",
    },
  ];

  const landingRows = (campaign.bofLanding ?? []) as DataRow[];
  const landingMetrics: ChannelMetric[] = [
    {
      label: "Clicks",
      value: sumField(landingRows, "clicks"),
      format: "number",
    },
    {
      label: "Conversions",
      value: sumField(landingRows, "conversions"),
      format: "number",
    },
    {
      label: "Conv. Rate",
      value: round2(avgField(landingRows, "conversion_rate_pct")),
      format: "percent",
    },
    {
      label: "Bounce Rate",
      value: round1(avgField(landingRows, "bounce_rate_pct")),
      format: "percent",
    },
    {
      label: "Avg Time",
      value: formatAvgTime(landingRows, "avg_time_on_page_s"),
      format: "text",
    },
    {
      label: "Spend",
      value: sumField(landingRows, "spend"),
      format: "currency",
    },
  ];

  const deepRows = (campaign.bofDeeplinks ?? []) as DataRow[];
  const deepMetrics: ChannelMetric[] = [
    { label: "Clicks", value: sumField(deepRows, "clicks"), format: "number" },
    {
      label: "Installs",
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
      label: "Re-engage",
      value: sumField(deepRows, "reengagements"),
      format: "number",
    },
    { label: "Spend", value: sumField(deepRows, "spend"), format: "currency" },
  ];

  return (
    <GranularityProvider>
      <div className="min-h-screen bg-page">
        <PageHeader
          campaignName={campaign.name}
          subLabel="Conversion — Channel overview"
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
                { label: "Bottom of Funnel" },
              ]}
            />
          </div>
          <section className="mb-8">
            <KpiStrip metrics={summaryMetrics} funnelColor={BOF_AMBER} />
          </section>
          <section className="grid grid-cols-3 gap-4">
            <ChannelCard
              title="In-App Journey"
              metrics={inappMetrics}
              drillPath={`${base}/bottom-of-funnel/in-app`}
              funnelColor={BOF_AMBER}
            />
            <ChannelCard
              title="Landing Pages"
              metrics={landingMetrics}
              drillPath={`${base}/bottom-of-funnel/landing`}
              funnelColor={BOF_AMBER}
            />
            <ChannelCard
              title="Deep Links"
              metrics={deepMetrics}
              drillPath={`${base}/bottom-of-funnel/deep-links`}
              funnelColor={BOF_AMBER}
            />
          </section>
        </main>
        <SharePageFooter />
      </div>
    </GranularityProvider>
  );
}
