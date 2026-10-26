"use client";

import { useEffect, useState } from "react";

// Returns Date.now() and refreshes it on an interval, so relative times
// ("in 12 min") keep moving between data polls.
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}