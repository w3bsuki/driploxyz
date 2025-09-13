# Product Overview

Single source of truth for Driplo's product vision, scope, and success metrics.

## Product Summary

- **Name**: Driplo
- **Vision**: Mobile-first C2C clothing marketplace that beats Depop/Vinted with faster UX and simpler selling
- **Primary users**: Gen Z/young millennial buyers and casual sellers; small "closet sellers"; vintage curators; power sellers
- **Core jobs-to-be-done**: Discover and buy quickly; list in 3 steps; negotiate via DMs; manage orders/payouts; build trust via reviews/verification

## Scope (Must/Should/Could)

### Must Have (MVP)
- Auth + onboarding
- Product listing (multi-image)
- Discovery/search/filters
- Wishlist/favorites
- Real-time messaging
- Checkout via Stripe (Connect)
- Orders and receipts
- Mobile PWA experience
- Profiles

### Should Have (V1)
- Reviews/ratings
- Promotions/highlights
- Payout management
- Admin moderation
- i18n (bg default, en as `/uk` alias)
- SEO (canonical + hreflang)

### Could Have (Future)
- Swipe discovery
- Stories
- Bundles/discounts
- Advanced analytics
- A/B testing
- "Pro" seller subscriptions

### Out of Scope
- B2B/wholesale
- Cross-posting to external marketplaces
- Non-Stripe payments at launch

## Non-Functional Requirements

### Performance
- TTFB < 200ms (SSR pages)
- Mobile LCP < 1.5s p75 (current: ~0.82s)

### Accessibility
- WCAG 2.1 AA compliance
- Zero a11y lint errors on PRs

### Security
- RLS enabled on all Supabase tables
- CSRF and rate-limits on mutations
- Service role never bundled

### Reliability
- Error rate < 0.5% p95
- Uptime ≥ 99.9%
- Graceful degradation on third-party failures

### Internationalization
- Paraglide messages for all user-facing text
- Locales: `bg` (default), `en` (path alias `/uk`)

## Success Metrics

### Activation
- D7 "first listing" rate ≥ 35%
- Time-to-list ≤ 2 minutes median

### Retention
- Monthly active sellers ≥ 60%
- Returning users ≥ 60%

### Engagement
- Avg session ≥ 3 minutes
- Mobile bounce < 40%

### Revenue/Conversion
- Conversion ≥ 3%
- AOV €35–50
- LTV:CAC ≥ 3:1
- 1k monthly tx ≤ 6 months
- 10k active listings ≤ 3 months

## Current State and Gaps

### Built
- SvelteKit 2 + Svelte 5 (runes)
- Tailwind v4
- Paraglide i18n
- Stripe Connect
- Supabase DB/Auth/Storage with RLS
- Messaging system
- Search functionality
- Wishlist feature
- Onboarding flow
- PWA wiring
- Admin app

### Gaps
- Reviews system
- Some payout/finance flows
- Duplicate UI and service worker files
- Inconsistent i18n reroute
- TypeScript errors in web app
- Scattered console logs

### Risks
- i18n default/alias inconsistencies
- Duplicated reroute/export
- `.bak` files drifting
- Missing API abstraction
- Potential CSRF coverage gaps on non-action endpoints

## Definition of Done

Every feature must meet these criteria:

- Feature behind flag if risky; rollout plan documented
- Server + client types validated; zero `any` in new code; `check-types` passes
- UI uses primitives and spacing scale; 44px/36px touch targets
- E2E happy paths covered in Playwright (auth, list, buy, messaging, payout smoke)
- Lighthouse mobile p75 ≥ 90 on key pages (product, search, home)

## Open Decisions

### Component Library Boundary
Keep primitives/composites in `@repo/ui`; migrate app-level components when used 2+ times.

### Auth Flows
Email/password at launch; add OAuth providers post-launch if needed.

### Locale Prefixing
Keep `/uk` path alias to `en` or switch to `/en`; do not prefix default `bg`.

## Roadmap (Next 2–4 weeks)

### Week 1
- Drive TypeScript errors to zero
- Unify i18n reroute (server+client)
- Delete duplicates (`service-worker.js`, `*.bak`)
- Gate logs
- Finalize envs

### Week 2
- Introduce `lib/server/api.ts` abstraction
- Migrate top 10 API routes
- Consolidate header/search UI into `@repo/ui`

### Week 3
- Implement reviews
- Payout management polish
- SEO canonical + hreflang
- i18n link helpers

### Week 4
- QA hardening (E2E, a11y, Lighthouse budgets)
- Release candidate
- Smoke in staging
- Go/no-go decision