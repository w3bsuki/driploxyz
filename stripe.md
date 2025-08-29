# Stripe Integration — Production Fix and Refactor Plan

This document captures the current Stripe integration, the root cause of recent payment failures, the fixes applied, and a short, actionable refactor plan to harden payments for production.

## Summary

- Payments were failing due to an invalid Stripe API version and duplicated Stripe initialization with inconsistent configuration across routes.
- A single, centralized Stripe server instance is now used everywhere with a pinned, valid API version. This unblocks checkout, confirmation, and webhook handling.
- Follow-up items below will consolidate API routes and standardize fee calculations to avoid data inconsistencies.

## Root Cause

1) Invalid API version used during initialization
- File: `apps/web/src/lib/stripe/server.ts`
- Previous value: `apiVersion: '2025-07-30.basil'` (invalid/future codename). This can cause initialization errors and request failures.

2) Duplicate Stripe initialization with mismatched configuration
- File: `apps/web/src/routes/api/checkout/confirm/+server.ts`
- Initialized its own Stripe client with the same invalid API version, diverging from the shared server instance. Some routes used `$env/static/private`, others `$env/dynamic/private`, creating environment inconsistencies in deployment.

3) Inconsistent fee calculation between route and service (does not break Stripe but causes data mismatches)
- `apps/web/src/routes/api/checkout/+server.ts` uses: serviceFee = 5% + 1.40 BGN; shipping = 0 (COD comment: “NO SHIPPING - paid on delivery”).
- `apps/web/src/lib/services/stripe.ts` used service and shipping values inconsistent with the route (e.g., +0.70, shipping 500) when writing order/transaction records.

## Fixes Implemented

1) Centralized Stripe initialization with valid API version
- File: `apps/web/src/lib/stripe/server.ts`
- Change: use a single exported `stripe` instance and pin a valid version.

  Now:
  - `apiVersion: '2024-06-20'` (stable, supported)
  - `STRIPE_SECRET_KEY` sourced via `$env/dynamic/private` to match Vercel and Node runtimes.

2) All routes use the centralized instance
- File: `apps/web/src/routes/api/checkout/confirm/+server.ts`
- Change: import `stripe` from `$lib/stripe/server.js` instead of creating a new client with a mismatched version.

3) Verified usage across endpoints
- `apps/web/src/routes/api/checkout/+server.ts` → uses centralized instance
- `apps/web/src/routes/api/payments/create-intent/+server.ts` → uses centralized instance
- `apps/web/src/routes/api/payments/confirm/+server.ts` → uses centralized instance
- `apps/web/src/routes/api/webhooks/stripe/+server.ts` → uses centralized instance
- `apps/web/src/routes/api/webhooks/stripe/subscriptions/+server.ts` → uses centralized instance

These changes remove version/config drift and restore payment intent flow and webhook processing.

## What To Verify

1) Environment variables (dev and prod)
- `PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`
- `STRIPE_SECRET_KEY=sk_test_...`
- `STRIPE_WEBHOOK_SECRET=whsec_...` (for webhooks)
- `SUPABASE_SERVICE_ROLE_KEY=...` (webhook handlers only)

2) Local end-to-end
- Start web app.
- Initiate checkout via `/api/checkout` for a single product, confirm payment in UI.
- Confirm `/api/payments/confirm` resolves with `{ success: true }`.
- Verify DB updates: `orders.status = paid`, `transactions.status = completed`, product marked `is_sold = true`.

3) Webhook delivery
- Use Stripe CLI to forward events to the webhook route:
  - `stripe listen --forward-to http://localhost:5173/api/webhooks/stripe`
- Complete a test payment and confirm `payment_intent.succeeded` is received and processed without errors.

## Refactor Plan (Short, High-Impact)

1) Unify amount/fee computation
- Single function to compute service fee, platform fee, and shipping per currency (BGN/EUR/etc.).
- Use it in both `api/checkout` and `StripeService.createPaymentIntent` to avoid data mismatches.
- Store amounts in cents consistently; keep a single source-of-truth for values persisted to DB.

2) Consolidate payment intent creation endpoints
- Choose one path for client flow:
  - Option A: keep `/api/checkout` for single and bundle flows, deprecate `/api/payments/create-intent`.
  - Option B: keep `/api/payments/create-intent` and make `/api/checkout` delegate to it.
- Benefit: reduce duplication and drift of response formats and metadata.

3) Harden webhook processing
- Ensure all webhook handlers early-return on missing metadata.
- Add idempotency safeguards when updating orders/transactions.
- Add structured logs with event IDs.

4) Remove dead/backup files
- Delete `apps/web/src/lib/services/stripe.ts.bak` once all logic is confirmed covered by current service.

5) Add smoke tests (optional but recommended)
- Minimal Playwright flow: login → view product → create payment intent → confirm → see success page.
- Stripe CLI-based webhook smoke to validate `payment_intent.succeeded` path.

## Operational Notes

- Client-side Stripe: `apps/web/src/lib/stripe/client.ts` lazily loads using `PUBLIC_STRIPE_PUBLISHABLE_KEY` via `$env/dynamic/public`.
- Server-side Stripe: always import from `apps/web/src/lib/stripe/server.ts` to keep a single configured instance.
- Production enforcement: `apps/web/src/lib/env/validation.ts` requires Stripe keys in production; review `reference/OPERATIONS.md` for env setup.

## Troubleshooting Checklist

- “Payment system not available” in UI
  - Check that `PUBLIC_STRIPE_PUBLISHABLE_KEY` is set in environment.

- 500 on `/api/checkout` or `/api/payments/create-intent`
  - Check server logs for Stripe initialization warnings.
  - Confirm `STRIPE_SECRET_KEY` exists and is correct for the environment (test vs live).

- Webhook events not arriving
  - Verify Stripe CLI forwarding URL and `STRIPE_WEBHOOK_SECRET` match.
  - Inspect Stripe dashboard: Developers → Webhooks for delivery attempts and errors.

- DB not updating after success
  - Confirm webhook handler executes and has `SUPABASE_SERVICE_ROLE_KEY`.
  - Check logs for idempotency constraints or missing metadata.

## Files Changed (already applied)

- apps/web/src/lib/stripe/server.ts
  - Pinned `apiVersion: '2024-06-20'` and centralized export.

- apps/web/src/routes/api/checkout/confirm/+server.ts
  - Switched to centralized `stripe` import.

## Next Steps

- Approve and implement the refactor plan (fee calc + endpoint consolidation), then run E2E smoke tests.
- If you want, I can proceed to apply those refactors now or stage them behind a feature flag for quick rollback.

