# /data-hygiene — Load functions and queries cleanup

Goal: Remove waterfalls and unbounded queries; target invalidation.

Steps
1) Query limits and minimal selects
- Add `.range(offset, offset + size - 1)` or `.limit(size)` to every query.
- Select only needed columns; avoid `select('*')` on hot paths.

2) Parallelize loads
- Use `Promise.all` for multiple fetches in `load` to avoid waterfalls.
- Stream non-critical data when appropriate.

3) Targeted invalidation
- Replace `invalidateAll()` with `invalidate('supabase:auth')` and specific keys.
- Ensure `depends('supabase:auth')` is present where auth state affects data.

4) Server vs client
- Keep private data in `+page.server.ts` using `locals.supabase` with RLS.
- Avoid client-side DB queries for protected data.

5) Build & verify
- `pnpm -C apps/web build > data-hygiene-build.txt`
- Attach diff with queries updated and any bundle impacts.

Acceptance
- No unbounded queries on hot paths.
- No `invalidateAll()` remaining.
- Builds green.

