# Svelte MCP CLI Agent Audit Prompt for Driplo

## Context

You are auditing the Driplo marketplace application, a SvelteKit 2 + Svelte 5 e-commerce platform built with TypeScript. The project has recently completed a comprehensive 7-phase refactor that:

1. Reduced dependencies from 770 to ~200 packages (74% reduction)
2. Migrated fully to Svelte 5 with runes ($state, $derived, $effect)
3. Optimized component patterns and reactivity
4. Restructured packages with proper boundaries
5. Improved performance and type safety

The project uses:
- **SvelteKit 2.36.2** with **Svelte 5.36.12**
- **TypeScript 5.8.2** with strict type checking
- **Tailwind CSS 4.1.12** for styling
- **Supabase** for database and auth
- **Paraglide** for internationalization
- **Turborepo** for monorepo management

## Recent Refactor Summary

The 7-phase refactor addressed:
- Package bloat reduction (removed heavy dev tools, duplicate UI libraries)
- Code structure cleanup (removed 238 files, consolidated duplicates)
- Svelte 5 optimization (fixed $effect overuse, improved patterns)
- Architecture rationalization (moved business logic to @repo/core)
- Testing consolidation (focused on essential tests)
- Performance optimization (bundle size, error handling)
- CLI agent handoff preparation

## Audit Scope

Perform a comprehensive audit of the Svelte components in the Driplo codebase using Svelte MCP to identify:

1. **Svelte 5 Runes Usage Patterns**
   - Improper $state, $derived, $effect usage
   - Missing cleanup in effects
   - Overuse of effects when derived values would be better
   - Incorrect prop destructuring patterns

2. **Component Architecture Issues**
   - Components with too many responsibilities
   - Missing proper prop validation
   - Incorrect event handling patterns
   - Improper component communication

3. **Reactivity Anti-patterns**
   - Unnecessary re-renders
   - Missing dependencies in effects
   - Over-computed derived values
   - State management inefficiencies

4. **Performance Issues**
   - Large components that should be split
   - Missing lazy loading opportunities
   - Inefficient DOM manipulations
   - Memory leaks from unclosed subscriptions

5. **Accessibility Violations**
   - Missing ARIA attributes
   - Poor keyboard navigation
   - Missing semantic HTML
   - Inaccessible form controls

6. **TypeScript Integration Problems**
   - Missing type definitions
   - Improper prop typing
   - Type assertion usage
   - Missing generic constraints

## Directories to Focus On

Please audit these specific directories and their subdirectories:

1. **apps/web/src/routes/**/*.svelte**
   - All route components
   - Layout components
   - Page components

2. **apps/web/src/lib/components/**/*.svelte**
   - Application-specific components
   - Business logic components
   - Feature-specific components

3. **packages/ui/src/lib/components/**/*.svelte**
   - Reusable UI components
   - Design system components
   - Generic component library

## Specific Patterns to Check

### Svelte 5 Runes Usage

```typescript
// ❌ Bad patterns to find:
export let prop;  // Old export pattern
$: computed = prop * 2;  // Old reactive statement

// ✅ Good patterns expected:
let { prop = defaultValue } = $props();
let computed = $derived(() => prop * 2);
```

### $effect Anti-patterns

```typescript
// ❌ Bad patterns to find:
$effect(() => {
  // Complex logic that should be $derived
  const result = complexCalculation(state);
  setState(result);
});

// ✅ Good patterns expected:
let result = $derived(() => complexCalculation(state));
$effect(() => {
  // Only side effects
  console.log('Result changed:', result);
});
```

### Component Props

```typescript
// ❌ Bad patterns to find:
export let title;
export let onClick;
export let class: className;

// ✅ Good patterns expected:
interface Props {
  title?: string;
  onClick?: () => void;
  class?: string;
}

let { 
  title = 'Default',
  onClick,
  class: className = ''
}: Props = $props();
```

### State Management

```typescript
// ❌ Bad patterns to find:
let user = $state(null);
let isLoading = $state(false);
let error = $state(null);

// ✅ Good patterns expected:
let state = $state({
  user: null,
  isLoading: false,
  error: null
});
```

## Output Format

Please provide your findings in the following format:

### Critical Issues
**Priority: Critical** - Issues that will cause runtime errors or security vulnerabilities

1. **File: `path/to/file.svelte:line`**
   - **Issue**: Description of the problem
   - **Impact**: Why this is critical
   - **Fix**: Specific code fix recommendation
   - **Example**: Code example showing the fix

### High Priority Issues
**Priority: High** - Issues that significantly impact performance or user experience

1. **File: `path/to/file.svelte:line`**
   - **Issue**: Description of the problem
   - **Impact**: Performance/UX impact
   - **Fix**: Specific code fix recommendation
   - **Example**: Code example showing the fix

### Medium Priority Issues
**Priority: Medium** - Code quality issues that should be addressed

1. **File: `path/to/file.svelte:line`**
   - **Issue**: Description of the problem
   - **Impact**: Maintainability/readability impact
   - **Fix**: Specific code fix recommendation
   - **Example**: Code example showing the fix

### Low Priority Issues
**Priority: Low** - Minor improvements or best practice suggestions

1. **File: `path/to/file.svelte:line`**
   - **Issue**: Description of the problem
   - **Impact**: Minor impact
   - **Fix**: Suggested improvement
   - **Example**: Code example showing the fix

## Priority Levels

### Critical
- Runtime errors that will crash the application
- Security vulnerabilities
- Memory leaks that will cause performance degradation
- Broken accessibility that prevents usage

### High
- Performance issues that significantly impact user experience
- Incorrect reactivity patterns causing bugs
- Missing error handling for critical paths
- Major accessibility violations

### Medium
- Code that works but is hard to maintain
- Suboptimal component patterns
- Missing type safety
- Minor accessibility issues

### Low
- Code style inconsistencies
- Minor optimizations
- Documentation improvements
- Best practice suggestions

## Special Focus Areas

Given the recent refactor, please pay special attention to:

1. **Incomplete Svelte 5 Migration**
   - Any remaining old patterns that weren't caught
   - Mixed usage of old and new patterns
   - Inconsistent runes usage

2. **Post-Refactor Issues**
   - Any issues introduced during the refactor
   - Missing imports after package reorganization
   - Broken component references

3. **Performance Regressions**
   - Any performance issues introduced by changes
   - Bundle size increases
   - Slower reactivity

4. **Type Safety**
   - Any TypeScript issues after the refactor
   - Missing type definitions
   - Incorrect type usage

## Expected Deliverables

1. **Comprehensive audit report** with all findings categorized by priority
2. **Specific file paths and line numbers** for each issue
3. **Code examples** showing both the problem and the fix
4. **Summary statistics** (total issues by priority, most common patterns)
5. **Recommended fix order** based on priority and dependencies

## Additional Instructions

1. **Be thorough** - Check every .svelte file in the specified directories
2. **Provide actionable fixes** - Each issue should have a clear, implementable solution
3. **Consider the context** - Remember this is a marketplace application with specific business logic
4. **Focus on Svelte 5 best practices** - Ensure all recommendations align with current Svelte 5 patterns
5. **Be practical** - Prioritize issues that will have the most impact on the application

Please begin the audit and provide a comprehensive report of all findings with the specified format and priority levels.