# Standards & Tech Stack (Primary Source)

Authoritative standards and engineering practices for Claude-code. Read this first for any implementation or refactor.

- Tech stack: SvelteKit 2, Svelte 5 (runes), TypeScript strict, Tailwind v4 (tokens), Supabase, Stripe, Paraglide i18n, Playwright.
- Core principles: server-first, mobile-first, a11y by default, no visual bloat, token-based styling.

## What To Load For Context

- High level: this file + links below.
- Deep dives: open linked playbooks only when needed for the active task.

## Canonical References

- Architecture: docs/10-ARCHITECTURE.md, docs/PROJECT_STRUCTURE.md
- Standards: docs/30-STANDARDS.md, docs/CONTRIBUTING.md
- Operations: docs/40-OPERATIONS.md
- UI system: docs/UI_LIBRARY.md, docs/MELT_UI_MIGRATION.md, docs/MELT_UI_FIX_PLAN.md
- Tailwind: docs/TAILWIND_V4_FIX_PLAN.md, docs/playbooks/tailwindcss-v4.md
- SvelteKit/Svelte: docs/playbooks/sveltekit2.md, docs/playbooks/svelte5.md
- i18n (Paraglide): docs/playbooks/paraglide.md; packages/i18n/
- Decisions: docs/adr/0001-ui-source-of-truth.md

## Non‑Negotiables (Enforced)

- TypeScript: no `any` in new code; `satisfies` where applicable
- Svelte 5 runes: $state/$derived/$effect; SSR first
- Styling: Tailwind v4 utilities; tokens from app.css; no raw color literals
- A11y: ARIA roles, keyboard nav, focus outlines; 44px primary, 36–40px standard tap targets
- Security: POST + origin checks; RLS; rate limits; service role never in client
- Performance: coalesced queries, lazy images, preload wisely; p75 LCP ≤ 1.5s

## Code Organization

- Shared UI only in packages/ui; promote components used ≥2 places
- No duplicate UI in apps/web; prefer wrappers over new libs
- Server code in $lib/server; API helpers for auth/validation/rate‑limit

## Testing

- Run types, lint, tests locally for changed packages/apps
- Playwright e2e for critical flows (/auth, /sell, payments, orders)

---

Keep this file concise. Spread details into linked docs and playbooks.
