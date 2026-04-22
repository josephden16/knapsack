"use client";

import Link from "next/link";
import { formatMetric, type MetricFormat } from "@/lib/format";

export interface ChannelMetric {
  label: string;
  value: number | string;
  format: MetricFormat;
}

interface ChannelCardProps {
  title: string;
  metrics: ChannelMetric[];
  /** Absolute or relative path for the "Drill in →" link. */
  drillPath: string;
  /** Hex color for the top border — matches the funnel stage. */
  funnelColor: string;
}

/**
 * Summary card used on the three channel overview pages (ToF, MoF, BoF).
 * Shows title, a "Drill in →" link, and a list of metric rows.
 */
export function ChannelCard({
  title,
  metrics,
  drillPath,
  funnelColor,
}: ChannelCardProps) {
  return (
    <div
      className="bg-white rounded-card shadow-card p-5 flex flex-col"
      style={{ borderTop: `3px solid ${funnelColor}` }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] font-semibold text-text-primary leading-snug">
          {title}
        </h3>
        <Link
          href={drillPath}
          className="text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors shrink-0 ml-3"
        >
          Drill in →
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <p className="text-[12px] text-text-muted mb-0.5">{metric.label}</p>
            <p className="text-[15px] font-semibold text-text-primary tnum">
              {formatMetric(metric.value, metric.format)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
