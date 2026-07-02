import Link from "next/link";
import { getWorkouts } from "@/db/queries/workouts";
import { getCurrentUserId } from "@/lib/current-user";

export default async function WorkoutsPage() {
  const userId = await getCurrentUserId();
  const workouts = await getWorkouts(userId);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Workouts</h1>

      <Link href="/workouts/new" className="mt-2 inline-block text-sm underline">
        + New workout
      </Link>

      <ul className="mt-6 divide-y">
        {workouts.map((workout) => (
          <li key={workout.id}>
            <Link href={`/workouts/${workout.id}`} className="block py-3 hover:underline">
              {workout.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
