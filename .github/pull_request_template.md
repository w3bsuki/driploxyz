# PR title

Short summary of what this changes and why.

## References (MCP)

Paste links to the exact docs used for this change (date-captured). Include deltas you applied.

- Svelte MCP: (runes, load/actions, SSR/CSR, env)
- Context7 MCP: (Turbo, ESLint flat, Tailwind v4, adapter-vercel)
- Supabase MCP: (@supabase/ssr SSR, RLS, API keys, types gen, Edge Functions, Realtime)

## Scope & risk

- Change type: refactor / tooling / feature / fix
- Risk level: low / medium / high (why)

## Structural checks (must pass)

- [ ] No aliases to `../../packages/*/src/**` in any app config or tsconfig
- [ ] SvelteKit illegal-imports report: 0 client-bundled server-only imports
- [ ] Adapter/Vercel: defaults, or justification documented in PR for any tuning
- [ ] If backend/auth touched: Supabase SSR pattern followed (hooks, locals, types, root layouts, auth confirm route)

## Verification

- [ ] Lint passes: workspace + changed packages/apps
- [ ] Typecheck passes: workspace + changed packages/apps
- [ ] Tests pass (unit/e2e if applicable)
- [ ] Builds succeed: `pnpm -w build` builds packages first, then apps
- [ ] (Optional) Turbo cache hit on re-run in CI

## Supabase acceptance (if relevant)

- [ ] No service role key in client; `$env/*` separation correct
- [ ] Representative RLS policies updated/covered by a test
- [ ] `@repo/database` exports up-to-date `Database` types and typed `createClient<Database>()` in usage
- [ ] Types/migrations workflow verified locally (and CI when merged)

## Notes / screenshots

Add anything helpful for reviewers.
