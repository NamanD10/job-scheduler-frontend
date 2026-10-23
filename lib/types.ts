export type TaskStatus = "PENDING" | "PROCESSING" | "RETRYING" | "COMPLETED" | "FAILED";
export type ReqMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface Task {
  id: string;
  userId: string;
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
  userId: string; // backend requires this in the body alongside the session
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
