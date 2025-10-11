# PHASE 3 PROMPT: Package Structure & Monorepo Organization

## Context
This is a **professional SvelteKit 2 + Svelte 5 + Turborepo monorepo** being refactored to official best practices.

## Status (2025-10-11)
- ✅ **Phase 1 COMPLETE** - @repo/core is 100% framework-agnostic (0 SvelteKit imports)
- ✅ **Phase 2 COMPLETE** - Route colocation applied, 84% reduction in lib/components clutter
- ✅ **docs/IDEAL_STRUCTURE.md** - Official best practices reference
- ✅ **docs/02_LOG.md** - Complete Phase 1 & 2 documentation
- 🎯 **Ready for Phase 3: Package Structure & Monorepo Organization**

## Your Mission: Execute Phase 3 - Package Structure

**Read these files FIRST:**
1. `docs/IDEAL_STRUCTURE.md` (lines 100-350) - Package structure principles
2. `docs/02_LOG.md` (Phase 1 & 2 results)
3. `packages/` structure - Current package setup

### Phase 3 Objectives

Apply **Turborepo + SvelteKit best practices** for internal packages:

> **Principle**: Packages should be framework-agnostic, composable, and properly exported.
> **Principle**: Each package has a clear responsibility and minimal dependencies.

---

## Step-by-Step Execution Plan

### Step 1: Audit Package Structure (30 min)

Scan `packages/` and identify:
- **Package responsibilities** - What each package does
- **Framework contamination** - Packages importing SvelteKit/Svelte unnecessarily
- **Circular dependencies** - Packages depending on each other incorrectly
- **Export patterns** - Barrel files, named exports, default exports
- **Unused exports** - Dead code in packages

**Tool usage**:
```bash
# For each package, check imports
grep -r "from '@sveltejs/kit'" packages/
grep -r "from 'svelte'" packages/

# Check package.json dependencies
cat packages/*/package.json | grep -A 5 "dependencies"

# Check for circular deps
pnpm list --depth 1
```

### Step 2: Define Package Boundaries (20 min)

Create clear separation:

#### @repo/core (Framework-Agnostic Business Logic)
- ✅ **Already Complete** (Phase 1)
- Services, utilities, domain logic
- NO framework imports
- Pure TypeScript/JavaScript

#### @repo/ui (Svelte Components)
- Svelte 5 components
- Can import from @repo/i18n, @repo/core
- Should NOT import from apps/
- Proper component exports

#### @repo/i18n (Internationalization)
- Paraglide integration
- Message functions
- Locale utilities
- Framework-agnostic where possible

#### @repo/database (Database Types & Utilities)
- Supabase types
- Database helpers
- Query utilities
- NO UI components

#### @repo/domain (Domain Models & Types)
- TypeScript types
- Domain models
- Shared interfaces
- Pure types, no logic

#### @repo/testing (Test Utilities)
- Vitest configuration
- Test helpers
- Mocks
- Framework-agnostic testing utils

### Step 3: Audit @repo/ui Package (1-2 hours)

This is the biggest package - needs thorough audit:

1. **Component Organization**:
   ```bash
   # Check current structure
   ls -R packages/ui/src/lib/components/
   
   # Find all component files
   find packages/ui/src/lib/components/ -name "*.svelte"
   ```

2. **Identify Component Domains**:
   - `badges/` - Badge components
   - `buttons/` - Button components
   - `cards/` - Card components
   - `forms/` - Form components
   - `layout/` - Layout components
   - `modals/` - Modal components
   - `navigation/` - Navigation components
   - `product/` - Product-specific components
   - `ui/` - Generic UI components
   - Etc.

3. **Check for App-Specific Components**:
   - Components that should be in apps/web, not in @repo/ui
   - Components with hardcoded business logic
   - Components tightly coupled to specific routes

4. **Validate Exports**:
   ```bash
   # Check main export file
   cat packages/ui/src/index.ts
   
   # Find all component exports
   grep "export" packages/ui/src/index.ts
   ```

### Step 4: Organize @repo/ui Components (1-2 hours)

**Current suspected structure**:
```
packages/ui/src/lib/components/
├── badges/
├── buttons/
├── cards/
├── forms/
├── layout/
├── modals/
├── navigation/
├── product/
└── ui/
```

**Actions**:
1. Verify all components are in correct domain folders
2. Identify any app-specific components to move to apps/web
3. Check for unused components (dead code)
4. Validate component props and APIs are generic
5. Ensure no hardcoded business logic

### Step 5: Fix Package Exports (30 min)

**Each package should have**:

#### package.json Structure
```json
{
  "name": "@repo/ui",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "svelte": "./src/index.ts"
    },
    "./Button.svelte": {
      "types": "./src/lib/components/buttons/Button.svelte",
      "svelte": "./src/lib/components/buttons/Button.svelte"
    }
  },
  "svelte": "./src/index.ts",
  "types": "./src/index.ts"
}
```

#### Main Export File (src/index.ts)
```typescript
// GOOD: Named exports by domain
export { Button, PrimaryButton, SecondaryButton } from './lib/components/buttons';
export { Modal, ModalHeader, ModalFooter } from './lib/components/modals';
export { ProductCard, ProductGrid } from './lib/components/product';

// BAD: Avoid barrel file re-exports of everything
// export * from './lib/components'; // ❌ Don't do this
```

### Step 6: Validate Package Dependencies (30 min)

**Check dependency flow**:
```
apps/web
  ↓ can import from
  @repo/ui, @repo/i18n, @repo/core, @repo/database, @repo/domain
  
@repo/ui
  ↓ can import from
  @repo/i18n, @repo/core, @repo/domain
  ↓ CANNOT import from
  apps/*, @repo/database (UI shouldn't know about DB)

@repo/core
  ↓ can import from
  @repo/domain
  ↓ CANNOT import from
  apps/*, @repo/ui, @sveltejs/*

@repo/i18n
  ↓ standalone or minimal deps

@repo/database
  ↓ standalone or minimal deps

@repo/domain
  ↓ pure types, no deps
```

**Tool to check**:
```bash
# Check each package for forbidden imports
cd packages/ui && grep -r "from '@repo/database'" src/
cd packages/core && grep -r "from '@sveltejs/kit'" src/
cd packages/ui && grep -r "from '../../../apps/" src/
```

### Step 7: Document Package Architecture (30 min)

Create `packages/README.md`:
- Purpose of each package
- Dependency graph
- Import rules
- Export conventions
- How to add new packages

---

## Validation Criteria

- [ ] All packages have clear, single responsibility
- [ ] No framework contamination (@repo/core, @repo/domain are pure)
- [ ] No circular dependencies
- [ ] Proper export patterns (named exports by domain)
- [ ] No app-specific code in packages
- [ ] Package dependency flow is correct
- [ ] All package.json files properly configured
- [ ] TypeScript check passes
- [ ] Build passes for all packages
- [ ] Documentation created

---

## Expected Results

**After Phase 3**:
- ✅ Clear package boundaries and responsibilities
- ✅ Proper dependency flow (apps → ui → core → domain)
- ✅ @repo/ui organized by component domain
- ✅ No framework contamination in pure packages
- ✅ Clean exports (no barrel file anti-patterns)
- ✅ Documentation of package architecture
- ✅ Improved build times (cleaner deps)

---

## Package-Specific Focus Areas

### @repo/ui (Main Focus)
- [ ] Audit all components for app-specific logic
- [ ] Organize into clear domains
- [ ] Fix exports (named exports by domain)
- [ ] Remove unused components
- [ ] Validate props are generic
- [ ] Check for hardcoded values

### @repo/i18n
- [ ] Verify Paraglide integration
- [ ] Check message exports
- [ ] Validate locale utilities
- [ ] Ensure framework-agnostic where possible

### @repo/database
- [ ] Verify it's only types and utilities
- [ ] No UI components
- [ ] No business logic
- [ ] Proper Supabase type generation

### @repo/domain
- [ ] Verify pure TypeScript types
- [ ] No runtime logic
- [ ] No framework imports
- [ ] Shared interfaces only

### @repo/testing
- [ ] Vitest config organized
- [ ] Test utilities framework-agnostic
- [ ] Mock helpers properly typed

---

## Rules

1. **Use IDEAL_STRUCTURE.md as the source of truth**
2. **Test after EVERY package change** (don't batch too many changes)
3. **Update imports immediately after refactoring**
4. **Check for circular dependencies after each change**
5. **Ask before moving ambiguous components**
6. **Document decisions in 02_LOG.md**

---

## After Phase 3 Complete

Ask me:
"Phase 3 complete. Package structure organized to Turborepo + SvelteKit standards. Should I continue with Phase 4 (Advanced Features) or do you want to validate Phase 3 first?"

---

## Tools & Commands

### Audit Commands
```bash
# List all packages
ls -la packages/

# Check package dependencies
pnpm list --depth 1

# Find all .svelte files in @repo/ui
find packages/ui/src -name "*.svelte" | wc -l

# Search for framework imports in core
grep -r "@sveltejs" packages/core/

# Check exports
cat packages/ui/src/index.ts | grep "export"
```

### Build & Test Commands
```bash
# Build all packages
pnpm turbo build --filter="@repo/*"

# Test specific package
pnpm turbo test --filter="@repo/core"

# Check TypeScript across all packages
pnpm turbo check
```

### Validation Commands
```bash
# Check for circular deps
pnpm list --depth 2 | grep "@repo"

# Validate exports
cd packages/ui && pnpm pack --dry-run

# Check TypeScript
cd packages/ui && pnpm tsc --noEmit
```

---

## Success Criteria

Phase 3 is complete when:
- ✅ All packages audited and documented
- ✅ @repo/ui components organized by domain
- ✅ No app-specific code in packages
- ✅ Clean dependency flow (no forbidden imports)
- ✅ Proper exports (no barrel file anti-patterns)
- ✅ All packages build successfully
- ✅ TypeScript check passes
- ✅ Documentation created

Let's make this monorepo architecture beautiful! 🏗️✨
