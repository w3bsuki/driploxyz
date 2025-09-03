# V1 Features — Acceptance Checklist

Use this as the shared “Definition of Done” per feature. Keep concise.

Auth & Onboarding
- Users can sign up/sign in (Supabase); email verification; password reset
- SSR session via `locals.safeGetSession()`; client `onAuthStateChange`
- Onboarding updates profile only (no duplicate inserts); basic avatar, socials
- Logout POST-only; origin-checked; rate-limited

Listings (Sell)
- Create listing (title, desc, price, size, condition, category, 1–8 images)
- Image upload with compression; accessible inputs; server validation (zod)
- Listing visible in search/category/profile; editable by owner

Discovery & Search
- Home feed shows recent/popular; category routes `/category/[...segments]`
- Search with filters (brand, size, price, condition); accessible filter UI
- Wishlist/favorites add/remove; persisted; badge count

Messaging
- Real-time conversation list and thread; typing indicator; unread counts
- Compose/send; mobile-first input; basic moderation of content strings

Checkout & Orders (Stripe)
- Server-only intent creation; idempotency; secure webhooks; order status updates
- Order summary; address/shipping; fees displayed; receipts

Reviews & Ratings
- Buyers can rate order and leave short review; profile summary aggregates
- Prevent self-reviews; rate-limit; report mechanism stub

Non-functional gates
- 0 TypeScript errors; SSR-first; a11y AA on key pages; LCP ≤ 1.5s p75 mobile

