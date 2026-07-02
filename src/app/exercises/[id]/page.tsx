import { notFound } from "next/navigation";
import Link from "next/link";
import { getExerciseById } from "@/db/queries/exercises";

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exercise = await getExerciseById(id);

  if (!exercise) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/exercises" className="text-sm text-zinc-500 hover:underline">
        ← Back to library
      </Link>

      <h1 className="mt-4 text-2xl font-semibold">{exercise.name}</h1>

      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <dt className="text-zinc-500">Category</dt>
        <dd>{exercise.category}</dd>

        <dt className="text-zinc-500">Equipment</dt>
        <dd>{exercise.equipment ?? "—"}</dd>

        <dt className="text-zinc-500">Muscle group</dt>
        <dd>{exercise.muscleGroup ?? "—"}</dd>

        <dt className="text-zinc-500">Target muscle</dt>
        <dd>{exercise.targetMuscle ?? "—"}</dd>

        {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
          <>
            <dt className="text-zinc-500">Secondary muscles</dt>
            <dd>{exercise.secondaryMuscles.join(", ")}</dd>
          </>
        )}
      </dl>

      {exercise.instructionSteps && exercise.instructionSteps.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-medium">Instructions</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
            {exercise.instructionSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </main>
  );
}
