# CRITICAL FIXES: Image Upload & Listing Creation

## Problem
The Supabase JS client's auth methods (`getUser()` and `getSession()`) were hanging indefinitely when called from the browser, causing image uploads to never complete.

## Root Cause
The Supabase client's auth methods seem to have a bug where they hang when called in certain contexts, possibly due to:
- Cookie/session synchronization issues
- Network request timeouts
- Auth state conflicts

## THE FIX (DO NOT BREAK THIS)

### 1. Pass access token directly from server-loaded session
In `+page.svelte`:
```typescript
// USE THE SESSION FROM PAGE DATA - IT'S ALREADY LOADED SERVER-SIDE
const userId = data.session?.user?.id;
const accessToken = data.session?.access_token;

// PASS THE ACCESS TOKEN TO AVOID HANGING AUTH METHODS
const uploaded = await uploadImages(supabase, files, 'product-images', userId, undefined, accessToken);
```

### 2. Use direct fetch to Supabase Storage API
In `storage.ts`:
```typescript
// IF WE HAVE ACCESS TOKEN, USE DIRECT FETCH INSTEAD OF SUPABASE CLIENT
if (accessToken) {
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'x-upsert': 'false'
    },
    body: fileToUpload,
    signal: controller.signal
  });
}
```

## RULES TO NEVER BREAK THIS AGAIN

1. **NEVER call `supabase.auth.getUser()` or `supabase.auth.getSession()` in the browser during upload**
   - These methods WILL hang indefinitely
   - Always use the session from page data instead

2. **ALWAYS pass the access token from server-loaded session data**
   - The session is loaded in `+page.server.ts` or `+layout.server.ts`
   - Access it via `data.session` in components

3. **USE direct fetch for storage operations when possible**
   - The Supabase storage client seems unreliable
   - Direct HTTP calls with proper auth headers work better

4. **INCLUDE timeout protection**
   - Always use AbortController with timeouts
   - Never trust Supabase client promises to resolve

## Files Involved
- `/routes/(protected)/sell/+page.svelte` - Gets session from page data
- `/lib/supabase/storage.ts` - Uses direct fetch with access token
- `/routes/(protected)/+layout.server.ts` - Loads session server-side

## Testing
To verify the fix works:
1. User must be logged in (session loaded server-side)
2. Upload an image in /sell form
3. Should see "Using direct fetch with access token" in console
4. Upload completes within 5 seconds

## What NOT to do
- Don't remove the accessToken parameter
- Don't call getUser() or getSession() during upload
- Don't trust Supabase client auth methods in browser
- Don't remove timeout protection

---

## FIX 2: Product Condition Enum Values

### Problem
The form was using wrong condition values like "new" instead of the database enum values, causing "invalid input value for enum product_condition" errors.

### Database Enum Values (DO NOT CHANGE)
```sql
product_condition enum: {
  'brand_new_with_tags',
  'new_without_tags', 
  'like_new',
  'good',
  'worn',
  'fair'
}
```

### Files That Must Stay Synchronized
1. **ConditionSelector.svelte** - UI component
   ```typescript
   type ConditionValue = 'brand_new_with_tags' | 'new_without_tags' | 'like_new' | 'good' | 'worn' | 'fair';
   ```

2. **StepProductInfo.svelte** - Fallback select
   ```html
   <option value="brand_new_with_tags">New with tags</option>
   <option value="new_without_tags">New without tags</option>
   <option value="like_new">Like new</option>
   <option value="good">Good</option>
   <option value="worn">Worn</option>
   <option value="fair">Fair</option>
   ```

### NEVER DO THIS
- Don't use "new" as a condition value
- Don't use "like-new" with a hyphen
- Don't remove any enum values
- Don't add new values without updating the database enum

---

## FIX 3: Category Structure (2-tier vs 3-tier)

### Problem
Some categories only have 2 tiers (Gender > Type) while others have 3 tiers (Gender > Type > Specific). Form was requiring 3 tiers for all.

### The Fix
In `+page.server.ts`:
```typescript
// Use type_category_id if no Level 3 category exists
const category_id = formData.get('category_id') as string || type_category_id;
```

### Rules
1. **Allow 2-tier categories** - Don't require Level 3 if it doesn't exist
2. **Use type_category_id as fallback** - When no specific category is selected
3. **Validation should check**: `(formData.category_id || specificCategories.length === 0)`

---

## Complete Listing Creation Checklist

To ensure listing creation always works:

1. ✅ **Image Upload**
   - Pass access token from server session
   - Use direct fetch to storage API
   - Never call getUser() or getSession()

2. ✅ **Condition Values**
   - Must match database enum exactly
   - Use underscores, not hyphens
   - All 6 values must be available

3. ✅ **Category Selection**
   - Allow 2-tier categories
   - Use type_category_id as fallback
   - Don't require Level 3 if none exist

4. ✅ **Session Management**
   - Use `data.session` from page props
   - Never fetch session in browser during critical ops
   - Pass tokens explicitly to avoid hangs

## Testing After Any Changes
```bash
1. Login as user
2. Go to /sell
3. Upload an image - should complete in <5 seconds
4. Select any condition - should use correct enum value
5. Select 2-tier category - should allow submission
6. Submit form - should create product successfully
```