"use client";

import { useMemo, useState } from "react";
import type { ExerciseHistory, ExerciseHistoryEntry } from "@/db/queries/sets";
import { formatSetMetrics } from "@/lib/format-set";
import { ProgressChart, type ChartPoint } from "@/components/progress-chart";

// One row per training day: totals/maxima of the actual (not planned)
// values. Entries arrive oldest-first, so days come out in timeline order.
type DayAggregate = {
  label: string;
  maxWeightKg: number | null;
  volume: number | null; // Σ reps × weight, over sets where both were logged
  totalReps: number | null;
  totalDurationSeconds: number | null;
  totalDistanceMeters: number | null;
};

function aggregateByDay(entries: ExerciseHistoryEntry[]): DayAggregate[] {
  const days = new Map<string, DayAggregate>();

  for (const entry of entries) {
    let day = days.get(entry.performedAtLabel);
    if (!day) {
      day = {
        label: entry.performedAtLabel,
        maxWeightKg: null,
        volume: null,
        totalReps: null,
        totalDurationSeconds: null,
        totalDistanceMeters: null,
      };
      days.set(entry.performedAtLabel, day);
    }

    if (entry.weightKg != null) day.maxWeightKg = Math.max(day.maxWeightKg ?? 0, entry.weightKg);
    if (entry.reps != null && entry.weightKg != null) day.volume = (day.volume ?? 0) + entry.reps * entry.weightKg;
    if (entry.reps != null) day.totalReps = (day.totalReps ?? 0) + entry.reps;
    if (entry.durationSeconds != null) day.totalDurationSeconds = (day.totalDurationSeconds ?? 0) + entry.durationSeconds;
    if (entry.distanceMeters != null) day.totalDistanceMeters = (day.totalDistanceMeters ?? 0) + entry.distanceMeters;
  }

  return Array.from(days.values());
}

function toChartData(days: DayAggregate[], pick: (day: DayAggregate) => number | null): ChartPoint[] {
  return days.flatMap((day) => {
    const value = pick(day);
    return value == null ? [] : [{ label: day.label, value: Math.round(value * 100) / 100 }];
  });
}

export function ProgressExplorer({ histories }: { histories: ExerciseHistory[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(histories[0]?.exerciseId ?? null);
  const selected = histories.find((history) => history.exerciseId === selectedId) ?? histories[0] ?? null;
  const days = useMemo(() => (selected ? aggregateByDay(selected.entries) : []), [selected]);

  if (histories.length === 0 || selected === null) {
    return (
      <p className="text-sm text-muted">
        Log a few sets first — progress shows up here once an exercise has history.
      </p>
    );
  }

  const charts: { title: string; unit: string; data: ChartPoint[] }[] = [];
  if (selected.tracksWeight) {
    charts.push({ title: "Heaviest set", unit: "kg", data: toChartData(days, (d) => d.maxWeightKg) });
  }
  if (selected.tracksReps && selected.tracksWeight) {
    charts.push({ title: "Volume (reps × kg)", unit: "kg", data: toChartData(days, (d) => d.volume) });
  }
  if (selected.tracksReps) {
    charts.push({ title: "Total reps", unit: "reps", data: toChartData(days, (d) => d.totalReps) });
  }
  if (selected.tracksDuration) {
    charts.push({ title: "Total duration", unit: "s", data: toChartData(days, (d) => d.totalDurationSeconds) });
  }
  if (selected.tracksDistance) {
    charts.push({ title: "Total distance", unit: "m", data: toChartData(days, (d) => d.totalDistanceMeters) });
  }
  // A one-point line says nothing — a chart earns its spot at two days.
  const visibleCharts = charts.filter((chart) => chart.data.length >= 2);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
      <ul className="flex flex-col gap-1 sm:w-56 sm:shrink-0">
        {histories.map((history) => (
          <li key={history.exerciseId}>
            <button
              type="button"
              onClick={() => setSelectedId(history.exerciseId)}
              className={`w-full rounded-xl px-3 py-2 text-left text-sm ${
                history.exerciseId === selected.exerciseId
                  ? "bg-accent font-semibold text-text"
                  : "text-muted hover:bg-background"
              }`}
            >
              {history.exerciseName}
            </button>
          </li>
        ))}
      </ul>

      <div className="flex-1">
        <h3 className="font-heading text-lg font-semibold text-text">{selected.exerciseName}</h3>

        {visibleCharts.length > 0 ? (
          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            {visibleCharts.map((chart) => (
              <ProgressChart key={chart.title} title={chart.title} unit={chart.unit} data={chart.data} />
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted">
            Log this exercise on at least two days and trend charts will appear here.
          </p>
        )}

        <h4 className="mt-6 font-heading text-sm font-semibold text-text">Logged sets</h4>
        <ul className="mt-2 flex flex-col gap-1">
          {selected.entries.map((entry, i) => (
            <li key={i} className="text-sm text-muted">
              {entry.performedAtLabel} — Set {entry.setNumber}: {formatSetMetrics(entry, selected)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
