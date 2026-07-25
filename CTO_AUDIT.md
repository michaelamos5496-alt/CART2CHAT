# OrderFlow — CTO Audit

A full-codebase review across architecture, security, multi-tenant isolation, database design, auth, performance, accessibility, SEO, error handling, mobile responsiveness, type safety, API design, and testability. Eight parallel audits were run (four in an earlier production-readiness pass, four covering the areas above); this document is the result: what was fixed, what's deliberately left as debt, and where V2 should go.

## 1. Improvements made

### Security — multi-tenant isolation
- **Suspended businesses could still transact.** `place_order()` and the public `SELECT` policies on `products`, `categories`, `product_images`, and `business_settings` all checked `is_active = true` but never `is_suspended = false`. A suspended tenant's storefront was hidden from the businesses listing, but its catalog stayed publicly readable and orders kept flowing. Fixed in `supabase/migrations/20260725240000_suspension_and_provisioning_fixes.sql`.
- **Suspension could be self-reversed.** The owner's own `UPDATE` policy on `businesses` checks `owner_id = auth.uid()` but, being row-level RLS, can't restrict *which columns* an owner touches — a suspended owner could call the same update the dashboard uses for anything else and simply include `is_suspended: false`. Fixed with a `BEFORE UPDATE` trigger that locks the three suspension columns to admins only, regardless of what the client sends (`20260725230000_production_hardening.sql`).
- **Auto-provisioning had a dead code path.** The business-provisioning trigger only fired `AFTER UPDATE OF email_confirmed_at` — but when a Supabase project has email confirmation disabled, that field is set at `INSERT` time, so the trigger never runs, the user gets a session with no business, and every dashboard page silently rendered blank forever. Fixed by adding an `AFTER INSERT` trigger covering the same case, with a new `/dashboard/pending` fallback page (and a middleware redirect to it) so the failure mode is now visible and recoverable instead of a blank screen.
- **`deleteProduct` could orphan a product's images.** Storage files were deleted before the DB row; if the DB delete failed afterward, the product survived with its photos already gone. Reordered so the DB delete is authoritative and runs first.
- Plus, from the earlier pass: nonce-based CSP and full security headers, an open-redirect fix in the auth callback route, RLS confirmed enabled + `WITH CHECK` present on every owner-scoped table, and an `admin_audit_log` (written only by a `SECURITY DEFINER` function) that now records every suspend/unsuspend/delete/plan-change/flag-toggle automatically.

### Type safety
- **`src/types/database.ts` was a stub** (`Record<string, never>`) — none of the three Supabase client factories were generic over it, so every query result was effectively untyped and every `as Foo` cast in `queries.ts`/`mutations.ts` was compiler-unverified. Replaced with a complete hand-authored `Database` type (all 14 tables, their `Row`/`Insert`/`Update` shapes, the 3 client-callable RPC signatures, FK relationship metadata for the embedded selects actually used) and wired `createServerClient<Database>`, `createBrowserClient<Database>`, and the public `createClient<Database>` to use it.
- This immediately caught two real bugs the compiler couldn't see before: two computed-key `.update({ [column]: value })` calls in `features/business/lib/mutations.ts` that TypeScript now correctly rejects (fixed with explicit branching), and a `getPlanLimits(plan: string)` that should have been typed as `SubscriptionPlan`.
- Removed the one remaining `: any` in `features/orders/lib/queries.ts`, replaced with a structurally-typed generic constrained to the two methods actually used.
- Marked `src/types/database.ts` as a stand-in for `npx supabase gen types typescript` — the moment a real Supabase project exists, generating a real file is a drop-in replacement (same shape), not a rewrite.

### Testability
- Added `vitest` (zero test infrastructure existed before this — no config, no `test` script, no test files anywhere). 11 tests now cover the highest-value pure functions in the codebase: WhatsApp message templating/URL building (`features/cart/lib/whatsapp.ts`), plan-feature gating (`features/subscription/lib/flags.ts`), and the new shared pagination helper.
- Extracted `getPageRange(page, pageSize)` into `src/lib/constants.ts` — this was hand-recomputed identically in four different `queries.ts` files; now it's one tested function.

### Accessibility (WCAG 2.2 AA)
- **Category reordering had no non-drag alternative** (2.5.7 Dragging Movements) — added keyboard/click-accessible move-up/move-down buttons alongside the existing drag handle.
- **Cart line-item remove button was under the 24×24px target size floor** (2.5.8) — was a bare 16px icon with no hit-area padding; now a proper 28px target.
- **Products table had no responsive column strategy**, unlike its sibling tables (orders, admin businesses) — added the same `hidden sm:/md:/lg:table-cell` pattern so it doesn't force a dense 6-column horizontal scroll on mobile.
- Plus, from the earlier pass: dialog label associations, `aria-live` on form errors, and confirmed contrast/focus-visible/alt-text were already solid everywhere else.

### Code quality / DRY
- `PAGE_SIZE` was defined independently in three files with two different values (10 vs 15) with no explanation for the discrepancy — centralized to one `src/lib/constants.ts` export.
- `MAX_FILE_SIZE` (image upload ceiling) was duplicated verbatim in two files — centralized.
- Chart-axis date formatting (`toLocaleDateString(...)`) was reimplemented independently in three places instead of using `src/lib/format.ts` — added `formatDayLabel`/`formatMonthLabel` there and pointed all three call sites at them.
- `products.view_count` (a real, indexed DB column added for analytics) was missing from the hand-written `Product` type — added.

### Carried over from the earlier production-readiness pass (for the full picture)
Security headers + nonce CSP, `error.tsx`/`global-error.tsx`/`not-found.tsx` at root and per-segment, a `logError()` seam plus Vercel Analytics/Speed Insights (previously zero monitoring), `pg_trgm` search indexes, lazy-loaded chart bundles (`/admin` First Load JS: 213kB → 113kB), corrected `robots.txt`/sitemap/`noindex` on authenticated routes, and full `DEPLOYMENT.md` documentation.

## 2. Remaining technical debt

Ranked by what actually matters for launch, not by how it was discovered.

| Item | Why it's debt, not a fix | Suggested owner action |
|---|---|---|
| **No rate limiting on `place_order`/`increment_product_view`** | These RPCs are called directly from the browser via `supabase-js`, bypassing any Next.js server code — Next middleware can't intercept them. Supabase's built-in rate limits cover auth endpoints, not custom RPCs. | Add Upstash Ratelimit or Vercel Firewall rules in front of these, or a Postgres-level per-IP/session throttle. |
| **No APM/error-tracking service** | `logError()` writes to `console.error` (captured by Vercel's logs), but there's no searchable, alerting error tracker. | `npx @sentry/wizard@latest -i nextjs`, then swap `logError()`'s body — every call site (4 error boundaries) picks it up unchanged. |
| **Duplicated confirm-dialog boilerplate** (5 near-identical `AlertDialog` wrappers: suspend/delete-business, category/product delete, image-manager delete) | Cosmetic/DRY issue, not a correctness bug — didn't touch under time pressure to avoid regressions across 5 destructive-action flows right before a review. | Extract a shared `ConfirmDialog` (with an optional "type the name to confirm" variant) once there's room to test all 5 call sites carefully. |
| **Business logo/banner swap is two un-transacted writes** | Upload → DB update → delete-old-file, in that order. If the process dies between upload and DB update, a valid file leaks with nothing pointing to it. Already flagged as low-severity by the audit itself. | A scheduled orphan-file sweep, or move to a single RPC, next time this code is touched. |
| **`cart` feature doesn't follow the `lib/{queries,mutations}.ts` convention** other features use | It's `cart-context.tsx` + `place-order.ts` + `whatsapp.ts` instead — not wrong, just undocumented as the exception it is. | A one-line note in the feature-folder convention (CLAUDE.md/AGENTS.md) rather than a rename. |
| **No shared `StatusBadge` component** | Order status has one (`OrderStatusBadge`); business-active/suspended and subscription-status badges are ad-hoc colored spans repeated per file. | Extract once a third status type shows up (currently exactly 2, not yet worth the abstraction). |
| **`npm audit`: 3 high-severity advisories** | All nested in `node_modules/next/node_modules/{postcss,sharp}` — transitive to `next` itself; the only "fix" is downgrading to `next@9`. Not real in this environment's registry. | Re-run `npm audit` against a real npm registry at deploy time and re-evaluate; don't downgrade Next to silence it. |
| **Framer Motion used for several simple opacity/slide transitions** that CSS could handle | Real but modest bundle-size opportunity (~40-50kB gzip on routes that don't otherwise need JS-driven animation). | Revisit if bundle size becomes an actual constraint — not one today. |
| **No branded app icons** | `manifest.ts` points at the default Next.js `favicon.ico`. | Generate real 192×192/512×512 PNGs + apple-touch-icon before public launch. |
| **Test coverage is a foundation, not a suite** | 11 tests cover 3 pure-function modules. Everything in `queries.ts`/`mutations.ts` is tightly coupled to `cookies()`/`headers()`/a live Supabase client and would need dependency injection or a test database to cover meaningfully. | See V2 roadmap — this is a deliberate "walk before run" starting point, not an oversight. |

## 3. V2 roadmap

Grouped by theme, roughly in priority order within each group.

### Trust & safety infrastructure
- **Payment integration** (Stripe or a local processor) — `business_subscriptions.status` has never been set to anything but `active` because nothing writes to it yet; the billing-lock middleware logic exists and is tested-in-principle but has never actually fired.
- **Rate limiting** across public write surfaces (orders, view tracking) and auth.
- **Sentry** (or equivalent) wired in for real production error visibility.
- **Inventory/stock tracking** — `place_order()` currently has no stock column to race on; the moment one exists, its row-locking behavior needs re-review (flagged as a watch item in the original security audit).

### Platform depth
- **Real integration/E2E test suite** — Playwright against a seeded Supabase test project, covering the two flows that matter most: place-an-order-end-to-end and suspend/delete-a-business-from-admin. This is the natural next step after the unit-test foundation added here.
- **Webhooks / API for order status** — right now the only way to update order status is the dashboard UI; a partner integration (e.g. a POS system) has no path in.
- **Multi-currency-aware analytics** — revenue is currently reported per-currency without conversion (a deliberate, documented choice); V2 could add an FX-rate service for a blended view.
- **Audit log UI** — `admin_audit_log` exists and is populated automatically, but there's no `/admin` page to browse it yet; it's queryable only via the SQL editor today.

### Product surface
- **Customer accounts** — today every order is anonymous/guest; a returning-customer experience (order history, saved address) doesn't exist.
- **Discount codes / promotions** — no `discounts` table or checkout support exists.
- **Multi-location businesses** — the schema is one-storefront-per-owner; a business with multiple physical locations/WhatsApp numbers isn't representable.
- **Team members per business** — `owner_id` is a single user; there's no way to invite a second staff account to a business's dashboard.

### Engineering health
- **Confirm-dialog and status-badge component consolidation** (from the tech-debt table above) — natural cleanup once the codebase is past initial launch churn.
- **Framer Motion audit** — replace simple entrance transitions with CSS, reserve it for genuinely gesture-driven UI (the cart drawer).
- **Regenerate `database.ts` from a live project** the moment one exists, replacing the hand-authored stand-in.

## Verification

Every change in this audit is covered by the full pipeline: `npm run typecheck`, `npm run lint`, `npm run format`, `npm run test` (11/11 passing), and a full `next build` against a placeholder environment — all clean. The new migration (`20260725240000_suspension_and_provisioning_fixes.sql`) is parse-validated but, like every migration in this repo, has not been run against a live database in this environment (see `DEPLOYMENT.md` for how to connect one).
