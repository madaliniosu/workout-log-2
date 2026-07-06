import { notFound } from "next/navigation";
import Link from "next/link";
import { getExerciseById } from "@/db/queries/exercises";
import { logSetsAction } from "@/actions/set-actions";
import { SetRow } from "@/components/set-row";

// searchParams gives a plain string when a key appears once, and a string[]
// when it appears more than once — normalize both to an array so exerciseId
// and sets can always be paired up by index regardless of how many exercises
// were picked.
function toArray(value: string | string[] | undefined): string[] {
    if (value === undefined) return [];
    return Array.isArray(value) ? value : [value];
}

export default async function LogPage({
    searchParams,
}: {
    searchParams: Promise<{
        exerciseId?: string | string[];
        sets?: string | string[];
    }>;
}) {
    const params = await searchParams;
    const exerciseIds = toArray(params.exerciseId);
    const setCounts = toArray(params.sets).map(Number);

    if (
        exerciseIds.length === 0 ||
        exerciseIds.length !== setCounts.length ||
        setCounts.some((count) => !Number.isInteger(count) || count < 1)
    ) {
        notFound();
    }

    const maybeExercises = await Promise.all(
        exerciseIds.map((id) => getExerciseById(id)),
    );
    const exercises: NonNullable<(typeof maybeExercises)[number]>[] = [];
    for (const exercise of maybeExercises) {
        if (!exercise) notFound();
        exercises.push(exercise);
    }

    return (
        <main className="mx-auto max-w-2xl px-6 py-12">
            <Link href="/" className="text-sm text-zinc-500 hover:underline">
                ← Back
            </Link>

            <h1 className="mt-4 text-2xl font-semibold">Log sets</h1>

            <form action={logSetsAction} className="mt-6 flex flex-col gap-8">
                {exercises.map((exercise, exerciseIndex) => (
                    <div key={exercise.id}>
                        <h2 className="text-lg font-medium">{exercise.name}</h2>
                        <div className="mt-2 flex flex-col gap-4">
                            {Array.from(
                                { length: setCounts[exerciseIndex] },
                                (_, i) => (
                                    <SetRow
                                        key={i}
                                        exerciseId={exercise.id}
                                        setNumber={i + 1}
                                        tracksReps={exercise.tracksReps}
                                        tracksWeight={exercise.tracksWeight}
                                        tracksDuration={exercise.tracksDuration}
                                        tracksDistance={exercise.tracksDistance}
                                        plannedReps={exercise.targetReps}
                                        plannedWeightKg={
                                            exercise.targetWeightKg
                                        }
                                        plannedDurationSeconds={
                                            exercise.targetDurationSeconds
                                        }
                                        plannedDistanceMeters={
                                            exercise.targetDistanceMeters
                                        }
                                    />
                                ),
                            )}
                        </div>
                    </div>
                ))}

                <button
                    type="submit"
                    className="border rounded px-3 py-2 self-start"
                >
                    Save
                </button>
            </form>
        </main>
    );
}
