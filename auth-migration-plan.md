# Quick Auth Migration & Fixes Plan

## Current Status
- ✅ **Onboarding**: Already uses native forms (no superforms!)
- ❌ **Login/Signup**: Uses superforms (needs migration)
- ❌ **Rate Limiting**: Not implemented
- ❌ **Stripe Payment**: Missing publishable key in BrandPaymentModal

## 1. Fix Stripe Payment (5 minutes)
The issue is simple - the Stripe publishable key isn't being passed to BrandPaymentModal.

## 2. Add Rate Limiting (10 minutes)
Smart rate limiting that doesn't annoy normal users:
- **Login**: 10 attempts per 15 minutes per IP
- **Signup**: 5 attempts per hour per IP
- **Password Reset**: 3 attempts per hour per email
- Uses in-memory store (no Redis needed for V1)

## 3. Migrate Auth to Native Forms (30 minutes)
Since onboarding already uses native forms and works great, we can copy that pattern.

## Timeline: 45 minutes total

### Phase 1: Fix Stripe (5 min)
- Pass PUBLIC_STRIPE_PUBLISHABLE_KEY to BrandPaymentModal
- Verify environment variable exists

### Phase 2: Add Rate Limiting (10 min)
- Create reusable rate limiter
- Add to auth endpoints
- Test with normal usage patterns

### Phase 3: Convert Login Form (15 min)
- Remove superforms
- Add native form with fetch
- Better error handling with toasts

### Phase 4: Convert Signup Form (15 min)
- Remove superforms
- Add native form
- Keep existing validation logic

## Why This Will Be Fast

1. **Onboarding already works** - We have a working pattern to copy
2. **Simple forms** - Auth forms only have 2-3 fields
3. **Validation stays same** - We keep Zod, just remove superforms wrapper
4. **API routes exist** - Backend doesn't change much

## Benefits After Migration

- **Better errors**: Direct access to Supabase errors
- **Faster forms**: No superforms overhead
- **Easier debugging**: Less abstraction
- **Ready for Clerk**: Simpler migration path