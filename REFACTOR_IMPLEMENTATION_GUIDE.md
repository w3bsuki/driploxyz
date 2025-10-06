# Refactor Implementation Guide

## Phase 1: Dependency Cleanup & Package Bloat Reduction

### 1.1 Remove Heavy Dev Tools

#### Update apps/web/package.json
```json
{
  "devDependencies": {
    "@sveltejs/adapter-vercel": "^5.10.2",
    "@sveltejs/enhanced-img": "^0.8.1",
    "@sveltejs/kit": "^2.36.2",
    "@sveltejs/vite-plugin-svelte": "^6.1.2",
    "@tailwindcss/vite": "^4.1.12",
    "eslint": "^9.31.0",
    "prettier": "^3.6.0",
    "prettier-plugin-svelte": "^3.4.0",
    "svelte": "^5.36.12",
    "svelte-check": "^4.3.0",
    "tailwindcss": "^4.1.12",
    "tslib": "^2.8.1",
    "typescript": "5.8.2",
    "vite": "^7.1.2",
    "vitest": "^3.2.4"
    // Removed: knip, jscpd, @lhci/cli, c8, @testing-library/*, chai, jsdom, web-vitals
  }
}
```

#### Update packages/ui/package.json
```json
{
  "devDependencies": {
    "@sveltejs/adapter-auto": "^4.0.0",
    "@sveltejs/kit": "^2.36.2",
    "@sveltejs/package": "^2.5.0",
    "@sveltejs/vite-plugin-svelte": "^6.1.4",
    "@types/node": "^22.0.0",
    "@vitest/ui": "^3.2.4",
    "eslint": "^9.31.0",
    "prettier": "^3.6.0",
    "svelte": "^5.36.12",
    "svelte-check": "^4.0.0",
    "typescript": "^5.8.2",
    "vite": "^7.1.2",
    "vitest": "^3.2.4"
    // Removed: @melt-ui/pp, @melt-ui/svelte, tailwind-variants, tailwind-merge
  },
  "dependencies": {
    "@repo/database": "workspace:*",
    "@repo/i18n": "workspace:*",
    "clsx": "^2.0.0",
    "tslib": "^2.7.0",
    "zod": "^3.22.4"
    // Removed: tailwind-variants, tailwind-merge
  }
}
```

### 1.2 Execute Cleanup Commands

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

## Phase 2: Code Structure Cleanup & Dead Code Removal

### 2.1 Execute Cleanup Manifest

```bash
# Remove artifact files
rm -f temp_types.ts testfile.txt remaining_errors.txt
rm -f remaining-typescript-errors.txt lint-current.txt lint-output.txt
rm -f lint-validation.txt build-validation.txt types-validation.txt
rm -f unused_vars_inventory.txt NUL
rm -rf apps/web/playwright-report
rm -f apps/web/nul

# Remove stale documentation
rm -rf docs/refactor/
rm -f docs/refactor/cleanup-checklist.md
rm -f docs/refactor/CODEX-*.md
rm -f docs/refactor/PHASE-*.md
rm -f docs/refactor/QUICK-REFERENCE*.md
rm -f docs/refactor/TASK-*.md
rm -f docs/refactor/TOAST-SYSTEM-DOCUMENTATION.md
rm -rf docs/refactor/reports/
rm -rf docs/refactor/workflows/

# Remove disabled routes
rm -rf apps/web/src/routes/category/slug_disabled
```

### 2.2 Move Services to @repo/core

```bash
# Create directories in @repo/core
mkdir -p packages/core/src/services
mkdir -p packages/core/src/stripe
mkdir -p packages/core/src/email

# Move services
mv apps/web/src/lib/services/* packages/core/src/services/
mv apps/web/src/lib/stripe/* packages/core/src/stripe/
mv apps/web/src/lib/email/* packages/core/src/email/

# Update packages/core/src/index.ts
export * from './services';
export * from './stripe';
export * from './email';
```

### 2.3 Clean @repo/ui Package

```bash
# Remove services from UI package
rm -rf packages/ui/src/lib/services/
rm -f packages/ui/src/lib/services/CategoryNavigationService.ts

# Update packages/ui/src/lib/index.ts
export * from './components';
export * from './styles';
export * from './utils';
// Remove service exports
```

## Phase 3: Svelte 5/Kit 2 Optimization

### 3.1 Find and Fix Effect Overuse

Create a script to find effect usage:
```typescript
// scripts/find-effects.ts
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

function findEffects(dir: string) {
  const files = readdirSync(dir, { recursive: true });
  
  files.forEach(file => {
    if (typeof file === 'string' && file.endsWith('.svelte')) {
      const content = readFileSync(join(dir, file), 'utf-8');
      if (content.includes('$effect')) {
        console.log(`Found $effect in: ${file}`);
      }
    }
  });
}

findEffects('apps/web/src');
findEffects('packages/ui/src');
```

### 3.2 Fix Common Svelte 5 Issues

#### Replace improper patterns:
```svelte
<!-- Before -->
<script>
  export let user;
  $: displayName = user?.name || 'Guest';
  
  $effect(() => {
    console.log('User changed:', user);
  });
</script>

<!-- After -->
<script>
  let { user } = $props();
  let displayName = $derived(() => user?.name || 'Guest');
  
  $effect(() => {
    console.log('User changed:', user);
  });
</script>
```

### 3.3 Update Component Props

```svelte
<!-- Before -->
<script>
  export let title = 'Default';
  export let onClick;
  export let class: className = '';
</script>

<!-- After -->
<script>
  let { 
    title = 'Default',
    onClick,
    class: className = ''
  } = $props();
</script>
```

## Phase 4: Architecture Rationalization

### 4.1 Update Package Exports

#### packages/core/package.json
```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    },
    "./auth": {
      "types": "./dist/auth/index.d.ts",
      "import": "./dist/auth/index.js",
      "default": "./dist/auth/index.js"
    },
    "./services": {
      "types": "./dist/services/index.d.ts",
      "import": "./dist/services/index.js",
      "default": "./dist/services/index.js"
    },
    "./stripe": {
      "types": "./dist/stripe/index.d.ts",
      "import": "./dist/stripe/index.js",
      "default": "./dist/stripe/index.js"
    },
    "./email": {
      "types": "./dist/email/index.d.ts",
      "import": "./dist/email/index.js",
      "default": "./dist/email/index.js"
    }
  }
}
```

### 4.2 Update Import Statements

#### apps/web/src/lib/components/ProductCard.svelte
```typescript
// Before
import { createClient } from '../../../packages/core/src/supabase';
import { formatPrice } from '../utils/currency';

// After
import { createClient } from '@repo/core/supabase';
import { formatPrice } from '@repo/ui/utils';
```

### 4.3 Add ESLint Rules for Package Boundaries

#### packages/eslint-config/index.js
```javascript
module.exports = {
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@repo/ui/*'],
            message: 'UI package should not import from other packages'
          }
        ]
      }
    ]
  }
};
```

## Phase 5: Testing & Documentation Consolidation

### 5.1 Update Test Scripts

#### apps/web/package.json
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest run --coverage --threshold=40"
    // Removed: --passWithNoTests
  }
}
```

#### packages/ui/package.json
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest run --coverage --threshold=50"
    // Removed: --passWithNoTests
  }
}
```

### 5.2 Consolidate Documentation

```bash
# Keep essential docs
mv docs/ARCHITECTURE.md ./
mv docs/DEVELOPMENT.md ./
mv docs/FRAMEWORKS.md ./
mv docs/TESTING.md ./
mv docs/SUPABASE.md ./

# Archive the rest
mkdir -p docs/archive/old
mv docs/* docs/archive/old/ 2>/dev/null || true

# Move back essential docs
mv ./ARCHITECTURE.md docs/
mv ./DEVELOPMENT.md docs/
mv ./FRAMEWORKS.md docs/
mv ./TESTING.md docs/
mv ./SUPABASE.md docs/
```

## Phase 6: Performance Optimization

### 6.1 Optimize Bundle Size

#### apps/web/src/app.html
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

### 6.2 Add Error Boundaries

#### apps/web/src/routes/+layout.svelte
```svelte
<script>
  import { page } from '$app/stores';
  import { onError } from '@sveltejs/kit';
  import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';

  onError((error) => {
    console.error('Application error:', error);
  });
</script>

<ErrorBoundary>
  <slot />
</ErrorBoundary>
```

### 6.3 Database Optimization

```sql
-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_products_search_vector ON products USING gin(search_vector);
CREATE INDEX CONCURRENTLY idx_products_category_status ON products(category_id, status);
CREATE INDEX CONCURRENTLY idx_profiles_seller ON profiles(is_seller, created_at) WHERE is_seller = true;
CREATE INDEX CONCURRENTLY idx_orders_user_status ON orders(user_id, status);
```

## Phase 7: CLI Agent Handoff

### 7.1 Create CLI Agent Tasks

#### tasks/cli-agent-tasks.md
```markdown
# CLI Agent Tasks

## Svelte 5/Kit 2 Optimizations
1. Use Svelte MCP to verify all components use proper Svelte 5 patterns
2. Check for proper $state, $derived, and $effect usage
3. Verify component props are properly destructured with $props()
4. Optimize reactivity patterns

## Supabase Optimizations
1. Use Supabase MCP to optimize database queries
2. Check RLS policies for performance
3. Optimize real-time subscriptions
4. Verify proper connection pooling

## Paraglide i18n Enhancements
1. Optimize message bundles
2. Implement locale-specific routing
3. Add missing translations
4. Optimize build process

## Tailwind CSS v4 Migration
1. Migrate to Tailwind CSS v4 syntax
2. Optimize CSS bundle size
3. Implement CSS-in-JS for dynamic styles
4. Remove unused CSS classes
```

### 7.2 Final Verification Script

#### scripts/final-verification.js
```javascript
import { execSync } from 'child_process';

console.log('🔍 Running final verification...');

// Check package count
const packageCount = execSync('pnpm list --depth=0 | grep -c "├──"', { encoding: 'utf-8' });
console.log(`📦 Package count: ${packageCount.trim()}`);

// Check build
try {
  execSync('pnpm build', { stdio: 'inherit' });
  console.log('✅ Build successful');
} catch (error) {
  console.log('❌ Build failed');
}

// Check lint
try {
  execSync('pnpm lint', { stdio: 'inherit' });
  console.log('✅ Lint passed');
} catch (error) {
  console.log('❌ Lint failed');
}

// Check types
try {
  execSync('pnpm check-types', { stdio: 'inherit' });
  console.log('✅ Type check passed');
} catch (error) {
  console.log('❌ Type check failed');
}

console.log('🎉 Verification complete!');
```

## Execution Order

1. **Run Phase 1** - Dependency cleanup
2. **Run Phase 2** - Code structure cleanup
3. **Run Phase 3** - Svelte optimization
4. **Run Phase 4** - Architecture fixes
5. **Run Phase 5** - Testing/docs cleanup
6. **Run Phase 6** - Performance optimization
7. **Run Phase 7** - CLI agent handoff

## Rollback Commands

```bash
# If anything goes wrong, rollback to before refactor:
git tag refactor-backup-$(date +%Y%m%d-%H%M%S)
git reset --hard HEAD~1  # Rollback one phase at a time
```

This guide provides step-by-step instructions for each phase of the refactor. Execute each phase completely before moving to the next one.