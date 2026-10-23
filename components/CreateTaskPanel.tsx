"use client";

import { useState } from "react";
import { createTask, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { ReqMethod } from "@/lib/types";

type ScheduleType = "immediate" | "scheduled" | "repeatable";

const CRON_PRESETS = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every 5 minutes", value: "*/5 * * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "Daily at 9am", value: "0 9 * * *" },
  { label: "Every Monday at 9am", value: "0 9 * * 1" },
];

export default function CreateTaskPanel({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [reqMethod, setReqMethod] = useState<ReqMethod>("POST");
  const [priority, setPriority] = useState(2);
  const [scheduleType, setScheduleType] = useState<ScheduleType>("immediate");
  const [scheduledAt, setScheduledAt] = useState("");
  const [repeatPattern, setRepeatPattern] = useState(CRON_PRESETS[2].value);
  const [reqBody, setReqBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setTitle("");
    setTargetUrl("");
    setReqMethod("POST");
    setPriority(2);
    setScheduleType("immediate");
    setScheduledAt("");
    setRepeatPattern(CRON_PRESETS[2].value);
    setReqBody("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);

    let parsedBody: Record<string, unknown> | string | undefined;
    if (reqBody.trim()) {
      try {
        parsedBody = JSON.parse(reqBody);
      } catch {
        parsedBody = reqBody; // fall back to raw string body
      }
    }

    setSubmitting(true);
    try {
      await createTask({
        userId: user.id,
        title,
        targetUrl,
        reqMethod,
        priority,
        isRepeatable: scheduleType === "repeatable",
        ...(scheduleType === "scheduled" && scheduledAt
          ? { scheduledAt: new Date(scheduledAt).toISOString() }
          : {}),
        ...(scheduleType === "repeatable" ? { repeatPattern } : {}),
        ...(parsedBody !== undefined ? { reqBody: parsedBody } : {}),
      });
      reset();
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the task.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md bg-paper border-l border-line h-full overflow-y-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium">New task</h2>
          <button onClick={onClose} className="focus-ring text-muted hover:text-ink text-sm">
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm mb-1.5 text-muted">Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="focus-ring w-full border border-line bg-surface px-3 py-2 text-sm rounded-sm"
              placeholder="Nightly sync"
            />
          </div>

          <div>
            <label className="block text-sm mb-1.5 text-muted">Target URL</label>
            <input
              required
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="focus-ring w-full border border-line bg-surface px-3 py-2 text-sm rounded-sm font-mono"
              placeholder="https://api.example.com/sync"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1.5 text-muted">Method</label>
              <select
                value={reqMethod}
                onChange={(e) => setReqMethod(e.target.value as ReqMethod)}
                className="focus-ring w-full border border-line bg-surface px-3 py-2 text-sm rounded-sm font-mono"
              >
                {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1.5 text-muted">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="focus-ring w-full border border-line bg-surface px-3 py-2 text-sm rounded-sm"
              >
                <option value={1}>1 — highest</option>
                <option value={2}>2 — normal</option>
                <option value={3}>3 — low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1.5 text-muted">When</label>
            <div className="flex gap-1 border border-line rounded-sm p-1">
              {(["immediate", "scheduled", "repeatable"] as ScheduleType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setScheduleType(t)}
                  className={`focus-ring flex-1 py-1.5 text-xs rounded-sm transition-colors ${
                    scheduleType === t ? "bg-ink text-paper" : "text-muted hover:text-ink"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {scheduleType === "scheduled" && (
            <div>
              <label className="block text-sm mb-1.5 text-muted">Run at</label>
              <input
                required
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="focus-ring w-full border border-line bg-surface px-3 py-2 text-sm rounded-sm font-mono"
              />
            </div>
          )}

          {scheduleType === "repeatable" && (
            <div>
              <label className="block text-sm mb-1.5 text-muted">Cron pattern</label>
              <input
                required
                value={repeatPattern}
                onChange={(e) => setRepeatPattern(e.target.value)}
                className="focus-ring w-full border border-line bg-surface px-3 py-2 text-sm rounded-sm font-mono mb-2"
              />
              <div className="flex flex-wrap gap-1.5">
                {CRON_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setRepeatPattern(p.value)}
                    className="focus-ring text-xs border border-line px-2 py-1 rounded-sm text-muted hover:text-ink hover:border-ink transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm mb-1.5 text-muted">Request body (optional, JSON)</label>
            <textarea
              value={reqBody}
              onChange={(e) => setReqBody(e.target.value)}
              rows={3}
              className="focus-ring w-full border border-line bg-surface px-3 py-2 text-sm rounded-sm font-mono"
              placeholder={'{ "event": "reminder" }'}
            />
          </div>

          {error && (
            <p className="text-sm text-failed font-mono" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="focus-ring w-full bg-ink text-paper py-2.5 text-sm font-medium rounded-sm hover:bg-cobalt transition-colors disabled:opacity-50"
          >
            {submitting ? "Creating…" : "Create task"}
          </button>
        </form>
      </div>
    </div>
  );
}
