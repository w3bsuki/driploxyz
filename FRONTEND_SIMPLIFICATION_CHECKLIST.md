# Frontend Simplification Checklist (apps/web)

Objective: Remove bloat, align with Svelte 5/Kit 2 patterns, and keep bundle budgets green.

Data Loading
- Replace any invalidateAll with targeted invalidate + depends('supabase:auth')
- Parallelize load fetches with Promise.all
- Add .limit() and minimal column selects to every query
- Keep private data on server (+page.server.ts)

State & Components
- Convert legacy reactivity to $state/$derived/$effect where possible
- Replace multiple search components with a single SearchBar variant
- Replace many badge components with Badge + variant props
- Use ToastContainer + toasts store, not separate toast components

Imports & Deps
- Ensure server-only deps (stripe/sharp/resend) are server-only imports
- Remove duplicate/local utils (debounce/throttle); use one shared impl or lodash-es
- Avoid service wrappers with no logic; call Supabase directly

Performance Hygiene
- Lazy-load modal/wizard components
- Add loading="lazy" to images; size attributes present
- Confirm initial JS <200KB, CSS <50KB after PR

Verification
- pnpm -C apps/web build (check budgets)
- Smoke: login, logout, search, product view
- Lighthouse CI: ensure LCP/TBT/CLS OK on your PR

References
- REFACTOR_GUIDE.md
- OVER_ENGINEERING_AUDIT.md
- REFACTOR_EXECUTION_PLAN.md

