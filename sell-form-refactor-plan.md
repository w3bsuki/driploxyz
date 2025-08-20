# Sell Form Complete Refactor & Production Plan

## Current Issues Identified

### 1. Critical Translation Issues
- **Problem**: i18n functions showing `[object Object]` instead of text
- **Cause**: Functions being used as values instead of being called
- **Example**: `i18n.sell_photosAndDetails()` should be `i18n.sell_photosAndDetails()`

### 2. Authentication & Authorization Issues  
- **No proper auth check on /sell route**
- **Missing verification status check**
- **No proper session validation**
- **Brand subscription check not working properly**

### 3. Form Implementation Issues
- **Superforms integration not properly configured**
- **File upload handling incomplete**
- **Validation schema not properly integrated**
- **Multi-step form state management issues**

### 4. Missing Backend Integration
- **No proper server-side form handling (+page.server.ts)**
- **Product upload API endpoint missing**
- **Image upload to Supabase Storage not implemented**
- **Categories not loading from database**

### 5. UI/UX Issues
- **Missing proper error handling and display**
- **No loading states**
- **Step indicator not functioning properly**
- **Missing success feedback after listing**

## Refactor Implementation Plan

### Phase 1: Fix Translation System (Priority: CRITICAL)

```typescript
// FIX: All i18n function calls in +page.svelte
// FROM: title: i18n.sell_photosAndDetails()
// TO: title: i18n.sell_photosAndDetails()

// Affected areas:
- Step titles and descriptions
- Form labels and placeholders  
- Button text
- Error messages
- Success messages
```

### Phase 2: Implement Proper Authentication

```typescript
// apps/web/src/routes/sell/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, getSession } }) => {
  const session = await getSession();
  
  if (!session) {
    throw redirect(303, '/login?redirect=/sell');
  }

  // Check if user is verified
  const { data: profile } = await supabase
    .from('profiles')
    .select('verified, account_type, subscription_tier')
    .eq('id', session.user.id)
    .single();

  if (!profile?.verified) {
    throw redirect(303, '/onboarding');
  }

  // Check brand subscription if brand account
  if (profile.account_type === 'brand' && profile.subscription_tier !== 'brand') {
    return {
      needsBrandSubscription: true,
      plans: await getPlans()
    };
  }

  return {
    user: session.user,
    profile,
    categories: await getCategories()
  };
};
```

### Phase 3: Implement Server Actions

```typescript
// apps/web/src/routes/sell/+page.server.ts
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { ProductSchema } from '$lib/validation/product';

export const actions = {
  default: async ({ request, locals: { supabase, getSession } }) => {
    const session = await getSession();
    if (!session) return fail(401, { message: 'Unauthorized' });

    const formData = await request.formData();
    const form = await superValidate(formData, ProductSchema);

    if (!form.valid) {
      return fail(400, { form });
    }

    // Handle image uploads
    const photos = formData.getAll('photos') as File[];
    const photoUrls = [];

    for (const photo of photos) {
      const fileName = `${session.user.id}/${Date.now()}-${photo.name}`;
      const { data, error } = await supabase.storage
        .from('products')
        .upload(fileName, photo);

      if (error) {
        return fail(500, { form, message: 'Failed to upload images' });
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      photoUrls.push(publicUrl);
    }

    // Create product listing
    const { error: productError } = await supabase
      .from('products')
      .insert({
        ...form.data,
        seller_id: session.user.id,
        photos: photoUrls,
        status: 'active',
        views: 0,
        favorites_count: 0
      });

    if (productError) {
      return fail(500, { form, message: 'Failed to create listing' });
    }

    throw redirect(303, '/dashboard?success=listing_created');
  }
};
```

### Phase 4: Fix Form Component Integration

```typescript
// Update imports and component usage
import { 
  Button, 
  Input, 
  Select,
  ImageUploader,
  StepIndicator, 
  ConditionSelector,
  BrandSelector,
  PriceInput,
  TagInput
} from '@repo/ui';

// Ensure all components are properly built in @repo/ui
// Add missing components if needed
```

### Phase 5: Database Schema Updates

```sql
-- Ensure products table has all required fields
ALTER TABLE products ADD COLUMN IF NOT EXISTS photos_count INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS use_premium_boost BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS material TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES categories(id);

-- Add RLS policies for products
CREATE POLICY "Users can create their own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own products" ON products
  FOR UPDATE USING (auth.uid() = seller_id);
```

### Phase 6: Complete UI Component Library

Create missing components in `packages/ui/src/`:

```typescript
// ImageUploader.svelte
// StepIndicator.svelte  
// ConditionSelector.svelte
// BrandSelector.svelte
// PriceInput.svelte
// TagInput.svelte
```

### Phase 7: Add Proper Error Handling

```typescript
// Add toast notifications for all actions
import { addToast } from '@repo/ui';

// On success
addToast({
  type: 'success',
  message: 'Product listed successfully!'
});

// On error
addToast({
  type: 'error',
  message: 'Failed to upload product. Please try again.'
});
```

### Phase 8: Testing & Validation

1. **Authentication Flow**
   - Test redirect for unauthenticated users
   - Test onboarding redirect for unverified users
   - Test brand subscription check

2. **Form Submission**
   - Test image upload (multiple files)
   - Test form validation
   - Test successful product creation
   - Test error scenarios

3. **UI/UX**
   - Test multi-step navigation
   - Test form persistence between steps
   - Test responsive design
   - Test loading states

## Production Readiness Checklist

- [ ] All translations working (no [object Object])
- [ ] Authentication and authorization properly implemented
- [ ] Form validation working client and server-side
- [ ] Image upload to Supabase Storage working
- [ ] Product successfully saved to database
- [ ] RLS policies properly configured
- [ ] Error handling with user feedback
- [ ] Loading states for all async operations
- [ ] Mobile responsive design
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Performance optimization (image compression, lazy loading)
- [ ] Security (input sanitization, CSRF protection)
- [ ] Analytics tracking for form completion
- [ ] Email notification to seller on successful listing

## Priority Order

1. **CRITICAL**: Fix translations (immediate)
2. **HIGH**: Implement authentication & server actions
3. **HIGH**: Fix form submission and database integration
4. **MEDIUM**: Complete UI components
5. **MEDIUM**: Add error handling and feedback
6. **LOW**: Polish UI/UX and animations

## Estimated Timeline

- Phase 1-2: 2 hours (Critical fixes)
- Phase 3-4: 4 hours (Core functionality)
- Phase 5-6: 3 hours (Components & DB)
- Phase 7-8: 2 hours (Polish & testing)

**Total: ~11 hours for complete production-ready implementation**