# Duplicate & Legacy Code Audit

## Executive Summary

**Status**: 🟡 **MODERATE** - Some duplications found, cleanup needed
**Found Issues**: Multiple categories of duplicated patterns
**Effort Required**: ~4 hours to complete cleanup

## Issues Found

### 1. TODO Comments (Action Items)

#### Admin App TODOs
```javascript
// TODO: Create AdminDashboard component in @repo/ui or move to local components
// TODO: Replace with proper AdminDashboard component
// TODO: Create AdminUserBrowser component in @repo/ui or move to local components
// TODO: Replace with proper AdminUserBrowser component
```

**Location**: `apps/admin/src/routes/+page.svelte`, `apps/admin/src/routes/users/+page.svelte`
**Action**: Create proper admin components in @repo/ui package

### 2. Hardcoded Shadow Classes (47 instances)

Already documented in SHADOW_ELEVATION_AUDIT.md - needs systematic replacement with design tokens.

#### Pattern Found
```css
/* Duplicate pattern across admin modals */
class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
```

**Location**: Multiple admin route files
**Recommendation**: Create modal utility component

### 3. Redundant Click Handlers

#### Pattern: Product Click Handlers
```javascript
// Appears in 6+ files with slight variations
function handleProductClick(product: Product) {
  goto(`/product/${product.seller_username}/${product.slug}`);
}

// Variations found in:
// - /routes/+page.svelte
// - /routes/pro/+page.svelte
// - /routes/collection/[slug]/+page.svelte
// - /routes/search/+page.svelte
```

**Recommendation**: Create shared navigation utility

#### Pattern: Collection Click Handlers
```javascript
// Appears in 3+ files
function handleCollectionClick(collection: any) {
  goto(`/collection/${collection.slug}`);
}
```

### 4. Component Import Inefficiencies

#### Button Import Pattern (15 files)
```javascript
// Found in 15+ files individually
import { Button } from '@repo/ui';
```

**Recommendation**: Create common imports barrel file

#### Large Import Lists
```javascript
// Overly complex imports in search page
import {
  ProductCard, Button, SearchPageSearchBar, SearchDropdown,
  ProductCardSkeleton, BottomNav, StickyFilterModal,
  AppliedFilterPills, CategoryDropdown, MegaMenuCategories,
  CategoryPill, type Product
} from '@repo/ui';
```

### 5. Modal Pattern Duplication

#### Admin Modal Pattern (Repeated 6 times)
```html
<!-- Identical modal structure in multiple admin files -->
<div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
  <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
    <div class="mt-3">
      <h3 class="text-lg font-medium text-gray-900 mb-4">
        <!-- Modal title varies -->
      </h3>
      <!-- Modal content varies -->
    </div>
  </div>
</div>
```

**Locations**:
- `apps/admin/src/routes/orders/+page.svelte`
- `apps/admin/src/routes/listings/+page.svelte`
- Multiple other admin files

### 6. Legacy Performance Test Assets

**Found**: Large performance test result files in trace directory
```
K:\driplo-turbo-1\performance-test-results\trace\*.css
K:\driplo-turbo-1\performance-test-results\trace\*.js
```

**Action**: Remove or move to .gitignore

### 7. Unused/Legacy Comments

```javascript
// Performance test result files contain minified code comments
// These appear to be CodeMirror trace artifacts
```

## Cleanup Recommendations

### 1. High Priority (Production Impact)

#### Create Shared Navigation Utilities
```typescript
// Create: packages/ui/src/lib/utils/navigation.ts
export const goToProduct = (product: Product) =>
  goto(`/product/${product.seller_username}/${product.slug}`);

export const goToCollection = (collection: Collection) =>
  goto(`/collection/${collection.slug}`);

export const goToSeller = (seller: Seller) =>
  goto(`/sellers/${seller.username}`);
```

#### Create Admin Modal Component
```svelte
<!-- Create: packages/ui/src/lib/AdminModal.svelte -->
<script lang="ts">
  interface Props {
    open: boolean;
    title: string;
    onClose: () => void;
    size?: 'sm' | 'md' | 'lg';
  }
  // Reusable modal implementation
</script>
```

#### Consolidate Button Imports
```typescript
// Create: packages/ui/src/lib/common.ts
export { Button } from './Button.svelte';
export { Avatar } from './Avatar.svelte';
export { ProductCard } from './ProductCard.svelte';
// ... other frequently used components
```

### 2. Medium Priority (Developer Experience)

#### Remove Performance Test Artifacts
```bash
# Add to .gitignore
performance-test-results/
*.trace
```

#### Replace Shadow Classes
Already documented in SHADOW_ELEVATION_AUDIT.md

#### Complete Admin Components
Address TODO comments by creating proper admin components

### 3. Low Priority (Code Quality)

#### Optimize Import Statements
Use shorter, more specific imports where possible

#### Remove Legacy Comments
Clean up old TODO/FIXME comments that are no longer relevant

## Migration Plan

### Phase 1: Critical Cleanup (2 hours)
1. ✅ Create navigation utility functions
2. ✅ Create AdminModal component
3. ✅ Replace modal duplication in admin app
4. ✅ Remove performance test artifacts

### Phase 2: Component Optimization (1.5 hours)
1. ✅ Create common imports barrel
2. ✅ Complete admin dashboard components
3. ✅ Optimize large import lists

### Phase 3: Final Polish (0.5 hours)
1. ✅ Remove resolved TODO comments
2. ✅ Update .gitignore patterns
3. ✅ Documentation updates

## Benefits After Cleanup

1. **Reduced Bundle Size** - Eliminating duplicate code patterns
2. **Better Maintainability** - Centralized navigation logic
3. **Improved DX** - Cleaner imports and component reuse
4. **Performance** - Removing unused assets and optimizing imports
5. **Consistency** - Unified modal and interaction patterns

## Files Requiring Updates

### High Priority Files
- `apps/admin/src/routes/+page.svelte` (TODO completion)
- `apps/admin/src/routes/users/+page.svelte` (TODO completion)
- `apps/admin/src/routes/orders/+page.svelte` (Modal duplication)
- `apps/admin/src/routes/listings/+page.svelte` (Modal duplication)
- Multiple route files (Navigation handler duplication)

### New Files to Create
- `packages/ui/src/lib/utils/navigation.ts`
- `packages/ui/src/lib/AdminModal.svelte`
- `packages/ui/src/lib/AdminDashboard.svelte`
- `packages/ui/src/lib/AdminUserBrowser.svelte`
- `packages/ui/src/lib/common.ts` (Import barrel)

## Conclusion

The codebase has a solid foundation but contains typical duplication patterns from rapid development. The cleanup is straightforward and will significantly improve maintainability without affecting functionality.

**Estimated effort**: 4 hours
**Risk level**: Low
**Impact**: High developer experience improvement