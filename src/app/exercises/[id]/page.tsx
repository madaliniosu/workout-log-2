import { notFound } from "next/navigation";
import Link from "next/link";
import { getExerciseById } from "@/db/queries/exercises";
import { updateExerciseTargetsAction } from "@/actions/exercise-actions";

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
            <Link
                href="/exercises"
                className="text-sm text-zinc-500 hover:underline"
            >
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

                {exercise.secondaryMuscles &&
                    exercise.secondaryMuscles.length > 0 && (
                        <>
                            <dt className="text-zinc-500">Secondary muscles</dt>
                            <dd>{exercise.secondaryMuscles.join(", ")}</dd>
                        </>
                    )}
            </dl>

            <div className="mt-8">
                <h2 className="text-lg font-medium">Personal target</h2>
                <form
                    action={updateExerciseTargetsAction.bind(null, exercise.id)}
                    className="mt-2 flex flex-wrap gap-4"
                >
                    <label className="flex flex-col gap-1">
                        <span className="text-sm text-zinc-500">Reps</span>
                        <input
                            name="targetReps"
                            type="number"
                            min={0}
                            step={1}
                            defaultValue={exercise.targetReps ?? ""}
                            className="border rounded px-2 py-1 w-28"
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="text-sm text-zinc-500">
                            Weight (kg)
                        </span>
                        <input
                            name="targetWeightKg"
                            type="number"
                            min={0}
                            step="any"
                            defaultValue={exercise.targetWeightKg ?? ""}
                            className="border rounded px-2 py-1 w-28"
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="text-sm text-zinc-500">
                            Duration (s)
                        </span>
                        <input
                            name="targetDurationSeconds"
                            type="number"
                            min={0}
                            step={1}
                            defaultValue={exercise.targetDurationSeconds ?? ""}
                            className="border rounded px-2 py-1 w-28"
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="text-sm text-zinc-500">
                            Distance (m)
                        </span>
                        <input
                            name="targetDistanceMeters"
                            type="number"
                            min={0}
                            step="any"
                            defaultValue={exercise.targetDistanceMeters ?? ""}
                            className="border rounded px-2 py-1 w-28"
                        />
                    </label>

                    <button
                        type="submit"
                        className="self-end border rounded px-3 py-1 h-fit"
                    >
                        Save target
                    </button>
                </form>
            </div>

            {exercise.instructionSteps &&
                exercise.instructionSteps.length > 0 && (
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
