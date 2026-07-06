"use client";

import { Modal } from "@/components/modal";
import { ExerciseForm, type ExerciseFormValues, type FilterOptions } from "@/components/exercise-form";
import { updateExerciseAction } from "@/actions/exercise-actions";

export function EditExerciseModal({
  exerciseId,
  defaultValues,
  filterOptions,
}: {
  exerciseId: string;
  defaultValues: ExerciseFormValues;
  filterOptions: FilterOptions;
}) {
  return (
    <Modal triggerLabel="Edit" triggerClassName="text-sm text-muted hover:text-foreground" title="Edit Exercise">
      <ExerciseForm
        action={updateExerciseAction.bind(null, exerciseId)}
        filterOptions={filterOptions}
        defaultValues={defaultValues}
        submitLabel="Save changes"
      />
    </Modal>
  );
}
