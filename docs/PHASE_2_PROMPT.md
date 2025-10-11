# SvelteKit 2 + Svelte 5 + Turborepo Refactoring - Execute Phase 2: Route Colocation

## Context
This is a **professional SvelteKit 2 + Svelte 5 + Turborepo monorepo** being refactored to official best practices.

## Status (2025-10-11)
- ✅ **Phase 1 COMPLETE** - @repo/core is now 100% framework-agnostic (0 SvelteKit imports)
- ✅ **docs/IDEAL_STRUCTURE.md** - Official best practices reference
- ✅ **docs/02_LOG.md** - Complete Phase 1 documentation
- ✅ Build passes for @repo/core independently
- 🔴 TypeScript: 115 errors (expected to drop to ~59 after Phase 1 validation)
- 🎯 **Ready for Phase 2: Route Colocation**

## Your Mission: Execute Phase 2 - Route Colocation

**Read these files FIRST:**
1. `docs/IDEAL_STRUCTURE.md` (lines 1-100) - Route colocation principles
2. `docs/02_LOG.md` (latest entry) - Phase 1 results
3. `apps/web/src/routes/` structure - Current routing setup

### Phase 2 Objectives

Apply **SvelteKit 2's official route colocation pattern**:

> **Principle**: Components used in ONE route should LIVE WITH that route.
> **Principle**: Components used in MULTIPLE routes stay in `$lib/components/`.

### Step-by-Step Execution Plan

#### Step 1: Audit Component Usage (30 min)

Scan `apps/web/src/lib/components/` and identify:
- **Single-use components** (used in only 1 route) → MOVE to route folder
- **Multi-use components** (used in 2+ places) → KEEP in $lib/components/
- **Layout components** (Header, Footer, Nav) → KEEP in $lib/components/layout/

**Tool usage**:
```bash
# For each component, find all usages:
grep -r "from '\$lib/components/ComponentName" apps/web/src/routes/
grep -r "import.*ComponentName" apps/web/src/routes/
```

#### Step 2: Create Route Groups (if needed) (15 min)

Check if routes need organization:
- `(auth)/` - Login, register, reset-password routes
- `(app)/` - Authenticated app routes (dashboard, profile, etc.)
- `(marketing)/` - Public marketing pages (about, pricing, etc.)
- `(admin)/` - Admin-only routes

**Rule**: Layout groups use `(groupName)` syntax and share `+layout.svelte`

#### Step 3: Move Single-Use Components (1-2 hours)

For each single-use component:

1. **Move the file** from `$lib/components/X.svelte` → `routes/(group)/route/X.svelte`
2. **Update the import** in the route's `+page.svelte`:
   - Before: `import X from '$lib/components/X.svelte'`
   - After: `import X from './X.svelte'`
3. **Check for TypeScript errors** after each move
4. **Run dev server** to verify no breakage

**Example**:
```
# If LoginForm.svelte is ONLY used in routes/(auth)/login/+page.svelte:
apps/web/src/lib/components/LoginForm.svelte 
  → apps/web/src/routes/(auth)/login/LoginForm.svelte

# Then update +page.svelte:
- import LoginForm from '$lib/components/LoginForm.svelte'
+ import LoginForm from './LoginForm.svelte'
```

#### Step 4: Organize Multi-Use Components (30 min)

Keep multi-use components in `$lib/components/` but organize them:

```
apps/web/src/lib/components/
├── layout/              # Header, Footer, Nav, Sidebar
├── forms/               # Shared form components (Input, Button, etc.)
├── ui/                  # Generic UI (Modal, Toast, Dropdown, etc.)
├── product/             # Product-specific shared components
└── [other domains]/     # Group by domain if needed
```

#### Step 5: Validate Changes (30 min)

1. **Run TypeScript check**: `pnpm turbo check --filter=@apps/web`
2. **Run dev server**: `pnpm dev --filter=@apps/web`
3. **Test critical routes**: Login, dashboard, product pages
4. **Check for 404s or missing components**
5. **Run lint**: `pnpm turbo lint --filter=@apps/web`

### Route Colocation Best Practices

#### ✅ DO:
- Move components used in only ONE route
- Keep components close to where they're used
- Use relative imports (`./Component.svelte`)
- Name colocated components descriptively
- Group related components in route folders

#### ❌ DON'T:
- Move components used in multiple routes
- Move layout components (Header, Footer, Nav)
- Move generic UI components (Button, Input, Modal)
- Create deep nesting (keep routes flat when possible)
- Break working imports without testing

### Example Structure (Before → After)

**Before** (Current - Poor):
```
apps/web/src/
├── lib/
│   └── components/
│       ├── LoginForm.svelte              ← Used ONLY in login
│       ├── DashboardWidget.svelte        ← Used ONLY in dashboard
│       ├── ProductCard.svelte            ← Used in MULTIPLE places ✓
│       └── Header.svelte                 ← Layout component ✓
└── routes/
    ├── (auth)/
    │   └── login/
    │       └── +page.svelte              ← Imports from $lib
    └── (app)/
        └── dashboard/
            └── +page.svelte              ← Imports from $lib
```

**After** (Ideal - Good):
```
apps/web/src/
├── lib/
│   └── components/
│       ├── layout/
│       │   └── Header.svelte             ← Multi-use layout ✓
│       ├── product/
│       │   └── ProductCard.svelte        ← Multi-use component ✓
│       └── ui/
│           └── Button.svelte             ← Generic UI ✓
└── routes/
    ├── (auth)/
    │   └── login/
    │       ├── +page.svelte              ← Uses ./LoginForm.svelte
    │       └── LoginForm.svelte          ← Colocated! ✓
    └── (app)/
        └── dashboard/
            ├── +page.svelte              ← Uses ./DashboardWidget.svelte
            └── DashboardWidget.svelte    ← Colocated! ✓
```

### Expected Results

**After Phase 2:**
- ✅ Single-use components colocated with their routes
- ✅ Multi-use components organized in `$lib/components/`
- ✅ Cleaner import paths (relative instead of aliased)
- ✅ Easier to understand component usage
- ✅ Better code organization following official SvelteKit patterns
- ✅ Improved developer experience

### Completion Criteria

- [ ] All single-use components moved to their routes
- [ ] All multi-use components organized in `$lib/components/`
- [ ] All imports updated (no broken imports)
- [ ] TypeScript check passes
- [ ] Dev server runs without errors
- [ ] All critical routes tested and working
- [ ] `docs/02_LOG.md` updated with Phase 2 summary

## Rules

1. **Use IDEAL_STRUCTURE.md as the source of truth**
2. **Test after EVERY component move** (don't batch too many changes)
3. **Update imports immediately after moving files**
4. **Keep Header.svelte looking at the current file for reference**
5. **Ask before moving ambiguous cases** (when unsure if multi-use)
6. **Document decisions in 02_LOG.md**

## After Phase 2 Complete

Ask me:
"Phase 2 complete. Route colocation applied to SvelteKit 2 standards. Should I continue with Phase 3 (Package Structure) or do you want to validate Phase 2 first?"

Let's make this codebase beautiful. 🎨✨
