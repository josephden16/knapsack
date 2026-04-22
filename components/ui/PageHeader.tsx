"use client";

import { useGranularity } from "./GranularityContext";

interface PageHeaderProps {
  /** Displayed after "KnapSack ·" in the header title area. */
  campaignName: string;
  /** Secondary sub-label line, e.g. "Campaign Overview" or "Awareness — Channel overview". */
  subLabel?: string;
  /** Formatted date range, e.g. "Jan 2025 – Jun 2025". */
  dateRange?: string;
  /** Campaign budget as a raw number (displayed as $xxx,xxx). */
  budget?: number;
  /** Text for the funnel stage pill — e.g. "AWARENESS". Requires stagePillColor. */
  stagePill?: string;
  /** Background color for the stage pill. */
  stagePillColor?: string;
}

/**
 * Sticky top header shared across all inner dashboard pages.
 *
 * Left side: K logo mark  · KnapSack · Campaign Name [Stage Pill]
 *            Sub-label line with date range and budget
 *
 * Right side: Monthly / Quarterly toggle (drives GranularityContext)
 */
export function PageHeader({
  campaignName,
  subLabel,
  dateRange,
  budget,
  stagePill,
  stagePillColor,
}: PageHeaderProps) {
  const { granularity, setGranularity } = useGranularity();

  return (
    <header
      className="bg-white sticky top-0 z-10 px-6 py-3"
      style={{ boxShadow: "var(--shadow-header)" }}
    >
      <div className="flex items-center justify-between gap-4">
        {/* ── Left: identity & context ───────────────────────────── */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo mark */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ backgroundColor: "#00B140" }}
          >
            K
          </div>

          <div className="min-w-0">
            {/* Title row */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] text-text-muted">KnapSack</span>
              {campaignName && (
                <>
                  <span className="text-border-default select-none">·</span>
                  <span className="text-[16px] font-bold text-text-primary truncate">
                    {campaignName}
                  </span>
                </>
              )}
              {stagePill && stagePillColor && (
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.06em] text-white rounded-full px-3 py-0.5 shrink-0"
                  style={{ backgroundColor: stagePillColor }}
                >
                  {stagePill}
                </span>
              )}
            </div>

            {/* Sub-label row */}
            {(subLabel || dateRange || budget != null) && (
              <div className="flex items-center gap-2 text-[12px] text-text-muted mt-0.5 flex-wrap">
                {subLabel && <span>{subLabel}</span>}
                {dateRange && (
                  <>
                    {subLabel && (
                      <span className="text-border-default select-none">|</span>
                    )}
                    <span>{dateRange}</span>
                  </>
                )}
                {budget != null && (
                  <>
                    <span className="text-border-default select-none">|</span>
                    <span>Budget: ${budget.toLocaleString()}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Monthly / Quarterly toggle ──────────────────── */}
        <div
          className="flex rounded-full p-[3px] shrink-0"
          style={{ backgroundColor: "#F4F6F8" }}
        >
          {(["monthly", "quarterly"] as const).map((option) => {
            const active = granularity === option;
            return (
              <button
                key={option}
                onClick={() => setGranularity(option)}
                className="rounded-full px-4 py-1.5 text-[13px] transition-all"
                style={
                  active
                    ? {
                        backgroundColor: "#00B140",
                        color: "#FFFFFF",
                        fontWeight: 600,
                      }
                    : {
                        backgroundColor: "transparent",
                        color: "#4B5563",
                        fontWeight: 500,
                      }
                }
              >
                {option === "monthly" ? "Monthly" : "Quarterly"}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
