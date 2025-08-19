                                                                                                                                                 
Project: Driplo Web — Full Audit & Refactor (Svelte 5, SvelteKit 2, Supabase SSR, Superforms v2, repo/ui)                                        
                                                                                                                                                 
Goals                                                                                                                                            
                                                                                                                                                 
- End-to-end audit: auth, routing, layouts, stores, forms, UI reuse, performance, accessibility, i18n, DX, deploy.                               
- Produce a canonical plan and implement high‑impact, low‑risk improvements with Svelte 5/Kit 2 best practices.                                  
                                                                                                                                                 
Deliverables                                                                                                                                     
- CODEBASE_AUDIT.md: structure, conventions, issues, risks, bloat.
- UI_AUDIT.md: component inventory, reuse from repo/ui, consolidation targets.
- COMPONENT_INVENTORY.md: pages/layouts/components mapping + ownership.
- DEAD_CODE_REPORT.md: unused/duplicated modules, migration candidates.
- REFACTOR_PLAN.md: phased plan, task breakdown, DoD, owners, sequencing.
- Incorporate and reference AUTH_PROD_AUDIT.md findings.

Scope

- Svelte 5 idioms: runes ($state/$derived/$effect), script usage, props, snippets.
- SvelteKit 2: routing conventions, +layout/+page split, server/client boundaries, actions, no edge for forms, CSRF.
- Auth/forms: Superforms v2 patterns, SSR Supabase, actions, redirects, cookies.
- Stores/state: structure, derived values, SSR hydration, avoid anti-patterns.
- UI/Design System: maximize reuse from packages/ui, remove local duplicates, consistent props/variants.
- Performance: hydration cost, bundle size, image handling, code-splitting.
- Accessibility: forms, focus, semantics, keyboard interactions.
- i18n: usage, fallbacks, detection, SSR hydration.
- DX/Quality: lint, typecheck, tests, logging, error handling.
- Deploy: Vercel adapter, envs, Supabase redirect URLs, preview parity.

Constraints/Process

- Use update_plan for steps; apply_patch for edits; do not commit.
- Keep changes surgical; no unrelated fixes; no network calls.
- Coordinate with Claude via the plan files and TODO checklists, not messages.

Method

- Phase 0 (Audit): scan repo tree (apps/web, packages/ui), map auth/forms/routes/stores, identify bloat and anti-patterns, verify prod-only      
issues.
- Phase 1 (Quick Wins): fix signup redirect origin; verify envs/redirects; ensure actions work with Superforms; restore CSRF.
- Phase 2 (Refactor): consolidate UI to repo/ui, normalize Svelte 5 runes, clean store patterns, simplify layouts/routes, remove dead code.      
- Phase 3 (Hardening): accessibility passes, performance tweaks, logging/error patterns, minimal tests for changed areas.
- Phase 4 (Docs/Hand‑off): update README, migration notes, dev workflow.

Acceptance Criteria (per task)

- Clear before/after, tests or manual steps to verify, no new warnings/errors, matches Svelte 5/Kit 2 idioms, maintains SSR/auth correctness     
on Vercel.

Initial Steps (Phase 0)

1. Create CODEBASE_AUDIT.md, UI_AUDIT.md, COMPONENT_INVENTORY.md, DEAD_CODE_REPORT.md skeletons.
2. Scan and populate inventories and issues (auth, routes, layouts, forms, stores, UI).
3. Draft REFACTOR_PLAN.md with prioritized backlog (P0/P1/P2), owners, DoD.
4. Stop for approval.

Output Style

- Concise preambles before tool calls, short status updates, reference file paths (no big dumps).