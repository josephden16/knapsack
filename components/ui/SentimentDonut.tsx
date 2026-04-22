"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from "recharts";

interface SentimentDonutProps {
  positive: number; // e.g. 68
  neutral: number; // e.g. 24
  negative: number; // e.g. 8
}

const COLORS = {
  Positive: "#00B140",
  Neutral: "#D1D5DB",
  Negative: "#F87171",
};

/**
 * Donut chart showing sentiment split across Positive / Neutral / Negative.
 * Used on the KOL / Influencer detail page.
 * Spec §7.7 / §6.7
 */
export function SentimentDonut({
  positive,
  neutral,
  negative,
}: SentimentDonutProps) {
  const data = [
    { name: "Positive", value: positive },
    { name: "Neutral", value: neutral },
    { name: "Negative", value: negative },
  ];

  return (
    <div className="bg-white rounded-card shadow-card p-5">
      <p className="text-[13px] font-semibold text-text-primary mb-2">
        Sentiment Split
      </p>

      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius="54%"
            outerRadius="80%"
            dataKey="value"
            paddingAngle={2}
            isAnimationActive={false}
            label={({ cx, cy, midAngle, outerRadius, value, name }) => {
              const RADIAN = Math.PI / 180;
              const radius = (outerRadius as number) + 18;
              const x = (cx as number) + radius * Math.cos(-midAngle * RADIAN);
              const y = (cy as number) + radius * Math.sin(-midAngle * RADIAN);
              return (
                <text
                  x={x}
                  y={y}
                  textAnchor={x > (cx as number) ? "start" : "end"}
                  dominantBaseline="central"
                  fill={COLORS[name as keyof typeof COLORS]}
                  fontSize={12}
                  fontWeight={600}
                >
                  {value}%
                </text>
              );
            }}
            labelLine={false}
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={COLORS[entry.name as keyof typeof COLORS]}
              />
            ))}
          </Pie>

          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            iconType="square"
            iconSize={10}
            formatter={(value) => (
              <span style={{ fontSize: 12, color: "#4B5563" }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
