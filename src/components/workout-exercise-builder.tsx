"use client";

import { useState } from "react";

type ExerciseOption = { id: string; name: string };

type Card = {
  key: string;
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
};

function createCard(): Card {
  return { key: crypto.randomUUID(), exerciseId: "", exerciseName: "", targetSets: 3 };
}

export function WorkoutExerciseBuilder({ exercises }: { exercises: ExerciseOption[] }) {
  const [cards, setCards] = useState<Card[]>([createCard()]);

  function updateCard(key: string, changes: Partial<Card>) {
    setCards((prev) => prev.map((card) => (card.key === key ? { ...card, ...changes } : card)));
  }

  function removeCard(key: string) {
    setCards((prev) => prev.filter((card) => card.key !== key));
  }

  return (
    <div className="flex flex-col gap-4">
      {cards.map((card, i) => (
        <fieldset key={card.key} className="border rounded p-4">
          <legend className="px-1 text-sm font-medium">Exercise {i + 1}</legend>

          <div className="flex flex-wrap items-end gap-4">
            <ExerciseCombobox
              exercises={exercises}
              value={card.exerciseId}
              displayValue={card.exerciseName}
              onSelect={(exercise) =>
                updateCard(card.key, { exerciseId: exercise.id, exerciseName: exercise.name })
              }
            />

            <SetsStepper
              value={card.targetSets}
              onChange={(targetSets) => updateCard(card.key, { targetSets })}
            />

            <button
              type="button"
              onClick={() => removeCard(card.key)}
              disabled={cards.length === 1}
              className="border rounded px-3 py-1 text-sm text-red-600 disabled:text-zinc-300 disabled:border-zinc-200"
            >
              Remove
            </button>
          </div>
        </fieldset>
      ))}

      <button
        type="button"
        onClick={() => setCards((prev) => [...prev, createCard()])}
        className="self-start border rounded px-3 py-2 text-sm"
      >
        + Add exercise
      </button>
    </div>
  );
}

function ExerciseCombobox({
  exercises,
  value,
  displayValue,
  onSelect,
}: {
  exercises: ExerciseOption[];
  value: string;
  displayValue: string;
  onSelect: (exercise: ExerciseOption) => void;
}) {
  const [query, setQuery] = useState(displayValue);
  const [isOpen, setIsOpen] = useState(false);

  const filtered =
    query.trim() === ""
      ? exercises
      : exercises.filter((exercise) => exercise.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="relative flex flex-col gap-1">
      <span className="text-xs text-zinc-500">Exercise</span>
      {/* The hidden input is what actually gets submitted with the form —
          the visible text input is just for searching/display. */}
      <input type="hidden" name="exerciseId" value={value} required />
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        placeholder="Search exercises..."
        className="border rounded px-2 py-1 w-56"
      />

      {isOpen && (
        <ul className="absolute top-full z-10 mt-1 max-h-56 w-56 overflow-auto rounded border bg-white shadow">
          {filtered.length === 0 && <li className="px-2 py-1 text-sm text-zinc-400">No matches</li>}
          {filtered.map((exercise) => (
            <li key={exercise.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect(exercise);
                  setQuery(exercise.name);
                  setIsOpen(false);
                }}
                className="block w-full px-2 py-1 text-left text-sm hover:bg-zinc-100"
              >
                {exercise.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SetsStepper({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-zinc-500">Sets</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, value - 1))}
          className="border rounded w-7 h-7 flex items-center justify-center"
        >
          −
        </button>
        <input type="hidden" name="targetSets" value={value} />
        <span className="w-6 text-center">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="border rounded w-7 h-7 flex items-center justify-center"
        >
          +
        </button>
      </div>
    </div>
  );
}
