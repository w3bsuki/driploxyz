# SvelteKit 2 Patterns Guide

**Extracted from official SvelteKit documentation** - Complete reference for zero-mistake SvelteKit 2 development.

## File-Based Routing (Critical Structure)

### Route File Conventions
```
src/routes/
├── +layout.svelte          # Root layout (wraps all pages)
├── +layout.server.ts       # Root server load (runs for all pages)
├── +layout.ts              # Root universal load (runs everywhere)
├── +page.svelte           # Homepage (/)
├── +page.server.ts        # Homepage server load
├── +error.svelte          # Error boundary
├── (auth)/                # Route group (no URL segment!)
│   ├── +layout.svelte     # Layout for auth routes only
│   ├── login/+page.svelte # /login
│   └── register/
│       ├── +page.svelte   # /register
│       └── +page.server.ts
├── product/
│   ├── +page.svelte       # /product (list page)
│   ├── +page.server.ts
│   ├── [id]/              # Dynamic route: /product/123
│   │   ├── +page.svelte
│   │   ├── +page.server.ts
│   │   └── edit/+page.svelte  # /product/123/edit
│   └── [...slug]/+page.svelte # Catch-all: /product/a/b/c
├── blog/
│   └── [year=integer]/    # Parameter matcher
│       └── [month=integer]/
│           └── [slug]/+page.svelte  # /blog/2024/03/my-post
└── api/
    ├── health/+server.ts   # GET/POST /api/health
    ├── products/
    │   ├── +server.ts      # GET/POST /api/products
    │   └── [id]/+server.ts # GET/PUT/DELETE /api/products/123
    └── webhooks/
        └── stripe/+server.ts
```

### Route Groups Rules
```
(auth)/           # Parentheses = route group (no URL segment)
├── login/        # URL: /login (not /auth/login)
└── register/     # URL: /register (not /auth/register)

(protected)/      # Another group
├── dashboard/    # URL: /dashboard
└── settings/     # URL: /settings

[[lang]]/         # Optional parameter
├── +page.svelte  # Matches: / and /en and /fr
└── about/        # Matches: /about and /en/about
```

## Load Functions (Server-First Architecture)

### Server Load (+page.server.ts, +layout.server.ts)
```ts
// ✅ CORRECT: Server-only load function
import type { PageServerLoad } from './$types'
import { error, redirect } from '@sveltejs/kit'
import { getProduct } from '$lib/server/database'

export const load = (async ({ params, locals, url, depends }) => {
  // ✅ Always check auth first
  const { user } = await locals.safeGetSession()

  if (!user) {
    throw redirect(302, '/login')
  }

  // ✅ Server-only database access (via RLS)
  const product = await getProduct(params.id)

  if (!product) {
    throw error(404, 'Product not found')
  }

  // ✅ Optional: Manual dependency tracking
  depends('app:product')

  return {
    product,
    user
  }
}) satisfies PageServerLoad

// ❌ NEVER: Import client-only modules
// import { browser } from '$app/environment' // Error!
// import { goto } from '$app/navigation'      // Error!
```

### Universal Load (+page.ts, +layout.ts)
```ts
// ✅ CORRECT: Universal load (runs on server AND client)
import type { PageLoad } from './$types'

export const load = (async ({ fetch, params, url, route, parent }) => {
  // ✅ Use fetch for external APIs (works SSR + client)
  const response = await fetch(`/api/products/${params.id}`)

  if (!response.ok) {
    throw error(response.status, 'Failed to load product')
  }

  const product = await response.json()

  // ✅ Access parent load data
  const { user } = await parent()

  return {
    product,
    meta: {
      title: product.title,
      description: product.description
    }
  }
}) satisfies PageLoad

// ❌ NEVER: Direct database access
// import { db } from '$lib/server/db' // Error on client!
```

### Load Function Rules
```ts
// ✅ Data returned from load functions
export const load = (async () => {
  return {
    // ✅ Serializable data only
    title: 'Hello',
    count: 42,
    items: [1, 2, 3],
    user: { name: 'Alice', age: 30 },

    // ❌ NEVER: Non-serializable data
    // date: new Date(),        // Use date.toISOString()
    // map: new Map(),          // Convert to object/array
    // function: () => {},      // Functions don't serialize
    // undefined: undefined     // Use null instead
  }
})

// ✅ Throwing errors
export const load = (async ({ params }) => {
  const item = await getItem(params.id)

  if (!item) {
    throw error(404, {
      message: 'Item not found',
      id: params.id
    })
  }

  return { item }
})

// ✅ Redirects
export const load = (async ({ url, locals }) => {
  const { user } = await locals.safeGetSession()

  if (!user) {
    throw redirect(302, `/login?redirectTo=${url.pathname}`)
  }

  return { user }
})
```

## Form Actions (Type-Safe Server Mutations)

### Basic Actions Pattern
```ts
// +page.server.ts
import type { Actions, PageServerLoad } from './$types'
import { fail, redirect } from '@sveltejs/kit'
import { z } from 'zod'

// ✅ Validation schemas
const createProductSchema = z.object({
  title: z.string().min(1, 'Title required').max(100),
  price: z.number().positive('Price must be positive'),
  description: z.string().max(500).optional(),
  category: z.enum(['electronics', 'clothing', 'books'])
})

export const actions: Actions = {
  // Default action (no name needed)
  default: async ({ request, locals }) => {
    const { user } = await locals.safeGetSession()

    if (!user) {
      return fail(401, { error: 'Unauthorized' })
    }

    const formData = await request.formData()
    const data = Object.fromEntries(formData)

    // ✅ ALWAYS validate with Zod
    const result = createProductSchema.safeParse({
      title: data.title,
      price: Number(data.price),
      description: data.description || undefined,
      category: data.category
    })

    if (!result.success) {
      return fail(400, {
        error: 'Validation failed',
        issues: result.error.issues,
        data: data // Return for form repopulation
      })
    }

    try {
      const product = await createProduct(result.data, user.id)
      throw redirect(303, `/product/${product.id}`)
    } catch (err) {
      return fail(500, {
        error: 'Failed to create product',
        data: data
      })
    }
  },

  // Named action
  delete: async ({ request, locals }) => {
    const { user } = await locals.safeGetSession()
    const formData = await request.formData()
    const id = formData.get('id')

    if (!id) {
      return fail(400, { error: 'ID required' })
    }

    await deleteProduct(String(id), user.id)
    throw redirect(303, '/products')
  }
}

export const load = (async ({ locals }) => {
  const { user } = await locals.safeGetSession()
  return { user }
}) satisfies PageServerLoad
```

### Enhanced Form with ActionData
```svelte
<!-- +page.svelte -->
<script lang="ts">
  import type { PageData, ActionData } from './$types'
  import { enhance } from '$app/forms'

  interface Props {
    data: PageData
    form?: ActionData  // Result of form action
  }

  let { data, form }: Props = $props()

  let isSubmitting = $state(false)
</script>

<!-- ✅ Progressive enhancement -->
<form method="POST" use:enhance={() => {
  isSubmitting = true
  return async ({ update }) => {
    await update()
    isSubmitting = false
  }
}}>
  <input
    name="title"
    value={form?.data?.title ?? ''}
    placeholder="Product title"
    required
  />

  <input
    name="price"
    type="number"
    value={form?.data?.price ?? ''}
    placeholder="Price"
    required
  />

  <select name="category">
    <option value="electronics">Electronics</option>
    <option value="clothing">Clothing</option>
    <option value="books">Books</option>
  </select>

  <button type="submit" disabled={isSubmitting}>
    {isSubmitting ? 'Creating...' : 'Create Product'}
  </button>

  <!-- Named action -->
  <button formaction="?/delete" name="id" value={data.product?.id}>
    Delete
  </button>
</form>

<!-- Error handling -->
{#if form?.error}
  <div class="error">
    {form.error}
  </div>
{/if}

{#if form?.issues}
  <ul class="errors">
    {#each form.issues as issue}
      <li>{issue.path?.join('.')}: {issue.message}</li>
    {/each}
  </ul>
{/if}
```

## API Routes (+server.ts)

### REST API Patterns
```ts
// api/products/+server.ts
import type { RequestHandler } from './$types'
import { json, error } from '@sveltejs/kit'
import { z } from 'zod'

const createProductSchema = z.object({
  title: z.string().min(1).max(100),
  price: z.number().positive()
})

// GET /api/products
export const GET: RequestHandler = async ({ url, locals }) => {
  const { user } = await locals.safeGetSession()

  // ✅ Query parameters
  const limit = Number(url.searchParams.get('limit')) || 10
  const offset = Number(url.searchParams.get('offset')) || 0

  const products = await getProducts({ limit, offset, userId: user?.id })

  return json({
    products,
    total: products.length,
    limit,
    offset
  })
}

// POST /api/products
export const POST: RequestHandler = async ({ request, locals }) => {
  const { user } = await locals.safeGetSession()

  if (!user) {
    throw error(401, 'Unauthorized')
  }

  // ✅ Parse JSON body
  const body = await request.json()
  const result = createProductSchema.safeParse(body)

  if (!result.success) {
    throw error(400, {
      message: 'Validation failed',
      issues: result.error.issues
    })
  }

  const product = await createProduct(result.data, user.id)

  return json(product, { status: 201 })
}

// Dynamic route: api/products/[id]/+server.ts
export const GET: RequestHandler = async ({ params, locals }) => {
  const product = await getProduct(params.id)

  if (!product) {
    throw error(404, 'Product not found')
  }

  return json(product)
}

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  const { user } = await locals.safeGetSession()
  const body = await request.json()

  // Validate ownership
  const product = await getProduct(params.id)
  if (product.userId !== user.id) {
    throw error(403, 'Forbidden')
  }

  const updated = await updateProduct(params.id, body)
  return json(updated)
}

export const DELETE: RequestHandler = async ({ params, locals }) => {
  const { user } = await locals.safeGetSession()

  await deleteProduct(params.id, user.id)

  return new Response(null, { status: 204 })
}
```

## Hooks (Server-Side Middleware)

### hooks.server.ts
```ts
import type { Handle, HandleServerError } from '@sveltejs/kit'
import { createServerClient } from '@supabase/ssr'
import { redirect, error } from '@sveltejs/kit'

// ✅ Main request handler
export const handle: Handle = async ({ event, resolve }) => {
  // ✅ CSRF protection
  if (event.request.method === 'POST') {
    const origin = event.request.headers.get('origin')
    const host = event.request.headers.get('host')

    if (!origin || new URL(origin).host !== host) {
      throw error(403, 'CSRF protection: Origin mismatch')
    }
  }

  // ✅ Supabase client setup
  event.locals.supabase = createServerClient(
    process.env.PUBLIC_SUPABASE_URL,
    process.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (key) => event.cookies.get(key),
        set: (key, value, options) => event.cookies.set(key, value, options),
        remove: (key, options) => event.cookies.delete(key, options)
      }
    }
  )

  // ✅ Safe session helper
  event.locals.safeGetSession = async () => {
    const { data: { session }, error } = await event.locals.supabase.auth.getSession()
    if (error) {
      console.error('Auth error:', error)
      return { session: null, user: null }
    }
    return {
      session,
      user: session?.user ?? null
    }
  }

  // ✅ Protected routes
  if (event.route.id?.includes('(protected)')) {
    const { user } = await event.locals.safeGetSession()
    if (!user) {
      throw redirect(302, '/login')
    }
  }

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range'
    }
  })
}

// ✅ Error handling
export const handleError: HandleServerError = ({ error, event }) => {
  console.error('Server error:', error, 'Route:', event.route.id)

  return {
    message: 'Internal server error',
    code: 'INTERNAL_ERROR'
  }
}
```

### hooks.client.ts
```ts
import type { HandleClientError } from '@sveltejs/kit'
import { invalidateAll } from '$app/navigation'
import { createBrowserClient } from '@supabase/ssr'

// ✅ Supabase client setup
const supabase = createBrowserClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
)

// ✅ Auth state sync
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
    invalidateAll()
  }
})

// ✅ Client error handling
export const handleError: HandleClientError = ({ error, event }) => {
  console.error('Client error:', error, 'Route:', event.route.id)

  return {
    message: 'Application error',
    code: 'CLIENT_ERROR'
  }
}
```

## Page Options & Configuration

### Page Options
```ts
// +page.server.ts or +page.ts
import type { PageServerLoad } from './$types'

// ✅ Page configuration
export const prerender = true        // Static generation
export const ssr = true             // Server-side rendering (default)
export const csr = true             // Client-side routing (default)
export const trailingSlash = 'never' // URL format

export const load = (async () => {
  return {}
}) satisfies PageServerLoad
```

### Layout Configuration
```ts
// +layout.server.ts
export const prerender = true  // Prerender all child pages
export const ssr = false      // SPA mode for section
export const csr = true       // Enable client routing
```

## Advanced Patterns

### Nested Layouts
```
src/routes/
├── +layout.svelte           # Root layout
├── (auth)/
│   ├── +layout.svelte      # Auth layout (login/register only)
│   ├── login/+page.svelte
│   └── register/+page.svelte
├── (app)/
│   ├── +layout.svelte      # App layout (authenticated users)
│   ├── dashboard/+page.svelte
│   └── settings/+page.svelte
└── blog/
    ├── +layout.svelte      # Blog layout
    └── [slug]/+page.svelte
```

### Data Streaming with Promises
```ts
// +page.server.ts
export const load = (async ({ fetch }) => {
  return {
    // ✅ Immediate data
    user: await getUser(),

    // ✅ Streamed data (shown when ready)
    posts: getPosts(),      // Returns Promise<Post[]>
    comments: getComments() // Returns Promise<Comment[]>
  }
})
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
  let { data }: { data: PageData } = $props()
</script>

<h1>Welcome {data.user.name}</h1>

{#await data.posts}
  <p>Loading posts...</p>
{:then posts}
  {#each posts as post}
    <article>{post.title}</article>
  {/each}
{:catch error}
  <p>Error loading posts: {error.message}</p>
{/await}

{#await data.comments then comments}
  <div class="comments">
    {#each comments as comment}
      <p>{comment.text}</p>
    {/each}
  </div>
{/await}
```

### Route Matching
```ts
// src/params/integer.ts
import type { ParamMatcher } from '@sveltejs/kit'

export const match: ParamMatcher = (param) => {
  return /^\d+$/.test(param)
}

// Usage in routes:
// blog/[year=integer]/[month=integer]/[slug]/+page.svelte
// Matches: /blog/2024/03/my-post
// Rejects: /blog/abc/03/my-post
```

### Error Boundaries
```svelte
<!-- +error.svelte -->
<script lang="ts">
  import { page } from '$app/stores'

  // Error info available in $page.error
  $: error = $page.error
  $: status = $page.status
</script>

<h1>{status}: {error?.message || 'An error occurred'}</h1>

{#if status === 404}
  <p>The page you're looking for doesn't exist.</p>
  <a href="/">Go home</a>
{:else if status >= 500}
  <p>Something went wrong on our end.</p>
  <p>Error ID: {error?.id}</p>
{/if}
```

## Quick Reference Card

```ts
// Load functions
export const load = (async ({ params, locals, url, fetch, parent, depends }) => {
  const { user } = await locals.safeGetSession()
  const data = await fetch('/api/data').then(r => r.json())
  return { user, data }
}) satisfies PageServerLoad

// Actions
export const actions: Actions = {
  default: async ({ request, locals }) => {
    const formData = await request.formData()
    const result = schema.safeParse(Object.fromEntries(formData))
    if (!result.success) return fail(400, { error: 'Invalid' })
    // Process...
    throw redirect(303, '/success')
  }
}

// API Routes
export const GET: RequestHandler = async ({ url, locals }) => {
  const data = await getData()
  return json(data)
}

// Page config
export const prerender = true
export const ssr = true
export const csr = true
```

**Remember**: This guide covers ALL SvelteKit 2 patterns from the official documentation. Use it to build bulletproof applications!