import { formatDuration } from "@/lib/format";
import type { AvgDuration, ExecutionSummary, Last24h } from "@/lib/types";

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-2xl font-medium tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  );
}

export default function ExecutionStats({
  summary,
  last24h,
  avgDuration,
}: {
  summary: ExecutionSummary | null;
  last24h: Last24h | null;
  avgDuration: AvgDuration | null;
}) {
  const hasRuns = (summary?.totalExecutions ?? 0) > 0;
  const hasTimings = (avgDuration?.sampleSize ?? 0) > 0;

  return (
    <section className="grid gap-4 md:grid-cols-4">
      <div className="border border-line col-span-2 px-6 py-5 flex gap-10">
        <Stat label="total executions" value={summary?.totalExecutions ?? "—"} />
        <Stat label="successful executions" value={summary?.successfulExecutions ?? "—"} />
        <Stat label="success rate" value={summary && hasRuns ? `${summary.successRate}%` : "—"} />
      </div>

      <div className="border border-line col-span-1 px-6 py-5">
        <Stat label="executions in past 24 hrs" value={last24h?.executionsLast24h ?? "—"} />
      </div>

      <div className="border border-line col-span-1 px-6 py-5">
        <Stat
          label="avg response time"
          value={avgDuration && hasTimings ? formatDuration(avgDuration.averageDurationMs) : "—"}
        />
      </div>
    </section>
  );
}