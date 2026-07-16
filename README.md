# PesoTrack

A bill and expense tracker with live spreadsheet-style formula evaluation, recurring bills that copy forward each month, and bill splitting — see [the architecture plan](/Users/wilfredo.soriano/.claude/plans/md-i-am-attaching-partitioned-rainbow.md) for the full design.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind + shadcn/ui · Prisma 7 + PostgreSQL (Supabase) · Clerk · Zustand · TanStack Table · Recharts

## Setup

1. **Database** — create a [Supabase](https://supabase.com) project, then copy `.env.example` to `.env` and fill in from the project dashboard's "Connect" dialog:
   - `DATABASE_URL` — the "Transaction pooler" string (port 6543, add `?pgbouncer=true&uselibpqcompat=true&sslmode=require`)
   - `DIRECT_URL` — the "Session pooler" string (port 5432, add `?uselibpqcompat=true&sslmode=require`), used for migrations. The true "Direct connection" host is IPv6-only and unreachable from many networks, so the session pooler is used instead.
   - `sslmode=verify-full` (the effective default in current `pg`/`pg-connection-string` versions) fails against Supabase's pooler with "self-signed certificate in certificate chain" unless you also supply Supabase's CA bundle — `uselibpqcompat=true&sslmode=require` opts into true libpq semantics (encrypt without full chain verification) instead.
2. **Auth** — create a [Clerk](https://dashboard.clerk.com) application, fill in `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY`, and add a webhook endpoint pointing at `/api/webhooks/clerk` (events: `user.created`, `user.updated`, `user.deleted`) — copy its signing secret into `CLERK_WEBHOOK_SIGNING_SECRET`.
3. Install dependencies and run migrations:
   ```bash
   npm install
   npx prisma migrate dev --name init
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` — start the dev server (Turbopack)
- `npm run build` — production build
- `npm run test` — run the expression-evaluator unit tests (Vitest)
- `npx prisma studio` — browse the database
- `npx prisma db seed` — backfill any missing default categories for existing users (new users get theirs automatically at signup)

## Notes on this scaffold

- PWA installability (service worker via `@ducanh2912/next-pwa`) is deferred to Phase 2 — that package is Webpack-based and Next 16 defaults to Turbopack for builds; wiring it up needs a `next build --webpack` flag. `app/manifest.ts` and icon slots are already in place.
- App icons referenced in `app/manifest.ts` (`public/icons/icon-*.png`) still need to be generated.
- Calendar/Reports/Recurring pages are functional but intentionally minimal — richer visualizations are Phase 2/3 scope per the plan.
