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

  // Picking a result clears the query (collapsing the list) but leaves the
  // search box in place — you can always search again to repopulate the
  // form with a different exercise.
  function select(exercise: LibraryExercise) {
    setPrefill(exercise);
    setQuery("");
  }

  // Wired to the dialog's close event, so abandoning the modal (ESC,
  // backdrop, X) never leaves a stale prefill behind on reopen.
  function reset() {
    setQuery("");
    setPrefill(null);
  }

  return (
    <Modal trigger="New Exercise" triggerClassName="text-sm underline" title="New Exercise" onClose={reset}>
      <div className="flex flex-col gap-4">
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
                <ExerciseRow key={exercise.id} exercise={exercise} onSelect={select} />
              ))}
            </ul>
          </div>
        ) : (
          recent.length > 0 && (
            <div>
              <h3 className="font-heading text-sm font-semibold text-foreground">Recent</h3>
              <ul className="mt-1 flex flex-col divide-y divide-border">
                {recent.map((exercise) => (
                  <ExerciseRow key={exercise.id} exercise={exercise} onSelect={select} />
                ))}
              </ul>
            </div>
          )
        )}

        {prefill !== null && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">
              Prefilled from <span className="font-medium text-foreground">{prefill.name}</span>
            </span>
            <button type="button" onClick={() => setPrefill(null)} className="text-xs underline">
              Clear form
            </button>
          </div>
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
