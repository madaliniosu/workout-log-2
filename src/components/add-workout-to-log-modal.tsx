"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";
import type { LogWorkoutOption } from "@/components/log-builder";
import { SearchList } from "@/components/search-list";

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
    return (
        <Modal
            trigger="+ Add Workout"
            triggerClassName="rounded-xl border border-border px-4 py-2 font-heading text-sm font-semibold text-foreground hover:bg-white"
            title="Add Workout"
        >
            <SearchList
                items={workouts}
                label="Workout"
                placeholder="Search your workouts..."
                getName={(workout) => workout.name}
                renderItem={(workout) => (
                    <>
                        {workout.name}
                        <span className="ml-2 text-xs text-muted">
                            {workout.slots.length} exercises
                        </span>
                    </>
                )}
                onSelect={(workout, e) => {
                    onAdd(workout);
                    e.currentTarget.closest("dialog")?.close();
                }}
            />
        </Modal>
    );
}
