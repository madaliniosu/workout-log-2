export type ExerciseFormValues = {
  name: string;
  category: string;
  equipment: string | null;
  muscleGroup: string | null;
  targetMuscle: string | null;
  instructions: string | null;
  tracksReps: boolean;
  tracksWeight: boolean;
  tracksDuration: boolean;
  tracksDistance: boolean;
};

export type FilterOptions = {
  categories: string[];
  equipmentTypes: string[];
  muscleGroups: string[];
  targetMuscles: string[];
};

// Shared by both the Add Exercise flow (blank, or pre-filled from a
// selected library exercise) and the Edit flow (pre-filled from an
// already-owned exercise's current values). Only the action, defaultValues,
// and submitLabel differ between the two call sites.
export function ExerciseForm({
  action,
  filterOptions,
  defaultValues,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  filterOptions: FilterOptions;
  defaultValues?: ExerciseFormValues | null;
  submitLabel: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-4 border-t border-border pt-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Name</span>
        <input
          name="name"
          required
          defaultValue={defaultValues?.name ?? ""}
          className="rounded-lg border border-border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Category</span>
        <select
          name="category"
          required
          defaultValue={defaultValues?.category ?? ""}
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
          defaultValue={defaultValues?.equipment ?? ""}
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
          defaultValue={defaultValues?.muscleGroup ?? ""}
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
          defaultValue={defaultValues?.targetMuscle ?? ""}
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
          defaultValue={defaultValues?.instructions ?? ""}
          className="rounded-lg border border-border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </label>

      <fieldset className="flex flex-col gap-2 rounded-xl border border-border p-4">
        <legend className="px-1 text-sm font-medium">What does this exercise measure?</legend>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="tracksReps" defaultChecked={defaultValues?.tracksReps ?? false} className="accent-accent" />
          Reps
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="tracksWeight" defaultChecked={defaultValues?.tracksWeight ?? false} className="accent-accent" />
          Weight
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="tracksDuration" defaultChecked={defaultValues?.tracksDuration ?? false} className="accent-accent" />
          Duration
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="tracksDistance" defaultChecked={defaultValues?.tracksDistance ?? false} className="accent-accent" />
          Distance
        </label>
      </fieldset>

      <button
        type="submit"
        className="mt-2 self-end rounded-xl bg-accent px-4 py-2 font-heading text-sm font-semibold text-foreground"
      >
        {submitLabel}
      </button>
    </form>
  );
}
