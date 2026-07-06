"use client";

import { Modal } from "@/components/modal";
import { WorkoutForm, type ExerciseOption } from "@/components/workout-form";
import { createWorkoutAction } from "@/actions/workout-actions";

// Deliberately only offered exercises the user has already added (their
// Activity list), not the full 1,324-row library — a workout should be
// built from things you've chosen to track, not the raw dataset.
export function NewWorkoutModal({ exercises }: { exercises: ExerciseOption[] }) {
  return (
    <Modal triggerLabel="+ New workout" triggerClassName="text-sm underline" title="New Workout">
      <WorkoutForm action={createWorkoutAction} exercises={exercises} submitLabel="Create workout" />
    </Modal>
  );
}
