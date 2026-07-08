"use client";

import { Modal } from "@/components/modal";
import { WorkoutForm, type ExerciseOption, type WorkoutFormValues } from "@/components/workout-form";
import { updateWorkoutAction } from "@/actions/workout-actions";

export function EditWorkoutModal({
  workoutId,
  exercises,
  defaultValues,
}: {
  workoutId: string;
  exercises: ExerciseOption[];
  defaultValues: WorkoutFormValues;
}) {
  return (
    <Modal trigger="Edit" triggerClassName="text-sm text-muted hover:text-text" title="Edit Workout">
      <WorkoutForm
        action={updateWorkoutAction.bind(null, workoutId)}
        exercises={exercises}
        defaultValues={defaultValues}
        submitLabel="Save changes"
      />
    </Modal>
  );
}
