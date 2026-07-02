import { createExerciseAction } from "@/actions/exercise-actions";

export default function NewExercisePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold">New custom exercise</h1>

      <form action={createExerciseAction} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Name</span>
          <input name="name" required className="border rounded px-2 py-1" />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Category</span>
          <input name="category" required className="border rounded px-2 py-1" />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Equipment</span>
          <input name="equipment" className="border rounded px-2 py-1" />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Muscle group</span>
          <input name="muscleGroup" className="border rounded px-2 py-1" />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Target muscle</span>
          <input name="targetMuscle" className="border rounded px-2 py-1" />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Instructions</span>
          <textarea name="instructions" rows={4} className="border rounded px-2 py-1" />
        </label>

        <fieldset className="mt-2 flex flex-col gap-4 border rounded p-4">
          <legend className="px-1 text-sm font-medium">Personal target (optional)</legend>

          <label className="flex flex-col gap-1">
            <span className="text-sm">Reps</span>
            <input name="targetReps" type="number" min={0} step={1} className="border rounded px-2 py-1" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm">Weight (kg)</span>
            <input name="targetWeightKg" type="number" min={0} step="any" className="border rounded px-2 py-1" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm">Duration (seconds)</span>
            <input name="targetDurationSeconds" type="number" min={0} step={1} className="border rounded px-2 py-1" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm">Distance (meters)</span>
            <input name="targetDistanceMeters" type="number" min={0} step="any" className="border rounded px-2 py-1" />
          </label>
        </fieldset>

        <button type="submit" className="mt-2 border rounded px-3 py-2 self-start">
          Create exercise
        </button>
      </form>
    </main>
  );
}
