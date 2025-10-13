# 🤖 CLAUDE — Start Here for Production Execution

**Last Updated:** October 13, 2025  
**Status:** ✅ Production Plan Finalized (A+ Grade)  
**Purpose:** Primary entry point for AI assistants executing the production plan

---

## 🎯 Mission

Execute the complete production plan to launch Driplo as a production-ready, global luxury fashion marketplace.

**Target:** 8 weeks to production launch  
**Quality Standard:** Zero technical debt, best practices only, no over-engineering

---

## 📋 Critical Context (Read These First)

### 1. **PRODUCTION_TASKS.md** ⭐ PRIMARY EXECUTION PLAN
**Your main playbook with 60+ MCP-annotated tasks**
- Complete execution plan across 8 tracks
- Every task has: tools, steps, acceptance criteria, deliverables
- Pre-flight checklist and production readiness scorecard
- **This is what you execute, line by line**

### 2. **ARCHITECTURE.md** 🏗️ SYSTEM FOUNDATION
**Understand the codebase structure**
- Monorepo with Turborepo + pnpm workspaces
- Apps: web (SvelteKit 2), admin, docs
- Packages: @repo/ui, @repo/core, @repo/database, @repo/i18n
- Tech stack: Svelte 5 (runes only), Tailwind v4, Supabase, Paraglide v2

### 3. **CONTRIBUTING.md** 📝 CODING STANDARDS
**Enforced patterns and quality gates**
- Svelte 5: runes only ($state, $derived, $effect, $props), snippets not slots
- SvelteKit 2: satisfies PageServerLoad, form actions, hooks.server.ts patterns
- TypeScript strict: no `any` without `@ts-expect-error`
- MCP usage policy: always consult before implementing

### 4. **IMPLEMENTED.md** ✅ CURRENT STATE
**What's already built (don't rebuild these)**
- Search system: fully working with RPC functions (30-80ms queries)
- Database: 38 tables with RLS, 23 FK indexes, optimized policies
- Frontend: search dropdowns working, location detection implemented
- Recent fixes: Svelte 5 migration bugs resolved, product pages working

### 5. **PRODUCTION_PLAN.md** 📊 PHASES & STATUS
**6 phases with current state assessment**
- Phase 1: ✅ Foundation audit complete
- Phase 3: 🔄 Search backend done, UI integration pending
- Phases 2-6: detailed tasks, acceptance criteria, verification strategies

### 6. **ROADMAP.md** 🗺️ STRATEGIC VISION
**Product roadmap and timeline**
- Short-term: Feature complete, global ready, production launch
- 7-week timeline with weekly deliverables
- KPIs and risk mitigation

---

## 🚀 Execution Order (8 Weeks)

### **Week 1-2: Foundation & Design System**
**Start here in fresh chat**
- **Track 0**: Baseline verification
  - TypeScript 0 errors check
  - Supabase advisors (security + performance)
  - Tailwind v4 config verification
- **Track U**: UI/UX design system
  - Design tokens (CSS variables, light/dark themes)
  - Component library hardening (@repo/ui with WCAG AA)
  - Responsive & mobile polish (touch targets, safe areas)

### **Week 3: Search & i18n**
- **Track 2**: Search UI integration
  - Wire `search_products` RPC (replace ILIKE queries)
  - Autocomplete with `get_search_suggestions`
  - Analytics dashboard
- **Track 1**: i18n completion
  - Locale detection banner
  - Localized routes verification (/bg, /en)
  - Message completeness (100% key coverage)

### **Week 4: Realtime & Social**
- **Track 3**: Realtime chat
  - Supabase Realtime publications
  - Presence, typing indicators, read receipts
- **Track 4**: Social features
  - Reviews with ratings
  - Follow/unfollow with optimistic UI
  - Avatar uploads with storage policies

### **Week 5: Orders & Payments**
- **Track 5**: Checkout & dashboards
  - Stripe payment intent flow
  - Webhook handling with idempotency
  - Seller and buyer dashboards

### **Week 6-7: Hardening**
- **Track 6**: Performance, Security, Observability
  - Performance budgets (bundle < 150 KB, Core Web Vitals)
  - Rate limiting (100/min anon, 300/min auth)
  - Security headers (CSP, HSTS)
  - Sentry + APM + business metrics + alerting
- **Track O**: Operations readiness
  - Incident runbooks
  - Backup verification
  - Cost monitoring

### **Week 8: Launch**
- **Track 7**: Testing, SEO, GDPR, CI/CD, Go-Live
  - Testing pyramid (70% unit, 15 E2E, load test, a11y audit)
  - SEO (structured data, sitemap, Open Graph)
  - GDPR compliance (data export/deletion, privacy policy, terms)
  - CI/CD pipeline (PR checks, preview, staging, production)
  - Production launch with monitoring

---

## 🛠️ MCP Tool Usage (MANDATORY)

### Svelte MCP (for all Svelte/SvelteKit work)
**Always follow this workflow:**
1. Call `mcp_svelte_list-sections` to see available docs
2. Call `mcp_svelte_get-documentation` with ALL relevant sections
3. Implement according to official patterns
4. Call `mcp_svelte_svelte-autofixer` to validate before committing

**When to use:**
- Any .svelte component changes
- SvelteKit routing, load functions, form actions, hooks
- Runes usage ($state, $derived, $effect, $props)
- Snippets and {@render} syntax
- Performance, accessibility, SEO patterns

### Context7 MCP (for third-party library docs)
**Workflow:**
1. Call `mcp_context7_resolve-library-id` (e.g., "tailwind", "paraglide", "stripe")
2. Call `mcp_context7_get-library-docs` with resolved library ID

**When to use:**
- Tailwind v4 design tokens and theme config
- Paraglide v2 i18n integration patterns
- TypeScript configuration best practices
- Stripe payment intent and webhook patterns
- Resend email API usage

### Supabase MCP (for database/backend work)
**Workflow:**
1. Call `mcp_supabase_search_docs` for feature documentation (e.g., "RLS", "Realtime", "Storage")
2. Call `mcp_supabase_get_advisors` for security and performance checks
3. Call `mcp_supabase_list_tables` to audit schema
4. Test migrations on development branch first (create_branch)
5. Call `mcp_supabase_apply_migration` after testing
6. Call `mcp_supabase_merge_branch` to promote to production

**When to use:**
- Any database schema changes (migrations)
- RLS policy creation or updates
- Supabase Realtime setup (publications)
- Storage bucket configuration
- RPC function creation
- Performance optimization (indexes)

---

## ✅ Quality Gates (Must Pass Before Merge)

Every PR must pass:
1. **Lint**: `pnpm lint` (ESLint + Prettier)
2. **Type Check**: `pnpm check` (TypeScript strict, 0 errors)
3. **Tests**: `pnpm test` (Vitest unit tests)
4. **Build**: `pnpm build` (all apps and packages)
5. **MCP Validation**: Svelte autofixer pass, Supabase advisors clean

---

## 📊 Production Readiness Scorecard

Track progress toward 95+ points (production ready):

| Category | Max | Current | Status |
|----------|-----|---------|--------|
| Architecture | 10 | __ | ☐ |
| Type Safety | 10 | __ | ☐ |
| UI/UX | 15 | __ | ☐ |
| i18n | 10 | __ | ☐ |
| Features | 15 | __ | ☐ |
| Performance | 10 | __ | ☐ |
| Security | 10 | __ | ☐ |
| Testing | 10 | __ | ☐ |
| Observability | 5 | __ | ☐ |
| SEO | 5 | __ | ☐ |
| Compliance | 5 | __ | ☐ |
| Operations | 5 | __ | ☐ |

**Target: 95-100 = Production Ready ✅**

---

## 🎯 Current State (as of Oct 13, 2025)

### ✅ Already Built
- Database: 38 tables, RLS policies, 23 FK indexes
- Search: `search_products` RPC (30-80ms), `search_products_fast`, `get_search_suggestions`, analytics
- Auth: signup, login, email verification, password reset
- Products: 45 products, 159 categories, image storage
- Location detection: Vercel best practices, production-ready
- Frontend: search dropdowns working, basic messaging structure

### 🔄 Partially Complete
- Search UI integration: backend ready, frontend needs wiring
- i18n: middleware active, needs locale detection banner and route verification
- Chat: structure exists, needs Realtime subscriptions
- Following: table exists, no UI
- Reviews: table exists, no submission flow
- Avatars: profiles.avatar_url exists, upload flow missing

### ❌ Not Started
- Realtime chat with presence and typing indicators
- Review submission and display
- Follow/unfollow UI
- Avatar upload with storage bucket
- Order management flows (checkout, dashboards)
- Seller dashboard
- Performance optimization (caching, CDN)
- Security hardening (rate limiting, CSP headers)
- Observability (Sentry, APM, business metrics, alerting)
- Testing pyramid (unit 70%, integration, E2E 15 flows, load, a11y)
- SEO (structured data, sitemap, meta tags)
- GDPR compliance (data export/deletion, privacy policy, terms)
- CI/CD pipeline (PR checks, preview, staging, production)

---

## 🚨 Critical Rules

### DO
- ✅ Always consult MCP docs before implementing
- ✅ Use Svelte 5 runes only ($state, $derived, $effect, $props)
- ✅ Use snippets, never slots
- ✅ Server-only modules for secrets (src/lib/server)
- ✅ Form actions for mutations, not API routes (unless streaming/SSE)
- ✅ RLS-first: enable RLS before writing policies
- ✅ Test migrations on branch before merging
- ✅ Run svelte-autofixer before committing
- ✅ Update IMPLEMENTED.md with chronological entries

### DON'T
- ❌ Don't use legacy Svelte stores
- ❌ Don't use slots (use snippets)
- ❌ Don't use `any` without `@ts-expect-error` justification
- ❌ Don't use arbitrary Tailwind values (use design tokens)
- ❌ Don't put secrets in client bundles
- ❌ Don't create SECURITY DEFINER functions without justification
- ❌ Don't skip advisor checks before merging DB changes
- ❌ Don't merge without passing all quality gates

---

## 📖 Additional References

- **LAUNCH_CHECKLIST.md** — Go-live checklist and smoke tests
- **PLAN_FINALIZATION_SUMMARY.md** — What was improved to reach A+ grade
- **DEVELOPMENT.md** — Local setup, commands, troubleshooting

---

## 💬 Prompt for New Chat (Copy This)

```
I need you to execute our complete production plan to launch Driplo.

**First, read these core documents:**
- docs/CLAUDE.md (this file - start here)
- docs/PRODUCTION_TASKS.md (60+ tasks, your execution playbook)
- docs/ARCHITECTURE.md (system structure)
- docs/CONTRIBUTING.md (coding standards)
- docs/IMPLEMENTED.md (what's already built)

**Then:**
1. Create a comprehensive todo list from PRODUCTION_TASKS.md
2. Start with Track 0 (Baseline Verification) and Track U (UI/UX Design System)
3. For EVERY task:
   - Consult the mandated MCP docs BEFORE implementing
   - Svelte MCP: list-sections → get-documentation → implement → autofixer
   - Context7 MCP: for Tailwind v4, Paraglide, TypeScript, Stripe, Resend
   - Supabase MCP: for migrations, RLS, Realtime, Storage, advisors
4. Follow the 8-week execution order
5. Update the Production Readiness Scorecard as you complete tracks
6. Pass ALL quality gates: lint, type check, test, build, MCP validation

**Critical rules:**
- Svelte 5 runes only, snippets not slots
- SvelteKit 2 patterns (satisfies, actions, hooks)
- TypeScript strict, no stray `any`
- Tailwind v4 tokens, no arbitrary values
- RLS-first, advisors clean
- Zero technical debt, best practices only

Let's execute this plan perfectly and ship production-ready code. Start with Track 0 baseline verification.
```

---

**Last Updated:** October 13, 2025  
**Grade:** A+ (95/100) — Production Ready  
**Status:** Ready for Execution 🚀
