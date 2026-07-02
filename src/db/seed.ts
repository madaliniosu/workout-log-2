import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { db } from "./client";
import { exercises } from "./schema";
import { sql } from "drizzle-orm";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATASET_PATH = join(
  __dirname,
  "../../exercises-dataset-main/data/exercises_en.json"
);

type DatasetExercise = {
  id: string;
  name: string;
  category: string;
  body_part: string;
  equipment: string | null;
  instructions: string | null;
  instruction_steps: string[] | null;
  muscle_group: string | null;
  secondary_muscles: string[] | null;
  target: string | null;
  image: string | null;
  gif_url: string | null;
  media_id: string | null;
  created_at: string;
};

const BATCH_SIZE = 200;

async function seed() {
  const raw = readFileSync(DATASET_PATH, "utf-8");
  const dataset: DatasetExercise[] = JSON.parse(raw);

  console.log(`Loaded ${dataset.length} exercises from dataset.`);

  // The plan treats body_part as an exact duplicate of category and drops
  // it — verify that assumption holds for every row before trusting it,
  // rather than relying on a spot-check.
  const mismatches = dataset.filter((ex) => ex.body_part !== ex.category);
  if (mismatches.length > 0) {
    console.error(
      `Found ${mismatches.length} rows where body_part !== category:`
    );
    console.error(mismatches.slice(0, 5).map((ex) => ({
      id: ex.id,
      name: ex.name,
      category: ex.category,
      body_part: ex.body_part,
    })));
    throw new Error(
      "body_part/category mismatch found — stopping before dropping body_part. Review before continuing."
    );
  }
  console.log("Verified: body_part === category for all rows.");

  const rows = dataset.map((ex) => ({
    externalId: ex.id,
    name: ex.name,
    category: ex.category,
    equipment: ex.equipment,
    muscleGroup: ex.muscle_group,
    targetMuscle: ex.target,
    secondaryMuscles: ex.secondary_muscles,
    instructions: ex.instructions,
    instructionSteps: ex.instruction_steps,
    // target_reps/weight/duration/distance intentionally omitted — personal
    // goals set by the user later, not seeded from the dataset.
    // image/gif_url/media_id/dataset created_at intentionally dropped —
    // see plan's seeding strategy for why.
  }));

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    await db
      .insert(exercises)
      .values(batch)
      .onConflictDoUpdate({
        target: exercises.externalId,
        set: {
          name: sql`excluded.name`,
          category: sql`excluded.category`,
          equipment: sql`excluded.equipment`,
          muscleGroup: sql`excluded.muscle_group`,
          targetMuscle: sql`excluded.target_muscle`,
          secondaryMuscles: sql`excluded.secondary_muscles`,
          instructions: sql`excluded.instructions`,
          instructionSteps: sql`excluded.instruction_steps`,
          updatedAt: sql`now()`,
        },
      });
    console.log(`Seeded ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length}`);
  }

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
