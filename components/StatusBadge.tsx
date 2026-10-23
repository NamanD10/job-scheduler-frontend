import type { TaskStatus } from "@/lib/types";

const STATUS_STYLES: Record<TaskStatus, string> = {
  COMPLETED: "text-done",
  FAILED: "text-failed",
  PENDING: "text-pending",
  PROCESSING: "text-cobalt",
  RETRYING: "text-pending",
};

const STATUS_DOT: Record<TaskStatus, string> = {
  COMPLETED: "bg-done",
  FAILED: "bg-failed",
  PENDING: "bg-pending",
  PROCESSING: "bg-cobalt",
  RETRYING: "bg-pending",
};

export default function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-xs ${STATUS_STYLES[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {status.toLowerCase()}
    </span>
  );
}
