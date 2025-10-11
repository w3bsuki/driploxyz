# Project Refactoring Plan: From Current State to SvelteKit 2 + Svelte 5 Best Practices

## Executive Summary

This document outlines a comprehensive refactoring plan to transform the driplo-turbo project from its current state to a professionally structured monorepo that follows SvelteKit 2 and Svelte 5 best practices. The project is already using Svelte 5 and SvelteKit 2, but there are structural issues that need to be addressed to align with the ideal structure defined in `docs/sitemap.md`.

## Current State Analysis

### What's Already Good ✅

1. **Modern Stack**: Using Svelte 5.36.12 and SvelteKit 2.36.2 with runes enabled
2. **Monorepo Structure**: Properly organized with apps/ and packages/ directories
3. **Turborepo**: Configured for efficient builds and caching
4. **Package Dependencies**: Using workspace packages for shared code
5. **i18n Centralization**: Already using @repo/i18n as single source of truth
6. **TypeScript**: Properly configured with strict type checking

### Key Issues to Address 🔄

1. **Component Organization**: Many components in $lib/components should be colocated with routes
2. **Server/Client Code Separation**: Server code needs to be properly isolated in $lib/server
3. **Type Errors**: Significant number of TypeScript errors need resolution
4. **State Management**: Some patterns may not follow Svelte 5 best practices
5. **Load Function Optimization**: Need to review and optimize data loading patterns

## Detailed Refactoring Plan

### Phase 1: Foundation and Infrastructure (Week 1)

#### 1.1 Optimize Turborepo Configuration
**Files**: `turbo.json`

**Tasks**:
- Review and optimize task dependencies for better parallelization
- Add proper environment variable handling for different deployment scenarios
- Optimize caching strategies for better build performance

#### 1.2 Enhance Package Structure
**Files**: `packages/*/package.json`

**Tasks**:
- Ensure all packages have proper exports configuration
- Add proper sideEffects configuration for tree-shaking
- Verify package dependencies are minimal and correct

### Phase 2: Code Organization and Structure (Weeks 2-3)

#### 2.1 Implement Proper Server/Client Code Separation
**Files**: `apps/*/src/lib/server/*`, `apps/*/src/lib/*`

**Tasks**:
- Audit all code in $lib to identify server-only code
- Move server-only code to $lib/server directories
- Update all imports to use proper $lib/server aliases
- Verify build catches any incorrect client imports

#### 2.2 Component Colocation
**Files**: `apps/*/src/routes/*`, `packages/ui/src/lib/components/*`

**Tasks**:
- Identify components used by only one route
- Move route-specific components from $lib/components to route folders
- Keep only truly shared components in packages/ui
- Update all import statements accordingly

#### 2.3 Optimize Package Exports
**Files**: `packages/*/src/index.ts`

**Tasks**:
- Review and optimize package exports
- Ensure proper TypeScript type definitions
- Add proper documentation for package APIs

### Phase 3: Svelte 5 Migration and Optimization (Weeks 4-5)

#### 3.1 Complete Runes Migration
**Files**: All `.svelte` and `.svelte.ts` files

**Tasks**:
- Convert any remaining legacy syntax to runes
- Replace `export let` with `$props()` destructuring
- Replace `$:` statements with `$derived` or `$effect`
- Update event handlers from `on:click` to `onclick`

#### 3.2 Implement Proper State Management
**Files**: State management files throughout the project

**Tasks**:
- Replace global stores with context-based state management
- Implement URL-based state for filters and sorting
- Use $derived for computed values instead of $effect where appropriate
- Ensure state is properly isolated between requests

#### 3.3 Optimize Load Functions
**Files**: All `+page.server.ts`, `+layout.server.ts`, `+page.ts`, `+layout.ts` files

**Tasks**:
- Review all load functions for proper type annotations
- Implement proper error handling with `error()` and `redirect()`
- Optimize data fetching to avoid waterfalls
- Use streaming with promises for slow data where appropriate

### Phase 4: Type Safety and Error Resolution (Week 6)

#### 4.1 Fix TypeScript Errors
**Files**: All TypeScript files

**Tasks**:
- Address all TypeScript errors systematically
- Add proper type annotations for component props
- Fix nullable type handling
- Ensure proper typing for load functions

#### 4.2 Implement Proper Error Handling
**Files**: Error handling throughout the project

**Tasks**:
- Implement proper error boundaries
- Add comprehensive error logging
- Ensure proper error responses from API routes
- Implement proper form validation error handling

### Phase 5: Testing and Documentation (Week 7)

#### 5.1 Update and Optimize Tests
**Files**: Test files throughout the project

**Tasks**:
- Update tests to work with new component structure
- Add tests for critical functionality
- Ensure proper test coverage
- Optimize test performance

#### 5.2 Update Documentation
**Files**: Documentation files

**Tasks**:
- Update project documentation to reflect new structure
- Add developer onboarding guides
- Document component library usage
- Create architecture decision records

## Implementation Priority Matrix

| Priority | Phase | Tasks | Impact | Effort |
|---------|-------|-------|--------|--------|
| High | 1 | Turborepo optimization | High | Medium |
| High | 2 | Server/Client separation | High | High |
| High | 3 | Runes migration | High | High |
| High | 4 | Type error resolution | High | High |
| Medium | 2 | Component colocation | Medium | Medium |
| Medium | 3 | State management | Medium | Medium |
| Medium | 4 | Error handling | Medium | Medium |
| Low | 1 | Package exports | Low | Low |
| Low | 5 | Testing | Low | Medium |
| Low | 5 | Documentation | Low | Low |

## Success Criteria

The refactoring will be considered successful when:

1. **Zero TypeScript Errors**: `pnpm check-types` runs without errors
2. **All Builds Succeed**: `pnpm build` completes successfully for all packages
3. **All Tests Pass**: `pnpm test` passes with good coverage
4. **Proper Code Organization**: Code follows SvelteKit 2 and Svelte 5 best practices
5. **Performance Optimization**: Build times and runtime performance are optimized
6. **Developer Experience**: Clear documentation and easy onboarding

## Risk Mitigation

### Technical Risks
1. **Breaking Changes**: Minimize by implementing changes incrementally
2. **Performance Regression**: Monitor build times and runtime performance
3. **Type Safety Issues**: Address systematically with proper testing

### Process Risks
1. **Timeline Delays**: Prioritize high-impact, low-effort changes first
2. **Resource Constraints**: Focus on critical path items
3. **Knowledge Gaps**: Provide clear documentation and examples

## Next Steps

1. Review and approve this refactoring plan
2. Assign responsibilities for each phase
3. Set up proper branching strategy for incremental changes
4. Begin implementation with Phase 1 tasks

## Appendix: Key SvelteKit 2 and Svelte 5 Patterns

### Component Structure
```typescript
// ✅ Correct: Route-specific component
// src/routes/blog/[slug]/BlogComments.svelte
<script lang="ts">
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
</script>

// ✅ Correct: Shared component in packages/ui
// packages/ui/src/lib/components/Button.svelte
<script lang="ts">
  let { variant = 'primary', size = 'md', onclick }: Props = $props();
</script>
```

### Server/Client Separation
```typescript
// ✅ Correct: Server-only code
// src/lib/server/database.ts
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

// ✅ Correct: Client-safe code
// src/lib/api.ts
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
```

### State Management
```typescript
// ✅ Correct: Context-based state
// src/routes/+layout.svelte
<script>
  import { setContext } from 'svelte';
  let { data }: LayoutProps = $props();
  setContext('user', () => data.user);
</script>

// ✅ Correct: URL-based state
// src/routes/products/+page.svelte
<script>
  import { page } from '$app/state';
  let filters = $derived(new URLSearchParams(page.url.searchParams));
</script>
```

### Load Functions
```typescript
// ✅ Correct: Type-safe server load
// src/routes/blog/[slug]/+page.server.ts
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
  const post = await getPost(params.slug);
  if (!post) error(404, 'Post not found');
  return { post };
};
