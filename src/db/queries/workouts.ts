import { db } from "@/db/client";
import { workouts, workoutExercises, exercises } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export async function getWorkouts(userId: string) {
  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId))
    .orderBy(asc(workouts.name));
}

export async function getWorkoutById(id: string) {
  const [workout] = await db.select().from(workouts).where(eq(workouts.id, id));
  return workout ?? null;
}

// Joined and ordered by position — this is the exact shape Stage 6's
// workout-based logging will need too (exercise + its target_sets, in order).
export async function getWorkoutExercises(workoutId: string) {
  return db
    .select({
      id: workoutExercises.id,
      position: workoutExercises.position,
      targetSets: workoutExercises.targetSets,
      exercise: exercises,
    })
    .from(workoutExercises)
    .innerJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
    .where(eq(workoutExercises.workoutId, workoutId))
    .orderBy(asc(workoutExercises.position));
}

// Unlike logSets, this genuinely needs db.transaction(): two different
// tables, and a workout row should never exist without its exercises (or
// vice versa) if something fails partway through.
export async function createWorkout(params: {
  userId: string;
  name: string;
  notes?: string;
  exercises: { exerciseId: string; targetSets: number }[];
}) {
  return db.transaction(async (tx) => {
    const [workout] = await tx
      .insert(workouts)
      .values({ userId: params.userId, name: params.name, notes: params.notes })
      .returning();

    if (params.exercises.length > 0) {
      await tx.insert(workoutExercises).values(
        params.exercises.map((exercise, i) => ({
          workoutId: workout.id,
          exerciseId: exercise.exerciseId,
          position: i + 1,
          targetSets: exercise.targetSets,
        }))
      );
    }

    return workout;
  });
}
