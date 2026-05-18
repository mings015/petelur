# Architecture Document

## Egg Farm Management Dashboard

# Tech Stack

## Core

- Next.js (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui

## Backend

- Supabase
- PostgreSQL
- Drizzle ORM

## Utilities

- React Hook Form
- Zod
- TanStack Table
- Recharts

---

# Architecture Style

Menggunakan:

- modular monolith architecture

Bukan:

- microservices
- distributed system

Reason:

- development lebih cepat
- maintenance lebih mudah
- cocok untuk MVP
- lebih sederhana untuk single developer

---

# Frontend Architecture

## App Router Structure

```txt id="arch1"
src/app/
```

src/
├── app/
├── components/
├── features/
├── lib/
├── db/
├── hooks/
├── types/
└── utils/
