"use server";

import { redirect } from "next/navigation";
import { logSetRowSchema } from "@/lib/validations";
import { logSets, type LogSetInput } from "@/db/queries/sets";
import { getCurrentUserId } from "@/lib/current-user";

const SET_ROW_FIELDS = [
  "exerciseId",
  "workoutId",
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
// index recovers each row intact, exerciseId and workoutId included.
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

// Buckets the flat row list by (exerciseId, workoutId) — logSets() wants
// sets grouped per exercise-entry, not one flat list. Grouping on the pair
// (not just exerciseId) keeps an ad-hoc add of an exercise separate from
// that same exercise arriving as part of a workout, in case both end up in
// one save.
function groupByExercise(rows: ReturnType<typeof parseSetRows>) {
  const groups = new Map<string, { exerciseId: string; workoutId: string | null; sets: LogSetInput[] }>();
  for (const { exerciseId, workoutId, ...set } of rows) {
    const key = `${exerciseId}::${workoutId ?? ""}`;
    const existing = groups.get(key);
    if (existing) {
      existing.sets.push(set);
    } else {
      groups.set(key, { exerciseId, workoutId, sets: [set] });
    }
  }
  return Array.from(groups.values());
}

export async function logSetsAction(formData: FormData) {
  const rows = parseSetRows(formData);
  const userId = await getCurrentUserId();

  await logSets({ userId, exerciseSets: groupByExercise(rows) });

  redirect("/log");
}
