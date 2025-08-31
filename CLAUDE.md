# CLAUDE.md — Operating Rules for Claude‑code

Mobile‑first C2C marketplace. Act as a senior SvelteKit engineer. Follow these rules exactly. Keep diffs small, plans clear, and never introduce bloat.

## Ground Truth (Read First, Always)

- Context: `docs/END_GOAL.md`, `docs/00-PROJECT.md`
- Execution plan: `docs/CODEX_TASKLIST.md` (update as you work)
- Architecture/UI/Ops: `docs/10-ARCHITECTURE.md`, `docs/20-UI-UX.md`, `docs/30-STANDARDS.md`, `docs/40-OPERATIONS.md`
- UI migration: `docs/MELT_UI_MIGRATION.md`, `docs/REPO_UI_CLEANUP.md`
- V1 scope: `docs/V1_driplo.md`

If a conflict arises, align with these docs. Do not guess—ask or log an explicit TODO with rationale in CODEX_TASKLIST.

## Mode of Work

- Plan → Implement → Validate → Update tasklist.
- Before coding: confirm constraints, search repo for patterns, prefer editing over adding.
- Keep PRs ≤ 400 LOC; single responsibility; use conventional commits.
- Never rush. If unsure, pause and document assumptions in CODEX_TASKLIST.

## Single‑Task Mode & Protocol

- Single task only per run. Do not start another until the current one is complete and documented.
- Current task source (in order):
  1) `docs/RUNBOOK.md` → “Current Task”
  2) If empty, follow README → Execution Workflow and pick the next playbook task
- Protocol per task:
  1) Think: write a 2–4 line plan in `docs/CODEX_TASKLIST.md` under In‑Progress
  2) Implement: minimal diffs, keep scope tight, reference playbook steps
  3) Validate: types, lint, tests, build, quick visual
  4) Document: tick checkboxes in playbook, add a 2–4 line summary to `docs/CONTEXT.md` and update In‑Progress to Done

## Tech Stack Primer (Essentials)

- Svelte 5 (runes) + SvelteKit 2, TypeScript strict, Tailwind v4, Supabase, Stripe, Paraglide.

Svelte 5 runes and events
```svelte
<script lang="ts">
  let count = $state(0)
  let doubled = $derived(count * 2)
  interface Props { label?: string }
  let { label = 'Add' }: Props = $props()
  let value = $bindable('')
</script>
<button class="btn btn-primary" onclick={() => count++}>{label} {count}</button>
<input class="input" bind:value />
```

Actions/snippets (Melt)
```svelte
<!-- use:trigger etc. from createDialog/createMenu -->
<button use:trigger class="btn">{#snippet trigger()}Open{/snippet}</button>
```

SvelteKit 2 server‑first
```ts
// +page.server.ts
import type { PageServerLoad, Actions } from './$types'
export const load = (async ({ locals }) => {
  const { user } = await locals.safeGetSession()
  return { user }
}) satisfies PageServerLoad
export const actions: Actions = { save: async (e) => {/* zod validate; mutate */} }
```

Tailwind v4 + tokens
```css
/* Prefer semantic utilities backed by tokens */
.btn { @apply h-[--touch-standard] rounded-lg bg-[color:var(--primary)] text-[color:var(--primary-fg)]; }
.input { @apply h-[--touch-standard] w-full rounded-lg border border-[color:var(--gray-200)]; }
/* Do not use raw hex/rgb/oklch in app code */
```

Supabase auth (SSR + client)
```ts
// SSR: cookie‑bridged client via locals; Supabase manages JWT/cookies
const { session, user } = await locals.safeGetSession()
// Client: subscribe in +layout
supabase.auth.onAuthStateChange(() => {/* refresh */})
// Service role: server‑only in $lib/server/supabase.server.ts
```

Paraglide i18n
```ts
import { setLocale } from '@repo/i18n'
setLocale('bg') // default; '/uk' maps to 'en'
```

Stripe (server‑only)
```ts
// Create intents server‑side; use idempotency; verify signed webhooks; update orders
```

## Non‑Negotiables

- TypeScript strict; 0 errors. Svelte 5 runes for state. No `any` in new code.
- Tailwind v4 + tokens. No raw color literals in app code; use token utilities.
- Accessibility: keyboard/focus/ARIA by default. Tap targets: 44px primary, 36–40px standard.
- Security: Mutations via actions or origin‑checked POST; rate‑limited. Service role keys server‑only. RLS enforced.
- Performance: Prefer SSR loads; coalesce queries; lazy images; mobile LCP ≤ 1.5s p75.

## UI Rules

- Shared UI lives in `@repo/ui`. Do not re‑create components in `apps/web`.
- Use Melt UI wrappers from `@repo/ui` (Dialog, Menu, Select, Tabs, Tooltip, Toast). No third‑party visual kits for core surfaces.
- Ensure `semantic.css` is loaded (via UI barrel or app.css). Replace `outline-hidden` with `outline-none`.
- “Rule of 2”: if used in 2+ places, promote to `@repo/ui`; then delete the app‑local duplicate.

## Auth Rules (Supabase)

- SSR: use `locals.safeGetSession()`; client: `onAuthStateChange`.
- We do not handle raw JWTs; Supabase manages tokens/cookies.
- Logout must be POST‑only with origin checks.
- Onboarding only updates profiles (created by DB triggers). No duplicate inserts.

## API/Server Rules

- Add `lib/server/api.ts` helpers: withAuth, withValidation(zod), rateLimit, respond(json).
- Validate inputs at boundaries; map errors to user‑safe messages.
- Stripe: server‑only; idempotency keys; signed webhooks; update orders on events.

## i18n/SEO Rules

- Default locale `bg` (no prefix). English via `/uk` → internal `en`.
- Single `reroute` impl exported on server and client.
- Canonical + hreflang on key pages; use Paraglide messages for all text.

## Testing & Gates

- Run locally before proposing merge:
  - `pnpm -w turbo run check-types`
  - `pnpm -w turbo run lint`
  - `pnpm -w turbo run test`
  - Build affected app(s)
- Add or update tests for auth, /sell, payments, orders when modifying.
- Keep Lighthouse and a11y budgets in mind; add a quick note in tasklist post‑validation.

## Commits & PRs

- Conventional commits: feat/fix/chore/docs/refactor/perf/test
- Group related changes only; no drive‑by edits.
- Remove dead code and backups; no TODO left in production code.
- If adding a dependency, justify in PR summary (why, size, alternatives).

## Do/Don’t

- Do: read docs, update CODEX_TASKLIST, propose a short plan, implement narrowly, validate, summarize.
- Don’t: add visual UI kits, duplicate components in app, expose env in client, bypass RLS, or ship untyped/unaudited code.

## Quick Checklists

- UI change
  - [ ] Uses `@repo/ui` (no app duplicate)
  - [ ] Melt wrapper with a11y + tokens
  - [ ] 44px/36px tap targets; `outline-none`
  - [ ] No raw color literals

- Server/API change
  - [ ] Validated with zod; rate‑limited; origin‑checked
  - [ ] No service role in client; env via `$env/dynamic/*`
  - [ ] Types asserted with `satisfies`

- Auth flow change
  - [ ] SSR via `safeGetSession`; client via listener
  - [ ] Logout POST‑only; resend verification rate‑limited
  - [ ] Onboarding updates profile only

- Payments/orders
  - [ ] Intent creation server‑only; secrets safe
  - [ ] Webhook signed + idempotent; order status updated

## Project Snapshot

- Product: Driplo — mobile‑first C2C marketplace (SvelteKit 2, Svelte 5, Tailwind v4, Supabase, Stripe, Paraglide)
- Release target: V1 per `docs/V1_driplo.md`
- Quality bars: 0 TS errors, mobile p75 ≥ 90, LCP ≤ 1.5s, a11y AA

Adhere to these rules. If a rule blocks progress, propose the smallest exception in CODEX_TASKLIST with rationale and rollback.
