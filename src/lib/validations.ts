import { z } from "zod";

// Server Actions receive FormData, where every field is a string and an
// empty input arrives as "" rather than being omitted — so "optional" has
// to be taught to treat "" as "not provided" before the real validation runs.
const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional()
);

const optionalNonNegativeInt = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.coerce.number().int().min(0).optional()
);

const optionalNonNegativeNumber = z.preprocess(
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
