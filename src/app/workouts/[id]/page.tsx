import { notFound } from "next/navigation";
import Link from "next/link";
import { getWorkoutById, getWorkoutExercises } from "@/db/queries/workouts";

export default async function WorkoutDetailPage({
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
      <Link href="/activity" className="text-sm text-zinc-500 hover:underline">
        ← Back to activity
      </Link>

      <h1 className="mt-4 text-2xl font-semibold">{workout.name}</h1>
      {workout.notes && <p className="mt-1 text-sm text-zinc-500">{workout.notes}</p>}

      <Link
        href={`/log/workout/${workout.id}`}
        className="mt-4 inline-block border rounded px-3 py-2 text-sm"
      >
        Log this workout
      </Link>

      <ol className="mt-6 divide-y">
        {slots.map((slot) => (
          <li key={slot.id} className="flex justify-between py-3">
            <span>{slot.exercise.name}</span>
            <span className="text-zinc-500">{slot.targetSets} sets</span>
          </li>
        ))}
      </ol>
    </main>
  );
}
