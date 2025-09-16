# CLAUDE.md — Development Rules

Mobile-first C2C marketplace. Svelte 5 + SvelteKit 2 + Tailwind v4 + Supabase + Stripe.

## Tech Stack
- **Framework**: SvelteKit 2, Svelte 5 (runes)
- **Styling**: Tailwind v4 (tokens + semantic utilities)
- **Backend**: Supabase (Auth, DB, RLS, Storage)
- **Payments**: Stripe (server-only)
- **i18n**: Paraglide (`bg` default, `/uk` → `en`)
- **Build**: Turborepo + pnpm workspaces
- **Testing**: Vitest + Playwright + TypeScript strict

## Project Structure
```
apps/web/          # SvelteKit app
packages/ui/       # UI source of truth
packages/database/ # Supabase schemas
packages/i18n/     # Paraglide messages
```

## Import Rules
- UI: `@repo/ui` named exports ONLY
- Deep imports: `@repo/ui/{types,primitives,styles/*}`
- Rule of 2: 2+ uses → promote to `@repo/ui`
- NO app-level component duplicates

## Svelte 5 Patterns
```svelte
<script lang="ts">
  let count = $state(0)
  let doubled = $derived(count * 2)
  let { label = 'Click' }: { label?: string } = $props()
  let value = $bindable('')
</script>
<button onclick={() => count++} class="btn-primary">{label}</button>
```

## Development Commands
```bash
pnpm check-types    # TypeScript validation
pnpm lint          # ESLint check
pnpm test          # Vitest + Playwright
pnpm build         # Production build
pnpm dev           # Development server
```

## Coding Standards
- TypeScript strict mode, 0 errors
- Svelte 5 runes for all state
- Functions over classes (except state machines)
- Prefer editing existing files over creating new ones
- SSR-first, client hydration sparingly

## Tailwind v4 Rules
- Use semantic tokens: `bg-[color:var(--primary)]`
- NO raw colors: `#000`, `rgb()`, `oklch()`
- Touch targets: 44px primary, 36-40px standard
- Load: `@import '@repo/ui/styles/{tokens,semantic}.css'`

## Supabase Rules
- Auth: `locals.safeGetSession()` (SSR), `onAuthStateChange` (client)
- RLS: ALWAYS enabled, indexed on `user_id` for performance
- Service keys: server-only, never in client code
- Mutations: via SvelteKit actions or POST endpoints

## Performance Requirements
- Mobile LCP ≤ 1.5s p75
- TypeScript 0 errors
- ESLint clean
- Tests passing

## Anti-Patterns (DO NOT)
- Import from `apps/web/src/lib/components/*` if equivalent exists in `@repo/ui`
- Use `any` type in new code
- Raw color literals in components
- Client-side service role keys
- Skip RLS on public schema tables
- Create new files when editing existing ones works