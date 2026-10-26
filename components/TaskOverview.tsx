import type { TaskTypeCounts } from "@/lib/types";

export default function TaskOverview({ counts }: { counts: TaskTypeCounts | null }) {
  const total = counts ? counts.immediate + counts.scheduled + counts.repeatable : null;

  const types = [
    { label: "Immediate", value: counts?.immediate },
    { label: "Scheduled", value: counts?.scheduled },
    { label: "Cron", value: counts?.repeatable },
  ];

  return (
    <section className="border border-line px-6 py-5 flex flex-wrap items-center justify-around gap-x-10 gap-y-4">
      <div>
        <div className="text-stat font-medium tabular-nums">{total ?? "—"}</div>
        <div className="mt-1 text-xs text-muted">total tasks</div>
      </div>

      <div className="flex flex-wrap gap-3">
        {types.map((t) => (
          <div key={t.label} className="border border-line px-5 py-3 min-w-[110px]">
            <div className="text-lg font-medium tabular-nums">{t.value ?? "—"}</div>
            <div className="text-xs text-muted">{t.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}