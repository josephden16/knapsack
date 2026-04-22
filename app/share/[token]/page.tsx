import SharedCampaignClient from "./SharedCampaignClient";

type Props = { params: { token: string } };

export default function SharedCampaignPage({ params }: Props) {
  return <SharedCampaignClient shareToken={params.token} />;
}
