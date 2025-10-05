# Shared Package Dependencies

## Package Matrix
| Package | Purpose | Key Dependencies | Notes |
| --- | --- | --- | --- |
| `@repo/ui` | Design system + Svelte component library exported via `svelte-package`; includes tokens, primitives, and utility CSS.【F:packages/ui/package.json†L11-L88】 | `@melt-ui/svelte`, `bits-ui`, Tailwind utilities, workspace deps (`@repo/database`, `@repo/i18n`). | Contains service-like modules (`src/lib/services/CategoryNavigationService.ts`) that should live in core/domain layer; refactor to keep UI package pure.【F:packages/ui/src/lib/services/CategoryNavigationService.ts†L1-L74】 |
| `@repo/core` | Business logic + auth helpers + cookie utilities consumed by Svelte apps.【F:packages/core/package.json†L1-L62】【F:packages/core/src/auth/index.ts†L1-L122】【F:packages/core/src/cookies/index.ts†L1-L52】 | Supabase SSR client, `slugify`, `nanoid`, workspace database types. | Lacks dedicated services directory; opportunity to absorb app-specific services (stripe/email) per roadmap.【F:ROADMAP.md†L44-L58】 |
| `@repo/database` | Generated Supabase types and schema metadata distributed to apps/packages.【F:packages/database/package.json†L1-L34】 | TypeScript 5.8.2, ESLint config. | No runtime deps; ensure `tsc --build` output published before install. |
| `@repo/i18n` | Paraglide localization pipeline and compiled message bundles.【F:packages/i18n/package.json†L1-L40】 | `rimraf` for cleaning, workspace configs. | Build depends on Node 22; ensure CLI run before imports. |
| `@repo/testing` | Shared Vitest configurations and testing utilities.【F:packages/testing/package.json†L1-L36】 | `vitest`, `happy-dom`, TypeScript configs. | Expand to host Playwright config and Supabase fixtures to reduce duplication. |
| `@repo/eslint-config` | Shared ESLint flat config for monorepo.【F:packages/eslint-config/package.json†L1-L27】 | ESLint 9, Svelte plugin, Turbo config. | No tests; consider adding example project to verify config. |
| `@repo/typescript-config` | Shared tsconfig bases for packages/apps.【F:packages/typescript-config/package.json†L1-L18】 | None (meta package). | Document recommended extends usage in DEVELOPMENT.md. |

## Cross-Package Risks
- Peer dependency misalignment: `@repo/ui` expects `@stripe/stripe-js` and `@supabase/supabase-js` peers, meaning downstream apps must keep versions in sync; document in README to avoid runtime mismatches.【F:packages/ui/package.json†L52-L88】
- Lack of automated publishing: packages rely on workspace linking; if extracted later, ensure build artifacts exist (`dist/`).【F:packages/core/package.json†L30-L41】【F:packages/ui/package.json†L11-L24】
- Shared auth helpers assume SvelteKit runtime; admin/docs must respect handle sequence to avoid missing locals.【F:packages/core/src/auth/index.ts†L48-L112】【F:apps/web/src/lib/server/hooks.ts†L1-L96】

## Recommended Actions
1. Introduce `@repo/domain` or extend `@repo/core` to absorb app-specific services (stripe/email/jobs) per roadmap, reducing duplication under `apps/web/src/lib/services`.【F:ROADMAP.md†L44-L58】
2. Split `@repo/ui` into `@repo/ui-core` (tokens/primitives) and `@repo/ui-app` (composed views) to ease tree-shaking and avoid business logic leakage.【F:packages/ui/package.json†L11-L88】【F:packages/ui/src/lib/services/CategoryNavigationService.ts†L1-L74】
3. Add build verification pipeline that runs `pnpm --filter @repo/* build` to ensure artifacts exist before publish or deployment.【F:packages/core/package.json†L35-L41】【F:packages/ui/package.json†L11-L24】
