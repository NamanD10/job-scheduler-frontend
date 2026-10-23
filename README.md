# TaskSmith — Frontend

Dashboard for the TaskSmith webhook/cron scheduler. Next.js 14 (App Router) + Tailwind, talking to the TaskSmith API over cookie-based sessions (better-auth).

## Setup

```bash
npm install
cp .env.local.example .env.local
# edit .env.local to point NEXT_PUBLIC_API_URL at your backend
npm run dev
```

Runs on `http://localhost:3000` by default — **change the dev port** if your backend is already on 3000:

```bash
npm run dev -- -p 5143
```

`5143` and `8008` are already in the backend's `trustedOrigins` (see `src/lib/auth.ts` on the backend), so pick one of those for local dev, or add your own origin there.

## What's here

- `app/login`, `app/signup` — email/password auth against better-auth's default endpoints (`/api/auth/sign-in/email`, `/api/auth/sign-up/email`)
- `app/dashboard` — queue stats strip, task list (active / upcoming / history), "Create task" slide-over
- `app/dashboard/tasks/[id]` — full task detail + delete
- `lib/api.ts` — fetch wrapper (`credentials: "include"` for cookies); all backend calls go through here
- `lib/auth-context.tsx` — session state, checked via `GET /api/auth/get-session`

## Known assumptions — confirm against your backend

- Auth endpoints follow better-auth's default email/password routes. If you've customized them, update `lib/api.ts`.
- `POST /tasks/create` requires `userId` in the body (the authenticated user's `id`) in addition to the session cookie — matches the current backend behavior.
- GitHub OAuth isn't wired up in the UI yet (backend supports it) — ask if you want a "Sign in with GitHub" button added.
- No pagination on `GET /tasks` — fine for now, but worth adding if task counts grow.
