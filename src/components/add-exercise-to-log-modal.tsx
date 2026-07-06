"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";
import type { LogExerciseOption, NewExerciseLogEntry } from "@/components/log-builder";

// Search is only over the exercises the user has already added (their own
// Plan list), not the full 1,324-row library — same restriction the workout
// builder already applies, for the same reason: you log from things you've
// chosen to track.
export function AddExerciseModal({
  exercises,
  onAdd,
}: {
  exercises: LogExerciseOption[];
  onAdd: (entry: NewExerciseLogEntry) => void;
}) {
  const [selected, setSelected] = useState<LogExerciseOption | null>(null);
  const [query, setQuery] = useState("");
  const [sets, setSets] = useState(3);
  const [plannedReps, setPlannedReps] = useState("");
  const [plannedWeightKg, setPlannedWeightKg] = useState("");
  const [plannedDurationSeconds, setPlannedDurationSeconds] = useState("");
  const [plannedDistanceMeters, setPlannedDistanceMeters] = useState("");

  const filtered =
    query.trim() === ""
      ? exercises
      : exercises.filter((exercise) => exercise.name.toLowerCase().includes(query.toLowerCase()));

  function reset() {
    setSelected(null);
    setQuery("");
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

    onAdd({
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
    reset();
  }

  return (
    <Modal
      trigger="+ Add Exercise"
      triggerClassName="rounded-xl border border-border px-4 py-2 font-heading text-sm font-semibold text-foreground hover:bg-white"
      title="Add Exercise"
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        {selected === null ? (
          <div className="flex flex-col gap-1">
            <span className="font-heading text-xs font-semibold text-muted">Exercise</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your exercises..."
              autoFocus
              className="h-11 w-full rounded-xl border border-border px-4 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <ul className="mt-1 max-h-56 overflow-auto rounded-xl border border-border bg-white">
              {filtered.length === 0 && <li className="px-3 py-2 text-sm text-muted">No matches</li>}
              {filtered.map((exercise) => (
                <li key={exercise.id}>
                  <button
                    type="button"
                    onClick={() => select(exercise)}
                    className="block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-background"
                  >
                    {exercise.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
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
