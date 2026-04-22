"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

export interface HBarItem {
  label: string;
  value: number;
}

interface HorizontalBarChartProps {
  title: string;
  data: HBarItem[];
  /** Bar fill color. Defaults to OPay green. */
  color?: string;
}

/**
 * Horizontal bar chart used for "GRP by Broadcast Channel".
 * Renders Recharts BarChart with layout="vertical".
 * Bar values are labeled at the end of each bar.
 * Spec §7.9 / §6.6
 */
export function HorizontalBarChart({
  title,
  data,
  color = "#00B140",
}: HorizontalBarChartProps) {
  const chartHeight = Math.max(data.length * 48, 120);

  return (
    <div
      className="bg-white rounded-card-lg shadow-card"
      style={{ padding: "20px 24px" }}
    >
      <p className="text-[13px] font-semibold text-text-primary mb-4">
        {title}
      </p>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 0, right: 48, bottom: 0, left: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="label"
            width={100}
            tick={{ fontSize: 13, fill: "#4B5563" }}
            axisLine={false}
            tickLine={false}
          />

          <Bar
            dataKey="value"
            fill={color}
            radius={[0, 4, 4, 0]}
            isAnimationActive={false}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={color} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              style={{
                fontSize: 12,
                fontWeight: 600,
                fill: "#0D1117",
                fontFeatureSettings: '"tnum"',
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
