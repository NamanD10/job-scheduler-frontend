"use client";

import { useCallback, useEffect, useState } from "react";
import { getTaskExecutions, ApiError } from "@/lib/api";
import { formatDuration, formatExactTime, formatRelative } from "@/lib/format";
import { useNow } from "@/lib/useNow";
import type { TaskExecution, TaskExecutionSummary } from "@/lib/types";

function isSuccess(e: TaskExecution) {
  return e.statusCode !== null && e.statusCode >= 200 && e.statusCode < 300;
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="text-xs text-muted mb-1">{label}</div>
      <div className="text-xs font-mono break-all">{children}</div>
    </div>
  );
}

function Row({
  item,
  now,
  expanded,
  onToggle,
}: {
  item: TaskExecution;
  now: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const ok = isSuccess(item);
  const code = item.statusCode ? String(item.statusCode) : "ERR";
  const hasHeaders = item.responseHeaders && Object.keys(item.responseHeaders).length > 0;

  return (
    <div className="border-b border-line last:border-b-0">
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        className="focus-ring w-full grid grid-cols-[4rem_1fr_auto] sm:grid-cols-[4rem_6rem_1fr_auto] gap-4 items-center px-4 py-3 text-left hover:bg-surface transition-colors"
      >
        <span className={`inline-flex items-center gap-1.5 font-mono text-xs ${ok ? "text-done" : "text-failed"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-done" : "bg-failed"}`} />
          {code}
        </span>
        <span className="hidden sm:block font-mono text-xs text-muted">{formatDuration(item.durationMs)}</span>
        <span className="text-xs text-muted truncate">{item.statusMessage || item.errorCode || ""}</span>
        <span className="font-mono text-xs text-muted whitespace-nowrap" title={formatExactTime(item.executionDate)}>
          {formatRelative(item.executionDate, now)}
        </span>
      </button>

      {expanded && (
        <div className="px-4 py-4 bg-surface border-t border-line">
          <Detail label="Executed at">{formatExactTime(item.executionDate)}</Detail>
          {item.errorCode || item.errorMessage ? (
            <Detail label="Error">
              {[item.errorCode, item.errorMessage].filter(Boolean).join(": ")}
            </Detail>
          ) : null}
          {hasHeaders && (
            <Detail label="Response headers">
              <pre className="whitespace-pre-wrap">{JSON.stringify(item.responseHeaders, null, 2)}</pre>
            </Detail>
          )}
          <Detail label="Response body">
            {item.responseBody ? (
              <pre className="whitespace-pre-wrap">{item.responseBody}</pre>
            ) : (
              <span className="text-muted">Not stored</span>
            )}
          </Detail>
        </div>
      )}
    </div>
  );
}

export default function ExecutionHistory({ taskId }: { taskId: string }) {
  const now = useNow();
  const [items, setItems] = useState<TaskExecution[]>([]);
  const [summary, setSummary] = useState<TaskExecutionSummary | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadFirstPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await getTaskExecutions(taskId);
      setItems(page.items);
      setCursor(page.nextCursor);
      setSummary(page.summary ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load executions.");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  async function loadMore() {
    if (!cursor) return;
    setLoadingMore(true);
    try {
      const page = await getTaskExecutions(taskId, cursor);
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load more executions.");
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <section className="mt-10">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-sm font-medium">Execution history</h2>
        <button onClick={loadFirstPage} className="focus-ring text-xs text-muted hover:text-ink">
          Refresh
        </button>
      </div>

      {summary && summary.total > 0 && (
        <p className="mb-3 text-xs font-mono text-muted">
          {summary.total} runs · {summary.successRate}% success · avg {formatDuration(summary.averageDurationMs)}
        </p>
      )}

      {error && <p className="mb-3 text-sm text-failed font-mono">{error}</p>}

      <div className="border border-line">
        {loading ? (
          <p className="px-4 py-8 text-sm font-mono text-muted">Loading…</p>
        ) : items.length === 0 ? (
          <p className="px-4 py-8 text-sm text-muted">No executions yet. Runs will show up here.</p>
        ) : (
          items.map((item) => (
            <Row
              key={item.id}
              item={item}
              now={now}
              expanded={expandedId === item.id}
              onToggle={() => setExpandedId((cur) => (cur === item.id ? null : item.id))}
            />
          ))
        )}
      </div>

      {cursor && !loading && (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          className="focus-ring mt-3 w-full border border-line py-2 text-sm text-muted hover:text-ink hover:border-ink transition-colors disabled:opacity-50"
        >
          {loadingMore ? "Loading…" : "Load more"}
        </button>
      )}
    </section>
  );
}