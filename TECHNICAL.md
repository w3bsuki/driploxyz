# Technical Reference

Complete technical guide for Svelte 5 + SvelteKit 2 + TypeScript development. Zero mistakes, maximum productivity.

## Svelte 5 Runes (State Management)

### Core Rules (NEVER Break These)

✅ **DO - Svelte 5 Patterns**
- Use `$state()` for all reactive data
- Use `$derived()` instead of `$:` reactive statements
- Use `$props()` instead of `export let`
- Use `onclick` instead of `on:click`
- Use `$effect()` instead of `onMount`/`onDestroy`

❌ **NEVER - Svelte 4 Patterns (Forbidden)**
- `let count = 0` for reactive data → Use `let count = $state(0)`
- `$: doubled = count * 2` → Use `let doubled = $derived(count * 2)`
- `export let title` → Use `let { title } = $props()`
- `on:click={handler}` → Use `onclick={handler}`
- `onMount(() => {})` → Use `$effect(() => {})`

### State Management

```svelte
<script lang="ts">
  // ✅ CORRECT: Reactive primitives
  let count = $state(0)
  let name = $state('Alice')
  let isVisible = $state(true)

  // ✅ CORRECT: Arrays and objects (deeply reactive)
  let todos = $state([
    { id: 1, text: 'Learn Svelte 5', done: false },
    { id: 2, text: 'Build awesome app', done: false }
  ])

  let user = $state({
    name: 'John',
    age: 30,
    preferences: { theme: 'dark' }
  })

  // ✅ CORRECT: Derived state
  let doubled = $derived(count * 2)
  let completedTodos = $derived(todos.filter(t => t.done))
  let userDisplay = $derived(`${user.name} (${user.age})`)

  // ✅ CORRECT: Props
  interface Props {
    title: string
    onUpdate?: (value: string) => void
    items?: string[]
  }

  let { title, onUpdate, items = [] }: Props = $props()

  // ✅ CORRECT: Effects
  $effect(() => {
    console.log('Count changed:', count)
  })

  $effect(() => {
    if (count > 10) {
      console.log('Count is high!')
    }
  })

  // ✅ CORRECT: Cleanup
  $effect(() => {
    const interval = setInterval(() => {
      count++
    }, 1000)

    return () => clearInterval(interval)
  })
</script>

<!-- ✅ Events (HTML standard) -->
<button onclick={() => count++}>{title}: {count}</button>
```

### Advanced Patterns

```svelte
<script lang="ts">
  // ✅ State with getters/setters
  let _value = $state(0)
  let value = {
    get current() {
      return _value
    },
    set current(v) {
      _value = Math.max(0, v) // Validation
    }
  }

  // ✅ Class properties
  class Counter {
    value = $state(0)
    doubled = $derived(this.value * 2)

    increment() {
      this.value++
    }
  }

  let counter = new Counter()

  // ✅ Lifecycle hooks
  let mounted = $state(false)

  $effect(() => {
    mounted = true
    return () => {
      mounted = false
    }
  })
</script>
```

## SvelteKit 2 Patterns

### File-Based Routing

```
src/routes/
├── +layout.svelte          # Root layout (wraps all pages)
├── +layout.server.ts       # Root server load (runs for all pages)
├── +page.svelte           # Homepage (/)
├── +page.server.ts        # Homepage server load
├── +error.svelte          # Error boundary
├── (auth)/                # Route group (no URL segment!)
│   ├── +layout.svelte     # Layout for auth routes only
│   ├── login/+page.svelte # /login
│   └── register/+page.svelte # /register
├── product/
│   ├── +page.svelte       # /product (list page)
│   ├── [id]/              # Dynamic route: /product/123
│   │   ├── +page.svelte
│   │   ├── +page.server.ts
│   │   └── edit/+page.svelte  # /product/123/edit
│   └── [...slug]/+page.svelte # Catch-all: /product/a/b/c
└── api/
    ├── health/+server.ts   # GET/POST /api/health
    └── products/
        ├── +server.ts      # GET/POST /api/products
        └── [id]/+server.ts # GET/PUT/DELETE /api/products/123
```

### Load Functions (Server-First Architecture)

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

### Form Actions (Type-Safe Server Mutations)

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
  }
}
```

### API Routes (+server.ts)

```ts
// api/products/+server.ts
import type { RequestHandler } from './$types'
import { json, error } from '@sveltejs/kit'
import { z } from 'zod'

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
```

### Hooks (Server-Side Middleware)

```ts
// hooks.server.ts
import type { Handle, HandleServerError } from '@sveltejs/kit'
import { createServerClient } from '@supabase/ssr'
import { redirect, error } from '@sveltejs/kit'

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

  return resolve(event)
}

export const handleError: HandleServerError = ({ error, event }) => {
  console.error('Server error:', error, 'Route:', event.route.id)
  return {
    message: 'Internal server error',
    code: 'INTERNAL_ERROR'
  }
}
```

## TypeScript Strict Mode

### Core Principles

✅ **ALWAYS Do**
- Use `unknown` instead of `any`
- Use `satisfies` operator for type inference
- Implement strict null checks
- Create proper type guards
- Use discriminated unions

❌ **NEVER Do**
- Use `any` type (forbidden)
- Use non-null assertion (`!`) carelessly
- Ignore TypeScript errors
- Use `Function` type (use proper function signatures)

### Replace `any` with Better Patterns

```ts
// ❌ FORBIDDEN: Using any
function processData(data: any): string {
  return data.toString() // Unsafe!
}

// ✅ CORRECT: Use unknown + type guards
function processData(data: unknown): string {
  if (typeof data === 'string') {
    return data
  }
  if (typeof data === 'number') {
    return data.toString()
  }
  if (data && typeof data === 'object' && 'toString' in data) {
    return String(data)
  }
  throw new Error('Invalid data type')
}

// ✅ CORRECT: API response handling
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`)
  const data: unknown = await response.json()

  if (!isUser(data)) {
    throw new Error('Invalid user data')
  }

  return data
}
```

### Type Guards

```ts
// ✅ User type guard
interface User {
  id: string
  name: string
  email: string
  age?: number
}

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'name' in value &&
    typeof value.name === 'string' &&
    'email' in value &&
    typeof value.email === 'string' &&
    (!('age' in value) || typeof value.age === 'number')
  )
}

// ✅ Array type guard
function isUserArray(value: unknown): value is User[] {
  return Array.isArray(value) && value.every(isUser)
}

// ✅ Usage in load functions
export const load = (async ({ fetch }) => {
  const response = await fetch('/api/users')
  const data: unknown = await response.json()

  if (!isUserArray(data)) {
    throw error(500, 'Invalid users data')
  }

  return {
    users: data // TypeScript knows this is User[]
  }
}) satisfies PageServerLoad
```

### Strict Null Checks

```ts
// ✅ CORRECT: Explicit nullability
interface User {
  id: string
  name: string
  avatar: string | null    // Can be null
  lastLogin?: Date        // Optional (can be undefined)
  settings: UserSettings  // Required
}

// ✅ Safe property access
function getUserDisplayName(user: User | null): string {
  if (!user) return 'Anonymous'
  return user.name
}

// ✅ Safe method calls
function formatLastLogin(user: User | null): string {
  return user?.lastLogin?.toISOString() ?? 'Never logged in'
}

// ✅ CORRECT: Type narrowing
function safeAccess(user: User | null): string {
  if (user !== null) {
    return user.name // TypeScript knows user is not null
  }
  return 'Anonymous'
}
```

### Type Inference with `satisfies`

```ts
// ✅ CORRECT: Using satisfies for better inference
const config = {
  apiUrl: '/api/v1',
  timeout: 5000,
  retries: 3,
  features: {
    auth: true,
    analytics: false
  }
} satisfies {
  apiUrl: string
  timeout: number
  retries: number
  features: Record<string, boolean>
}

// TypeScript infers literal types while ensuring structure
config.apiUrl      // Type: "/api/v1" (literal)
config.timeout     // Type: 5000 (literal)

// ✅ SvelteKit load function
export const load = (async ({ params }) => {
  const product = await getProduct(params.id)

  return {
    product,
    meta: {
      title: product.title,
      description: product.description
    }
  }
}) satisfies PageServerLoad
```

### Discriminated Unions

```ts
// ✅ Discriminated union for API responses
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: number }

async function fetchUser(id: string): Promise<ApiResponse<User>> {
  try {
    const response = await fetch(`/api/users/${id}`)
    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Unknown error',
        code: response.status
      }
    }

    if (!isUser(data)) {
      return {
        success: false,
        error: 'Invalid user data',
        code: 500
      }
    }

    return {
      success: true,
      data
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
      code: 0
    }
  }
}

// ✅ Pattern matching usage
const result = await fetchUser('123')

if (result.success) {
  console.log(result.data.name) // TypeScript knows data exists
} else {
  console.error(`Error ${result.code}: ${result.error}`)
}
```

### Component Props with Types

```ts
// ✅ Strict prop interfaces
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  children: Snippet
  onclick?: (event: MouseEvent) => void
}

// Component implementation
let {
  variant,
  size = 'md',
  disabled = false,
  children,
  onclick
}: ButtonProps = $props()
```

### Form Schema with Zod

```ts
import { z } from 'zod'

// ✅ Schema definition
const userSchema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email('Invalid email'),
  age: z.number().int().min(0).max(120).optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark']),
    notifications: z.boolean()
  })
})

// ✅ Type inference from schema
type User = z.infer<typeof userSchema>

// ✅ Form validation
export const actions = {
  updateProfile: async ({ request }) => {
    const formData = await request.formData()
    const data = Object.fromEntries(formData)

    const result = userSchema.safeParse({
      name: data.name,
      email: data.email,
      age: data.age ? Number(data.age) : undefined,
      preferences: {
        theme: data.theme,
        notifications: data.notifications === 'on'
      }
    })

    if (!result.success) {
      return fail(400, {
        error: 'Validation failed',
        issues: result.error.issues
      })
    }

    // result.data is now properly typed as User
    await updateUser(result.data)
    return { success: true }
  }
} satisfies Actions
```

## Quick Reference

### Quality Checklist
- [ ] Zero TypeScript errors (`pnpm check-types`)
- [ ] No `any` types used
- [ ] Proper null/undefined handling
- [ ] Type guards for unknown data
- [ ] Svelte 5 runes only (no legacy syntax)
- [ ] Server-first load functions
- [ ] Zod validation for forms

### Common Fixes
```ts
// ❌ Replace these patterns
any                    → unknown + type guard
$: reactive           → $derived()
export let prop       → let { prop } = $props()
on:click              → onclick
onMount(() => {})     → $effect(() => {})
data.prop             → data?.prop ?? fallback
user!.name           → user ? user.name : fallback
```

**Remember**: This technical reference covers ALL patterns from official Svelte 5, SvelteKit 2, and TypeScript documentation. Use it to build bulletproof applications!