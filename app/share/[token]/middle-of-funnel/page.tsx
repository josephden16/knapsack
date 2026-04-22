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
  lastField,
  round1,
  round2,
  formatDateRange,
} from "../share-utils";

const MOF_BLUE = "#0066CC";

export default function ShareMofPage() {
  const { token } = useParams<{ token: string }>();
  const base = `/share/${token}`;
  const { data, error, isLoading } = useShareCampaign(token);

  if (isLoading) return <LoadingScreen />;
  if (error || !data?.campaign) return <ErrorScreen backHref={base} />;

  const campaign = data.campaign;
  const dateRange = formatDateRange(campaign.startDate, campaign.endDate);

  const mofRows = (campaign.mofSummary ?? []) as DataRow[];
  const summaryMetrics: KpiMetric[] = [
    { label: "CLICKS", value: sumField(mofRows, "clicks"), format: "number" },
    {
      label: "CTR",
      value: round2(avgField(mofRows, "ctr_pct")),
      format: "percent",
    },
    {
      label: "CPC",
      value: round2(avgField(mofRows, "cpc")),
      format: "currency",
    },
    {
      label: "CONVERSIONS",
      value: sumField(mofRows, "conversions"),
      format: "number",
    },
    {
      label: "ROAS",
      value: round1(avgField(mofRows, "roas")),
      format: "multiplier",
    },
    { label: "SPEND", value: sumField(mofRows, "spend"), format: "currency" },
  ];

  const metaRows = (campaign.mofMeta ?? []) as DataRow[];
  const metaMetrics: ChannelMetric[] = [
    { label: "Clicks", value: sumField(metaRows, "clicks"), format: "number" },
    {
      label: "CTR",
      value: round2(avgField(metaRows, "ctr_pct")),
      format: "percent",
    },
    {
      label: "CPC",
      value: round2(avgField(metaRows, "cpc")),
      format: "currency",
    },
    {
      label: "ROAS",
      value: round1(avgField(metaRows, "roas")),
      format: "multiplier",
    },
    { label: "Spend", value: sumField(metaRows, "spend"), format: "currency" },
    {
      label: "Frequency",
      value: round1(avgField(metaRows, "frequency")),
      format: "number",
    },
  ];

  const tiktokRows = (campaign.mofTiktok ?? []) as DataRow[];
  const tiktokMetrics: ChannelMetric[] = [
    {
      label: "Clicks",
      value: sumField(tiktokRows, "clicks"),
      format: "number",
    },
    {
      label: "CTR",
      value: round2(avgField(tiktokRows, "ctr_pct")),
      format: "percent",
    },
    {
      label: "CPC",
      value: round2(avgField(tiktokRows, "cpc")),
      format: "currency",
    },
    {
      label: "ROAS",
      value: round1(avgField(tiktokRows, "roas")),
      format: "multiplier",
    },
    {
      label: "Spend",
      value: sumField(tiktokRows, "spend"),
      format: "currency",
    },
    { label: "Views", value: sumField(tiktokRows, "views"), format: "number" },
  ];

  const xRows = (campaign.mofX ?? []) as DataRow[];
  const xMetrics: ChannelMetric[] = [
    { label: "Clicks", value: sumField(xRows, "clicks"), format: "number" },
    {
      label: "CTR",
      value: round2(avgField(xRows, "ctr_pct")),
      format: "percent",
    },
    { label: "CPC", value: round2(avgField(xRows, "cpc")), format: "currency" },
    {
      label: "ROAS",
      value: round1(avgField(xRows, "roas")),
      format: "multiplier",
    },
    { label: "Spend", value: sumField(xRows, "spend"), format: "currency" },
    {
      label: "Engagements",
      value: sumField(xRows, "engagements"),
      format: "number",
    },
  ];

  const brandingRows = (campaign.mofBranding ?? []) as DataRow[];
  const brandingMetrics: ChannelMetric[] = [
    {
      label: "Impressions",
      value: sumField(brandingRows, "impressions"),
      format: "number",
    },
    {
      label: "Clicks",
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
      label: "Spend",
      value: sumField(brandingRows, "spend"),
      format: "currency",
    },
    {
      label: "Brand Lift",
      value: round1(avgField(brandingRows, "brand_lift_pct")),
      format: "percent",
    },
  ];

  return (
    <GranularityProvider>
      <div className="min-h-screen bg-page">
        <PageHeader
          campaignName={campaign.name}
          subLabel="Consideration — Channel overview"
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
                { label: "Middle of Funnel" },
              ]}
            />
          </div>
          <section className="mb-8">
            <KpiStrip metrics={summaryMetrics} funnelColor={MOF_BLUE} />
          </section>
          <section className="grid grid-cols-4 gap-4">
            <ChannelCard
              title="Meta Ads"
              metrics={metaMetrics}
              drillPath={`${base}/middle-of-funnel/meta`}
              funnelColor={MOF_BLUE}
            />
            <ChannelCard
              title="TikTok Ads"
              metrics={tiktokMetrics}
              drillPath={`${base}/middle-of-funnel/tiktok`}
              funnelColor={MOF_BLUE}
            />
            <ChannelCard
              title="X Ads"
              metrics={xMetrics}
              drillPath={`${base}/middle-of-funnel/x-ads`}
              funnelColor={MOF_BLUE}
            />
            <ChannelCard
              title="Branding / Display"
              metrics={brandingMetrics}
              drillPath={`${base}/middle-of-funnel/branding`}
              funnelColor={MOF_BLUE}
            />
          </section>
        </main>
        <SharePageFooter />
      </div>
    </GranularityProvider>
  );
}
