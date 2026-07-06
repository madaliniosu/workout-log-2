"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createExerciseSchema, exerciseTargetsSchema } from "@/lib/validations";
import { createCustomExercise, updateCustomExercise, updateExerciseTargets, deleteCustomExercise } from "@/db/queries/exercises";
import { getCurrentUserId } from "@/lib/current-user";

// Redirects to /plan, not /exercises/[id] — this is now triggered from
// the "Add Exercise" modal on plan, so closing it back onto the page it
// was opened from (with the new exercise now visible in the list) is the
// right result, not a detail-page navigation. Also the submit path for
// "add from library" — same action, the form is just pre-filled from a
// library exercise's data instead of starting blank.
export async function createExerciseAction(formData: FormData) {
  const parsed = createExerciseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => issue.message).join(", "));
  }

  const userId = await getCurrentUserId();
  await createCustomExercise(userId, parsed.data);

  revalidatePath("/plan");
  redirect("/plan");
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

// Postgres foreign-key-violation code (23503). postgres.js can surface this
// either directly on the thrown error or nested under its `cause` — check
// both rather than assume one shape.
function isForeignKeyViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const code = "code" in error ? error.code : undefined;
  const cause = "cause" in error ? error.cause : undefined;
  const causeCode = typeof cause === "object" && cause !== null && "code" in cause ? cause.code : undefined;
  return code === "23503" || causeCode === "23503";
}

// Every exercise a user owns is a custom row now — no more library-bookmark
// distinction, so this is always the same delete path. Throws a readable
// message instead of a raw Postgres error when the exercise is still
// referenced by a workout or has logged sets (the RESTRICT foreign keys
// doing their job — this isn't a bug, it's the point of them).
export async function removeExerciseAction(exerciseId: string) {
  const userId = await getCurrentUserId();

  try {
    await deleteCustomExercise(userId, exerciseId);
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      throw new Error("Can't remove this exercise — it's used in a workout or has logged sets.");
    }
    throw error;
  }

  revalidatePath("/plan");
}


// Bound to a specific exerciseId via .bind(null, exercise.id) — same
// validation as create, since it's the exact same field set, just applied
// as an update instead of an insert.
export async function updateExerciseAction(exerciseId: string, formData: FormData) {
  const parsed = createExerciseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => issue.message).join(", "));
  }

  const userId = await getCurrentUserId();
  await updateCustomExercise(userId, exerciseId, parsed.data);

  revalidatePath("/plan");
  redirect("/plan");
}
