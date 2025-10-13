# Production Execution Prompt

**Copy this entire message to start a new chat session focused on production implementation:**

---

## Context

I'm working on **Driplo**, a global luxury fashion marketplace built with:
- **Frontend:** SvelteKit 2 + Svelte 5 (with runes: `$props`, `$state`, `$derived`, snippets)
- **Backend:** Supabase (PostgreSQL with RLS, Auth, Storage, Realtime)
- **Monorepo:** Turborepo + pnpm workspaces
- **i18n:** Paraglide (compile-time, type-safe)
- **Deployment:** Vercel
- **Payments:** Stripe

Project location: `K:\driplo-turbo-1`

---

## Current State

### ✅ WORKING
- Database: 38 tables with RLS (Supabase project: `koowfhsaqmarfdkwsfiz`)
- Auth: Login, signup, email verification
- Products: 45 listings, 159 categories, image storage
- Favorites: 37 favorites working
- Profiles: 6 users with seller metrics
- Messages: Basic structure (7 messages, 1 conversation)
- Paraglide i18n: Middleware active in `apps/web/src/lib/server/hooks.ts`

### 🔄 PARTIALLY IMPLEMENTED
- **i18n:** No location detection, no locale switcher UI
- **Search:** No RPC function, no frontend
- **Chat:** No realtime subscriptions enabled
- **Following:** Table exists, no UI/API
- **Reviews:** Table exists, no submission form

### ❌ MISSING
- Location-based locale detection ("We detected UK, switch to Driplo UK?")
- Full-text search with filters
- Realtime chat with presence/typing indicators
- Review submission and display
- Follow/unfollow functionality
- Avatar uploads (no storage bucket)
- Order management flows
- Seller/buyer dashboards

---

## My Goal

**Push to production in 7 weeks** following the plan in `docs/PRODUCTION_PLAN.md` and `docs/ROADMAP.md`.

I need to complete ALL marketplace features:
1. **Location detection** for global experience
2. **Search** with filters (category, price, size, condition)
3. **Realtime chat** with typing indicators
4. **Reviews** with rating aggregation
5. **Follow/unfollow** sellers
6. **Avatar uploads** with Supabase Storage
7. **Order management** (checkout, tracking, seller dashboard)
8. **Performance** (indexes, caching, Lighthouse > 90)
9. **Security** (RLS audit, rate limiting)

---

## Current Sprint

**Week 1: Foundation & Audit (Oct 13-20, 2025)**

I need help with:
1. Running `mcp_supabase_get_advisors` to find security/performance issues
2. Creating database migrations for missing indexes
3. Running `mcp_svelte_svelte-autofixer` on all components
4. Documenting feature gaps

---

## Your Role

You have access to:
- **Svelte MCP** (`mcp_svelte_*`) - Official Svelte 5 & SvelteKit 2 docs
- **Supabase MCP** (`mcp_supabase_*`) - Database management, migrations, queries
- **Context7 MCP** (`mcp_context7_*`) - Third-party library docs (Stripe, Resend, etc.)

**CRITICAL RULES:**
1. **ALWAYS** call `mcp_svelte_list-sections` FIRST before implementing Svelte features
2. **ALWAYS** fetch relevant docs with `mcp_svelte_get-documentation` before coding
3. **ALWAYS** validate code with `mcp_svelte_svelte-autofixer` after writing
4. **ALWAYS** use Supabase MCP for database operations (never manual SQL editing)
5. **ALWAYS** test on development branch before merging to production
6. **ALWAYS** run quality gates before committing: `pnpm lint && pnpm check && pnpm test && pnpm build`

---

## Verification Strategy

### Before ANY Svelte/SvelteKit Code:
```
1. mcp_svelte_list-sections → identify relevant sections
2. mcp_svelte_get-documentation → fetch official patterns
3. Implement according to docs
4. mcp_svelte_svelte-autofixer → validate
```

### Before ANY Supabase Changes:
```
1. mcp_supabase_search_docs → find feature documentation
2. mcp_supabase_list_tables → check current schema
3. mcp_supabase_get_advisors → security/performance check
4. Test on development branch FIRST
5. mcp_supabase_merge_branch → promote to production
```

### For Third-Party Libraries:
```
1. mcp_context7_resolve-library-id → get library ID
2. mcp_context7_get-library-docs → fetch implementation guides
3. Follow official examples exactly
```

---

## Documentation

Read these files to understand the system:
- `docs/PRODUCTION_PLAN.md` - Complete feature checklist with code examples (19.7 KB)
- `docs/ROADMAP.md` - 8-week sprint plan with exit criteria (13.4 KB)
- `docs/ARCHITECTURE.md` - System design, monorepo structure (10.4 KB)
- `docs/DEVELOPMENT.md` - Setup, commands, troubleshooting (16.3 KB)
- `docs/CONTRIBUTING.md` - Code standards, Git workflow (4.1 KB)

---

## First Task

**Start with Week 1, Task 1: Supabase Security & Performance Audit**

1. Use `mcp_supabase_get_advisors` with `project_id: 'koowfhsaqmarfdkwsfiz'` and `type: 'security'`
2. Review all findings and explain each issue
3. Create a prioritized list of issues to fix
4. Run again with `type: 'performance'` 
5. Identify missing indexes and suggest migrations

Then we'll move to implementing location detection for i18n.

---

## Important Context

- I want to follow **official Svelte 5 best practices** (use MCPs to verify!)
- All components should use **runes** (`$props`, `$state`, `$derived`)
- Use **snippets** for composition, NOT slots (Svelte 5 deprecated slots)
- Component library in `packages/ui` should be **framework-agnostic**
- Keep business logic in `packages/core`, not in UI components
- **NEVER** use `any` type - use `unknown` with type guards
- All database operations go through **Supabase RLS** - no service keys in frontend
- Test every feature after implementation with manual verification

---

## Success Criteria

At the end of this chat, I should have:
- [ ] Complete security/performance audit report from Supabase
- [ ] Migration plan for missing indexes
- [ ] Validated Svelte 5 compliance across components
- [ ] Clear action items for Week 1 with code examples
- [ ] Understanding of how to implement location detection
- [ ] Next steps for Week 2 documented

---

## Let's Go! 🚀

Start by running the Supabase security advisors check and walk me through the findings. Then we'll create migrations to fix issues, and move on to implementing the i18n location detection feature.

Remember: **Every step must be verified against official documentation using MCPs!**
