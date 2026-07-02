"use server";

import { redirect } from "next/navigation";
import { logSetRowSchema } from "@/lib/validations";
import { logSets, type LogSetInput } from "@/db/queries/sets";
import { getCurrentUserId } from "@/lib/current-user";

const SET_ROW_FIELDS = [
  "exerciseId",
  "setNumber",
  "plannedReps",
  "reps",
  "plannedWeightKg",
  "weightKg",
  "plannedDurationSeconds",
  "durationSeconds",
  "plannedDistanceMeters",
  "distanceMeters",
] as const;

// Every set row — regardless of which exercise it belongs to — renders one
// input per field, all sharing that field's name, so formData.getAll("reps")
// returns one value per row across the WHOLE save (every exercise's rows
// combined), in render order. Zipping the parallel arrays back together by
// index recovers each row intact, exerciseId included.
function parseSetRows(formData: FormData) {
  const columns = Object.fromEntries(
    SET_ROW_FIELDS.map((field) => [field, formData.getAll(field)])
  ) as Record<(typeof SET_ROW_FIELDS)[number], FormDataEntryValue[]>;

  const rowCount = columns.setNumber.length;

  return Array.from({ length: rowCount }, (_, i) =>
    logSetRowSchema.parse(
      Object.fromEntries(SET_ROW_FIELDS.map((field) => [field, columns[field][i]]))
    )
  );
}

// Buckets the flat row list by exerciseId — logSets() wants sets grouped
// per exercise, not one flat list, since it needs to know which exercise
// each set belongs to independent of the shared session_id/performed_at.
function groupByExercise(rows: ReturnType<typeof parseSetRows>) {
  const groups = new Map<string, LogSetInput[]>();
  for (const { exerciseId, ...set } of rows) {
    const existing = groups.get(exerciseId) ?? [];
    existing.push(set);
    groups.set(exerciseId, existing);
  }
  return Array.from(groups, ([exerciseId, sets]) => ({ exerciseId, sets }));
}

// Ad-hoc logging: no bound exerciseId anymore — every row already carries
// its own exerciseId (see SetRow), so this now works for one exercise or
// several without changing signature.
export async function logSetsAction(formData: FormData) {
  const rows = parseSetRows(formData);
  const userId = await getCurrentUserId();

  await logSets({ userId, workoutId: null, exerciseSets: groupByExercise(rows) });

  redirect("/");
}

// Workout-based logging: same row parsing, just workoutId is set instead
// of null. Bound to a specific workoutId via .bind(null, workout.id) where
// the form is rendered.
export async function logWorkoutSetsAction(workoutId: string, formData: FormData) {
  const rows = parseSetRows(formData);
  const userId = await getCurrentUserId();

  await logSets({ userId, workoutId, exerciseSets: groupByExercise(rows) });

  redirect("/");
}
