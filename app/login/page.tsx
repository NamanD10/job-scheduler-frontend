"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import ThemeToggle from "@/components/ThemeToggle";
import OAuthButtons from "@/components/OAuthButtons";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { refresh } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      await refresh();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't sign in. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="fixed top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <h1 className="text-2xl font-medium tracking-tight">TaskSmith</h1>
          <p className="mt-1 text-sm text-muted">Sign in to view your scheduled tasks.</p>
        </div>

        <OAuthButtons />
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm mb-1.5 text-muted">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus-ring w-full border border-line bg-surface px-3 py-2 text-sm rounded-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm mb-1.5 text-muted">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus-ring w-full border border-line bg-surface px-3 py-2 text-sm rounded-sm"
              placeholder="••••••••"
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
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-muted">
          No account?{" "}
          <Link href="/signup" className="text-cobalt hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
