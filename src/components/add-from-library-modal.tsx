"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/modal";
import { addExerciseToLibraryAction } from "@/actions/exercise-actions";

type LibraryExercise = {
  id: string;
  name: string;
  category: string;
  equipment: string | null;
  targetMuscle: string | null;
};

type FilterOptions = {
  categories: string[];
  equipmentTypes: string[];
  targetMuscles: string[];
};

export function AddFromLibraryModal({
  exercises,
  alreadyAddedIds,
  filterOptions,
}: {
  exercises: LibraryExercise[];
  alreadyAddedIds: string[];
  filterOptions: FilterOptions;
}) {
  return (
    <Modal triggerLabel="Add exercise from library" triggerClassName="text-sm underline" title="Add from library">
      {() => (
        <LibraryPicker exercises={exercises} initialAddedIds={alreadyAddedIds} filterOptions={filterOptions} />
      )}
    </Modal>
  );
}

// All 1,324 library exercises are fetched once, server-side, and passed in
// as a prop — filtering here is plain in-memory array filtering on every
// keystroke/selection, so there's no network round-trip per filter change.
function LibraryPicker({
  exercises,
  initialAddedIds,
  filterOptions,
}: {
  exercises: LibraryExercise[];
  initialAddedIds: string[];
  filterOptions: FilterOptions;
}) {
  const [category, setCategory] = useState("");
  const [equipment, setEquipment] = useState("");
  const [targetMuscle, setTargetMuscle] = useState("");
  const [addedIds, setAddedIds] = useState(new Set(initialAddedIds));
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = exercises.filter(
    (exercise) =>
      !addedIds.has(exercise.id) &&
      (category === "" || exercise.category === category) &&
      (equipment === "" || exercise.equipment === equipment) &&
      (targetMuscle === "" || exercise.targetMuscle === targetMuscle)
  );

  function handleAdd(exerciseId: string) {
    setPendingId(exerciseId);
    startTransition(async () => {
      await addExerciseToLibraryAction(exerciseId);
      setAddedIds((prev) => new Set(prev).add(exerciseId));
      setPendingId(null);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-border px-2 py-1"
        >
          <option value="">All categories</option>
          {filterOptions.categories.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <select
          value={equipment}
          onChange={(e) => setEquipment(e.target.value)}
          className="rounded-lg border border-border px-2 py-1"
        >
          <option value="">All equipment</option>
          {filterOptions.equipmentTypes.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <select
          value={targetMuscle}
          onChange={(e) => setTargetMuscle(e.target.value)}
          className="rounded-lg border border-border px-2 py-1"
        >
          <option value="">All target muscles</option>
          {filterOptions.targetMuscles.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-muted">{filtered.length} exercises</p>

      <ul className="flex flex-col divide-y divide-border">
        {filtered.map((exercise) => (
          <li key={exercise.id} className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-foreground">{exercise.name}</p>
              <p className="text-xs text-muted">{exercise.category}</p>
            </div>
            <button
              type="button"
              onClick={() => handleAdd(exercise.id)}
              disabled={pendingId === exercise.id}
              className="rounded-lg border border-border px-3 py-1 text-sm text-foreground hover:bg-background disabled:opacity-50"
            >
              {pendingId === exercise.id ? "Adding..." : "Add"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
