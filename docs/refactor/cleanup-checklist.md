# Cleanup Checklist

Use this checklist during Phase 3, but log early findings in Phase 0 reports.

- [ ] Remove unused feature flags, duplicate services, and vestigial stores.
- [ ] Replace any `any` casts with typed helpers or shared interfaces.
- [ ] Ensure every route has explicit `PageLoad`/`PageServerLoad` types.
- [ ] Confirm shared utilities live under `packages/` and are imported via `@repo/*`.
- [ ] Prune outdated markdown plans once archived in `docs/archive/`.
- [ ] Validate supabase client usage follows factory helpers and safe session handling.
