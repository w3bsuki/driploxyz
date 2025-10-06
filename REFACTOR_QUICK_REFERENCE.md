# Refactor Quick Reference Guide

## 🚀 Emergency Commands

### If something goes wrong:
```bash
# Rollback everything
git reset --hard HEAD~1

# Or rollback to specific tag
git reset --hard refactor-backup-YYYYMMDD-HHMMSS

# Reinstall clean dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Check current status:
```bash
# Check package count
pnpm list --depth=0 | grep -c "├──"

# Check build
pnpm build

# Check lint
pnpm lint

# Check types
pnpm check-types
```

## 📦 Phase 1: Dependency Cleanup (770 → ~200 packages)

### Commands to run:
```bash
# Remove heavy dev tools
pnpm remove knip jscpd @lhci/cli c8 web-vitals
pnpm remove @testing-library/svelte @testing-library/jest-dom chai jsdom

# Remove UI bloat
pnpm remove @melt-ui/pp @melt-ui/svelte tailwind-variants tailwind-merge
pnpm add clsx

# Remove database bloat
pnpm remove kysely pg-protocol pg-types postgres-array postgres-bytea

# Remove image processing bloat
pnpm remove vite-imagetools imagetools-core browser-image-compression fflate

# Remove monitoring bloat
pnpm remove @sentry/sveltekit @sentry/vite-plugin @sentry/cli

# Clean up
pnpm install
```

### Files to update:
- `apps/web/package.json`
- `packages/ui/package.json`
- `packages/core/package.json`
- `packages/domain/package.json`

## 🧹 Phase 2: Code Structure Cleanup

### Remove files:
```bash
# Artifact files
rm -f temp_types.ts testfile.txt remaining_errors.txt
rm -f remaining-typescript-errors.txt lint-current.txt lint-output.txt
rm -f lint-validation.txt build-validation.txt types-validation.txt
rm -f unused_vars_inventory.txt NUL
rm -rf apps/web/playwright-report
rm -f apps/web/nul

# Stale documentation
rm -rf docs/refactor/

# Disabled routes
rm -rf apps/web/src/routes/category/slug_disabled
```

### Move directories:
```bash
# Create directories in @repo/core
mkdir -p packages/core/src/services
mkdir -p packages/core/src/stripe
mkdir -p packages/core/src/email

# Move services
mv apps/web/src/lib/services/* packages/core/src/services/
mv apps/web/src/lib/stripe/* packages/core/src/stripe/
mv apps/web/src/lib/email/* packages/core/src/email/
```

## ⚡ Phase 3: Svelte 5/Kit 2 Optimization

### Find effects:
```bash
# Search for $effect usage
grep -r "\$effect" apps/web/src/packages/
```

### Fix patterns:
```svelte
<!-- Before -->
<script>
  export let user;
  $: displayName = user?.name || 'Guest';
</script>

<!-- After -->
<script>
  let { user } = $props();
  let displayName = $derived(() => user?.name || 'Guest');
</script>
```

## 🏗️ Phase 4: Architecture Rationalization

### Update package.json exports:
```json
// packages/core/package.json
"exports": {
  "./services": "./dist/services/index.js",
  "./stripe": "./dist/stripe/index.js",
  "./email": "./dist/email/index.js"
}
```

### Fix imports:
```typescript
// Before
import { createClient } from '../../../packages/core/src/supabase';

// After
import { createClient } from '@repo/core/supabase';
```

## 🧪 Phase 5: Testing & Documentation

### Remove --passWithNoTests:
```json
// All package.json files
{
  "scripts": {
    "test": "vitest run"  // Remove --passWithNoTests
  }
}
```

### Consolidate docs:
```bash
# Keep only essential docs
mv docs/ARCHITECTURE.md docs/DEVELOPMENT.md docs/FRAMEWORKS.md docs/TESTING.md docs/SUPABASE.md ./
rm -rf docs/
mkdir docs/
mv *.md docs/
```

## 🚀 Phase 6: Performance Optimization

### Add error boundaries:
```svelte
<!-- apps/web/src/routes/+layout.svelte -->
<script>
  import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';
</script>

<ErrorBoundary>
  <slot />
</ErrorBoundary>
```

### Database indexes:
```sql
-- Add to Supabase
CREATE INDEX CONCURRENTLY idx_products_search_vector ON products USING gin(search_vector);
CREATE INDEX CONCURRENTLY idx_products_category_status ON products(category_id, status);
```

## 🤖 Phase 7: CLI Agent Handoff

### Create tasks file:
```markdown
# CLI Agent Tasks
1. Use Svelte MCP to verify component patterns
2. Use Supabase MCP to optimize queries
3. Optimize Paraglide i18n
4. Migrate to Tailwind CSS v4
```

## 📊 Success Metrics

### Target numbers:
- **Packages**: 770 → 200 (74% reduction)
- **Build time**: 50% faster
- **Bundle size**: 40% smaller
- **Type errors**: 0
- **Lint errors**: 0
- **Test coverage**: 60%+

## 🔍 Verification Commands

### After each phase:
```bash
# Build
pnpm build

# Lint
pnpm lint

# Type check
pnpm check-types

# Test
pnpm test

# Package count
pnpm list --depth=0 | grep -c "├──"
```

## 🚨 Critical Warnings

### DO NOT:
- ❌ Skip backup before starting
- ❌ Run multiple phases at once
- ❌ Skip testing after each phase
- ❌ Delete files without checking

### ALWAYS:
- ✅ Create backup tag before each phase
- ✅ Test after each phase
- ✅ Commit after successful phase
- ✅ Verify functionality still works

## 📝 Quick Checklists

### Before starting:
- [ ] Current code committed
- [ ] Backup tag created
- [ ] Environment variables backed up
- [ ] Have time to complete full phase

### After each phase:
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes
- [ ] Tests pass
- [ ] Key functionality works
- [ ] Commit changes

## 🆘 Troubleshooting

### Build fails:
1. Check package.json dependencies
2. Clear node_modules and reinstall
3. Check import paths

### Type errors:
1. Check @repo/* aliases
2. Verify exports in packages
3. Update imports

### Runtime errors:
1. Check Svelte 5 patterns
2. Verify $state/$derived usage
3. Check component props

Keep this guide handy while executing the refactor!