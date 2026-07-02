"use client";

import { Modal } from "@/components/modal";
import { createExerciseAction } from "@/actions/exercise-actions";

export function AddCustomExerciseModal() {
  return (
    <Modal triggerLabel="Add exercise" triggerClassName="text-sm underline" title="Add exercise">
      {() => (
        <form action={createExerciseAction} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Name</span>
            <input name="name" required className="rounded-lg border border-border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Category</span>
            <input name="category" required className="rounded-lg border border-border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Equipment</span>
            <input name="equipment" className="rounded-lg border border-border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Muscle group</span>
            <input name="muscleGroup" className="rounded-lg border border-border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Target muscle</span>
            <input name="targetMuscle" className="rounded-lg border border-border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Instructions</span>
            <textarea name="instructions" rows={3} className="rounded-lg border border-border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent" />
          </label>

          <fieldset className="flex flex-col gap-4 rounded-xl border border-border p-4">
            <legend className="px-1 text-sm font-medium">Personal target (optional)</legend>

            <label className="flex flex-col gap-1">
              <span className="text-sm">Reps</span>
              <input name="targetReps" type="number" min={0} step={1} className="rounded-lg border border-border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent" />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm">Weight (kg)</span>
              <input name="targetWeightKg" type="number" min={0} step="any" className="rounded-lg border border-border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent" />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm">Duration (seconds)</span>
              <input name="targetDurationSeconds" type="number" min={0} step={1} className="rounded-lg border border-border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent" />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm">Distance (meters)</span>
              <input name="targetDistanceMeters" type="number" min={0} step="any" className="rounded-lg border border-border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent" />
            </label>
          </fieldset>

          <button type="submit" className="mt-2 self-start rounded-xl bg-accent px-4 py-2 font-heading text-sm font-semibold text-foreground">
            Create exercise
          </button>
        </form>
      )}
    </Modal>
  );
}
