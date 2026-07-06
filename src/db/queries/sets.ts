import { randomUUID } from "node:crypto";
import { db } from "@/db/client";
import { loggedSets } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export type LogSetInput = {
  setNumber: number;
  plannedReps?: number;
  reps?: number;
  plannedWeightKg?: number;
  weightKg?: number;
  plannedDurationSeconds?: number;
  durationSeconds?: number;
  plannedDistanceMeters?: number;
  distanceMeters?: number;
};

// One session_id and one performed_at generated here, once per save, shared
// across every exercise in the save — this is what makes "log a whole
// workout" and "log one exercise" the same operation at the data layer: the
// only difference is how many entries are in exerciseSets.
export async function logSets(params: {
  userId: string;
  workoutId: string | null;
  exerciseSets: { exerciseId: string; sets: LogSetInput[] }[];
}) {
  const sessionId = randomUUID();
  const performedAt = new Date();

  const rows = params.exerciseSets.flatMap(({ exerciseId, sets }) =>
    sets.map((set) => ({
      ...set,
      sessionId,
      performedAt,
      userId: params.userId,
      exerciseId,
      workoutId: params.workoutId,
    }))
  );

  return db.insert(loggedSets).values(rows).returning();
}

// Distinct exercise ids, most-recently-logged first — powers the "Recent"
// section in the Add Exercise modal. Grouped/aggregated in Postgres rather
// than fetched raw and deduped in JS, since logged_sets can have many rows
// per exercise per visit.
export async function getRecentlyLoggedExerciseIds(userId: string, limit: number) {
  const rows = await db
    .select({ exerciseId: loggedSets.exerciseId })
    .from(loggedSets)
    .where(eq(loggedSets.userId, userId))
    .groupBy(loggedSets.exerciseId)
    .orderBy(sql`max(${loggedSets.performedAt}) desc`)
    .limit(limit);

  return rows.map((row) => row.exerciseId);
}