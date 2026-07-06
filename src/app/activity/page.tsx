import Link from "next/link";
import { getExerciseFilterOptions, getExerciseLibrary, getUserExercises } from "@/db/queries/exercises";
import { getWorkouts } from "@/db/queries/workouts";
import { getCurrentUserId } from "@/lib/current-user";
import { AddCustomExerciseModal } from "@/components/add-custom-exercise-modal";
import { AddFromLibraryModal } from "@/components/add-from-library-modal";

export default async function ActivityPage() {
  const userId = await getCurrentUserId();

  const [userExercises, library, filterOptions, workouts] = await Promise.all([
    getUserExercises(userId),
    getExerciseLibrary(),
    getExerciseFilterOptions(),
    getWorkouts(userId),
  ]);

  // Library exercises the user has already added carry userId: null (they're
  // still library rows, just referenced via userExercises) — custom ones
  // carry the user's own id. This distinguishes them without a second query.
  const alreadyAddedIds = userExercises.filter((exercise) => exercise.userId === null).map((exercise) => exercise.id);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Activity</h1>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Exercises</h2>
          <div className="flex gap-4">
            <AddCustomExerciseModal filterOptions={filterOptions} />
            <AddFromLibraryModal
              exercises={library.map((exercise) => ({
                id: exercise.id,
                name: exercise.name,
                category: exercise.category,
                equipment: exercise.equipment,
                targetMuscle: exercise.targetMuscle,
              }))}
              alreadyAddedIds={alreadyAddedIds}
              filterOptions={filterOptions}
            />
          </div>
        </div>

        <p className="mt-4 text-sm text-zinc-500">
          {userExercises.length} exercise{userExercises.length === 1 ? "" : "s"}
        </p>

        <ul className="mt-2 divide-y">
          {userExercises.map((exercise) => (
            <li key={exercise.id}>
              <Link href={`/exercises/${exercise.id}`} className="flex justify-between py-3 hover:underline">
                <span>{exercise.name}</span>
                <span className="text-zinc-500">{exercise.category}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Workouts</h2>
          <Link href="/workouts/new" className="text-sm underline">
            + New workout
          </Link>
        </div>

        <ul className="mt-4 divide-y">
          {workouts.map((workout) => (
            <li key={workout.id}>
              <Link href={`/workouts/${workout.id}`} className="block py-3 hover:underline">
                {workout.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
