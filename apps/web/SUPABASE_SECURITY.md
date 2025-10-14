# 🔒 SUPABASE PRODUCTION SECURITY GUIDE

## ✅ What We Fixed

### 1. **hooks.server.ts** - Production-Ready Authentication
- ✅ Proper JWT validation using `getUser()` instead of `getSession()`
- ✅ Secure cookie handling with `httpOnly`, `secure`, and `sameSite` flags
- ✅ Error boundaries and logging
- ✅ Security headers (CSP, X-Frame-Options, etc.)
- ✅ PKCE flow support

### 2. **+layout.ts** - Fixed Environment Variable Access
- ✅ Removed `process.env` usage in shared load functions
- ✅ Proper browser/SSR client creation pattern
- ✅ Environment variables passed from server via data

### 3. **client.ts** - Hardened Browser Client
- ✅ **REMOVED ALL HARDCODED CREDENTIALS** (this was a critical security issue!)
- ✅ Proper singleton pattern to prevent memory leaks
- ✅ URL validation
- ✅ Production-ready error handling
- ✅ Auth state change listeners for debugging

## 🚨 CRITICAL SECURITY RULES

### Rule #1: NEVER Trust `getSession()` on the Server

```typescript
// ❌ DANGEROUS - DO NOT DO THIS
const { data: { session } } = await supabase.auth.getSession();
if (session) {
  // This is UNSAFE! The JWT is not validated!
}

// ✅ SAFE - ALWAYS DO THIS
const { data: { user }, error } = await supabase.auth.getUser();
if (error || !user) {
  // User is not authenticated
}
```

**Why?** `getSession()` reads from cookies/localStorage WITHOUT validating the JWT. An attacker can tamper with it. `getUser()` validates the JWT by making a request to Supabase Auth.

### Rule #2: Use `safeGetSession` Helper

```typescript
// ✅ Best practice - use the helper we created
const { session, user } = await event.locals.safeGetSession();
if (!user) {
  throw error(401, 'Unauthorized');
}
```

### Rule #3: Protect API Routes

```typescript
// apps/web/src/routes/api/protected/+server.ts
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
  // ✅ Always validate user first
  const { session, user } = await locals.safeGetSession();
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Now safe to use user data
  const { data, error } = await locals.supabase
    .from('protected_table')
    .select()
    .eq('user_id', user.id);

  return new Response(JSON.stringify(data));
};
```

## 🛡️ Row Level Security (RLS)

### Enable RLS on ALL Tables

```sql
-- Enable RLS
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data"
  ON your_table
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own data"
  ON your_table
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own data"
  ON your_table
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own data"
  ON your_table
  FOR DELETE
  USING (auth.uid() = user_id);
```

### Test Your RLS Policies

```typescript
// Test in your app with different users
const { data, error } = await supabase
  .from('your_table')
  .select();

// Should only return data for the authenticated user
console.log(data); // Should be scoped to current user
```

## 🔐 Security Best Practices

### 1. **Environment Variables**
- ✅ Never commit `.env` files
- ✅ Never hardcode credentials in code
- ✅ Use different credentials for dev/staging/prod
- ✅ Rotate keys regularly

### 2. **Session Management**
```typescript
// ✅ Set appropriate session duration
// In Supabase Dashboard > Authentication > Settings
// Access token lifetime: 1 hour (default is good)
// Refresh token lifetime: 30 days (adjust based on needs)
```

### 3. **Password Security**
Your Supabase advisor detected issues:

**Fix #1: OTP Expiry**
- Go to Supabase Dashboard > Authentication > Email Auth
- Set OTP expiry to less than 1 hour (recommended: 10-15 minutes)

**Fix #2: Leaked Password Protection**
- Go to Supabase Dashboard > Authentication > Password Auth
- Enable "Leaked Password Protection"
- This checks passwords against HaveIBeenPwned database

**Fix #3: Postgres Upgrade**
- Go to Supabase Dashboard > Settings > Database
- Click "Upgrade" to get latest security patches

### 4. **API Keys**
```typescript
// Public anon key: ✅ Safe to expose (read-only)
PUBLIC_SUPABASE_ANON_KEY=eyJhbG...

// Service role key: ⚠️ NEVER expose to client
// Only use in server-side code
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

### 5. **HTTPS Only**
```typescript
// ✅ In production, ensure HTTPS
if (!dev) {
  // Cookies are set with secure flag
  event.cookies.set(name, value, {
    secure: true,
    httpOnly: true,
    sameSite: 'lax'
  });
}
```

## 📝 Code Review Checklist

Before deploying to production, check:

- [ ] All API routes use `safeGetSession()` or `getUser()`
- [ ] RLS is enabled on all tables
- [ ] RLS policies are tested
- [ ] No hardcoded credentials
- [ ] Environment variables are set in deployment
- [ ] OTP expiry is < 1 hour
- [ ] Leaked password protection is enabled
- [ ] Postgres is on latest version
- [ ] HTTPS is enforced in production
- [ ] Security headers are set
- [ ] Service role key is never exposed to client
- [ ] Session management is configured correctly

## 🔍 Common Security Issues to Avoid

### Issue #1: Using getSession() for Auth
```typescript
// ❌ WRONG
const { data: { session } } = await supabase.auth.getSession();
if (session) {
  // UNSAFE!
}
```

### Issue #2: No RLS Policies
```typescript
// ❌ Without RLS, anyone can read/write any data
const { data } = await supabase.from('users').select();
// This returns ALL users!
```

### Issue #3: Exposing Service Role Key
```typescript
// ❌ NEVER do this
const supabase = createClient(url, SERVICE_ROLE_KEY);
// Service role key bypasses RLS!
```

### Issue #4: Trusting Client Data
```typescript
// ❌ Client can fake this
const userId = request.body.userId;

// ✅ Always get from validated session
const { user } = await safeGetSession();
const userId = user.id;
```

## 📚 Additional Resources

- [Supabase Auth Security Best Practices](https://supabase.com/docs/guides/auth/auth-helpers/sveltekit)
- [Row Level Security Guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Server-Side Auth with SvelteKit](https://supabase.com/docs/guides/auth/server-side/sveltekit)
- [Security Advisories](https://supabase.com/docs/guides/platform/going-into-prod#security)

## 🚀 Next Steps

1. **Review all API routes** - Ensure they use `safeGetSession()`
2. **Test RLS policies** - Make sure users can only access their data
3. **Fix Supabase advisors** - OTP expiry, password protection, Postgres upgrade
4. **Setup monitoring** - Track failed auth attempts, suspicious activity
5. **Regular security audits** - Schedule quarterly reviews

## 📞 Need Help?

If you encounter security issues:
1. Check the Supabase docs first
2. Review this guide
3. Check your server logs
4. Reach out to the team

**Remember: Security is not a one-time thing. It's an ongoing process!** 🔒
