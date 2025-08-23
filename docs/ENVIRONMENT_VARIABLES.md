# ENVIRONMENT VARIABLES - SvelteKit Best Practices

**Reference**: https://svelte.dev/docs/kit/$env-dynamic-private

## VARIABLE TYPES

### 1. Public Variables (Client-Safe)
```typescript
// $env/static/public
import { PUBLIC_SUPABASE_URL } from '$env/static/public';

// Prefix with PUBLIC_
PUBLIC_SUPABASE_URL=https://xxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=xxx
```

### 2. Private Variables (Server-Only)
```typescript
// $env/static/private
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

// No PUBLIC_ prefix
SUPABASE_SERVICE_ROLE_KEY=xxx
DATABASE_URL=xxx
STRIPE_SECRET_KEY=xxx
```

### 3. Dynamic Variables (Runtime)
```typescript
// $env/dynamic/public
import { env } from '$env/dynamic/public';
console.log(env.PUBLIC_FEATURE_FLAG);

// $env/dynamic/private
import { env } from '$env/dynamic/private';
console.log(env.API_KEY);
```

## USAGE PATTERNS

### 1. Static Import (Build-Time)
```typescript
// ✅ BEST - Tree-shakeable, type-safe
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { DATABASE_URL } from '$env/static/private';
```

### 2. Dynamic Import (Runtime)
```typescript
// For feature flags or changing values
import { env } from '$env/dynamic/public';

if (env.PUBLIC_FEATURE_ENABLED === 'true') {
  // Feature code
}
```

### 3. Server-Only Access
```typescript
// +page.server.ts
import { SECRET_API_KEY } from '$env/static/private';

export async function load() {
  // ✅ SAFE - Only runs server-side
  const data = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${SECRET_API_KEY}`
    }
  });
}

// +page.ts
// ❌ ERROR - Can't import private in universal
import { SECRET_API_KEY } from '$env/static/private';
```

## FILE STRUCTURE

### 1. Development (.env.local)
```bash
# Public variables (exposed to client)
PUBLIC_SUPABASE_URL=http://localhost:54321
PUBLIC_SUPABASE_ANON_KEY=xxx
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Private variables (server-only)
SUPABASE_SERVICE_ROLE_KEY=xxx
STRIPE_SECRET_KEY=sk_test_xxx
DATABASE_URL=postgresql://xxx
```

### 2. Production (Vercel Dashboard)
```bash
# Set in Vercel Dashboard or CLI
vercel env add PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

### 3. Example Files (.env.example)
```bash
# Document required variables
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## SUPABASE CONFIGURATION

### 1. Client Setup
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export function createClient() {
  return createBrowserClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY
  );
}
```

### 2. Server Setup
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

export function createServiceClient() {
  return createServerClient(
    PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY, // Admin access
    { cookies: {} }
  );
}
```

## VALIDATION

### 1. Required Variables Check
```typescript
// app.d.ts
declare global {
  namespace App {
    interface Platform {
      env: {
        PUBLIC_SUPABASE_URL: string;
        PUBLIC_SUPABASE_ANON_KEY: string;
        SUPABASE_SERVICE_ROLE_KEY: string;
      };
    }
  }
}
```

### 2. Runtime Validation
```typescript
// hooks.server.ts
import { building } from '$app/environment';

if (!building) {
  // Validate required env vars
  const required = [
    'PUBLIC_SUPABASE_URL',
    'PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required env var: ${key}`);
    }
  }
}
```

## SECURITY RULES

### ✅ DO
- Prefix client-safe variables with `PUBLIC_`
- Use static imports when possible
- Validate required variables on startup
- Document all variables in .env.example
- Use different values for dev/staging/prod

### ❌ DON'T
- Never expose private keys to client
- Don't commit .env files to git
- Don't use process.env directly
- Don't hardcode sensitive values
- Don't mix public/private incorrectly

## COMMON PATTERNS

### 1. Feature Flags
```typescript
// $env/dynamic/public
import { env } from '$env/dynamic/public';

export const features = {
  newCheckout: env.PUBLIC_FEATURE_NEW_CHECKOUT === 'true',
  darkMode: env.PUBLIC_FEATURE_DARK_MODE === 'true'
};
```

### 2. API Configuration
```typescript
// $env/static/private
import { API_BASE_URL, API_KEY } from '$env/static/private';

export async function apiRequest(endpoint: string) {
  return fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`
    }
  });
}
```

### 3. Multi-Environment
```bash
# .env.development
PUBLIC_API_URL=http://localhost:3000

# .env.staging  
PUBLIC_API_URL=https://staging.api.com

# .env.production
PUBLIC_API_URL=https://api.com
```

## DEBUGGING

```bash
# Check loaded variables
console.log(import.meta.env);

# Verify in build
vite build --mode development

# Test production locally
npm run build && npm run preview
```