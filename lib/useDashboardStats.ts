"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getAvgDuration,
  getExecutionSummary,
  getLast24h,
  getRecentExecutions,
  getTaskTypeCounts,
  getUpcomingRuns,
} from "./api";
import type {
  AvgDuration,
  ExecutionSummary,
  Last24h,
  RecentExecution,
  TaskTypeCounts,
  UpcomingRun,
} from "./types";

const POLL_MS = 60_000; // 1 minute
const MAX_BACKOFF_MS = 5 * 60_000;

export interface DashboardData {
  taskTypes: TaskTypeCounts | null;
  executionSummary: ExecutionSummary | null;
  last24h: Last24h | null;
  avgDuration: AvgDuration | null;
  recent: RecentExecution[] | null;
  upcoming: UpcomingRun[] | null;
}

const EMPTY: DashboardData = {
  taskTypes: null,
  executionSummary: null,
  last24h: null,
  avgDuration: null,
  recent: null,
  upcoming: null,
};

export function useDashboardStats(enabled: boolean) {
  const [data, setData] = useState<DashboardData>(EMPTY);
  const [loading, setLoading] = useState(true); // true only until the first fetch settles
  const [hasError, setHasError] = useState(false); // at least one endpoint failed last time
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  const runRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | null = null;
    let failures = 0; // consecutive rounds where every endpoint failed

    const schedule = () => {
      if (stopped || document.hidden) return;
      const delay = Math.min(POLL_MS * 2 ** failures, MAX_BACKOFF_MS);
      timer = setTimeout(run, delay);
    };

    const run = async () => {
      clearTimeout(timer);
      controller?.abort(); // drop any request still in flight
      controller = new AbortController();
      const { signal } = controller;

      const results = await Promise.allSettled([
        getTaskTypeCounts(signal),
        getExecutionSummary(signal),
        getLast24h(signal),
        getAvgDuration(signal),
        getRecentExecutions(signal),
        getUpcomingRuns(signal),
      ]);

      // Superseded by a newer run, or the component is gone.
      if (stopped || signal.aborted) return;

      const [types, summary, last24h, avg, recent, upcoming] = results;

      // A failed endpoint keeps its last good value instead of blanking the widget.
      setData((prev) => ({
        taskTypes: types.status === "fulfilled" ? types.value : prev.taskTypes,
        executionSummary: summary.status === "fulfilled" ? summary.value : prev.executionSummary,
        last24h: last24h.status === "fulfilled" ? last24h.value : prev.last24h,
        avgDuration: avg.status === "fulfilled" ? avg.value : prev.avgDuration,
        recent: recent.status === "fulfilled" ? recent.value : prev.recent,
        upcoming: upcoming.status === "fulfilled" ? upcoming.value : prev.upcoming,
      }));

      const failed = results.filter((r) => r.status === "rejected").length;
      setHasError(failed > 0);
      if (failed < results.length) setUpdatedAt(Date.now());
      failures = failed === results.length ? failures + 1 : 0;

      setLoading(false);
      schedule();
    };

    // To pause while the tab is hidden; refresh immediately when it comes back.
    const onVisibilityChange = () => {
      if (document.hidden) clearTimeout(timer);
      else run();
    };

    runRef.current = run;
    document.addEventListener("visibilitychange", onVisibilityChange);
    run();

    return () => {
      stopped = true;
      clearTimeout(timer);
      controller?.abort();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      runRef.current = null;
    };
  }, [enabled]);

  // Manual refresh (e.g. right after creating a task). Restarts the 1-minute clock.
  const refresh = useCallback(() => {
    runRef.current?.();
  }, []);

  return { data, loading, hasError, updatedAt, refresh };
}