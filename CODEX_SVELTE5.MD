+# Svelte 5 Production Refactor
+
+> References: [Svelte 5 Docs](https://svelte.dev/docs) — updated August 2025
+
+## Official Best Practices
+
+- Prefer runes (`$state`, `$derived`, `$effect`, `$props`) for component state and context.
+- Keep reactivity local; use stores only for cross‑component or persisted state.
+- Set `compilerOptions: { runes: true }` in `svelte.config.js` to lock the compiler to runes mode.
+- Replace `onMount` with `$effect` whenever the logic is reactive rather than mount‑only.
+- Use `.server.ts`/`.server.js` for server‑only helpers as recommended in SvelteKit 2 docs.
+- Extract heavy logic into modules or `+page.server.ts` to keep components <200 LOC.
+- Avoid `console.log` in production; use a minimal logger that respects log levels.
+
+## Repository Audit
+
+- Runes are used in `apps/web` and `packages/ui` components, matching Svelte 5 idioms.
+- `svelte.config.js` files do **not** set `compilerOptions.runes`, so legacy mode could slip in.
+- `rg onMount` shows numerous `onMount` calls across routes and components, some for reactive side effects.
+- `apps/web/src/hooks.server.ts` is 426 lines and mixes environment checks, Sentry setup and auth logic.
+- Compiled Svelte components live in `packages/ui/dist`, adding noise to the repo.
+
+## Refactor Actions
+
+- Add `compilerOptions: { runes: true }` to all Svelte configs.
+- Search for `onMount` and migrate simple reactive effects to `$effect`.
+- Split `hooks.server.ts` into smaller modules (`env.ts`, `auth.ts`, `i18n.ts`) and import them to reduce bloat.
+- Replace scattered `console.log` with a tiny logger wrapper gated by log level.
+- Remove compiled output under `packages/ui/dist` and rely on `svelte-package` during release.
+- Remove unused components and legacy files after confirming no references.
+
+## Definition of Done
+
+- All Svelte configs enforce runes.
+- Hooks and components use `$effect` where appropriate.
+- `hooks.server.ts` under ~200 lines with isolated modules.
+- No compiled Svelte components committed to the repository.
+- No stray `console.log` in production builds.
