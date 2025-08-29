# TypeScript Optimization Plan

**Goal**: Achieve 0 TypeScript errors for mobile-first deployment while maintaining <200KB bundle size.

---

## 🎯 Immediate Quick Wins (< 1 day)

1. **Fix Critical `any` Usage**
   ```bash
   # Find and fix these 5 files first (deployment blockers):
   apps/web/src/lib/client/auth.ts:33,60
   apps/web/src/hooks.client.ts:26  
   apps/web/src/lib/components/Header.svelte:37
   apps/web/src/lib/components/RealtimeManager.svelte:7-13
   apps/web/src/lib/categories/mapping.ts:161
   ```

2. **Run Type Check**
   ```bash
   pnpm check-types  # Must pass with 0 errors
   ```

---

## 📋 Phase 1: Foundation (Week 1)

### Config Standardization
```json
// packages/typescript-config/svelte.json - Keep minimal
{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "skipLibCheck": true
  }
}
```

### Actions:
- [ ] Standardize all apps on shared config
- [ ] Add `verbatimModuleSyntax: true` (catches import issues)
- [ ] Enable `import type` linting rule
- [ ] Fix admin app to extend shared config

**Success**: All apps build without config errors.

---

## 📋 Phase 2: Type Safety (Week 2)

### Eliminate `any` Usage
```ts
// ✅ Replace catch blocks
} catch (error) {
  return { error: error instanceof Error ? error.message : 'Unknown error' };
}

// ✅ Type components properly
import type { ComponentType } from 'svelte';
let NotificationPanel: ComponentType | null = null;

// ✅ Domain types for data
interface DbCategory { 
  id: string; 
  name: string; 
  level: 1|2|3; 
  parent_id?: string; 
}
```

### Actions:
- [ ] Add `useUnknownInCatchVariables: true`
- [ ] Fix 5 critical `any` files from Quick Wins
- [ ] Add window globals typing to `app.d.ts`
- [ ] Type all component props with Svelte 5 runes

**Success**: 0 explicit `any` types in non-generated code.

---

## 📋 Phase 3: Mobile Performance (Week 3)

### Bundle Optimization
```ts
// ✅ Type-only imports (smaller bundles)
import type { Product } from '$lib/types';
import { productSchema } from '$lib/schemas';

// ✅ Efficient Svelte 5 patterns  
interface Props {
  products: Product[];
  loading?: boolean;
}
let { products, loading = false }: Props = $props();
```

### Actions:
- [ ] Convert all type imports to `import type`
- [ ] Add Zod schemas for runtime validation
- [ ] Optimize Svelte component prop types
- [ ] Enable tree-shaking friendly patterns

**Success**: Bundle size <200KB, LCP <2s mobile maintained.

---

## ✅ Success Metrics

**Deployment Ready:**
- `pnpm check-types` passes with 0 errors ✅
- `pnpm build` succeeds ✅  
- No explicit `any` types in application code ✅

**Performance:**
- Bundle size <200KB ✅
- Mobile LCP <2s maintained ✅
- Type-only imports used everywhere ✅

**DX:**
- Consistent tsconfig across all apps ✅
- Fast incremental builds ✅
- Clear error messages ✅

---

## 🚨 Non-Negotiables

- **Never break mobile performance** for type safety
- **Never enable all strict flags at once** (use incremental approach)  
- **Always verify build still passes** after config changes
- **Always run on 375px viewport** when testing type changes

---

## 📁 Critical Files to Fix

1. `apps/web/src/lib/client/auth.ts` - Auth error handling
2. `apps/web/src/lib/components/Header.svelte` - Component imports
3. `apps/web/src/lib/components/RealtimeManager.svelte` - Event handlers
4. `apps/web/src/lib/categories/mapping.ts` - Data transformation
5. `apps/web/src/lib/cookies/production-cookie-system.ts` - Window globals

**Next Action**: Start with Phase 1, file 1. Fix auth.ts error handling first.
