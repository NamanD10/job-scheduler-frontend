"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getTasks } from "@/lib/api";
import { formatRelative } from "@/lib/format";
import { useDashboardStats } from "@/lib/useDashboardStats";
import { useNow } from "@/lib/useNow";
import type { Task } from "@/lib/types";
import Navbar from "@/components/Navbar";
import TaskOverview from "@/components/TaskOverview";
import ExecutionStats from "@/components/ExecutionStats";
import RecentExecutions from "@/components/RecentExecutions";
import UpcomingRuns from "@/components/UpcomingRuns";
import TaskList from "@/components/TaskList";
import CreateTaskPanel from "@/components/CreateTaskPanel";

function UpdatedLabel({ updatedAt, hasError }: { updatedAt: number | null; hasError: boolean }) {
  const now = useNow(15_000);
  if (!updatedAt) return null;
  return (
    <span className="text-xs font-mono text-muted">
      Updated {formatRelative(updatedAt, now)}
      {hasError && " · some stats couldn't refresh"}
    </span>
  );
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);

  const { data, loading: statsLoading, hasError, updatedAt, refresh } = useDashboardStats(!!user);

  const loadTasks = useCallback(async () => {
    try {
      setTasks(await getTasks());
    } catch {
      // surfaced via empty state
    } finally {
      setTasksLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    loadTasks();
  }, [authLoading, user, router, loadTasks]);

  // Task statuses change as jobs run. Reload the list whenever the execution
  // count moves, instead of polling it separately.
  const executionCount = data.executionSummary?.totalExecutions;
  const prevCount = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (executionCount === undefined) return;
    if (prevCount.current !== undefined && prevCount.current !== executionCount) {
      loadTasks();
    }
    prevCount.current = executionCount;
  }, [executionCount, loadTasks]);

  function handleCreated() {
    loadTasks();
    refresh();
    // Immediate jobs usually finish within seconds; check again shortly after.
    setTimeout(refresh, 4000);
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-sm text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-baseline gap-4">
            <h1 className="text-xl font-medium">Dashboard</h1>
            <UpdatedLabel updatedAt={updatedAt} hasError={hasError} />
          </div>
          <button
            onClick={() => setPanelOpen(true)}
            className="focus-ring bg-ink text-paper px-4 py-2 text-sm font-medium rounded-sm hover:bg-cobalt transition-colors"
          >
            Create New Task
          </button>
        </div>

        <div className="space-y-4">
          <TaskOverview counts={data.taskTypes} />
          <ExecutionStats
            summary={data.executionSummary}
            last24h={data.last24h}
            avgDuration={data.avgDuration}
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentExecutions items={data.recent} loading={statsLoading} />
          </div>
          <div>
            <UpcomingRuns items={data.upcoming} loading={statsLoading} />
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-medium mb-6">Tasks</h2>
          {tasksLoading ? (
            <p className="font-mono text-sm text-muted">Loading tasks…</p>
          ) : (
            <TaskList tasks={tasks} />
          )}
        </div>
      </main>

      <CreateTaskPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}