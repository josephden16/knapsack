"use client";

import Link from "next/link";

interface FunnelBannerProps {
  /** Short stage label — e.g. "Awareness", "Consideration", "Conversion" */
  label: string;
  /** Full stage name — e.g. "Top of Funnel", "Middle of Funnel" */
  stageName: string;
  /** Route the banner links to. */
  drillPath: string;
  /** Hex background color for the banner. */
  color: string;
}

/**
 * Full-width colored banner row on the Campaign Overview page.
 * Left: stage name + label. Right: "Drill in →".
 * Hover darkens the background via CSS filter.
 */
export function FunnelBanner({
  label,
  stageName,
  drillPath,
  color,
}: FunnelBannerProps) {
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
