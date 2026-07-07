import { db } from "@/db/client";
import { workouts, workoutExercises, exercises } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";

// Every workout with its ordered slots in one query — the two left joins
// fan out to one row per slot (or a single slot-less row for an empty
// workout), grouped back here. Replaces a query-per-workout loop: both the
// home page's Add Workout modal and Plan's workout cards need every
// template expanded, and N+1 round trips grow with the workout count.
export async function getWorkoutsWithSlots(userId: string) {
  const rows = await db
    .select({
      workout: workouts,
      slotId: workoutExercises.id,
      targetSets: workoutExercises.targetSets,
      exercise: exercises,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
    .where(eq(workouts.userId, userId))
    .orderBy(asc(workouts.name), asc(workoutExercises.position));

  type WorkoutWithSlots = (typeof rows)[number]["workout"] & {
    slots: { id: string; targetSets: number; exercise: NonNullable<(typeof rows)[number]["exercise"]> }[];
  };
  const byId = new Map<string, WorkoutWithSlots>();

  for (const row of rows) {
    let workout = byId.get(row.workout.id);
    if (!workout) {
      workout = { ...row.workout, slots: [] };
      byId.set(row.workout.id, workout);
    }
    if (row.slotId !== null && row.targetSets !== null && row.exercise !== null) {
      workout.slots.push({ id: row.slotId, targetSets: row.targetSets, exercise: row.exercise });
    }
  }

  return Array.from(byId.values());
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
