"use client";

import useSWR from "swr";
import Link from "next/link";

// ─── Types ─────────────────────────────────────────────────────────────────

export type DataRow = Record<string, unknown>;

// ─── Data helpers ──────────────────────────────────────────────────────────

export function sumField(rows: DataRow[], key: string): number {
  return rows.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);
}

export function avgField(rows: DataRow[], key: string): number {
  if (!rows.length) return 0;
  return rows.reduce((acc, r) => acc + (Number(r[key]) || 0), 0) / rows.length;
}

export function lastField(rows: DataRow[], key: string): string {
  if (!rows.length) return "—";
  return String(rows[rows.length - 1][key] ?? "—");
}

export function round1(n: number): number {
  return parseFloat(n.toFixed(1));
}

export function round2(n: number): number {
  return parseFloat(n.toFixed(2));
}

export function formatAvgTime(rows: DataRow[], key: string): string {
  if (!rows.length) return "—";
  const avg =
    rows.reduce((acc, r) => acc + (Number(r[key]) || 0), 0) / rows.length;
  const totalSeconds = Math.round(avg);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${s}s`;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatDateRange(startDate: string, endDate: string): string {
  const [sY, sM] = startDate.split("-");
  const [eY, eM] = endDate.split("-");
  const sLabel = MONTHS[parseInt(sM) - 1];
  const eLabel = MONTHS[parseInt(eM) - 1];
  if (sY === eY) return `${sLabel} — ${eLabel} ${sY}`;
  return `${sLabel} ${sY} — ${eLabel} ${eY}`;
}

// ─── Data fetching ─────────────────────────────────────────────────────────

async function publicFetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Not found");
  return res.json();
}

export function useShareCampaign(shareToken: string) {
  return useSWR(`/api/share/${shareToken}`, publicFetcher);
}

// ─── Shared UI ─────────────────────────────────────────────────────────────

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-page">
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "#00B140" }}
        >
          <span className="text-white font-bold text-lg">K</span>
        </div>
        <p className="text-[13px] text-text-muted">Loading shared report…</p>
      </div>
    </div>
  );
}

export function ErrorScreen({ backHref }: { backHref: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-page">
      <div className="flex flex-col items-center gap-4 text-center max-w-xs">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "#FEF3DC" }}
        >
          <span className="text-[24px]">⚠</span>
        </div>
        <p className="text-[16px] font-semibold text-text-primary">
          Link expired or not found
        </p>
        <p className="text-[13px] text-text-muted leading-relaxed">
          This shared report link is no longer valid. Ask the campaign owner to
          generate a new link.
        </p>
        <Link
          href={backHref}
          className="mt-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white"
          style={{ backgroundColor: "#00B140" }}
        >
          ← Back
        </Link>
      </div>
    </div>
  );
}

export function ReadOnlyBadge() {
  return (
    <div className="max-w-[1160px] mx-auto px-6 pt-6">
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#E6F7ED] border border-[#A7F3C0] w-fit">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M7 1.5C4.51 1.5 2.5 3.51 2.5 6v1H2a1 1 0 00-1 1v4a1 1 0 001 1h10a1 1 0 001-1V8a1 1 0 00-1-1h-.5V6c0-2.49-2.01-4.5-4.5-4.5zm0 1.5c1.66 0 3 1.34 3 3v1H4V6c0-1.66 1.34-3 3-3z"
            fill="#00B140"
          />
        </svg>
        <span className="text-[12px] font-semibold text-[#00B140]">
          Read-only shared view
        </span>
      </div>
    </div>
  );
}

/** FunnelBanner variant for share pages — links within the share tree */
export function ShareFunnelBanner({
  stageName,
  label,
  drillPath,
  color,
}: {
  stageName: string;
  label: string;
  drillPath: string;
  color: string;
}) {
  return (
    <Link
      href={drillPath}
      className="flex items-center justify-between rounded-card px-5 py-3.5 group transition-[filter] hover:[filter:brightness(0.92)]"
      style={{ backgroundColor: color }}
    >
      <div className="flex items-baseline gap-2">
        <span className="text-white font-bold text-[15px] leading-none">
          {stageName}
        </span>
        <span className="text-white/75 font-normal text-[14px] leading-none">
          — {label}
        </span>
      </div>
      <span className="text-white font-semibold text-[13px] group-hover:translate-x-0.5 transition-transform">
        Drill in →
      </span>
    </Link>
  );
}

/** ChannelCard read-only variant for share overview pages — links within the share tree */
export function ShareChannelCardLink({
  title,
  drillPath,
  funnelColor,
  children,
}: {
  title: string;
  drillPath: string;
  funnelColor: string;
  children?: React.ReactNode;
}) {
  return (
    <Link
      href={drillPath}
      className="group bg-white rounded-card shadow-card flex flex-col overflow-hidden transition-shadow hover:shadow-elevated"
      style={{ borderTop: `3px solid ${funnelColor}` }}
    >
      <div className="p-4 flex items-center justify-between border-b border-border-default">
        <h3 className="text-[13px] font-bold text-text-primary group-hover:text-opay-green transition-colors">
          {title}
        </h3>
        <span
          className="text-[12px] font-semibold transition-colors"
          style={{ color: funnelColor }}
        >
          View →
        </span>
      </div>
      {children && <div className="p-4 flex flex-col gap-2">{children}</div>}
    </Link>
  );
}

export function SharePageFooter() {
  return (
    <footer className="pb-10 pt-4 text-center">
      <p className="text-[12px] text-text-muted">
        KnapSack — Campaign Reporting Platform · OPay Marketing
      </p>
    </footer>
  );
}
