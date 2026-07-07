import { db } from "@/db/client";
import type { CreateExerciseInput, ExerciseTargetsInput } from "@/lib/validations";
import { exercises, workoutExercises, workouts, loggedSets } from "@/db/schema";
import { and, asc, count, eq, isNull, isNotNull } from "drizzle-orm";


export type ExerciseFilters = {
  category?: string;
  equipment?: string;
  targetMuscle?: string;
};

// Built-in library only (userId IS NULL). Custom exercises get their own
// getCustomExercises() when that feature lands in Stage 3 — kept separate
// rather than merged here so each stage only builds what it needs.
export async function getExerciseLibrary(filters: ExerciseFilters = {}) {
  const conditions = [isNull(exercises.userId)];
  if (filters.category) conditions.push(eq(exercises.category, filters.category));
  if (filters.equipment) conditions.push(eq(exercises.equipment, filters.equipment));
  if (filters.targetMuscle) conditions.push(eq(exercises.targetMuscle, filters.targetMuscle));

  return db
    .select()
    .from(exercises)
    .where(and(...conditions))
    .orderBy(asc(exercises.name));
}

// Works for both library and (later) custom exercises — the detail page
// doesn't need to know which kind it's looking at.
export async function getExerciseById(id: string) {
  const [exercise] = await db.select().from(exercises).where(eq(exercises.id, id));
  return exercise ?? null;
}

// Distinct values for the browse page's filter dropdowns. Derived from the
// data itself rather than a lookup table, per the schema's decision to keep
// these as plain text columns.
export async function getExerciseFilterOptions() {
  const [categories, equipmentTypes, muscleGroups, targetMuscles] = await Promise.all([
    db.selectDistinct({ value: exercises.category }).from(exercises).where(isNull(exercises.userId)).orderBy(asc(exercises.category)),
    db.selectDistinct({ value: exercises.equipment }).from(exercises).where(isNull(exercises.userId)).orderBy(asc(exercises.equipment)),
    db.selectDistinct({ value: exercises.muscleGroup }).from(exercises).where(isNull(exercises.userId)).orderBy(asc(exercises.muscleGroup)),
    db.selectDistinct({ value: exercises.targetMuscle }).from(exercises).where(isNull(exercises.userId)).orderBy(asc(exercises.targetMuscle)),
  ]);

  return {
    categories: categories.map((c) => c.value).filter((v): v is string => Boolean(v)),
    equipmentTypes: equipmentTypes.map((e) => e.value).filter((v): v is string => Boolean(v)),
    muscleGroups: muscleGroups.map((m) => m.value).filter((v): v is string => Boolean(v)),
    targetMuscles: targetMuscles.map((t) => t.value).filter((v): v is string => Boolean(v)),
  };
}

// Custom exercises only (userId set to a specific user) — the counterpart
// to getExerciseLibrary(), which only returns userId IS NULL rows. This is
// now also what Activity's Exercises section shows: an exercise "added from
// the library" is just a custom exercise copied from a library row, so
// there's no separate "user's working set" concept anymore.
export async function getCustomExercises(userId: string) {
  return db
    .select()
    .from(exercises)
    .where(and(eq(exercises.userId, userId), isNull(exercises.archivedAt)))
    .orderBy(asc(exercises.name));
}

// userId is required here (unlike getExerciseById) — this is specifically
// the write path that creates a *custom* exercise, so the caller must have
// already resolved a real user id via getCurrentUserId(). Also the write
// path for "add from library": the caller pre-fills CreateExerciseInput
// from a library exercise's data, but this still just creates a fresh,
// independent row.
export async function createCustomExercise(userId: string, data: CreateExerciseInput) {
  const [exercise] = await db
    .insert(exercises)
    .values({ userId, ...data })
    .returning();
  return exercise;
}

// Works on library exercises too: targets are a personal goal layered on
// top of any exercise, not a property only custom exercises can have.
export async function updateExerciseTargets(id: string, targets: ExerciseTargetsInput) {
  const [exercise] = await db
    .update(exercises)
    .set(targets)
    .where(eq(exercises.id, id))
    .returning();
  return exercise;
}

// Deletes a custom exercise outright. Scoped to userId too, not just id, so
// a user can only ever delete their own — the right invariant to encode now
// even pre-auth. Will throw on a foreign key violation if the exercise has
// ever been logged or used in a workout (workout_exercises/logged_sets are
// RESTRICT on purpose), rather than silently deleting that history.
export async function deleteCustomExercise(userId: string, exerciseId: string) {
  await db.delete(exercises).where(and(eq(exercises.id, exerciseId), eq(exercises.userId, userId)));
}


// Scoped to userId too, same ownership invariant as deleteCustomExercise —
// a user can only ever edit their own exercises.
export async function updateCustomExercise(userId: string, exerciseId: string, data: CreateExerciseInput) {
  const [exercise] = await db
    .update(exercises)
    .set(data)
    .where(and(eq(exercises.id, exerciseId), eq(exercises.userId, userId)))
    .returning();
  return exercise;
}

export async function getArchivedExercises(userId: string) {
  return db
    .select()
    .from(exercises)
    .where(and(eq(exercises.userId, userId), isNotNull(exercises.archivedAt)))
    .orderBy(asc(exercises.name));
}

// Same ownership scoping as deleteCustomExercise. Archive and restore are
// both just flips of archivedAt — no rows move or disappear.
export async function archiveExercise(userId: string, exerciseId: string) {
  await db
    .update(exercises)
    .set({ archivedAt: new Date() })
    .where(and(eq(exercises.id, exerciseId), eq(exercises.userId, userId)));
}

export async function restoreExercise(userId: string, exerciseId: string) {
  await db
    .update(exercises)
    .set({ archivedAt: null })
    .where(and(eq(exercises.id, exerciseId), eq(exercises.userId, userId)));
}

export type ExerciseUsage = {
  workoutNames: string[];
  loggedSetCount: number;
};

// What references each exercise — drives the edit modal's bottom action:
// in a workout → blocked (remove it from the workout first); logged sets
// only → Archive; nothing → true Delete. Workout names (not just a count)
// so the modal can say *which* workout is in the way.
export async function getExerciseUsage(userId: string): Promise<Record<string, ExerciseUsage>> {
  const [workoutRefs, setCounts] = await Promise.all([
    db
      .select({ exerciseId: workoutExercises.exerciseId, workoutName: workouts.name })
      .from(workoutExercises)
      .innerJoin(workouts, eq(workoutExercises.workoutId, workouts.id))
      .where(eq(workouts.userId, userId)),
    db
      .select({ exerciseId: loggedSets.exerciseId, loggedSetCount: count() })
      .from(loggedSets)
      .where(eq(loggedSets.userId, userId))
      .groupBy(loggedSets.exerciseId),
  ]);

  const usage: Record<string, ExerciseUsage> = {};
  const entryFor = (exerciseId: string) =>
    (usage[exerciseId] ??= { workoutNames: [], loggedSetCount: 0 });

  for (const ref of workoutRefs) entryFor(ref.exerciseId).workoutNames.push(ref.workoutName);
  for (const row of setCounts) entryFor(row.exerciseId).loggedSetCount = row.loggedSetCount;

  return usage;
}
