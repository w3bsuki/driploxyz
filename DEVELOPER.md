# Developer Guide

Complete development guide for Driplo. Everything you need to build, test, and deploy.

## Quick Start

```bash
# Setup
pnpm install
pnpm -w turbo run dev

# Quality checks
pnpm -w turbo run check-types  # Zero TypeScript errors
pnpm -w turbo run lint         # Zero ESLint errors
pnpm -w turbo run test         # All tests pass
```

## Tech Stack

- **App**: SvelteKit 2 + Svelte 5 (runes)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + CSS variables
- **Backend**: Supabase (Postgres + Auth + Storage + Edge Functions)
- **i18n**: Paraglide (typed messages, build-time extraction)
- **Monorepo**: Turborepo + pnpm workspaces

### Monorepo Structure

```
apps/
  web/              # Primary SvelteKit app
  admin/            # Admin interface
  docs/             # Documentation site
packages/
  ui/               # Shared UI components (@repo/ui)
  utils/            # Shared utilities (@repo/utils)
  database/         # Database types and migrations (@repo/database)
  i18n/             # Paraglide i18n project (@repo/i18n)
```

## Architecture

### Folder Structure

```
src/
  routes/
    (lang)/         # i18n route group, e.g. [en]/..., [bg]/...
      +layout.svelte
      +layout.server.ts
      +page.svelte
      +page.ts      # server/client load (prefer server)
  lib/
    components/
      ui/           # primitives: Button, Input, etc.
      composite/    # composed widgets: DialogForm, DataTable
    features/
      <feature>/    # cohesive feature modules (UI + server)
        server/     # feature server code (db access)
        components/ # feature-specific components
    server/         # app-wide server utilities only (no browser)
      supabase.ts   # server client factory
      auth.ts       # auth helpers/guards
    utils/          # pure utilities
    types/          # shared types
hooks.server.ts     # handle, handleError
params/             # route params (e.g., lang)
app.d.ts            # App.Locals, PageData, ambient types
```

### Guidelines

- Keep database and external API calls in server-only modules under `src/lib/server` or `src/lib/features/*/server`
- UI components never import server code
- Routes call server functions via `+page.server.ts`/`+layout.server.ts` or `+server.ts` actions/handlers

### State Management (Svelte 5)

- **Local component state**: Use Svelte 5 runes for clarity and performance
- **Cross-tree state**: Use `setContext/getContext` for scoped sharing
- **App-wide reactive values**: Use `svelte/store` (`readable/derived`) with typed interfaces
- **Avoid global mutable state** unless strictly necessary

### Data Flow

- Route server loads (`+page.server.ts`, `+layout.server.ts`) fetch data from server modules and return typed `PageData` via `satisfies`
- Mutations happen via `+page.server.ts` actions or route `+server.ts` endpoints
- Never mutate from the client without a server action
- External webhooks live in `src/routes/api/*/+server.ts` and call isolated service functions

## Code Standards

### TypeScript & Svelte

- `tsconfig` strict mode; no `any` in new code
- Components in PascalCase; files end with `.svelte` / `.ts`
- Use `$lib` alias for imports; avoid deep relative paths
- Svelte 5: use runes for local state; prefer context over global stores

### Import Hierarchy

```ts
// ✅ CORRECT: Workspace packages first
import { Button, Input } from '@repo/ui'
import { formatCurrency } from '@repo/utils'

// ✅ CORRECT: SvelteKit aliases
import { supabase } from '$lib/supabase'

// ❌ NEVER: Cross-workspace relative imports
// import { Button } from '../../../packages/ui/src/lib/Button.svelte'
```

### UI Component Rules ("Rule of 2")

- **Source of truth**: All shared components in `packages/ui/src/lib/*`
- **Promotion rule**: If used 2+ places → promote to `@repo/ui` → delete duplicates
- **Import pattern**: `import { Component } from '@repo/ui'`

### Project Structure

- Features under `src/lib/features/<feature>` with `server/` and `components/`
- Shared UI under `src/lib/components/ui` and `composite`
- Server utilities live in `src/lib/server` and are not imported by client code
- Monorepo packages: prefer promoting reusable app components/utilities into `@repo/ui` or `@repo/utils` when used 2+ times

## Testing

- **Unit**: Vitest for utilities and critical logic
- **Component**: Svelte Testing Library for interactive components
- **E2E**: Playwright for key user journeys; run on PR and post-deploy
- **Accessibility**: run aXe/pa11y checks on core routes

## Integration Patterns

### Supabase

- Use cookie-bound clients for SSR and never expose the service key to the browser
- RLS enabled on all tables; policies reviewed in code
- Generate types for Postgres and import them in server modules
- Prefer Postgres functions/RPC for complex operations

### Internationalization (Paraglide)

- All user-facing strings come from Paraglide messages in `@repo/i18n`
- URL strategy: default locale `bg` without prefix; English at `/uk/...` (alias to internal `en`)
- Export `reroute` on both server and client hooks to strip `/uk|/bg` during internal routing
- Persist locale only with functional-consent cookie; avoid writing cookies without consent
- No hardcoded text in components; import messages in components or pass via props

## API Endpoints

- Use a thin `lib/server/api.ts` helper to compose: auth guard, zod validation, rate limiting, and typed JSON responses
- Endpoints focus on business logic; validation and error mapping centralized

## Security & Environment

- No secrets in repo; use `.env.local` locally and platform secrets in deploy
- Never expose service keys to the browser; server-only modules read sensitive env
- Never import `process.env.*` in client bundles
- Validate all inputs at the server boundary; use schemas
- Apply least-privilege keys; rotate and scope secrets

## Error Handling

- Throw typed domain errors in server modules; convert to user messages at the edge
- Log with context (user id, route, correlation id) without PII
- Centralize `handleError` in `hooks.server.ts` to log structured errors
- User-visible errors use friendly messages; internal details are never leaked

## Performance

- Prefer server load over client fetch; stream where beneficial
- Coalesce data fetching per route; avoid waterfalls
- Set appropriate cache headers on `+server.ts` for public assets/data
- Use image optimization and responsive sizes; avoid layout shift

## Git & Reviews

- Branch naming: `feat/*`, `fix/*`, `chore/*`, `docs/*`, `refactor/*`
- Conventional Commits; squash on merge; keep PRs ≤ 400 lines diff where possible
- PR Checklist: types ok, tests added/updated, a11y, Lighthouse, screenshots

## Dependencies

- Prefer standard libs over adding packages; justify any new dependency in PR
- Keep the surface area small; remove unused packages regularly

## Linting & Formatting

- ESLint with `eslint-plugin-svelte` and TypeScript rules
- Prettier with Svelte plugin; no rule conflicts with ESLint
- CI enforces lint + typecheck on PRs