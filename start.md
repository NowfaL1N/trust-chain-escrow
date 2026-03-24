# B2B Escrow SaaS — Quick start

## Prerequisites

- **Node.js** (v18 or v20)
- **Supabase** project with schema applied from `supabase/migrations/20250226000000_initial_schema.sql`

## Installation

```bash
npm install
```

## Environment

Create `.env.local` (see `.env.example`):

```env
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
JWT_SECRET="your_secure_random_secret_here"
```

## Run

```bash
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

## Project structure

- `src/app/` — Next.js App Router (pages and API routes)
- `src/components/` — UI (escrow flows, dashboard)
- `src/lib/` — Supabase client, JWT, email helpers
- `supabase/migrations/` — PostgreSQL schema

## Auth

Login/register use `/api/auth/login` and `/api/auth/register` with Supabase + JWT.
