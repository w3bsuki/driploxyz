# Component Colocation Analysis

**Date**: 2025-10-12
**Status**: Analysis Complete - Ready for Execution

## Summary

**Total Components**: 33 components in `apps/web/src/lib/components/`
**Shared (Keep in $lib)**: 3 components (used in layouts/multiple routes)
**Single-Use (Colocate)**: 30 components (used in 0-1 routes)
**Target**: 100% single-use components colocated with routes

## Component Classification

### ✅ KEEP IN $LIB/COMPONENTS (3 components - Used in Layouts)

These are used in root +layout.svelte and must stay in $lib:

1. **Header.svelte** - Used in root +layout.svelte
   - Global site header
   - Used across all routes via layout
   - **Action**: KEEP in `$lib/components/Header.svelte`

2. **RegionSwitchModal.svelte** - Used in root +layout.svelte
   - Global region switcher modal
   - Used across all routes via layout
   - **Action**: KEEP in `$lib/components/RegionSwitchModal.svelte`

3. **RealtimeErrorBoundary.svelte** - Used in root +layout.svelte
   - Global realtime error handler
   - Wraps entire app in layout
   - **Action**: KEEP in `$lib/components/RealtimeErrorBoundary.svelte`

### 🔄 COLOCATE WITH ROUTES (30 components)

#### Messages Module (3 components → (protected)/messages/)

1. **ConversationSidebar.svelte**
   - **Current**: `$lib/components/modular/ConversationSidebar.svelte`
   - **New**: `routes/(protected)/messages/ConversationSidebar.svelte`
   - **Used By**: Only `ModularMessages.svelte` in messages route

2. **ChatWindow.svelte**
   - **Current**: `$lib/components/modular/ChatWindow.svelte`
   - **New**: `routes/(protected)/messages/ChatWindow.svelte`
   - **Used By**: Only `ModularMessages.svelte` in messages route

3. **ConnectionStatus.svelte**
   - **Current**: `$lib/components/modular/ConnectionStatus.svelte`
   - **New**: `routes/(protected)/messages/ConnectionStatus.svelte`
   - **Used By**: Only `ModularMessages.svelte` in messages route

#### Unused/Legacy Components (27 components - DELETE or Document Usage)

These components are not imported by any route files in my search:

4. **ConversationList.svelte** - No imports found → DELETE or find usage
5. **EarlyBirdBanner.svelte** - No imports found → DELETE or find usage
6. **ErrorBoundary.svelte** - No imports found (duplicate in error/ folder)
7. **FavoriteButtonWithRealtimeWrapper.svelte** - No imports found
8. **FollowButtonWithRealtimeWrapper.svelte** - No imports found
9. **FormErrorBoundary.svelte** - No imports found (duplicate in error/ folder)
10. **HeroSearch.svelte** - No imports found
11. **LocaleDetector.svelte** - No imports found (duplicate in layout/ folder)
12. **MessageInput.svelte** - No imports found
13. **MessageThread.svelte** - No imports found
14. **OptimizedImage.svelte** - No imports found
15. **PageLoader.svelte** - No imports found
16. **PaymentErrorBoundary.svelte** - No imports found (duplicate)
17. **PayoutRequestModal.svelte** - No imports found
18. **RealtimeManager.svelte** - No imports found
19. **VirtualProductGrid.svelte** - No imports found
20. **error/ErrorBoundary.svelte** - No imports found (duplicate)
21. **error/FormErrorBoundary.svelte** - No imports found (duplicate)
22. **error/PaymentErrorBoundary.svelte** - No imports found (duplicate)
23. **error/RealtimeErrorBoundary.svelte** - No imports found (duplicate)
24. **forms/EnhancedForm.svelte** - No imports found
25. **forms/MultiStepForm.svelte** - No imports found
26. **forms/SelectField.svelte** - No imports found
27. **forms/TextareaField.svelte** - No imports found
28. **layout/Header.svelte** - DUPLICATE of root Header.svelte
29. **layout/LocaleDetector.svelte** - No imports found
30. **layout/RegionSwitchModal.svelte** - DUPLICATE of root RegionSwitchModal.svelte

## Execution Plan

### Phase 1: Deep Usage Scan (Search Beyond Routes)

Search for component usage in:
- apps/web/src/lib/ (utility files, stores, etc.)
- apps/web/src/routes/ (all .svelte, .ts, .js files)
- Look for dynamic imports
- Check for string-based component loading

### Phase 2: Delete Duplicates (Immediate - Safe)

```bash
# Delete duplicate components
rm apps/web/src/lib/components/error/ErrorBoundary.svelte
rm apps/web/src/lib/components/error/FormErrorBoundary.svelte
rm apps/web/src/lib/components/error/PaymentErrorBoundary.svelte
rm apps/web/src/lib/components/error/RealtimeErrorBoundary.svelte
rm apps/web/src/lib/components/layout/Header.svelte
rm apps/web/src/lib/components/layout/LocaleDetector.svelte
rm apps/web/src/lib/components/layout/RegionSwitchModal.svelte

# Delete empty folders if no other files
rmdir apps/web/src/lib/components/error (if empty)
rmdir apps/web/src/lib/components/layout (if empty)
```

### Phase 3: Colocate Messages Module

```bash
# Move messages components to route
mv apps/web/src/lib/components/modular/ConversationSidebar.svelte apps/web/src/routes/(protected)/messages/
mv apps/web/src/lib/components/modular/ChatWindow.svelte apps/web/src/routes/(protected)/messages/
mv apps/web/src/lib/components/modular/ConnectionStatus.svelte apps/web/src/routes/(protected)/messages/

# Update import in ModularMessages.svelte
# FROM: import ConversationSidebar from '$lib/components/modular/ConversationSidebar.svelte';
# TO:   import ConversationSidebar from './ConversationSidebar.svelte';
```

### Phase 4: Handle Unused Components

After deep scan, for each unused component:
- If truly unused → DELETE
- If used in non-route context → Document and keep in appropriate location
- If used in single route → COLOCATE with that route

## Success Metrics

**Before**:
- 33 components in $lib/components/
- ~0% colocation (all in shared folder)
- Many duplicates and unused files

**After**:
- 3 components in $lib/components/ (global layout components)
- ~100% single-use colocation
- Zero duplicates
- Zero unused components

## Next Steps

1. Run deep usage scan to find any hidden component usage
2. Execute Phase 2 (delete duplicates) immediately
3. Execute Phase 3 (colocate messages) with import updates
4. Execute Phase 4 based on scan results
5. Verify build succeeds after each phase
6. Run type checking after all moves complete
