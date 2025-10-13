# Contributing Guide

## Git Workflow

### Branching Strategy

1. Create feature branches off `main` using pattern: `feature/<scope>-<desc>` or `fix/<scope>-<desc>`
2. Keep branches short-lived (< 3 days)
3. Merge only after passing all quality gates

### Pull Request Requirements

Every PR must include:
- Summary linked to roadmap/issue
- Verification commands executed (with output)
- Screenshots/demos for UI changes
- Follow-up tasks documented

## Development Standards

### SvelteKit & Svelte 5 Patterns

**Component Architecture:**
- Use `$props`, `$state`, `$derived` runes exclusively
- Never mutate incoming props
- Use snippets `{#snippet}` and `{@render}` for composition (not slots)
- Prefer `$state.snapshot` before passing to third-party libraries

**Data Loading:**
- Server data in `+page.server.ts` / `+layout.server.ts` only
- Universal loads return serializable data only
- Use streamed promises for slow fetches
- Keep auth/Supabase calls in server-only modules

**Forms & Actions:**
- Use `error()` and `redirect()` helpers (no manual throws)
- Set explicit `path` on cookies
- Progressive enhancement via `use:enhance`
- Validate with Standard Schema-compatible libraries

**Hooks & Middleware:**
- Auth enrichment in `hooks.server.ts` only
- Use helpers from `packages/core`
- `handleFetch` for Supabase request rewriting

### TypeScript Standards

- Strict mode enabled
- No `any` types without `@ts-expect-error` comment
- Export interfaces for all component props
- Use `satisfies` for config objects

### Component Library (`packages/ui`)

**Structure:**
```
packages/ui/src/lib/
├── primitives/        # Pure UI, no business logic
│   ├── buttons/
│   ├── forms/
│   └── ...
└── compositions/      # Complex composed components
    ├── cards/
    ├── modals/
    └── ...
```

**Rules:**
- Primitives: no app-specific imports, accept all behavior via props/snippets
- Compositions: accept snippets for flexible content injection
- No `$app/*` imports (keep framework-agnostic)
- Export via central `index.ts`

### Supabase Guidelines

- Respect RLS boundaries
- Route all calls through `$lib/server` helpers
- Keep migrations in version control
- Use Supabase branches for experimentation
- Enable RLS before granting access
- Mask secrets in logs

## Quality Gates

Run before every PR:

```bash
# 1. Lint
pnpm lint

# 2. Type check
pnpm check

# 3. Tests
pnpm test

# 4. Build
pnpm build

# 5. Specific app build
pnpm run build --filter=web
```

All commands must pass with exit code 0.

## Code Review Checklist

**Reviewer must verify:**
- [ ] All quality gates passed
- [ ] No console.log or debugger statements
- [ ] Props properly typed
- [ ] Error boundaries added for async operations
- [ ] Loading states implemented
- [ ] Accessibility attributes present
- [ ] Mobile responsive
- [ ] No hardcoded strings (use i18n)
- [ ] Performance considered (lazy loading, code splitting)
- [ ] Security reviewed (no exposed secrets, proper auth checks)

## Documentation Requirements

**When to update docs:**
- New package added → update ARCHITECTURE.md
- Build process changes → update DEVELOPMENT.md
- New feature/epic → update ROADMAP.md
- Development workflow changes → update this file

**Style Guide:**
- Use Markdown
- Include code examples
- Keep language clear and concise
- Update "Last updated" date

## MCP Usage Guidelines

When using AI assistants (Svelte MCP, Supabase MCP):

1. **Svelte MCP:**
   - Always call `list-sections` first
   - Fetch relevant docs via `get-documentation`
   - Run `svelte-autofixer` before sharing code
   - Verify against official Svelte 5 patterns

2. **Supabase MCP:**
   - Use project-scoped, read-only tokens only
   - Test on development database first
   - Review generated SQL before execution
   - Log all schema changes

## Getting Help

- **Questions:** Open GitHub Discussion
- **Bugs:** Open GitHub Issue with reproduction
- **Security:** Email security@driplo.io
- **Documentation:** Contribute to docs/ folder
