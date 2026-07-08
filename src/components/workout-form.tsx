"use client";

import { ExerciseListBuilder, type ExerciseOption, type InitialCard } from "@/components/exercise-list-builder";
export type { ExerciseOption } from "@/components/exercise-list-builder";

export type WorkoutFormValues = {
  name: string;
  notes: string | null;
  exercises: InitialCard[];
};

// Shared by both the create-workout flow (blank) and the edit-workout flow
// (pre-filled from an existing workout's current name/notes/exercises).
// Only the action, defaultValues, and submitLabel differ between callers.
export function WorkoutForm({
  action,
  exercises,
  defaultValues,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  exercises: ExerciseOption[];
  defaultValues?: WorkoutFormValues | null;
  submitLabel: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-6">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Name</span>
        <input
          name="name"
          required
          defaultValue={defaultValues?.name ?? ""}
          className="rounded-lg border border-border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Notes</span>
        <textarea
          name="notes"
          rows={3}
          defaultValue={defaultValues?.notes ?? ""}
          className="rounded-lg border border-border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </label>

      <ExerciseListBuilder countFieldName="targetSets" exercises={exercises} initialCards={defaultValues?.exercises} />

      <button
        type="submit"
        className="mt-2 self-end rounded-xl bg-accent px-4 py-2 font-heading text-sm font-semibold text-foreground"
      >
        {submitLabel}
      </button>
    </form>
  );
}
