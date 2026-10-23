"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-line">
      <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-lg font-medium tracking-tight">
          TaskSmith
        </Link>
        <div className="flex items-center gap-4">
          {user && <span className="text-sm text-muted font-mono">{user.name}</span>}
          <ThemeToggle />
          <button
            onClick={logout}
            className="focus-ring text-sm text-muted hover:text-ink transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
