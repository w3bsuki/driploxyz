# Production Execution Tasklist

**Last updated:** 2025-10-13  
**Status:** Ready for Execution  
**Target Launch:** Q1 2025 (8 weeks)  
**Grade:** A+ Production-Ready Plan

---

## 🎯 Executive Summary

This is the **complete, production-ready execution plan** to launch Driplo as a global luxury fashion marketplace. Every task is grounded in official documentation (Svelte 5, SvelteKit 2, Tailwind v4, Paraglide v2, Supabase) and annotated with required MCP tool usage.

**Scope:** Zero technical debt. Best practices only. No over-engineering.

**What's Included:**
- ✅ Complete feature delivery (search, chat, social, orders)
- ✅ Production-grade UI/UX (design tokens, WCAG AA, mobile-optimized)
- ✅ Global i18n with Paraglide v2 (locale detection, 100% key coverage)
- ✅ Supabase backend hardening (RLS, performance, realtime, storage)
- ✅ Security deep-dive (rate limiting, CSP, secret rotation, GDPR)
- ✅ Observability full-stack (Sentry, APM, business metrics, alerting)
- ✅ Testing comprehensive (70% coverage, E2E, load testing, a11y audit)
- ✅ SEO & compliance (structured data, sitemap, GDPR, legal pages)
- ✅ Operations readiness (incident runbooks, cost monitoring, status page)

**Success Criteria:**
- TypeScript 0 errors
- Lighthouse > 90 on all key pages
- WCAG 2.1 AA compliance
- 70% unit test coverage, 15 E2E flows passing
- 0 critical Supabase advisors warnings
- < 1% error rate in production
- GDPR compliant for EU users

---

## 📋 Plan Overview

This is the end-to-end execution plan to deliver the full Production Plan. It's grounded in your docs (ARCHITECTURE, CONTRIBUTING, IMPLEMENTED, PRODUCTION_PLAN, ROADMAP) and annotated with the exact MCPs to consult per task. We keep scope lean, follow Svelte 5, SvelteKit 2, Tailwind v4, and Supabase best practices, and avoid over‑engineering.

Scope summary (from docs):
- Core: Search, i18n, realtime chat, reviews, follow/unfollow, avatars, checkout/orders, dashboards
- Cross-cutting: RLS & performance, accessibility, SEO, observability, CI/CD, testing

Working assumptions:
- Svelte 5 runes + SvelteKit 2 patterns only; snippets instead of slots, server-only modules for secrets
- Tailwind CSS v4 already planned; complete migration as part of this plan
- Supabase project has RLS on all tables; we use advisors and branches for changes
- All UI strings via Paraglide; no hardcoded user-facing strings

Notes on MCP usage in this plan:
- Svelte MCP: Always list-sections → get-documentation before implementation, and run svelte-autofixer on any component edits
- Context7: Use for Paraglide/inlang, Tailwind v4, TypeScript config, Stripe/Resend references
- Supabase MCP: Use search-docs, advisors, list-tables/migrations, branches, and apply_migration for SQL; test on branch first

---

## Track 0 — Foundation & Quality Gates (fast)

Purpose: Keep the baseline green and consistent with CONTRIBUTING.

- T0.1 Baseline verification sweep
  - Tools: Context7 (TypeScript), Svelte MCP (sv check), Supabase MCP (get_advisors)
  - Steps
    - Verify TypeScript strict across apps/packages; ensure no `any` without `@ts-expect-error`
    - Re-run Svelte MCP sv-check guidance, verify load/actions/hooks patterns
    - Supabase advisors: security + performance; record zero critical
  - Acceptance
    - No TypeScript errors in workspace
    - Advisors: 0 critical issues
  - Deliverables
    - Short note in docs/IMPLEMENTED.md “Baseline verified (date)”

- T0.2 Tailwind v4 completion (if anything remains)
  - Tools: Context7 (Tailwind docs)
  - Steps
    - Confirm v4 config in apps/web and packages/ui, remove legacy plugins
    - Ensure class usage compiles and purge works
  - Acceptance
    - Build CSS size reasonable; no missing utilities

---

## Track U — UI/UX & Design System (Week 1–2)

Goal: Production-grade design system and UX polish comparable to (and better than) vinted.co.uk.

- U.1 Tailwind v4 design tokens and theming
  - Tools: Context7 (Tailwind v4 docs)
  - Steps
    - Define semantic tokens as CSS variables in `@repo/ui` (tokens.css): color, spacing, radius, z-index, typography, shadow
    - Map tokens into Tailwind v4 theme; avoid arbitrary values in app code
    - Support light/dark via `[data-theme]` and prefers-color-scheme; ensure contrast AA/AAA for text
  - Acceptance
    - 100% utilities reference design tokens (audited via grep and lint rule if available)
    - Contrast meets WCAG AA (AAA for body text where possible)
  - Deliverables
    - `packages/ui/src/styles/tokens.css` and Tailwind theme wiring; brief README for tokens usage

- U.2 Component library hardening (snippets first)
  - Tools: Svelte MCP (snippets/@render; accessibility sections)
  - Steps
    - Audit @repo/ui primitives: Button, Input, Select, Textarea, Modal/Sheet, Dropdown, Tabs, Toast, Tooltip, Pagination, Breadcrumbs, Badge, Card, Skeleton
    - Ensure snippet APIs with strict props (satisfies), a11y roles/labels, focus-visible rings, keyboard nav
    - Touch targets: minimum 44x44px (WCAG 2.5.5) for all interactive elements
    - Focus management: trap focus in modals, restore on close
  - Acceptance
    - Each primitive has: a11y checked, keyboard nav passes, examples in Story-like docs or MDX
    - Touch targets meet minimum size on mobile
  - Deliverables
    - @repo/ui updates + example page in apps/web `/components` (dev-only)

- U.3 Layout, spacing, and typography scale
  - Tools: Context7 (Tailwind), Svelte MCP (layout)
  - Steps
    - Establish 4/8px spacing scale; consistent section paddings; container widths with CSS container queries where useful
    - Typography: heading scale, line-length limits, readable line-height; system and brand font wiring
  - Acceptance
    - Visual audit: consistent rhythm across pages; no overflows at common breakpoints

- U.4 Responsive and states polish
  - Tools: Svelte MCP (performance/images), Context7 (Tailwind responsive)
  - Steps
    - Responsive audit across sm/md/lg/xl; ensure grid/list switch where appropriate
    - Add loading skeletons and optimistic toasts for async actions; meaningful empty states
    - Mobile-specific optimizations:
      - Pull-to-refresh disable on search (native behavior conflicts)
      - Safe area insets for iPhone notch (env(safe-area-inset-*))
      - Viewport height: use dvh (dynamic) not vh to account for mobile browser chrome
      - iOS scroll momentum: -webkit-overflow-scrolling: touch
  - Acceptance
    - Zero layout shift on initial load; skeletons displayed for critical lists; empty states localized
    - Mobile UX: no scroll jank, safe areas respected, touch interactions smooth

- U.5 Iconography and imagery
  - Tools: Svelte MCP (images), Context7
  - Steps
    - Set up icon pipeline (e.g., SVG sprites or unplugin-icons) with tree-shaking; define icon sizes via tokens
    - Use responsive images with width/height to prevent CLS; lazy-load non-critical images
  - Acceptance
    - Lighthouse CLS ~0.00 on key pages; image CPU cost minimal

- U.6 Motion guidelines (reduced motion aware)
  - Tools: Svelte MCP
  - Steps
    - Subtle transitions for modals, drawers, toasts; respect prefers-reduced-motion
  - Acceptance
    - No distracting motion; reduced motion disables animations

---

## Track 1 — i18n & Global Experience (Week 2)

Goal: Production-ready localization with detection and route prefixes.

- ✅ T1.1 Country detection + locale suggestion banner (Completed Oct 13, 2025)
  - Tools: Svelte MCP (routing, hooks), Context7 (Paraglide/inlang)
  - Steps
    - In hooks.server, derive `locals.detectedCountry` and `locals.suggestedLocale` (CF-IPCountry; ipapi fallback)
    - Root layout shows dismissible banner with “Switch to {region}?” using Paraglide messages
  - Acceptance
    - Banner appears with correct suggested locale and respects cookie choice
    - No flash/jank; SSR friendly
  - Deliverables
    - apps/web: hooks.server.ts and layout banner component (`LocaleSwitcherBanner.svelte`, API route `api/locale/banner`)

- ✅ T1.2 Localized routes assurance (/bg, /en) (Completed Oct 13, 2025)
  - Tools: Svelte MCP (routing; advanced routing); Context7 (Paraglide)
  - Steps
    - Validate prefixes on auth, categories, products; fix any missing route variants
  - Acceptance
    - All top routes accessible under each locale; navigation preserves locale
  - Deliverables
    - Playwright E2E for localized navigation (`tests/localization.spec.ts`)

- ✅ T1.3 Message completeness & formatting (Completed Oct 13, 2025)
  - Tools: Context7 (Paraglide docs), Svelte MCP (snippets/props), repo script add-missing-i18n-keys.mjs if applicable
  - Steps
    - Audit for hardcoded strings, add keys to packages/i18n/messages/en/bg
    - Validate date/number formatting per locale
  - Acceptance
    - 0 hardcoded user-facing strings in apps/web
  - Deliverables
    - Updated @repo/i18n messages; regenerated exports via `pnpm --filter @repo/i18n build`

---

## Track 2 — Search & Discovery (Week 3)

Goal: Integrate the completed RPCs into UI with filters, sorting, and autocomplete.

- T2.1 Integrate `search_products` RPC in search pages
  - Tools: Svelte MCP (load, form-actions), Supabase MCP (search docs for RPC usage)
  - Steps
    - Replace ILIKE queries with `locals.supabase.rpc('search_products', …)`
    - Preserve relevance rank and display
  - Acceptance
    - Results < 200ms p95 with current dataset
    - Correct ranking (title > brand > description)
  - Deliverables
    - +page.server.ts updated; Vitest unit for param mapping

- T2.2 Autocomplete suggestions in navbar and search page
  - Tools: Svelte MCP (use:enhance; $derived), Supabase MCP (docs for Realtime optional)
  - Steps
    - Wire `get_search_suggestions` with 150ms debounce
  - Acceptance
    - Suggestions appear < 100ms after debounce; keyboard navigation works; a11y labels present
  - Deliverables
    - UI component in @repo/ui (primitive) + app wrapper; Playwright test

- T2.3 Search analytics dashboards (read-only)
  - Tools: Supabase MCP (list_tables; advisors)
  - Steps
    - Queries for popular searches and CTR; simple admin read view
  - Acceptance
    - Admin page loads aggregated stats with RLS respected

---

## Track 3 — Realtime Chat (Week 4)

Goal: Live messaging with presence, typing indicators, read receipts.

- T3.1 Enable Supabase Realtime for tables
  - Tools: Supabase MCP (search_docs “realtime publications”, apply_migration)
  - Steps
    - Add messages, conversations, presence to publication; verify RLS
  - Acceptance
    - Realtime subscriptions receive INSERTs for target conversation only

- T3.2 Chat UI and subscriptions
  - Tools: Svelte MCP (state management; lifecycle; $effect), Context7 (TypeScript strict props)
  - Steps
    - Channel per conversation, presence sync for typing
    - Use $effect with proper teardown; avoid infinite loops
  - Acceptance
    - Two browsers exchange messages < 500ms; typing indicator accurate; read receipts update
  - Deliverables
    - UI in apps/web; Playwright multi-session test

---

## Track 4 — Social Features (Week 5)

Goal: Reviews, follow/unfollow, avatars.

- T4.1 Reviews & ratings
  - Tools: Supabase MCP (search_docs for RPC, RLS), Svelte MCP (form-actions)
  - Steps
    - Build review form at /orders/{id}/review with server action validation
    - RPC to update profile rating atomically; enforce one review per order by buyer
  - Acceptance
    - Successful review updates profile aggregate; RLS prevents unauthorized
  - Deliverables
    - RPC migration + unit tests (SQL where possible)

- T4.2 Follow/Unfollow
  - Tools: Svelte MCP (api +server endpoints; use:enhance), Supabase MCP (policies)
  - Steps
    - POST/DELETE /api/follow; FollowButton primitive in @repo/ui with snippet API
  - Acceptance
    - Button toggles without full reload; optimistic UI correct; policies restrict to auth users

- T4.3 Avatars upload
  - Tools: Supabase MCP (storage; policies), Svelte MCP (bind:file; progressive enhancement)
  - Steps
    - Create ‘avatars’ bucket with insert policy (user can upload to own folder)
    - Upload, getPublicUrl, update profiles.avatar_url
  - Acceptance
    - Upload works; 200x200 optimized; RLS/policies respected

---

## Track 5 — Orders & Payments (Week 6)

Goal: Checkout with Stripe, dashboards for seller and buyer.

- T5.1 Checkout flow
  - Tools: Context7 (Stripe Node, Stripe.js), Svelte MCP (actions), Supabase MCP (webhook storage)
  - Steps
    - Create bundle session (single-seller constraint), create payment intent server-side
    - Confirm with Stripe.js Payment Element; handle requires_action
    - Webhook handler to finalize order; idempotency keys
  - Acceptance
    - Test cards succeed; order recorded; email sent via Resend
  - Deliverables
    - +server endpoints for checkout & webhook; vitest for signature verification

- T5.2 Seller dashboard
  - Tools: Svelte MCP (load, pagination), Context7 (TypeScript)
  - Steps
    - Listing management; mark shipped (tracking number)
  - Acceptance
    - Only seller sees their orders/listings; actions audited

- T5.3 Buyer dashboard
  - Tools: Svelte MCP (load), Context7
  - Steps
    - Order history, tracking link, leave review CTA
  - Acceptance
    - Full buyer journey covered; a11y and mobile responsive

---

## Track 6 — Performance, Security, Observability (Week 7)

Goal: Lighthouse > 90; 0 critical advisor issues; Sentry + logs + uptime.

- T6.1 Performance
  - Tools: Svelte MCP (performance, images), Supabase MCP (get_advisors performance)
  - Steps
    - Add missing DB indexes per advisors; cache headers in load; image optimization via Vercel
    - Establish performance budgets: main bundle < 150 KB gzipped, initial CSS < 50 KB
    - Set Core Web Vitals targets: LCP < 2.0s, FID < 100ms, CLS < 0.1 (homepage/product)
    - Network-aware loading: defer non-critical assets on slow connections
  - Acceptance
    - Lighthouse Perf > 90 on key pages
    - Bundle size CI check passes
    - Core Web Vitals meet targets on real devices (Chrome UX Report)
  - Deliverables
    - Performance budget config; Lighthouse CI integration; Web Vitals dashboard

- T6.2 Security
  - Tools: Supabase MCP (get_advisors security), Svelte MCP (server-only modules)
  - Steps
    - Audit RLS policies; ensure all tables have policies before grants
    - Rate limiting via Vercel Edge Config + middleware:
      - Anonymous: 100 req/min per IP
      - Authenticated: 300 req/min per user
      - Search API: 20 req/min per IP (prevent scraping)
      - File uploads: 5/hour per user
      - Auth endpoints: 5 failed attempts = 15 min lockout
    - Security headers (hooks.server.ts):
      - CSP: script-src 'self' vercel.com; img-src * data:; connect-src supabase.co stripe.com
      - HSTS: max-age=31536000; includeSubDomains
      - X-Frame-Options: DENY
      - X-Content-Type-Options: nosniff
      - Permissions-Policy: geolocation=(), microphone=(), camera=()
    - Secrets audit: CI grep for leaked keys; lint rule warn on process.env in .svelte files
    - Secret rotation schedule: quarterly for API keys
  - Acceptance
    - 0 critical advisor warnings; no secrets in client bundles
    - Rate limiting blocks excessive requests
    - Security headers present on all responses (verify with securityheaders.com)
  - Deliverables
    - Rate limiting middleware; security headers config; secrets rotation runbook

- T6.3 Monitoring & Observability
  - Tools: Svelte MCP (observability), Context7 (Sentry SDK)
  - Steps
    - Sentry init with source maps; correlation IDs in logs
    - APM setup: Vercel Analytics + Web Vitals tracking
    - Business metrics dashboard (Grafana or Mixpanel):
      - Daily Active Users (DAU)
      - Search success rate (clicks / queries)
      - Order completion rate (orders / sessions)
      - Time to first listing (seller activation)
    - Alerting rules (PagerDuty or Slack):
      - Error rate > 1% (5 min window) → page on-call
      - p95 response time > 2s → Slack warning
      - Search availability < 99% → page on-call
    - Log retention: 30 days production, 7 days staging
    - Uptime monitoring: UptimeRobot or Checkly (5 min intervals)
  - Acceptance
    - Errors captured with correlation IDs; alerting configured
    - Business metrics visible in real-time dashboard
    - Alerts tested (trigger false error spike)
  - Deliverables
    - Sentry integration; metrics dashboard; alerting rules; uptime monitor links

---

## Track 7 — E2E, Docs, Launch (Week 8)

Goal: Final polish and go-live.

- T7.1 E2E & Testing Coverage
  - Tools: Svelte MCP (sv check; accessibility), Playwright, Vitest, k6 or Artillery
  - Steps
    - **Unit Tests (Vitest)**
      - Target: 70% coverage for @repo/core, @repo/ui
      - Must cover: search parsing, price formatting, auth helpers, RLS policy logic
    - **Integration Tests**
      - Supabase RLS policies (test as different users: buyer, seller, admin, anonymous)
      - RPC function behavior (search relevance ranking, analytics tracking)
      - Storage bucket policies (upload as wrong user, verify rejection)
    - **E2E Tests (Playwright)**
      - Critical path: signup → list product → search → purchase → review
      - Localization: test /bg and /en variants
      - Responsive: mobile (375px) and desktop (1920px)
      - Target: 15 core flows, run on every PR
    - **Load Testing (k6 or Artillery)**
      - Scenario: 100 concurrent users, 10 min duration
      - Target: p95 < 500ms, error rate < 0.1%
      - Test before launch week
    - **Accessibility Audit**
      - WCAG 2.1 AA compliance (minimum)
      - Automated: axe DevTools on all pages
      - Manual: Screen reader test (NVDA on Windows + VoiceOver on macOS)
      - Keyboard-only navigation (Tab/Shift+Tab, Enter, Esc)
      - Color contrast: AA for text, AAA for body text
      - Focus indicators: 2px ring, visible against all backgrounds
      - Form validation: aria-invalid + error messages announced
      - Skip links: "Skip to main content" on every page
  - Acceptance
    - All critical flows passing CI; a11y audit passes key checks
    - Unit test coverage > 70% for core packages
    - Load test passes without errors
    - Accessibility: 0 critical axe violations; keyboard nav works; screen reader announces context
  - Deliverables
    - Test reports; coverage badge; accessibility audit document

- T7.2 SEO & Content
  - Tools: Context7 as needed, Svelte MCP (SEO section)
  - Steps
    - **Structured Data (JSON-LD)**
      - Product pages: schema.org/Product with price, availability, image
      - Profiles: schema.org/Person for sellers
      - Breadcrumbs: schema.org/BreadcrumbList
    - **Sitemaps**
      - Dynamic XML sitemap: /sitemap.xml
      - Include: categories, products (is_active=true), profiles
      - Exclude: auth pages, user dashboards
      - Submit to Google Search Console
    - **Meta Tags**
      - Dynamic og:image per product (use first image)
      - Twitter Card: summary_large_image
      - Canonical URLs to prevent duplicate content
    - **Robots.txt**
      - Allow: /, /bg/, /en/, /category/, /product/
      - Disallow: /api/, /admin/, /profile/edit
    - **Content Pages**
      - Seller onboarding guide, FAQs, Terms of Service, Privacy Policy
  - Acceptance
    - Google Search Console validation passes
    - Rich snippets preview correctly
    - Content pages reviewed and localized
  - Deliverables
    - Sitemap live; structured data validated; content pages deployed

- T7.3 Legal & Compliance (GDPR)
  - Tools: Context7 (GDPR templates)
  - Steps
    - **Cookie Consent**
      - Banner for non-essential cookies (analytics only; Supabase/Vercel analytics are essential)
      - Respect choice: only load analytics after consent
    - **Privacy Policy**
      - Data processing details: what we collect, how we use it, retention periods
      - Third-party processors: Supabase, Vercel, Stripe, Resend
      - User rights: access, correction, deletion, portability
    - **User Data Rights**
      - Data export: account settings → "Download my data" (JSON dump of user + products + messages)
      - Data deletion: account settings → "Delete account" (soft delete with 90-day purge or CASCADE)
    - **Terms of Service**
      - Buyer protection terms
      - Seller commission structure (if applicable)
      - Prohibited items list
      - Dispute resolution process
    - **Age Verification**
      - 18+ age gate for account creation
      - Terms acceptance checkbox (tracked in profiles table with accepted_at timestamp)
  - Acceptance
    - Privacy policy and Terms live and localized
    - Data export tested: returns complete user data
    - Data deletion tested: account removed or soft-deleted
    - Cookie consent respects user choice
  - Deliverables
    - Legal pages live; GDPR compliance checklist; consent implementation

- T7.4 Launch
  - Tools: Vercel (adapter-vercel docs via Svelte MCP)
  - Steps
    - **CI/CD Pipeline Finalization**
      - PR checks: lint, type check, unit tests, build, bundle size check
      - Preview deployments: every PR gets Vercel preview URL
      - Staging deploy: auto-deploy main branch, run E2E post-deploy
      - Production deploy: manual approval, blue-green deployment
      - Health check: /api/health endpoint returns 200
      - Rollback plan: Vercel instant rollback to previous deploy
      - Post-deploy: smoke tests (5 critical flows), monitor error rate for 15 min
    - **Production Deployment**
      - Domain setup and SSL
      - Environment variables: production Supabase, Stripe live keys, Resend API key
      - Vercel Analytics and Web Vitals enabled
      - Sentry production environment configured
    - **Soft Beta Launch**
      - Invite 50-100 beta users
      - Monitor: error rate, search success, order completion
      - Collect feedback: Typeform or Tally survey
    - **Go-Live Checklist**
      - [ ] DNS propagated and SSL active
      - [ ] Database backups verified (Supabase automatic daily backups enabled)
      - [ ] Monitoring dashboards live (Sentry, Vercel, Supabase)
      - [ ] Alerting tested (trigger false alarm, verify notification)
      - [ ] Legal pages live (Terms, Privacy, Cookie Policy)
      - [ ] Social media accounts ready
      - [ ] Customer support channel set up (email or chat)
  - Acceptance
    - Production deploy successful; health checks pass
    - Beta users can complete full flows
    - Error rate < 1% in first 24 hours
  - Deliverables
    - Production URL live; monitoring dashboards; launch retrospective notes

---

## Track O — Operations & Incident Response (Week 6–7)

Goal: Production operations readiness and incident response capability.

- O.1 Incident Response Runbook
  - Tools: Internal docs, Supabase dashboard, Vercel dashboard
  - Steps
    - Document common incidents:
      - Supabase connection timeouts (check status.supabase.com; verify connection pooling)
      - Payment failures (Stripe webhook verification; retry logic)
      - High error rate (Sentry spike; check recent deploys)
      - Search unavailable (check Supabase RPC; verify indexes)
      - Storage upload failures (check bucket policies and quotas)
    - Create escalation matrix: who to page for what (on-call rotation if team > 1)
    - Set up status page (statuspage.io or custom /status route)
  - Acceptance
    - 5+ runbooks written; team has tested fire drill (simulate outage)
  - Deliverables
    - docs/OPERATIONS.md with runbooks; status page live

- O.2 Database Maintenance & Monitoring
  - Tools: Supabase MCP (advisors, migrations), Supabase dashboard
  - Steps
    - Verify Supabase automatic daily backups enabled (7-day retention minimum)
    - Document restore procedure: Supabase dashboard → Backups → Restore to new project → test
    - Monitor table bloat and index usage (Supabase dashboard → Database → Performance)
    - Schedule quarterly index maintenance review (rebuild if fragmented)
  - Acceptance
    - Backup retention confirmed; restore tested on development branch
    - Monitoring alerts on connection pool saturation or slow queries
  - Deliverables
    - Backup verification checklist; restore runbook; monitoring dashboard links

- O.3 Cost Monitoring & Optimization
  - Tools: Vercel dashboard, Supabase dashboard
  - Steps
    - Set billing alerts: Vercel > $100/month, Supabase > $50/month (adjust per plan)
    - Track bandwidth and compute usage trends (weekly review)
    - Optimize: CDN caching for static assets, database connection pooling
  - Acceptance
    - Billing alerts configured; weekly cost review scheduled
    - Cost trends visible in dashboard
  - Deliverables
    - Cost monitoring dashboard; optimization recommendations log

---

## Implementation checklists by area (with MCP usage)

Use these per-feature when coding; run svelte-autofixer before committing component changes.

- Svelte (components/routes)
  - Svelte MCP: list-sections → get-documentation for: routing, load, form-actions, $state/$derived/$effect, snippets/@render, performance, images, accessibility, SEO
  - Patterns: server-only modules for secrets; use actions for mutations; SSR-friendly; snippets over slots
  - Validation: run `sv check` guidance; svelte-autofixer validation

- Paraglide/inlang (i18n)
  - Context7: fetch Paraglide docs; ensure compile-time message functions, tree-shaking, type-safety
  - Patterns: no hardcoded strings; locale-aware formatting; message keys colocated logically; route-level locale negotiation and persistent preference cookie
  - Quality: key coverage 100% for supported locales; ICU-like formatting where needed; bundle size tracked

- Tailwind v4
  - Context7: Tailwind docs; ensure v4 config; remove legacy plugins; validate purge
  - Design tokens: CSS variables in tokens.css; map to theme; light/dark via data-theme; avoid arbitrary values

- Supabase (DB/RLS/realtime/storage)
  - Supabase MCP: search_docs (RLS, Realtime, Storage, Functions), get_advisors (security/perf), list_tables, apply_migration (branch first), merge_branch
  - Patterns: enable RLS before grants; SECURITY DEFINER only when necessary; add indexes with rationale; idempotent migrations

- Stripe/Resend
  - Context7: Stripe Node + Stripe.js patterns; idempotency keys; webhook verification; Resend API usage

---

## Deliverables and acceptance summary (quick scan)

- **Foundation**: TypeScript 0 errors, Supabase advisors clean, Tailwind v4 finalized
- **UI/UX**: tokens-based theming, a11y-checked primitives (WCAG AA), skeletons/empty states, responsive audit complete, mobile optimizations
- **i18n**: detection banner, localized routes verified, messages 100% complete, ICU formatting
- **Search**: UI integrated with RPCs, autocomplete working, relevance ranking displayed, analytics dashboard
- **Chat**: realtime with presence and typing, read receipts, message history
- **Social**: reviews with ratings, follow/unfollow with optimistic UI, avatars storage with optimization
- **Orders**: checkout flow with Stripe, webhooks with idempotency, seller/buyer dashboards, order tracking
- **Performance**: Lighthouse > 90, bundle size < 150 KB, Core Web Vitals meet targets, load testing passed
- **Security**: RLS policies audited, rate limiting active, CSP headers, secrets rotation schedule, 0 critical advisors
- **Observability**: Sentry with correlation IDs, APM + business metrics dashboard, alerting rules configured, uptime monitoring
- **Testing**: 70% unit test coverage, integration tests for RLS, 15 E2E flows, load test passed, accessibility audit complete
- **SEO**: structured data (JSON-LD), dynamic sitemap, Open Graph meta tags, robots.txt
- **Compliance**: GDPR data export/deletion, cookie consent, Privacy Policy + Terms live, age verification
- **Operations**: incident runbooks, backup restore tested, cost monitoring, status page
- **Launch**: CI/CD pipeline, production deploy, health checks, beta tested, go-live checklist complete

---

## Parallelization and dependencies

- Safe parallel tracks: T1 (i18n) and T2 (search UI); T3 (chat) can start after T0 and in parallel with T2
- Stripe/webhooks (T5) depends on stable product and profiles
- Reviews depend on orders delivered; can build UI + RPC earlier and hide behind feature flag

---

## Definition of Done (global)

For each task:
- MCP consultation recorded (sections/docs used)
- Unit tests or E2E as appropriate
- All quality gates pass: lint, check, test, build
- Security/perf advisors clean (for DB-related tasks)
- Docs updated (short note in IMPLEMENTED.md or relevant README)

---

## Conformance with CONTRIBUTING and ROADMAP

- Svelte 5 runes-only components with snippet-first APIs; server-only modules for secrets
- Mutations via form actions or +server endpoints with input validation; SSR-friendly everywhere
- TypeScript strict; no stray any; `@ts-expect-error` only with justification
- Tailwind v4 only; tokens-based theming; avoid arbitrary values
- Supabase: RLS-first, advisors clean, migrations idempotent and reviewed in branch
- Tests: Vitest unit where meaningful, Playwright for critical paths; CI runs lint/check/test/build
- ROADMAP alignment: feature sequence matches priorities; parallel tracks minimize risk

---

## Pre-Flight Checklist (Before Starting Execution)

Use this to confirm readiness before moving to execution phase.

### Development Environment
- [ ] Node 22.12.x installed and active
- [ ] pnpm 9.x installed
- [ ] All dependencies installed (`pnpm install`)
- [ ] Supabase CLI installed and authenticated
- [ ] Environment variables configured (.env.local with dev Supabase project)

### Repository Setup
- [ ] All docs read and understood (ARCHITECTURE, CONTRIBUTING, PRODUCTION_PLAN, ROADMAP, PRODUCTION_TASKS)
- [ ] Git branch strategy agreed (feature branches off main)
- [ ] PR template configured with MCP usage section
- [ ] CI/CD pipeline configured (GitHub Actions or equivalent)

### Access & Credentials
- [ ] Supabase project access (development and staging)
- [ ] Vercel project access
- [ ] Stripe test account keys
- [ ] Resend API key for test emails
- [ ] Sentry project for error tracking

### Quality Gates
- [ ] ESLint + Prettier configured and passing
- [ ] TypeScript strict mode enabled
- [ ] Vitest configured for unit tests
- [ ] Playwright configured for E2E tests
- [ ] Pre-commit hooks set up (lint + type check)

### MCP Server Access
- [ ] Svelte MCP server configured and tested
- [ ] Context7 MCP server configured and tested
- [ ] Supabase MCP server configured and tested

---

## Logging MCP usage per PR (template)

Copy this template into every PR description to track tool usage and compliance.

```markdown
## MCP Usage Log

### Svelte MCP
- **list-sections called:** [list section names, e.g., "runes", "form-actions", "snippets"]
- **get-documentation fetched:** [list docs retrieved]
- **svelte-autofixer result:** [pass/fail with notes]

### Context7
- **Libraries consulted:** [e.g., "Tailwind CSS v4", "Paraglide", "TypeScript"]
- **Documentation sections used:** [specific topics]

### Supabase MCP
- **search_docs topics:** [e.g., "RLS policies", "Realtime publications", "Storage"]
- **get_advisors results:** [security: clean/warnings, performance: clean/warnings]
- **Migrations applied:** [link to migration file and branch used for testing]

## Changes Summary
[Brief description of changes]

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated (if applicable)
- [ ] Manual testing completed
- [ ] Accessibility checked (if UI changes)

## Quality Gates
- [ ] Lint passed
- [ ] Type check passed
- [ ] Tests passed
- [ ] Build succeeded
- [ ] Bundle size within budget (if applicable)
```

---

## Production Readiness Score

Track progress using this scorecard. Target: 95+ points before launch.

| Category | Max Points | Criteria | Status |
|----------|------------|----------|--------|
| **Architecture** | 10 | Svelte 5 + SvelteKit 2 patterns verified; monorepo structure clean | ☐ |
| **Type Safety** | 10 | TypeScript 0 errors; strict mode; no stray `any` | ☐ |
| **UI/UX** | 15 | Design tokens implemented; WCAG AA compliance; responsive; mobile-optimized | ☐ |
| **i18n** | 10 | 100% key coverage; locale detection; no hardcoded strings | ☐ |
| **Features** | 15 | Search, chat, social, orders all functional end-to-end | ☐ |
| **Performance** | 10 | Lighthouse > 90; Core Web Vitals targets met; bundle size within budget | ☐ |
| **Security** | 10 | RLS audited; rate limiting; CSP headers; 0 critical advisors | ☐ |
| **Testing** | 10 | 70% unit coverage; 15 E2E flows; load test passed; a11y audit clean | ☐ |
| **Observability** | 5 | Sentry configured; metrics dashboard; alerting rules | ☐ |
| **SEO** | 5 | Structured data; sitemap; Open Graph; robots.txt | ☐ |
| **Compliance** | 5 | GDPR (data export/deletion); Privacy Policy; Terms; cookie consent | ☐ |
| **Operations** | 5 | Incident runbooks; backup verified; cost monitoring | ☐ |

**Current Score: __ / 100**

**Grade:**
- **95-100**: Production ready ✅
- **85-94**: Launch-ready with minor polish 🟡
- **70-84**: Core complete, needs hardening 🟠
- **< 70**: Not ready for production 🔴

---

## Next up (suggested order for this repo)

**Week 1–2: Foundation & Design System**
1) T0.1–T0.2 Baseline verification (TypeScript, advisors, Tailwind v4)
2) U.1–U.6 UI/UX polish backbone (tokens, primitives, responsive/states, icons, motion)

**Week 3: Search & i18n**
3) T2.1–T2.3 Search UI integration, autocomplete, analytics dashboard
4) T1.1–T1.3 i18n completion and localized route verification

**Week 4: Realtime & Social**
5) T3.1–T3.2 Realtime chat enablement and UI
6) T4.1–T4.3 Social features (reviews, follow, avatars)

**Week 5: Orders & Payments**
7) T5.1–T5.3 Checkout flow, seller dashboard, buyer dashboard

**Week 6–7: Hardening**
8) T6.1–T6.3 Performance, Security, Observability deep implementation
9) O.1–O.3 Operations readiness (incident response, database maintenance, cost monitoring)

**Week 8: Launch**
10) T7.1 Testing coverage (unit, integration, E2E, load, accessibility)
11) T7.2 SEO implementation (structured data, sitemap, meta tags)
12) T7.3 Legal & Compliance (GDPR, privacy policy, terms, age verification)
13) T7.4 CI/CD finalization and production launch
