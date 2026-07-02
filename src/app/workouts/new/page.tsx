import { getExerciseLibrary, getCustomExercises } from "@/db/queries/exercises";
import { getCurrentUserId } from "@/lib/current-user";
import { createWorkoutAction } from "@/actions/workout-actions";
import { WorkoutExerciseBuilder } from "@/components/workout-exercise-builder";

export default async function NewWorkoutPage() {
  const userId = await getCurrentUserId();
  const [library, custom] = await Promise.all([
    getExerciseLibrary(),
    getCustomExercises(userId),
  ]);
  const exercises = [...custom, ...library]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((exercise) => ({ id: exercise.id, name: exercise.name }));

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold">New workout</h1>

      <form action={createWorkoutAction} className="mt-6 flex flex-col gap-6">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Name</span>
          <input name="name" required className="border rounded px-2 py-1" />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Notes</span>
          <textarea name="notes" rows={3} className="border rounded px-2 py-1" />
        </label>

        <WorkoutExerciseBuilder exercises={exercises} />

        <button type="submit" className="mt-2 border rounded px-3 py-2 self-start">
          Create workout
        </button>
      </form>
    </main>
  );
}
