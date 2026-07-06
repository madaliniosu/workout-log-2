import { db } from "@/db/client";
import { workouts, workoutExercises, exercises } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";

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



// Same transactional shape as createWorkout, but replaces workout_exercises
// wholesale rather than diffing — exactly the pattern the schema's own
// comments anticipated ("rows are replaced wholesale whenever a workout is
// edited"). Scoped to userId so a user can only ever edit their own.
export async function updateWorkout(params: {
  userId: string;
  workoutId: string;
  name: string;
  notes?: string;
  exercises: { exerciseId: string; targetSets: number }[];
}) {
  return db.transaction(async (tx) => {
    const [workout] = await tx
      .update(workouts)
      .set({ name: params.name, notes: params.notes })
      .where(and(eq(workouts.id, params.workoutId), eq(workouts.userId, params.userId)))
      .returning();

    await tx.delete(workoutExercises).where(eq(workoutExercises.workoutId, params.workoutId));

    if (params.exercises.length > 0) {
      await tx.insert(workoutExercises).values(
        params.exercises.map((exercise, i) => ({
          workoutId: params.workoutId,
          exerciseId: exercise.exerciseId,
          position: i + 1,
          targetSets: exercise.targetSets,
        }))
      );
    }

    return workout;
  });
}

// workout_exercises cascade-deletes automatically; logged_sets.workout_id
// is set to NULL (not deleted) — history from a deleted workout survives as
// ad-hoc-looking logs, per the schema's cascade rules. No RESTRICT concern
// here, unlike deleting an exercise with history.
export async function deleteWorkout(userId: string, workoutId: string) {
  await db.delete(workouts).where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
