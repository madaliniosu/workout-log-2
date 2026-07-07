"use client";

import { useState } from "react";
import type { ExerciseHistory } from "@/db/queries/sets";
import { formatSetMetrics } from "@/lib/format-set";

export function ProgressExplorer({
    histories,
}: {
    histories: ExerciseHistory[];
}) {
    const [selectedId, setSelectedId] = useState<string | null>(
        histories[0]?.exerciseId ?? null,
    );

    if (histories.length === 0) {
        return (
            <p className="text-sm text-muted">
                Log a few sets first — progress shows up here once an exercise
                has history.
            </p>
        );
    }

    const selected =
        histories.find((history) => history.exerciseId === selectedId) ??
        histories[0];

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
            <ul className="flex flex-col gap-1 sm:w-56 sm:shrink-0">
                {histories.map((history) => (
                    <li key={history.exerciseId}>
                        <button
                            type="button"
                            onClick={() => setSelectedId(history.exerciseId)}
                            className={`w-full rounded-xl px-3 py-2 text-left text-sm ${
                                history.exerciseId === selected.exerciseId
                                    ? "bg-accent font-semibold text-foreground"
                                    : "text-muted hover:bg-background"
                            }`}
                        >
                            {history.exerciseName}
                        </button>
                    </li>
                ))}
            </ul>

            <div className="flex-1">
                <h3 className="font-heading text-lg font-semibold text-foreground">
                    {selected.exerciseName}
                </h3>
                <ul className="mt-2 flex flex-col gap-1">
                    {selected.entries.map((entry, i) => (
                        <li key={i} className="text-sm text-muted">
                            {entry.performedAtLabel} — Set {entry.setNumber}:{" "}
                            {formatSetMetrics(entry, selected)}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
