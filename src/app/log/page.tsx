import { notFound } from "next/navigation";
import Link from "next/link";
import { getExerciseById } from "@/db/queries/exercises";
import { logSetsAction } from "@/actions/set-actions";
import { SetRow } from "@/components/set-row";

export default async function LogPage({
  searchParams,
}: {
  searchParams: Promise<{ exerciseId?: string; sets?: string }>;
}) {
  const { exerciseId, sets } = await searchParams;
  const setCount = Number(sets);

  if (!exerciseId || !Number.isInteger(setCount) || setCount < 1) {
    notFound();
  }

  const exercise = await getExerciseById(exerciseId);
  if (!exercise) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← Back
      </Link>

      <h1 className="mt-4 text-2xl font-semibold">Log: {exercise.name}</h1>
      <p className="mt-1 text-sm text-zinc-500">{setCount} sets</p>

      <form action={logSetsAction.bind(null, exercise.id)} className="mt-6 flex flex-col gap-4">
        {Array.from({ length: setCount }, (_, i) => (
          <SetRow
            key={i}
            setNumber={i + 1}
            plannedReps={exercise.targetReps}
            plannedWeightKg={exercise.targetWeightKg}
            plannedDurationSeconds={exercise.targetDurationSeconds}
            plannedDistanceMeters={exercise.targetDistanceMeters}
          />
        ))}

        <button type="submit" className="mt-2 border rounded px-3 py-2 self-start">
          Save
        </button>
      </form>
    </main>
  );
}
