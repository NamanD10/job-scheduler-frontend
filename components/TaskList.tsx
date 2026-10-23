"use client";

import Link from "next/link";
import type { Task } from "@/lib/types";
import StatusBadge from "./StatusBadge";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Row({ task }: { task: Task }) {
  return (
    <Link
      href={`/dashboard/tasks/${task.id}`}
      className="focus-ring grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[2fr_1fr_1fr_1fr] gap-4 items-center px-4 py-3 border-b border-line hover:bg-surface transition-colors"
    >
      <div className="min-w-0">
        <div className="text-sm truncate">{task.title}</div>
        <div className="text-xs text-muted font-mono truncate">
          {task.reqMethod} {task.targetUrl}
        </div>
      </div>
      <div className="hidden sm:block text-xs font-mono text-muted">
        {task.isRepeatable ? task.repeatPattern : formatDate(task.scheduledAt ?? task.createdAt)}
      </div>
      <div className="hidden sm:block text-xs font-mono text-muted">
        P{task.priority} · {task.attempts}/{task.maxAttempts}
      </div>
      <StatusBadge status={task.status} />
    </Link>
  );
}

export default function TaskList({ tasks }: { tasks: Task[] }) {
  const upcoming = tasks.filter((t) => t.status === "PENDING" || t.status === "RETRYING");
  const history = tasks.filter((t) => t.status === "COMPLETED" || t.status === "FAILED");
  const active = tasks.filter((t) => t.status === "PROCESSING");

  const sections: { label: string; items: Task[] }[] = [
    { label: "Active", items: active },
    { label: "Upcoming", items: upcoming },
    { label: "History", items: history },
  ];

  if (tasks.length === 0) {
    return (
      <div className="border border-line px-6 py-16 text-center">
        <p className="text-sm text-muted">No tasks yet. Create one to see it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sections.map(
        (section) =>
          section.items.length > 0 && (
            <div key={section.label}>
              <h3 className="text-xs text-muted mb-2 px-4">{section.label}</h3>
              <div className="border border-line">
                {section.items.map((task) => (
                  <Row key={task.id} task={task} />
                ))}
              </div>
            </div>
          )
      )}
    </div>
  );
}
