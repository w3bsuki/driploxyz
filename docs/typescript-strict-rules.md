# TypeScript Strict Mode Rules

**Zero `any` Tolerance** - Complete guide for bulletproof TypeScript in Svelte 5 + SvelteKit 2.

## Core Principles

### ✅ ALWAYS Do
- Use `unknown` instead of `any`
- Use `satisfies` operator for type inference
- Implement strict null checks
- Create proper type guards
- Use discriminated unions
- Implement proper error handling types

### ❌ NEVER Do
- Use `any` type (forbidden)
- Use non-null assertion (`!`) carelessly
- Ignore TypeScript errors
- Use `Function` type (use proper function signatures)
- Use `object` type (use specific interfaces)

## 1. Replace `any` with Better Patterns

### Use `unknown` for Dynamic Data
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

### Generic Type Guards
```ts
// ✅ Reusable type guard factory
function hasProperty<T extends PropertyKey>(
  obj: object,
  prop: T
): obj is Record<T, unknown> {
  return prop in obj
}

function isOfType<T>(
  value: unknown,
  guard: (value: unknown) => value is T
): value is T {
  return guard(value)
}

// Usage
function processApiResponse(data: unknown) {
  if (hasProperty(data, 'users') && isUserArray(data.users)) {
    return data.users // TypeScript knows the type
  }
  throw new Error('Invalid response')
}
```

## 2. Strict Null Checks & Optional Handling

### Proper Null/Undefined Handling
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
  // Option 1: Early return
  if (!user) return 'Anonymous'
  return user.name

  // Option 2: Nullish coalescing
  // return user?.name ?? 'Anonymous'
}

// ✅ Safe method calls
function formatLastLogin(user: User | null): string {
  return user?.lastLogin?.toISOString() ?? 'Never logged in'
}

// ❌ NEVER: Non-null assertion without justification
function dangerousAccess(user: User | null): string {
  return user!.name // Dangerous! Can crash at runtime
}

// ✅ CORRECT: Type narrowing
function safeAccess(user: User | null): string {
  if (user !== null) {
    return user.name // TypeScript knows user is not null
  }
  return 'Anonymous'
}
```

### Array and Object Safety
```ts
// ✅ Safe array access
function getFirstUser(users: User[] | null): User | null {
  return users?.[0] ?? null
}

// ✅ Safe destructuring with defaults
function processUser(user: Partial<User> = {}) {
  const { name = 'Unknown', age = 0 } = user
  return { name, age }
}

// ✅ Safe object property access
function getUserSetting<K extends keyof UserSettings>(
  user: User | null,
  key: K
): UserSettings[K] | null {
  return user?.settings?.[key] ?? null
}
```

## 3. Type Inference with `satisfies`

### Better Type Inference
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
config.features    // Type: { auth: boolean; analytics: boolean }

// ✅ Route configuration
const routes = {
  home: '/',
  about: '/about',
  products: '/products',
  login: '/auth/login'
} satisfies Record<string, string>

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
// TypeScript infers exact return type while ensuring PageServerLoad compatibility
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

## 4. Svelte 5 + SvelteKit Type Patterns

### Component Props
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

### State Management
```ts
// ✅ Typed state
interface AppState {
  user: User | null
  cart: CartItem[]
  isLoading: boolean
}

let state = $state<AppState>({
  user: null,
  cart: [],
  isLoading: false
})

// ✅ Typed derived state
let cartTotal = $derived(
  state.cart.reduce((total, item) => total + item.price * item.quantity, 0)
)

let isAuthenticated = $derived(state.user !== null)
```

### Load Function Types
```ts
// ✅ Typed load functions
interface ProductPageData {
  product: Product
  reviews: Review[]
  user: User | null
}

export const load = (async ({ params, locals }) => {
  const [product, reviews] = await Promise.all([
    getProduct(params.id),
    getProductReviews(params.id)
  ])

  const { user } = await locals.safeGetSession()

  return {
    product,
    reviews,
    user
  } satisfies ProductPageData
}) satisfies PageServerLoad

// Generated types in ./$types are automatically correct
```

### Form Action Types
```ts
// ✅ Typed action results
interface CreateProductActionResult {
  success?: boolean
  error?: string
  product?: Product
  issues?: ZodIssue[]
}

export const actions = {
  create: async ({ request }): Promise<ActionResult<CreateProductActionResult>> => {
    // ... validation and creation logic

    if (validationFailed) {
      return fail(400, {
        error: 'Validation failed',
        issues: validationErrors
      })
    }

    return {
      success: true,
      product: createdProduct
    }
  }
} satisfies Actions
```

## 5. Discriminated Unions & Pattern Matching

### API Response Types
```ts
// ✅ Discriminated union for API responses
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: number }

// Usage
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

### Component State Types
```ts
// ✅ Form state union
type FormState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; message: string }
  | { status: 'error'; error: string }

let formState = $state<FormState>({ status: 'idle' })

// ✅ Pattern matching in template
function getButtonText(): string {
  switch (formState.status) {
    case 'idle':
      return 'Submit'
    case 'submitting':
      return 'Submitting...'
    case 'success':
      return 'Submitted!'
    case 'error':
      return 'Try Again'
  }
}
```

## 6. Error Handling Types

### Custom Error Classes
```ts
// ✅ Typed error hierarchy
abstract class AppError extends Error {
  abstract readonly code: string
  abstract readonly statusCode: number

  constructor(message: string, cause?: Error) {
    super(message)
    this.name = this.constructor.name
    this.cause = cause
  }
}

class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR'
  readonly statusCode = 400

  constructor(
    message: string,
    public readonly issues: ZodIssue[]
  ) {
    super(message)
  }
}

class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND'
  readonly statusCode = 404
}

class UnauthorizedError extends AppError {
  readonly code = 'UNAUTHORIZED'
  readonly statusCode = 401
}

// ✅ Error handling in actions
export const actions = {
  create: async ({ request }) => {
    try {
      // ... logic
    } catch (error) {
      if (error instanceof ValidationError) {
        return fail(400, {
          error: error.message,
          issues: error.issues
        })
      }

      if (error instanceof NotFoundError) {
        throw error(404, error.message)
      }

      // Unknown error
      console.error('Unexpected error:', error)
      return fail(500, {
        error: 'Internal server error'
      })
    }
  }
} satisfies Actions
```

### Result Type Pattern
```ts
// ✅ Result type for operation outcomes
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E }

async function safeOperation<T>(
  operation: () => Promise<T>
): Promise<Result<T, string>> {
  try {
    const value = await operation()
    return { ok: true, value }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Usage
const result = await safeOperation(() => getUserById('123'))

if (result.ok) {
  console.log(result.value.name) // TypeScript knows value exists
} else {
  console.error(result.error) // TypeScript knows error exists
}
```

## 7. Advanced TypeScript Patterns

### Utility Types
```ts
// ✅ Create types from other types
interface User {
  id: string
  name: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
}

// Public user (without sensitive fields)
type PublicUser = Omit<User, 'password'>

// User creation input
type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>

// User update input (all fields optional except id)
type UpdateUserInput = Partial<Omit<User, 'id'>> & Pick<User, 'id'>

// Database columns
type UserColumns = keyof User

// ✅ Usage in functions
function createUser(input: CreateUserInput): Promise<PublicUser> {
  // Implementation
}

function updateUser(input: UpdateUserInput): Promise<PublicUser> {
  // Implementation
}
```

### Template Literal Types
```ts
// ✅ Route typing
type Route =
  | '/'
  | '/about'
  | '/products'
  | `/products/${string}`
  | '/auth/login'
  | '/auth/register'

// ✅ API endpoint typing
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
type ApiEndpoint = `/api/${string}`

function apiCall<T>(
  method: HttpMethod,
  endpoint: ApiEndpoint,
  body?: object
): Promise<T> {
  // Implementation
}
```

### Conditional Types
```ts
// ✅ Response type based on method
type ApiResponse<T extends HttpMethod> =
  T extends 'GET'
    ? { data: unknown }
    : T extends 'POST'
      ? { data: unknown; id: string }
      : T extends 'DELETE'
        ? { success: boolean }
        : never

function apiRequest<T extends HttpMethod>(
  method: T,
  url: string
): Promise<ApiResponse<T>> {
  // TypeScript infers correct return type based on method
}
```

## 8. Configuration & Environment

### Environment Variables
```ts
// ✅ Typed environment
interface Environment {
  NODE_ENV: 'development' | 'production' | 'test'
  DATABASE_URL: string
  REDIS_URL: string
  JWT_SECRET: string
}

function getEnv(): Environment {
  const env = process.env

  // Validate required variables
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET'] as const
  for (const varName of requiredVars) {
    if (!env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`)
    }
  }

  return {
    NODE_ENV: (env.NODE_ENV as Environment['NODE_ENV']) || 'development',
    DATABASE_URL: env.DATABASE_URL!,
    REDIS_URL: env.REDIS_URL || 'redis://localhost:6379',
    JWT_SECRET: env.JWT_SECRET!
  }
}

export const config = getEnv()
```

## Quick TypeScript Checklist

### Before Every Commit
- [ ] Zero TypeScript errors (`pnpm check-types`)
- [ ] No `any` types used
- [ ] Proper null/undefined handling
- [ ] Type guards for unknown data
- [ ] Generic constraints where appropriate
- [ ] Discriminated unions for complex state

### Code Review Checklist
- [ ] All function parameters properly typed
- [ ] Return types explicit or properly inferred
- [ ] Error handling typed
- [ ] API responses validated with type guards
- [ ] Form data validated with schemas
- [ ] Component props strictly typed

### Common Fixes
```ts
// ❌ Replace these patterns
any                    → unknown + type guard
data.prop             → data?.prop ?? fallback
user!.name           → user ? user.name : fallback
obj as SomeType      → Use type guard instead
Function             → (param: Type) => ReturnType
{}                   → Record<string, unknown> or specific interface
```

**Remember**: TypeScript is your friend, not your enemy. Embrace strict typing for bulletproof applications!