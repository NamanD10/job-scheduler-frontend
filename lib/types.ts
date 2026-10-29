export type TaskStatus = "PENDING" | "PROCESSING" | "RETRYING" | "COMPLETED" | "FAILED";
export type ReqMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface Task {
  id: string;
  title: string;
  targetUrl: string;
  scheduledAt: string | null;
  priority: number; // 1-3, 1 = highest
  headers: Record<string, string> | null;
  reqMethod: ReqMethod;
  reqBody: Record<string, unknown> | string | null;
  attempts: number;
  maxAttempts: number;
  isRepeatable: boolean;
  repeatPattern: string | null;
  nextRunAt: string | null;
  lastRunAt: string | null;
  repeatEnabled: boolean | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TaskTypeCounts {
  immediate: number;
  scheduled: number;
  repeatable: number;
}
 
// /stats/success-rate
export interface ExecutionSummary {
  totalExecutions: number;
  successfulExecutions: number;
  successRate: number; // percentage, 0-100
}
 
// /stats/last-24h
export interface Last24h {
  executionsLast24h: number;
  since: string;
}
 
// /stats/avg-duration
export interface AvgDuration {
  averageDurationMs: number;
  sampleSize: number;
}
 
// /stats/recent-executions
export interface RecentExecution {
  taskId?: string;
  id?: string; // older shape: task id was returned as `id`
  title: string;
  targetUrl: string;
  reqMethod: ReqMethod;
  statusCode: number | null; // 0 = network error / no response
  durationMs: number | null;
  executionDate: string;
}
 
// /stats/upcoming-runs
export interface UpcomingRun {
  taskId?: string;
  id?: string;
  title: string;
  targetUrl: string;
  reqMethod: ReqMethod;
  nextRunAt: string;
}

export interface QueueStats {
  queue: {
    pending: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    total: number;
  };
  performance: {
    throughput: string;
    avgProcessingTime: number;
    successRate: string | number;
  };
  timestamp: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  targetUrl: string;
  reqMethod: ReqMethod;
  isRepeatable: boolean;
  priority: number;
  scheduledAt?: string;
  repeatPattern?: string;
  headers?: Record<string, string>;
  reqBody?: Record<string, unknown> | string;
}

export interface TaskExecution {
  id: string;
  taskId: string;
  executionDate: string;
  statusCode: number | null; // 0 = network error / no response
  statusMessage: string | null;
  durationMs: number | null;
  responseBody: string | null;
  responseHeaders: Record<string, string> | null;
  errorCode: string | null;
  errorMessage: string | null;
}

export interface TaskExecutionSummary {
  total: number;
  successful: number;
  successRate: number;
  averageDurationMs: number;
}

export interface TaskExecutionsPage {
  items: TaskExecution[];
  nextCursor: string | null;
  summary?: TaskExecutionSummary;
}