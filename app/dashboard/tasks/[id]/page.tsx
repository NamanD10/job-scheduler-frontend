"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getTaskById, deleteTask, ApiError } from "@/lib/api";
import type { Task } from "@/lib/types";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import ExecutionHistory from "@/components/ExecutionHistory";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="py-3 border-b border-line grid grid-cols-3 gap-4">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="col-span-2 text-sm font-mono break-all">{value ?? "—"}</dd>
    </div>
  );
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    getTaskById(id)
      .then(setTask)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load this task."));
  }, [authLoading, user, id, router]);

  async function handleDelete() {
    if (!confirm("Delete this task? This can't be undone.")) return;
    setDeleting(true);
    try {
      await deleteTask(id);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't delete this task.");
      setDeleting(false);
    }
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
      <main className="mx-auto max-w-2xl px-6 py-8">
        <Link href="/dashboard" className="text-sm text-muted hover:text-ink">
          ← Back to tasks
        </Link>

        {error && <p className="mt-4 text-sm text-failed font-mono">{error}</p>}

        {task && (
          <>
            <div className="mt-4 mb-6 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-medium">{task.title}</h1>
                <div className="mt-2">
                  <StatusBadge status={task.status} />
                </div>
              </div>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="focus-ring text-sm text-failed border border-failed px-3 py-1.5 rounded-sm hover:bg-failed hover:text-paper transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>

            <dl>
              <Field label="Target URL" value={task.targetUrl} />
              <Field label="Method" value={task.reqMethod} />
              <Field label="Priority" value={`P${task.priority}`} />
              <Field
                label="Schedule"
                value={
                  task.isRepeatable
                    ? `cron: ${task.repeatPattern}`
                    : task.scheduledAt
                    ? new Date(task.scheduledAt).toLocaleString()
                    : "immediate"
                }
              />
              <Field
                label="Attempts"
                value={`${task.attempts} / ${task.maxAttempts}`}
              />
              <Field
                label="Last run"
                value={task.lastRunAt ? new Date(task.lastRunAt).toLocaleString() : "—"}
              />
              <Field
                label="Next run"
                value={task.nextRunAt ? new Date(task.nextRunAt).toLocaleString() : "—"}
              />
              <Field label="Created" value={new Date(task.createdAt).toLocaleString()} />
              {task.headers && Object.keys(task.headers).length > 0 && (
                <Field label="Headers" value={<pre className="whitespace-pre-wrap">{JSON.stringify(task.headers, null, 2)}</pre>} />
              )}
              {task.reqBody && (
                <Field
                  label="Body"
                  value={
                    <pre className="whitespace-pre-wrap">
                      {typeof task.reqBody === "string" ? task.reqBody : JSON.stringify(task.reqBody, null, 2)}
                    </pre>
                  }
                />
              )}
            </dl>

            <ExecutionHistory taskId={id} />
          </>
        )}
      </main>
    </div>
  );
}
