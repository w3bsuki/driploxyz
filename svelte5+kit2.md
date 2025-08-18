Svelte 5 + SvelteKit 2 Audit

Summary

- Status: Project already uses Svelte 5 and SvelteKit 2 with solid structure and good adoption of runes in components. A few configuration and error-handling issues should be fixed, plus some deployment and consistency tweaks.
- Apps: `apps/web` (main app), `apps/docs` (secondary), shared `packages` (`ui`, `i18n`, etc.).
- Key versions: `svelte@^5.36.12`, `@sveltejs/kit@^2.25.1`, `vite@^7`, `@sveltejs/vite-plugin-svelte@^6`.

What’s Good

- Svelte 5 usage: Components adopt runes (`$state`, `$derived`, `$effect`, `$props`, children with `{@render ...}`) in `apps/web` and `packages/ui`.
- Routing: Uses +layout/+page conventions correctly, with server/client separation (`+page.server.ts` for SSR, `+page.ts` for client transforms).
- Data dependencies: Uses `depends('supabase:auth')` and `invalidate('supabase:auth')` for auth-driven invalidation. Good pattern.
- Types: Type-safe `load` functions and `App` typing in `src/app.d.ts` (locals for `supabase`, `safeGetSession`, `session`, `user`).
- Supabase handling: `hooks.server.ts` validates JWT via `getUser()` and exposes `safeGetSession()`. Cookies configured with `httpOnly` and `sameSite: 'lax'`.
- Monorepo hygiene: Kit and Svelte config per app, shared TS/ESLint configs, and a clean `tailwind.config.js` content path integrating shared `@repo/ui`.

Issues To Fix (Highest Impact)

1) Incorrect redirect error handling

- Files: `apps/web/src/hooks.server.ts`, `apps/web/src/routes/+layout.server.ts`
- Problem: `if (err instanceof redirect)` checks the redirect function, not the thrown `Redirect` error. This will never be true.
- Fix: Import `Redirect` or `isRedirect` from `@sveltejs/kit` and check accordingly, or rethrow unknown.
  - Example: `import { Redirect, isRedirect } from '@sveltejs/kit'` then `if (isRedirect(err)) throw err;`

2) CSRF origin checks disabled globally

- File: `apps/web/svelte.config.js`
- Problem: `csrf.checkOrigin: false` disables origin checks for POST requests. This weakens CSRF protection.
- Recommendation: Keep default CSRF (`checkOrigin: true`) and only disable for specific trusted cases. If cross-site POSTs are required, protect endpoints with tokens or other custom validation.

3) Tailwind version inconsistency

- Root `package.json`: `tailwindcss@^4.1.11`
- `apps/web`: `tailwindcss@^3.4.0` with v3-style `tailwind.config.js`.
- Risk: Confusion and build drift between v3 and v4 expectations. Tailwind 4 also changes config and content discovery.
- Recommendation: Standardize on Tailwind v3 for now (non-breaking) or plan a proper Tailwind 4 migration across the monorepo. If v3: remove root v4 dep. If v4: migrate app config and plugin usage accordingly.

4) Vercel adapter config: `split: false` and global ISR

- File: `apps/web/svelte.config.js`
- Notes:
  - `split: false` packs routes into one function, which can increase cold start and bundle size. If everything runs on Node (no Edge), consider `split: true` to let Vercel split functions per route for better scaling and cache locality.
  - `isr: { expiration: 60 }` has no effect unless routes are marked `prerender` or use ISR explicitly. Ensure ISR is only enabled for cache-friendly, anonymous pages. Don’t ISR auth-sensitive routes.

Strong Practices Observed

- SSR/CSR separation: Auth and DB work mostly on server loads or endpoints; client loads transform/derive UI data.
- App shell: `src/app.html` uses `data-sveltekit-preload-data="tap"` for sensible preloading without over-fetching.
- Stores: Sensible usage for cross-component auth/notifications state; local UI state uses runes.
- Supabase clients: Server/browser clients are created in proper contexts, with browser client provided via `+layout.ts`.
- Routing groups: Uses `(auth)` and `(protected)` layouts to gate sections.
- Locales: Separate i18n package and language init in layout. Good separation.

Smaller/Targeted Improvements

- Logging hygiene in production
  - Files: `hooks.server.ts`, `+layout.server.ts` use `console.log` under `NODE_ENV === 'production'`. Consider a logger (pino/winston) with levels and sampling to avoid noisy logs and cost.

- Cookie `secure` detection
  - File: `hooks.server.ts`
  - `secure: event.url.protocol === 'https:'` may be unreliable behind some proxies. Consider trusting `X-Forwarded-Proto` when on Vercel/Node runtime or simply `secure: true` in production if all traffic is HTTPS.

- Svelte 5 compiler options
  - Files: `apps/web/svelte.config.js`, `apps/docs/svelte.config.js`, `packages/ui/svelte.config.js`
  - Not required, but you can set `compilerOptions: { runes: true }` to assert runes mode explicitly in Svelte 5.

- Endpoint JSON responses
  - File: `apps/web/src/routes/api/health/+server.ts`
  - Already uses `json()`. If any other endpoints return raw `Response`, prefer `json` for consistency and correct headers.

- Layout data nulls
  - File: `apps/web/src/routes/+layout.server.ts` returns `supabase: null` and creates browser client in `+layout.ts`. This is fine; ensure `LayoutData` types reflect optional `supabase` to avoid type drift.

Security Review

- CSRF: Re-enable origin checks; add anti-CSRF tokens for critical POST forms if cross-origin patterns exist.
- Auth redirects: Fix the redirect error handling so that throws bubble correctly. Current `instanceof redirect` check can swallow redirects and continue execution.
- Secrets: Uses `$env/dynamic/private` for private env in endpoints and service client. Ensure no private envs leak to client loads.
- RLS: `createServiceClient` bypasses RLS; only use server-side where absolutely necessary.

SvelteKit 2 Best Practices Checklist

- Routing and loads
  - Use `+page.server.ts` for secure data fetching and mutations; `+page.ts` for client-only transforms. Observed and good.
  - Scope `depends()` keys and pair with `invalidate()` to refresh on auth/session change. Observed.
  - Avoid mixing `fetch` to private endpoints in `+page.ts`; prefer server load or actions.

- Actions and forms
  - Prefer form actions for mutations (login/logout/profile updates). You currently use endpoints for some auth flows, which is acceptable, but actions integrate well with progressive enhancement.

- Hooks
  - Keep auth parsing and `locals` setup in `hooks.server.ts` (you do). Ensure error/redirect handling is correct (fix `instanceof redirect`).

- App template
  - `src/app.html` present and minimal; preload strategy is configured. Consider `hover` or `viewport` if UX requires.

- Type safety
  - Keep `App` namespace updated in `app.d.ts`. You’ve done this.

Svelte 5 Best Practices Checklist

- Runes
  - Use `$state`, `$derived`, `$effect` for local component state (observed). Keep stores for cross-component/global state.
  - Use `$props()` and `children` slot with `{@render}` (observed in `+layout.svelte`).

- Reactivity
  - Prefer `$effect` over `onMount` + subscriptions for simple reactive side effects. You can replace some `onMount` usages when not strictly mount-only.

- Stores interop
  - Existing Svelte stores (`writable/derived`) are still valid. Keep store usage focused on shared/global state.

Tailwind and Styling

- Decide on Tailwind version across monorepo. If staying on v3 in apps, remove v4 from root or migrate everything to v4 with new config rules.
- Confirm `content` globs cover all component paths, including `packages/ui/dist` (present) to avoid purge issues.

Deployment Notes (Vercel)

- Node runtime: For Supabase SDK and server features, Node runtime is fine. If you need faster cold starts and your code is Edge-compatible, consider Edge for select routes (but then don’t import Node-only APIs).
- `split: true`: Recommended unless you’ve hit known issues with mixed runtimes. It reduces bundle sizes and isolates failures.
- ISR: Only enable where you `prerender` or intend semi-static pages. Avoid caching pages with user/session-specific output.

Concrete Fixes (PR-sized)

1) Correct redirect error checks

- In both files, replace checks like:

  ```ts
  if (err instanceof redirect) throw err;
  ```

  with one of:

  ```ts
  import { isRedirect } from '@sveltejs/kit';
  if (isRedirect(err)) throw err;
  ```

  or

  ```ts
  import { Redirect } from '@sveltejs/kit';
  if (err instanceof Redirect) throw err;
  ```

2) Re-enable CSRF origin checks

- `apps/web/svelte.config.js`:
  - Remove the `csrf` override or set `csrf: { checkOrigin: true }` (default). For any required cross-origin POST, implement custom validation tokens.

3) Tailwind alignment

- Choose Tailwind v3 or v4 for all packages. If v3: remove root v4 dep. If v4: migrate app config and content scanning patterns and ensure plugins are compatible.

4) Optional: Vercel adapter split

- `split: true` to improve scaling and cold starts; verify no edge/node mixing remains.

Optional Enhancements

- Introduce a tiny logger wrapper (levels + structured logs) and gate prod logs via level, not environment equality checks scattered across files.
- Add `compilerOptions: { runes: true }` to `svelte.config.js` in apps and `packages/ui` for explicitness.
- Consider progressively enhancing mutations with Kit form actions in places where you currently POST to endpoints.

Quick Verification Commands

- Type check: `pnpm -w run check-types`
- Lint: `pnpm -w run lint`
- Build web: `pnpm --filter web build`
- Build ui package: `pnpm --filter @repo/ui build`

Files Reviewed (partial)

- `apps/web/package.json`, `svelte.config.js`, `vite.config.ts`, `src/app.html`, `src/app.d.ts`, `src/hooks.server.ts`
- `apps/web/src/routes/+layout.svelte/+layout.ts/+layout.server.ts`, `+page.svelte/+page.server.ts`, representative feature routes and endpoints
- `packages/ui` Svelte 5 components and packaging config
- `apps/docs` Kit 2 + Svelte 5 config

Questions / Clarifications

- Do you intentionally require cross-origin POSTs (necessitating `csrf.checkOrigin: false`)? If not, I’ll switch it back on.
- Do you want to standardize Tailwind on v3 or move forward to v4 across the workspace?

