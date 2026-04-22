"use client";

import { formatMetric, type MetricFormat } from "@/lib/format";

export interface KpiMetric {
  label: string;
  value: number | string;
  format: MetricFormat;
}

interface KpiStripProps {
  metrics: KpiMetric[];
  /** Hex color matching the funnel stage — sets the left border. */
  funnelColor: string;
}

/**
 * Renders a 6-card KPI row. Each card shows a label above the formatted value.
 * Left border is colored by funnel stage.
 */
export function KpiStrip({ metrics, funnelColor }: KpiStripProps) {
  return (
    <div className="grid grid-cols-6 gap-3">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="bg-white rounded-card p-4 shadow-card"
          style={{ borderLeft: `3px solid ${funnelColor}` }}
        >
          <p className="kpi-label mb-2">{metric.label}</p>
          <p className="kpi-value tnum text-text-primary">
            {formatMetric(metric.value, metric.format)}
          </p>
        </div>
      ))}
    </div>
  );
}
