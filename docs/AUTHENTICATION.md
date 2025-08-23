# AUTHENTICATION - Session & JWT Management

**Reference**: https://svelte.dev/docs/kit/auth

## AUTHENTICATION STRATEGIES

### 1. Session-Based (Recommended)
```typescript
// hooks.server.ts
import { createServerClient } from '@supabase/ssr';

export async function handle({ event, resolve }) {
  // Create Supabase client
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => event.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            event.cookies.set(name, value, options);
          });
        }
      }
    }
  );

  // Get session
  event.locals.safeGetSession = async () => {
    const { data: { session }, error } = await event.locals.supabase.auth.getSession();
    if (!session || error) {
      return { session: null, user: null };
    }
    return { session, user: session.user };
  };

  return resolve(event);
}
```

### 2. JWT-Based (Performance)
```typescript
// For API routes with high traffic
import jwt from '@tsndr/cloudflare-worker-jwt';

export async function verifyJWT(token: string) {
  try {
    const isValid = await jwt.verify(token, JWT_SECRET);
    if (!isValid) return null;
    
    const { payload } = jwt.decode(token);
    return payload;
  } catch {
    return null;
  }
}
```

## SECURE COOKIE CONFIGURATION

### 1. Session Cookies
```typescript
// Set secure session cookie
cookies.set('session', sessionToken, {
  path: '/',
  httpOnly: true,        // Prevent XSS
  secure: true,          // HTTPS only
  sameSite: 'lax',       // CSRF protection
  maxAge: 60 * 60 * 24 * 7, // 1 week
  domain: '.driplo.xyz'  // Include subdomains
});
```

### 2. Remember Me
```typescript
// Long-lived refresh token
cookies.set('refresh_token', refreshToken, {
  path: '/',
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 60 * 60 * 24 * 30, // 30 days
});
```

## ROUTE PROTECTION

### 1. Server-Side Guards
```typescript
// +layout.server.ts
export async function load({ locals, url }) {
  const { session, user } = await locals.safeGetSession();
  
  // Protected routes
  const protectedRoutes = ['/dashboard', '/settings', '/orders'];
  const isProtected = protectedRoutes.some(route => 
    url.pathname.startsWith(route)
  );
  
  if (isProtected && !session) {
    redirect(303, `/login?redirectTo=${url.pathname}`);
  }
  
  return {
    session,
    user
  };
}
```

### 2. Page-Level Protection
```typescript
// +page.server.ts
export async function load({ locals }) {
  const { session } = await locals.safeGetSession();
  
  if (!session) {
    error(401, 'Unauthorized');
  }
  
  // Load protected data
  return {
    data: await loadProtectedData(session.user.id)
  };
}
```

### 3. API Route Protection
```typescript
// +server.ts
export async function GET({ locals }) {
  const { session } = await locals.safeGetSession();
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Return protected resource
  return json({ data: 'secret' });
}
```

## LOGIN FLOW

### 1. Email/Password
```typescript
// +page.server.ts
export const actions = {
  login: async ({ request, locals, cookies }) => {
    const data = await request.formData();
    const email = data.get('email')?.toString();
    const password = data.get('password')?.toString();
    
    // Validate
    if (!email || !password) {
      return fail(400, { 
        error: 'Email and password required' 
      });
    }
    
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Authenticate
    const { data: authData, error } = await locals.supabase.auth
      .signInWithPassword({
        email: normalizedEmail,
        password
      });
    
    if (error) {
      return fail(401, { 
        error: 'Invalid credentials' 
      });
    }
    
    // Redirect after login
    const redirectTo = url.searchParams.get('redirectTo') || '/dashboard';
    redirect(303, redirectTo);
  }
};
```

### 2. OAuth Providers
```typescript
// Login with Google
export const actions = {
  oauth: async ({ url, locals }) => {
    const provider = url.searchParams.get('provider');
    
    const { data, error } = await locals.supabase.auth
      .signInWithOAuth({
        provider,
        options: {
          redirectTo: `${url.origin}/auth/callback`
        }
      });
    
    if (error) {
      return fail(400, { error: error.message });
    }
    
    redirect(303, data.url);
  }
};
```

### 3. Magic Links
```typescript
// Passwordless login
export const actions = {
  sendMagicLink: async ({ request, locals }) => {
    const data = await request.formData();
    const email = data.get('email')?.toString();
    
    const { error } = await locals.supabase.auth
      .signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${url.origin}/auth/confirm`
        }
      });
    
    if (error) {
      return fail(400, { error: error.message });
    }
    
    return { success: true };
  }
};
```

## LOGOUT FLOW

```typescript
// +server.ts
export async function POST({ locals, cookies }) {
  // Sign out from Supabase
  await locals.supabase.auth.signOut();
  
  // Clear all auth cookies
  cookies.delete('sb-access-token', { path: '/' });
  cookies.delete('sb-refresh-token', { path: '/' });
  
  // Redirect to home
  redirect(303, '/');
}
```

## SESSION VALIDATION

### 1. Middleware Check
```typescript
// hooks.server.ts
export async function handle({ event, resolve }) {
  // Validate on every request
  const session = event.cookies.get('session');
  
  if (session) {
    try {
      const user = await validateSession(session);
      event.locals.user = user;
    } catch {
      // Invalid session - clear it
      event.cookies.delete('session', { path: '/' });
    }
  }
  
  return resolve(event);
}
```

### 2. Refresh Tokens
```typescript
// Auto-refresh expired tokens
async function refreshSession(refreshToken: string) {
  const { data, error } = await supabase.auth
    .refreshSession({ refresh_token: refreshToken });
  
  if (error) throw error;
  
  return data.session;
}
```

## AUTHORIZATION PATTERNS

### 1. Role-Based Access
```typescript
// Check user role
export async function load({ locals }) {
  const { user } = await locals.safeGetSession();
  
  if (!user) {
    error(401, 'Unauthorized');
  }
  
  // Check role from database
  const { data: profile } = await locals.supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (profile?.role !== 'admin') {
    error(403, 'Forbidden');
  }
  
  return { user, role: profile.role };
}
```

### 2. Resource-Based Access
```typescript
// Check ownership
export async function load({ params, locals }) {
  const { user } = await locals.safeGetSession();
  
  const { data: resource } = await locals.supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single();
  
  if (resource.user_id !== user.id) {
    error(403, 'You do not own this resource');
  }
  
  return { resource };
}
```

## SECURITY BEST PRACTICES

### ✅ DO
```typescript
// Rate limiting
const attempts = new Map();

function checkRateLimit(ip: string) {
  const count = attempts.get(ip) || 0;
  if (count > 5) {
    error(429, 'Too many attempts');
  }
  attempts.set(ip, count + 1);
}

// CSRF protection
if (event.request.method === 'POST') {
  const origin = event.request.headers.get('origin');
  if (origin !== event.url.origin) {
    error(403, 'CSRF detected');
  }
}

// Secure headers
response.headers.set('X-Frame-Options', 'DENY');
response.headers.set('X-Content-Type-Options', 'nosniff');
```

### ❌ DON'T
```typescript
// Don't store passwords in plain text
// Don't use GET for state-changing operations
// Don't expose sensitive data in URLs
// Don't trust client-side validation
// Don't store tokens in localStorage
// Don't disable CSRF protection
// Don't use weak session secrets
// Don't expose internal user IDs
```

## PASSWORD SECURITY

### 1. Requirements
```typescript
function validatePassword(password: string) {
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain uppercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain number';
  }
  return null;
}
```

### 2. Reset Flow
```typescript
export const actions = {
  requestReset: async ({ request, locals }) => {
    const data = await request.formData();
    const email = data.get('email');
    
    // Always return success (don't leak user existence)
    await locals.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${url.origin}/auth/reset`
    });
    
    return { success: true };
  }
};
```

## ERROR HANDLING

```typescript
// Consistent error messages
const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  SESSION_EXPIRED: 'Your session has expired',
  UNAUTHORIZED: 'Please log in to continue',
  FORBIDDEN: 'You do not have permission',
  RATE_LIMITED: 'Too many attempts, try again later'
};

// Log security events
function logSecurityEvent(event: string, userId?: string) {
  console.log({
    event,
    userId,
    timestamp: new Date().toISOString(),
    ip: getClientIP()
  });
}
```

## TESTING AUTH

```typescript
// Test protected routes
test('redirects to login when not authenticated', async () => {
  const response = await app.request('/dashboard');
  expect(response.status).toBe(303);
  expect(response.headers.get('location')).toBe('/login');
});

// Test session validation
test('validates session token', async () => {
  const response = await app.request('/api/user', {
    headers: {
      'Cookie': 'session=invalid-token'
    }
  });
  expect(response.status).toBe(401);
});
```

## AUDIT COMMANDS

```bash
# Check for security headers
curl -I https://driplo.xyz

# Test CSRF protection
curl -X POST https://driplo.xyz/api/test \
  -H "Origin: https://evil.com"

# Check cookie settings
# Browser DevTools > Application > Cookies
```