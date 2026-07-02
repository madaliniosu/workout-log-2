# Workout Log

A personal workout tracker — browse a built-in exercise library or add your own,
build reusable workout templates, log sets as you train, and track progress
(weight/volume over time) per exercise.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- [PostgreSQL](https://www.postgresql.org) via [Neon](https://neon.tech)
- [Drizzle ORM](https://orm.drizzle.team) for schema, migrations, and queries
- Server Actions for mutations (no separate REST API layer)

## Getting started

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```
2. Create a Postgres database (e.g. a free [Neon](https://neon.tech) project) and
   copy its **direct** (non-pooled) connection string.
3. Copy `.env.example` to `.env` and fill in `DATABASE_URL` with that string.
4. Apply the schema:
   ```bash
   npm run db:generate   # only needed after changing src/db/schema.ts
   npm run db:migrate
   ```
5. Seed the built-in exercise library (1,324 exercises):
   ```bash
   npm run db:seed
   ```
6. Run the dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
├── app/            # Next.js routes (pages + layouts)
├── db/
│   ├── schema.ts   # the entire data model, in one file
│   ├── client.ts   # Drizzle client
│   ├── seed.ts     # loads exercises-dataset-main/ into the exercises table
│   └── queries/    # the only place raw Drizzle queries are written
├── components/
├── lib/            # validation schemas, shared helpers
└── actions/        # Server Actions, grouped by domain
drizzle/            # generated SQL migrations (source of truth for schema history)
exercises-dataset-main/   # source exercise dataset, read only by db/seed.ts
```

## Data model notes

- `exercises` holds both the seeded library and user-created custom exercises
  (`user_id IS NULL` = library, `user_id` set = custom), and carries each
  exercise's personal target (reps/weight/duration/distance) as an evolving
  goal independent of any specific workout.
- There is no separate "workout session" table. A logged visit is the group
  of `logged_sets` rows sharing one `session_id` — a token generated once per
  save, not a foreign key. This keeps the schema at five tables while still
  letting two visits on the same date stay distinct.
- Every logged set stores both what was *planned* and what was actually
  *executed*, for every metric (reps, weight, duration, distance).
