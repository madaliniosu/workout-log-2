"use server";

import { redirect } from "next/navigation";
import { createWorkoutSchema, createWorkoutSlotSchema } from "@/lib/validations";
import { createWorkout } from "@/db/queries/workouts";
import { getCurrentUserId } from "@/lib/current-user";

// Same parallel-arrays pattern as parseSetRows in set-actions.ts: every
// exercise slot renders one exerciseId input and one targetSets input,
// sharing those names across slots, in slot order.
function parseSlots(formData: FormData) {
  const exerciseIds = formData.getAll("exerciseId");
  const targetSetsValues = formData.getAll("targetSets");

  return exerciseIds.map((_, i) =>
    createWorkoutSlotSchema.parse({
      exerciseId: exerciseIds[i],
      targetSets: targetSetsValues[i],
    })
  );
}

export async function createWorkoutAction(formData: FormData) {
  const { name, notes } = createWorkoutSchema.parse({
    name: formData.get("name"),
    notes: formData.get("notes"),
  });
  const slots = parseSlots(formData);
  const userId = await getCurrentUserId();

  const workout = await createWorkout({ userId, name, notes, exercises: slots });

  redirect(`/workouts/${workout.id}`);
}
