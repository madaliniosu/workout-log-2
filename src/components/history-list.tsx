import type { LoggedSession } from "@/db/queries/sets";
import { formatSetMetrics } from "@/lib/format-set";

export function HistoryList({ sessions }: { sessions: LoggedSession[] }) {
    if (sessions.length === 0) {
        return <p className="text-sm text-muted">No logged sessions yet.</p>;
    }

    return (
        <div className="flex flex-col gap-4">
            {sessions.map((session) => (
                <div
                    key={session.sessionId}
                    className="rounded-xl border border-border bg-surface p-4"
                >
                    <p className="font-heading text-sm font-semibold text-foreground">
                        {session.performedAtLabel}
                    </p>

                    <div className="mt-3 flex flex-col gap-3">
                        {session.exercises.map((exercise, i) => (
                            <div
                                key={`${exercise.exerciseId}-${exercise.workoutId ?? "adhoc"}-${i}`}
                            >
                                <p className="text-sm font-medium text-foreground">
                                    {exercise.exerciseName}
                                    {exercise.workoutName && (
                                        <span className="ml-2 text-xs font-normal text-muted">
                                            {exercise.workoutName}
                                        </span>
                                    )}
                                </p>
                                <ul className="mt-1 flex flex-col gap-0.5">
                                    {exercise.sets.map((set, setIndex) => (
                                        <li
                                            key={setIndex}
                                            className="text-xs text-muted"
                                        >
                                            Set {set.setNumber}:{" "}
                                            {formatSetMetrics(set, exercise)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
