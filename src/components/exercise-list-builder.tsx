"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type ExerciseOption = { id: string; name: string };

type Card = {
  key: string;
  exerciseId: string;
  exerciseName: string;
  count: number;
};

function createCard(initialCount: number): Card {
  return { key: crypto.randomUUID(), exerciseId: "", exerciseName: "", count: initialCount };
}

export function ExerciseListBuilder({
  exercises,
  countFieldName,
  countLabel = "Sets",
  initialCount = 3,
  initialCards,
}: {
  exercises: ExerciseOption[];
  countFieldName: string;
  countLabel?: string;
  initialCount?: number;
  initialCards?: { exerciseId: string; exerciseName: string; count: number }[];
}) {
  const [cards, setCards] = useState<Card[]>(() =>
    initialCards && initialCards.length > 0
      ? initialCards.map((card) => ({ key: crypto.randomUUID(), ...card }))
      : [createCard(initialCount)]
  );

  function updateCard(key: string, changes: Partial<Card>) {
    setCards((prev) => prev.map((card) => (card.key === key ? { ...card, ...changes } : card)));
  }

  function removeCard(key: string) {
    setCards((prev) => prev.filter((card) => card.key !== key));
  }

  return (
    <div className="flex flex-col gap-4">
      {cards.map((card, i) => (
        <fieldset key={card.key} className="rounded-xl border border-border bg-white p-4">
          <legend className="px-1 font-heading text-sm font-semibold text-foreground">
            Exercise {i + 1}
          </legend>

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
              name={countFieldName}
              label={countLabel}
              value={card.count}
              onChange={(count) => updateCard(card.key, { count })}
            />

            <button
              type="button"
              onClick={() => removeCard(card.key)}
              disabled={cards.length === 1}
              aria-label="Remove exercise"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Trash2 size={18} strokeWidth={2} />
            </button>
          </div>
        </fieldset>
      ))}

      <button
        type="button"
        onClick={() => setCards((prev) => [...prev, createCard(initialCount)])}
        className="flex w-fit items-center gap-2 rounded-xl border border-border px-4 py-2 font-heading text-sm font-semibold text-foreground hover:bg-white"
      >
        <Plus size={16} strokeWidth={2} />
        Add exercise
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
      <span className="font-heading text-xs font-semibold text-muted">Exercise</span>
      {/* The hidden input is what actually gets submitted with the form —
          the visible text input is just for searching/display. Validation
          lives on the visible input below: hidden inputs don't support
          native required validation in browsers. */}
      <input type="hidden" name="exerciseId" value={value} />
      <input
        type="text"
        value={query}
        required
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => {
          setTimeout(() => {
            setIsOpen(false);
            // Typed text that was never actually selected leaves exerciseId
            // empty — clear it so `required` on this field can catch it.
            if (!value) setQuery("");
          }, 150);
        }}
        placeholder="Search exercises..."
        className="h-11 w-56 rounded-xl border border-border px-4 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
      />

      {isOpen && (
        <ul className="absolute top-full z-10 mt-1 max-h-56 w-56 overflow-auto rounded-xl border border-border bg-white shadow-lg">
          {filtered.length === 0 && <li className="px-3 py-2 text-sm text-muted">No matches</li>}
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
                className="block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-background"
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

function SetsStepper({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-heading text-xs font-semibold text-muted">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, value - 1))}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-foreground hover:bg-background"
        >
          −
        </button>
        <input type="hidden" name={name} value={value} />
        <span className="w-6 text-center font-heading text-sm font-semibold text-foreground">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-foreground hover:bg-background"
        >
          +
        </button>
      </div>
    </div>
  );
}
