"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";
import { SearchList } from "@/components/search-list";
import type { LogExerciseOption, LogWorkoutOption, NewExerciseLogEntry } from "@/components/log-builder";

// One picker over both workouts and the user's exercises. Choosing a
// workout adds all its slots immediately and closes (the template already
// carries set counts and targets); choosing an exercise goes through a
// config step (sets + target values) first. Everything after the pick —
// the entry list, set rows, save — is unchanged.
type PickerItem =
  | { kind: "workout"; workout: LogWorkoutOption }
  | { kind: "exercise"; exercise: LogExerciseOption };

export function StartWorkoutModal({
  exercises,
  workouts,
  onAddExercise,
  onAddWorkout,
}: {
  exercises: LogExerciseOption[];
  workouts: LogWorkoutOption[];
  onAddExercise: (entry: NewExerciseLogEntry) => void;
  onAddWorkout: (workout: LogWorkoutOption) => void;
}) {
  const [selected, setSelected] = useState<LogExerciseOption | null>(null);
  const [sets, setSets] = useState(3);
  const [plannedReps, setPlannedReps] = useState("");
  const [plannedWeightKg, setPlannedWeightKg] = useState("");
  const [plannedDurationSeconds, setPlannedDurationSeconds] = useState("");
  const [plannedDistanceMeters, setPlannedDistanceMeters] = useState("");

  // Workouts first: picking a whole template is the more common way to
  // start, and both kinds stay searchable in the same box.
  const items: PickerItem[] = [
    ...workouts.map((workout) => ({ kind: "workout" as const, workout })),
    ...exercises.map((exercise) => ({ kind: "exercise" as const, exercise })),
  ];

  function reset() {
    setSelected(null);
    setSets(3);
    setPlannedReps("");
    setPlannedWeightKg("");
    setPlannedDurationSeconds("");
    setPlannedDistanceMeters("");
  }

  function select(exercise: LogExerciseOption) {
    setSelected(exercise);
    setPlannedReps(exercise.targetReps?.toString() ?? "");
    setPlannedWeightKg(exercise.targetWeightKg?.toString() ?? "");
    setPlannedDurationSeconds(exercise.targetDurationSeconds?.toString() ?? "");
    setPlannedDistanceMeters(exercise.targetDistanceMeters?.toString() ?? "");
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;

    onAddExercise({
      exerciseId: selected.id,
      exerciseName: selected.name,
      sets,
      tracksReps: selected.tracksReps,
      tracksWeight: selected.tracksWeight,
      tracksDuration: selected.tracksDuration,
      tracksDistance: selected.tracksDistance,
      plannedReps: plannedReps === "" ? null : Number(plannedReps),
      plannedWeightKg: plannedWeightKg === "" ? null : Number(plannedWeightKg),
      plannedDurationSeconds: plannedDurationSeconds === "" ? null : Number(plannedDurationSeconds),
      plannedDistanceMeters: plannedDistanceMeters === "" ? null : Number(plannedDistanceMeters),
    });

    e.currentTarget.closest("dialog")?.close();
  }

  return (
    <Modal
      trigger="Start workout"
      triggerClassName="rounded-xl border border-border px-4 py-2 font-heading text-sm font-semibold text-foreground hover:bg-surface"
      title="Start Workout"
      onClose={reset}
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        {selected === null ? (
          <SearchList
            items={items}
            label="Workout or exercise"
            placeholder="Search your workouts and exercises..."
            getName={(item) => (item.kind === "workout" ? item.workout.name : item.exercise.name)}
            renderItem={(item) =>
              item.kind === "workout" ? (
                <span className="flex items-center justify-between">
                  <span>{item.workout.name}</span>
                  <span className="text-xs text-muted">
                    Workout · {item.workout.slots.length} exercise{item.workout.slots.length === 1 ? "" : "s"}
                  </span>
                </span>
              ) : (
                <span className="flex items-center justify-between">
                  <span>{item.exercise.name}</span>
                  <span className="text-xs text-muted">Exercise</span>
                </span>
              )
            }
            onSelect={(item, e) => {
              if (item.kind === "workout") {
                onAddWorkout(item.workout);
                e.currentTarget.closest("dialog")?.close();
              } else {
                select(item.exercise);
              }
            }}
          />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="font-heading text-sm font-semibold text-foreground">{selected.name}</p>
              <button type="button" onClick={() => setSelected(null)} className="text-xs text-muted hover:underline">
                Change
              </button>
            </div>

            <label className="flex flex-col gap-1">
              <span className="font-heading text-xs font-semibold text-muted">Sets</span>
              <input
                type="number"
                min={1}
                step={1}
                value={sets}
                onChange={(e) => setSets(Math.max(1, Number(e.target.value)))}
                className="h-11 w-24 rounded-xl border border-border px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </label>

            {selected.tracksReps && (
              <label className="flex flex-col gap-1">
                <span className="font-heading text-xs font-semibold text-muted">Target reps</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={plannedReps}
                  onChange={(e) => setPlannedReps(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </label>
            )}

            {selected.tracksWeight && (
              <label className="flex flex-col gap-1">
                <span className="font-heading text-xs font-semibold text-muted">Target weight (kg)</span>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={plannedWeightKg}
                  onChange={(e) => setPlannedWeightKg(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </label>
            )}

            {selected.tracksDuration && (
              <label className="flex flex-col gap-1">
                <span className="font-heading text-xs font-semibold text-muted">Target duration (s)</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={plannedDurationSeconds}
                  onChange={(e) => setPlannedDurationSeconds(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </label>
            )}

            {selected.tracksDistance && (
              <label className="flex flex-col gap-1">
                <span className="font-heading text-xs font-semibold text-muted">Target distance (m)</span>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={plannedDistanceMeters}
                  onChange={(e) => setPlannedDistanceMeters(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </label>
            )}

            <button
              type="submit"
              className="self-end rounded-xl bg-accent px-4 py-2 font-heading text-sm font-semibold text-foreground"
            >
              + Add
            </button>
          </>
        )}
      </form>
    </Modal>
  );
}
