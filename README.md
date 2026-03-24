# TrustChain — B2B Escrow SaaS

Next.js 14 (App Router) B2B escrow portal with **Supabase PostgreSQL** for data and **JWT** for authentication.

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

## Quick start

```bash
npm install
cp .env.example .env.local
```

1. In Supabase: **SQL Editor** → run the migration in `supabase/migrations/20250226000000_initial_schema.sql` (paste and execute), or use the Supabase CLI: `supabase db push` if linked.
2. Fill `.env.local`:
   - `SUPABASE_URL` — Project URL
   - `SUPABASE_ANON_KEY` — anon public key (optional for server-only usage)
   - `SUPABASE_SERVICE_ROLE_KEY` — **required** for API routes (Settings → API → `service_role`; keep secret, never commit)
   - `JWT_SECRET` — random string for signing login JWTs

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Error: `Could not find the table 'public.companies'`

The database tables were not created in **this** Supabase project yet (or `.env.local` points at a different project).

**Option A — SQL Editor (recommended)**  
1. **Supabase Dashboard** → **SQL Editor** → **New query**.  
2. Paste **all** of **`supabase/RUN_IN_SQL_EDITOR.sql`** → **Run**.  
3. Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` are from **this** project (**Settings → API**).  
4. Restart `npm run dev` and register again.

**Option B — CLI**  
1. Add **`DATABASE_URL`** to `.env.local` (from **Settings → Database → Connection string** → URI; prefer **Direct** or **Session** pooler).  
2. Run: **`npm run db:setup`**  
3. Register again.

## Production / GitHub deployment

1. Push this repo to GitHub (do not commit `.env.local`).
2. Deploy on **Vercel** (or similar): connect the repo, set the same environment variables in the host dashboard.
3. Run `npm run build` then `npm start` (or use the platform’s build command).

### Environment variables (host)

| Variable | Required | Notes |
|----------|----------|--------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (API) | Server-only; full DB access for Next.js Route Handlers |
| `SUPABASE_ANON_KEY` | Optional | Fallback if service role unset (not recommended for production) |
| `JWT_SECRET` | Yes | Same value across instances for valid tokens |

## Scripts

- `npm run dev` — development server  
- `npm run build` — production build  
- `npm start` — run production server  
- `npm run lint` — ESLint  

## Project layout

- `src/app/` — pages and `api/` routes  
- `src/lib/supabase.ts` — Supabase server client  
- `supabase/migrations/` — PostgreSQL schema  
- `public/` — static assets  

## Database

Tables: `companies`, `users`, `transactions`. API responses keep the same JSON shape as before (e.g. `_id`, camelCase fields on transactions) for compatibility with the existing frontend.

## License

Private / as per your organization.
