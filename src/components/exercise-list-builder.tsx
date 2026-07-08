"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { TracksFlags } from "@/lib/format-set";

export type ExerciseOption = TracksFlags & {
  id: string;
  name: string;
  targetReps: number | null;
  targetWeightKg: number | null;
  targetDurationSeconds: number | null;
  targetDistanceMeters: number | null;
};

export type InitialCard = TracksFlags & {
  exerciseId: string;
  exerciseName: string;
  count: number;
  targetReps: number | null;
  targetWeightKg: number | null;
  targetDurationSeconds: number | null;
  targetDistanceMeters: number | null;
};

// Target values are strings while editing (they're controlled inputs);
// the Server Action's Zod schema turns them back into numbers on submit.
type Card = TracksFlags & {
  key: string;
  exerciseId: string;
  exerciseName: string;
  count: number;
  targetReps: string;
  targetWeightKg: string;
  targetDurationSeconds: string;
  targetDistanceMeters: string;
};

const noTracks: TracksFlags = {
  tracksReps: false,
  tracksWeight: false,
  tracksDuration: false,
  tracksDistance: false,
};

function createCard(initialCount: number): Card {
  return {
    key: crypto.randomUUID(),
    exerciseId: "",
    exerciseName: "",
    count: initialCount,
    ...noTracks,
    targetReps: "",
    targetWeightKg: "",
    targetDurationSeconds: "",
    targetDistanceMeters: "",
  };
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
  initialCards?: InitialCard[];
}) {
  const [cards, setCards] = useState<Card[]>(() =>
    initialCards && initialCards.length > 0
      ? initialCards.map((card) => ({
          key: crypto.randomUUID(),
          ...card,
          targetReps: card.targetReps?.toString() ?? "",
          targetWeightKg: card.targetWeightKg?.toString() ?? "",
          targetDurationSeconds: card.targetDurationSeconds?.toString() ?? "",
          targetDistanceMeters: card.targetDistanceMeters?.toString() ?? "",
        }))
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
          <legend className="px-1 font-heading text-sm font-semibold text-text">
            Exercise {i + 1}
          </legend>

          <div className="flex flex-wrap items-end gap-4">
            <ExerciseCombobox
              exercises={exercises}
              value={card.exerciseId}
              displayValue={card.exerciseName}
              onSelect={(exercise) =>
                updateCard(card.key, {
                  exerciseId: exercise.id,
                  exerciseName: exercise.name,
                  tracksReps: exercise.tracksReps,
                  tracksWeight: exercise.tracksWeight,
                  tracksDuration: exercise.tracksDuration,
                  tracksDistance: exercise.tracksDistance,
                  targetReps: exercise.targetReps?.toString() ?? "",
                  targetWeightKg: exercise.targetWeightKg?.toString() ?? "",
                  targetDurationSeconds: exercise.targetDurationSeconds?.toString() ?? "",
                  targetDistanceMeters: exercise.targetDistanceMeters?.toString() ?? "",
                })
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

          {/* One field per metric, always submitted: visible when the
              exercise tracks that metric, an empty hidden input when not.
              The hidden inputs keep the Server Action's parallel
              formData.getAll() arrays aligned across cards — dropping them
              would shift every later card's values onto the wrong slot.
              These edit the exercise's own target_* (shared across all
              workouts), not a per-workout override — see schema.ts. */}
          <div className="mt-4 flex flex-wrap gap-4">
            <TargetField
              shown={card.tracksReps}
              name="targetReps"
              label="Target reps"
              step={1}
              value={card.targetReps}
              onChange={(value) => updateCard(card.key, { targetReps: value })}
            />
            <TargetField
              shown={card.tracksWeight}
              name="targetWeightKg"
              label="Target weight (kg)"
              step="any"
              value={card.targetWeightKg}
              onChange={(value) => updateCard(card.key, { targetWeightKg: value })}
            />
            <TargetField
              shown={card.tracksDuration}
              name="targetDurationSeconds"
              label="Target duration (s)"
              step={1}
              value={card.targetDurationSeconds}
              onChange={(value) => updateCard(card.key, { targetDurationSeconds: value })}
            />
            <TargetField
              shown={card.tracksDistance}
              name="targetDistanceMeters"
              label="Target distance (m)"
              step="any"
              value={card.targetDistanceMeters}
              onChange={(value) => updateCard(card.key, { targetDistanceMeters: value })}
            />
          </div>
        </fieldset>
      ))}

      <button
        type="button"
        onClick={() => setCards((prev) => [...prev, createCard(initialCount)])}
        className="flex w-fit items-center gap-2 rounded-xl border border-border px-4 py-2 font-heading text-sm font-semibold text-text hover:bg-white"
      >
        <Plus size={16} strokeWidth={2} />
        Add exercise
      </button>
    </div>
  );
}

function TargetField({
  shown,
  name,
  label,
  step,
  value,
  onChange,
}: {
  shown: boolean;
  name: string;
  label: string;
  step: number | "any";
  value: string;
  onChange: (value: string) => void;
}) {
  if (!shown) {
    return <input type="hidden" name={name} value="" />;
  }

  return (
    <label className="flex flex-col gap-1">
      <span className="font-heading text-xs font-semibold text-muted">{label}</span>
      <input
        type="number"
        name={name}
        min={0}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-32 rounded-xl border border-border px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
      />
    </label>
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
        className="h-11 w-56 rounded-xl border border-border px-4 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
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
                className="block w-full px-3 py-2 text-left text-sm text-text hover:bg-background"
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
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-text hover:bg-background"
        >
          −
        </button>
        <input type="hidden" name={name} value={value} />
        <span className="w-6 text-center font-heading text-sm font-semibold text-text">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-text hover:bg-background"
        >
          +
        </button>
      </div>
    </div>
  );
}
