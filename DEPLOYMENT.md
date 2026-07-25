# Deploying OrderFlow

This is the operational guide for taking OrderFlow to production on Vercel + Supabase. It assumes you already have a Supabase account and a Vercel account.

## 1. Supabase project setup

1. Create a new project at [supabase.com/dashboard](https://supabase.com/dashboard). Note the project URL and `anon` public key (Settings → API) — you'll need them in step 3.
2. Run every migration in `supabase/migrations/` **in filename order** (they're timestamp-prefixed and additive — never skip one or run out of order). The simplest path is the Supabase CLI:
   ```bash
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```
   Alternatively, paste each file's contents into the SQL Editor in order, oldest first.
3. Storage buckets (`logos`, `product-images`, `category-images`) are created by `20260725120900_storage.sql` itself — no manual bucket setup needed.
4. **Bootstrap your first super admin.** The `admin_users` table has zero RLS policies by design (see the comment in `20260725220000_super_admin.sql`) — the only way in is the SQL Editor or a service-role call:
   ```sql
   insert into public.admin_users (user_id)
   values ('<your-auth-user-uuid>');
   ```
   Find your user's UUID under Authentication → Users after you've signed up once through the app.
5. Auth email templates: Supabase's default templates work out of the box, but you'll likely want to customize the "Confirm signup" and "Reset password" emails (Authentication → Email Templates) with your own branding before launch.

## 2. Environment variables

Copy `.env.local.example` to `.env.local` for local dev, and set the same keys in Vercel (Project Settings → Environment Variables) for Preview and Production:

| Variable                        | Required        | Notes                                                                                                                                                                                                                |
| ------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes             | From Supabase Settings → API                                                                                                                                                                                         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes             | From Supabase Settings → API — safe to expose, it's bound by RLS                                                                                                                                                     |
| `NEXT_PUBLIC_SITE_URL`          | Production only | Your canonical production URL, no trailing slash (e.g. `https://orderflow.app`). Drives `metadataBase`, canonical/OG tags, and the sitemap. Falls back to `http://localhost:3000` if unset, so it's optional in dev. |
| `SUPABASE_SERVICE_ROLE_KEY`     | No              | Declared and validated but currently unused by any code path. Only add it if you build something that genuinely needs to bypass RLS server-side — never import it into anything reachable from a Client Component.   |

`src/lib/env.ts` validates all of these with Zod at startup — a missing or malformed required var throws immediately rather than failing silently at request time.

## 3. Deploying to Vercel

1. Import the repository at [vercel.com/new](https://vercel.com/new). Vercel auto-detects Next.js — no build command overrides needed.
2. Add the environment variables from the table above (Production, and Preview if you want preview deployments to hit a real Supabase project — a separate staging Supabase project is recommended over pointing previews at production data).
3. Set `NEXT_PUBLIC_SITE_URL` to your real production domain before the first production deploy so metadata/sitemap/OG tags are correct from day one.
4. Deploy. `package.json` pins `"engines": { "node": ">=20.9.0" }` — Vercel's default Node runtime already satisfies this, no action needed.
5. Once you have a custom domain attached, Vercel issues and renews TLS automatically; nothing in this app needs manual certificate handling.

## 4. What's already wired for production

- **Security headers** (`next.config.ts` + `src/middleware.ts`): `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`, and a nonce-based `Content-Security-Policy` (the nonce is generated per-request in middleware and Next automatically threads it through to its own inline scripts).
- **Error boundaries**: `src/app/error.tsx`, `global-error.tsx`, `not-found.tsx` at the root, plus scoped ones for `(dashboard)/dashboard`, `admin`, and `store/[slug]` so an error in one area doesn't white-screen the whole app.
- **Logging**: `src/lib/logger.ts` — a single `logError()` seam. Every error boundary calls it. It currently writes structured JSON to `console.error`, which Vercel captures in your project's Runtime Logs / any log drain you configure automatically, no setup required.
- **Monitoring**: `@vercel/analytics` and `@vercel/speed-insights` are installed and mounted in the root layout — Web Vitals and page views show up in the Vercel dashboard immediately after your first deploy, no extra config.
- **SEO**: `src/app/sitemap.ts` (includes every active storefront), `src/app/robots.ts` (disallows `/dashboard`, `/admin`, and all auth routes), `src/app/manifest.ts`, per-page `generateMetadata()` on storefront/product pages, JSON-LD on the homepage and storefront pages, and `robots: { index: false }` on the `(dashboard)` and `admin` layouts as a second line of defense beyond robots.txt.
- **Database**: every FK column is indexed, `pg_trgm` GIN indexes back every `ILIKE '%term%'` search, `place_order()` re-validates prices and row-locks server-side, and an `admin_audit_log` table (written only by a `SECURITY DEFINER` function, same lockdown pattern as `admin_users`) records every suspend/unsuspend/delete/plan-change/flag-toggle automatically at the trigger level — query it directly in the SQL editor:
  ```sql
  select * from public.admin_audit_log order by created_at desc limit 50;
  ```
- **Image optimization**: every image goes through `next/image`; `next.config.ts` scopes `remotePatterns` to your Supabase storage bucket only.
- **Code splitting**: the recharts-based charts on `/admin` and `/dashboard/analytics` are lazy-loaded client-side (`orders-bar-chart-lazy.tsx`, `product-rank-chart-lazy.tsx`) instead of shipping recharts in the initial payload of those routes.

## 5. Known gaps and recommended follow-ups

These were identified during the production audit and are deliberately **not** silently patched over — they need a decision from you (infra choice, or an account/API key only you can provision):

- **No rate limiting on auth or public write endpoints.** Supabase's own GoTrue service applies baseline rate limits to login/signup/password-reset, but the public `place_order` and `increment_product_view` RPCs (called directly from the browser via `supabase-js`, bypassing any Next.js server code) have none. Recommended: [Upstash Ratelimit](https://github.com/upstash/ratelimit) or Vercel's [Firewall](https://vercel.com/docs/vercel-firewall) rules in front of these, or a Postgres-level throttle (e.g. reject if the same IP/session placed >N orders in the last minute).
- **No APM/error-tracking service.** `logger.ts` is intentionally a thin seam for this — wiring in [Sentry](https://docs.sentry.io/platforms/javascript/guides/nextjs/) is a `npx @sentry/wizard@latest -i nextjs` away; once you have a DSN, replace the body of `logError()` with `Sentry.captureException(error, { extra: context })` and every call site (all 4 error boundaries) picks it up with no further changes.
- **Framer Motion is used for several simple opacity/slide entrance transitions** (`src/components/shared/reveal.tsx`, category rows, cart trigger, etc.) that CSS transitions could handle without shipping the library's JS. Not fixed here to avoid touching many files under time pressure for a cosmetic-only win — worth revisiting if bundle size becomes a real constraint.
- **No branded app icons.** `src/app/manifest.ts` currently points at the default Next.js `favicon.ico`. Generate real 192×192 / 512×512 PNG icons (and an `apple-touch-icon`) before launch and reference them there.
- **`npm audit`** reports 3 high-severity advisories, all nested inside `node_modules/next/node_modules/{postcss,sharp}` — these are transitive to the `next` package itself, and the only "fix" `npm audit fix --force` offers is downgrading to `next@9`, which is not viable. Re-run `npm audit` against a real npm registry before shipping (this environment's registry may differ) and re-evaluate; don't downgrade Next to silence it.

## 6. Post-deploy checklist

- [ ] Visit `/robots.txt` and `/sitemap.xml` on the production domain and confirm the URLs use your real domain, not `localhost`.
- [ ] Confirm `Content-Security-Policy` and the other security headers are present: `curl -sD - -o /dev/null https://yourdomain.com`.
- [ ] Sign up a test business, confirm the WhatsApp checkout message formats correctly with a real phone number.
- [ ] Insert your own `auth.users` UUID into `admin_users` and confirm `/admin` is reachable.
- [ ] Trigger a suspend/unsuspend/plan-change from `/admin` and confirm rows appear in `admin_audit_log`.
- [ ] Check Vercel's Speed Insights after a day of traffic for any route with a poor Core Web Vitals score.

## 7. Rolling back

Vercel keeps every deployment; use **Instant Rollback** from the project's Deployments tab to point production traffic at a previous build in seconds. Database migrations are additive-only and were never designed to be rolled back automatically — if a migration needs reverting, write a new migration that undoes it rather than editing history.
