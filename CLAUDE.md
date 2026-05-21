# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ Next.js Version Warning

This project runs **Next.js 16.2.6** (Turbopack). APIs, conventions, and file structure differ from earlier versions in your training data. Before writing any Next.js-specific code, check `node_modules/next/dist/docs/` and heed deprecation notices.

Known breaking changes already encountered:
- `middleware.ts` must export `async function middleware` (not `proxy`), but Next.js 16 internally translates it. Keep the filename `middleware.ts` and the export name `middleware`.
- `Button` from shadcn/ui uses `@base-ui/react/button` — **`asChild` prop does not exist**. Use `buttonVariants()` with a `<Link>` instead: `<Link className={cn(buttonVariants({ variant, size }), "...")} href="...">`.
- `Select.onValueChange` receives `string | null`. Guard with `val && setValue(...)` or `String(val ?? "")`.

## Commands

```bash
npm run dev       # Start dev server (Turbopack) at localhost:3000
npm run build     # Production build
npm run lint      # ESLint
npx tsc --noEmit  # Type-check without building

# Seed the database (requires .env.local with SUPABASE_SERVICE_ROLE_KEY)
npx ts-node --project tsconfig.seed.json scripts/seed.ts
```

No test suite exists yet.

## Architecture

**Libreview** is a free UPCAT reviewer for Filipino Grade 12 students. MVP covers UPCAT only.

### Route structure

```
src/app/
  page.tsx                      # Redirects to /login
  (auth)/login/                 # Google OAuth sign-in page
  (auth)/onboarding/            # Post-signup profile setup (exam date + university)
  (app)/layout.tsx              # Authenticated shell: Sidebar (desktop) + BottomNav (mobile)
  (app)/dashboard/              # Home screen — built
  (app)/practice/               # Topic practice flow — not yet built
  (app)/mock-exam/              # Timed mock exam — not yet built
  (app)/resources/              # Study resources — not yet built
  (app)/progress/               # Analytics dashboard — not yet built
  admin/                        # Admin panel (role-gated) — not yet built
  api/auth/callback/route.ts    # Supabase OAuth callback; routes new users to /onboarding
```

### Auth flow

1. `middleware.ts` protects all `/(app)/*`, `/onboarding`, and `/admin/*` routes — redirects to `/login` if no session.
2. Google OAuth via Supabase Auth. Callback at `/api/auth/callback` checks for an existing `user_profiles` row; missing → `/onboarding`, existing → `/dashboard`.
3. Two Supabase clients: `src/lib/supabase/server.ts` (Server Components + Route Handlers, uses `next/headers` cookies) and `src/lib/supabase/client.ts` (Client Components, browser only). Always use the correct one for the rendering context.

### Database (Supabase PostgreSQL)

Key tables: `user_profiles`, `subtests`, `topics`, `questions`, `exam_sessions`, `session_answers`, `user_topic_progress`, `question_reports`, `resources`, `universities`.

RLS is enabled on all tables. The `is_admin()` SQL function (in `supabase/rls.sql`) gates admin-only operations. The Supabase client is **not** typed with a Database generic — queries return `any`. Cast or narrow results manually.

Schema SQL: `supabase/schema.sql` — RLS policies: `supabase/rls.sql`.

### Design system

CSS variables defined in `src/app/globals.css`. Key tokens: `--primary` (#0D9488 teal), `--accent` (#F59E0B amber), `--background` (#F8FAFC). Fonts: `--font-plus-jakarta-sans` (headings via `font-heading` class), `--font-inter` (body). Default radius: `rounded-xl`. Accuracy color rule: green ≥70%, amber 50–69%, red <50%.

`src/lib/constants.ts` holds subtest slugs, mock exam timing (3600s total, 60 items), practice session size (15 questions), and accuracy thresholds.

### Key shared components

- `src/components/ui/AccuracyRing.tsx` — SVG progress ring, server-safe, color-codes by accuracy threshold.
- `src/components/nav/Sidebar.tsx` + `BottomNav.tsx` — desktop/mobile nav, active state via `usePathname()`.

### Business logic (not yet implemented, planned in phases)

- **Streak**: after topic practice completion, compare `last_session_date` to today; increment, hold, or reset `streak_count` in `user_profiles`.
- **Progress upsert**: after every completed session, upsert `user_topic_progress` recalculating `accuracy_percentage = correct_attempts / total_attempts * 100`.
- **Question selection**: practice → 15 random `approved` questions for the topic; mock exam → proportional random selection across topics per subtest using `mock_item_count`.
- **Mock exam timer**: stored in Zustand; remaining time recalculated from `exam_sessions.started_at` on page load to survive refresh.
