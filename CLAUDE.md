# Driplo Claude Code Rules

## Tech Stack
- **Framework**: SvelteKit 2 + Svelte 5
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Monorepo**: Turborepo with pnpm
- **Styling**: TailwindCSS v4
- **Deployment**: Vercel

## Core Directives

### 1. Documentation First
1.1. **ALWAYS** use MCP for documentation:
   - `mcp__svelte-docs__*` for Svelte 5 patterns
   - `mcp__supabase__search_docs` for Supabase
   - Never guess syntax - verify with MCP
1.2. Reference `SVELTEKIT_AUDIT_MASTER.md` for refactor phases
1.3. Check official docs before implementing

### 2. Thinking Requirements
2.1. Use `ultrathink` for:
   - Architecture decisions
   - Refactoring plans
   - Complex debugging
   - Performance optimization
2.2. Use plan mode (Shift+Tab twice) for multi-step tasks
2.3. Break complex tasks into phases

### 3. Code Quality Rules
3.1. **NO DUPLICATION**
   - Check `packages/ui` before creating components
   - Reuse existing utilities from `$lib`
   - Never duplicate API calls or store logic
3.2. **NO OVER-ENGINEERING**
   - Simplest solution that works
   - No premature optimization
   - No unnecessary abstractions
3.3. **NO BULLSHIT**
   - If unsure, say "I need to check"
   - Never invent APIs or methods
   - Test before claiming it works

### 4. Svelte 5 Strict Rules
4.1. **ONLY** use runes:
   ```typescript
   let count = $state(0);          // ✅
   let doubled = $derived(count);  // ✅
   let { prop } = $props();        // ✅
   // NEVER: $: reactive, export let
   ```
4.2. Use `$effect` for side effects
4.3. Use `$bindable()` for two-way binding
4.4. Always define `interface Props`

### 5. SvelteKit 2 Patterns
5.1. **Data Loading**:
   - `+page.server.ts` for sensitive data
   - `+page.ts` for public data
   - Never fetch in components
5.2. **Form Actions**:
   - Use progressive enhancement
   - Server-side validation only
   - No client-side form libraries
5.3. **Routing**:
   - File-based routing only
   - Use route groups `(auth)` for organization
   - Prerender static pages

### 6. Supabase Optimization
6.1. **Query Efficiency**:
   - Select only needed columns
   - Use proper indexes
   - Batch related queries
6.2. **Auth Rules**:
   - Never modify `auth.users` table
   - Use `locals.safeGetSession()`
   - Normalize emails: `email.toLowerCase().trim()`
6.3. **RLS Policies**:
   - Enable on all tables
   - Test with different roles
   - Never bypass RLS

### 7. Performance Requirements
7.1. **Bundle Size**:
   - Initial JS < 200KB
   - Lazy load heavy components
   - Tree-shake unused code
7.2. **Data Transfer**:
   - Minimize Supabase egress
   - Cache frequently accessed data
   - Use proper CDN for images
7.3. **Metrics**:
   - Lighthouse > 90 all categories
   - FCP < 1.5s
   - TTI < 3s

### 8. Development Workflow
8.1. **Before Writing Code**:
   - Check existing implementations
   - Review relevant phase in `SVELTEKIT_AUDIT_MASTER.md`
   - Use MCP to verify patterns
8.2. **Testing**:
   ```bash
   pnpm build --filter @repo/ui  # Build packages first
   pnpm dev                       # Test locally
   pnpm check-types              # TypeScript validation
   ```
8.3. **Git Commits**:
   - Small, focused changes
   - Test before committing
   - Never commit console.logs

### 9. File Organization
9.1. **Components**: `packages/ui/src/`
9.2. **Business Logic**: `apps/web/src/lib/`
9.3. **Routes**: `apps/web/src/routes/`
9.4. **Types**: Export from packages

### 10. Error Handling
10.1. Always use try/catch for async operations
10.2. Show user-friendly error messages
10.3. Log errors to console in development only
10.4. Use `+error.svelte` for route errors

### 11. Security
11.1. Never expose API keys in client code
11.2. Validate all user inputs server-side
11.3. Use environment variables properly
11.4. Implement proper CORS policies

### 12. Forbidden Patterns
12.1. **NEVER**:
   - Use `$:` reactive statements
   - Use `export let` in Svelte 5
   - Create components in `apps/`
   - Use `href="#"` (accessibility violation)
   - Modify auth tables directly
   - Use client-side validation only
   - Import from `node_modules` directly
   - Create unnecessary `.md` files
   - Over-abstract simple logic
   - Use any form of CSP (it breaks production)

### 13. Required Patterns
13.1. **ALWAYS**:
   - Build packages before apps
   - Use TypeScript interfaces
   - Import from `@repo/ui` for components
   - Use semantic HTML
   - Add proper ARIA labels
   - Test in production environment
   - Check Supabase logs for errors
   - Use server-side form validation

### 14. Commands
14.1. **Development**:
   ```bash
   pnpm dev --filter web       # Single app
   pnpm build                  # All packages
   pnpm check-types           # Type validation
   ```
14.2. **Database**: SUPABASE MCP (USE IT)
   ```bash
   mcp__supabase__list_tables
   mcp__supabase__execute_sql
   mcp__supabase__get_logs
   ```

### 15. Debugging Process
15.1. Check browser console
15.2. Check network tab for failed requests
15.3. Use `mcp__supabase__get_logs` for backend errors
15.4. Verify environment variables
15.5. Test in incognito mode

## Project Structure
```
apps/
  web/              # Main marketplace
    src/
      routes/       # Pages
      lib/          # Utilities
      app.html      # Minimal HTML
packages/
  ui/               # ALL components here
  database/         # Supabase types
turbo.json          # Build pipeline
```

## Success Criteria
- Zero duplicate code
- All features work in production
- No console errors
- Fast page loads (< 3s)
- Clean, maintainable code
- Follows SvelteKit 2 docs exactly

## Remember
- Read existing code before writing new code
- Use MCP for documentation verification
- Test locally AND in production
- Keep it simple, make it work
- Reference `SVELTEKIT_AUDIT_MASTER.md` for systematic refactoring