import { getExerciseLibrary, getCustomExercises } from "@/db/queries/exercises";
import { getCurrentUserId } from "@/lib/current-user";

export default async function HomePage() {
  const userId = await getCurrentUserId();
  const [library, custom] = await Promise.all([
    getExerciseLibrary(),
    getCustomExercises(userId),
  ]);

  const exercises = [...custom, ...library].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Workout Log</h1>

      <form action="/log" method="get" className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Exercise</span>
          <select name="exerciseId" required className="border rounded px-2 py-1">
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
                {exercise.userId ? " (custom)" : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Sets</span>
          <input name="sets" type="number" min={1} step={1} defaultValue={3} required className="border rounded px-2 py-1" />
        </label>

        <button type="submit" className="mt-2 border rounded px-3 py-2 self-start">
          Start logging
        </button>
      </form>
    </main>
  );
}
