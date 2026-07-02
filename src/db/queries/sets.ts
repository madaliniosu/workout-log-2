import { randomUUID } from "node:crypto";
import { db } from "@/db/client";
import { loggedSets } from "@/db/schema";

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

// One session_id and one performed_at generated here, once per save, and
// stamped on every row — this is the entire "session" concept (see
// schema.ts: there is no sessions table, just this shared token).
export async function logSets(params: {
  userId: string;
  exerciseId: string;
  workoutId: string | null;
  sets: LogSetInput[];
}) {
  const sessionId = randomUUID();
  const performedAt = new Date();

  return db
    .insert(loggedSets)
    .values(
      params.sets.map((set) => ({
        ...set,
        sessionId,
        performedAt,
        userId: params.userId,
        exerciseId: params.exerciseId,
        workoutId: params.workoutId,
      }))
    )
    .returning();
}
