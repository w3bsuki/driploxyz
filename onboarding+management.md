# Onboarding, Orders, Sales — Audit and Implementation Plan

This document audits the post‑signup onboarding (including post‑payment with Stripe), order/sales management, and notifications, then provides a concrete plan to make the full workflow production‑ready.

## Executive Summary

- Onboarding is well‑structured with gating for brand/premium selection and a Stripe modal, but the server action trusts a client “brandPaid” flag. Add server‑side verification against Stripe/user_payments.
- Checkout and orders are in place. Status updates and notifications for shipped/delivered exist, but there’s no “sale occurred” notification on payment success and review flow has mismatched payload keys.
- Realtime notifications UI exists, but the order notifications subscription is not wired into layout/header.

## Onboarding Audit

- Route: `apps/web/src/routes/(protected)/onboarding/+page.svelte:1` uses `BrandPaymentModal` and enforces payment client‑side before proceeding (brand/premium requires payment).
- Server action: `apps/web/src/routes/(protected)/onboarding/+page.server.ts:77` validates required fields and sets `onboarding_completed=true`, `verified` for paid brand/premium.
- Payment modal: `packages/ui/src/lib/BrandPaymentModal.svelte:1` calls `/api/subscriptions/create` to get a clientSecret and confirms payment client‑side.
- Stripe server: subscription “create” maps to a one‑time payment intent; webhook `apps/web/src/lib/services/stripe.ts:426` and `apps/web/src/routes/api/webhooks/stripe/+server.ts:1` update profiles and order/transaction state.

Findings
- Trust boundary: Server action relies on `brandPaid` boolean from form (client). A malicious user can submit brand/premium without paying. Server must verify.
- Webhook correctness: Profile upgrade is handled in the Stripe service webhook path; ensure webhook key/env is set in prod.
- UX: Onboarding shows success modal and redirects; OK.

Fix Plan — Onboarding
- Add server verification in `+page.server.ts` before setting premium/brand:
  - Lookup latest row in `user_payments` for `user.id` with `status='completed'` and `plan_type='brand'|'premium'` within last 30 minutes, or verify via Stripe API using metadata on PaymentIntent.
  - If not found, return 403 even if `brandPaid` is true.
- Optionally store a short‑lived cookie or server flag after successful webhook to allow onboarding completion for premium/brand without requerying Stripe.
- Add telemetry logs with user id and payment intent id for audit.

## Orders & Sales Audit

- Orders page: `apps/web/src/routes/(protected)/orders/+page.svelte:1` shows purchases and sales with actions (mark shipped/delivered, review).
- Orders API (status): `apps/web/src/routes/api/orders/[id]/status/+server.ts:1` implements PATCH with permission checks, timestamping, and notifications for shipped/delivered.
- Orders API (generic): `apps/web/src/routes/api/orders/[id]/+server.ts:1` also implements PATCH and inserts notifications; duplication with different behavior.
- Sales page: `apps/web/src/routes/(protected)/dashboard/sales/+page.svelte:1` shows sold items and sales stats.
- Order management page: `apps/web/src/routes/(protected)/dashboard/order-management/+page.svelte:1` has richer controls and realtime updates via `orderSubscription` store.
- Reviews API: `apps/web/src/routes/api/reviews/+server.ts:1` expects `{ order_id, rating, title?, comment? }` and updates `profiles` rating averages.

Findings
- Endpoint duplication: Both `[id]` and `[id]/status` PATCH exist. UI uses both in different screens. Their validation and notifications differ slightly.
- Missing “sale” notification at payment success: Stripe webhook updates order/transaction/product but doesn’t insert notifications to seller/buyer. Header toasts require these.
- Review payload mismatch: UI sends `orderId` (camelCase) but API expects `order_id`. This breaks reviews submission in Orders and RatingModal flows.
- Notifications subscription: `orderNotifications` store exists and `+layout.svelte:162` renders `OrderNotificationToast`, but nothing calls `orderNotificationActions.subscribeToNotifications` to populate it.
- Messaging: Orders view shows buyer/seller names, but there’s no explicit “Message buyer”/“Message seller” CTA linking to `/messages` preselected conversation.

Fix Plan — Orders & Sales
- Consolidate status updates
  - Choose `[id]/status` PATCH as the single endpoint. Update `order-management` page to use it (currently patches `/api/orders/[id]`). Keep one implementation and delete/alias the other.
- Insert notifications at “sale occurred” (payment success)
  - In `apps/web/src/routes/api/webhooks/stripe/+server.ts` after marking order paid and product sold, insert two rows into `notifications`:
    - Seller: `{ type: 'sale', title: 'New sale! 🎉', message: 'Your listing “<title>” was purchased', order_id: <id> }`
    - Buyer: `{ type: 'purchase', title: 'Purchase confirmed ✅', message: 'You bought “<title>”', order_id: <id> }`
- Wire realtime toasts
  - In `apps/web/src/routes/+layout.svelte`, initialize `orderNotificationActions.subscribeToNotifications(supabase, data.user.id)` when a user is present and `supabase` is available (similar to auth listener block). The existing toast UI will then show.
- Enforce rating after delivery
  - Update UI: After marking delivered, open `RatingModal` (already done in order-management) and keep a blocking banner in orders page until review is submitted.
  - API: Accept `{ order_id, rating, ... }` AND `{ orderId, ... }` for backward compatibility. Optionally mark `orders.buyer_rated=true` after review, and set status to `completed` when rated (requires column if not present).
- Add “Message buyer/seller” CTAs
  - In orders list and order‑management, add a button that links to `/messages?conversation=<otherUserId>__<productId>` to open the product conversation.

## Notifications Audit

- Header integrates generic notifications store but not order‑specific realtime store.
- Realtime service currently subscribes to messages, not order changes.

Fix Plan — Notifications
- Add a small initializer in `+layout.svelte` to call `orderNotificationActions.subscribeToNotifications` (with cleanup on unmount). This powers the existing `OrderNotificationToast`.
- Standardize notification types: use `sale`, `purchase`, `order_shipped`, `order_delivered`, `payout_processed`, `payment_failed`, `payment_cancelled`.

## Concrete Tasks (High Priority)

1) Onboarding security
- Verify premium/brand in `+page.server.ts` by checking `user_payments` or Stripe PaymentIntent before setting `verified` and `subscription_tier`.

2) Sale notifications on payment success
- Update Stripe webhook success handler to insert seller/buyer notifications and (optionally) emit a realtime event via Supabase channel.

3) Reviews payload compatibility
- Change `/api/reviews` to accept both `order_id` and `orderId`.

4) Consolidate orders status API
- Pick `[id]/status` and update order‑management page to use it. Remove/redirect `[id]` PATCH.

5) Wire order notifications subscription
- Initialize `orderNotificationActions.subscribeToNotifications` in layout when logged in.

6) CTA to message
- Add “Message buyer/seller” buttons in orders and sales views linking to `/messages?conversation=<id>__<productId>`.

## Optional Enhancements

- Add idempotency key to webhook processing using `paymentIntent.id` to guard against duplicates.
- Add analytics on onboarding funnel and order lifecycle (events on payment succeeded, shipped, delivered, reviewed).
- Add `buyer_rated` and `seller_rated` booleans to orders to track completion; gate payout readiness on `buyer_rated`.

## Quick References

- Onboarding page server: `apps/web/src/routes/(protected)/onboarding/+page.server.ts:1`
- Brand payment modal: `packages/ui/src/lib/BrandPaymentModal.svelte:1`
- Orders pages: `apps/web/src/routes/(protected)/orders/+page.svelte:1`, `apps/web/src/routes/(protected)/dashboard/order-management/+page.svelte:1`, `apps/web/src/routes/(protected)/dashboard/sales/+page.svelte:1`
- Orders status API: `apps/web/src/routes/api/orders/[id]/status/+server.ts:1`
- Generic orders API: `apps/web/src/routes/api/orders/[id]/+server.ts:1`
- Reviews API: `apps/web/src/routes/api/reviews/+server.ts:1`
- Webhook: `apps/web/src/routes/api/webhooks/stripe/+server.ts:1`
- Layout toast hook: `apps/web/src/routes/+layout.svelte:162`

---
If you want, I can implement the minimal code changes now: (a) webhook sale notifications, (b) /api/reviews payload compatibility, and (c) wire the order notifications subscription in layout. Let me know and I’ll ship them in one pass.

