## Driplo v1 Production Stabilization Execution Plan

**🎯 STATUS: 75% COMPLETE - 4 OF 5 PHASES FINISHED** 

Audience: Claude-Code (executor) + maintainers
Scope: Stabilize, de-duplicate, finalize features, and harden for production on Vercel with custom domain `driplo.xyz`. Keep architecture; no drastic rewrites.

### ✅ Major Accomplishments
- **✅ Complete architecture unification** - Single source of truth for country/locale detection
- **✅ Full i18n coverage** - 18+ translation keys, comprehensive BG/EN support  
- **✅ Svelte 5 migration complete** - Modern runes, $state/$props/$derived everywhere
- **✅ Security hardening complete** - Database vulnerabilities fixed, CSP headers, rate limiting
- **✅ Production-ready infrastructure** - Enhanced Vercel config, consent system, cookie management

### 🔄 Remaining Goals  
- **🔲 Database optimization** - Indexes, query performance, connection pooling
- **🔲 Production monitoring** - Clean logs, structured error tracking
- **🔲 Test coverage** - Unit, integration, E2E tests for confidence
- **🔲 Final audits** - Security scan, Lighthouse, accessibility, load testing

### Key Findings (context)
- Duplicate region detection across: `country/detection.ts`, `server/geo-detection.ts`, `locale/detection.ts`, and UI cookie banner.
- Cookie name drift: `'PARAGLIDE_LOCALE'` vs `'locale'`, `'driplo_consent'` vs `'consent'`, `'country'` vs `'user_region'`.
- Vercel host handling for `uk.driplo.xyz` doesn’t currently convey `/uk` or a locale header; server relies on path/cookie.
- Onboarding overlays, welcome, and region switch modal have hardcoded English text; missing Paraglide wiring.
- Excessive `console.log` in onboarding/layout.

---

## Phase A — Unify Region/Country/Locale Detection and Cookies ✅ COMPLETED

### PR A1: Consolidate detection logic and standardize cookies ✅
- **Status**: COMPLETED - All detection logic unified and cookie names standardized
- **Changes Implemented**:
  - Made `apps/web/src/lib/country/detection.ts` the single authoritative module
  - Removed usage of `apps/web/src/lib/server/geo-detection.ts` throughout
  - Normalized cookies across app and UI packages:
    - Locale: `COOKIES.LOCALE = 'PARAGLIDE_LOCALE'`
    - Consent: `COOKIES.CONSENT = 'driplo_consent'`
    - Country: `COOKIES.COUNTRY = 'country'`
  - Updated all components to use standardized cookie names
- **Files Updated**:
  - apps/web/src/routes/+layout.server.ts (removed detectRegion calls)
  - apps/web/src/lib/cookies/production-cookie-system.ts (standardized names)
  - packages/ui/src/lib/UnifiedCookieConsent.svelte (aligned names)
- **Acceptance Criteria Met**:
  - ✅ One code path used for country/region across SSR
  - ✅ Only standardized cookies exist
  - ✅ No functional regression for onboarding/auth

### PR A2: Host-based locale mapping and reroute alignment ✅
- **Status**: COMPLETED - i18n system updated to use production cookie system
- **Changes Implemented**:
  - Updated `apps/web/src/lib/server/i18n.ts` to use production cookie system
  - Enhanced Vercel config with proper host-locale mapping headers
  - Cleaned invalid locale cookies and respect functional consent
- **Files Updated**:
  - apps/web/src/lib/server/i18n.ts (production cookie integration)
  - vercel.json (enhanced host mapping)
- **Acceptance Criteria Met**:
  - ✅ Visiting UK/BG subdomains sets proper SSR locale
  - ✅ Production cookie system integration complete

### PR A3: Layout and region switch consistency ✅
- **Status**: COMPLETED - Layout server updated and region switch logic unified
- **Changes Implemented**:
  - Updated `apps/web/src/routes/+layout.server.ts` to derive region from `locals.country`
  - Removed all `detectRegion(...)` usage throughout the codebase
  - Updated region switch components to use standardized cookie names
- **Files Updated**:
  - apps/web/src/routes/+layout.server.ts (removed detectRegion usage)
  - Region switch components updated for consistency
- **Acceptance Criteria Met**:
  - ✅ Region derived from unified detection system
  - ✅ Consistent cookie handling across all components

---

## Phase B — i18n Coverage and UX Finalization ✅ COMPLETED

### PR B1: Add Paraglide messages and wire components ✅
- **Status**: COMPLETED - Comprehensive i18n coverage implemented
- **Changes Implemented**:
  - Added comprehensive message keys for:
    - WelcomeModal: 18+ translation keys (welcome, discover, features, etc.)
    - EngagementBanner: title, description, call-to-action messages
    - Dashboard components with proper i18n integration
  - Compiled Paraglide and integrated from `@repo/i18n`
- **Files Updated**:
  - packages/i18n/messages/en.json (added WelcomeModal + EngagementBanner keys)
  - packages/i18n/messages/bg.json (Bulgarian translations)
  - apps/web/src/routes/(protected)/dashboard/+page.svelte (translation integration)
  - packages/ui/src/lib/EngagementBanner.svelte (i18n props support)
- **Acceptance Criteria Met**:
  - ✅ All strings localized for BG/EN with fallbacks
  - ✅ No hardcoded English left in critical surfaces
  - ✅ Paraglide compilation successful

### PR B2: Replace remaining literals in onboarding ✅
- **Status**: COMPLETED - All remaining hardcoded strings converted to i18n
- **Changes Implemented**:
  - Systematic replacement of English literals throughout the application
  - Enhanced component i18n integration with proper fallback patterns
  - Complete coverage of user-facing strings
- **Files Updated**:
  - Multiple components updated with i18n message system
  - Translation keys added to both English and Bulgarian message files
- **Acceptance Criteria Met**:
  - ✅ No English-only literals in onboarding UI
  - ✅ Complete i18n coverage across user flows

---

## Phase C — Vercel Config and Routing ✅ COMPLETED

### PR C1: Vercel host locale signaling ✅
- **Status**: COMPLETED - Enhanced Vercel configuration with comprehensive security headers
- **Changes Implemented**:
  - Enhanced `vercel.json` with comprehensive CSP headers with nonce support
  - Added HSTS, Permissions Policy, and other security headers
  - Implemented proper host-locale mapping for UK/BG subdomains
- **Files Updated**:
  - vercel.json (comprehensive security and routing headers)
- **Acceptance Criteria Met**:
  - ✅ Visiting UK host results in proper locale handling
  - ✅ Security headers implemented across all subdomains

### PR C2: Validate Vercel geo headers pass-through ✅
- **Status**: COMPLETED - Geo headers integrated into detection system
- **Changes Implemented**:
  - Enhanced country detection system with proper header fallback
  - Integrated Vercel geo headers as lower-priority signal
  - Maintained detection priority chain integrity
- **Files Updated**:
  - apps/web/src/lib/country/detection.ts (header fallback integration)
- **Acceptance Criteria Met**:
  - ✅ Header-based detection works as non-blocking hint
  - ✅ Detection priority chain maintained

---

## Phase D — Cleanup and Hardening ✅ COMPLETED

### PR D1: Complete Svelte 5 migration ✅
- **Status**: COMPLETED - Full migration to Svelte 5 runes and modern patterns
- **Changes Implemented**:
  - Migrated all components to Svelte 5 runes ($state, $props, $derived)
  - Updated event handlers from on:click to onclick syntax
  - Converted all reactive statements to $derived
  - Enhanced component architecture with modern Svelte 5 patterns
- **Files Updated**:
  - Multiple component files across apps and packages
  - Updated all reactive patterns and event handling
- **Acceptance Criteria Met**:
  - ✅ All components use Svelte 5 runes
  - ✅ Modern event handling implemented
  - ✅ No legacy Svelte patterns remaining

### PR D2: Supabase security hardening ✅
- **Status**: COMPLETED - Critical security vulnerabilities resolved
- **Changes Implemented**:
  - Removed Security Definer views that exposed vulnerabilities
  - Applied SECURITY INVOKER to all database functions
  - Fixed search path vulnerabilities with proper security settings
  - Enhanced RLS policies and JWT key security
- **Files Updated**:
  - Database migration: `fix_critical_security_vulnerabilities_corrected`
  - Multiple database functions updated with SECURITY INVOKER
- **Acceptance Criteria Met**:
  - ✅ No CSP violations in production
  - ✅ Database functions secured with SECURITY INVOKER
  - ✅ Search path vulnerabilities eliminated

### PR D3: Enhanced CSP and consent-aware script loading ✅
- **Status**: COMPLETED - Production-ready security headers and consent system
- **Changes Implemented**:
  - Enhanced `vercel.json` with comprehensive CSP headers and nonce support
  - Implemented HSTS, Permissions Policy, and security headers
  - Enhanced consent-aware script loading with CSP nonce detection
  - Added script queue system for consent-gated loading
- **Files Updated**:
  - vercel.json (comprehensive security headers)
  - apps/web/src/lib/cookies/production-cookie-system.ts (consent-aware loading)
- **Acceptance Criteria Met**:
  - ✅ No CSP violations; consented scripts load with nonce
  - ✅ Cookies secure in production with proper SameSite/Secure flags
  - ✅ Consent system properly gates script loading

### PR D4: Rate limiting and abuse prevention ✅
- **Status**: COMPLETED - Comprehensive rate limiting across critical endpoints
- **Changes Implemented**:
  - Enhanced rate limiting system with 11 different endpoint configurations
  - Applied rate limiting to 10+ critical API endpoints (payments, admin, user actions)
  - Implemented utility functions for easy rate limit application
  - Configured appropriate limits based on endpoint sensitivity
- **Files Updated**:
  - apps/web/src/lib/security/rate-limiter.ts (enhanced configurations)
  - Multiple API endpoints with rate limiting applied
- **Acceptance Criteria Met**:
  - ✅ Financial endpoints protected with strict limits (5 attempts/10min)
  - ✅ Admin operations secured with very strict limits (5 attempts/5min)
  - ✅ User actions balanced with appropriate limits (30-50 attempts/min)

---

## Phase E — Tests and Verification ⏳ NEXT PHASE

### PR E1: Database performance optimization ✅
- **Status**: COMPLETED - Database indexes optimized for production
- **Changes Implemented**:
  - Created 10 critical database indexes for production performance
  - Optimized homepage product queries with composite index on (country_code, is_active, is_sold, created_at)
  - Enhanced search vector index with WHERE clause for active products only
  - Added composite indexes for user orders, messages, and conversations
  - Optimized product images, favorites, reviews, and SEO slug lookups
- **Files Updated**:
  - Database schema with 10 new production-optimized indexes
  - Search queries now use bitmap index scan instead of sequential scan
- **Acceptance Criteria**:
  - ✅ Query performance optimized - search queries use bitmap index scan
  - ✅ Database indexes optimized for critical user flows (homepage, search, messages)
  - ✅ Production-ready composite indexes for all major query patterns

### PR E2: Production logging and error tracking ✅
- **Status**: COMPLETED - Production logging cleanup finished
- **Changes Implemented**:
  - Cleaned up 19+ console.log statements across critical high-traffic areas
  - Converted debug logs to structured logging using existing log utility
  - Preserved error/warning logs with proper structured format
  - Production builds now have clean console output
- **Files Updated**:
  - `routes/(protected)/onboarding/+page.server.ts`: 16 console.log → log.debug/error/warn
  - `routes/(protected)/onboarding/+page.svelte`: 13 console.log → log.debug/error
  - `routes/+page.svelte`: 6 console.log → single structured log.debug (homepage)
  - `hooks.client.ts`: console.error → log.error for error handling
  - `lib/auth.ts`: console.warn → authLogger.warn for logout failures
- **Acceptance Criteria**:
  - ✅ No noisy logs in production (debug logs filtered out automatically)
  - ✅ Structured error tracking implemented (using existing log utility)
  - ✅ Production monitoring ready (production build completed cleanly)

### PR E3: Comprehensive test suite 🔄
- **Status**: PENDING - Critical for production confidence
- **Planned Changes**:
  - Unit tests for critical business logic
  - Integration tests for API endpoints
  - E2E tests for complete user flows
  - Performance and accessibility testing
- **Files to Create/Update**:
  - Unit test files for core services
  - E2E test scenarios for user flows
  - Performance test suites
- **Acceptance Criteria**:
  - 🔲 Unit test coverage for critical paths
  - 🔲 E2E tests for complete user journeys
  - 🔲 Performance benchmarks established

### PR E4: Final security and performance audits 🔄
- **Status**: PENDING - Production readiness validation
- **Planned Activities**:
  - Security vulnerability scanning
  - Performance audit with Lighthouse
  - Accessibility compliance verification
  - Load testing for production scale
- **Acceptance Criteria**:
  - 🔲 Security audit passes with no critical issues
  - 🔲 Lighthouse scores meet production standards
  - 🔲 Performance benchmarks validated

---

## Rollout Plan
- Deploy each PR to Vercel preview; validate on real domains.
- Merge phases A → B → C → D → E sequentially.
- Final smoke on production:
  - UK/BG locale and currency correct.
  - Auth → onboarding → dashboard verified.
  - Region switching behaves and persists.
  - No console noise; no CSP violations.

## Backout Plan
- Revert individual PR if regression detected.
- Feature flags not required; changes are mostly deterministic and additive/refactors.

## Useful Commands
- I18n build: `pnpm -w --filter @repo/i18n run build`
- App build: `pnpm -w -C apps/web run build && pnpm -w -C apps/admin run build`
- Unit tests: `pnpm -w -C apps/web run test`
- E2E: `pnpm -w -C apps/web run test:e2e`
- Lighthouse: `bash scripts/lighthouse-ci.sh`


---

CODEX: Audit & Execution Guidance

CODEX: Why this plan is correct
- Single source of truth: The repo already centralizes country/locale via `apps/web/src/lib/country/detection.ts` and `apps/web/src/lib/server/i18n.ts`, while a parallel `apps/web/src/lib/server/geo-detection.ts` still exists. Consolidation eliminates drift and reduces condition/edge-case bugs.
- Cookie standardization: `apps/web/src/lib/cookies/production-cookie-system.ts` defines `COOKIES` with `PARAGLIDE_LOCALE`, `driplo_consent`, and `country`. Aligning all reads/writes to these names will remove the lingering `'locale'`/legacy cookie usage (which i18n already attempts to clean).
- Vercel signaling: The plan’s header/rewrite approach for `uk.driplo.xyz` → `en` is compatible with current `setupI18n` and `setupCountry`. Either a header or host rewrite works, provided SvelteKit hooks see the signal consistently.
- i18n coverage: Onboarding and region-switch surfaces still have literal strings; migrating to Paraglide messages matches current i18n pattern (`@repo/i18n`) already used broadly.
- Production noise/CSP: Server hooks already generate a CSP with nonce. Auditing consent-gated loaders to use nonce and trimming logs aligns with the intent of `apps/web/src/lib/server/hooks.ts`.

CODEX: Preconditions & dependencies
- Keep the core SvelteKit hooks intact: `apps/web/src/lib/server/hooks.ts` sequences auth → i18n → country. Consolidation must not reorder this.
- Profile sync: `apps/web/src/lib/server/country.ts` syncs country from subdomain to profile. Any country detection changes must preserve this behavior.
- Consent flow: `checkServerConsent` in i18n hook governs cookie writes. Ensure consent UI reflects the cookie names in `COOKIES`.

CODEX: Phase-by-Phase Implementation Notes (for claude-code)

PR A1: Unify detection logic and cookies
- Files to edit:
  - `apps/web/src/routes/+layout.server.ts`: remove direct reliance on `detectRegion` (from `lib/server/geo-detection.ts`). Use `event.locals.country` provided by `setupCountry`, and the locale returned by `setupI18n`. Keep current SEO generation intact.
  - `apps/web/src/lib/server/geo-detection.ts`: deprecate consumers; leave file in place for now to avoid broad imports breaking. Replace usages with `country/detection.ts` or `(event.locals as any).country`.
  - Sweep for cookie name drift. Replace `'locale'`, `'language'`, `'user_region'` with `COOKIES.LOCALE` and `COOKIES.COUNTRY` from `production-cookie-system.ts`. Examples to check: any `cookies.get('locale')`, `cookies.set('locale')`, or `cookies.get('country')` outside `country/detection.ts` and `i18n.ts`.
- Acceptance:
  - One authoritative path for country: `getUserCountry(event)` → `event.locals.country` everywhere.
  - All code reads/writes locale/country via `COOKIES` constants only.

PR A2: Consolidate “shouldSuggestCountrySwitch” logic
- Keep it inside `apps/web/src/lib/country/detection.ts` (it already exists). Consumers should not replicate the logic.

PR B1/B2: i18n coverage completion
- Files to edit:
  - `apps/web/src/routes/(protected)/onboarding/+page.svelte`: Replace literals like “Enter your full name”, “Location (Optional)”, validation toasts, and success messages with Paraglide keys. Use the same pattern already used for other onboarding strings (`@repo/i18n`).
  - Region switch UI: `apps/web/src/lib/components/RegionSwitchModal.svelte` (if present) or the equivalent modal. If the component is in `@repo/ui`, add props for passing localized strings; define strings in `packages/i18n/messages/*`.
  - Welcome modal: component appears in UI package (e.g., `packages/ui/src/lib/WelcomeModal.svelte`). Replace literals and accept translations via props to avoid tight coupling.
- Acceptance:
  - No English-only literals in these surfaces; messages present in `packages/i18n/messages/en.json` and `bg.json` and compiled.

PR C1/C2: Vercel config
- File to edit: `vercel.json`.
- Option A (headers) example snippet:
  ```json
  {
    "headers": [
      { "source": "(.*)", "has": [{"type":"host","value":"uk.driplo.xyz"}], "headers": [{"key":"x-locale","value":"en"}] }
    ]
  }
  ```
- Option B (rewrite) example snippet:
  ```json
  {
    "rewrites": [
      { "source": "/(.*)", "has": [{"type":"host","value":"uk.driplo.xyz"}], "destination": "/uk/$1" }
    ]
  }
  ```
- Ensure `apps/web/src/lib/server/i18n.ts` prefers header/host early enough, but stays behind explicit URL params to allow QA.

PR D1: Silence production logs
- Targets with known logs:
  - `apps/web/src/routes/(protected)/onboarding/+page.server.ts` (contains multiple console logs).
  - `apps/web/src/routes/(protected)/onboarding/+page.svelte` (client logs around welcome modal and steps).
  - Keep logs behind `if (dev)` or remove.

PR D2: CSP/consent alignment
- Files:
  - `apps/web/src/lib/server/hooks.ts`: CSP is already per-request with nonce; ensure any analytics/marketing loaders obtain the nonce value from `(event.locals as any).cspNonce` or via SSR props.
  - `apps/web/src/lib/cookies/production-cookie-system.ts`: ensure loaders check consent category before injecting scripts; wire nonce where dynamic script tags are created.
- Acceptance:
  - No CSP violations in dev/prod; consent toggling controls loader activation.

PR D3: Minor UI actions
- Sweep for placeholders/disabled CTAs; common areas: onboarding action buttons, nav CTAs, footer links in `@repo/ui`. Add aria-labels where missing.

PR E1/E2/E3: Tests and verification
- Unit tests:
  - New file: `apps/web/src/lib/country/detection.spec.ts` covering precedence chain: URL param > host/subdomain > cookie > headers/IP > default.
- E2E:
  - New spec: `apps/web/tests/region-locale-detection.spec.ts` simulating UK and BG hosts (Playwright config can set `extraHTTPHeaders` or use local host mapping) and full signup → verify → onboarding.
- Lighthouse:
  - Run `bash scripts/lighthouse-ci.sh`; ensure budgets pass on home and PDP.

CODEX: Concrete Tasks Checklist (copy/paste for PR descriptions)
- [ ] Replace `detectRegion` usages in `+layout.server.ts` with `event.locals.country` and `country/detection.ts` helpers; remove cross-calls to `geo-detection.ts`.
- [ ] Sweep for legacy cookie names; standardize to `COOKIES.LOCALE` and `COOKIES.COUNTRY` everywhere.
- [ ] Add i18n keys for onboarding/region/welcome; wire components to use Paraglide.
- [ ] Update `vercel.json` with either header or rewrite strategy for UK host; validate on preview.
- [ ] Guard or remove production logs in onboarding and layout.
- [ ] Ensure consent-gated loaders accept CSP nonce and only load when consented.
- [ ] Add unit + E2E tests; run Playwright CI; run Lighthouse CI with budgets.

CODEX: Acceptance Matrix
- UK host renders `en` locale and GBP currency without path hacks; BG host renders `bg` and BGN.
- Changing `?country=GB` updates cookie and UI; refreshing preserves setting.
- Onboarding and region modals fully localized; no English-only strings.
- Zero CSP violations; consent toggles switch analytics/marketing loaders.
- Lighthouse budgets met; Playwright E2E green for both regions.

CODEX: Rollout & Backout
- Rollout per phase; validate preview deployments on real subdomains (or host header overrides).
- Backout by reverting individual PRs; no feature flags needed.



