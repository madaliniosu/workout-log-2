import { getCustomExercises } from "@/db/queries/exercises";
import { getWorkoutsWithSlots } from "@/db/queries/workouts";
import { getCurrentUserId } from "@/lib/current-user";
import { LogBuilder, type LogExerciseOption, type LogWorkoutOption } from "@/components/log-builder";

export default async function HomePage() {
  const userId = await getCurrentUserId();

  const [customExercises, workoutsWithSlots] = await Promise.all([
    getCustomExercises(userId),
    getWorkoutsWithSlots(userId),
  ]);

  const exerciseOptions: LogExerciseOption[] = customExercises.map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    tracksReps: exercise.tracksReps,
    tracksWeight: exercise.tracksWeight,
    tracksDuration: exercise.tracksDuration,
    tracksDistance: exercise.tracksDistance,
    targetReps: exercise.targetReps,
    targetWeightKg: exercise.targetWeightKg,
    targetDurationSeconds: exercise.targetDurationSeconds,
    targetDistanceMeters: exercise.targetDistanceMeters,
  }));

  const workoutOptions: LogWorkoutOption[] = workoutsWithSlots.map((workout) => ({
    id: workout.id,
    name: workout.name,
    slots: workout.slots.map((slot) => ({
      exerciseId: slot.exercise.id,
      exerciseName: slot.exercise.name,
      sets: slot.targetSets,
      tracksReps: slot.exercise.tracksReps,
      tracksWeight: slot.exercise.tracksWeight,
      tracksDuration: slot.exercise.tracksDuration,
      tracksDistance: slot.exercise.tracksDistance,
      plannedReps: slot.exercise.targetReps,
      plannedWeightKg: slot.exercise.targetWeightKg,
      plannedDurationSeconds: slot.exercise.targetDurationSeconds,
      plannedDistanceMeters: slot.exercise.targetDistanceMeters,
    })),
  }));

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <section className="mt-6">
        <div className="mt-2">
          <LogBuilder exercises={exerciseOptions} workouts={workoutOptions} />
        </div>
      </section>
    </main>
  );
}
