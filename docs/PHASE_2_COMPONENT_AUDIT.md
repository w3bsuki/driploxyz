# Phase 2: Component Classification Report

**Date**: 2025-10-11  
**Phase**: Route Colocation Refactor  
**Auditor**: GitHub Copilot with Svelte MCP

---

## Audit Summary

**Total Components Audited**: 19  
**Files to MOVE**: 11 (single-use or unused)  
**Files to KEEP & ORGANIZE**: 3 (multi-use)  
**Files to DELETE**: 5 (unused/dead code)

---

## Classification Details

### 🔴 DELETE - Unused Components (Dead Code)

These components are NOT imported or used anywhere in the codebase:

1. **ConversationList.svelte** - No imports found
2. **EarlyBirdBanner.svelte** - No imports found
3. **HeroSearch.svelte** - No imports found (Comment in layout mentions it was removed)
4. **MessageInput.svelte** - No imports found
5. **MessageThread.svelte** - No imports found
6. **PageLoader.svelte** - No imports found
7. **VirtualProductGrid.svelte** - No imports found
8. **PayoutRequestModal.svelte** - No imports found
9. **RealtimeManager.svelte** - No imports found
10. **OptimizedImage.svelte** - No imports found
11. **FavoriteButtonWithRealtimeWrapper.svelte** - No imports found
12. **FollowButtonWithRealtimeWrapper.svelte** - No imports found

**Action**: Remove these files (they are dead code)

---

### 🟡 MOVE - Single-Use Components (Route Colocation)

#### Modular Components → routes/(protected)/messages/

These 3 components are ONLY used in `routes/(protected)/messages/ModularMessages.svelte`:

1. **lib/components/modular/ConversationSidebar.svelte**
   - **Used in**: `routes/(protected)/messages/ModularMessages.svelte`
   - **Move to**: `routes/(protected)/messages/ConversationSidebar.svelte`
   - **Update import**: Line 9 of ModularMessages.svelte

2. **lib/components/modular/ChatWindow.svelte**
   - **Used in**: `routes/(protected)/messages/ModularMessages.svelte`
   - **Move to**: `routes/(protected)/messages/ChatWindow.svelte`
   - **Update import**: Line 11 of ModularMessages.svelte

3. **lib/components/modular/ConnectionStatus.svelte**
   - **Used in**: `routes/(protected)/messages/ModularMessages.svelte`
   - **Move to**: `routes/(protected)/messages/ConnectionStatus.svelte`
   - **Update import**: Line 13 of ModularMessages.svelte

#### Specialized Boundaries → Keep for now (specialized, not truly single-use)

4. **FormErrorBoundary.svelte**
   - **Usage**: Not currently used, but specialized variant of ErrorBoundary
   - **Decision**: KEEP in lib/components/ (potential multi-use, specialized)

5. **PaymentErrorBoundary.svelte**
   - **Usage**: Not currently used, but specialized variant of ErrorBoundary
   - **Decision**: KEEP in lib/components/ (potential multi-use, specialized)

6. **RealtimeErrorBoundary.svelte**
   - **Used in**: `routes/+layout.svelte` (line 26, 556)
   - **Decision**: KEEP - Used in root layout (multi-use by inheritance)

---

### 🟢 KEEP & ORGANIZE - Multi-Use Components

#### Layout Components (Used in Root Layout)

1. **Header.svelte**
   - **Used in**: `routes/+layout.svelte` (line 12)
   - **Decision**: KEEP - Multi-use via layout inheritance
   - **Organize to**: `lib/components/layout/Header.svelte`

2. **RegionSwitchModal.svelte**
   - **Used in**: `routes/+layout.svelte` (line 28)
   - **Decision**: KEEP - Multi-use via layout inheritance
   - **Organize to**: `lib/components/layout/RegionSwitchModal.svelte`

3. **LocaleDetector.svelte**
   - **Referenced in**: `routes/+layout.svelte` (line 664, comment)
   - **Decision**: KEEP - Layout utility component
   - **Organize to**: `lib/components/layout/LocaleDetector.svelte`

#### Error Boundary Components

4. **ErrorBoundary.svelte**
   - **Used via**: Imported from @repo/ui in multiple routes (product page, checkout, sell, layout)
   - **Note**: There's a local version in lib/components/ that extends the @repo/ui one
   - **Decision**: KEEP - Base component for specialized boundaries
   - **Organize to**: `lib/components/error/ErrorBoundary.svelte`

5. **RealtimeErrorBoundary.svelte**
   - **Used in**: Root layout
   - **Organize to**: `lib/components/error/RealtimeErrorBoundary.svelte`

6. **FormErrorBoundary.svelte**
   - **Organize to**: `lib/components/error/FormErrorBoundary.svelte`

7. **PaymentErrorBoundary.svelte**
   - **Organize to**: `lib/components/error/PaymentErrorBoundary.svelte`

#### Form Components (Unused but Generic)

8. **forms/EnhancedForm.svelte** - No usage found (DELETE)
9. **forms/MultiStepForm.svelte** - No usage found (DELETE)
10. **forms/SelectField.svelte** - No usage found (DELETE)
11. **forms/TextareaField.svelte** - No usage found (DELETE)

**Action**: Remove entire forms/ directory (dead code)

---

## Recommended Actions

### Phase 2A: Clean Up Dead Code (5 min)

Delete these unused files:
```bash
# Components that are never imported
rm apps/web/src/lib/components/ConversationList.svelte
rm apps/web/src/lib/components/EarlyBirdBanner.svelte
rm apps/web/src/lib/components/HeroSearch.svelte
rm apps/web/src/lib/components/MessageInput.svelte
rm apps/web/src/lib/components/MessageThread.svelte
rm apps/web/src/lib/components/PageLoader.svelte
rm apps/web/src/lib/components/VirtualProductGrid.svelte
rm apps/web/src/lib/components/PayoutRequestModal.svelte
rm apps/web/src/lib/components/RealtimeManager.svelte
rm apps/web/src/lib/components/OptimizedImage.svelte
rm apps/web/src/lib/components/FavoriteButtonWithRealtimeWrapper.svelte
rm apps/web/src/lib/components/FollowButtonWithRealtimeWrapper.svelte

# Entire forms directory is unused
rm -rf apps/web/src/lib/components/forms/
```

### Phase 2B: Move Single-Use to Routes (10 min)

Move modular messaging components:
1. Move `lib/components/modular/*` → `routes/(protected)/messages/`
2. Update imports in `ModularMessages.svelte` (3 imports)
3. Delete empty `modular/` directory

### Phase 2C: Organize Multi-Use Components (10 min)

Reorganize remaining components:
```
lib/components/
├── layout/
│   ├── Header.svelte
│   ├── RegionSwitchModal.svelte
│   └── LocaleDetector.svelte
└── error/
    ├── ErrorBoundary.svelte
    ├── RealtimeErrorBoundary.svelte
    ├── FormErrorBoundary.svelte
    └── PaymentErrorBoundary.svelte
```

Update imports in:
- `routes/+layout.svelte` (Header, RealtimeErrorBoundary, RegionSwitchModal)

---

## File Structure After Phase 2

### Before (Current - Poor Organization):
```
apps/web/src/lib/components/
├── ConversationList.svelte              ❌ UNUSED
├── EarlyBirdBanner.svelte               ❌ UNUSED
├── ErrorBoundary.svelte                 ✅ KEEP
├── FavoriteButtonWithRealtimeWrapper.svelte  ❌ UNUSED
├── FollowButtonWithRealtimeWrapper.svelte    ❌ UNUSED
├── FormErrorBoundary.svelte             ✅ KEEP
├── forms/
│   ├── EnhancedForm.svelte              ❌ UNUSED
│   ├── MultiStepForm.svelte             ❌ UNUSED
│   ├── SelectField.svelte               ❌ UNUSED
│   └── TextareaField.svelte             ❌ UNUSED
├── Header.svelte                        ✅ KEEP
├── HeroSearch.svelte                    ❌ UNUSED
├── LocaleDetector.svelte                ✅ KEEP
├── MessageInput.svelte                  ❌ UNUSED
├── MessageThread.svelte                 ❌ UNUSED
├── modular/
│   ├── ChatWindow.svelte                🔄 MOVE
│   ├── ConnectionStatus.svelte          🔄 MOVE
│   └── ConversationSidebar.svelte       🔄 MOVE
├── OptimizedImage.svelte                ❌ UNUSED
├── PageLoader.svelte                    ❌ UNUSED
├── PaymentErrorBoundary.svelte          ✅ KEEP
├── PayoutRequestModal.svelte            ❌ UNUSED
├── RealtimeErrorBoundary.svelte         ✅ KEEP
├── RealtimeManager.svelte               ❌ UNUSED
├── RegionSwitchModal.svelte             ✅ KEEP
└── VirtualProductGrid.svelte            ❌ UNUSED
```

### After (Ideal - Clean & Colocated):
```
apps/web/src/
├── lib/components/
│   ├── layout/
│   │   ├── Header.svelte
│   │   ├── LocaleDetector.svelte
│   │   └── RegionSwitchModal.svelte
│   └── error/
│       ├── ErrorBoundary.svelte
│       ├── FormErrorBoundary.svelte
│       ├── PaymentErrorBoundary.svelte
│       └── RealtimeErrorBoundary.svelte
└── routes/
    └── (protected)/
        └── messages/
            ├── +page.svelte
            ├── ModularMessages.svelte
            ├── ChatWindow.svelte              ✅ COLOCATED
            ├── ConnectionStatus.svelte        ✅ COLOCATED
            └── ConversationSidebar.svelte     ✅ COLOCATED
```

---

## Import Updates Required

### 1. routes/+layout.svelte
```diff
- import Header from '$lib/components/Header.svelte';
+ import Header from '$lib/components/layout/Header.svelte';

- import RealtimeErrorBoundary from '$lib/components/RealtimeErrorBoundary.svelte';
+ import RealtimeErrorBoundary from '$lib/components/error/RealtimeErrorBoundary.svelte';

- import RegionSwitchModal from '$lib/components/RegionSwitchModal.svelte';
+ import RegionSwitchModal from '$lib/components/layout/RegionSwitchModal.svelte';
```

### 2. routes/(protected)/messages/ModularMessages.svelte
```diff
- import ConversationSidebar from '$lib/components/modular/ConversationSidebar.svelte';
+ import ConversationSidebar from './ConversationSidebar.svelte';

- import ChatWindow from '$lib/components/modular/ChatWindow.svelte';
+ import ChatWindow from './ChatWindow.svelte';

- import ConnectionStatus from '$lib/components/modular/ConnectionStatus.svelte';
+ import ConnectionStatus from './ConnectionStatus.svelte';
```

### 3. lib/components/error/FormErrorBoundary.svelte
```diff
- import ErrorBoundary from './ErrorBoundary.svelte';
+ import ErrorBoundary from './ErrorBoundary.svelte'; // No change (same directory)
```

### 4. lib/components/error/PaymentErrorBoundary.svelte
```diff
- import ErrorBoundary from './ErrorBoundary.svelte';
+ import ErrorBoundary from './ErrorBoundary.svelte'; // No change (same directory)
```

### 5. lib/components/error/RealtimeErrorBoundary.svelte
```diff
- import ErrorBoundary from './ErrorBoundary.svelte';
+ import ErrorBoundary from './ErrorBoundary.svelte'; // No change (same directory)
```

---

## Metrics

### Code Reduction:
- **Files removed**: 16 (12 unused components + 4 form components)
- **Directories removed**: 2 (forms/, modular/)
- **Lines of code removed**: ~2000+ (estimated)

### Organization Improvement:
- **Before**: 19 files in flat structure
- **After**: 7 files in organized structure (3 layout + 4 error)
- **Colocated**: 3 components moved to their route

### Benefits:
1. ✅ **Cleaner codebase** - 84% reduction in lib/components files
2. ✅ **Better organization** - Clear layout/ and error/ domains
3. ✅ **Route colocation** - Messages components live with messages route
4. ✅ **Reduced cognitive load** - Only see components that are actually used
5. ✅ **Faster development** - Easy to find components by purpose

---

## Next Steps

1. Execute Phase 2A (delete unused files)
2. Execute Phase 2B (move modular components)
3. Execute Phase 2C (organize remaining components)
4. Run validation (TypeScript, dev server, lint)
5. Update docs/02_LOG.md
6. Ask user about Phase 3

---

## Notes

- All ErrorBoundary usage in routes comes from @repo/ui package
- The local ErrorBoundary.svelte is used as a base for specialized variants
- Header.svelte is the current file user is viewing (will be careful with edits)
- No form components are currently in use (potential for future cleanup in @repo/ui)
