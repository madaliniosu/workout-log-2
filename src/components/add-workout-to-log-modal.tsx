"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";
import type { LogWorkoutOption } from "@/components/log-builder";

// Picking a workout immediately expands it into one entry per exercise slot
// (using that slot's own target_sets and its exercise's own target_*
// values) and closes the modal — unlike Add Exercise there's nothing else
// to configure, since the template already carries that data.
export function AddWorkoutModal({
  workouts,
  onAdd,
}: {
  workouts: LogWorkoutOption[];
  onAdd: (workout: LogWorkoutOption) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered =
    query.trim() === ""
      ? workouts
      : workouts.filter((workout) => workout.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <Modal
      trigger="+ Add Workout"
      triggerClassName="rounded-xl border border-border px-4 py-2 font-heading text-sm font-semibold text-foreground hover:bg-white"
      title="Add Workout"
    >
      <div className="flex flex-col gap-1">
        <span className="font-heading text-xs font-semibold text-muted">Workout</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your workouts..."
          autoFocus
          className="h-11 w-full rounded-xl border border-border px-4 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <ul className="mt-1 max-h-72 overflow-auto rounded-xl border border-border bg-white">
          {filtered.length === 0 && <li className="px-3 py-2 text-sm text-muted">No matches</li>}
          {filtered.map((workout) => (
            <li key={workout.id}>
              <button
                type="button"
                onClick={(e) => {
                  onAdd(workout);
                  e.currentTarget.closest("dialog")?.close();
                }}
                className="block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-background"
              >
                {workout.name}
                <span className="ml-2 text-xs text-muted">{workout.slots.length} exercises</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}
