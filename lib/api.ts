import type {
  AuthUser,
  AvgDuration,
  CreateTaskInput,
  ExecutionSummary,
  Last24h,
  QueueStats,
  RecentExecution,
  Task,
  TaskTypeCounts,
  UpcomingRun,
} from "./types";

// Set NEXT_PUBLIC_API_URL in .env.local to your TaskSmith backend origin,
// e.g. http://localhost:3000. Must be one of better-auth's trustedOrigins
// on the backend for cookies to work across origins.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include", // better-auth uses cookie-based sessions
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      message = body.message || body.error || message;
    } catch {
      // response had no JSON body
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---- Auth (better-auth default email/password endpoints) ----

export async function signUp(name: string, email: string, password: string) {
  return request<{ user: AuthUser }>("/api/auth/sign-up/email", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function signIn(email: string, password: string) {
  return request<{ user: AuthUser }>("/api/auth/sign-in/email", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function signOut() {
  return request<void>("/api/auth/sign-out", { method: "POST" });
}

export async function getSession() {
  return request<{ user: AuthUser; session: unknown } | null>("/api/auth/get-session");
}

// ---- Tasks ----

export async function getTasks() {
  return request<Task[]>("/tasks");
}

export async function getTaskById(id: string) {
  return request<Task>(`/tasks/${id}`);
}

export async function createTask(input: CreateTaskInput) {
  return request<{ message: string; task: Task }>("/tasks/create", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function deleteTask(id: string) {
  return request<{ message: string; deletedTask: Task }>(`/tasks/${id}`, {
    method: "DELETE",
  });
}

// ---- Queue ----

export async function getQueueStats() {
  return request<QueueStats>("/queue/stats");
}

//Per User Dashboard stats

export const getTaskTypeCounts = (signal?: AbortSignal) =>
  request<TaskTypeCounts>("/stats/task-type", { signal });
 
export const getExecutionSummary = (signal?: AbortSignal) =>
  request<ExecutionSummary>("/stats/success-rate", { signal });
 
export const getLast24h = (signal?: AbortSignal) =>
  request<Last24h>("/stats/last-24h", { signal });
 
export const getAvgDuration = (signal?: AbortSignal) =>
  request<AvgDuration>("/stats/avg-duration", { signal });
 
export const getRecentExecutions = (signal?: AbortSignal) =>
  request<RecentExecution[]>("/stats/recent-executions", { signal });
 
export const getUpcomingRuns = (signal?: AbortSignal) =>
  request<UpcomingRun[]>("/stats/upcoming-runs", { signal });