# Clerk + Supabase Integration Guide

> Maintainer audit notes (Aug 2025): This doc is sound on high level, but a few critical details determine whether migration is “easy” or risky. See Audit & Recommendation and Migration Options below before executing.

## Audit & Recommendation

- Ease: Migrating auth to Clerk can be low-friction if you avoid changing primary keys in your data model. The safest path is to keep your existing Supabase UUIDs as the canonical user identifier in the database and have Clerk mint JWTs whose `sub` equals that UUID via Clerk’s `external_id` + a JWT template. If you instead switch all tables to Clerk IDs (e.g., `user_xxx` strings), you must alter every FK/RLS policy and remove FKs to `auth.users`, which is a non-trivial data migration.
- RLS: Using `auth.jwt() ->> 'sub'` is correct for external JWTs. Ensure your JWT template includes `aud: authenticated` and `role: authenticated` to match typical Supabase policies.
- SvelteKit wiring: Prefer `locals.auth()` from `@clerk/sveltekit/server` and pass the Clerk token to Supabase via `global.headers.Authorization`. Disable supabase-js session persistence since Clerk owns the session.
- Profiles coupling: If your `profiles.id` has a FK to `auth.users(id)`, you must decouple it (drop FK) if you are not creating users in Supabase Auth anymore. Either: (A) keep `profiles.id` as the Supabase UUID and set Clerk’s `external_id` to that UUID; or (B) change `profiles.id` to `text` and store Clerk IDs directly (bigger migration).
- Webhooks: Add Clerk webhooks (`user.created`, `user.deleted`, `user.updated`) to create/update/delete rows in `profiles` using the service role key. This avoids race conditions and background sync gaps.
- Storage/Realtime: Update any Storage and Realtime RLS policies to use Clerk JWT (`auth.jwt() ->> 'sub'`). They are commonly overlooked.

## Migration Options (choose one)

1) Keep existing UUIDs (recommended; minimal change)
- In Clerk, backfill `external_id` for each user with the existing Supabase UUID (one-time script). Configure Clerk JWT Template (e.g., template name `supabase`) so `sub` = `external_id` and include `aud: authenticated`, `role: authenticated`.
- Pros: No DB schema changes; most RLS stays as-is if you used `auth.uid()` in policies and compare with UUID columns. You only change token source and some glue code.
- Cons: Requires mapping existing accounts in Clerk to your Supabase UUIDs (bulk update).

2) Switch DB to Clerk string IDs
- Rename/alter all user FK columns from `uuid` to `text` (e.g., `seller_id`, `buyer_id`, `author_id`, `profile.id`, message participants, reviews/ratings owners). Update all RLS policies from `auth.uid()` to `auth.jwt() ->> 'sub'` and remove any FK to `auth.users`.
- Pros: Single identity everywhere using Clerk IDs.
- Cons: Larger migration touching every referencing table and policy; not “just a simple replace”.

If you want a smooth path with minimal downtime, pick Option 1.

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
   - Supabase validates Clerk JWTs via a Clerk JWT Template signing key
   - RLS policies use `auth.jwt() ->> 'sub'` (Clerk user identifier)
   - Include `aud: authenticated` and `role: authenticated` in the JWT to satisfy typical Supabase policies

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
SUPABASE_JWT_SECRET=xxx  # Must match the Clerk JWT Template signing key (not your Clerk API secret)
```

### Step 3: Configure Supabase to Accept Clerk JWTs

```sql
-- Migration: Enable Clerk JWT validation
-- The secret MUST match Clerk's JWT signing key

-- Update auth config to accept Clerk JWTs
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-clerk-jwt-secret';
-- Optional: If you enforce issuer/audience, include values that match your Clerk JWT Template
ALTER DATABASE postgres SET "app.jwt_iss" TO 'https://clerk.your-domain.com';
ALTER DATABASE postgres SET "app.jwt_aud" TO 'authenticated';
```

Notes
- Create a Clerk JWT Template (e.g., named `supabase`) and add claims: `aud=authenticated`, `role=authenticated`. Set the template’s signing key; copy that to `SUPABASE_JWT_SECRET` and database `app.jwt_secret`.
- If you plan to keep Supabase UUIDs, set the JWT Template subject to `external_id` and ensure each Clerk user has `external_id` = your legacy UUID.

### Step 4: Update hooks.server.ts

```typescript
// hooks.server.ts
import { clerkHandle } from '@clerk/sveltekit/server';
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
  const { userId, getToken } = await event.locals.auth();
  
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
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );
    
    // Store user ID for RLS
    event.locals.userId = userId;
  } else {
    // Anonymous Supabase client
    event.locals.supabase = createServerClient(
      PUBLIC_SUPABASE_URL,
      PUBLIC_SUPABASE_ANON_KEY,
      { cookies: { /* cookie config */ } }
    );
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
    seller_id = auth.jwt() ->> 'sub' -- subject from JWT (Clerk user id or your external_id)
  );

-- Repeat for all tables: orders, reviews, messages, etc.
-- If keeping UUIDs, ensure JWT sub is your UUID (via external_id), then existing UUID comparisons continue to work.
```

### Step 6: Sync User Profiles

```typescript
// After Clerk signup, create Supabase profile
// routes/(auth)/sign-up/+page.server.ts

import { clerkClient } from '@clerk/sveltekit/server';

export const actions = {
  complete: async ({ locals }) => {
    const { userId } = await locals.auth();
    const user = await clerkClient.users.getUser(userId!);
    
    // Create profile in Supabase
    const { error } = await locals.supabase
      .from('profiles')
      .insert({
        // Option A (Clerk IDs everywhere):
        // id: userId,
        // Option B (keep UUIDs): id remains UUID, store Clerk id separately
        // clerk_id: userId,
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

Webhook alternative (recommended)
- Configure a Clerk webhook for `user.created`, `user.updated`, `user.deleted` to call a SvelteKit endpoint (or serverless function) that upserts/deletes `profiles`. Use the Supabase service role key in that handler so it bypasses RLS reliably.

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
- [ ] Update all RLS policies (tables + Storage + Realtime)
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
**Solution**: Prefer keeping UUIDs and set Clerk JWT `sub` to your UUID via `external_id`. If switching to Clerk IDs, run a full migration altering FK columns to text and dropping FKs to `auth.users`.

### Issue 3: Service Role Operations
**Problem**: Some operations need service role key
**Solution**: Keep service role for admin operations, use Clerk JWT for user operations

### Issue 4: auth.users FK
**Problem**: `profiles.id` often FKs to `auth.users(id)`; with Clerk-only auth, new rows won’t appear in `auth.users`.
**Solution**: Drop the FK and make `profiles.id` independent (Clerk id or your UUID). Migrate dependent tables/constraints accordingly.

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
  const { userId } = await locals.auth();
  
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
  const { userId } = await locals.auth(); // From Clerk
  
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
 - A path to keep existing UUIDs via JWT template subject

**Stick with Supabase Auth if:**
- Current auth is sufficient
- You want single vendor
- Budget is tight
- You prefer full control

## Next Steps

1. **Evaluate**: Is the integration complexity worth the benefits?
2. **Prototype**: Try Clerk in a branch with a few routes
3. **Decide**: Based on prototype results
4. **Execute**: Choose a migration option (UUIDs via `external_id` or switch to Clerk IDs) and follow the appropriate steps

## Resources

- [Clerk SvelteKit Docs](https://clerk.com/docs/quickstarts/sveltekit)
- [Supabase JWT Validation](https://supabase.com/docs/guides/auth/jwts)
- [Clerk + Supabase Guide](https://clerk.com/docs/integrations/databases/supabase)
