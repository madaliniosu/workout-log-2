"use client";

import type { ReactNode } from "react";
import { Modal } from "@/components/modal";
import { ExerciseForm, type ExerciseFormValues, type FilterOptions } from "@/components/exercise-form";
import { updateExerciseAction, removeExerciseAction, archiveExerciseAction } from "@/actions/exercise-actions";
import type { ExerciseUsage } from "@/db/queries/exercises";

export function EditExerciseModal({
  exerciseId,
  defaultValues,
  filterOptions,
  usage,
  trigger = "Edit",
  triggerClassName = "text-sm text-muted hover:text-foreground",
}: {
  exerciseId: string;
  defaultValues: ExerciseFormValues;
  filterOptions: FilterOptions;
  usage: ExerciseUsage;
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

        {/* Delete / Archive / blocked — decided by what references this
            exercise, shown upfront rather than failing after a click. */}
        <div className="border-t border-border pt-4">
          {usage.workoutNames.length > 0 ? (
            <p className="text-sm text-muted">
              Used in <span className="font-medium">{usage.workoutNames.join(", ")}</span> — remove it from{" "}
              {usage.workoutNames.length === 1 ? "that workout" : "those workouts"} to archive or delete it.
            </p>
          ) : usage.loggedSetCount > 0 ? (
            <form action={archiveExerciseAction.bind(null, exerciseId)} className="flex flex-col gap-2">
              <p className="text-sm text-muted">
                This exercise has {usage.loggedSetCount} logged set{usage.loggedSetCount === 1 ? "" : "s"}, so it
                can&apos;t be deleted. Archiving hides it from your lists — history stays in Analyze.
              </p>
              <button type="submit" className="self-start text-sm text-red-600 hover:underline">
                Archive exercise
              </button>
            </form>
          ) : (
            <form action={removeExerciseAction.bind(null, exerciseId)}>
              <button type="submit" className="text-sm text-red-600 hover:underline">
                Remove exercise
              </button>
            </form>
          )}
        </div>
      </div>
    </Modal>
  );
}
