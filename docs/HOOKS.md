# HOOKS - SvelteKit Best Practices & Rules

**Reference**: https://svelte.dev/docs/kit/hooks

## STRICT RULES

### 1. Server Hooks (hooks.server.ts)
```typescript
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // 1. Run BEFORE every request
  event.locals.startTime = Date.now();
  
  // 2. Process request
  const response = await resolve(event);
  
  // 3. Run AFTER every request
  console.log(`Request took ${Date.now() - event.locals.startTime}ms`);
  
  return response;
};
```

### 2. Client Hooks (hooks.client.ts)
```typescript
import type { HandleClientError } from '@sveltejs/kit';

export const handleError: HandleClientError = ({ error, event }) => {
  // Log to error service
  console.error('Client error:', error);
  
  return {
    message: 'Something went wrong',
    code: 'CLIENT_ERROR'
  };
};
```

### 3. Hook Types & Order

**Server Hooks:**
1. `handle` - Runs on EVERY request
2. `handleFetch` - Intercepts fetch() calls
3. `handleError` - Handles server errors

**Client Hooks:**
1. `handleError` - Handles client errors

### 4. Auth Pattern
```typescript
// ✅ CORRECT - Supabase auth in hooks
export const handle: Handle = async ({ event, resolve }) => {
  // Create Supabase client
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    { cookies: event.cookies }
  );
  
  // Get session
  event.locals.safeGetSession = async () => {
    const { data: { session } } = await event.locals.supabase.auth.getSession();
    return { session, user: session?.user ?? null };
  };
  
  return resolve(event);
};
```

### 5. Performance Rules
```typescript
// ✅ FAST - Parallel processing
export const handle: Handle = async ({ event, resolve }) => {
  const [response, user] = await Promise.all([
    resolve(event),
    getUser(event.cookies)
  ]);
  
  return response;
};

// ❌ SLOW - Sequential
const response = await resolve(event);
const user = await getUser();
```

### 6. Error Handling
```typescript
export const handleError: HandleServerError = ({ error, event }) => {
  // Don't leak sensitive info
  const id = crypto.randomUUID();
  
  // Log full error server-side
  console.error(id, error);
  
  // Return safe error to client
  return {
    message: 'Internal Error',
    errorId: id
  };
};
```

## ANTI-PATTERNS TO AVOID

### ❌ Blocking Operations
```typescript
// WRONG - Blocks every request
export const handle = async ({ event, resolve }) => {
  await slowDatabaseQuery(); // BAD!
  return resolve(event);
};
```

### ❌ Modifying Wrong Properties
```typescript
// WRONG - Don't modify event directly
event.customProp = 'value';

// CORRECT - Use locals
event.locals.customProp = 'value';
```

### ❌ Forgetting to call resolve()
```typescript
// WRONG - Never responds
export const handle = async ({ event }) => {
  // Missing resolve()
  return new Response('Custom');
};
```

## SUPABASE HOOKS PATTERN

### Complete Auth Setup
```typescript
// hooks.server.ts
import { createServerClient } from '@supabase/ssr';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => event.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            event.cookies.set(name, value, { ...options, path: '/' });
          });
        }
      }
    }
  );

  event.locals.safeGetSession = async () => {
    const { data: { user }, error } = await event.locals.supabase.auth.getUser();
    
    if (error) {
      return { session: null, user: null };
    }
    
    return { session: { user }, user };
  };

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version';
    }
  });
};
```

## PERFORMANCE OPTIMIZATION

### 1. Static Asset Caching
```typescript
export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  
  // Cache static assets
  if (event.url.pathname.startsWith('/images/')) {
    response.headers.set('cache-control', 'public, max-age=31536000');
  }
  
  return response;
};
```

### 2. Request Timing
```typescript
export const handle: Handle = async ({ event, resolve }) => {
  const start = performance.now();
  
  const response = await resolve(event);
  
  const time = performance.now() - start;
  response.headers.set('X-Response-Time', `${time}ms`);
  
  return response;
};
```

## COMMANDS TO AUDIT

```bash
# Check hooks files exist
ls src/hooks.*.ts

# Find blocking operations
grep -A10 "export const handle" src/hooks.server.ts

# Check for auth setup
grep "supabase" src/hooks.server.ts

# Look for error handling
grep "handleError" src/hooks.*.ts
```