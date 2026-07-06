import { notFound } from "next/navigation";
import Link from "next/link";
import { getWorkoutById, getWorkoutExercises } from "@/db/queries/workouts";
import { logSetsAction } from "@/actions/set-actions";
import { SetRow } from "@/components/set-row";

export default async function LogWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workout = await getWorkoutById(id);

  if (!workout) {
    notFound();
  }

  const slots = await getWorkoutExercises(id);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← Back
      </Link>

      <h1 className="mt-4 text-2xl font-semibold">Log: {workout.name}</h1>

      <form action={logSetsAction} className="mt-6 flex flex-col gap-8">
        {slots.map((slot) => (
          <div key={slot.id}>
            <h2 className="text-lg font-medium">{slot.exercise.name}</h2>
            <div className="mt-2 flex flex-col gap-4">
              {Array.from({ length: slot.targetSets }, (_, i) => (
                <SetRow
                  key={i}
                  exerciseId={slot.exercise.id}
                  workoutId={workout.id}
                  setNumber={i + 1}
                  tracksReps={slot.exercise.tracksReps}
                  tracksWeight={slot.exercise.tracksWeight}
                  tracksDuration={slot.exercise.tracksDuration}
                  tracksDistance={slot.exercise.tracksDistance}
                  plannedReps={slot.exercise.targetReps}
                  plannedWeightKg={slot.exercise.targetWeightKg}
                  plannedDurationSeconds={slot.exercise.targetDurationSeconds}
                  plannedDistanceMeters={slot.exercise.targetDistanceMeters}
                />
              ))}
            </div>
          </div>
        ))}

        <button type="submit" className="border rounded px-3 py-2 self-start">
          Save
        </button>
      </form>
    </main>
  );
}
