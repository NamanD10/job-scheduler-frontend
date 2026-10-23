import type { QueueStats } from "@/lib/types";

export default function StatsStrip({ stats }: { stats: QueueStats | null }) {
  const items = [
    { label: "pending", value: stats?.queue.pending ?? "—" },
    { label: "active", value: stats?.queue.active ?? "—" },
    { label: "completed", value: stats?.queue.completed ?? "—" },
    { label: "failed", value: stats?.queue.failed ?? "—" },
    { label: "success rate", value: stats ? `${stats.performance.successRate}%` : "—" },
    { label: "throughput", value: stats ? `${stats.performance.throughput}/s` : "—" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-px bg-line border border-line">
      {items.map((item) => (
        <div key={item.label} className="bg-paper px-4 py-5">
          <div className="text-stat font-medium tabular-nums">{item.value}</div>
          <div className="mt-1 text-xs text-muted">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
