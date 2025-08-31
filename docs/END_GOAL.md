# END GOAL — Driplo C2C Clothing Marketplace

Single‑page summary used as context for planning, prompts, and tasklists.

## Mission

Build the fastest mobile‑first C2C clothing marketplace in EU/UK, combining Vinted’s simplicity with Depop’s social energy. Win on mobile UX, trust, and speed to list/buy.

## Target Users

- Primary: Gen Z (18–25) fashion resellers/buyers
- Secondary: Millennials (26–35) sustainability‑minded buyers
- Initial geos: BG (default), UK (en via `/uk`), expand to EU

## Value Proposition

- 2x faster than incumbents (mobile LCP ≈ 0.82s; target ≤ 1.5s p75)
- 3‑step listing; buyer/seller flows without friction
- Trust by design: RLS, reviews, verified sellers, escrow via Stripe Connect

## Must‑Have Features (Launch)

- Auth + Onboarding (profiles, verification flags)
- Listings (multi‑image, categories, condition, pricing)
- Discovery (search, filters, sort, trending, wishlist)
- Real‑time Messaging (buyer/seller)
- Checkout + Orders (Stripe Connect, receipts)
- Profiles (ratings, badges)
- i18n (bg default, en at `/uk`)
- Admin minimal (moderation, payouts oversight)

## Should‑Have (Near‑term)

- Reviews/Ratings end‑to‑end
- Promotions/highlights; bundled discounts
- Payouts polish + insights for sellers
- SEO: canonical + hreflang, product schema

## Non‑Functional Requirements

- Performance: TTFB < 200ms SSR; LCP ≤ 1.5s p75 mobile
- A11y: WCAG 2.1 AA
- Security: Full RLS; CSRF + rate limits on mutations; no service keys in client
- Reliability: Error rate < 0.5% p95, uptime ≥ 99.9%

## Success Metrics

- Activation: D7 first‑listing ≥ 35%; time‑to‑list ≤ 2 min median
- Retention: Monthly active sellers ≥ 60%
- Engagement: Avg session ≥ 3m; Mobile bounce < 40%
- Conversion: ≥ 3%; AOV €35–50; 10k active listings ≤ 3 months; 1k monthly tx ≤ 6 months

## Tech Baseline

- SvelteKit 2 + Svelte 5 (runes), TypeScript strict, Tailwind v4 (OKLCH)
- Supabase (DB/Auth/Storage), Stripe Connect, Sentry, Turborepo
- Paraglide i18n (`@repo/i18n`), repo UI (`@repo/ui`)

## Constraints/Decisions

- Shared UI via `@repo/ui`; prefer Melt UI headless wrappers for a11y and control
- Default locale bg without prefix; en via `/uk` alias; do not prefix default
- Avoid adopting heavy visual kits for core surfaces; keep brand control

## Release Gates (Go/No‑Go)

- 0 TypeScript errors; CI green on types/lint/tests
- E2E smokes pass; a11y and Lighthouse budgets met
- Security checks pass (RLS, CSRF, rate limits)
- Observability configured; secrets set; rollback plan ready

## Links

- See docs/00-PROJECT.md for detailed scope, NFRs, roadmap
- See docs/CODEX_TASKLIST.md for execution plan
- See docs/MELT_UI_MIGRATION.md for UI behavior migration
- See docs/REPO_UI_CLEANUP.md for consolidation tasks

