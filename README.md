# RAWI | راوي

RAWI is a UAE-born media delivery platform for photographers, videographers, and creative teams —
replacing Drive/Dropbox/WeTransfer links with cinematic, branded client galleries.

This repo is the production Next.js app. The original static prototype (`index.html` / `styles.css`
/ `app.js`) has been ported into real, data-backed pages — its design tokens and layouts are
preserved throughout.

## Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Backend:** Supabase (Postgres + Auth + Storage), enforced with Row Level Security
- **Deployment:** Vercel (recommended)

## Local setup

```bash
npm install
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
npm run dev
```

Without Supabase credentials set, the app still runs: the landing page works, and any protected
route (`/dashboard`, `/projects`, `/analytics`, `/settings`) redirects to `/setup-required` instead
of faking access. Nothing pretends to succeed without a real backend.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Copy the Project URL, anon key, and service_role key into `.env.local`.
3. Run the migrations against your project:

   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```

   This runs `supabase/migrations/0001_init.sql` (schema + RLS) and `0002_storage.sql` (private
   `media` bucket + public `public-assets` bucket, both RLS-scoped by workspace).

4. In Supabase Auth settings, set the **Site URL** and **Redirect URLs** to include
   `${NEXT_PUBLIC_APP_URL}/auth/callback` so email verification and password reset links work.
5. (Optional) Regenerate typed database bindings once linked:

   ```bash
   npx supabase gen types typescript --linked > src/types/database.ts
   ```

## Architecture notes

- **Multi-tenancy:** every user-owned table (`clients`, `projects`, `galleries`, `media`, …) is
  scoped through `workspace_members`, and every policy checks `auth.uid()` server-side via RLS —
  never frontend filtering. See `supabase/migrations/0001_init.sql`.
- **Storage:** the `media` bucket is private. Public gallery visitors never get direct bucket
  access — the app issues short-lived signed URLs (`src/app/g/[slug]/actions.ts`) via a
  server-only admin client (`src/lib/supabase/admin.ts`) that uses the service-role key, which is
  never bundled into client code (enforced by the `server-only` package).
- **Gallery passwords:** hashed with bcrypt server-side; the plaintext password never reaches the
  database and the hash never reaches the browser.
- **i18n:** lightweight dictionary-based system (`src/lib/i18n`) with real `dir` switching, built
  to extend past English/Arabic later.

## Current feature status

| Area | Status |
|---|---|
| Landing page | Ported to React, matches prototype design |
| Auth (sign up, sign in, verify, reset, logout, protected routes) | Implemented |
| Multi-tenant schema + RLS | Implemented |
| Dashboard, projects, client creation | Implemented, real data, empty states |
| Media upload (Supabase Storage) | Implemented — drag/drop, per-file status, no fake success |
| Gallery builder (sections, publish/unpublish) | Basic version implemented |
| Gallery builder (drag-reorder, themes) | Not yet implemented |
| Public client gallery (password, expiry, favorites, downloads, views) | Implemented |
| WhatsApp / copy-link sharing | Implemented |
| Video processing (Mux/Cloudflare Stream) | Not implemented — videos upload but aren't transcoded |
| Cloudflare R2 migration | Not implemented — currently Supabase Storage |
| Billing (Stripe) | Not implemented — `subscriptions` table exists, no checkout flow |
| Custom domains | Not implemented |
| Resumable/chunked uploads | Not implemented — currently single-request uploads |

## What you need to provide to go further

- Supabase project credentials (above) — unblocks everything in Phase 1–5.
- A Stripe account + price IDs — unblocks billing.
- A Mux or Cloudflare Stream account — unblocks real video transcoding/playback.
- A domain on Vercel — unblocks custom gallery domains.

## Deploy

Import this repo into Vercel, set the environment variables from `.env.example`, and deploy. Set
`NEXT_PUBLIC_APP_URL` to your production domain so shared gallery links are correct.
