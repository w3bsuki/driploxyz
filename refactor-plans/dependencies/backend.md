# Backend & Data Dependencies

## Supabase Platform
| Component | Version / Config | Usage | Risks / Upgrade Notes |
| --- | --- | --- | --- |
| `supabase/config.toml` | Postgres 15, API port 54321, auth templates wired to web app | Defines local development stack including Studio, Inbucket, Storage, and custom auth email templates.【F:supabase/config.toml†L1-L53】 | Keep templates synced with Resend flows; ensure local ports don't conflict with Docker defaults when running alongside other services. |
| SQL migrations (`supabase/migrations/*`) | 2025 series | Schema evolution for marketplace (slugs, messaging RPCs, indexes).【F:supabase/migrations/20250901_backfill_product_slugs.sql†L1-L120】【F:supabase/migrations/20250910_add_messaging_rpcs.sql†L1-L120】 | Some migrations contain conditional statements that may fail silently; add verification scripts after applying. Backfill functions rely on `gen_random_uuid` extension—ensure enabled on fresh instances. |
| Edge Function `send-message` | Supabase Functions v2 (Deno) | Handles authenticated messaging, uses service role bypass and in-memory rate limiting.【F:supabase/functions/send-message/index.ts†L1-L200】 | In-memory limiter resets per instance and isn't multi-region safe; migrate to persistent store (Redis/KV). Service-role usage needs additional auditing/logging controls. |

## Shared Service Layer
| Package | Version | Purpose | Risks / Upgrade Notes |
| --- | --- | --- | --- |
| `@repo/core` | workspace | Centralizes auth helpers, cookie management, slug utilities, service clients.【F:packages/core/package.json†L1-L62】【F:packages/core/src/auth/index.ts†L1-L122】【F:packages/core/src/cookies/index.ts†L1-L52】 | Depends on Supabase 2.56 APIs while storefront uses 2.51, causing potential type drift. Auth helpers cache sessions in `locals`, so ensure consistent usage across apps. |
| `@repo/database` | workspace | Generated Supabase types consumed across apps and packages.【F:packages/database/package.json†L1-L34】 | No automated tests; rely on manual regeneration. Add CI check to compare migrations vs generated types. |
| `@repo/i18n` | workspace | Paraglide localization bundles and scripts for generating exports.【F:packages/i18n/package.json†L1-L40】 | No runtime deps or tests; ensure message compilation occurs before builds. Consider publishing compiled artifacts to avoid runtime generation. |

## Server Utilities
| Component | Details | Risks / Upgrade Notes |
| --- | --- | --- |
| Supabase server client (`apps/web/src/lib/supabase/server.ts`) | Creates SSR client using anon key, enforces env presence.【F:apps/web/src/lib/supabase/server.ts†L1-L29】 | Throws if env missing—ensure build pipeline sets `PUBLIC_SUPABASE_*` before SSR. |
| Service role client (`apps/web/src/lib/server/supabase.server.ts`) | Instantiates service role client at module scope for privileged operations.【F:apps/web/src/lib/server/supabase.server.ts†L1-L32】 | Creating client at import time can throw during cold starts if env missing; wrap in lazy factory and audit service-role usage for least privilege. |
| Auth hooks (`apps/web/src/lib/auth/hooks.ts`) | Creates Supabase client per request, caches session access, guards protected routes.【F:apps/web/src/lib/auth/hooks.ts†L1-L72】 | `safeGetSession` fallback uses `any` when setup fails; add structured error reporting and tighten typing (mentioned in roadmap). |
| Rate limiter (`apps/web/src/lib/server/rate-limiter.ts`) | Configures multiple limiters using `sveltekit-rate-limiter`, with fallback secret.【F:apps/web/src/lib/server/rate-limiter.ts†L1-L53】 | Missing `RATE_LIMIT_SECRET` reduces entropy; enforce configuration and add metrics to monitor throttle events. |

## Third-Party Integrations
| Service | SDK | Usage | Notes |
| --- | --- | --- | --- |
| Stripe | `stripe` 18.4.0 | Server-side checkout and billing flows; API version pinned in code.【F:apps/web/package.json†L21-L39】【F:apps/web/src/lib/stripe/server.ts†L1-L19】 | Confirm webhook handlers align with pinned API version; plan for upgrade before API deprecation dates. |
| Resend | `resend` ^6.0.1 | Transactional email sending from storefront flows.【F:apps/web/package.json†L21-L39】 | Add retry/backoff wrappers in `@repo/core` to centralize usage; monitor API quotas. |
| Vercel Analytics | `@vercel/analytics` | Client-side metrics; requires CSP adjustments.【F:apps/web/package.json†L21-L39】【F:vercel.json†L1-L83】 | Add analytics domains to CSP to avoid blocked requests. |

## Observability & Error Handling
- Sentry config ensures DSNs optional and filters sensitive errors before sending, but initialization failures are silently swallowed; emit metrics when instrumentation disabled.【F:apps/web/src/lib/server/sentry-config.ts†L1-L140】
- Logging utility provides structured logs with localStorage toggles; ensure server logs integrate with centralized logging on Vercel or alternative hosting.【F:apps/web/src/lib/utils/log.ts†L1-L140】

## Immediate Follow-ups
1. Align Supabase SDK versions across monorepo and regenerate types to avoid auth helper drift.【F:packages/core/package.json†L42-L58】【F:apps/web/package.json†L21-L39】
2. Replace in-memory rate limiters (edge function and server) with persistent stores or hashed secrets before production launch.【F:supabase/functions/send-message/index.ts†L1-L200】【F:apps/web/src/lib/server/rate-limiter.ts†L1-L53】
3. Wrap service-role client creation in try/catch with lazy initialization to prevent crash loops when env vars missing at build time.【F:apps/web/src/lib/server/supabase.server.ts†L1-L32】
