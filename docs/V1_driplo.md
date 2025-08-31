# V1 Launch Plan — Driplo C2C Marketplace

Authoritative checklist to finalize V1. Claude‑code executes, referencing docs/END_GOAL.md, docs/00-PROJECT.md, docs/10-ARCHITECTURE.md, docs/20-UI-UX.md, docs/30-STANDARDS.md, docs/40-OPERATIONS.md, docs/REPO_UI_CLEANUP.md, docs/MELT_UI_MIGRATION.md.

## Scope & Go/No‑Go

- Must ship flawless core flows on mobile: Auth → Onboarding → List (/sell) → Discover → Buy (Stripe) → Ship → Deliver → Review.
- No TypeScript errors; CI green on types, lint, tests; Lighthouse mobile p75 ≥ 90; LCP ≤ 1.5s.
- RLS enforced; CSRF + rate limits on mutations; observability & rollback ready.

## Techstack Audit (Summary)

- App: SvelteKit 2 + Svelte 5; Tailwind v4 tokens; repo UI (`@repo/ui`) with Melt wrappers for a11y.
- Auth: Supabase Auth via `@supabase/ssr` cookie‑bridged client. Sessions persist with httpOnly cookies; Supabase manages JWTs internally (we do NOT manually handle JWTs in app code). Client state via onAuthStateChange; SSR session via `locals.safeGetSession()`.
- DB: Supabase Postgres with RLS (see RLS_SECURITY_AUDIT.md). Types in `@repo/database`.
- Payments: Stripe Connect; webhook config documented; order creation present.
- i18n: Paraglide; default `bg` (no prefix), `en` via `/uk`; reroute present, needs consolidation.
- Observability: Sentry wired; error handler present.

Risks/Gaps to close before V1:
- Repo UI barrels and semantic CSS wiring; remove remaining UI duplicates; invalid utility classes.
- i18n reroute consistency (server + client); canonical/hreflang polish.
- API abstraction + CSRF/rate limit coverage on all mutations.
- Finalize /sell and checkout/order states; reviews end‑to‑end; notifications.

## Feature DoD & Tasks (by area)

### 1) Authentication & Onboarding

Definition of Done
- Signup, email verification, login, logout flawless (SSR + client). Persistent auth across reloads.
- Profiles created by DB trigger; onboarding only updates; no race conditions.
- Onboarding captures username, avatar, account info, payout method and persists to Supabase; UI reflects immediately.
- CSRF on actions; rate limits on auth endpoints; no service keys in client; no raw JWT handling in app.

Tasks
- [ ] Audit server auth path: `apps/web/src/lib/server/supabase-hooks.ts` and `locals.safeGetSession()` (order: getSession → getUser; cached per request).
- [ ] Ensure `depends('supabase:auth')` in root `+layout.server.ts` and auth state listeners in `+layout.ts`.
- [ ] Verify email verification endpoint and resend flow; rate‑limit (`/api/auth/resend-verification`).
- [ ] Enforce action‑only for logout; origin checks.
- [ ] Onboarding server action validates and updates profile; never inserts; writes payout setup state.
- [ ] E2E smokes: signup → verify → onboarding → dashboard.

Prompts
- “Open `apps/web/src/routes/+layout.server.ts` and ensure `depends('supabase:auth')` is used; fetch profile by `locals.supabase`.”
- “Open `apps/web/src/routes/(protected)/onboarding/+page.server.ts` and confirm it updates profile fields (username, avatar, payout flags) with schema validation; no inserts.”

### 2) Listing & Selling (/sell)

Definition of Done
- Mobile‑first 3‑step listing flow; robust validation with clear errors; images uploaded; rotation bug fixed; categories/condition/price required.
- Writes to Supabase with RLS compliance; server actions only; optimistic UI optional but resilient.

Tasks
- [ ] Schema: zod validation (title, category, condition, price, shipping, photos min/max).
- [ ] Images: client compression; EXIF rotation handling; storage path per user; policy verified.
- [ ] Server action persists listing; returns typed data; toasts on success; redirect to product page.
- [ ] E2E: create listing end‑to‑end; image attach; confirm DB row.

Prompts
- “Audit `apps/web/src/routes/(protected)/sell/+page.server.ts`: add zod schema, action errors mapping, and typed return.”
- “Verify storage policies in `SUPABASE_POLICIES.sql` for product images; path is user‑scoped.”

### 3) Discovery & Search

Definition of Done
- Search, filters, sort, infinite scroll; wishlist works; page is fast (streamed SSR or server load), no waterfalls.

Tasks
- [ ] Consolidate `LazySearchResults` to `@repo/ui`; remove local wrapper.
- [ ] Coalesce queries per route; cache where public; no client fetch where server can load.
- [ ] E2E: search with filters returns expected products; wishlist add/remove.

### 4) Checkout & Payments (Stripe Connect)

Definition of Done
- Buyer checkout creates order; payment intent/charge succeeds; order recorded; funds reserved/flowed per Connect rules.
- Webhooks update order status; idempotent; signed; errors logged.

Tasks
- [ ] Validate server endpoints for creating intents, confirming payments; no client secrets leak.
- [ ] Webhook: verify signature; update order → paid; handle failure/refund.
- [ ] E2E: buy product; order row present; seller sees sale; buyer sees receipt.

Prompts
- “Review `STRIPE_WEBHOOK_CONFIG.md` and `/routes/api/stripe/*`; ensure idempotency keys and signed webhook parsing.”

### 5) Orders, Shipping, Post‑Sale

Definition of Done
- Seller notified on purchase; can mark shipped (tracking optional); buyer notified; buyer can mark received; both see timeline.

Tasks
- [ ] Order status transitions: created → paid → shipped → delivered → completed/cancelled.
- [ ] Notifications: in‑app toasts; optional email via Resend.
- [ ] E2E: seller marks shipped; buyer marks received; timeline updates.

### 6) Reviews & Ratings

Definition of Done
- Buyer can rate seller after delivery; review stored and visible; prevents duplicate reviews.

Tasks
- [ ] DB: table and RLS; one review per order; aggregate rating on profile.
- [ ] UI: modal on order completion; server action to submit.
- [ ] E2E: leave review; profile rating updates.

### 7) Messaging

Definition of Done
- Real‑time chat stable; input a11y; rate‑limited send; optimistic with rollback; no duplicate messages.

Tasks
- [ ] Rate limit sends; debounce rapid inputs; store ack IDs; dedupe cache.
- [ ] E2E: open thread, send/receive; offline/online indicators.

### 8) Notifications (In‑App + Email)

Definition of Done
- Toasts standardized via `@repo/ui` ToastProvider/Container; critical emails (verification, order updates) via Resend.

Tasks
- [ ] Mount ToastProvider at root; migrate toasts to new API.
- [ ] Implement minimal email templates for order events.

### 9) i18n & SEO

Definition of Done
- Reroute unified; locale persistent; canonical + hreflang correct; no duplicate content.

Tasks
- [ ] One reroute impl in both hooks; default bg; `/uk` → en.
- [ ] Add canonical/hreflang per page (product, search, home).
- [ ] Link helper for localized paths.

### 10) Admin & Ops

Definition of Done
- Admin essentials: moderation, payouts oversight; health/metrics endpoints present.

Tasks
- [ ] Admin auth guard; IP/email allowlist; audit logs.
- [ ] `/api/health` returns status of db, storage, stripe.

### 11) UI/UX Baseline

Definition of Done
- All interactive components use Melt wrappers; tokens/semantic styles applied; 44px/36px tap targets; keyboard/focus visible throughout.

Tasks
- [ ] Load `semantic.css` globally; fix barrel export paths; replace `outline-hidden` → `outline-none`.
- [ ] Replace remaining local UI with `@repo/ui`.

## Security & Compliance

- RLS enabled on all tables; policies reviewed for products, orders, messages, images, reviews.
- CSRF: actions preferred; non‑action POSTs check origin; rate limits on sensitive routes.
- Secrets via platform; service role never in client; env validation on boot.

## QA & Gates

- Unit/Component tests for critical logic and Melt wrappers (Dialog, Menu, Select, Tabs, Tooltip, Toast).
- Playwright smokes: auth, onboarding, sell, search, buy, ship, receive, review.
- Lighthouse CI budgets (mobile); a11y checks (axe) on key pages.
- Sentry DSN set; logs structured; release checklist run.

## Cutover Plan

- Staging deploy; run full smokes; verify webhooks on staging keys.
- Production deploy off‑peak; monitor errors, 404s, payment failures.
- Rollback: redeploy previous build; DB migrations reversible or low‑risk.

## Quick Prompts (Copy/Paste)

- “Import `../styles/semantic.css` in `packages/ui/src/lib/index.ts` and fix export paths to extensionless TS.”
- “Replace `from '@repo/ui/primitives'` with `from '@repo/ui'` in app code.”
- “Unify i18n reroute (server/client); set `bg` default; add canonical + hreflang.”
- “Add `lib/server/api.ts` with withAuth/withValidation/rateLimit/respond; migrate favorites/products/orders endpoints.”
- “Harden `/sell` action with zod; ensure storage policies; write listing; redirect to detail.”
- “Stripe: verify intents, signed webhooks, idempotency; update orders on events.”
- “Orders: implement mark shipped/received; add toasts/emails; timeline.”
- “Reviews: add table/RLS; modal; aggregate to profile.”

Owner: Platform (you + Claude‑code)
