# Mobile 500 Error Fix Plan - Driplo

## Table of Contents
1. [Critical Issues Identified](#critical-issues-identified)
2. [Tech Stack Best Practices](#tech-stack-best-practices)
3. [Step-by-Step Fix Implementation](#step-by-step-fix-implementation)
4. [Deployment Steps](#deployment-steps)
5. [Monitoring & Debugging](#monitoring--debugging)

## Tech Stack Best Practices

### Turborepo Monorepo Best Practices

#### ✅ DO's:
- **Structure**: Use `apps/` for applications and `packages/` for shared code
- **Build Pipeline**: Configure proper dependency order in `turbo.json`
- **Outputs**: Include `.svelte-kit/**` and `.vercel/**` in build outputs
- **Workspace Protocol**: Use `workspace:*` for internal package dependencies
- **Parallel Dev**: Assign different ports to each app in dev scripts
- **Package Configs**: Use package-specific `turbo.json` for specialized tasks
- **Build Order**: Always build packages before apps (`pnpm build --filter @repo/ui`)

#### ❌ DON'Ts:
- Don't forget to specify outputs in turbo.json (causes cache invalidation issues)
- Don't use relative imports across packages (use workspace dependencies)
- Don't mix different package managers (stick to pnpm)
- Don't skip building packages before deployment

### SvelteKit 2 + Svelte 5 Best Practices

#### ✅ DO's:
- **Runes Only**: Use `$state`, `$derived`, `$effect`, `$props` exclusively
- **Type Safety**: Always define Props interfaces for components
- **Snippets**: Use snippets for slot-like content
- **Load Functions**: Use server-side load functions for data fetching
- **Error Boundaries**: Implement proper error boundaries and fallbacks
- **Hydration**: Ensure server and client render identical HTML
- **Browser Guards**: Wrap browser APIs in `if (browser)` checks

#### ❌ DON'Ts:
- Never use legacy Svelte 4 syntax (`$:`, `export let`, etc.)
- Never access `window` or `document` during SSR
- Never use `#` hrefs (accessibility violation)
- Never mix runes with legacy patterns
- Never skip null checks for async data

### Vercel Adapter Best Practices

#### ✅ DO's:
- **Use @sveltejs/adapter-vercel** explicitly (not adapter-auto)
- **Specify Runtime**: Use `nodejs20.x` for Node.js features
- **Edge Functions**: Explicitly mark routes needing edge with config
- **Environment Variables**: Use proper prefixes (PUBLIC_ for client)
- **ISR/SSG**: Configure proper caching strategies
- **Region Selection**: Specify regions for lower latency

#### ❌ DON'Ts:
- Don't use adapter-auto in production (unpredictable behavior)
- Don't mix edge and Node runtimes without explicit configuration
- Don't expose private env vars to client code
- Don't forget to add all env vars to Vercel dashboard

### Supabase + SvelteKit SSR Best Practices

#### ✅ DO's:
- **Cookie Configuration**: Set proper `SameSite`, `Secure`, `HttpOnly` attributes
- **Server Client**: Create server client in hooks.server.ts
- **Session Validation**: Use `safeGetSession` with JWT validation
- **RLS Policies**: Always enable and configure Row Level Security
- **Error Handling**: Gracefully handle auth and database errors
- **Service Role**: Only use service role key server-side

#### ❌ DON'Ts:
- Don't trust `getSession()` without `getUser()` validation
- Don't expose service role key to client
- Don't skip null checks for supabase client
- Don't ignore cookie issues on mobile Safari

### Paraglide i18n Best Practices

#### ✅ DO's:
- **Vite Plugin**: Use the new Vite plugin (v2.0)
- **Language Detection**: Implement cookie or URL-based detection
- **Link Translation**: Let Paraglide auto-translate links
- **Tree-shaking**: Leverage automatic message tree-shaking
- **Reload on Switch**: Use `data-sveltekit-reload` on language switchers
- **Load Dependencies**: Use `depends("paraglide:lang")` for reactive data

#### ❌ DON'Ts:
- Don't hardcode translated strings in components
- Don't forget data-sveltekit-reload on language switches
- Don't mix different i18n strategies
- Don't ignore locale detection failures

## Critical Issues Identified

Based on the diagnosis and code review, here are the primary issues causing the mobile 500 error:

### 1. **Adapter Runtime Mismatch (HIGHEST PRIORITY)**
- **Problem**: Using `adapter-auto` which may deploy to edge runtime where Node.js APIs aren't available
- **Impact**: Stripe, Supabase server functions may fail on edge runtime
- **Fix**: Switch to `@sveltejs/adapter-vercel` with explicit Node.js runtime

### 2. **Redirect Loop in Onboarding Flow**
- **Problem**: Multiple redirect checks causing circular redirects
  - `+layout.server.ts` redirects to `/onboarding` if profile incomplete
  - `/onboarding/+page.ts` redirects to `/dashboard` if complete
  - Both fetch profile separately, potential race condition
- **Impact**: Mobile browsers handle redirect loops differently, may throw 500

### 3. **Missing Null Guards for Supabase Client**
- **Problem**: `onboarding/+page.ts` uses `supabase` without null check
- **Impact**: If supabase is null (SSR or env var issues), causes runtime error

### 4. **Cookie Configuration Issues**
- **Problem**: Cookies not explicitly set with `SameSite` and `Secure` attributes
- **Impact**: Mobile Safari's stricter cookie policies may reject auth cookies

### 5. **Environment Variable Access**
- **Problem**: Using `$env/dynamic/public` which may not work correctly in edge runtime
- **Impact**: Missing env vars cause supabase client to be null

## Step-by-Step Fix Implementation

### Phase 1: Critical Runtime Fixes

#### 1.1 Switch to Vercel Adapter ✅ DONE
```bash
pnpm add -D @sveltejs/adapter-vercel --filter web
```

#### 1.2 Update svelte.config.js
```javascript
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      runtime: 'nodejs20.x', // Force Node.js runtime
      regions: ['iad1'], // Optional: specify region
      split: false // Keep everything in one function for now
    })
  }
};

export default config;
```

#### 1.3 Add Production Logging to hooks.server.ts
```typescript
import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect, error } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { env } from '$env/dynamic/public';
import type { Database } from '$lib/types/database.types';

const supabase: Handle = async ({ event, resolve }) => {
  // Production logging
  if (process.env.NODE_ENV === 'production') {
    console.log('[HOOK]', {
      path: event.url.pathname,
      hasUrl: !!env.PUBLIC_SUPABASE_URL,
      hasKey: !!env.PUBLIC_SUPABASE_ANON_KEY,
      cookies: event.cookies.getAll().map(c => c.name)
    });
  }
  
  // CRITICAL: Fail fast in production
  if (!env.PUBLIC_SUPABASE_URL || !env.PUBLIC_SUPABASE_ANON_KEY) {
    console.error('[CRITICAL] Missing Supabase environment variables');
    throw error(500, 'Configuration error: Missing required environment variables');
  }

  event.locals.supabase = createServerClient<Database>(
    env.PUBLIC_SUPABASE_URL,
    env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return event.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            event.cookies.set(name, value, { 
              ...options, 
              path: '/',
              sameSite: 'lax',
              secure: true,
              httpOnly: true
            })
          );
        },
      },
    }
  );

  // Rest of the code...
};
```

### Phase 2: Fix Redirect Loops

#### 2.1 Consolidate Onboarding Logic in +layout.server.ts
```typescript
export const load: LayoutServerLoad = async ({ locals: { safeGetSession, supabase }, url }) => {
  const { session, user } = await safeGetSession();

  // Production logging
  if (process.env.NODE_ENV === 'production') {
    console.log('[LAYOUT_LOAD]', {
      path: url.pathname,
      hasSession: !!session,
      hasUser: !!user,
      hasSupabase: !!supabase
    });
  }

  let profile = null;
  if (user && supabase) {
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('[PROFILE_ERROR]', profileError);
      }
      
      profile = data;
      
      // IMPORTANT: Single redirect check with guard
      if (profile && 
          !profile.onboarding_completed && 
          !url.pathname.startsWith('/onboarding') &&
          !url.pathname.startsWith('/api') &&
          !url.pathname.startsWith('/login') &&
          !url.pathname.startsWith('/signup')) {
        throw redirect(303, '/onboarding');
      }
    } catch (err) {
      console.error('[LAYOUT_ERROR]', err);
      // Don't crash on profile fetch errors
    }
  }

  return {
    session,
    user,
    profile,
    supabase: null,
  };
};
```

#### 2.2 Simplify onboarding/+page.ts
```typescript
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const { user, profile } = await parent();
  
  // User check
  if (!user) {
    throw redirect(303, '/login');
  }

  // Profile already loaded in parent, no need to fetch again
  if (profile?.onboarding_completed) {
    throw redirect(303, '/dashboard');
  }

  return {
    user,
    profile
  };
};
```

### Phase 3: Add Null Guards

#### 3.1 Update all client-side supabase usage
```typescript
// In any component using supabase
import { getSupabase } from '$lib/stores/supabase';

const supabase = getSupabase();

// Always check before using
if (!supabase) {
  console.error('Supabase client not initialized');
  return;
}
```

### Phase 4: Paraglide/i18n URL Structure

#### 4.1 Check if Paraglide should add locale prefixes
Currently URLs are not prefixed with locales (/en, /bg, etc.). This is normal for cookie-based locale detection, but we should verify:

1. Check if locale detection is causing issues
2. Ensure LocaleDetector component doesn't cause hydration mismatches
3. Verify cookie consent banner doesn't block critical cookies

### Phase 5: Environment Variables

#### 5.1 Create deployment verification script
```typescript
// src/routes/api/health/+server.ts
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

export function GET() {
  return json({
    status: 'ok',
    env: {
      hasPublicSupabaseUrl: !!env.PUBLIC_SUPABASE_URL,
      hasPublicSupabaseAnonKey: !!env.PUBLIC_SUPABASE_ANON_KEY,
      hasServiceRoleKey: !!privateEnv.SUPABASE_SERVICE_ROLE_KEY,
      hasStripePublicKey: !!env.PUBLIC_STRIPE_PUBLISHABLE_KEY,
      hasStripeSecretKey: !!privateEnv.STRIPE_SECRET_KEY,
    },
    runtime: process.env.VERCEL_REGION || 'unknown',
    nodeVersion: process.version
  });
}
```

## Deployment Steps

1. **Implement all code changes above**
2. **Test locally with production build**:
   ```bash
   pnpm build --filter web
   pnpm preview --filter web
   ```

3. **Deploy to Vercel**:
   ```bash
   git add -A
   git commit -m "Fix mobile 500: Switch to Vercel adapter, fix redirect loops, add logging"
   git push
   ```

4. **Verify deployment**:
   - Check `/api/health` endpoint
   - Test on real mobile device
   - Monitor Vercel function logs

5. **If still failing**, check:
   - Vercel environment variables (all present?)
   - Function logs for specific error
   - Network tab on mobile for redirect chains

## Monitoring After Deploy

Add these temporary endpoints for debugging:

```typescript
// /api/debug/cookies/+server.ts
export function GET({ cookies }) {
  return json({
    cookies: cookies.getAll().map(c => ({
      name: c.name,
      hasValue: !!c.value,
      length: c.value?.length || 0
    }))
  });
}

// /api/debug/session/+server.ts
export async function GET({ locals }) {
  const { session, user } = await locals.safeGetSession();
  return json({
    hasSession: !!session,
    hasUser: !!user,
    userId: user?.id
  });
}
```

## Quick Checklist

- [ ] Installed @sveltejs/adapter-vercel
- [ ] Updated svelte.config.js with Node.js runtime
- [ ] Added fail-fast env var checks in hooks.server.ts
- [ ] Fixed cookie attributes (SameSite, Secure)
- [ ] Consolidated redirect logic to prevent loops
- [ ] Added null guards for supabase usage
- [ ] Added production logging
- [ ] Deployed and tested on real mobile device

## Emergency Rollback

If deployment makes things worse:
1. Revert to previous commit
2. Deploy with more verbose logging
3. Use Vercel's instant rollback feature

## Success Criteria

- Mobile iOS loads without 500 error
- No redirect loops in network tab
- Cookies persist properly
- Onboarding flow works correctly
- Language selector works without breaking

## Complete Fix Implementation Code

Here are all the files that need to be updated:

### 1. apps/web/svelte.config.js
```javascript
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      runtime: 'nodejs20.x',
      regions: ['iad1'],
      split: false,
      isr: {
        expiration: 60
      }
    })
  }
};

export default config;
```

### 2. turbo.json (root)
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".svelte-kit/**", ".vercel/**", "dist/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "preview": {
      "dependsOn": ["build"]
    },
    "check": {
      "dependsOn": ["^build"]
    },
    "lint": {},
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

### 3. Complete hooks.server.ts with all fixes
```typescript
import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect, error } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/types/database.types';

const supabase: Handle = async ({ event, resolve }) => {
  // Production logging
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    console.log('[HOOK_START]', {
      path: event.url.pathname,
      method: event.request.method,
      userAgent: event.request.headers.get('user-agent')?.substring(0, 50),
      hasSupabaseUrl: !!PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!PUBLIC_SUPABASE_ANON_KEY
    });
  }
  
  // CRITICAL: Fail fast with clear error
  if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
    console.error('[CRITICAL] Missing Supabase environment variables', {
      url: !!PUBLIC_SUPABASE_URL,
      key: !!PUBLIC_SUPABASE_ANON_KEY
    });
    throw error(500, 'Server configuration error. Please contact support.');
  }

  try {
    event.locals.supabase = createServerClient<Database>(
      PUBLIC_SUPABASE_URL,
      PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return event.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Mobile Safari fix: explicit cookie attributes
              event.cookies.set(name, value, { 
                ...options, 
                path: '/',
                sameSite: 'lax',
                secure: event.url.protocol === 'https:',
                httpOnly: true,
                maxAge: 60 * 60 * 24 * 7 // 7 days
              });
            });
          },
        },
      }
    );

    event.locals.safeGetSession = async () => {
      try {
        const { data: { session } } = await event.locals.supabase.auth.getSession();
        
        if (!session) {
          return { session: null, user: null };
        }

        const { data: { user }, error } = await event.locals.supabase.auth.getUser();
        
        if (error || !user) {
          if (isProd) console.log('[AUTH] JWT validation failed');
          return { session: null, user: null };
        }

        return { session, user };
      } catch (err) {
        console.error('[AUTH_ERROR]', err);
        return { session: null, user: null };
      }
    };
  } catch (err) {
    console.error('[SUPABASE_INIT_ERROR]', err);
    throw error(500, 'Failed to initialize authentication');
  }

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version';
    },
  });
};

const authGuard: Handle = async ({ event, resolve }) => {
  try {
    const { session, user } = await event.locals.safeGetSession();
    event.locals.session = session;
    event.locals.user = user;

    // Skip auth checks for public and API routes
    const publicRoutes = ['/api/health', '/api/debug'];
    if (publicRoutes.some(route => event.url.pathname.startsWith(route))) {
      return resolve(event);
    }

    // Protected routes check
    if (!session && event.route.id?.startsWith('/(protected)')) {
      throw redirect(303, '/login');
    }

    // Redirect authenticated users away from auth pages
    if (session && event.route.id?.startsWith('/(auth)')) {
      throw redirect(303, '/');
    }
  } catch (err) {
    if (err instanceof redirect) throw err;
    console.error('[AUTH_GUARD_ERROR]', err);
  }

  return resolve(event);
};

export const handle = sequence(supabase, authGuard);
```

### 4. Fixed +layout.server.ts
```typescript
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

const REDIRECT_PATHS_TO_SKIP = [
  '/onboarding',
  '/api',
  '/login',
  '/signup',
  '/logout',
  '/auth'
];

export const load: LayoutServerLoad = async ({ locals: { safeGetSession, supabase }, url }) => {
  const { session, user } = await safeGetSession();

  // Production debugging
  if (process.env.NODE_ENV === 'production') {
    console.log('[LAYOUT_LOAD]', {
      path: url.pathname,
      hasSession: !!session,
      userId: user?.id?.substring(0, 8)
    });
  }

  let profile = null;
  
  if (user && supabase) {
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle to avoid error if no profile
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('[PROFILE_FETCH_ERROR]', profileError);
      }
      
      profile = data;
      
      // Single consolidated redirect check
      const shouldRedirect = 
        profile && 
        !profile.onboarding_completed && 
        !REDIRECT_PATHS_TO_SKIP.some(path => url.pathname.startsWith(path));
      
      if (shouldRedirect) {
        console.log('[REDIRECT] Sending to onboarding');
        throw redirect(303, '/onboarding');
      }
    } catch (err) {
      if (err instanceof redirect) throw err;
      console.error('[PROFILE_ERROR]', err);
    }
  }

  return {
    session,
    user,
    profile,
    supabase: null, // Browser client created in +layout.ts
  };
};
```

### 5. Monitoring Endpoints

Create `apps/web/src/routes/api/health/+server.ts`:
```typescript
import { json } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY } from '$env/static/private';

export function GET() {
  return json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: {
      node_version: process.version,
      runtime: process.env.VERCEL_REGION || 'local',
      has_public_supabase_url: !!PUBLIC_SUPABASE_URL,
      has_public_supabase_key: !!PUBLIC_SUPABASE_ANON_KEY,
      has_service_role_key: !!SUPABASE_SERVICE_ROLE_KEY,
      has_stripe_key: !!STRIPE_SECRET_KEY,
    }
  });
}
```