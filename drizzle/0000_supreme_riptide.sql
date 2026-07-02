CREATE TABLE "exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" text,
	"user_id" uuid,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"equipment" text,
	"muscle_group" text,
	"target_muscle" text,
	"secondary_muscles" text[],
	"instructions" text,
	"instruction_steps" text[],
	"target_reps" integer,
	"target_weight_kg" real,
	"target_duration_seconds" integer,
	"target_distance_meters" real,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exercises_external_id_unique" UNIQUE("external_id"),
	CONSTRAINT "exercises_target_reps_check" CHECK ("exercises"."target_reps" IS NULL OR "exercises"."target_reps" >= 0),
	CONSTRAINT "exercises_target_weight_kg_check" CHECK ("exercises"."target_weight_kg" IS NULL OR "exercises"."target_weight_kg" >= 0),
	CONSTRAINT "exercises_target_duration_seconds_check" CHECK ("exercises"."target_duration_seconds" IS NULL OR "exercises"."target_duration_seconds" >= 0),
	CONSTRAINT "exercises_target_distance_meters_check" CHECK ("exercises"."target_distance_meters" IS NULL OR "exercises"."target_distance_meters" >= 0)
);
--> statement-breakpoint
CREATE TABLE "logged_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" uuid,
	"workout_id" uuid,
	"exercise_id" uuid NOT NULL,
	"set_number" integer NOT NULL,
	"performed_at" timestamp with time zone NOT NULL,
	"planned_reps" integer,
	"reps" integer,
	"planned_weight_kg" real,
	"weight_kg" real,
	"planned_duration_seconds" integer,
	"duration_seconds" integer,
	"planned_distance_meters" real,
	"distance_meters" real,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "logged_sets_set_number_check" CHECK ("logged_sets"."set_number" >= 1),
	CONSTRAINT "logged_sets_reps_check" CHECK ("logged_sets"."reps" IS NULL OR "logged_sets"."reps" >= 0),
	CONSTRAINT "logged_sets_weight_kg_check" CHECK ("logged_sets"."weight_kg" IS NULL OR "logged_sets"."weight_kg" >= 0),
	CONSTRAINT "logged_sets_duration_seconds_check" CHECK ("logged_sets"."duration_seconds" IS NULL OR "logged_sets"."duration_seconds" >= 0),
	CONSTRAINT "logged_sets_distance_meters_check" CHECK ("logged_sets"."distance_meters" IS NULL OR "logged_sets"."distance_meters" >= 0),
	CONSTRAINT "logged_sets_planned_reps_check" CHECK ("logged_sets"."planned_reps" IS NULL OR "logged_sets"."planned_reps" >= 0),
	CONSTRAINT "logged_sets_planned_weight_kg_check" CHECK ("logged_sets"."planned_weight_kg" IS NULL OR "logged_sets"."planned_weight_kg" >= 0),
	CONSTRAINT "logged_sets_planned_duration_seconds_check" CHECK ("logged_sets"."planned_duration_seconds" IS NULL OR "logged_sets"."planned_duration_seconds" >= 0),
	CONSTRAINT "logged_sets_planned_distance_meters_check" CHECK ("logged_sets"."planned_distance_meters" IS NULL OR "logged_sets"."planned_distance_meters" >= 0)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"display_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workout_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"target_sets" integer DEFAULT 3 NOT NULL,
	CONSTRAINT "workout_exercises_workout_position_unique" UNIQUE("workout_id","position"),
	CONSTRAINT "workout_exercises_target_sets_check" CHECK ("workout_exercises"."target_sets" >= 1)
);
--> statement-breakpoint
CREATE TABLE "workouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "logged_sets" ADD CONSTRAINT "logged_sets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "logged_sets" ADD CONSTRAINT "logged_sets_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "logged_sets" ADD CONSTRAINT "logged_sets_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "exercises_category_idx" ON "exercises" USING btree ("category");--> statement-breakpoint
CREATE INDEX "exercises_equipment_idx" ON "exercises" USING btree ("equipment");--> statement-breakpoint
CREATE INDEX "exercises_target_muscle_idx" ON "exercises" USING btree ("target_muscle");--> statement-breakpoint
CREATE INDEX "exercises_user_id_idx" ON "exercises" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "logged_sets_user_exercise_performed_idx" ON "logged_sets" USING btree ("user_id","exercise_id","performed_at");--> statement-breakpoint
CREATE INDEX "logged_sets_user_performed_idx" ON "logged_sets" USING btree ("user_id","performed_at");--> statement-breakpoint
CREATE INDEX "logged_sets_session_idx" ON "logged_sets" USING btree ("session_id");