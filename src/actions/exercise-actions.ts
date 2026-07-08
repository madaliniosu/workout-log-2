"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createExerciseSchema } from "@/lib/validations";
import {
    createCustomExercise,
    updateCustomExercise,
    updateExerciseTargets,
    deleteCustomExercise,
    archiveExercise,
    restoreExercise,
} from "@/db/queries/exercises";
import { getCurrentUserId } from "@/lib/current-user";

export async function createExerciseAction(formData: FormData) {
    const parsed = createExerciseSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
        throw new Error(
            parsed.error.issues.map((issue) => issue.message).join(", "),
        );
    }

    const userId = await getCurrentUserId();
    await createCustomExercise(userId, parsed.data);

    revalidatePath("/workouts");
    redirect("/workouts");
}


// Every exercise a user owns is a custom row now — no more library-bookmark
// distinction, so this is always the same delete path. The edit modal only
// offers Delete when nothing references the exercise; the FK translation in
// deleteCustomExercise is the safety net if a stale form submits anyway.
export async function removeExerciseAction(exerciseId: string) {
    const userId = await getCurrentUserId();
    await deleteCustomExercise(userId, exerciseId);
    revalidatePath("/workouts");
}

// Bound to a specific exerciseId via .bind(null, exercise.id) — same
// validation as create, since it's the exact same field set, just applied
// as an update instead of an insert.
export async function updateExerciseAction(
    exerciseId: string,
    formData: FormData,
) {
    const parsed = createExerciseSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
        throw new Error(
            parsed.error.issues.map((issue) => issue.message).join(", "),
        );
    }

    const userId = await getCurrentUserId();
    await updateCustomExercise(userId, exerciseId, parsed.data);

    revalidatePath("/workouts");
    redirect("/workouts");
}

export async function archiveExerciseAction(exerciseId: string) {
    const userId = await getCurrentUserId();
    await archiveExercise(userId, exerciseId);
    revalidatePath("/workouts");
}

export async function restoreExerciseAction(exerciseId: string) {
    const userId = await getCurrentUserId();
    await restoreExercise(userId, exerciseId);
    revalidatePath("/workouts");
}
