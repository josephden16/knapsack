"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { abbreviate } from "@/lib/format";
import { useGranularity } from "./GranularityContext";

// ── Types ──────────────────────────────────────────────────────────────────

export interface MonthlyPoint {
  month: string; // YYYY-MM
  value: number;
}

export interface QuarterlyPoint {
  quarter: string; // "Q1" | "Q2" | "Q3" | "Q4"
  value: number;
}

interface ChartPairProps {
  /** Metric name displayed in chart titles, e.g. "Reach (K)" or "GRPs". */
  metric: string;
  monthlyData: MonthlyPoint[];
  quarterlyData: QuarterlyPoint[];
  /** Funnel accent color — stroke for line chart, fill for bar chart. */
  color: string;
  /** Translucent fill color for the area beneath the line. */
  fillColor: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const MONTH_ABBRS = [
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

function monthAbbr(yyyyMM: string): string {
  const m = parseInt(yyyyMM.split("-")[1], 10);
  return MONTH_ABBRS[m - 1] ?? yyyyMM;
}

/** Custom dot for the AreaChart — renders on all points; adds a value label on the last one. */
function CustomMonthlyDot(props: {
  cx?: number;
  cy?: number;
  index?: number;
  value?: number;
  dataLength: number;
  color: string;
}) {
  const { cx = 0, cy = 0, index = 0, value = 0, dataLength, color } = props;
  const isLast = index === dataLength - 1;

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={color}
        stroke="#FFFFFF"
        strokeWidth={2}
      />
      {isLast && (
        <text
          x={cx}
          y={cy - 10}
          textAnchor="middle"
          fill="#0D1117"
          fontSize={12}
          fontWeight={600}
          style={{ fontFeatureSettings: '"tnum"' }}
        >
          {abbreviate(value)}
        </text>
      )}
    </g>
  );
}

/** Custom bar shape with rounded top corners only. */
function RoundedTopBar(props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
}) {
  const { x = 0, y = 0, width = 0, height = 0, fill = "#00B140" } = props;
  if (height <= 0) return null;
  const r = Math.min(4, height / 2);

  return (
    <path
      d={`
        M ${x},${y + height}
        L ${x},${y + r}
        Q ${x},${y} ${x + r},${y}
        L ${x + width - r},${y}
        Q ${x + width},${y} ${x + width},${y + r}
        L ${x + width},${y + height}
        Z
      `}
      fill={fill}
    />
  );
}

/** Custom label above bar. */
function BarValueLabel(props: {
  x?: number;
  y?: number;
  width?: number;
  value?: number;
}) {
  const { x = 0, y = 0, width = 0, value = 0 } = props;
  return (
    <text
      x={x + width / 2}
      y={y - 6}
      textAnchor="middle"
      fill="#0D1117"
      fontSize={12}
      fontWeight={600}
      style={{ fontFeatureSettings: '"tnum"' }}
    >
      {abbreviate(value)}
    </text>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function MonthlyAreaChart({
  data,
  color,
  fillColor,
}: {
  data: MonthlyPoint[];
  color: string;
  fillColor: string;
}) {
  const tickFormatter = (v: string) => monthAbbr(v);
  const yFormatter = (v: number) => abbreviate(v);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 24, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient
            id={`fill-${color.replace("#", "")}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor={fillColor} stopOpacity={1} />
            <stop offset="100%" stopColor={fillColor} stopOpacity={0.2} />
          </linearGradient>
        </defs>

        <CartesianGrid
          vertical={false}
          stroke="#F3F4F6"
          strokeDasharray="4 2"
        />

        <XAxis
          dataKey="month"
          tickFormatter={tickFormatter}
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
          dy={6}
        />
        <YAxis
          tickFormatter={yFormatter}
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
          width={40}
        />

        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#fill-${color.replace("#", "")})`}
          dot={(dotProps) => (
            <CustomMonthlyDot
              key={`dot-${dotProps.index}`}
              {...dotProps}
              dataLength={data.length}
              color={color}
            />
          )}
          activeDot={{ r: 6, fill: color, stroke: "#FFFFFF", strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function QuarterlyBarChart({
  data,
  color,
}: {
  data: QuarterlyPoint[];
  color: string;
}) {
  const yFormatter = (v: number) => abbreviate(v);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 28, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid
          vertical={false}
          stroke="#F3F4F6"
          strokeDasharray="4 2"
        />

        <XAxis
          dataKey="quarter"
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
          dy={6}
        />
        <YAxis
          tickFormatter={yFormatter}
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
          width={40}
        />

        <Bar
          dataKey="value"
          fill={color}
          shape={(shapeProps: {
            x?: number;
            y?: number;
            width?: number;
            height?: number;
          }) => <RoundedTopBar {...shapeProps} fill={color} />}
          label={(labelProps) => <BarValueLabel {...labelProps} />}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── ChartPair ──────────────────────────────────────────────────────────────

/**
 * Renders a white card with either the monthly area chart or the quarterly
 * bar chart, based on the GranularityContext value set by the page header toggle.
 *
 * Spec §7.2
 */
export function ChartPair({
  metric,
  monthlyData,
  quarterlyData,
  color,
  fillColor,
}: ChartPairProps) {
  const { granularity } = useGranularity();

  return (
    <div
      className="bg-white rounded-card-lg shadow-card"
      style={{ padding: "20px 24px" }}
    >
      <p className="text-[13px] font-semibold text-text-primary mb-3">
        {metric} · {granularity === "monthly" ? "Monthly" : "Quarterly"}
      </p>
      {granularity === "monthly" ? (
        <MonthlyAreaChart
          data={monthlyData}
          color={color}
          fillColor={fillColor}
        />
      ) : (
        <QuarterlyBarChart data={quarterlyData} color={color} />
      )}
    </div>
  );
}
