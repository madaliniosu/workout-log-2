import { randomUUID } from "node:crypto";
import { db } from "@/db/client";
import { loggedSets, exercises, workouts } from "@/db/schema";
import { asc, desc, eq, sql } from "drizzle-orm";
import type { SetMetrics, TracksFlags } from "@/lib/format-set";

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
    exerciseSets: {
        exerciseId: string;
        workoutId: string | null;
        sets: LogSetInput[];
    }[];
}) {
    const sessionId = randomUUID();
    const performedAt = new Date();

    const rows = params.exerciseSets.flatMap(
        ({ exerciseId, workoutId, sets }) =>
            sets.map((set) => ({
                ...set,
                sessionId,
                performedAt,
                userId: params.userId,
                exerciseId,
                workoutId,
            })),
    );

    return db.insert(loggedSets).values(rows).returning();
}

// Distinct exercise ids, most-recently-logged first — powers the "Recent"
// section in the Add Exercise modal. Grouped/aggregated in Postgres rather
// than fetched raw and deduped in JS, since logged_sets can have many rows
// per exercise per visit.
export async function getRecentlyLoggedExerciseIds(
    userId: string,
    limit: number,
) {
    const rows = await db
        .select({ exerciseId: loggedSets.exerciseId })
        .from(loggedSets)
        .where(eq(loggedSets.userId, userId))
        .groupBy(loggedSets.exerciseId)
        .orderBy(sql`max(${loggedSets.performedAt}) desc`)
        .limit(limit);

    return rows.map((row) => row.exerciseId);
}

// One flat fetch of every logged set with its exercise (and workout, when
// linked) — both Analyze tabs are groupings of these same rows, so fetch
// once and let the pure groupBy* functions below shape the result, rather
// than running two near-identical queries. Ordered for groupBySession's
// benefit (most recent visit first); groupByExercise re-sorts its buckets.
export async function getLoggedSetRows(userId: string) {
    return db
        .select({
            sessionId: loggedSets.sessionId,
            performedAt: loggedSets.performedAt,
            setNumber: loggedSets.setNumber,
            reps: loggedSets.reps,
            weightKg: loggedSets.weightKg,
            durationSeconds: loggedSets.durationSeconds,
            distanceMeters: loggedSets.distanceMeters,
            plannedReps: loggedSets.plannedReps,
            plannedWeightKg: loggedSets.plannedWeightKg,
            plannedDurationSeconds: loggedSets.plannedDurationSeconds,
            plannedDistanceMeters: loggedSets.plannedDistanceMeters,
            workoutId: loggedSets.workoutId,
            workoutName: workouts.name,
            exerciseId: exercises.id,
            exerciseName: exercises.name,
            tracksReps: exercises.tracksReps,
            tracksWeight: exercises.tracksWeight,
            tracksDuration: exercises.tracksDuration,
            tracksDistance: exercises.tracksDistance,
        })
        .from(loggedSets)
        .innerJoin(exercises, eq(loggedSets.exerciseId, exercises.id))
        .leftJoin(workouts, eq(loggedSets.workoutId, workouts.id))
        .where(eq(loggedSets.userId, userId))
        .orderBy(
            desc(loggedSets.performedAt),
            asc(loggedSets.sessionId),
            asc(exercises.name),
            asc(loggedSets.setNumber),
        );
}

export type LoggedSetRow = Awaited<ReturnType<typeof getLoggedSetRows>>[number];

function pickMetrics(row: LoggedSetRow): SetMetrics {
    return {
        reps: row.reps,
        plannedReps: row.plannedReps,
        weightKg: row.weightKg,
        plannedWeightKg: row.plannedWeightKg,
        durationSeconds: row.durationSeconds,
        plannedDurationSeconds: row.plannedDurationSeconds,
        distanceMeters: row.distanceMeters,
        plannedDistanceMeters: row.plannedDistanceMeters,
    };
}

export type LoggedSessionSet = SetMetrics & { setNumber: number };

export type LoggedSessionExercise = TracksFlags & {
    exerciseId: string;
    exerciseName: string;
    workoutId: string | null;
    workoutName: string | null;
    sets: LoggedSessionSet[];
};

export type LoggedSession = {
    sessionId: string;
    performedAtLabel: string;
    exercises: LoggedSessionExercise[];
};

// Reconstructs "workout visits" by grouping rows that share one session_id —
// there is no sessions table (see schema.ts). Grouped on (exerciseId,
// workoutId) within a visit so the same exercise logged once ad-hoc and once
// via a workout in a single save stays as two entries. performedAt becomes a
// pre-formatted label here, on the server, so client components never format
// dates themselves — formatting in the browser during hydration can disagree
// with the server-rendered HTML (locale/timezone) and trigger React
// hydration-mismatch warnings.
export function groupBySession(rows: LoggedSetRow[]): LoggedSession[] {
    const sessions = new Map<string, LoggedSession>();

    for (const row of rows) {
        let session = sessions.get(row.sessionId);
        if (!session) {
            session = {
                sessionId: row.sessionId,
                performedAtLabel: row.performedAt.toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                }),
                exercises: [],
            };
            sessions.set(row.sessionId, session);
        }

        let exerciseGroup = session.exercises.find(
            (group) => group.exerciseId === row.exerciseId && group.workoutId === row.workoutId,
        );
        if (!exerciseGroup) {
            exerciseGroup = {
                exerciseId: row.exerciseId,
                exerciseName: row.exerciseName,
                tracksReps: row.tracksReps,
                tracksWeight: row.tracksWeight,
                tracksDuration: row.tracksDuration,
                tracksDistance: row.tracksDistance,
                workoutId: row.workoutId,
                workoutName: row.workoutName,
                sets: [],
            };
            session.exercises.push(exerciseGroup);
        }

        exerciseGroup.sets.push({ setNumber: row.setNumber, ...pickMetrics(row) });
    }

    return Array.from(sessions.values());
}

export type ExerciseHistoryEntry = SetMetrics & {
    performedAtLabel: string;
    setNumber: number;
};

export type ExerciseHistory = TracksFlags & {
    exerciseId: string;
    exerciseName: string;
    entries: ExerciseHistoryEntry[];
};

// The same rows grouped by exercise instead of by visit. Exercises come out
// most-recently-logged first (map insertion order, since rows arrive newest
// first) — what you're actively training tops the Progress list. Entries
// within an exercise are re-sorted oldest first, read top-to-bottom as a
// timeline.
export function groupByExercise(rows: LoggedSetRow[]): ExerciseHistory[] {
    const buckets = new Map<string, LoggedSetRow[]>();

    for (const row of rows) {
        const bucket = buckets.get(row.exerciseId);
        if (bucket) {
            bucket.push(row);
        } else {
            buckets.set(row.exerciseId, [row]);
        }
    }

    return Array.from(buckets.values()).map((bucket) => {
        const [first] = bucket;
        return {
            exerciseId: first.exerciseId,
            exerciseName: first.exerciseName,
            tracksReps: first.tracksReps,
            tracksWeight: first.tracksWeight,
            tracksDuration: first.tracksDuration,
            tracksDistance: first.tracksDistance,
            entries: bucket
                .sort(
                    (a, b) =>
                        a.performedAt.getTime() - b.performedAt.getTime() ||
                        a.setNumber - b.setNumber,
                )
                .map((row) => ({
                    performedAtLabel: row.performedAt.toLocaleDateString(undefined, {
                        dateStyle: "medium",
                    }),
                    setNumber: row.setNumber,
                    ...pickMetrics(row),
                })),
        };
    });
}