# Svelte 5 Bindable Props Optimization Plan

## Executive Summary

This document outlines the systematic optimization of bindable props across the codebase to achieve maximum Svelte 5 compliance and performance. The optimization focuses on providing appropriate default values for all bindable props to improve TypeScript inference, runtime performance, and developer experience.

## Components Requiring Optimization

### Critical Issues Found

**Files with `$bindable()` without defaults:**

1. **Modal Components:**
   - `packages/ui/src/lib/components/modals/RatingModal.svelte:17`
   - `packages/ui/src/lib/components/business/SellerQuickView.svelte:36`

2. **Form Components:**
   - `packages/ui/src/lib/components/forms/CollapsibleCategorySelector.svelte:30-32`
   - `packages/ui/src/lib/components/forms/ConditionSelector.svelte:23`
   - `packages/ui/src/lib/components/forms/CategorySelector.svelte:27-29`
   - `packages/ui/src/lib/components/forms/Select.svelte:28`

3. **Sell Flow Components:**
   - Multiple step components in `apps/web/src/routes/(protected)/sell/components/`

4. **Message Components:**
   - `apps/web/src/lib/components/MessageThread.svelte:59`

## Optimization Patterns

### 1. Boolean Props (Modal states, flags)
```typescript
// ❌ Before
let { open = $bindable() } = $props();

// ✅ After
let { open = $bindable(false) } = $props();
```

### 2. String Props (selections, values)
```typescript
// ❌ Before
let { value = $bindable() } = $props();

// ✅ After
let { value = $bindable('') } = $props();
// OR for selection components where no selection is valid:
let { value = $bindable(undefined) } = $props();
```

### 3. Array Props (collections, lists)
```typescript
// ❌ Before
let { items = $bindable() } = $props();

// ✅ After
let { items = $bindable([]) } = $props();
```

### 4. Object Props (form data, complex state)
```typescript
// ❌ Before
let { formData = $bindable() } = $props();

// ✅ After
let { formData = $bindable({}) } = $props();
// OR for typed objects:
let { formData = $bindable(null) } = $props();
```

### 5. Element References
```typescript
// ❌ Before
let { element = $bindable() } = $props();

// ✅ After
let { element = $bindable(undefined) } = $props();
```

## Specific Component Optimizations

### Modal Components
```typescript
// RatingModal.svelte
interface Props {
  open?: boolean; // Make optional in interface
  // ... other props
}
let { open = $bindable(false) } = $props();

// SellerQuickView.svelte
let { isOpen = $bindable(false) } = $props();
```

### Category Selectors
```typescript
// CollapsibleCategorySelector.svelte & CategorySelector.svelte
let {
  gender = $bindable(undefined),    // No default selection
  type = $bindable(undefined),      // No default selection
  specific = $bindable(undefined),  // No default selection
} = $props();
```

### Condition Selector
```typescript
// ConditionSelector.svelte
let { value = $bindable(undefined) } = $props(); // No default condition
```

### Form Components
```typescript
// Select.svelte
let { value = $bindable(null) } = $props(); // Consistent with primitive

// Form step components
let {
  formData = $bindable({}),
  uploadedImages = $bindable([]),
  isUploadingImages = $bindable(false),
} = $props();
```

## Implementation Strategy

### Phase 1: Critical Modal Components
1. Fix modal open/close state bindables
2. Ensure proper boolean defaults

### Phase 2: Form and Selection Components
1. Optimize category selectors with appropriate defaults
2. Fix condition and size selectors
3. Ensure consistent null vs undefined handling

### Phase 3: Sell Flow Components
1. Optimize form data bindables
2. Fix image upload state management
3. Ensure consistent patterns across steps

### Phase 4: Validation and Testing
1. Run TypeScript checks
2. Test component functionality
3. Validate parent-child communication

## Benefits Expected

1. **Better TypeScript Inference**: Proper defaults enable better type checking
2. **Improved Performance**: Reduces unnecessary reactivity triggers
3. **Consistent API**: Standardized default patterns across components
4. **Better DX**: More predictable component behavior
5. **Runtime Stability**: Eliminates undefined state issues

## Quality Assurance Checklist

- [ ] All modal components have proper boolean defaults
- [ ] Selection components use appropriate undefined/null defaults
- [ ] Array bindables use empty array defaults
- [ ] Object bindables use appropriate defaults (null/empty object)
- [ ] TypeScript interfaces match bindable defaults
- [ ] No breaking changes to existing component APIs
- [ ] All components follow consistent patterns
- [ ] Performance is maintained or improved

## Validation Commands

```bash
# TypeScript checks
pnpm --filter ui check-types
pnpm --filter web check-types

# Lint checks
pnpm --filter ui lint
pnpm --filter web lint

# Build validation
pnpm --filter ui build
pnpm --filter web build

# Search for remaining issues
rg "\$bindable\(\)\s*[,}]" --include="*.svelte" apps/ packages/
```

## Breaking Changes

**None expected** - All changes maintain backward compatibility by:
- Making previously required bindable props optional in interfaces
- Providing sensible defaults that match expected behavior
- Maintaining existing component APIs

## Follow-up Actions

1. **Documentation**: Update component documentation with new default behaviors
2. **Testing**: Add tests for default value behaviors
3. **Monitoring**: Track performance improvements from optimizations
4. **Standards**: Document bindable prop patterns in coding standards

---

**Status**: Ready for Implementation
**Priority**: High - Affects component reliability and TypeScript compliance
**Estimated Impact**: Improved stability, better DX, enhanced performance