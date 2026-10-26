"use client";

import Link from "next/link";
import { formatDuration, formatExactTime, formatRelative } from "@/lib/format";
import { useNow } from "@/lib/useNow";
import type { RecentExecution } from "@/lib/types";

function Row({ item, now }: { item: RecentExecution; now: number }) {
  const ok = item.statusCode !== null && item.statusCode >= 200 && item.statusCode < 300;
  const code = item.statusCode ? String(item.statusCode) : "ERR";
  const taskId = item.taskId ?? item.id;

  const content = (
    <>
      <div className="min-w-0">
        <div className="text-sm truncate">{item.title}</div>
        <div className="text-xs text-muted font-mono truncate">
          {item.reqMethod} {item.targetUrl}
        </div>
      </div>
      <span
        className={`inline-flex items-center gap-1.5 font-mono text-xs ${ok ? "text-done" : "text-failed"}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-done" : "bg-failed"}`} />
        {code}
      </span>
      <div className="hidden sm:block text-xs font-mono text-muted text-right">
        {formatDuration(item.durationMs)}
      </div>
      <div
        className="text-xs font-mono text-muted text-right whitespace-nowrap"
        title={formatExactTime(item.executionDate)}
      >
        {formatRelative(item.executionDate, now)}
      </div>
    </>
  );

  const className =
    "grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-4 py-3 border-b border-line last:border-b-0";

  return taskId ? (
    <Link
      href={`/dashboard/tasks/${taskId}`}
      className={`focus-ring hover:bg-surface transition-colors ${className}`}
    >
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

export default function RecentExecutions({
  items,
  loading,
}: {
  items: RecentExecution[] | null;
  loading: boolean;
}) {
  const now = useNow();

  return (
    <section>
      <h2 className="text-xs text-muted mb-2 px-1">Past executions</h2>
      <div className="border border-line">
        {loading && !items ? (
          <p className="px-4 py-8 text-sm font-mono text-muted">Loading…</p>
        ) : !items || items.length === 0 ? (
          <p className="px-4 py-8 text-sm text-muted">No executions yet. Runs will show up here.</p>
        ) : (
          items.map((item, i) => (
            <Row key={`${item.taskId ?? item.id}-${item.executionDate}-${i}`} item={item} now={now} />
          ))
        )}
      </div>
    </section>
  );
}