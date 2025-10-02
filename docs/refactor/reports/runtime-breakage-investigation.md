# 🚨 CRITICAL RUNTIME BREAKAGE INVESTIGATION

**Status:** Production app broken - no products showing, buttons not working, no cookies  
**Date:** October 2, 2025  
**Context:** After completing Task 11 TypeScript fixes

---

## 🔍 Symptoms Reported

1. **No Supabase products showing** ❌
2. **No buttons working** ❌
3. **No cookies showing** ❌
4. **"Literal 100% broken state"** ❌

---

## ✅ What We Know Works

1. **TypeScript Compilation:** ✅ 0 errors
2. **Build Process:** ✅ (assumed working since TypeScript passes)
3. **Test Suite:** ✅ 3/3 tests passing
4. **Toast System Exports:** ✅ All exports present

---

## 🔧 Changes Made in Task 11 Fixes

### Fix 1: Toast Export
- **Action:** Removed duplicate `toastStore` object from `packages/ui/src/lib/primitives/toast/index.ts`
- **Verification:** ✅ `toast` and `toasts` still exported from `@repo/ui`
- **Risk Level:** LOW (exports verified intact)

### Fix 2: Transaction Service
- **File:** `apps/web/src/lib/services/transactions.ts`
- **Change:** `amount` → `amount_total`, added `product_price` field
- **Risk Level:** MEDIUM (could affect order processing, not homepage)

### Fix 3: Messaging RPC Calls
- **File:** `apps/web/src/routes/(protected)/messages/+page.server.ts`
- **Changes:** Updated parameter names, mapping logic
- **Risk Level:** LOW (messaging page only, not homepage)

---

## 🎯 Likely Root Causes

### Hypothesis 1: Cookie Consent Broken (HIGH PROBABILITY)
**Evidence:**
- User reports "no cookies showing"
- Cookie consent controls app features (favorites, auth)
- File: `apps/web/src/routes/+layout.svelte` line 24: `import { UnifiedCookieConsent } from '@repo/ui'`

**Mechanism:**
- If `UnifiedCookieConsent` component is broken, cookies never get set
- Without cookies, auth doesn't work
- Without auth, Supabase queries fail
- No products show because queries are blocked

**Investigation Needed:**
```bash
# Check if UnifiedCookieConsent was affected by toast changes
grep -r "UnifiedCookieConsent" packages/ui/src/
# Check if component imports toasts
grep -A 10 "UnifiedCookieConsent" packages/ui/src/lib/components/
```

### Hypothesis 2: Toast System Runtime Error (MEDIUM PROBABILITY)
**Evidence:**
- Multiple error boundaries import `toast` from `@repo/ui`
- `+error.svelte` uses toast system
- If toast system has runtime error, error boundaries break
- Broken error boundaries = silent failures everywhere

**Mechanism:**
1. Toast export has runtime issue (even though TypeScript passes)
2. Error boundary tries to use toast → crashes
3. Error boundary crash = no error reporting
4. User sees blank screen, no indication of what broke

**Investigation Needed:**
```bash
# Check browser console for toast-related errors
# Look for: "Cannot read properties of undefined"
# Look for: "toast is not a function"
```

### Hypothesis 3: Supabase Query Schema Mismatch (MEDIUM PROBABILITY)
**Evidence:**
- Type regeneration happened
- RPC function signatures changed
- Homepage queries products via RPC or direct queries

**Mechanism:**
- Homepage query uses old column names
- Query fails silently
- No products returned
- User sees empty page

**Investigation Needed:**
```bash
# Check +page.server.ts for product queries
grep -A 20 "from('products')" apps/web/src/routes/+page.server.ts
# Check for RPC calls
grep -A 20 "\.rpc(" apps/web/src/routes/+page.server.ts
```

### Hypothesis 4: Build Cache Issue (LOW PROBABILITY)
**Evidence:**
- TypeScript passes but runtime broken
- Could be stale build artifacts

**Mechanism:**
- Vite/SvelteKit cached old broken version
- Dev server serving stale files
- User seeing old broken version

**Resolution:**
```bash
# Clean all caches
rm -rf apps/web/.svelte-kit
rm -rf apps/web/node_modules/.vite
rm -rf packages/ui/dist
# Rebuild
pnpm install
pnpm --filter @repo/ui build
pnpm --filter web dev
```

---

## 🔬 Diagnostic Steps

### Step 1: Check Browser Console (HIGHEST PRIORITY)
```bash
# Ask user to:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Refresh page
4. Copy ALL error messages
5. Look for:
   - "Cannot read properties of undefined"
   - "X is not a function"
   - Failed fetch requests
   - CORS errors
```

### Step 2: Check Network Tab
```bash
# Ask user to:
1. Open Network tab
2. Refresh page
3. Check if Supabase requests are being made
4. Check if they're returning 200 or errors
5. Look for failed cookie operations
```

### Step 3: Check Server Logs
```bash
# In terminal where pnpm dev is running:
# Look for:
- Supabase connection errors
- Environment variable warnings
- Build errors
- Hot reload errors
```

### Step 4: Verify Exports at Runtime
```bash
# Add this to +layout.svelte temporarily:
<script>
  import { toast, toasts } from '@repo/ui';
  console.log('Toast exports:', { toast, toasts });
  console.log('Toast.success:', typeof toast?.success);
</script>
```

---

## 🚑 Emergency Fixes

### Fix A: If Toast System is Broken
```typescript
// In packages/ui/src/lib/index.ts
// Ensure these exports are present:
export { toast, toasts } from './toast';
export type { Toast as ToastMessage, ToastType, ToastStoreOptions, ErrorDetails } from './toast';
```

### Fix B: If Cookie Consent is Broken
```svelte
<!-- Temporarily comment out in +layout.svelte -->
<!-- <UnifiedCookieConsent onconsentchange={handleConsentChange} /> -->
<!-- This will bypass cookie consent and show content -->
```

### Fix C: If Supabase Queries Broken
```typescript
// Check apps/web/src/routes/+page.server.ts
// Look for queries using old column names
// Common issues:
// - amount vs amount_total
// - conversation_id vs other_user_id
// - last_message vs last_message_content
```

### Fix D: Nuclear Option - Rollback
```bash
# If nothing works, rollback Task 11 changes:
git stash
git checkout HEAD~1
pnpm install
pnpm --filter web dev
```

---

## 📊 What User Should Provide

### Critical Information Needed:
1. **Browser Console Errors** (screenshot or copy-paste)
2. **Network Tab** (any failed requests)
3. **Server Terminal Output** (errors in pnpm dev)
4. **Which page they're on** (homepage, product page, etc.)
5. **What specifically doesn't work**:
   - Can't click buttons? Which buttons?
   - No products? Is there a loading spinner?
   - No cookies? Is the cookie banner missing?

---

## 🎯 Most Likely Culprit

**Based on symptoms ("nothing works"), the most likely issue is:**

### 🔴 Toast System Runtime Error Breaking Error Boundaries

**Why:**
- Error boundaries use `toast` to show errors
- If toast throws at import/init time, error boundary crashes
- Crashed error boundary = no error handling
- No error handling = silent failures everywhere
- Silent failures = "everything broken"

**Test:**
```typescript
// Add to +layout.svelte at top of <script>:
try {
  import { toast } from '@repo/ui';
  console.log('Toast import successful:', toast);
} catch (e) {
  console.error('Toast import failed:', e);
  alert('Toast system broken - check console');
}
```

---

## ⚡ Immediate Action Plan

1. **Get browser console output** (CRITICAL)
2. **Check if toast system initializes** (run test above)
3. **Verify cookie consent renders** (view page source)
4. **Check Supabase requests in Network tab**
5. **Review server terminal for errors**

**Then we can provide targeted fix based on actual error.**

---

## 🔍 Files to Review Based on Symptoms

### "No products showing":
- `apps/web/src/routes/+page.server.ts` (product queries)
- `apps/web/src/lib/services/products.ts` (product service)
- Database schema changes (check migrations)

### "No buttons working":
- Toast system breaking error boundaries
- JavaScript not loading (check bundle)
- Event handlers not attached (check Svelte compilation)

### "No cookies showing":
- `UnifiedCookieConsent` component
- Cookie consent imports
- Cookie consent initialization

---

**Status:** Awaiting browser console output to diagnose root cause  
**Next Action:** User must provide browser console errors  
**ETA to Fix:** 5-15 minutes once we see the actual error
