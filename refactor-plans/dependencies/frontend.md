# Frontend Dependencies

## Core Framework & Tooling
| Dependency | Version | Usage | Upgrade Notes |
| --- | --- | --- | --- |
| `@sveltejs/kit` | ^2.36.2 (web), ^2.25.1 (docs), ^2.22.0 (admin) | Primary application framework for all apps; powers routing, SSR hooks, and server actions.【F:apps/web/package.json†L6-L70】【F:apps/admin/package.json†L9-L41】【F:apps/docs/package.json†L9-L44】 | Versions diverge across apps; align to a single minor to avoid adapter mismatches and ensure consistent routing APIs. Verify breaking changes in kit 2.4x→2.5x before consolidating. |
| `svelte` | ^5.36.12 (web/docs), ^5.0.0 (admin) | Component runtime used across storefront, docs, and admin UI.【F:apps/web/package.json†L41-L69】【F:apps/admin/package.json†L20-L33】【F:apps/docs/package.json†L24-L44】 | Admin app still on baseline ^5.0.0; upgrade to 5.36.x to match rune behavior and avoid SSR mismatch bugs introduced by rune syntax evolution. Ensure `@repo/ui` peerDependency (^5.0.0) remains satisfied.【F:packages/ui/package.json†L52-L88】 |
| `vite` | ^7.1.2 (web), ^7.1.4 (ui), ^7.0.4 (admin), ^7.0.0 (docs) | Dev server and bundler for SvelteKit apps and packages.【F:apps/web/package.json†L41-L69】【F:packages/ui/package.json†L59-L88】【F:apps/admin/package.json†L9-L41】【F:apps/docs/package.json†L9-L44】 | Align versions to reduce plugin compatibility drift. Upgrade path to Vite 7.2+ requires verifying Tailwind 4 plugin compatibility. |
| `@tailwindcss/vite` & `tailwindcss` | Tailwind 4.1.12 across apps | Utility CSS pipeline for all apps; new Tailwind 4 plugin replaces PostCSS pipeline.【F:apps/web/package.json†L31-L65】【F:apps/admin/package.json†L20-L33】【F:apps/docs/package.json†L24-L44】 | Tailwind 4 requires migrating legacy CSS utilities; docs app currently failing imports per roadmap.【F:ROADMAP.md†L15-L40】 Add regression tests before upgrading beyond 4.1. |
| `@tailwindcss/forms`, `@tailwindcss/typography` | ^0.5.16 | Styling plugins for forms and rich text in all Svelte apps.【F:apps/web/package.json†L31-L33】【F:apps/admin/package.json†L25-L33】【F:apps/docs/package.json†L28-L40】 | Confirm plugin compatibility with Tailwind 4 (currently in compatibility mode). Future Tailwind 4 stable may deprecate plugin API. |
| `@lucide/svelte` | ^0.542.0 | Icon set for storefront components.【F:apps/web/package.json†L21-L39】 | Keep pinned; large major releases occasionally break tree-shaking. |

## Data & API Clients
| Dependency | Version | Usage | Upgrade Notes |
| --- | --- | --- | --- |
| `@supabase/supabase-js` | 2.51.0 (web), ^2.56.0 (admin/core/ui) | Storefront uses Supabase client for auth/session; other packages expect newer 2.56 APIs.【F:apps/web/package.json†L21-L39】【F:apps/admin/package.json†L35-L41】【F:packages/core/package.json†L42-L58】【F:packages/ui/package.json†L52-L88】 | Version drift can break shared helpers (e.g., typed responses). Upgrade web to ^2.56.0 after validating generated types and SSR auth flows.【F:apps/web/src/lib/auth/index.ts†L1-L120】 |
| `@supabase/ssr` | 0.7.0 | SSR client creation used by auth hooks and Supabase helpers.【F:apps/web/package.json†L21-L39】【F:packages/core/package.json†L42-L58】【F:apps/admin/package.json†L35-L41】 | Keep synchronized with supabase-js upgrade; confirm breaking changes in SSR API before bumping. |
| `stripe` & `@stripe/stripe-js` | 18.4.0 & ^7.8.0 | Server-side secret Stripe SDK and browser JS for checkout flows; server wrapper pins API version `2025-07-30.basil`.【F:apps/web/package.json†L21-L39】【F:apps/web/src/lib/stripe/server.ts†L1-L19】 | Stripe API version pinned in code; coordinate upgrades with backend webhooks and admin flows. Validate `@repo/ui` peer dependency on stripe-js.【F:packages/ui/package.json†L52-L88】 |
| `resend` | ^6.0.1 | Email delivery for transactional flows.【F:apps/web/package.json†L21-L39】 | Verify rate limits and API usage before bumping; consider centralizing in `@repo/core` per roadmap. |
| `browser-image-compression`, `sharp` | ^2.0.2 & ^0.34.3 | Client-side image compression and server-side image processing for uploads.【F:apps/web/package.json†L21-L39】 | `sharp` requires native build support; ensure Vercel runtime target remains compatible. Monitor for Node 22 support changes. |

## Observability & Security
| Dependency | Version | Usage | Upgrade Notes |
| --- | --- | --- | --- |
| `@sentry/sveltekit`, `@sentry/vite-plugin` | ^10.5.0, ^4.1.1 | Error monitoring with centralized config for server/client instrumentation.【F:apps/web/package.json†L21-L59】【F:apps/web/src/lib/server/sentry-config.ts†L1-L140】 | Validate DSN optionality; config currently disables logging when DSN missing. Review new Sentry SDK 8 breaking changes before upgrade. |
| `sveltekit-rate-limiter` | ^0.7.0 | Server-side rate limiter for auth/API/upload/message flows; secret fallback warns in roadmap.【F:apps/web/package.json†L21-L39】【F:apps/web/src/lib/server/rate-limiter.ts†L1-L53】 | Production depends on `RATE_LIMIT_SECRET`; add env validation and secret rotation. |
| `@vercel/analytics` | ^1.5.0 | Client metrics for storefront.【F:apps/web/package.json†L21-L39】 | Ensure Vercel analytics script allowed in CSP headers (currently not whitelisted).【F:vercel.json†L1-L83】 |

## Shared UI & Design System
| Dependency | Version | Usage | Upgrade Notes |
| --- | --- | --- | --- |
| `@repo/ui` (workspace) | Monorepo package | Shared Svelte components, tokens, and even navigation services consumed across apps.【F:apps/web/package.json†L21-L39】【F:packages/ui/package.json†L11-L88】【F:packages/ui/src/lib/services/CategoryNavigationService.ts†L1-L99】 | Contains non-UI services (e.g., category navigation); refactor to keep design system pure per roadmap. Requires Svelte 5 peer alignment before publishing. |
| `@melt-ui/svelte`, `bits-ui`, `tailwind-variants`, `tailwind-merge` | ^0.86.6, ^2.9.6, ^3.1.0, ^3.3.1 | Provide primitives and utility-driven component styling for the design system.【F:packages/ui/package.json†L59-L88】 | Keep versions pinned; verify compatibility when upgrading Tailwind or Svelte. |

## Known Risks & Follow-ups
- Tailwind 4 migration issues block docs app builds; resolve failing imports before further upgrades.【F:ROADMAP.md†L15-L40】
- RATE_LIMIT_SECRET fallback weakens auth protection; enforce env configuration and centralize secrets.【F:apps/web/src/lib/server/rate-limiter.ts†L1-L53】
- Supabase SDK drift between web and shared packages can cause type mismatches in `safeGetSession`; align versions and regenerate types.【F:apps/web/src/lib/auth/hooks.ts†L1-L56】【F:packages/core/package.json†L42-L58】
