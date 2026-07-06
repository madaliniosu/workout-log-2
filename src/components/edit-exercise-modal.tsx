"use client";

import type { ReactNode } from "react";
import { Modal } from "@/components/modal";
import { ExerciseForm, type ExerciseFormValues, type FilterOptions } from "@/components/exercise-form";
import { updateExerciseAction, removeExerciseAction } from "@/actions/exercise-actions";

export function EditExerciseModal({
  exerciseId,
  defaultValues,
  filterOptions,
  trigger = "Edit",
  triggerClassName = "text-sm text-muted hover:text-foreground",
}: {
  exerciseId: string;
  defaultValues: ExerciseFormValues;
  filterOptions: FilterOptions;
  trigger?: ReactNode;
  triggerClassName?: string;
}) {
  return (
    <Modal trigger={trigger} triggerClassName={triggerClassName} title="Edit Exercise">
      <div className="flex flex-col gap-4">
        <ExerciseForm
          action={updateExerciseAction.bind(null, exerciseId)}
          filterOptions={filterOptions}
          defaultValues={defaultValues}
          submitLabel="Save changes"
        />

        <form action={removeExerciseAction.bind(null, exerciseId)} className="border-t border-border pt-4">
          <button type="submit" className="text-sm text-red-600 hover:underline">
            Remove exercise
          </button>
        </form>
      </div>
    </Modal>
  );
}
