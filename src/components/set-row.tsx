type SetRowProps = {
  exerciseId: string;
  setNumber: number;
  plannedReps?: number | null;
  plannedWeightKg?: number | null;
  plannedDurationSeconds?: number | null;
  plannedDistanceMeters?: number | null;
};

// Renders one set's inputs: a planned value (pre-filled from the exercise's
// target, editable) paired with an actual value (blank, filled in after the
// set is performed) — for every metric. All fields share names across every
// row instance so the Server Action can group them back with getAll().
export function SetRow({
  exerciseId,
  setNumber,
  plannedReps,
  plannedWeightKg,
  plannedDurationSeconds,
  plannedDistanceMeters,
}: SetRowProps) {
  return (
    <fieldset className="border rounded p-4">
      <legend className="px-1 text-sm font-medium">Set {setNumber}</legend>
      <input type="hidden" name="exerciseId" value={exerciseId} />
      <input type="hidden" name="setNumber" value={setNumber} />

      <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">Planned reps</span>
          <input name="plannedReps" type="number" min={0} step={1} defaultValue={plannedReps ?? ""} className="border rounded px-2 py-1" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">Reps</span>
          <input name="reps" type="number" min={0} step={1} className="border rounded px-2 py-1" />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">Planned weight (kg)</span>
          <input name="plannedWeightKg" type="number" min={0} step="any" defaultValue={plannedWeightKg ?? ""} className="border rounded px-2 py-1" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">Weight (kg)</span>
          <input name="weightKg" type="number" min={0} step="any" className="border rounded px-2 py-1" />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">Planned duration (s)</span>
          <input name="plannedDurationSeconds" type="number" min={0} step={1} defaultValue={plannedDurationSeconds ?? ""} className="border rounded px-2 py-1" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">Duration (s)</span>
          <input name="durationSeconds" type="number" min={0} step={1} className="border rounded px-2 py-1" />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">Planned distance (m)</span>
          <input name="plannedDistanceMeters" type="number" min={0} step="any" defaultValue={plannedDistanceMeters ?? ""} className="border rounded px-2 py-1" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">Distance (m)</span>
          <input name="distanceMeters" type="number" min={0} step="any" className="border rounded px-2 py-1" />
        </label>
      </div>
    </fieldset>
  );
}
