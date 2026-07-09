"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export type ChartPoint = { label: string; value: number };

// Chart chrome: marks carry the series color; every piece of text stays in
// ink/muted tokens. Single-series charts get no legend — the card title
// names the series.
const SERIES = "var(--chart-series)";
const GRID = "var(--border)";
const AXIS = "var(--border)";
const MUTED = "var(--muted)";
function ChartTooltip({
  active,
  payload,
  unit,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{
    value?: string | number | ReadonlyArray<string | number>;
    payload?: { label?: string };
  }>;
  unit: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0];
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-sm">
      <p className="text-sm font-semibold text-text">
        {point.value} {unit}
      </p>
      <p className="text-xs text-muted">{point.payload?.label}</p>
    </div>
  );
}

export function ProgressChart({
  title,
  unit,
  data,
}: {
  title: string;
  unit: string;
  data: ChartPoint[];
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h4 className="font-heading text-sm font-semibold text-text">{title}</h4>
      <div className="mt-3">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis
              dataKey="label"
              tick={{ fill: MUTED, fontSize: 11 }}
              axisLine={{ stroke: AXIS }}
              tickLine={false}
              minTickGap={24}
            />
            <YAxis tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
            <Tooltip content={(props) => <ChartTooltip {...props} unit={unit} />} />
            {/* 2px line, 8px markers ringed in the surface color so dots
                stay legible where they sit on the line. */}
            <Line
              type="monotone"
              dataKey="value"
              stroke={SERIES}
              strokeWidth={2}
              strokeLinecap="round"
              dot={{ r: 4, fill: SERIES, stroke: "#ffffff", strokeWidth: 2 }}
              activeDot={{ r: 5, fill: SERIES, stroke: "#ffffff", strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
