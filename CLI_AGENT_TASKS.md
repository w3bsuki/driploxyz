# CLI Agent Tasks for Svelte and Supabase Optimizations

This document outlines specific tasks for the CLI agent to perform using the Svelte MCP and Supabase MCP servers for further optimizations after the 7-phase refactor.

## Svelte MCP Tasks

### Component Pattern Verification
- **Task**: Verify all Svelte components follow consistent patterns
- **Tools**: `svelte-autofixer`
- **Priority**: High
- **Details**:
  - Check all components in `packages/ui/src/lib/components/` for consistent prop patterns
  - Verify proper use of Svelte 5 runes (`$state`, `$derived`, `$effect`)
  - Ensure proper event handling patterns
  - Check for proper TypeScript typing in components

### Reactivity Checks
- **Task**: Optimize reactivity patterns across the application
- **Tools**: `svelte-autofixer`, custom scripts
- **Priority**: High
- **Details**:
  - Identify and fix unnecessary reactivity in components
  - Optimize `$effect` usage to prevent infinite loops
  - Verify proper cleanup in `$effect` functions
  - Check for proper use of `$bindable` where needed

### Component Performance Optimization
- **Task**: Optimize component rendering performance
- **Tools**: `svelte-autofixer`, browser profiling
- **Priority**: Medium
- **Details**:
  - Identify components that can benefit from `{#key}` blocks
  - Optimize list rendering with proper keys
  - Check for unnecessary component re-renders
  - Implement lazy loading for heavy components

## Supabase MCP Tasks

### Query Optimization
- **Task**: Optimize database queries for better performance
- **Tools**: `execute_sql`, `apply_migration`
- **Priority**: High
- **Details**:
  - Analyze slow queries in `supabase/migrations/`
  - Add missing indexes identified during development
  - Optimize RPC functions for better performance
  - Review and optimize complex joins

### RLS Policy Checks
- **Task**: Ensure all Row Level Security policies are optimal
- **Tools**: `execute_sql`, `get_advisors`
- **Priority**: High
- **Details**:
  - Run security advisors to identify RLS issues
  - Fix any missing RLS policies on tables
  - Optimize existing RLS policies for performance
  - Ensure proper policies for new tables created during refactor

### Database Schema Optimization
- **Task**: Finalize database schema optimizations
- **Tools**: `apply_migration`, `execute_sql`
- **Priority**: Medium
- **Details**:
  - Review foreign key constraints for optimal performance
  - Check for unused columns that can be removed
  - Optimize data types for storage efficiency
  - Verify proper constraints are in place

## Paraglide i18n Tasks

### Message Bundle Optimization
- **Task**: Optimize internationalization message bundles
- **Tools**: Custom scripts, file analysis
- **Priority**: Medium
- **Details**:
  - Remove unused messages from `packages/i18n/messages/`
  - Consolidate duplicate messages across languages
  - Optimize message loading for better performance
  - Verify all messages are properly typed

### Runtime Optimization
- **Task**: Optimize Paraglide runtime performance
- **Tools**: `packages/i18n/src/runtime.ts`
- **Priority**: Medium
- **Details**:
  - Optimize locale detection logic
  - Implement message caching strategies
  - Reduce bundle size through tree-shaking
  - Optimize fallback language handling

## Tailwind CSS v4 Migration Tasks

### Migration Preparation
- **Task**: Prepare for Tailwind CSS v4 migration
- **Tools**: File analysis, dependency updates
- **Priority**: Low
- **Details**:
  - Audit current Tailwind v3 usage across components
  - Identify breaking changes that will affect the project
  - Create migration plan for custom components
  - Verify all utility classes are documented

### Performance Optimization
- **Task**: Optimize CSS bundle size
- **Tools**: Build analysis, PurgeCSS configuration
- **Priority**: Low
- **Details**:
  - Remove unused CSS classes
  - Optimize custom component styles
  - Implement CSS code splitting if needed
  - Verify proper CSS ordering

## General Optimization Tasks

### Package Dependency Review
- **Task**: Further optimize package dependencies
- **Tools**: `package.json` analysis
- **Priority**: Low
- **Details**:
  - Identify any remaining unused dependencies
  - Update packages to latest stable versions
  - Review package security vulnerabilities
  - Optimize bundle size through dependency analysis

### Build Performance
- **Task**: Optimize build performance
- **Tools**: Build analysis, Vite configuration
- **Priority**: Low
- **Details**:
  - Analyze build times and identify bottlenecks
  - Optimize Vite configuration for faster builds
  - Implement build caching strategies
  - Review and optimize TypeScript compilation

## Task Execution Order

1. **High Priority Tasks** (Execute First):
   - Component Pattern Verification
   - Reactivity Checks
   - Query Optimization
   - RLS Policy Checks

2. **Medium Priority Tasks** (Execute Second):
   - Component Performance Optimization
   - Message Bundle Optimization
   - Runtime Optimization
   - Database Schema Optimization

3. **Low Priority Tasks** (Execute Last):
   - Tailwind CSS v4 Migration
   - Package Dependency Review
   - Build Performance

## CLI Agent Usage Instructions

### Using Svelte MCP Server
```bash
# Connect to Svelte MCP server
npx -y @sveltejs/mcp

# Verify a component
svelte-autofixer --file path/to/component.svelte --version 5

# Get documentation
get-documentation --section "runes"
```

### Using Supabase MCP Server
```bash
# Connect to Supabase MCP server
npx -y @supabase/mcp-server-supabase@latest --project-ref=koowfhsaqmarfdkwsfiz

# Run security advisors
get_advisors --type security

# Execute optimization
execute_sql --query "ANALYZE your_table_here;"
```

## Success Criteria

- All Svelte components pass pattern verification
- Database queries are optimized with proper indexes
- RLS policies are secure and performant
- Message bundles are optimized and typed
- Build performance is improved
- Package dependencies are minimized

## Notes for CLI Agent

- The project has been through a 7-phase refactor to reduce dependencies
- Current package count should be significantly reduced from baseline
- Svelte 5 runes are implemented throughout the application
- Supabase migrations are in `supabase/migrations/`
- Paraglide i18n is configured in `packages/i18n/`
- UI components are in `packages/ui/src/lib/components/`

Always run the `final-verification.js` script after completing tasks to ensure project health.