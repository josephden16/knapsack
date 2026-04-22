/**
 * Value formatting utilities for KnapSack KPI cards and charts.
 * format types match the spec in Section 7.1.
 */

export type MetricFormat =
  | "number"
  | "currency"
  | "percent"
  | "multiplier"
  | "ratio"
  | "text";

/**
 * Abbreviates a raw number with K / M suffix.
 * 12_400_000 → "12.4M"
 * 243_000    → "243K"
 * 1_500      → "1.5K"
 * 42         → "42"
 */
export function abbreviate(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    const v = value / 1_000_000;
    return `${parseFloat(v.toFixed(1))}M`;
  }
  if (abs >= 1_000) {
    const v = value / 1_000;
    return `${parseFloat(v.toFixed(1))}K`;
  }
  return String(value);
}

/**
 * Format a metric value for display in a KPI card or chart label.
 *
 * @param value  — the raw value (number or string for "text" format)
 * @param format — one of the MetricFormat variants
 */
export function formatMetric(
  value: number | string,
  format: MetricFormat,
): string {
  if (format === "text") return String(value ?? "—");

  const num = typeof value === "number" ? value : parseFloat(String(value));
  if (!isFinite(num)) return "—";

  switch (format) {
    case "number":
      return abbreviate(num);
    case "currency":
      return `$${abbreviate(num)}`;
    case "percent":
      return `${num}%`;
    case "multiplier":
      return `${num}x`;
    case "ratio":
      return `${num}/100`;
  }
}

/**
 * Convert seconds to "Xm Ys" string.
 * 134 → "2m 14s"
 */
export function secondsToDisplay(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

/**
 * Short month label from YYYY-MM string.
 * "2025-01" → "Jan"
 */
export function monthLabel(yyyyMm: string): string {
  const [, mm] = yyyyMm.split("-");
  const months = [
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
  return months[parseInt(mm, 10) - 1] ?? yyyyMm;
}

/**
 * Quarter label from YYYY-MM string.
 * "2025-01" → "Q1"
 */
export function quarterLabel(yyyyMm: string): string {
  const [, mm] = yyyyMm.split("-");
  const q = Math.ceil(parseInt(mm, 10) / 3);
  return `Q${q}`;
}

/**
 * Aggregate monthly rows into quarterly rows.
 * sumKeys   — fields to SUM  across the quarter
 * avgKeys   — fields to AVERAGE across the quarter
 * lastKeys  — fields to take the LAST value in the quarter
 */
export function aggregateToQuarters(
  rows: Record<string, unknown>[],
  sumKeys: string[],
  avgKeys: string[],
  lastKeys: string[],
): Record<string, unknown>[] {
  const buckets: Record<string, Record<string, unknown>[]> = {};

  for (const row of rows) {
    const ql = quarterLabel(row.month as string);
    if (!buckets[ql]) buckets[ql] = [];
    buckets[ql].push(row);
  }

  return Object.entries(buckets).map(([quarter, months]) => {
    const result: Record<string, unknown> = { month: quarter };

    for (const k of sumKeys) {
      result[k] = months.reduce((acc, r) => acc + ((r[k] as number) ?? 0), 0);
    }
    for (const k of avgKeys) {
      const vals = months.map((r) => (r[k] as number) ?? 0);
      result[k] = parseFloat(
        (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2),
      );
    }
    for (const k of lastKeys) {
      result[k] = months[months.length - 1]?.[k] ?? null;
    }

    return result;
  });
}
