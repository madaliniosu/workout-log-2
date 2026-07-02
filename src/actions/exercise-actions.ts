"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createExerciseSchema, exerciseTargetsSchema } from "@/lib/validations";
import { createCustomExercise, updateExerciseTargets, addExerciseToUser } from "@/db/queries/exercises";
import { getCurrentUserId } from "@/lib/current-user";

// Redirects to /activity, not /exercises/[id] — this is now triggered from
// the "Add exercise" modal on Activity, so closing it back onto the page it
// was opened from (with the new exercise now visible in the list) is the
// right result, not a detail-page navigation.
export async function createExerciseAction(formData: FormData) {
  const parsed = createExerciseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => issue.message).join(", "));
  }

  const userId = await getCurrentUserId();
  await createCustomExercise(userId, parsed.data);

  revalidatePath("/activity");
  redirect("/activity");
}

// Bound to a specific exerciseId via .bind(null, exercise.id) where the
// form is rendered — see the detail page in the next step.
export async function updateExerciseTargetsAction(exerciseId: string, formData: FormData) {
  const parsed = exerciseTargetsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => issue.message).join(", "));
  }

  await updateExerciseTargets(exerciseId, parsed.data);
  revalidatePath(`/exercises/${exerciseId}`);
}

// Triggered per-row from the "Add exercise from library" modal — each row
// is its own tiny form bound to that exercise's id.
export async function addExerciseToLibraryAction(exerciseId: string) {
  const userId = await getCurrentUserId();
  await addExerciseToUser(userId, exerciseId);

  revalidatePath("/activity");
}
