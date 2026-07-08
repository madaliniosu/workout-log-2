export type SetMetrics = {
  reps: number | null;
  plannedReps: number | null;
  weightKg: number | null;
  plannedWeightKg: number | null;
  durationSeconds: number | null;
  plannedDurationSeconds: number | null;
  distanceMeters: number | null;
  plannedDistanceMeters: number | null;
};

export type TracksFlags = {
  tracksReps: boolean;
  tracksWeight: boolean;
  tracksDuration: boolean;
  tracksDistance: boolean;
};

// Renders one set as "8 reps (target 10) · 40 kg (target 42.5)" — only the
// metrics the exercise actually tracks, actual value first since that's
// what happened, target in parens for comparison.
export function formatSetMetrics(set: SetMetrics, tracks: TracksFlags): string {
  const parts: string[] = [];
  if (tracks.tracksReps) parts.push(formatMetric(set.reps, set.plannedReps, "reps"));
  if (tracks.tracksWeight) parts.push(formatMetric(set.weightKg, set.plannedWeightKg, "kg"));
  if (tracks.tracksDuration) parts.push(formatMetric(set.durationSeconds, set.plannedDurationSeconds, "s"));
  if (tracks.tracksDistance) parts.push(formatMetric(set.distanceMeters, set.plannedDistanceMeters, "m"));
  return parts.join(" · ");
}

function formatMetric(actual: number | null, planned: number | null, unit: string): string {
  const actualText = actual == null ? "—" : `${actual} ${unit}`;
  return planned == null ? actualText : `${actualText} (target ${planned})`;
}

// Date labels for logged data are produced server-side (the groupers in
// db/queries/sets.ts call these) so client components never format dates:
// browser-side formatting during hydration can disagree with the
// server-rendered HTML on locale/timezone and trigger hydration-mismatch
// warnings. Living here, the display format stays a presentation decision
// rather than a query-layer one.
export function formatSessionTimestamp(date: Date): string {
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function formatDateLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { dateStyle: "medium" });
}
