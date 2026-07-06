ALTER TABLE "exercises" ADD COLUMN "tracks_reps" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "tracks_weight" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "tracks_duration" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "tracks_distance" boolean DEFAULT false NOT NULL;
UPDATE "exercises" SET "tracks_duration" = true, "tracks_distance" = true WHERE "category" = 'cardio';--> statement-breakpoint
UPDATE "exercises" SET "tracks_reps" = true, "tracks_weight" = true WHERE "category" != 'cardio';