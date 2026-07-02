import Link from "next/link";
import { getExerciseLibrary, getCustomExercises } from "@/db/queries/exercises";
import { getWorkouts } from "@/db/queries/workouts";
import { getCurrentUserId } from "@/lib/current-user";
import { ExerciseListBuilder } from "@/components/exercise-list-builder";

export default async function HomePage() {
  const userId = await getCurrentUserId();
  const [library, custom, workouts] = await Promise.all([
    getExerciseLibrary(),
    getCustomExercises(userId),
    getWorkouts(userId),
  ]);

  const exercises = [...custom, ...library]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((exercise) => ({ id: exercise.id, name: exercise.name }));

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Workout Log</h1>

      <section className="mt-6">
        <h2 className="text-lg font-medium">Log exercises</h2>
        <form action="/log" method="get" className="mt-2 flex flex-col gap-4">
          <ExerciseListBuilder exercises={exercises} countFieldName="sets" />

          <button type="submit" className="mt-2 border rounded px-3 py-2 self-start">
            Start logging
          </button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Or log a workout</h2>
        {workouts.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">
            No workouts yet.{" "}
            <Link href="/workouts/new" className="underline">
              Create one
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-2 divide-y">
            {workouts.map((workout) => (
              <li key={workout.id}>
                <Link href={`/log/workout/${workout.id}`} className="flex justify-between py-3 hover:underline">
                  <span>{workout.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
