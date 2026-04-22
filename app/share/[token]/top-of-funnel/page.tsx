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

const TOF_GREEN = "#00B140";

export default function ShareTofPage() {
  const { token } = useParams<{ token: string }>();
  const base = `/share/${token}`;
  const { data, error, isLoading } = useShareCampaign(token);

  if (isLoading) return <LoadingScreen />;
  if (error || !data?.campaign) return <ErrorScreen backHref={base} />;

  const campaign = data.campaign;
  const dateRange = formatDateRange(campaign.startDate, campaign.endDate);

  const tofRows = (campaign.tofSummary ?? []) as DataRow[];
  const summaryMetrics: KpiMetric[] = [
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

  const tvcRows = (campaign.tofTvc ?? []) as DataRow[];
  const tvcMetrics: ChannelMetric[] = [
    { label: "Reach", value: sumField(tvcRows, "reach"), format: "number" },
    { label: "GRPs", value: sumField(tvcRows, "grps"), format: "number" },
    {
      label: "Frequency",
      value: round1(avgField(tvcRows, "frequency")),
      format: "number",
    },
    {
      label: "Ad Recall",
      value: round1(avgField(tvcRows, "ad_recall_pct")),
      format: "percent",
    },
    { label: "Spend", value: sumField(tvcRows, "spend"), format: "currency" },
    {
      label: "CPR",
      value: round2(avgField(tvcRows, "cpr")),
      format: "currency",
    },
  ];

  const kolRows = (campaign.tofKol ?? []) as DataRow[];
  const kolMetrics: ChannelMetric[] = [
    { label: "Reach", value: sumField(kolRows, "reach"), format: "number" },
    {
      label: "Engagement",
      value: round1(avgField(kolRows, "engagement_pct")),
      format: "percent",
    },
    {
      label: "Sentiment",
      value: Math.round(avgField(kolRows, "sentiment")),
      format: "ratio",
    },
    { label: "Cost", value: sumField(kolRows, "cost"), format: "currency" },
    { label: "Top KOL", value: lastField(kolRows, "top_kol"), format: "text" },
    {
      label: "ROI",
      value: round1(avgField(kolRows, "roi")),
      format: "multiplier",
    },
  ];

  const organicRows = (campaign.tofOrganic ?? []) as DataRow[];
  const organicMetrics: ChannelMetric[] = [
    {
      label: "Impressions",
      value: sumField(organicRows, "impressions"),
      format: "number",
    },
    { label: "Likes", value: sumField(organicRows, "likes"), format: "number" },
    {
      label: "Comments",
      value: sumField(organicRows, "comments"),
      format: "number",
    },
    {
      label: "Shares",
      value: sumField(organicRows, "shares"),
      format: "number",
    },
    {
      label: "Eng. Rate",
      value: round1(avgField(organicRows, "engagement_rate_pct")),
      format: "percent",
    },
    {
      label: "Top Post",
      value: lastField(organicRows, "top_post"),
      format: "text",
    },
  ];

  const prRows = (campaign.tofPr ?? []) as DataRow[];
  const prMetrics: ChannelMetric[] = [
    {
      label: "Mentions",
      value: sumField(prRows, "mentions"),
      format: "number",
    },
    {
      label: "Earned%",
      value: round1(avgField(prRows, "earned_pct")),
      format: "percent",
    },
    {
      label: "Paid%",
      value: round1(avgField(prRows, "paid_pct")),
      format: "percent",
    },
    {
      label: "SOV",
      value: round1(avgField(prRows, "sov_pct")),
      format: "percent",
    },
    {
      label: "Top Outlet",
      value: lastField(prRows, "top_outlet"),
      format: "text",
    },
    { label: "Tone", value: lastField(prRows, "tone"), format: "text" },
  ];

  return (
    <GranularityProvider>
      <div className="min-h-screen bg-page">
        <PageHeader
          campaignName={campaign.name}
          subLabel="Awareness — Channel overview"
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
                { label: "Top of Funnel" },
              ]}
            />
          </div>
          <section className="mb-8">
            <KpiStrip metrics={summaryMetrics} funnelColor={TOF_GREEN} />
          </section>
          <section className="grid grid-cols-4 gap-4">
            <ChannelCard
              title="TVC / Broadcast"
              metrics={tvcMetrics}
              drillPath={`${base}/top-of-funnel/tvc`}
              funnelColor={TOF_GREEN}
            />
            <ChannelCard
              title="KOL / Influencer"
              metrics={kolMetrics}
              drillPath={`${base}/top-of-funnel/kol`}
              funnelColor={TOF_GREEN}
            />
            <ChannelCard
              title="Organic Social"
              metrics={organicMetrics}
              drillPath={`${base}/top-of-funnel/organic`}
              funnelColor={TOF_GREEN}
            />
            <ChannelCard
              title="PR / Media"
              metrics={prMetrics}
              drillPath={`${base}/top-of-funnel/pr`}
              funnelColor={TOF_GREEN}
            />
          </section>
        </main>
        <SharePageFooter />
      </div>
    </GranularityProvider>
  );
}
