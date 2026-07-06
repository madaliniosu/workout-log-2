import {
  pgTable,
  uuid,
  text,
  integer,
  real,
  boolean,
  timestamp,
  index,
  unique,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ---------------------------------------------------------------------------
// users
// ---------------------------------------------------------------------------
// Minimal now — exists only so every other table can carry a nullable FK
// without a future schema migration. No auth fields yet; when auth is added,
// this table gains columns (email, etc.) and a real auth library sits in
// front of it — the FK shape below never changes.
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  displayName: text("display_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// exercises
// ---------------------------------------------------------------------------
// One table for both the built-in library (1,324 seeded rows) and
// user-created custom exercises. userId NULL = built-in/global; userId set =
// personal custom exercise (this doubles as the "is custom" signal — no
// separate boolean that could drift out of sync).
//
// Also carries the user's personal per-set target for this exercise: what
// they're currently aiming for, independent of which workout it's used in.
// These target_* columns are nullable and left blank at seed time — they're
// set by the user later, not sourced data.
export const exercises = pgTable(
  "exercises",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    externalId: text("external_id").unique(), // dataset's original "0001" id; NULL for custom exercises
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: text("category").notNull(), // e.g. "chest", "upper legs"
    equipment: text("equipment"),
    muscleGroup: text("muscle_group"),
    // Renamed from the dataset's "target" field to avoid clashing with the
    // targetReps/etc performance goals below — this is the muscle worked,
    // those are performance goals.
    targetMuscle: text("target_muscle"),
    secondaryMuscles: text("secondary_muscles").array(),
    instructions: text("instructions"),
    instructionSteps: text("instruction_steps").array(),
    targetReps: integer("target_reps"),
    targetWeightKg: real("target_weight_kg"),
    targetDurationSeconds: integer("target_duration_seconds"),
    targetDistanceMeters: real("target_distance_meters"),
        // Which metrics this exercise actually measures — drives which input
    // pairs (planned/actual) get shown when logging it. Independent of the
    // target_* values above: an exercise can track reps without a specific
    // target number set yet.
    tracksReps: boolean("tracks_reps").notNull().default(false),
    tracksWeight: boolean("tracks_weight").notNull().default(false),
    tracksDuration: boolean("tracks_duration").notNull().default(false),
    tracksDistance: boolean("tracks_distance").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("exercises_category_idx").on(table.category),
    index("exercises_equipment_idx").on(table.equipment),
    index("exercises_target_muscle_idx").on(table.targetMuscle),
    index("exercises_user_id_idx").on(table.userId),
    check("exercises_target_reps_check", sql`${table.targetReps} IS NULL OR ${table.targetReps} >= 0`),
    check("exercises_target_weight_kg_check", sql`${table.targetWeightKg} IS NULL OR ${table.targetWeightKg} >= 0`),
    check(
      "exercises_target_duration_seconds_check",
      sql`${table.targetDurationSeconds} IS NULL OR ${table.targetDurationSeconds} >= 0`
    ),
    check(
      "exercises_target_distance_meters_check",
      sql`${table.targetDistanceMeters} IS NULL OR ${table.targetDistanceMeters} >= 0`
    ),
  ]
);

// ---------------------------------------------------------------------------
// workouts
// ---------------------------------------------------------------------------
// Named, reusable templates.
export const workouts = pgTable("workouts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  notes: text("notes"), // template-level notes, not a per-visit log note
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// ---------------------------------------------------------------------------
// workoutExercises
// ---------------------------------------------------------------------------
// The predefined sequence: which exercises, in what order, how many sets of
// each in THIS workout. Per-set intensity is NOT here — it comes from the
// exercise's own target_* columns above. Rows are replaced wholesale
// whenever a workout is edited, so no per-row updated_at is needed.
export const workoutExercises = pgTable(
  "workout_exercises",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workoutId: uuid("workout_id")
      .notNull()
      .references(() => workouts.id, { onDelete: "cascade" }),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "restrict" }),
    position: integer("position").notNull(), // display/entry order within the workout
    targetSets: integer("target_sets").notNull().default(3),
  },
  (table) => [
    unique("workout_exercises_workout_position_unique").on(table.workoutId, table.position),
    check("workout_exercises_target_sets_check", sql`${table.targetSets} >= 1`),
  ]
);

// ---------------------------------------------------------------------------
// loggedSets
// ---------------------------------------------------------------------------
// The actual execution log — one row per set performed. Named "logged_sets",
// not "sets", to stay clear of the SQL SET keyword.
//
// There is no parent "session" row: a workout visit is the group of rows
// sharing one session_id — a token generated once per save (NOT a foreign
// key, no session table). This decouples "when it happened" (performed_at,
// freely editable, may be date-only) from "which visit these sets belong
// to" (session_id, stable and unique) — a shared-timestamp-only approach
// would collide two backdated same-day visits into one.
//
// Carries both what was planned (copied from the exercise's target_* at log
// time, or entered directly for ad-hoc) and what was actually executed.
export const loggedSets = pgTable(
  "logged_sets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id").notNull(), // grouping token for one visit — not a FK
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    workoutId: uuid("workout_id").references(() => workouts.id, { onDelete: "set null" }), // NULL = ad-hoc
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "restrict" }),
    setNumber: integer("set_number").notNull(), // 1, 2, 3... for this exercise within this visit
    performedAt: timestamp("performed_at", { withTimezone: true }).notNull(), // event time
    plannedReps: integer("planned_reps"),
    reps: integer("reps"),
    plannedWeightKg: real("planned_weight_kg"),
    weightKg: real("weight_kg"),
    plannedDurationSeconds: integer("planned_duration_seconds"),
    durationSeconds: integer("duration_seconds"),
    plannedDistanceMeters: real("planned_distance_meters"),
    distanceMeters: real("distance_meters"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // The progress-chart index: a user's timeline for one exercise.
    index("logged_sets_user_exercise_performed_idx").on(table.userId, table.exerciseId, table.performedAt),
    // History / recent-activity views.
    index("logged_sets_user_performed_idx").on(table.userId, table.performedAt),
    // Load every set in one visit; group history by visit.
    index("logged_sets_session_idx").on(table.sessionId),
    check("logged_sets_set_number_check", sql`${table.setNumber} >= 1`),
    check("logged_sets_reps_check", sql`${table.reps} IS NULL OR ${table.reps} >= 0`),
    check("logged_sets_weight_kg_check", sql`${table.weightKg} IS NULL OR ${table.weightKg} >= 0`),
    check(
      "logged_sets_duration_seconds_check",
      sql`${table.durationSeconds} IS NULL OR ${table.durationSeconds} >= 0`
    ),
    check(
      "logged_sets_distance_meters_check",
      sql`${table.distanceMeters} IS NULL OR ${table.distanceMeters} >= 0`
    ),
    check("logged_sets_planned_reps_check", sql`${table.plannedReps} IS NULL OR ${table.plannedReps} >= 0`),
    check(
      "logged_sets_planned_weight_kg_check",
      sql`${table.plannedWeightKg} IS NULL OR ${table.plannedWeightKg} >= 0`
    ),
    check(
      "logged_sets_planned_duration_seconds_check",
      sql`${table.plannedDurationSeconds} IS NULL OR ${table.plannedDurationSeconds} >= 0`
    ),
    check(
      "logged_sets_planned_distance_meters_check",
      sql`${table.plannedDistanceMeters} IS NULL OR ${table.plannedDistanceMeters} >= 0`
    ),
  ]
);


// ---------------------------------------------------------------------------
// userExercises
// ---------------------------------------------------------------------------
// Tracks which library exercises (exercises.userId IS NULL) a user has
// explicitly added to their personal working set, via "Add exercise from
// library." Custom exercises don't need a row here — ownership via
// exercises.userId already makes those personal. This is a deliberate 6th
// table: "which library exercises does this user actually use" isn't usage
// history (you can add one before ever logging it) and isn't ownership
// (library exercises belong to no one) — it needed its own table.
export const userExercises = pgTable(
  "user_exercises",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("user_exercises_user_exercise_unique").on(table.userId, table.exerciseId),
    index("user_exercises_user_id_idx").on(table.userId),
  ]
);
