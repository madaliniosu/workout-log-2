"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
    createWorkoutSchema,
    createWorkoutSlotSchema,
} from "@/lib/validations";
import {
    createWorkout,
    updateWorkout,
    deleteWorkout,
} from "@/db/queries/workouts";
import { getCurrentUserId } from "@/lib/current-user";
import { updateExerciseTargets } from "@/db/queries/exercises";



function parseSlots(formData: FormData) {
    const exerciseIds = formData.getAll("exerciseId");
    const targetSetsValues = formData.getAll("targetSets");
    const targetReps = formData.getAll("targetReps");
    const targetWeightKg = formData.getAll("targetWeightKg");
    const targetDurationSeconds = formData.getAll("targetDurationSeconds");
    const targetDistanceMeters = formData.getAll("targetDistanceMeters");

    return exerciseIds.map((_, i) =>
        createWorkoutSlotSchema.parse({
            exerciseId: exerciseIds[i],
            targetSets: targetSetsValues[i],
            targetReps: targetReps[i],
            targetWeightKg: targetWeightKg[i],
            targetDurationSeconds: targetDurationSeconds[i],
            targetDistanceMeters: targetDistanceMeters[i],
        }),
    );
}

// Targets live on the exercise itself, not the workout slot (see
// schema.ts: workout_exercises holds only sequence and count) — so target
// values entered in the workout builder update each exercise's own
// target_*, shared across every workout that includes it. Blank means
// clear (null), since the form always shows the current value for every
// tracked metric.
async function saveSlotTargets(slots: ReturnType<typeof parseSlots>) {
    await Promise.all(
        slots.map((slot) =>
            updateExerciseTargets(slot.exerciseId, {
                targetReps: slot.targetReps ?? null,
                targetWeightKg: slot.targetWeightKg ?? null,
                targetDurationSeconds: slot.targetDurationSeconds ?? null,
                targetDistanceMeters: slot.targetDistanceMeters ?? null,
            }),
        ),
    );
}

export async function createWorkoutAction(formData: FormData) {
    const { name, notes } = createWorkoutSchema.parse({
        name: formData.get("name"),
        notes: formData.get("notes"),
    });
    const slots = parseSlots(formData);
    const userId = await getCurrentUserId();

    await createWorkout({ userId, name, notes, exercises: slots });

    await saveSlotTargets(slots);

    revalidatePath("/workouts");
    redirect("/workouts");
}

// Same parsing/validation as createWorkoutAction — only the query call
// (update vs. insert) and redirect timing differ.
export async function updateWorkoutAction(
    workoutId: string,
    formData: FormData,
) {
    const { name, notes } = createWorkoutSchema.parse({
        name: formData.get("name"),
        notes: formData.get("notes"),
    });
    const slots = parseSlots(formData);
    const userId = await getCurrentUserId();

    await updateWorkout({ userId, workoutId, name, notes, exercises: slots });

     await saveSlotTargets(slots);

    revalidatePath("/workouts");
    redirect("/workouts");
}

export async function deleteWorkoutAction(workoutId: string) {
    const userId = await getCurrentUserId();
    await deleteWorkout(userId, workoutId);
    revalidatePath("/workouts");
}
