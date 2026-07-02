import { z } from "zod";

// Server Actions receive FormData, where every field is a string and an
// empty input arrives as "" rather than being omitted — so "optional" has
// to be taught to treat "" as "not provided" before the real validation runs.
export const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional()
);

export const optionalNonNegativeInt = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.coerce.number().int().min(0).optional()
);

export const optionalNonNegativeNumber = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.coerce.number().min(0).optional()
);

export const createExerciseSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  category: z.string().trim().min(1, "Category is required"),
  equipment: optionalText,
  muscleGroup: optionalText,
  targetMuscle: optionalText,
  instructions: optionalText,
  targetReps: optionalNonNegativeInt,
  targetWeightKg: optionalNonNegativeNumber,
  targetDurationSeconds: optionalNonNegativeInt,
  targetDistanceMeters: optionalNonNegativeNumber,
});

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;

// Reused on the detail page for editing targets on any exercise (library or
// custom) — deliberately just the four target fields, nothing else editable.
export const exerciseTargetsSchema = z.object({
  targetReps: optionalNonNegativeInt,
  targetWeightKg: optionalNonNegativeNumber,
  targetDurationSeconds: optionalNonNegativeInt,
  targetDistanceMeters: optionalNonNegativeNumber,
});

export type ExerciseTargetsInput = z.infer<typeof exerciseTargetsSchema>;


// One row of the ad-hoc/workout logging form. Mirrors logged_sets' own
// columns exactly — every metric optional except setNumber, since not every
// exercise uses every metric (reps/weight for lifts, duration/distance for
// cardio, etc).
export const logSetRowSchema = z.object({
  setNumber: z.coerce.number().int().min(1),
  plannedReps: optionalNonNegativeInt,
  reps: optionalNonNegativeInt,
  plannedWeightKg: optionalNonNegativeNumber,
  weightKg: optionalNonNegativeNumber,
  plannedDurationSeconds: optionalNonNegativeInt,
  durationSeconds: optionalNonNegativeInt,
  plannedDistanceMeters: optionalNonNegativeNumber,
  distanceMeters: optionalNonNegativeNumber,
});

export type LogSetRowInput = z.infer<typeof logSetRowSchema>;


export const createWorkoutSlotSchema = z.object({
  exerciseId: z.string().uuid(),
  targetSets: z.coerce.number().int().min(1),
});

export type CreateWorkoutSlotInput = z.infer<typeof createWorkoutSlotSchema>;

export const createWorkoutSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  notes: optionalText,
});

export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
