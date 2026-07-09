import { getCurrentUserId } from "@/lib/current-user";
import { getLoggedSetRows, groupBySession, groupByExercise } from "@/db/queries/sets";
import { Tabs } from "@/components/tabs";
import { HistoryList } from "@/components/history-list";
import { ProgressExplorer } from "@/components/progress-explorer";

// Every render reads live per-user data from Postgres — a build-time
// static snapshot is never correct here.
export const dynamic = "force-dynamic";

export default async function AnalyzePage() {
  const userId = await getCurrentUserId();
  const rows = await getLoggedSetRows(userId);
  const sessions = groupBySession(rows);
  const histories = groupByExercise(rows);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mt-6">
        <Tabs
          tabs={[
            { label: "Progress", content: <ProgressExplorer histories={histories} /> },
            { label: "History", content: <HistoryList sessions={sessions} /> },
          ]}
        />
      </div>
    </main>
  );
}
