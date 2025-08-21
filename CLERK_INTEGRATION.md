# Clerk + Supabase Integration Guide

## Overview
Integrating Clerk auth with Supabase backend for Driplo marketplace. Clerk handles authentication, Supabase handles all business data (products, orders, reviews, etc.).

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   Clerk     │────▶│  SvelteKit  │────▶│   Supabase   │
│   (Auth)    │     │   (App)     │     │  (Database)  │
└─────────────┘     └─────────────┘     └──────────────┘
      ↓                    ↓                    ↓
   Users/Auth         Business Logic      Products/Orders
```

## How It Works

1. **Clerk manages authentication**
   - Signup/Login/Logout
   - OAuth providers
   - MFA/2FA
   - Session management

2. **Supabase stores everything else**
   - User profiles (linked to Clerk user ID)
   - Products, orders, reviews
   - Messages, favorites, etc.

3. **Connection: Clerk JWT → Supabase RLS**
   - Clerk issues JWTs with user ID
   - Supabase validates Clerk JWTs
   - RLS policies use `auth.jwt() ->> 'sub'` (Clerk user ID)

## Implementation Steps

### Step 1: Install Clerk

```bash
pnpm add @clerk/sveltekit @clerk/themes
```

### Step 2: Environment Variables

```env
# .env.local
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
PUBLIC_CLERK_SIGN_IN_URL=/sign-in
PUBLIC_CLERK_SIGN_UP_URL=/sign-up
PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Keep existing Supabase vars
PUBLIC_SUPABASE_URL=xxx
PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
SUPABASE_JWT_SECRET=xxx  # CRITICAL: Same as Clerk's signing key!
```

### Step 3: Configure Supabase to Accept Clerk JWTs

```sql
-- Migration: Enable Clerk JWT validation
-- The secret MUST match Clerk's JWT signing key

-- Update auth config to accept Clerk JWTs
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-clerk-jwt-secret';
ALTER DATABASE postgres SET "app.jwt_iss" TO 'https://clerk.your-domain.com';
ALTER DATABASE postgres SET "app.jwt_aud" TO 'authenticated';
```

### Step 4: Update hooks.server.ts

```typescript
// hooks.server.ts
import { clerkHandle, getAuth } from '@clerk/sveltekit/server';
import { createServerClient } from '@supabase/ssr';
import { sequence } from '@sveltejs/kit/hooks';

// Clerk authentication
const handleClerk = clerkHandle({
  // Protect routes
  protectedPaths: ['/dashboard', '/sell', '/messages'],
  // Sign in URL
  signInUrl: '/sign-in',
});

// Supabase client with Clerk token
const handleSupabase: Handle = async ({ event, resolve }) => {
  const { userId, getToken } = await getAuth(event);
  
  if (userId) {
    // Get Clerk JWT token
    const token = await getToken({ template: 'supabase' });
    
    // Create Supabase client with Clerk token
    event.locals.supabase = createServerClient(
      PUBLIC_SUPABASE_URL,
      PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: { /* cookie config */ },
        global: {
          headers: {
            Authorization: `Bearer ${token}` // Clerk JWT
          }
        }
      }
    );
    
    // Store user ID for RLS
    event.locals.userId = userId;
  } else {
    // Anonymous Supabase client
    event.locals.supabase = createServerClient(/* anon config */);
  }
  
  return resolve(event);
};

export const handle = sequence(handleClerk, handleSupabase);
```

### Step 5: Update RLS Policies

```sql
-- Update all RLS policies to use Clerk user ID
-- Example: products table

DROP POLICY IF EXISTS "Users can view their own products" ON products;

CREATE POLICY "Users can view their own products" ON products
  FOR SELECT
  USING (
    seller_id = auth.jwt() ->> 'sub' -- Clerk user ID from JWT
  );

-- Repeat for all tables: orders, reviews, messages, etc.
```

### Step 6: Sync User Profiles

```typescript
// After Clerk signup, create Supabase profile
// routes/(auth)/sign-up/+page.server.ts

import { clerkClient } from '@clerk/sveltekit/server';

export const actions = {
  complete: async ({ locals }) => {
    const { userId } = locals;
    const user = await clerkClient.users.getUser(userId);
    
    // Create profile in Supabase
    const { error } = await locals.supabase
      .from('profiles')
      .insert({
        id: userId, // Use Clerk user ID as primary key
        email: user.emailAddresses[0].emailAddress,
        username: user.username,
        full_name: `${user.firstName} ${user.lastName}`,
        avatar_url: user.imageUrl,
        created_at: new Date().toISOString()
      });
      
    if (error) throw error;
    
    return { success: true };
  }
};
```

### Step 7: Update Components

```svelte
<!-- Replace Supabase auth with Clerk -->
<script>
  import { SignIn, SignUp, UserButton } from '@clerk/sveltekit';
</script>

<!-- Beautiful Clerk components -->
<SignIn routing="path" path="/sign-in" />
<SignUp routing="path" path="/sign-up" />
<UserButton afterSignOutUrl="/" />
```

## Migration Checklist

### Phase 1: Setup (Day 1)
- [ ] Create Clerk account and app
- [ ] Install Clerk packages
- [ ] Configure environment variables
- [ ] Set up JWT template in Clerk dashboard
- [ ] Update Supabase to accept Clerk JWTs

### Phase 2: Integration (Day 2)
- [ ] Update hooks.server.ts
- [ ] Create profile sync webhook
- [ ] Update all RLS policies
- [ ] Test JWT validation

### Phase 3: UI Migration (Day 3)
- [ ] Replace login/signup pages with Clerk
- [ ] Add UserButton to header
- [ ] Update protected route handling
- [ ] Add OAuth providers (Google, etc.)

### Phase 4: Testing (Day 4)
- [ ] Test signup → profile creation
- [ ] Test login → data access
- [ ] Test protected routes
- [ ] Test RLS policies with Clerk IDs
- [ ] Test logout → data protection

## Potential Issues & Solutions

### Issue 1: RLS Policies
**Problem**: Existing policies use Supabase auth.uid()
**Solution**: Update to use `auth.jwt() ->> 'sub'` for Clerk user ID

### Issue 2: User ID Mismatch
**Problem**: Existing data uses Supabase UUIDs
**Solution**: Migration script to update all foreign keys to Clerk IDs

### Issue 3: Service Role Operations
**Problem**: Some operations need service role key
**Solution**: Keep service role for admin operations, use Clerk JWT for user operations

## Benefits of This Approach

✅ **Best of both worlds**
- Clerk's enterprise auth
- Supabase's powerful backend

✅ **Security**
- Clerk handles auth security
- Supabase RLS still protects data

✅ **Features**
- OAuth, MFA, device management (Clerk)
- Realtime, storage, postgres (Supabase)

✅ **Developer Experience**
- Beautiful auth UI components
- Keep existing database logic

## Code Examples

### Checking Auth Status
```typescript
// +page.server.ts
import { getAuth } from '@clerk/sveltekit/server';

export async function load({ request, locals }) {
  const { userId } = await getAuth(request);
  
  if (!userId) {
    throw redirect(303, '/sign-in');
  }
  
  // Fetch user's products with Clerk ID
  const { data: products } = await locals.supabase
    .from('products')
    .select('*')
    .eq('seller_id', userId);
    
  return { products };
}
```

### Creating Protected API Route
```typescript
// /api/products/+server.ts
export async function POST({ request, locals }) {
  const { userId } = locals; // From Clerk
  
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const data = await request.json();
  
  // Insert with Clerk user ID
  const { error } = await locals.supabase
    .from('products')
    .insert({
      ...data,
      seller_id: userId
    });
    
  return new Response('Created', { status: 201 });
}
```

## Rollback Plan

If integration fails:
1. Keep existing Supabase auth code in a branch
2. Revert hooks.server.ts
3. Restore original RLS policies
4. Remove Clerk packages

## Decision Matrix

**Use Clerk if you want:**
- Professional auth UI
- OAuth providers  
- MFA/2FA
- Enterprise security
- Less auth maintenance

**Stick with Supabase Auth if:**
- Current auth is sufficient
- You want single vendor
- Budget is tight
- You prefer full control

## Next Steps

1. **Evaluate**: Is the integration complexity worth the benefits?
2. **Prototype**: Try Clerk in a branch with a few routes
3. **Decide**: Based on prototype results
4. **Execute**: Follow this guide if proceeding

## Resources

- [Clerk SvelteKit Docs](https://clerk.com/docs/quickstarts/sveltekit)
- [Supabase JWT Validation](https://supabase.com/docs/guides/auth/jwts)
- [Clerk + Supabase Guide](https://clerk.com/docs/integrations/databases/supabase)