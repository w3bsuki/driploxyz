## Driplo v1 Production Stabilization Execution Plan

Audience: Claude-Code (executor) + maintainers
Scope: Stabilize, de-duplicate, finalize features, and harden for production on Vercel with custom domain `driplo.xyz`. Keep architecture; no drastic rewrites.

### Goals
- **Unify region/country/locale detection** and cookie names; remove duplication.
- **Align routing and Vercel config** for UK/BG without brittle path assumptions.
- **Complete i18n coverage** for onboarding, welcome modal, and region switching.
- **Reduce production noise** and finalize minor UI actions.
- **Verify with unit/E2E tests and Lighthouse** before push to production.

### Key Findings (context)
- Duplicate region detection across: `country/detection.ts`, `server/geo-detection.ts`, `locale/detection.ts`, and UI cookie banner.
- Cookie name drift: `'PARAGLIDE_LOCALE'` vs `'locale'`, `'driplo_consent'` vs `'consent'`, `'country'` vs `'user_region'`.
- Vercel host handling for `uk.driplo.xyz` doesn’t currently convey `/uk` or a locale header; server relies on path/cookie.
- Onboarding overlays, welcome, and region switch modal have hardcoded English text; missing Paraglide wiring.
- Excessive `console.log` in onboarding/layout.

---

## Phase A — Unify Region/Country/Locale Detection and Cookies

### PR A1: Consolidate detection logic and standardize cookies
- **Branch**: `feat/unify-country-locale-detection`
- **Changes**:
  - Make `apps/web/src/lib/country/detection.ts` the single authoritative module (priority: URL param > subdomain/host > cookie > Vercel/CF headers > IP API > default BG).
  - Remove usage of `apps/web/src/lib/server/geo-detection.ts` throughout; migrate consumers to `country/detection.ts` and `event.locals.country`.
  - Treat GB→UK mapping internally for region UI where needed.
  - Normalize cookies across app and UI packages:
    - Locale: `COOKIES.LOCALE = 'PARAGLIDE_LOCALE'`
    - Consent: `COOKIES.CONSENT = 'driplo_consent'`
    - Country: `COOKIES.COUNTRY = 'country'` (drop `user_region`)
  - Only set preference cookies if functional consent is present.
- **Files (primary)**:
  - apps/web/src/lib/country/detection.ts
  - apps/web/src/lib/server/geo-detection.ts (delete or deprecate and remove imports)
  - apps/web/src/routes/+layout.server.ts (stop calling detectRegion)
  - apps/web/src/lib/cookies/production-cookie-system.ts (confirm names)
  - packages/ui/src/lib/UnifiedCookieConsent.svelte (align names; remove client writes that conflict)
- **Acceptance**:
  - One code path used for country/region across SSR.
  - Only `PARAGLIDE_LOCALE`, `driplo_consent`, and `country` cookies exist.
  - No functional regression for onboarding/auth.
- **Tests**:
  - Unit tests for detection priority and GB/BG mapping (see PR E1).
- **Commands**:
  - `pnpm -w -C apps/web run build`

### PR A2: Host-based locale mapping and reroute alignment
- **Branch**: `feat/host-locale-mapping`
- **Changes**:
  - In `apps/web/src/lib/server/i18n.ts`, map hosts:
    - `uk.driplo.xyz` → `en`
    - `bg.driplo.xyz` → `bg`
  - Keep reroute for `/uk` legacy alias but don’t depend on it for correctness.
  - Clean invalid locale cookies and respect functional consent.
- **Files**:
  - apps/web/src/lib/server/i18n.ts
  - apps/web/src/hooks.reroute.ts (no logic change; ensure compatibility)
- **Acceptance**:
  - Visiting UK/BG subdomains sets proper SSR locale without requiring `/uk` path.
- **Tests**:
  - Add unit tests stubbing host headers (PR E1).

### PR A3: Layout and region switch consistency
- **Branch**: `feat/layout-region-switch-consistency`
- **Changes**:
  - In `apps/web/src/routes/+layout.server.ts`, derive `region`, `currency`, `language` from `locals.country` and i18n; remove `detectRegion(...)` usage.
  - Update `/api/region/switch` to write `COOKIES.COUNTRY` and update profile; remove `user_region`.
  - Update `apps/web/src/lib/components/RegionSwitchModal.svelte` to use i18n labels and redirect helper; keep subdomain redirect.
- **Files**:
  - apps/web/src/routes/+layout.server.ts
  - apps/web/src/routes/api/region/switch/+server.ts
  - apps/web/src/lib/components/RegionSwitchModal.svelte
- **Acceptance**:
  - Region prompt and switch correctly set cookie and redirect to subdomain; profile updated when logged in.
- **Tests**:
  - Add E2E for region switch (PR E2).

---

## Phase B — i18n Coverage and UX Finalization

### PR B1: Add Paraglide messages and wire components
- **Branch**: `feat/i18n-welcome-region-onboarding`
- **Changes**:
  - Add messages for:
    - Welcome modal: titles, descriptions, buttons, stats labels.
    - RegionSwitch modal: headings, benefits, actions.
    - Onboarding overlays (email-verified welcome) and form labels/placeholders.
  - Compile Paraglide and import from `@repo/i18n` in components.
- **Files**:
  - packages/i18n/messages/en.json, packages/i18n/messages/bg.json
  - packages/ui/src/lib/WelcomeModal.svelte
  - apps/web/src/lib/components/RegionSwitchModal.svelte
  - apps/web/src/routes/(protected)/onboarding/+page.svelte
- **Acceptance**:
  - All strings localized for BG/EN with fallbacks; no hardcoded English left in these surfaces.
- **Commands**:
  - `pnpm -w --filter @repo/i18n run build`

### PR B2: Replace remaining literals in onboarding
- **Branch**: `chore/i18n-onboarding-cleanup`
- **Changes**:
  - Replace literals like “Enter your full name”, “Location (Optional)”, success overlays, and validation messages with Paraglide messages.
- **Files**:
  - apps/web/src/routes/(protected)/onboarding/+page.svelte
- **Acceptance**:
  - No English-only literals in onboarding UI.

---

## Phase C — Vercel Config and Routing

### PR C1: Vercel host locale signaling
- **Branch**: `chore/vercel-locale-signal`
- **Changes** (choose one strategy):
  - Option A (headers): For `uk.driplo.xyz`, add header `x-locale: en`; optionally `bg.driplo.xyz` → `x-locale: bg`.
  - Option B (rewrite): Rewrite `uk.driplo.xyz` → `/uk/$1` to keep path sentinel aligned with reroute.
- **Files**:
  - vercel.json
- **Acceptance**:
  - Visiting UK host results in SSR `en` locale without manual path; BG host in `bg`.

### PR C2: Validate Vercel geo headers pass-through
- **Branch**: `chore/vercel-geo-headers`
- **Changes**:
  - Ensure no middleware strips `x-vercel-ip-country`; keep as a lower-priority signal in detection.
- **Files**:
  - apps/web/src/lib/country/detection.ts (final fallback includes headers)
- **Acceptance**:
  - Header-based detection remains a non-blocking hint.

---

## Phase D — Cleanup and Hardening

### PR D1: Silence production logs
- **Branch**: `chore/silence-prod-logs`
- **Changes**:
  - Guard `console.log` with `dev` or remove in:
    - apps/web/src/routes/(protected)/onboarding/+page.svelte
    - apps/web/src/routes/(protected)/onboarding/+page.server.ts
    - apps/web/src/routes/+layout.server.ts
- **Acceptance**:
  - No noisy logs in production.

### PR D2: CSP and consent loaders
- **Branch**: `chore/csp-consent-alignment`
- **Changes**:
  - Ensure analytics/marketing loaders in cookie manager accept CSP nonce and only load when consented.
  - Verify cookies use `SameSite=Lax`, `Secure` in prod. No client attempts to set HttpOnly cookies.
- **Files**:
  - apps/web/src/lib/server/hooks.ts (CSP)
  - apps/web/src/lib/cookies/production-cookie-system.ts
- **Acceptance**:
  - No CSP violations; consented scripts load with nonce; cookies secure in prod.

### PR D3: Minor UI action completeness
- **Branch**: `chore/ui-minor-fixes`
- **Changes**:
  - Sweep for disabled or placeholder buttons/links; add handlers and aria labels.
- **Files**: targeted UI components where needed (ui package + app components).
- **Acceptance**:
  - All primary CTAs functional; basic a11y labels present.

---

## Phase E — Tests and Verification

### PR E1: Unit tests for detection
- **Branch**: `test/detection-unit`
- **Tests**:
  - Host mapping: uk./bg. → GB/BG and en/bg locale.
  - Cookie overrides precedence.
  - Vercel/CF header fallback.
  - IP fallback default to BG.
- **Files**:
  - apps/web/src/lib/country/detection.spec.ts (new)

### PR E2: E2E flows for regions and onboarding
- **Branch**: `test/e2e-regions-onboarding`
- **Scenarios**:
  - `uk.driplo.xyz`: en/GBP/UK listings, signup → verify → onboarding → dashboard.
  - `bg.driplo.xyz`: bg/BGN/BG listings, same flows.
  - Region switch modal: cookie set, redirect to subdomain; profile region updated when logged in.
- **Files**:
  - apps/web/tests/region-locale-detection.spec.ts (new)
  - apps/web/tests/features/complete-user-flows.spec.ts (extend)

### PR E3: Lighthouse and Web Vitals checks
- **Branch**: `chore/lighthouse-vitals`
- **Run**:
  - `bash scripts/lighthouse-ci.sh`
  - Validate performance budgets on home/PDP.

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


