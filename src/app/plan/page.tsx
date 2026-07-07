import Link from "next/link";
import {
    getExerciseFilterOptions,
    getExerciseLibrary,
    getCustomExercises,
    getArchivedExercises,
    getExerciseUsage,
} from "@/db/queries/exercises";
import { getRecentlyLoggedExerciseIds } from "@/db/queries/sets";
import { getCurrentUserId } from "@/lib/current-user";
import { NewExerciseModal } from "@/components/new-exercise-modal";
import { EditExerciseModal } from "@/components/edit-exercise-modal";
import { Tabs } from "@/components/tabs";
import { getWorkoutsWithSlots } from "@/db/queries/workouts";
import { deleteWorkoutAction } from "@/actions/workout-actions";
import { NewWorkoutModal } from "@/components/new-workout-modal";
import { EditWorkoutModal } from "@/components/edit-workout-modal";
import { restoreExerciseAction } from "@/actions/exercise-actions";

export default async function PlanPage() {
    const userId = await getCurrentUserId();

    const [
        userExercises,
        library,
        filterOptions,
        workoutsWithSlots,
        recentExerciseIds,
        archivedExercises,
        exerciseUsage,
    ] = await Promise.all([
        getCustomExercises(userId),
        getExerciseLibrary(),
        getExerciseFilterOptions(),
        getWorkoutsWithSlots(userId),
        getRecentlyLoggedExerciseIds(userId, 5),
        getArchivedExercises(userId),
        getExerciseUsage(userId),
    ]);

    return (
        <main className="mx-auto max-w-3xl px-6 py-12">
            <div className="mt-8">
                <Tabs
                    tabs={[
                        {
                            label: "Exercises",
                            content: (
                                <div>
                                    <div className="flex items-center justify-end">
                                        <NewExerciseModal
                                            exercises={library.map(
                                                (exercise) => ({
                                                    id: exercise.id,
                                                    name: exercise.name,
                                                    category: exercise.category,
                                                    equipment:
                                                        exercise.equipment,
                                                    muscleGroup:
                                                        exercise.muscleGroup,
                                                    targetMuscle:
                                                        exercise.targetMuscle,
                                                    instructions:
                                                        exercise.instructions,
                                                    tracksReps:
                                                        exercise.tracksReps,
                                                    tracksWeight:
                                                        exercise.tracksWeight,
                                                    tracksDuration:
                                                        exercise.tracksDuration,
                                                    tracksDistance:
                                                        exercise.tracksDistance,
                                                }),
                                            )}
                                            recentExerciseIds={
                                                recentExerciseIds
                                            }
                                            filterOptions={filterOptions}
                                        />
                                    </div>

                                    <p className="mt-4 text-sm text-zinc-500">
                                        {userExercises.length} exercise
                                        {userExercises.length === 1 ? "" : "s"}
                                    </p>

                                    <ul className="mt-2 divide-y">
                                        {userExercises.map((exercise) => (
                                            <li
                                                key={exercise.id}
                                                className="flex items-center justify-between py-3"
                                            >
                                                <EditExerciseModal
                                                    exerciseId={exercise.id}
                                                    defaultValues={{
                                                        name: exercise.name,
                                                        category:
                                                            exercise.category,
                                                        equipment:
                                                            exercise.equipment,
                                                        muscleGroup:
                                                            exercise.muscleGroup,
                                                        targetMuscle:
                                                            exercise.targetMuscle,
                                                        instructions:
                                                            exercise.instructions,
                                                        tracksReps:
                                                            exercise.tracksReps,
                                                        tracksWeight:
                                                            exercise.tracksWeight,
                                                        tracksDuration:
                                                            exercise.tracksDuration,
                                                        tracksDistance:
                                                            exercise.tracksDistance,
                                                    }}
                                                    filterOptions={
                                                        filterOptions
                                                    }
                                                    usage={
                                                        exerciseUsage[
                                                            exercise.id
                                                        ] ?? {
                                                            workoutNames: [],
                                                            loggedSetCount: 0,
                                                        }
                                                    }
                                                    trigger={
                                                        <span className="flex flex-1 justify-between hover:underline">
                                                            <span>
                                                                {exercise.name}
                                                            </span>
                                                            <span className="text-zinc-500">
                                                                {
                                                                    exercise.category
                                                                }
                                                            </span>
                                                        </span>
                                                    }
                                                    triggerClassName="flex flex-1 text-left"
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                    {archivedExercises.length > 0 && (
                                        <details className="mt-6">
                                            <summary className="cursor-pointer text-sm text-muted">
                                                Archived (
                                                {archivedExercises.length})
                                            </summary>
                                            <ul className="mt-2 divide-y">
                                                {archivedExercises.map(
                                                    (exercise) => (
                                                        <li
                                                            key={exercise.id}
                                                            className="flex items-center justify-between py-3"
                                                        >
                                                            <span className="text-muted">
                                                                {exercise.name}
                                                            </span>
                                                            <form
                                                                action={restoreExerciseAction.bind(
                                                                    null,
                                                                    exercise.id,
                                                                )}
                                                            >
                                                                <button
                                                                    type="submit"
                                                                    className="text-sm underline"
                                                                >
                                                                    Restore
                                                                </button>
                                                            </form>
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </details>
                                    )}
                                </div>
                            ),
                        },
                        {
                            label: "Workouts",
                            content: (
                                <div>
                                    <div className="flex items-center justify-end">
                                        <NewWorkoutModal
                                            exercises={userExercises.map(
                                                (exercise) => ({
                                                    id: exercise.id,
                                                    name: exercise.name,
                                                }),
                                            )}
                                        />
                                    </div>

                                    <ul className="mt-4 flex flex-col gap-4">
                                        {workoutsWithSlots.map((workout) => (
                                            <li
                                                key={workout.id}
                                                className="rounded-xl border border-border bg-white p-4"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-heading text-base font-semibold text-foreground">
                                                            {workout.name}
                                                        </h3>
                                                        {workout.notes && (
                                                            <p className="text-sm text-muted">
                                                                {workout.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Link
                                                            href={`/log/${workout.id}`}
                                                            className="text-sm underline"
                                                        >
                                                            Log
                                                        </Link>
                                                        <EditWorkoutModal
                                                            workoutId={
                                                                workout.id
                                                            }
                                                            exercises={userExercises.map(
                                                                (exercise) => ({
                                                                    id: exercise.id,
                                                                    name: exercise.name,
                                                                }),
                                                            )}
                                                            defaultValues={{
                                                                name: workout.name,
                                                                notes: workout.notes,
                                                                exercises:
                                                                    workout.slots.map(
                                                                        (
                                                                            slot,
                                                                        ) => ({
                                                                            exerciseId:
                                                                                slot
                                                                                    .exercise
                                                                                    .id,
                                                                            exerciseName:
                                                                                slot
                                                                                    .exercise
                                                                                    .name,
                                                                            count: slot.targetSets,
                                                                        }),
                                                                    ),
                                                            }}
                                                        />
                                                        <form
                                                            action={deleteWorkoutAction.bind(
                                                                null,
                                                                workout.id,
                                                            )}
                                                        >
                                                            <button
                                                                type="submit"
                                                                className="text-sm text-red-600 hover:underline"
                                                            >
                                                                Delete
                                                            </button>
                                                        </form>
                                                    </div>
                                                </div>

                                                <ul className="mt-3 divide-y divide-border">
                                                    {workout.slots.map(
                                                        (slot) => (
                                                            <li
                                                                key={slot.id}
                                                                className="flex justify-between py-2 text-sm"
                                                            >
                                                                <span>
                                                                    {
                                                                        slot
                                                                            .exercise
                                                                            .name
                                                                    }
                                                                </span>
                                                                <span className="text-muted">
                                                                    {
                                                                        slot.targetSets
                                                                    }{" "}
                                                                    sets
                                                                </span>
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ),
                        },
                    ]}
                />
            </div>
        </main>
    );
}
