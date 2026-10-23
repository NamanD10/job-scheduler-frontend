"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getTasks, getQueueStats } from "@/lib/api";
import type { Task, QueueStats } from "@/lib/types";
import Navbar from "@/components/Navbar";
import StatsStrip from "@/components/StatsStrip";
import TaskList from "@/components/TaskList";
import CreateTaskPanel from "@/components/CreateTaskPanel";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [taskData, statsData] = await Promise.all([getTasks(), getQueueStats()]);
      setTasks(taskData);
      setStats(statsData);
    } catch {
      // surfaced via empty state; queue stats endpoint failing shouldn't block task list
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    loadData();
  }, [authLoading, user, router, loadData]);

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
          <h1 className="text-xl font-medium">Tasks</h1>
          <button
            onClick={() => setPanelOpen(true)}
            className="focus-ring bg-ink text-paper px-4 py-2 text-sm font-medium rounded-sm hover:bg-cobalt transition-colors"
          >
            Create task
          </button>
        </div>

        <div className="mb-8">
          <StatsStrip stats={stats} />
        </div>

        {loading ? (
          <p className="font-mono text-sm text-muted">Loading tasks…</p>
        ) : (
          <TaskList tasks={tasks} />
        )}
      </main>

      <CreateTaskPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onCreated={loadData}
      />
    </div>
  );
}
