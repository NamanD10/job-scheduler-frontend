"use client";

import Link from "next/link";
import { formatExactTime, formatRelative } from "@/lib/format";
import { useNow } from "@/lib/useNow";
import type { UpcomingRun } from "@/lib/types";

function Row({ item, now }: { item: UpcomingRun; now: number }) {
  const taskId = item.taskId ?? item.id;

  const content = (
    <>
      <div className="min-w-0">
        <div className="text-sm truncate">{item.title}</div>
        <div className="text-xs text-muted font-mono truncate">
          {item.reqMethod} {item.targetUrl}
        </div>
      </div>
      <div
        className="text-xs font-mono text-muted text-right whitespace-nowrap"
        title={formatExactTime(item.nextRunAt)}
      >
        {formatRelative(item.nextRunAt, now)}
      </div>
    </>
  );

  const className =
    "grid grid-cols-[1fr_auto] gap-4 items-center px-4 py-3 border-b border-line last:border-b-0";

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

export default function UpcomingRuns({
  items,
  loading,
}: {
  items: UpcomingRun[] | null;
  loading: boolean;
}) {
  const now = useNow();

  return (
    <section>
      <h2 className="text-xs text-muted mb-2 px-1">Upcoming executions</h2>
      <div className="border border-line">
        {loading && !items ? (
          <p className="px-4 py-8 text-sm font-mono text-muted">Loading…</p>
        ) : !items || items.length === 0 ? (
          <p className="px-4 py-8 text-sm text-muted">Nothing scheduled. Create a scheduled or cron task.</p>
        ) : (
          items.map((item, i) => (
            <Row key={`${item.taskId ?? item.id}-${item.nextRunAt}-${i}`} item={item} now={now} />
          ))
        )}
      </div>
    </section>
  );
}