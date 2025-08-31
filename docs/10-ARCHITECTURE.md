# Architecture

This document explains how the app is structured and how data flows through the system. It encodes our best practices for SvelteKit 2, Svelte 5, TypeScript, Tailwind, Supabase, and Paraglide.

## 1) Tech Stack (authoritative)

- App: SvelteKit 2 + Svelte 5 (runes)
- Language: TypeScript (strict)
- Styling: Tailwind CSS v4 + CSS variables for tokens
- Backend: Supabase (Postgres + Auth + Storage + Edge Functions)
- i18n: Paraglide (typed messages, build‑time extraction)

Version pins live in `package.json` and should be kept current against the above.

### Project‑Specific Notes

- Monorepo: `apps/web` (primary), `apps/admin`, shared packages `@repo/ui`, `@repo/i18n`, `@repo/database`.
- Locales: `bg` (default, no prefix), `en` (path alias `/uk`). Paraglide project in `packages/i18n` with Vite plugin compile.
- Hosting: Vercel; redirects configured in `vercel.json` for `bg.driplo.xyz`, `uk.driplo.xyz`, `en.driplo.xyz`.

## 2) Layering and Folders

```
src/
  routes/
    (lang)/                # i18n route group, e.g. [en]/..., [de]/...
      +layout.svelte
      +layout.server.ts
      +page.svelte
      +page.ts            # server/client load (prefer server)
  lib/
    components/
      ui/                 # primitives: Button, Input, etc.
      composite/          # composed widgets: DialogForm, DataTable
    features/
      <feature>/          # cohesive feature modules (UI + server)
        server/           # feature server code (db access)
        components/       # feature‑specific components
    server/               # app‑wide server utilities only (no browser)
      supabase.ts         # server client factory
      auth.ts             # auth helpers/guards
    utils/                # pure utilities
    types/                # shared types
hooks.server.ts           # handle, handleError
params/                   # route params (e.g., lang)
app.d.ts                  # App.Locals, PageData, ambient types
```

Guidelines:
- Keep database and external API calls in server‑only modules under `src/lib/server` or `src/lib/features/*/server`.
- UI components never import server code.
- Routes call server functions via `+page.server.ts`/`+layout.server.ts` or `+server.ts` actions/handlers.

## 3) State Management (Svelte 5)

- Local component state: prefer Svelte 5 runes for clarity and performance.
- Cross‑tree state: use `setContext/getContext` for scoped sharing.
- App‑wide reactive values: use `svelte/store` (`readable/derived`) with typed interfaces.
- Avoid global mutable state unless strictly necessary.

## 4) Data Flow and Contracts

- Route server loads (`+page.server.ts`, `+layout.server.ts`) fetch data from server modules and return typed `PageData` via `satisfies`.
- Mutations happen via `+page.server.ts` actions or route `+server.ts` endpoints. Never mutate from the client without a server action.
- External webhooks live in `src/routes/api/*/+server.ts` and call isolated service functions.

Example skeleton:

```ts
// src/lib/server/supabase.ts
import { createClient } from '@supabase/supabase-js'
export const supabaseAdmin = () =>
  createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false }
  })

// src/lib/features/users/server/queries.ts
import type { SupabaseClient } from '@supabase/supabase-js'
export async function getCurrentUser(sb: SupabaseClient, id: string) {
  return sb.from('users').select('*').eq('id', id).single()
}

// src/routes/(lang)/account/+page.server.ts
import type { PageServerLoad, Actions } from './$types'
import { getCurrentUser } from '$lib/features/users/server/queries'
export const load = (async (event) => {
  const { session, supabase } = event.locals
  if (!session) return { user: null }
  const { data: user } = await getCurrentUser(supabase, session.user.id)
  return { user }
}) satisfies PageServerLoad

export const actions: Actions = {
  update: async (event) => { /* mutate via server */ }
}
```

## 5) Supabase Integration

- Use cookie‑bound clients for SSR (helpers package or factory) and never expose the service key to the browser.
- RLS enabled on all tables; policies reviewed in code (`SUPABASE_POLICIES.sql`).
- Generate types for Postgres and import them in server modules to ensure query correctness.
- Prefer Postgres functions/RPC for complex operations to keep policies enforceable and fast.

## 6) Internationalization (Paraglide)

- All user‑facing strings come from Paraglide messages in `@repo/i18n`.
- URL strategy: default locale `bg` without prefix; English at `/uk/...` (alias to internal `en`).
- Export `reroute` on both server and client hooks to strip `/uk|/bg` during internal routing; set locale in `setupI18n`.
- Persist locale only with functional‑consent cookie; avoid writing cookies without consent.
- No hardcoded text in components; import messages in components or pass via props.

Note: Align `setupI18n` default handling to use `bg` as the default sentinel (code currently uses `en` as a sentinel in some branches).

## 7) Error Handling & Observability

- Centralize `handleError` in `hooks.server.ts` to log structured errors.
- User‑visible errors use friendly messages; internal details are never leaked.
- Add breadcrumb logging around critical actions (auth, payments, data export).

## 8) Performance Practices

- Prefer server load over client fetch; stream where beneficial.
- Coalesce data fetching per route; avoid waterfalls.
- Set appropriate cache headers on `+server.ts` for public assets/data.
- Use image optimization and responsive sizes; avoid layout shift.

## 9) Security Practices

- Never import `process.env.*` in client bundles.
- Validate all inputs at the server boundary; use schemas.
- Apply least‑privilege keys; rotate and scope secrets.
