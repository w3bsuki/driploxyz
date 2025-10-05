# Phase 1 Implementation Guide: Critical Build Blockers

**Objective:** Resolve all build failures to establish a working foundation  
**Timeline:** Week 1 (October 3-7, 2025)  
**Priority:** CRITICAL - Must complete before any other work

---

## Overview

This guide provides step-by-step instructions to fix the critical build blockers preventing the Driplo application from building successfully. These issues must be resolved first before proceeding with any other improvements.

## Current Build Issues

1. **FormField Export Missing** - Build fails due to missing export from @repo/ui
2. **Domain Package Not Built** - @repo/domain exists but has no dist folder
3. **TypeScript Errors** - Type safety violations preventing clean build

---

## Task 1: Fix FormField Export Issue

### Problem
```
error during build:
src/routes/(auth)/signup/+page.svelte (10:11): "FormField" is not exported by "../../packages/ui/src/lib/index.ts"
```

### Investigation Steps
1. First, verify if FormField component exists:
```bash
find packages/ui/src -name "*FormField*" -type f
```

2. Check the current exports in packages/ui/src/lib/index.ts:
```bash
cat packages/ui/src/lib/index.ts
```

### Solution Options

#### Option A: FormField Exists (Most Likely)
If FormField component exists but isn't exported:

1. Add FormField to the exports in `packages/ui/src/lib/index.ts`:
```typescript
// Add this line to the exports section
export { FormField } from './components/forms/FormField.svelte';
```

2. Verify the import path is correct:
```bash
ls packages/ui/src/lib/components/forms/
```

#### Option B: FormField Doesn't Exist
If FormField component doesn't exist:

1. Check what form components are available:
```bash
ls packages/ui/src/lib/components/forms/
```

2. Either:
   - Create a basic FormField component, OR
   - Replace FormField usage with an existing component, OR
   - Use a simple input field directly

### Verification
```bash
# Build UI package
pnpm --filter @repo/ui build

# Test web app build
pnpm --filter web build
```

---

## Task 2: Build @repo/domain Package

### Problem
The @repo/domain package exists but hasn't been built, causing import resolution failures.

### Investigation Steps
1. Check if domain package has build configuration:
```bash
cat packages/domain/tsup.config.ts
```

2. Verify source files exist:
```bash
ls -la packages/domain/src/
```

### Solution Steps

1. Navigate to domain package:
```bash
cd packages/domain
```

2. Install dependencies (if needed):
```bash
pnpm install
```

3. Build the package:
```bash
pnpm build
```

4. Verify dist folder was created:
```bash
ls -la packages/domain/dist/
```

5. Check if exports are working:
```bash
cat packages/domain/dist/index.js
```

### If Build Fails

#### Common Issues and Solutions:

1. **TypeScript Errors in Domain Package**
   - Fix TypeScript issues in domain source files
   - Check tsconfig.json configuration

2. **Missing Dependencies**
   - Install missing workspace dependencies
   - Check peer dependencies are satisfied

3. **Build Configuration Issues**
   - Verify tsup.config.ts is correct
   - Check entry points are properly defined

### Verification
```bash
# Test domain package build
pnpm --filter @repo/domain build

# Test integration with web app
pnpm --filter web build
```

---

## Task 3: Fix TypeScript Errors

### Problem
TypeScript errors are preventing clean builds and reducing type safety.

### Investigation Steps
1. Check current TypeScript errors:
```bash
pnpm --filter web check-types
```

2. Review specific error messages and locations

### Common TypeScript Issues and Solutions

#### 1. `any` Type Usage
**Problem:** Using `any` type reduces type safety
**Solution:** Replace with proper TypeScript interfaces

Example:
```typescript
// Bad
function processData(data: any) {
  return data.value;
}

// Good
interface ProcessData {
  value: string;
  id: number;
}

function processData(data: ProcessData) {
  return data.value;
}
```

#### 2. Missing Type Exports
**Problem:** Types not properly exported from modules
**Solution:** Add proper type exports

Example:
```typescript
// In types file
export interface Locals {
  session: Session | null;
  user: User | null;
}

// In consuming file
import type { Locals } from '$lib/types';
```

#### 3. Import Resolution Issues
**Problem:** TypeScript can't find imported modules
**Solution:** Fix import paths and module resolution

Example:
```typescript
// Bad
import { something } from '../../../deeply/nested/file';

// Good
import { something } from '@repo/core';
```

### Systematic Approach

1. **Fix errors in dependency order:**
   - Fix @repo/core first
   - Then @repo/domain
   - Then @repo/ui
   - Finally apps/web

2. **Use TypeScript compiler output:**
   ```bash
   pnpm --filter web check-types --pretty
   ```

3. **Fix errors one by one:**
   - Address each error systematically
   - Don't introduce new errors while fixing others

### Verification
```bash
# Check TypeScript compilation
pnpm --filter web check-types

# Should show: " TypeScript compilation successful"
```

---

## Daily Workflow

### Day 1: FormField Export Fix
1. Morning: Investigate FormField issue
2. Afternoon: Implement fix and test
3. End of day: Verify build progress

### Day 2: Domain Package Build
1. Morning: Build domain package
2. Afternoon: Fix any build issues
3. End of day: Verify integration

### Day 3-4: TypeScript Error Resolution
1. Morning: Check all TypeScript errors
2. Afternoon: Fix errors systematically
3. End of day: Verify clean compilation

### Day 5: Integration Testing
1. Morning: Full build test
2. Afternoon: Fix any remaining issues
3. End of day: Complete Phase 1

---

## Commands Reference

### Build Commands
```bash
# Build individual packages
pnpm --filter @repo/ui build
pnpm --filter @repo/domain build
pnpm --filter @repo/core build

# Build web app
pnpm --filter web build

# Build all packages
pnpm -r build
```

### Check Commands
```bash
# TypeScript checking
pnpm --filter web check-types
pnpm --filter @repo/ui check-types
pnpm --filter @repo/domain check-types

# Linting
pnpm --filter web lint
pnpm --filter @repo/ui lint
pnpm --filter @repo/domain lint
```

### Test Commands
```bash
# Run tests
pnpm --filter web test
pnpm --filter @repo/ui test
pnpm --filter @repo/domain test
```

---

## Troubleshooting

### Common Build Issues

1. **"Cannot resolve module" errors**
   - Check if package is built
   - Verify export paths
   - Check package.json exports field

2. **TypeScript compilation errors**
   - Check tsconfig.json configuration
   - Verify type imports
   - Check for circular dependencies

3. **Vite build failures**
   - Clear cache: `rm -rf node_modules/.vite`
   - Check rollup configuration
   - Verify plugin compatibility

### Getting Help

1. Check error messages carefully
2. Look at the file and line numbers
3. Check recent changes in git
4. Review package.json dependencies
5. Consult team members

---

## Success Criteria

Phase 1 is complete when:

- [ ] `pnpm --filter @repo/ui build` succeeds
- [ ] `pnpm --filter @repo/domain build` succeeds
- [ ] `pnpm --filter web build` succeeds
- [ ] `pnpm --filter web check-types` shows zero errors
- [ ] All imports resolve correctly
- [ ] No build errors in CI/CD

---

## Next Steps

After completing Phase 1:

1. Update the main todo list
2. Begin Phase 2: Code Quality & Linting
3. Continue with systematic improvements
4. Maintain build health throughout development

---

## Notes

- Take screenshots of error messages before fixing
- Commit changes after each successful fix
- Document any unexpected issues found
- Keep track of time spent on each task
- Communicate progress to team regularly

*This guide should be updated as new information is discovered during implementation.*