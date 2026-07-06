"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { AddExerciseModal } from "@/components/add-exercise-to-log-modal";
import { AddWorkoutModal } from "@/components/add-workout-to-log-modal";
import { SetRow } from "@/components/set-row";
import { logSetsAction } from "@/actions/set-actions";

export type LogExerciseOption = {
  id: string;
  name: string;
  tracksReps: boolean;
  tracksWeight: boolean;
  tracksDuration: boolean;
  tracksDistance: boolean;
  targetReps: number | null;
  targetWeightKg: number | null;
  targetDurationSeconds: number | null;
  targetDistanceMeters: number | null;
};

export type LogWorkoutSlot = {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  tracksReps: boolean;
  tracksWeight: boolean;
  tracksDuration: boolean;
  tracksDistance: boolean;
  plannedReps: number | null;
  plannedWeightKg: number | null;
  plannedDurationSeconds: number | null;
  plannedDistanceMeters: number | null;
};

export type LogWorkoutOption = {
  id: string;
  name: string;
  slots: LogWorkoutSlot[];
};

// What AddExerciseModal hands back on submit — everything needed for one
// log entry except the bookkeeping fields (key, workout linkage) that only
// LogBuilder itself needs to add.
export type NewExerciseLogEntry = {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  tracksReps: boolean;
  tracksWeight: boolean;
  tracksDuration: boolean;
  tracksDistance: boolean;
  plannedReps: number | null;
  plannedWeightKg: number | null;
  plannedDurationSeconds: number | null;
  plannedDistanceMeters: number | null;
};

type LogEntry = NewExerciseLogEntry & {
  key: string;
  workoutId: string | null;
  workoutName: string | null;
};

export function LogBuilder({
  exercises,
  workouts,
}: {
  exercises: LogExerciseOption[];
  workouts: LogWorkoutOption[];
}) {
  const [entries, setEntries] = useState<LogEntry[]>([]);

  function addExercise(entry: NewExerciseLogEntry) {
    setEntries((prev) => [...prev, { key: crypto.randomUUID(), workoutId: null, workoutName: null, ...entry }]);
  }

  function addWorkout(workout: LogWorkoutOption) {
    setEntries((prev) => [
      ...prev,
      ...workout.slots.map((slot) => ({
        key: crypto.randomUUID(),
        workoutId: workout.id,
        workoutName: workout.name,
        ...slot,
      })),
    ]);
  }

  function removeEntry(key: string) {
    setEntries((prev) => prev.filter((entry) => entry.key !== key));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-3">
        <AddExerciseModal exercises={exercises} onAdd={addExercise} />
        <AddWorkoutModal workouts={workouts} onAdd={addWorkout} />
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-muted">No exercises added yet.</p>
      ) : (
        <form action={logSetsAction} className="flex flex-col gap-8">
          {entries.map((entry) => (
            <div key={entry.key}>
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-semibold text-foreground">
                  {entry.exerciseName}
                  {entry.workoutName && (
                    <span className="ml-2 text-xs font-normal text-muted">{entry.workoutName}</span>
                  )}
                </h2>
                <button
                  type="button"
                  onClick={() => removeEntry(entry.key)}
                  aria-label="Remove exercise"
                  className="text-red-600 hover:underline"
                >
                  <Trash2 size={18} strokeWidth={2} />
                </button>
              </div>
              <div className="mt-2 flex flex-col gap-4">
                {Array.from({ length: entry.sets }, (_, i) => (
                  <SetRow
                    key={i}
                    exerciseId={entry.exerciseId}
                    workoutId={entry.workoutId}
                    setNumber={i + 1}
                    tracksReps={entry.tracksReps}
                    tracksWeight={entry.tracksWeight}
                    tracksDuration={entry.tracksDuration}
                    tracksDistance={entry.tracksDistance}
                    plannedReps={entry.plannedReps}
                    plannedWeightKg={entry.plannedWeightKg}
                    plannedDurationSeconds={entry.plannedDurationSeconds}
                    plannedDistanceMeters={entry.plannedDistanceMeters}
                  />
                ))}
              </div>
            </div>
          ))}

          <button
            type="submit"
            className="self-start rounded-xl bg-accent px-4 py-2 font-heading text-sm font-semibold text-foreground"
          >
            Save
          </button>
        </form>
      )}
    </div>
  );
}
