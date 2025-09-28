# Dependency Audit

## Snapshot Notes (2025-09-24)
- Root workspace pins pnpm 8.15.6 and Turbo 2.5.4.
- The flagship web app depends on SvelteKit 2.36, Svelte 5.36, Vite 7.1, Stripe 18, Supabase JS 2.51, and Tailwind 4.1.
- Shared packages (`@repo/core`, `@repo/ui`, `@repo/database`, `@repo/i18n`) are linked via `workspace:*`.
- TypeScript 5.8.2 and ESLint 9.31 are present in multiple workspaces; confirm version parity in Phase 2.
- Paraglide localisation plugin fetches runtime plugins from jsDelivr during builds; note offline failures in CI without caching.

## Risks Identified
- Missing path aliases for `@repo/core` cause build failures when Vite resolves modules.
- Supabase generated types do not include `order_items`, leading to runtime casts and type gaps.
- Env typing is incomplete, producing `tsc` failures when importing from `$env/static/public`.

## Next Steps
1. Document current dependency graph per workspace (Phase 0 reports).
2. During Phase 2, align toolchain versions and consolidate configuration packages.
3. Investigate caching strategy for Paraglide plugins to avoid network failures in offline CI.
