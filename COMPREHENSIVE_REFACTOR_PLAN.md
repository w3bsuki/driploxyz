# Comprehensive Refactor Plan: Driplo Turbo

## Executive Summary

This plan addresses the critical issues in your Driplo project:
- **Massive dependency bloat** (770 packages → target ~200)
- **Code structure issues** (duplicates, dead code, over-engineering)
- **Svelte 5/Kit 2 optimization** (effect overuse, improper patterns)
- **Production stability** (crashes, performance issues)
- **Architecture cleanup** (proper package boundaries)

## Phase 1: Dependency Cleanup & Package Bloat Reduction

### Current State Analysis
- **770 total packages** (insane for a SvelteKit storefront)
- Heavy dev tools, duplicate UI libraries, unnecessary testing frameworks
- Multiple image processing libraries, monitoring tools with overlapping functionality

### Actions

#### 1.1 Remove Heavy Dev Tools (-50 packages)
```bash
# Remove these packages:
- knip, jscpd, @lhci/cli, c8
- @testing-library/* (keep only essential)
- chai, jsdom (use vitest + happy-dom)
- web-vitals (use Vercel's built-in)
```

#### 1.2 Optimize UI Components (-40 packages)
```bash
# Remove:
- @melt-ui/pp, @melt-ui/svelte (heavy dependency tree)
- tailwind-variants, tailwind-merge (use clsx)
- Keep: bits-ui + custom components
```

#### 1.3 Simplify Testing Stack (-25 packages)
```bash
# Remove:
- jsdom, @testing-library/*, chai
- Keep: @playwright/test, vitest, happy-dom
```

#### 1.4 Database Optimization (-30 packages)
```bash
# Remove:
- kysely, pg-protocol, pg-types, postgres-array
- Keep: @supabase/supabase-js (direct client)
```

#### 1.5 Image Processing Simplification (-35 packages)
```bash
# Remove:
- vite-imagetools, imagetools-core, browser-image-compression
- Keep: sharp only (server-side)
```

#### 1.6 Monitoring & Analytics Cleanup (-20 packages)
```bash
# Remove:
- @sentry/sveltekit (use Vercel's built-in monitoring)
- web-vitals
- Keep: essential monitoring only
```

### Expected Result
**770 → ~200 packages (74% reduction)**

## Phase 2: Code Structure Cleanup & Dead Code Removal

### Current Issues
- 238 files identified for removal in CLEANUP-DELETE-MANIFEST.json
- Duplicate components across packages
- Stale documentation and refactor artifacts
- Disabled routes and unused utilities

### Actions

#### 2.1 Execute Cleanup Manifest
```bash
# Remove all files identified in CLEANUP-DELETE-MANIFEST.json
# Focus on:
- Artifact files (*.txt, temp files)
- Stale documentation (docs/refactor/*)
- Disabled routes (apps/web/src/routes/category/slug_disabled)
```

#### 2.2 Remove Duplicate Components
```bash
# Identify and remove duplicates:
- apps/web/src/lib/components vs @repo/ui components
- Consolidate to @repo/ui only
- Remove app-specific duplicates
```

#### 2.3 Clean apps/web/src/lib Structure
```bash
# Reorganize into logical groups:
- auth/ → @repo/core/auth
- services/ → @repo/core/services
- stripe/ → @repo/core/stripe
- email/ → @repo/core/email
- Keep only app-specific code in apps/web/src/lib
```

#### 2.4 Remove Unused Utilities
```bash
# Audit and remove:
- Duplicate utility functions
- Unused validation schemas
- Redundant type definitions
- Dead code paths
```

## Phase 3: Svelte 5/Kit 2 Optimization & Effect Overuse Fixes

### Current Issues
- Potential overuse of $effect
- Improper Svelte 5 patterns
- Non-optimal state management

### Actions

#### 3.1 Audit Effect Usage
```bash
# Search for $effect overuse:
grep -r "\$effect" apps/web/src/packages/
# Identify patterns:
- Complex logic in effects (should be $derived)
- Missing dependencies
- Side effects that should be in actions
```

#### 3.2 Fix Svelte 5 Patterns
```typescript
// Replace improper patterns:
// ❌ Old pattern
export let prop;
$: doubled = prop * 2;

// ✅ New pattern
let { prop } = $props();
let doubled = $derived(() => prop * 2);
```

#### 3.3 Optimize State Management
```typescript
// Replace inefficient patterns:
// ❌ Multiple $state for related data
let user = $state(null);
let isLoading = $state(false);
let error = $state(null);

// ✅ Single $state object
let state = $state({
  user: null,
  isLoading: false,
  error: null
});
```

#### 3.4 Fix Component Props
```typescript
// Ensure proper prop destructuring:
let { 
  title = 'Default',
  onClick,
  class: className = ''
} = $props();
```

## Phase 4: Architecture Rationalization & Package Boundary Enforcement

### Current Issues
- Business logic scattered across apps/web/src/lib
- UI package contains services
- Domain logic not properly separated

### Actions

#### 4.1 Move Business Logic to @repo/core
```bash
# Move these directories:
apps/web/src/lib/services/ → packages/core/src/services/
apps/web/src/lib/stripe/ → packages/core/src/stripe/
apps/web/src/lib/email/ → packages/core/src/email/
apps/web/src/lib/auth/ → packages/core/src/auth/ (enhance existing)
```

#### 4.2 Clean @repo/ui Package
```bash
# Remove from @repo/ui:
- All services (CategoryNavigationService, etc.)
- Business logic
- Keep only: pure components, styles, design tokens
```

#### 4.3 Strengthen @repo/domain
```bash
# Enhance domain package:
- Move business rules from @repo/core
- Add entity definitions
- Add domain services
- Add validation schemas
```

#### 4.4 Enforce Package Boundaries
```typescript
// Add eslint rules to prevent:
// - @repo/ui importing @repo/core
// - apps/web importing directly from packages (use aliases)
// - Circular dependencies
```

## Phase 5: Testing & Documentation Consolidation

### Current Issues
- Too many test files with low coverage
- Scattered documentation
- Outdated testing strategies

### Actions

#### 5.1 Consolidate Test Files
```bash
# Remove redundant tests:
- Keep only essential unit tests
- Focus on integration tests for critical paths
- Remove --passWithNoTests flags
```

#### 5.2 Update Documentation
```bash
# Consolidate to essential docs:
- Keep: README.md, ARCHITECTURE.md, DEVELOPMENT.md
- Archive: refactor-plans/, docs/archive/
- Create: DEPLOYMENT.md, TROUBLESHOOTING.md
```

#### 5.3 Testing Strategy
```typescript
// Focus on:
- Critical user journeys (checkout, auth)
- API endpoints
- Database operations
- Component integration
```

## Phase 6: Performance Optimization & Production Readiness

### Current Issues
- Production crashes
- Slow bundle sizes
- Memory leaks

### Actions

#### 6.1 Bundle Optimization
```typescript
// Implement code splitting:
- Lazy load routes
- Dynamic imports for heavy components
- Optimize vendor chunks
```

#### 6.2 Database Optimization
```sql
-- Add missing indexes:
- Products search vectors
- User queries
- Order lookups
```

#### 6.3 Error Handling
```typescript
// Add comprehensive error boundaries:
- Route-level error handling
- Component-level fallbacks
- Global error logging
```

#### 6.4 Monitoring Setup
```typescript
// Essential monitoring only:
- Error tracking
- Performance metrics
- User journey analytics
```

## Phase 7: Final Polish & CLI Agent Handoff

### Actions

#### 7.1 Final Code Review
```bash
# Review:
- All package.json files
- Import statements
- Type definitions
- Configuration files
```

#### 7.2 Prepare for CLI Agent
```bash
# Create tasks for CLI agent:
- Svelte 5/Kit 2 specific optimizations
- Supabase integration improvements
- Paraglide i18n enhancements
- Tailwind CSS v4 migration
```

#### 7.3 Documentation for CLI Agent
```markdown
# CLI Agent Tasks
1. Run Svelte MCP to verify component patterns
2. Use Supabase MCP to optimize database queries
3. Implement remaining Svelte 5 best practices
4. Optimize Tailwind CSS v4 usage
```

## Implementation Strategy

### Order of Operations
1. **Phase 1** (Dependency cleanup) - Reduces complexity first
2. **Phase 2** (Code cleanup) - Removes dead weight
3. **Phase 3** (Svelte optimization) - Fixes framework issues
4. **Phase 4** (Architecture) - Reorganizes structure
5. **Phase 5** (Testing/Docs) - Consolidates documentation
6. **Phase 6** (Performance) - Optimizes for production
7. **Phase 7** (Handoff) - Prepares for CLI agent

### Risk Mitigation
- **Backup strategy**: Create git tag before each phase
- **Testing**: Verify functionality after each phase
- **Rollback plan**: Keep revert scripts ready
- **Staging**: Test in staging environment before production

### Success Metrics
- **Package count**: 770 → ~200 (74% reduction)
- **Build time**: 50% faster
- **Bundle size**: 40% smaller
- **Type errors**: 0
- **Lint errors**: 0
- **Test coverage**: 60%+
- **Production crashes**: 0

## Next Steps

1. **Immediate**: Fix current errors to get working state
2. **Phase 1**: Start dependency cleanup
3. **CLI Agent**: Handle Svelte/Supabase specific optimizations
4. **Production**: Deploy optimized version

This plan will transform your project from an over-engineered, unstable codebase to a clean, maintainable, and performant Svelte 5/Kit 2 application.