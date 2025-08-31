# Supabase Playbook

Best practices
- SSR auth via `@supabase/ssr` cookie‑bridged client; use `locals.safeGetSession()`.
- Supabase manages JWT/cookies; do not manipulate raw tokens.
- Profiles created by DB triggers; onboarding only updates (no inserts).
- RLS on all tables; validate at server boundaries with zod.
- Service role keys server‑only (`$lib/server/supabase.server.ts`), never in client bundles.

Anti‑patterns seen
- Potential mixed default locale handling in i18n setup (affects auth redirects).
- GET logout endpoints (CSRF risk) historically; ensure POST‑only with origin checks.

Refactor tasks
- [ ] Audit `apps/web/src/lib/server/supabase-hooks.ts`: getSession → getUser order; per‑request cache
- [ ] Ensure root `+layout.server.ts` has `depends('supabase:auth')` and reads session/profile
- [ ] Logout POST‑only; origin checks
- [ ] Resend verification endpoint rate‑limited and typed
- [ ] Onboarding action updates username/avatar/payout flags; never inserts
- [ ] Add reviews table + RLS (one review per order) for V1

Snippets
```ts
// SSR session (server load)
const { session, user } = await locals.safeGetSession()
if (!session) throw redirect(303, '/login')

// Server‑only admin client
import { supabaseServiceClient } from '$lib/server/supabase.server'
```

Short prompts
- “Verify SSR auth path, secure logout, onboarding update‑only, and wire reviews RLS. No raw JWT handling in app code.”
