+# TypeScript Production Refactor
+
+> References: [TypeScript Handbook](https://www.typescriptlang.org/docs/) — updated August 2025
+
+## Official Best Practices
+
+- Enable `strict` mode, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` and `noImplicitOverride`.
+- Use project references or shared `tsconfig` bases for monorepos.
+- Set `moduleResolution: bundler`, `verbatimModuleSyntax: true` and `isolatedModules: true` for SvelteKit 2 and modern bundlers.
+- Generate types from external services (Supabase, Stripe) to avoid `any`.
+- Keep ambient typings in `src/app.d.ts` for the SvelteKit `App` namespace.
+- Run `tsc --noEmit` or `svelte-check` in CI to catch type drift.
+- Avoid `ts-ignore` and `any`; wrap external modules with proper typings.
+
+## Repository Audit
+
+- `apps/web/tsconfig.json` extends a shared config and enables strict flags.
+- Shared package `@repo/typescript-config` exists, promoting consistency.
+- `packages/i18n/src/index.ts` uses `@ts-ignore` because generated files lack declarations.
+- `rg` shows `any` in various test utilities.
+- No automated Supabase type generation script present.
+- Some ambient types (`app.d.ts`) may not reflect all `locals` fields.
+
+## Refactor Actions
+
+- Add workspace scripts `pnpm db:types` and `db:types:watch` using `supabase gen types`.
+- Generate declaration files for Paraglide output or provide module shims to remove `@ts-ignore`.
+- Search for `any` and replace with proper types or generics (especially in tests and utilities).
+- Ensure `src/app.d.ts` includes `supabase`, `safeGetSession`, `session` and `user` definitions and update when hooks change.
+- Wire `check-types` script in CI and ensure `svelte-check --tsconfig` runs.
+- For packages, enable `skipLibCheck: false` to surface type errors from dependencies when practical.
+
+## Definition of Done
+
+- No `any`/`ts-ignore` in production source code.
+- Generated Supabase types committed and referenced.
+- CI pipeline runs `pnpm -w check-types` and fails on type errors.
+- `App` namespace accurately reflects `locals` and session types.
+- tsconfig uses modern compiler options (`moduleResolution: bundler`, `verbatimModuleSyntax: true`).
