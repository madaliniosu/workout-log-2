import Link from "next/link";
import { getExerciseFilterOptions, getExerciseLibrary, getCustomExercises } from "@/db/queries/exercises";
import { getRecentlyLoggedExerciseIds } from "@/db/queries/sets";
import { getWorkouts } from "@/db/queries/workouts";
import { getCurrentUserId } from "@/lib/current-user";
import { removeExerciseAction } from "@/actions/exercise-actions";
import { AddExerciseModal } from "@/components/add-exercise-modal";
import { EditExerciseModal } from "@/components/edit-exercise-modal";

export default async function ActivityPage() {
  const userId = await getCurrentUserId();

  const [userExercises, library, filterOptions, workouts, recentExerciseIds] = await Promise.all([
    getCustomExercises(userId),
    getExerciseLibrary(),
    getExerciseFilterOptions(),
    getWorkouts(userId),
    getRecentlyLoggedExerciseIds(userId, 5),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Activity</h1>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Exercises</h2>
          <AddExerciseModal
            exercises={library.map((exercise) => ({
              id: exercise.id,
              name: exercise.name,
              category: exercise.category,
              equipment: exercise.equipment,
              muscleGroup: exercise.muscleGroup,
              targetMuscle: exercise.targetMuscle,
              instructions: exercise.instructions,
              tracksReps: exercise.tracksReps,
              tracksWeight: exercise.tracksWeight,
              tracksDuration: exercise.tracksDuration,
              tracksDistance: exercise.tracksDistance,
            }))}
            recentExerciseIds={recentExerciseIds}
            filterOptions={filterOptions}
          />
        </div>

        <p className="mt-4 text-sm text-zinc-500">
          {userExercises.length} exercise{userExercises.length === 1 ? "" : "s"}
        </p>

        <ul className="mt-2 divide-y">
          {userExercises.map((exercise) => (
            <li key={exercise.id} className="flex items-center justify-between py-3">
              <Link href={`/exercises/${exercise.id}`} className="flex flex-1 justify-between hover:underline">
                <span>{exercise.name}</span>
                <span className="text-zinc-500">{exercise.category}</span>
              </Link>
              <div className="ml-4 flex items-center gap-3">
                <EditExerciseModal
                  exerciseId={exercise.id}
                  defaultValues={{
                    name: exercise.name,
                    category: exercise.category,
                    equipment: exercise.equipment,
                    muscleGroup: exercise.muscleGroup,
                    targetMuscle: exercise.targetMuscle,
                    instructions: exercise.instructions,
                    tracksReps: exercise.tracksReps,
                    tracksWeight: exercise.tracksWeight,
                    tracksDuration: exercise.tracksDuration,
                    tracksDistance: exercise.tracksDistance,
                  }}
                  filterOptions={filterOptions}
                />
                <form action={removeExerciseAction.bind(null, exercise.id)}>
                  <button type="submit" className="text-sm text-red-600 hover:underline">
                    Remove
                  </button>
                </form>
              </div>
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
