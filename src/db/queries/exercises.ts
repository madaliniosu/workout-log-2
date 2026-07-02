import { db } from "@/db/client";
import { exercises } from "@/db/schema";
import { and, asc, eq, isNull } from "drizzle-orm";

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
  const [categories, equipmentTypes, targetMuscles] = await Promise.all([
    db.selectDistinct({ value: exercises.category }).from(exercises).where(isNull(exercises.userId)).orderBy(asc(exercises.category)),
    db.selectDistinct({ value: exercises.equipment }).from(exercises).where(isNull(exercises.userId)).orderBy(asc(exercises.equipment)),
    db.selectDistinct({ value: exercises.targetMuscle }).from(exercises).where(isNull(exercises.userId)).orderBy(asc(exercises.targetMuscle)),
  ]);

  return {
    categories: categories.map((c) => c.value).filter((v): v is string => Boolean(v)),
    equipmentTypes: equipmentTypes.map((e) => e.value).filter((v): v is string => Boolean(v)),
    targetMuscles: targetMuscles.map((t) => t.value).filter((v): v is string => Boolean(v)),
  };
}
