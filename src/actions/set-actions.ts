"use server";

import { redirect } from "next/navigation";
import { logSetRowSchema } from "@/lib/validations";
import { logSets } from "@/db/queries/sets";
import { getCurrentUserId } from "@/lib/current-user";

const SET_ROW_FIELDS = [
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

// Set rows arrive as parallel arrays: every row renders one input per field,
// all sharing that field's name, so formData.getAll("reps") returns one
// value per row — in the same order the rows were rendered in. The set-rows
// UI (next step) must render every row's inputs in this same field order.
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

// Bound to a specific exerciseId via .bind(null, exerciseId) where the form
// is rendered — same pattern as updateExerciseTargetsAction.
export async function logSetsAction(exerciseId: string, formData: FormData) {
  const rows = parseSetRows(formData);
  const userId = await getCurrentUserId();

  await logSets({ userId, exerciseId, workoutId: null, sets: rows });

  redirect("/");
}
