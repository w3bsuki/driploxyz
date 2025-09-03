**Driplo Production Build & Cleanup Plan**
- **Goal:** Ship a lean, secure SvelteKit monorepo to production with all core features working and zero bloat. Keep scope tight; remove duplication; gate releases with tests and budgets.

**Scope**
- **Apps:** `apps/web` (primary), `apps/admin` (internal), `apps/docs` (optional)
- **Packages:** `packages/ui`, `packages/i18n`, `packages/utils`, `packages/database`
- **Infra:** Vercel (SvelteKit adapter), Supabase, Stripe, Resend, Paraglide, Turborepo, Playwright, Lighthouse CI

**Production Build (Happy Path)**
- **Prereqs:** Node `>=20`, pnpm `>=8.15`, Vercel project linked to `apps/web`.
- **Install:** `pnpm install`
- **Prep:** `pnpm -w turbo run check-types && pnpm -w turbo run lint`
- **Build libs:** `pnpm -w build --filter @repo/i18n --filter @repo/ui --filter @repo/utils`
- **Build app:** `pnpm -C apps/web build`
- **Preview (local):** `pnpm -C apps/web preview`
- **CI (current):** `.github/workflows/ci-simple.yml` builds `@repo/ui`, `@repo/i18n`, then `web`.

**Critical Security Remediation (Do Now)**
- **Secrets committed:** Remove and rotate immediately.
  - `apps/web/.env.local` (contains Supabase service role, Stripe live keys, Resend, Sentry)
  - `apps/admin/.env.local` (service role + admin secrets)
- **Actions:**
  - Rotate all keys in Supabase, Stripe, Resend, Sentry.
  - Delete secrets from git history using BFG or `git filter-repo` and force-push.
  - Ensure env files are untracked; rely on Vercel/Supabase secret managers.
  - Keep only sanitized examples: `/apps/web/.env.example`, `/apps/admin/.env.example`.

**High-Impact Fixes (Minimal, Surgical)**
- **Stripe API version:** Pin to a valid version.
  - Update `apps/web/src/lib/stripe/server.ts:1` → `new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })`.
- **Lighthouse config:** Fix malformed JSON file.
  - Keep either `.lighthouserc.json` or `.lighthouserc.yml` (not both). Remove the YAML block appended to the JSON file.
- **Sentry duplication:** Consolidate to one runtime.
  - Keep `apps/web/src/lib/server/sentry.ts`; remove or archive `apps/web/src/lib/server/sentry-config.ts` to cut size and confusion.
- **Svelte alias hygiene:** Avoid forcing source aliases in production builds.
  - In `apps/web/svelte.config.js`, drop `kit.alias` for `@repo/ui`/`@repo/i18n` (handled in Vite for dev) so prod uses package exports (tree-shakeable).
- **Env validation alignment:** Use one source of truth.
  - Prefer `apps/web/src/lib/env/validation.ts`; remove `apps/web/src/lib/env/server.ts` or refactor it to re-export `validation.ts` types.

**Refactor & Debloat (No Over-Engineering)**
- **Rule-of-2 to `@repo/ui`:** If a component is used ≥2 places in `apps/web`, promote to `packages/ui`; delete app duplicate.
- **Remove demo/debug routes from production build:**
  - Review and gate or remove: `apps/web/src/routes/demo`, `apps/web/src/routes/test-translations`.
- **Consolidate logging:** Keep `apps/web/src/lib/utils/log.ts`. Remove ad-hoc `console.*` across app; replace with `log.*`.
- **Country redirect:** It’s disabled for perf. Keep utility (`country-redirect.ts`) but do not include in the handle sequence until we have metrics to justify.
- **CSS tokens only:** Replace any raw color literals left in app code with token-backed classes (Tailwind v4 + `tokens.css`).
- **Sentry in prod only:** Already lazy/gated. Ensure no client error spam in dev unless `SENTRY_ENABLE_DEV=true`.

**Dependencies & Config Hygiene**
- **Align workspace versions:** Svelte, SvelteKit, Vite, Tailwind should match across apps where feasible to reduce duplication.
- **Turbo build scope:** For CI, build only what’s required.
  - Use `pnpm -w turbo run build --filter @repo/ui --filter @repo/i18n --filter apps/web...`.
- **Adapter:** `apps/web/svelte.config.js` uses `@sveltejs/adapter-vercel` with `runtime: 'nodejs22.x'` → keep.
- **Vite manualChunks:** Keep i18n chunking (`apps/web/vite.config.ts`) to reduce initial payload.
- **Playwright:** Keep current tests; ensure fixtures are small and local.

**UI/UX Standardization (Svelte 5 + Melt UI)**
- **Design Tokens:** One source of truth in `packages/ui/src/styles/tokens.css` and semantic mappings in `packages/ui/src/styles/semantic.css`. No raw hex/oklch in app code; always map via tokens.
- **Tailwind v4:** Load tokens in `apps/web/src/app.css`; ensure `@import '../../../packages/ui/src/styles/tokens.css'` and `semantic.css` are present. Use semantic utilities and tokens, not ad-hoc classes.
- **Svelte 5 runes:** Use `$state`, `$derived`, `$effect` for local state and computed values. Avoid stores for short-lived component state.
- **Melt UI:** Wrap primitives in `@repo/ui` components only. Use existing wrappers: `Modal.svelte`, `Select.svelte`, `ToastContainer.svelte`, `TabGroup.svelte`, `CategoryBottomSheet.svelte`, etc. Do not import Melt directly in apps.
- **Icons:** Use `@lucide/svelte` only, via shared wrappers in `@repo/ui` when applicable. Keep sizes aligned to tokens (`--size-md`, `--touch-icon`).

**Button System (Pixel-Perfect)**
- **Source:** `packages/ui/src/lib/Button.svelte` (variants: `primary | secondary | outline | ghost | danger`; sizes: `sm | md | lg`).
- **Tokens:** Height from `--btn-height-*` mapped to `--touch-*` targets; padding and radius from `--btn-padding-*` and `--btn-radius`.
- **States:** Loading with inline spinner, disabled with `disabled:opacity-50`, focus ring `focus-visible:ring-2` using `--state-focus`.
- **Usage:**
  - Primary CTAs (Buy, Sell, Continue) → `variant="primary" size="lg"` (min-height 44px).
  - Secondary actions → `variant="secondary" size="md"`.
  - Destructive → `variant="danger"` and confirmation modal.
- **Do not:** Handcraft buttons in `apps/web`. Replace local buttons with `@repo/ui` Button in PRs that touch those surfaces.

**Form System (Accessible, Mobile-First)**
- **Inputs:** Use `packages/ui/src/lib/Input.svelte` and `Select.svelte`; Tailwind forms plugin already configured in `app.css`.
- **Validation:** Client hint + server validation. Show errors under fields with `aria-invalid`, `aria-describedby`.
- **Touch targets:** Inputs ≥ 44px height; spacing from `--space-*` scale.
- **CSRF:** Ensure forms include CSRF hidden field where mutating; validate via `lib/server/csrf.ts`.

**Layout & Grid**
- **Spacing:** 4px grid (`--space-*`). Use multiples for padding/margins.
- **Containers:** Content max-widths 100%, 640, 768, 1024, 1280 following Tailwind defaults; mobile-first stacking.
- **Product Cards:** Use `@repo/ui/ProductCard.svelte`; keep image aspect ratio square, title two-line clamp, price prominent.
- **Sticky Elements:** On mobile, use sticky bottom CTA for PDP and checkout (`position: sticky` within safe areas).

**Typography**
- **Fonts:** Inter variable font loaded in `apps/web/src/app.html` with Cyrillic support.
- **Scale:** Use tokenized sizes (`--text-*`) and line-heights (`--leading-*`); never set raw px in components.
- **Language:** Maintain Bulgarian defaults; ensure `:lang(bg)` rules apply in `app.css` for improved tracking.

**Interactions & Motion**
- **Focus:** Visible focus rings using `--state-focus` token; never remove focus without replacement.
- **Hover/Active:** Guard hovers with `@media (hover: hover)`; provide active feedback on touch.
- **Transitions:** Use tokenized durations (`--duration-*`) for consistency; avoid heavy shadows/blur on mobile.

**PDP Mobile-First Revamp**
- **Gallery:** Use `@repo/ui/ProductGallery.svelte` with lazy thumbnails, pinch-zoom on modal; keep LCP image optimized and priority-loaded.
- **Buy Box:** Sticky bottom `Button size="lg"` CTA; price and condition visible above the fold; shipping estimate via `ShippingEstimator.svelte`.
- **Details:** Accordion for description, condition report and size guide; truncate long text with “Show more”.
- **Social Proof:** Ratings summary near price; seller quick view via `SellerQuickView.svelte`.
- **Perf:** Defer non-critical JS; remove blocking work from onMount; prefetch related routes.

**Migration Playbook (UI/UX)**
- Replace ad-hoc buttons/inputs with `@repo/ui` components in `apps/web` (auth, sell flow, checkout, PDP).
- Audit for raw color literals and replace with tokens; run grep and fix.
- Align paddings/margins to `--space-*`; unify radii to `--radius-*`.
- Collapse duplicated components in `apps/web/src/lib/components` into `@repo/ui` and delete the app-local copies.
- Convert legacy store-heavy components to Svelte 5 runes where local state suffices.
- Keep country redirect disabled in handle sequence until measured; keep banner suggestion UX.

**A11y & QA (Must Pass)**
- **Keyboard:** All interactive elements tab-navigable; focus traps only in modals.
- **ARIA:** Names/roles for buttons, form fields, error text; alt text for images.
- **Tap targets:** Primary ≥ 44px, standard ≥ 36px.
- **Contrast:** Meet AA across light/dark; rely on semantic tokens.
- **Tests:**
  - Playwright: auth, onboarding, sell, PDP, checkout; mobile viewports in `apps/web/tests/*` stay green.
  - Axe-core: run @axe-core/playwright for smoke a11y on key pages.

**Environment & Secrets (Production)**
- **Vercel project env (production):**
  - PUBLIC_SUPABASE_URL
  - PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
  - PUBLIC_STRIPE_PUBLISHABLE_KEY
  - STRIPE_SECRET_KEY
  - STRIPE_WEBHOOK_SECRET
  - RATE_LIMIT_SECRET
  - CSRF_SECRET
  - SENTRY_DSN (optional but recommended)
  - RESEND_API_KEY (if email enabled)
- **Never expose service role to client:** All server-only reads via `$env/dynamic/private` or dedicated `*.server.ts` files.

**CI/CD Hardening**
- **CI Steps:**
  - Install: `pnpm install --frozen-lockfile`
  - Build libs: `pnpm -w build --filter @repo/i18n --filter @repo/ui`
  - Build web: `pnpm -C apps/web build`
  - Gate: `pnpm performance-audit` (Lighthouse+bundle) and `pnpm test:performance`
- **Vercel:** Configure project to build only `apps/web`; use Vercel env secrets; keep `vercel.json` security headers; consider adding a CSP.

**Verification Gates (Must Pass Before Deploy)**
- **Static checks:** `pnpm -w turbo run check-types && pnpm -w turbo run lint`
- **Unit/Integration:** `pnpm -w turbo run test` (includes Playwright in `apps/web`)
- **Lighthouse CI:** p75 mobile ≥ 90, LCP ≤ 1.5s (see `.lighthouserc.*`)
- **Bundle budget:** `scripts/advanced-bundle-analysis.js` under set thresholds; fail CI on regressions.
- **E2E flows:** `apps/web/tests/production-readiness.spec.ts` green for auth, onboarding, listing, purchase, mobile responsiveness.

**Targeted Fix List (Files To Touch)**
- `apps/web/src/lib/stripe/server.ts:1` → pin `apiVersion: '2024-06-20'`.
- `apps/web/.env.local`, `apps/admin/.env.local` → delete from VCS; rotate all keys; rely on Vercel secrets.
- `.lighthouserc.json` → remove appended YAML; keep a single, valid config (JSON or YAML) and ensure `package.json` points to it.
- `apps/web/svelte.config.js:kit.alias` → remove `@repo/*` aliases (dev-only aliasing is handled in `vite.config.ts`).
- `apps/web/src/lib/server/sentry-config.ts` → remove or fold into `sentry.ts`.
- `apps/web/src/lib/env/server.ts` → deprecate in favor of `lib/env/validation.ts` to avoid drift.

**Cutover Plan**
- **T-1 (Security):** Rotate keys, purge repo history, push fresh baseline; protect branches.
- **T-0 (Staging build):** Apply High-Impact Fixes, run all gates, verify on preview URL.
- **T+0 (Production):** Promote Vercel PR to production once gates pass; monitor Sentry and web vitals.
- **Rollbacks:** Vercel instant rollbacks; Stripe webhooks idempotent; feature flags optional via env.

**Commands Cheat Sheet**
- Install: `pnpm install`
- Type/lint/test: `pnpm -w turbo run check-types && pnpm -w turbo run lint && pnpm -w turbo run test`
- Build libs: `pnpm -w build --filter @repo/i18n --filter @repo/ui`
- Build web: `pnpm -C apps/web build && pnpm -C apps/web preview`
- Perf audit: `pnpm performance-audit` (LHCI + bundle + perf tests)

**Notes**
- Keep PRs ≤400 LOC, single-purpose, and delete dead code alongside refactors.
- Do not introduce new UI kits; promote shared components to `@repo/ui`.
- Avoid raw color literals; use tokens via Tailwind v4 and `packages/ui/src/styles/*`.

**UI/UX Checklist (Pixel-Perfect)**
- Buttons: sizes/variants from `@repo/ui/Button.svelte`; 44px CTAs on mobile; loading states; disabled correctness.
- Forms: inputs/selects from `@repo/ui`; errors with `aria-*`; CSRF hidden fields; server-side validation.
- PDP: sticky buy CTA; LCP image optimized; condition/size/price visible; seller info accessible.
- Navigation: bottom nav on mobile; header actions reachable; search focus state and debounce.
- Performance: LCP ≤ 1.5s; defer non-critical; split i18n chunks; images optimized.
- Accessibility: axe passes; color contrast AA; keyboard complete.
