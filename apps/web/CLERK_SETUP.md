# Clerk + Supabase Integration Setup

This branch demonstrates how to use Clerk for authentication while keeping Supabase for database, storage, and other features.

## Setup Instructions

### 1. Create Clerk Application
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Copy your API keys

### 2. Configure Clerk for Supabase
1. In Clerk Dashboard, go to **Configure → Supabase Integration**
2. Or visit: https://dashboard.clerk.com/setup/supabase
3. Follow the setup wizard to configure Clerk for Supabase compatibility

### 3. Add Clerk Integration in Supabase
1. Go to your Supabase Dashboard
2. Navigate to **Authentication → Third-Party Auth**
3. Add Clerk integration with your Clerk domain (e.g., `your-app.clerk.accounts.dev`)

### 4. Set Environment Variables
Create `.env.local` file in `apps/web/`:

```env
# Clerk
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
PUBLIC_CLERK_SIGN_IN_URL=/sign-in
PUBLIC_CLERK_SIGN_UP_URL=/sign-up
PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Keep existing Supabase vars
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Update RLS Policies

Since Clerk JWTs have different structure than Supabase Auth, update your RLS policies:

```sql
-- Example: Allow users to read their own data
CREATE POLICY "Users can read own data" ON profiles
FOR SELECT
TO authenticated
USING (
  -- Clerk user ID is in the 'sub' claim
  id = (auth.jwt() ->> 'sub')
);

-- Example: Check organization membership
CREATE POLICY "Org members can access" ON products
FOR ALL
TO authenticated
USING (
  organization_id = (auth.jwt() ->> 'org_id')
);
```

### 6. Test the Integration

1. Start dev server: `pnpm dev`
2. Visit `/sign-up` to create account
3. Visit `/test-clerk` to verify integration
4. Check that Supabase queries work with Clerk auth

## Benefits

✅ **Better Auth UX**: Clerk handles all auth complexity
✅ **Keep Supabase Features**: Database, Storage, Realtime all work
✅ **Enterprise Features**: Built-in MFA, SSO, organization management
✅ **No User Migration**: Clean start with Clerk auth

## Migration Considerations

- Existing users need to re-register (no direct migration path)
- RLS policies need updating for Clerk JWT structure
- Additional monthly cost for Clerk (~$25/mo for starter)

## Files Changed

- `hooks.client.ts` - Initialize Clerk client
- `hooks.server.clerk.ts` - Handle Clerk auth on server
- `lib/supabase/clerk-client.ts` - Supabase client with Clerk tokens
- `routes/sign-in/+page.svelte` - Clerk sign-in component
- `routes/sign-up/+page.svelte` - Clerk sign-up component
- `routes/test-clerk/+page.svelte` - Integration test page