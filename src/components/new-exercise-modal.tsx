"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";
import { ExerciseForm, type ExerciseFormValues, type FilterOptions } from "@/components/exercise-form";
import { createExerciseAction } from "@/actions/exercise-actions";

type LibraryExercise = ExerciseFormValues & { id: string };

export function NewExerciseModal({
  exercises,
  recentExerciseIds,
  filterOptions,
}: {
  exercises: LibraryExercise[];
  recentExerciseIds: string[];
  filterOptions: FilterOptions;
}) {
  return (
    <Modal trigger="New Exercise" triggerClassName="text-sm underline" title="New Exercise">
      <NewExerciseModalBody exercises={exercises} recentExerciseIds={recentExerciseIds} filterOptions={filterOptions} />
    </Modal>
  );
}

function ExerciseRow({ exercise, onSelect }: { exercise: LibraryExercise; onSelect: (exercise: LibraryExercise) => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(exercise)}
        className="flex w-full items-center justify-between py-2 text-left hover:bg-background"
      >
        <span className="text-sm text-foreground">{exercise.name}</span>
        <span className="text-xs text-muted">{exercise.category}</span>
      </button>
    </li>
  );
}

function NewExerciseModalBody({
  exercises,
  recentExerciseIds,
  filterOptions,
}: {
  exercises: LibraryExercise[];
  recentExerciseIds: string[];
  filterOptions: FilterOptions;
}) {
  const [query, setQuery] = useState("");
  const [prefill, setPrefill] = useState<LibraryExercise | null>(null);

  const searchResults =
    query.trim() === ""
      ? []
      : exercises.filter((exercise) => exercise.name.toLowerCase().includes(query.toLowerCase()));

  const recent = recentExerciseIds
    .map((id) => exercises.find((exercise) => exercise.id === id))
    .filter((exercise): exercise is LibraryExercise => exercise !== undefined)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-4">
      {prefill === null && (
        <>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${exercises.length.toLocaleString()} exercises...`}
            className="rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          />

          {query.trim() !== "" ? (
            <div>
              <p className="text-sm text-muted">{searchResults.length} results</p>
              <ul className="mt-1 flex flex-col divide-y divide-border">
                {searchResults.map((exercise) => (
                  <ExerciseRow key={exercise.id} exercise={exercise} onSelect={setPrefill} />
                ))}
              </ul>
            </div>
          ) : (
            recent.length > 0 && (
              <div>
                <h3 className="font-heading text-sm font-semibold text-foreground">Recent</h3>
                <ul className="mt-1 flex flex-col divide-y divide-border">
                  {recent.map((exercise) => (
                    <ExerciseRow key={exercise.id} exercise={exercise} onSelect={setPrefill} />
                  ))}
                </ul>
              </div>
            )
          )}
        </>
      )}

      {/* Keyed by the selected exercise's id (or "blank" when none is
          selected) so React remounts this form — and re-applies its
          defaultValue/defaultChecked props — every time a different
          exercise is picked, instead of silently keeping stale field
          values from a previous selection. */}
      <ExerciseForm
        key={prefill?.id ?? "blank"}
        action={createExerciseAction}
        filterOptions={filterOptions}
        defaultValues={prefill}
        submitLabel="+ Add"
      />
    </div>
  );
}
