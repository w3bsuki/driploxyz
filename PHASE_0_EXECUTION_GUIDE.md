# Phase 0 Execution Guide: Stop the Bleeding
**Priority:** 🔥 CRITICAL
**Duration:** 1-2 days
**Goal:** Fix critical blockers preventing clean builds and type safety

---

## Pre-Flight Checklist

### Before Starting
- [ ] Commit any uncommitted changes
- [ ] Create new branch: `git checkout -b refactor/phase-0-critical-fixes`
- [ ] Backup database: `pnpm supabase db dump > backup.sql`
- [ ] Note current state:
  ```bash
  pnpm --filter web check-types 2>&1 | tee before-type-errors.txt
  pnpm --filter web lint 2>&1 | tee before-lint-errors.txt
  ```

### Current Known Issues
- ✅ **14 TypeScript errors** - type-check fails
- ✅ **18 lint errors** - mostly unused variables
- ✅ **Database schema drift** - missing `order_items` table in types

---

## Task 0.1: Database Schema Synchronization

### Issue
Generated Supabase types are out of sync with actual database schema:
- Missing `order_items` table definition
- `transactions.payment_status` vs `payout_status` mismatch
- `products.category_slug` - unclear if column exists

### Investigation Steps

**Step 1:** Check actual database schema
```bash
# Connect to Supabase and list tables
pnpm supabase db ls-tables

# Check order_items table
pnpm supabase db exec "
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'order_items';
"

# Check transactions table columns
pnpm supabase db exec "
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'transactions';
"

# Check products table for category_slug
pnpm supabase db exec "
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'products'
  AND column_name LIKE '%category%';
"
```

### Decision Matrix

**If `order_items` table exists:**
- Action: Regenerate types to include it
- Command: `pnpm supabase gen types typescript --local > packages/database/src/generated.ts`

**If `order_items` table doesn't exist:**
- Decision needed: Create table or remove code references?
- Check: Is code trying to insert order items actually used?
- If unused: Remove code in `services/stripe.ts:922-923`
- If needed: Create migration to add table

**If `transactions.payment_status` exists:**
- Fix: Update code to use correct column name
- Location: `lib/services/transactions.ts:44`

**If `transactions.payout_status` exists instead:**
- Already correct, schema types wrong
- Action: Regenerate types

**If `products.category_slug` exists:**
- Action: Regenerate types, remove type guard
- Location: `lib/utils/seo-urls.ts:61`

**If `products.category_slug` doesn't exist:**
- Action: Add type guard or use join to categories table
- Fix: Add null check in seo-urls.ts

### Execution

```bash
# Step 1: Regenerate database types
cd packages/database
pnpm db:types

# Step 2: Check if regeneration fixed the issues
pnpm --filter @repo/database build

# Step 3: Verify changes
git diff packages/database/src/generated.ts

# Step 4: Commit if successful
git add packages/database/src/generated.ts
git commit -m "fix(database): regenerate types to sync with schema"
```

### Validation
```bash
pnpm --filter @repo/database build  # Must pass
pnpm --filter web check-types | grep "order_items\|payment_status\|category_slug"  # Should reduce errors
```

---

## Task 0.2: Fix TypeScript Errors (14 → 0)

### Priority Order

#### 1. Fix stripe.ts errors (3 errors) - HIGH PRIORITY
**File:** `apps/web/src/lib/services/stripe.ts`

**Error 1:** Line 691 - Unused function
```typescript
// ERROR: 'getOrCreateCustomer' is declared but its value is never read.

// FIX: Remove unused function or prefix with underscore
// Option A: Delete if truly unused
// Option B: Prefix with _ if needed for future
const _getOrCreateCustomer = async () => { ... }
```

**Error 2:** Line 922 - order_items table not in types
```typescript
// ERROR: Argument of type '"order_items"' is not assignable to parameter

// FIX: After regenerating types, this should resolve
// If order_items still missing, either:
// A) Comment out this code if not in use
// B) Create order_items table migration
```

**Error 3:** Line 923 - order_items insert type mismatch
```typescript
// ERROR: Type mismatch for order_items insert

// FIX: After regenerating types, update insert payload to match schema
// Or comment out if feature not implemented yet
```

#### 2. Fix transactions.ts error (1 error) - HIGH PRIORITY
**File:** `apps/web/src/lib/services/transactions.ts:44`

**Error:** Unknown property 'payment_status'
```typescript
// ERROR: 'payment_status' does not exist in type, did you mean 'payout_status'?

// FIX: Change to correct property name
// Before:
payment_status: 'completed'

// After:
payout_status: 'completed'
```

#### 3. Fix seo-urls.ts error (1 error) - MEDIUM PRIORITY
**File:** `apps/web/src/lib/utils/seo-urls.ts:61`

**Error:** Property 'category_slug' does not exist
```typescript
// ERROR: Property 'category_slug' does not exist on type 'ProductWithProfile'

// FIX: Add type guard
// Before:
const categorySlug = product.category_slug;

// After:
const categorySlug = 'category_slug' in product ? product.category_slug : null;
// Or use optional chaining:
const categorySlug = product.category_slug ?? null;
```

#### 4. Fix payment routes errors (4 errors) - HIGH PRIORITY
**Files:**
- `routes/api/checkout/confirm/+server.ts:43`
- `routes/api/payments/confirm/+server.ts:55,92,93,108`

**Error:** Property 'transaction' does not exist on return type
```typescript
// ERROR: Property 'transaction' does not exist

// FIX: Update return type or add transaction to result
// Option A: Check service function return type and add 'transaction' property
// Option B: Remove references to result.transaction if not implemented

// Example fix:
// In services/orders.ts or wherever order creation returns
export async function createOrder(...): Promise<{
  success: boolean;
  order?: Order;
  transaction?: Transaction;  // ADD THIS
  error?: Error;
}> {
  // ... implementation
  return { success: true, order, transaction };  // Return transaction too
}
```

#### 5. Fix create-intent route error (1 error) - HIGH PRIORITY
**File:** `routes/api/payments/create-intent/+server.ts:63`

**Error:** Cannot find name 'user'
```typescript
// ERROR: Cannot find name 'user'

// FIX: Define user variable or remove reference
// Check context - likely missing from request handler scope
// Either:
const user = await getUser(request);  // Get from session
// Or:
const { user } = locals;  // Get from SvelteKit locals
```

#### 6. Fix auth login route error (1 error) - LOW PRIORITY
**File:** `routes/api/auth/login/+server.ts:7`

**Error:** 'redirect' is defined but never used
```typescript
// FIX: Remove unused import
// Before:
import { redirect } from '@sveltejs/kit';

// After: (just delete the import if not used)
```

#### 7. Fix i18n runtime error (1 error) - MEDIUM PRIORITY
**File:** `packages/i18n/src/runtime.ts:45`

**Error:** Element implicitly has 'any' type with string index
```typescript
// ERROR: No index signature with parameter of type 'string'

// FIX: Add type assertion or proper typing
// Before:
const translation = translations[key];

// After:
const translation = translations[key as keyof typeof translations];
// Or:
const translation = (translations as Record<string, string>)[key];
```

#### 8. Fix rate-limiter error (1 error) - MEDIUM PRIORITY
**File:** `src/lib/server/rate-limiter.ts:3`

**Error:** Module has no exported member 'RATE_LIMIT_SECRET'
```typescript
// ERROR: RATE_LIMIT_SECRET not in env types

// FIX: Add to .env and regenerate types, or make optional
// Option A: Add to apps/web/.env
RATE_LIMIT_SECRET="your-secret-key"
// Then run: pnpm svelte-kit sync

// Option B: Make optional in code
import { RATE_LIMIT_SECRET } from '$env/static/private';
const secret = RATE_LIMIT_SECRET ?? 'fallback-secret-key';
```

### Execution Script

```bash
# Fix each file in order
cd apps/web

# 1. Fix stripe.ts
code src/lib/services/stripe.ts
# Make changes, save

# 2. Fix transactions.ts
code src/lib/services/transactions.ts
# Change payment_status -> payout_status

# 3. Fix seo-urls.ts
code src/lib/utils/seo-urls.ts
# Add type guard

# 4. Fix payment routes
code src/routes/api/checkout/confirm/+server.ts
code src/routes/api/payments/confirm/+server.ts
# Add transaction to return type

# 5. Fix create-intent
code src/routes/api/payments/create-intent/+server.ts
# Define user variable

# 6. Fix login route
code src/routes/api/auth/login/+server.ts
# Remove unused import

# 7. Fix i18n runtime
cd ../../packages/i18n
code src/runtime.ts
# Add type assertion

# 8. Fix rate-limiter
cd ../../apps/web
# Add RATE_LIMIT_SECRET to .env or make optional
code src/lib/server/rate-limiter.ts

# Validate after each fix
pnpm --filter web check-types
```

### Validation
```bash
pnpm --filter web check-types  # Must show 0 errors
```

---

## Task 0.3: Fix Lint Errors (18 → 0)

### Automated Fix for Unused Variables

**Errors:**
- 17 unused variables (prefixed with `_` in function params)
- 1 `any` type in `auth/hooks.ts`

```bash
# Fix unused variables (prefix with underscore if needed for signature)
cd apps/web

# Files with unused variables:
# - src/lib/auth/onboarding.ts (3 errors)
# - src/lib/country/detection.ts (1 error)
# - src/lib/services/stripe.ts (3 errors)
# - src/lib/services/subscriptions.ts (9 errors)
# - src/routes/api/auth/login/+server.ts (1 error - already fixed in 0.2)
```

### Fix Script

```typescript
// Example fixes:

// Before:
async function updateProfile(supabase: SupabaseClient, profileId: string, brandName: string) {
  // Not using parameters
}

// After (if parameters needed for signature):
async function updateProfile(_supabase: SupabaseClient, _profileId: string, _brandName: string) {
  // Underscored to show intentionally unused
}

// Or remove if not needed:
async function updateProfile() {
  // Removed unused params
}
```

### Fix `any` Type
**File:** `src/lib/auth/hooks.ts:34`

```typescript
// Before:
function handleError(error: any) { ... }

// After:
function handleError(error: unknown) {
  // Use unknown instead of any, then type guard
  if (error instanceof Error) {
    // Handle error
  }
}
```

### Execution
```bash
# Open each file and fix
code src/lib/auth/hooks.ts
code src/lib/auth/onboarding.ts
code src/lib/country/detection.ts
code src/lib/services/stripe.ts
code src/lib/services/subscriptions.ts

# Run lint after each fix
pnpm --filter web lint
```

### Validation
```bash
pnpm --filter web lint --max-warnings=0  # Must pass with 0 errors
```

---

## Final Validation

### Run Complete Pipeline
```bash
# From repository root
pnpm -w turbo run lint check-types build

# If all pass:
✓ web:lint
✓ web:check-types
✓ web:build
✓ ui:lint
✓ ui:check-types
✓ ui:build
# etc...
```

### Verify Fixes
```bash
# Compare before/after
diff before-type-errors.txt <(pnpm --filter web check-types 2>&1)
diff before-lint-errors.txt <(pnpm --filter web lint 2>&1)

# Should show significant reduction/elimination of errors
```

### Commit Work
```bash
git add .
git commit -m "fix(phase-0): resolve critical type and lint errors

- Regenerated database types to sync with schema
- Fixed 14 TypeScript compilation errors
- Fixed 18 lint errors (unused variables, any types)
- All builds now pass cleanly

Fixes:
- stripe.ts: removed unused function, fixed order_items types
- transactions.ts: corrected payment_status -> payout_status
- seo-urls.ts: added type guard for category_slug
- payment routes: added transaction to return types
- rate-limiter.ts: added RATE_LIMIT_SECRET handling
- i18n runtime: fixed string indexing type
- auth/hooks.ts: replaced any with unknown
- multiple files: prefixed unused variables with underscore
"

git push origin refactor/phase-0-critical-fixes
```

---

## Success Criteria

- [x] Database types regenerated and synced
- [x] TypeScript errors: 14 → 0 ✅
- [x] Lint errors: 18 → 0 ✅
- [x] All builds pass: web, admin, docs, packages
- [x] No regressions introduced
- [x] Changes committed to feature branch

---

## If Things Go Wrong

### Rollback
```bash
git reset --hard HEAD~1  # Undo last commit
git clean -fd            # Remove untracked files
pnpm install             # Restore dependencies
```

### Ask for Help
- Document specific error
- Share full error message
- Note what you tried
- Ask in team chat or create issue

---

## Next Steps

1. Create PR for Phase 0 fixes
2. Request code review from Codex
3. Merge after approval
4. Proceed to Phase 1 (Documentation Consolidation)

---

**Remember:** Fix one issue at a time, validate frequently, commit working states.