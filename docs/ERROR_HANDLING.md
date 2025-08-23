# ERROR HANDLING - SvelteKit Best Practices

**Reference**: https://svelte.dev/docs/kit/errors

## ERROR TYPES

### 1. Expected Errors (4xx)
```typescript
// +page.server.ts
import { error } from '@sveltejs/kit';

export async function load({ params }) {
  const product = await getProduct(params.id);
  
  if (!product) {
    // User-friendly error
    error(404, {
      message: 'Product not found',
      code: 'PRODUCT_NOT_FOUND'
    });
  }
  
  return { product };
}
```

### 2. Unexpected Errors (5xx)
```typescript
// +page.server.ts
export async function load() {
  try {
    const data = await riskyOperation();
    return { data };
  } catch (err) {
    // Log full error server-side
    console.error('Database error:', err);
    
    // Generic error to client
    error(500, {
      message: 'Something went wrong',
      code: 'INTERNAL_ERROR'
    });
  }
}
```

## ERROR PAGES

### 1. Root Error Page
```svelte
<!-- src/routes/+error.svelte -->
<script>
  import { page } from '$app/stores';
</script>

<div class="error-container">
  <h1>{$page.status}</h1>
  <p>{$page.error?.message || 'An error occurred'}</p>
  
  {#if $page.status === 404}
    <a href="/">Go home</a>
  {:else}
    <button onclick={() => location.reload()}>Try again</button>
  {/if}
</div>
```

### 2. Layout Error Boundaries
```svelte
<!-- src/routes/(app)/+error.svelte -->
<script>
  import { page } from '$app/stores';
  
  // This catches errors in this layout group
</script>
```

## HOOKS ERROR HANDLING

### 1. Server Errors
```typescript
// hooks.server.ts
import type { HandleServerError } from '@sveltejs/kit';

export const handleError: HandleServerError = async ({ error, event, status, message }) => {
  const errorId = crypto.randomUUID();
  
  // Log to error service
  console.error({
    errorId,
    url: event.url.pathname,
    method: event.request.method,
    status,
    error: error?.stack || error
  });
  
  // Return safe error
  return {
    message: status === 500 ? 'Internal Error' : message,
    errorId
  };
};
```

### 2. Client Errors
```typescript
// hooks.client.ts
import type { HandleClientError } from '@sveltejs/kit';

export const handleError: HandleClientError = async ({ error, event, status, message }) => {
  // Send to error tracking
  console.error('Client error:', error);
  
  return {
    message: 'Something went wrong',
    code: 'CLIENT_ERROR'
  };
};
```

## FORM ACTION ERRORS

```typescript
// +page.server.ts
import { fail } from '@sveltejs/kit';

export const actions = {
  create: async ({ request, locals }) => {
    try {
      const data = await request.formData();
      
      // Validation
      if (!data.get('title')) {
        return fail(422, {
          error: 'Title is required',
          values: Object.fromEntries(data)
        });
      }
      
      // Database operation
      const result = await createProduct(data);
      
      return { success: true, product: result };
      
    } catch (err) {
      // Database error
      return fail(500, {
        error: 'Failed to create product',
        values: Object.fromEntries(data)
      });
    }
  }
};
```

## SUPABASE ERROR HANDLING

```typescript
// lib/supabase-errors.ts
export function handleSupabaseError(error: any) {
  if (error?.code === 'PGRST116') {
    return { status: 404, message: 'Not found' };
  }
  
  if (error?.code === '23505') {
    return { status: 409, message: 'Already exists' };
  }
  
  if (error?.message?.includes('JWT')) {
    return { status: 401, message: 'Please login' };
  }
  
  // Default
  return { status: 500, message: 'Database error' };
}

// Usage
const { data, error: dbError } = await supabase
  .from('products')
  .select()
  .single();

if (dbError) {
  const { status, message } = handleSupabaseError(dbError);
  error(status, message);
}
```

## ERROR RECOVERY

### 1. Retry Logic
```typescript
async function fetchWithRetry(url: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      
      // Don't retry 4xx errors
      if (response.status < 500) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      if (i === retries - 1) throw err;
      
      // Exponential backoff
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
}
```

### 2. Fallback UI
```svelte
<script>
  let { data } = $props();
  let error = $state(false);
</script>

{#if error}
  <div class="fallback">
    <p>Failed to load content</p>
    <button onclick={() => location.reload()}>Retry</button>
  </div>
{:else}
  <!-- Normal content -->
{/if}
```

## ERROR MONITORING

```typescript
// lib/monitoring.ts
export function reportError(error: Error, context?: any) {
  // Sentry
  if (typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.captureException(error, { extra: context });
  }
  
  // Custom logging
  fetch('/api/errors', {
    method: 'POST',
    body: JSON.stringify({
      message: error.message,
      stack: error.stack,
      context
    })
  });
}
```

## RULES

- ✅ Always use `error()` helper from SvelteKit
- ✅ Log full errors server-side only
- ✅ Return generic messages to clients
- ✅ Include error IDs for tracking
- ✅ Handle both expected and unexpected errors
- ❌ Never expose stack traces to clients
- ❌ Never expose sensitive data in errors
- ❌ Don't ignore errors silently