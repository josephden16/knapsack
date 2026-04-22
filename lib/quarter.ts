/**
 * Quarterly aggregation utilities.
 * Spec §5.14: Jan–Mar = Q1, Apr–Jun = Q2, Jul–Sep = Q3, Oct–Dec = Q4.
 */

export interface MonthlyPoint {
  month: string; // YYYY-MM
  value: number;
}

export interface QuarterlyPoint {
  quarter: string; // "Q1" | "Q2" | "Q3" | "Q4"
  value: number;
}

/** Maps a YYYY-MM string to its quarter label. */
export function getQuarterLabel(month: string): string {
  const m = parseInt(month.split("-")[1], 10);
  if (m <= 3) return "Q1";
  if (m <= 6) return "Q2";
  if (m <= 9) return "Q3";
  return "Q4";
}

/**
 * Aggregate monthly data points into quarterly buckets.
 *
 * @param data     - array of { month, value } monthly points
 * @param aggType  - "sum" for volume metrics (reach, clicks…)
 *                   "avg" for rate/ratio metrics (_pct, cpc, roas…)
 */
export function aggregateQuarterly(
  data: MonthlyPoint[],
  aggType: "sum" | "avg" = "sum",
): QuarterlyPoint[] {
  const buckets: Record<string, number[]> = {};

  for (const point of data) {
    const q = getQuarterLabel(point.month);
    if (!buckets[q]) buckets[q] = [];
    buckets[q].push(point.value);
  }

  // Preserve quarter order
  const order = ["Q1", "Q2", "Q3", "Q4"];
  return order
    .filter((q) => q in buckets)
    .map((quarter) => {
      const values = buckets[quarter];
      const value =
        aggType === "sum"
          ? values.reduce((a, b) => a + b, 0)
          : values.reduce((a, b) => a + b, 0) / values.length;
      return { quarter, value };
    });
}
