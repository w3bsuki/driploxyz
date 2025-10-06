# Tooling & Infrastructure Dependencies

## Monorepo & Build Orchestration
| Tool | Version | Role | Notes |
| --- | --- | --- | --- |
| pnpm | 8.15.6 (workspace manager) | Handles workspace linking and dependency installs across apps/packages.【F:package.json†L1-L24】【F:pnpm-workspace.yaml†L1-L2】 | Ensure CI uses matching pnpm to avoid lockfile churn. |
| Turborepo (`turbo`) | 2.5.4 | Orchestrates build, lint, test, and type-check pipelines with shared cache and env pass-through.【F:package.json†L8-L23】【F:turbo.json†L1-L61】 | Turbo tasks reference many env vars; add `.env.example` coverage to prevent missing secrets during CI. |
| Node | >=22.12 <23 | Required runtime for all packages and apps.【F:package.json†L4-L7】【F:apps/web/package.json†L71-L73】 | Node 22 is experimental; evaluate downgrading to current LTS (20/22 depending on release) or confirm hosting provider support. |

## Linting, Formatting, and Types
| Tool | Version | Scope | Notes |
| --- | --- | --- | --- |
| ESLint (`@repo/eslint-config`) | workspace | Shared flat config consumed by apps and packages.【F:packages/eslint-config/package.json†L1-L27】 | Config has no tests; add snapshot tests or lint fixtures when customizing rules. |
| TypeScript (`@repo/typescript-config`, `typescript` 5.8.2) | workspace | Shared tsconfig base + compiler for all packages.【F:packages/typescript-config/package.json†L1-L18】【F:package.json†L16-L23】 | TypeScript strict mode not fully enabled per roadmap backlog; plan incremental adoption.【F:ROADMAP.md†L61-L83】 |
| Prettier 3.6.0 | repo-wide formatting | Root script formats TS/TSX/MD files.【F:package.json†L8-L20】 | Ensure Prettier plugins (Svelte) pinned consistently across apps.【F:apps/web/package.json†L41-L69】 |

## Testing & Quality Gates
| Tool | Version | Usage | Notes |
| --- | --- | --- | --- |
| Vitest 3.2.x | Unit testing across apps/packages; shared configs in `@repo/testing`.【F:apps/web/package.json†L12-L69】【F:packages/testing/package.json†L1-L36】 | Remove `--passWithNoTests` flags per roadmap and enforce coverage thresholds from TESTING.md.【F:TESTING.md†L21-L40】【F:ROADMAP.md†L40-L59】 |
| Playwright 1.55.0 | E2E testing for web and docs apps; integrated into turbo test pipeline.【F:apps/web/package.json†L12-L45】【F:apps/docs/package.json†L18-L44】【F:turbo.json†L37-L52】 | Add CI containers with browsers preinstalled; consider using `@playwright/test` across root for shared config. |
| Lighthouse CI (`@lhci/cli`) | ^0.12.0 | Performance audits run via root devDependency.【F:package.json†L16-L23】 | Integrate into CI once storefront stabilizes; ensure tokens available for GitHub checks. |

## Deployment & Hosting
| Component | Details | Notes |
| --- | --- | --- |
| Vercel (`vercel.json`) | Configures security headers, CSP, and locale-specific headers for regional hostnames.【F:vercel.json†L1-L128】 | Add analytics domains to CSP and confirm locale headers align with i18n detection logic. |
| Supabase CLI | implied via migrations | Manage database migrations and edge functions; ensure CLI version pinned in CI (not tracked currently). | Document CLI version in DEVELOPMENT.md for reproducibility. |

## Observability & Analytics
| Tool | Version | Notes |
| --- | --- | --- |
| Sentry (`@sentry/sveltekit`) | ^10.5.0 | Already configured with custom filters; add DSN validation to pipeline.【F:apps/web/package.json†L21-L59】【F:apps/web/src/lib/server/sentry-config.ts†L1-L140】 |
| Web Vitals (`web-vitals`) | ^3.5.0 | Root devDependency for custom vitals reporting or LHCI assertions.【F:package.json†L16-L23】 |

## Immediate Actions
1. Establish CI matrix for Node 22 + pnpm 8.15.6 to avoid runtime drift.【F:package.json†L4-L24】
2. Add automation to check env var coverage for turbo tasks to prevent missing secret failures.【F:turbo.json†L5-L61】
3. Create shared Playwright configuration in `@repo/testing` for reuse across apps, removing duplicated devDeps.【F:packages/testing/package.json†L1-L36】【F:apps/web/package.json†L6-L45】
