import { db } from "@/db/client";
import { exercises, userExercises } from "@/db/schema";
import { and, asc, eq, isNull } from "drizzle-orm";
import type { CreateExerciseInput, ExerciseTargetsInput } from "@/lib/validations";


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
// to getExerciseLibrary(), which only returns userId IS NULL rows.
export async function getCustomExercises(userId: string) {
  return db
    .select()
    .from(exercises)
    .where(eq(exercises.userId, userId))
    .orderBy(asc(exercises.name));
}


// userId is required here (unlike getExerciseById) — this is specifically
// the write path that creates a *custom* exercise, so the caller must have
// already resolved a real user id via getCurrentUserId().
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


// A user's personal working set: their own custom exercises, plus any
// library exercises they've explicitly added via userExercises. This is
// what Activity's Exercises section shows — never the raw 1,324-row
// library, which only appears inside the "Add from library" picker.
export async function getUserExercises(userId: string) {
  const [custom, addedLibrary] = await Promise.all([
    db.select().from(exercises).where(eq(exercises.userId, userId)),
    db
      .select({ exercise: exercises })
      .from(userExercises)
      .innerJoin(exercises, eq(userExercises.exerciseId, exercises.id))
      .where(eq(userExercises.userId, userId)),
  ]);

  return [...custom, ...addedLibrary.map((row) => row.exercise)].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

// Idempotent by design: the unique(userId, exerciseId) constraint means a
// second "add" of the same exercise is a silent no-op, not an error.
export async function addExerciseToUser(userId: string, exerciseId: string) {
  await db.insert(userExercises).values({ userId, exerciseId }).onConflictDoNothing();
}


// Removes the bookmark, never the library exercise itself — that's shared,
// global data owned by no one, and other users may have their own bookmark
// on the same row.
export async function removeExerciseFromUser(userId: string, exerciseId: string) {
  await db
    .delete(userExercises)
    .where(and(eq(userExercises.userId, userId), eq(userExercises.exerciseId, exerciseId)));
}

// Deletes a custom exercise outright. Scoped to userId too, not just id, so
// a user can only ever delete their own — the right invariant to encode now
// even pre-auth. Will throw on a foreign key violation if the exercise has
// ever been logged or used in a workout (workout_exercises/logged_sets are
// RESTRICT on purpose), rather than silently deleting that history.
export async function deleteCustomExercise(userId: string, exerciseId: string) {
  await db.delete(exercises).where(and(eq(exercises.id, exerciseId), eq(exercises.userId, userId)));
}