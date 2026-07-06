"use client";

import { Modal } from "@/components/modal";
import { createExerciseAction } from "@/actions/exercise-actions";

type FilterOptions = {
    categories: string[];
    equipmentTypes: string[];
    muscleGroups: string[];
    targetMuscles: string[];
};

export function AddCustomExerciseModal({
    filterOptions,
}: {
    filterOptions: FilterOptions;
}) {
    return (
        <Modal
            triggerLabel="Add exercise"
            triggerClassName="text-sm underline"
            title="Add exercise"
        >
            <form action={createExerciseAction} className="flex flex-col gap-4">
                <label className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Name</span>
                    <input
                        name="name"
                        required
                        className="rounded-lg border border-border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </label>

                <label className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Category</span>
                    <select
                        name="category"
                        required
                        defaultValue=""
                        className="rounded-lg border border-border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                        <option value="" disabled>
                            Select a category
                        </option>
                        {filterOptions.categories.map((value) => (
                            <option key={value} value={value}>
                                {value}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Equipment</span>
                    <select
                        name="equipment"
                        defaultValue=""
                        className="rounded-lg border border-border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                        <option value="">None</option>
                        {filterOptions.equipmentTypes.map((value) => (
                            <option key={value} value={value}>
                                {value}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Muscle group</span>
                    <select
                        name="muscleGroup"
                        defaultValue=""
                        className="rounded-lg border border-border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                        <option value="">None</option>
                        {filterOptions.muscleGroups.map((value) => (
                            <option key={value} value={value}>
                                {value}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Target muscle</span>
                    <select
                        name="targetMuscle"
                        defaultValue=""
                        className="rounded-lg border border-border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                        <option value="">None</option>
                        {filterOptions.targetMuscles.map((value) => (
                            <option key={value} value={value}>
                                {value}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Instructions</span>
                    <textarea
                        name="instructions"
                        rows={3}
                        className="rounded-lg border border-border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </label>

                <fieldset className="flex flex-col gap-2 rounded-xl border border-border p-4">
                    <legend className="px-1 text-sm font-medium">
                        What does this exercise measure?
                    </legend>

                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            name="tracksReps"
                            className="accent-accent"
                        />
                        Reps
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            name="tracksWeight"
                            className="accent-accent"
                        />
                        Weight
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            name="tracksDuration"
                            className="accent-accent"
                        />
                        Duration
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            name="tracksDistance"
                            className="accent-accent"
                        />
                        Distance
                    </label>
                </fieldset>

                <button
                    type="submit"
                    className="mt-2 self-start rounded-xl bg-accent px-4 py-2 font-heading text-sm font-semibold text-foreground"
                >
                    Create exercise
                </button>
            </form>
        </Modal>
    );
}
