# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Petelur** — Egg Farm Management Dashboard. A web-based operational system for laying hen farms. Core modules: egg production recording, cage monitoring, feed management, chicken health, egg sales, basic financials, farm performance analytics.

Two user roles:
- **Owner** (Super Admin): full access to all modules, analytics, financials, settings
- **Worker**: operational only — input production, feed, health; no financials or full analytics

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript (strict mode) |
| Styling | TailwindCSS + shadcn/ui |
| Database | Supabase / PostgreSQL |
| ORM | Drizzle ORM |
| Forms | React Hook Form + Zod |
| Tables | TanStack Table |
| Charts | Recharts |

## Architecture

**Modular monolith** — not microservices. Each domain (production, feed, health, sales, finance) is a self-contained module under `src/features/`. Do not cross module boundaries directly; go through shared lib utilities or API routes.

```
src/
├── app/          # Next.js App Router pages and layouts
├── components/   # Shared UI components (non-feature-specific)
├── features/     # Domain modules — one folder per domain
├── lib/          # Shared utilities, Supabase client, auth helpers
├── db/           # Drizzle schema and migrations
├── hooks/        # Shared React hooks
├── types/        # Shared TypeScript types
└── utils/        # Pure utility functions
```

Each feature in `src/features/` should be self-contained: its own components, hooks, server actions, and types. Import from `src/lib` or `src/types` freely; avoid importing across features.

## Development Commands

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run lint      # ESLint
npm run typecheck # tsc --noEmit
```

Run a single test file:
```bash
npx jest path/to/file.test.ts
```

## Coding Standards

- **TypeScript strict mode** — no `any`, explicit types on objects that cross function boundaries
- **camelCase** for variables and functions (`totalEggProduction`, `feedStockRemaining`)
- **PascalCase** for components and types
- Mobile-first CSS — workers use phones in the field; all UI must be usable on small screens
- Keep interactions shallow: input flows must complete in minimal taps/clicks
- Zod schemas are the source of truth for form validation; derive TypeScript types from them with `z.infer`
- Drizzle schema lives in `src/db/schema.ts`; never write raw SQL outside migrations
