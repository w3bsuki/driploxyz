# Project Overview

Use this doc to align product, engineering, and design on exactly what we are building and how we measure success. Keep it short, current, and unambiguous. Treat it as the single source of truth for scope and priorities.

## 1) Product Summary

- Name: Driplo
- One‑liner: Mobile‑first C2C clothing marketplace that beats Depop/Vinted with faster UX and simpler selling.
- Primary users/personas: Gen Z/young millennial buyers and casual sellers; small “closet sellers”; vintage curators; power sellers.
- Core jobs‑to‑be‑done: Discover and buy quickly; list in 3 steps; negotiate via DMs; manage orders/payouts; build trust via reviews/verification.

## 2) Scope (Must/Should/Could)

- Must: Auth + onboarding; product listing (multi‑image); discovery/search/filters; wishlist/favorites; real‑time messaging; checkout via Stripe (Connect); orders and receipts; mobile PWA experience; profiles.
- Should: Reviews/ratings; promotions/highlights; payout management; admin moderation; i18n (bg default, en as `/uk` alias); SEO (canonical + hreflang).
- Could: Swipe discovery; Stories; bundles/discounts; advanced analytics; A/B testing; “pro” seller subscriptions.
- Out of scope: B2B/wholesale; cross‑posting to external marketplaces; non‑Stripe payments at launch.

## 3) Non‑Functional Requirements (NFRs)

- Performance: TTFB < 200ms (SSR pages); Mobile LCP < 1.5s p75 (current: ~0.82s).
- Accessibility: WCAG 2.1 AA; zero a11y lint errors on PRs.
- Security: RLS enabled on all Supabase tables; CSRF and rate‑limits on mutations; service role never bundled.
- Reliability: Error rate < 0.5% p95; uptime ≥ 99.9%; graceful degradation on third‑party failures.
- Internationalization: Paraglide messages for all user‑facing text; locales: `bg` (default), `en` (path alias `/uk`).

## 4) Success Metrics

- Activation: D7 “first listing” rate ≥ 35%; Time‑to‑list ≤ 2 minutes median.
- Retention: Monthly active sellers ≥ 60% (returning users ≥ 60%).
- Engagement: Avg session ≥ 3 minutes; Mobile bounce < 40%.
- Revenue/Conversion: Conversion ≥ 3%; AOV €35–50; LTV:CAC ≥ 3:1; 1k monthly tx ≤ 6 months; 10k active listings ≤ 3 months.

## 5) Current State and Gaps

- Built: SvelteKit 2 + Svelte 5 (runes), Tailwind v4, Paraglide i18n, Stripe Connect, Supabase DB/Auth/Storage with RLS, messaging, search, wishlist, onboarding, PWA wiring, admin app.
- Gaps: Reviews; some payout/finance flows; duplicate UI and service worker files; inconsistent i18n reroute; TypeScript errors in web app; scattered console logs.
- Risks: i18n default/alias inconsistencies; duplicated reroute/export; `.bak` files drifting; missing API abstraction; potential CSRF coverage gaps on non‑action endpoints.

## 6) Definition of Done (DoD)

- Feature behind flag if risky; rollout plan documented.
- Server + client types validated; zero `any` in new code; `check-types` passes.
- UI uses primitives and spacing scale; 44px/36px touch targets.
- E2E happy paths covered in Playwright (auth, list, buy, messaging, payout smoke).
- Lighthouse mobile p75 ≥ 90 on key pages (product, search, home).

## 7) Roadmap (Next 2–4 weeks)

- Week 1: Drive TypeScript errors to zero; unify i18n reroute (server+client); delete duplicates (`service-worker.js`, `*.bak`); gate logs; finalize envs.
- Week 2: Introduce `lib/server/api.ts` abstraction; migrate top 10 API routes; consolidate header/search UI into `@repo/ui`.
- Week 3: Implement reviews; payout management polish; SEO canonical + hreflang; i18n link helpers.
- Week 4: QA hardening (E2E, a11y, Lighthouse budgets); release candidate; smoke in staging; go/no‑go.

## 8) Open Decisions (keep short, link to ADRs if needed)

- Component library boundary: Keep primitives/composites in `@repo/ui`; migrate app‑level components when used 2+ times.
- Auth flows: Email/password at launch; add OAuth providers post‑launch if needed.
- Locale prefixing: Keep `/uk` path alias to `en` or switch to `/en`; do not prefix default `bg`.
