"use client";

import { formatMetric } from "@/lib/format";

export interface KolRow {
  kol_name: string;
  reach: number;
  engagement_pct: number;
  cost: number;
  roi: number;
}

interface KolTableProps {
  rows: KolRow[];
}

/**
 * KOL Performance table on the KOL / Influencer detail page.
 * Columns: KOL | Reach | Eng. | Cost | ROI
 * Spec §7.8 / §6.7
 */
export function KolTable({ rows }: KolTableProps) {
  return (
    <div className="bg-white rounded-card shadow-card overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-border-default">
        <p className="text-[13px] font-semibold text-text-primary">
          KOL Performance
        </p>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b border-border-default">
            {["KOL", "REACH", "ENG.", "COST", "ROI"].map((col) => (
              <th
                key={col}
                className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted text-left first:text-left last:text-right [&:not(:first-child)]:text-right"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.kol_name}
              className={`border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors ${
                i === rows.length - 1 ? "border-b-0" : ""
              }`}
            >
              <td className="px-5 py-3 text-[13px] text-text-primary font-medium">
                {row.kol_name}
              </td>
              <td className="px-5 py-3 text-[13px] text-text-primary tnum text-right">
                {formatMetric(row.reach, "number")}
              </td>
              <td className="px-5 py-3 text-[13px] text-text-primary tnum text-right">
                {formatMetric(row.engagement_pct, "percent")}
              </td>
              <td className="px-5 py-3 text-[13px] text-text-primary tnum text-right">
                {formatMetric(row.cost, "currency")}
              </td>
              <td className="px-5 py-3 text-[13px] text-text-primary tnum text-right">
                {formatMetric(row.roi, "multiplier")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
