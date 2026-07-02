import Link from "next/link";
import {
    getExerciseFilterOptions,
    getExerciseLibrary,
} from "@/db/queries/exercises";

type SearchParams = Promise<{
    category?: string;
    equipment?: string;
    targetMuscle?: string;
}>;

export default async function ExercisesPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    const { category, equipment, targetMuscle } = await searchParams;

    const [exercises, filterOptions] = await Promise.all([
        getExerciseLibrary({ category, equipment, targetMuscle }),
        getExerciseFilterOptions(),
    ]);

    return (
        <main className="mx-auto max-w-3xl px-6 py-12">
            <h1 className="text-2xl font-semibold">Exercise Library</h1>

            <Link href="/exercises/new" className="text-sm underline">
                + Add custom exercise
            </Link>

            <form className="mt-6 flex flex-wrap gap-3" method="get">
                <select
                    name="category"
                    defaultValue={category ?? ""}
                    className="border rounded px-2 py-1"
                >
                    <option value="">All categories</option>
                    {filterOptions.categories.map((value) => (
                        <option key={value} value={value}>
                            {value}
                        </option>
                    ))}
                </select>

                <select
                    name="equipment"
                    defaultValue={equipment ?? ""}
                    className="border rounded px-2 py-1"
                >
                    <option value="">All equipment</option>
                    {filterOptions.equipmentTypes.map((value) => (
                        <option key={value} value={value}>
                            {value}
                        </option>
                    ))}
                </select>

                <select
                    name="targetMuscle"
                    defaultValue={targetMuscle ?? ""}
                    className="border rounded px-2 py-1"
                >
                    <option value="">All target muscles</option>
                    {filterOptions.targetMuscles.map((value) => (
                        <option key={value} value={value}>
                            {value}
                        </option>
                    ))}
                </select>

                <button type="submit" className="border rounded px-3 py-1">
                    Filter
                </button>
            </form>

            <p className="mt-4 text-sm text-zinc-500">
                {exercises.length} exercise{exercises.length === 1 ? "" : "s"}
            </p>

            <ul className="mt-2 divide-y">
                {exercises.map((exercise) => (
                    <li key={exercise.id}>
                        <Link
                            href={`/exercises/${exercise.id}`}
                            className="flex justify-between py-3 hover:underline"
                        >
                            <span>{exercise.name}</span>
                            <span className="text-zinc-500">
                                {exercise.category}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </main>
    );
}
