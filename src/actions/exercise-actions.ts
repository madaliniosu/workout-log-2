"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createExerciseSchema, exerciseTargetsSchema } from "@/lib/validations";
import { createCustomExercise, updateExerciseTargets } from "@/db/queries/exercises";
import { getCurrentUserId } from "@/lib/current-user";

export async function createExerciseAction(formData: FormData) {
  const parsed = createExerciseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => issue.message).join(", "));
  }

  const userId = await getCurrentUserId();
  const exercise = await createCustomExercise(userId, parsed.data);

  revalidatePath("/exercises");
  redirect(`/exercises/${exercise.id}`);
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
