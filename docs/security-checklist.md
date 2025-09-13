# Security Checklist

**Zero Tolerance for Vulnerabilities** - Complete security guide for Svelte 5 + SvelteKit 2 + Supabase applications.

## Security Fundamentals

### ✅ ALWAYS Implement
- **XSS Protection**: Sanitize all user input
- **CSRF Protection**: Origin checks for state-changing requests
- **Authentication**: Proper session management
- **Authorization**: RLS and permission checks
- **Rate Limiting**: Prevent abuse and DoS
- **Input Validation**: Server-side with Zod
- **Secure Headers**: CSP, HSTS, etc.
- **Error Handling**: No sensitive data in errors

### ❌ NEVER Do
- Trust user input without validation
- Expose secrets in client code
- Skip origin checks for mutations
- Use client-side only authentication
- Return sensitive data in API responses
- Use `{@html}` without sanitization

## 1. XSS (Cross-Site Scripting) Prevention

### Template Rendering Safety
```svelte
<script lang="ts">
  let userContent = $state('')
  let trustedHtml = $state('')
  let userComment = $state('')
</script>

<!-- ✅ SAFE: Automatic escaping (default) -->
<p>{userContent}</p>
<h1>Welcome {user.name}</h1>

<!-- ✅ SAFE: Only with sanitized content -->
<div>{@html trustedHtml}</div>

<!-- ❌ DANGEROUS: Never use {@html} with user input -->
<!-- <div>{@html userComment}</div> NEVER DO THIS! -->

<!-- ✅ SAFE: Attributes are auto-escaped -->
<div class={userProvidedClass} title={userTitle}>
  Content
</div>
```

### HTML Sanitization
```ts
// ✅ Server-side sanitization (recommended)
import DOMPurify from 'isomorphic-dompurify'

export const actions = {
  createPost: async ({ request }) => {
    const formData = await request.formData()
    const rawHtml = formData.get('content') as string

    // ✅ Sanitize HTML server-side
    const sanitizedHtml = DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href']
    })

    await createPost({
      content: sanitizedHtml,
      userId: user.id
    })
  }
} satisfies Actions

// ✅ Client-side sanitization (when necessary)
import DOMPurify from 'dompurify'

function sanitizeUserHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
    ALLOWED_ATTR: []
  })
}
```

### URL Safety
```ts
// ✅ Safe URL validation
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    // Only allow specific protocols
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

// ✅ Safe redirect validation
export const actions = {
  login: async ({ url, request }) => {
    // ... authentication logic

    const redirectTo = url.searchParams.get('redirectTo')

    // ✅ Validate redirect URL
    if (redirectTo) {
      // Only allow relative URLs or same origin
      if (!redirectTo.startsWith('/') || redirectTo.startsWith('//')) {
        throw redirect(303, '/dashboard') // Safe default
      }
      throw redirect(303, redirectTo)
    }

    throw redirect(303, '/dashboard')
  }
}
```

## 2. CSRF (Cross-Site Request Forgery) Protection

### Origin Check Implementation
```ts
// hooks.server.ts
import type { Handle } from '@sveltejs/kit'
import { error } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
  // ✅ CSRF protection for state-changing requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(event.request.method)) {
    const origin = event.request.headers.get('origin')
    const host = event.request.headers.get('host')

    // Check origin matches host
    if (!origin) {
      throw error(403, 'Missing origin header')
    }

    const originHost = new URL(origin).host
    if (originHost !== host) {
      throw error(403, 'CSRF protection: Origin mismatch')
    }
  }

  return resolve(event)
}
```

### Form Token Protection (Additional Layer)
```ts
// lib/server/csrf.ts
import { randomBytes } from 'crypto'

const CSRF_TOKENS = new Map<string, number>()

export function generateCsrfToken(): string {
  const token = randomBytes(32).toString('hex')
  CSRF_TOKENS.set(token, Date.now())
  return token
}

export function validateCsrfToken(token: string): boolean {
  const timestamp = CSRF_TOKENS.get(token)
  if (!timestamp) return false

  // Token expires after 1 hour
  if (Date.now() - timestamp > 3600000) {
    CSRF_TOKENS.delete(token)
    return false
  }

  return true
}

// Usage in load function
export const load = (async ({ locals }) => {
  const { user } = await locals.safeGetSession()

  return {
    user,
    csrfToken: user ? generateCsrfToken() : null
  }
}) satisfies PageServerLoad

// Usage in action
export const actions = {
  updateProfile: async ({ request }) => {
    const formData = await request.formData()
    const csrfToken = formData.get('csrfToken') as string

    if (!csrfToken || !validateCsrfToken(csrfToken)) {
      return fail(403, { error: 'Invalid CSRF token' })
    }

    // Process form...
  }
} satisfies Actions
```

## 3. Authentication & Authorization

### Secure Session Management (Supabase)
```ts
// hooks.server.ts - Session setup
export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(
    process.env.PUBLIC_SUPABASE_URL!,
    process.env.PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key) => event.cookies.get(key),
        set: (key, value, options) => {
          event.cookies.set(key, value, {
            ...options,
            httpOnly: true,    // ✅ Prevent XSS access to cookies
            secure: true,      // ✅ HTTPS only
            sameSite: 'lax'    // ✅ CSRF protection
          })
        },
        remove: (key, options) => {
          event.cookies.delete(key, { ...options, httpOnly: true })
        }
      }
    }
  )

  // ✅ Safe session helper
  event.locals.safeGetSession = async () => {
    try {
      const { data: { session }, error } = await event.locals.supabase.auth.getSession()

      if (error) {
        console.error('Auth error:', error)
        return { session: null, user: null }
      }

      return {
        session,
        user: session?.user ?? null
      }
    } catch (error) {
      console.error('Session error:', error)
      return { session: null, user: null }
    }
  }

  return resolve(event)
}
```

### Role-Based Access Control
```ts
// lib/server/auth.ts
export enum Role {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

export interface AuthUser {
  id: string
  email: string
  role: Role
}

export function requireRole(user: AuthUser | null, requiredRole: Role): AuthUser {
  if (!user) {
    throw error(401, 'Authentication required')
  }

  const roleHierarchy = {
    [Role.USER]: 0,
    [Role.MODERATOR]: 1,
    [Role.ADMIN]: 2
  }

  if (roleHierarchy[user.role] < roleHierarchy[requiredRole]) {
    throw error(403, 'Insufficient permissions')
  }

  return user
}

// Usage in actions
export const actions = {
  deleteUser: async ({ locals, request }) => {
    const { user } = await locals.safeGetSession()
    const authUser = requireRole(user, Role.ADMIN)

    const formData = await request.formData()
    const targetUserId = formData.get('userId') as string

    await deleteUser(targetUserId)
    return { success: true }
  }
} satisfies Actions
```

### Protected Routes
```ts
// +layout.server.ts for (protected) routes
export const load = (async ({ locals, url }) => {
  const { user } = await locals.safeGetSession()

  if (!user) {
    throw redirect(302, `/login?redirectTo=${url.pathname}`)
  }

  return { user }
}) satisfies LayoutServerLoad
```

## 4. Rate Limiting & DoS Protection

### Request Rate Limiting
```ts
// lib/server/rate-limiter.ts
interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()

  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const entry = this.store.get(identifier)

    if (!entry || now > entry.resetTime) {
      // New window
      this.store.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return true
    }

    if (entry.count >= this.maxRequests) {
      return false
    }

    entry.count++
    return true
  }

  getRemainingRequests(identifier: string): number {
    const entry = this.store.get(identifier)
    if (!entry || Date.now() > entry.resetTime) {
      return this.maxRequests
    }
    return Math.max(0, this.maxRequests - entry.count)
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key)
      }
    }
  }
}

// Different limiters for different endpoints
export const authLimiter = new RateLimiter(5, 15 * 60 * 1000)    // 5 attempts per 15 min
export const apiLimiter = new RateLimiter(100, 60 * 1000)        // 100 req per minute
export const uploadLimiter = new RateLimiter(10, 60 * 1000)      // 10 uploads per minute

// Cleanup interval
setInterval(() => {
  authLimiter.cleanup()
  apiLimiter.cleanup()
  uploadLimiter.cleanup()
}, 60 * 1000)
```

### Rate Limiting Middleware
```ts
// lib/server/middleware.ts
import { error, type RequestEvent } from '@sveltejs/kit'
import { authLimiter, apiLimiter } from './rate-limiter.js'

export function withRateLimit(
  limiter: RateLimiter,
  handler: (event: RequestEvent) => Promise<Response>
) {
  return async (event: RequestEvent): Promise<Response> => {
    // Use IP address as identifier
    const clientIP = event.getClientAddress()

    if (!limiter.isAllowed(clientIP)) {
      const remaining = limiter.getRemainingRequests(clientIP)
      throw error(429, {
        message: 'Too many requests',
        retryAfter: '60',
        remaining
      })
    }

    return handler(event)
  }
}

// Usage in API routes
export const POST = withRateLimit(authLimiter, async ({ request, locals }) => {
  // Login logic
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await locals.supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    return json({ error: 'Invalid credentials' }, { status: 401 })
  }

  return json({ user: data.user })
})
```

## 5. Input Validation & Sanitization

### Server-Side Validation
```ts
import { z } from 'zod'

// ✅ Comprehensive validation schemas
const createPostSchema = z.object({
  title: z.string()
    .min(1, 'Title required')
    .max(200, 'Title too long')
    .regex(/^[\w\s\-.,!?]+$/, 'Title contains invalid characters'),

  content: z.string()
    .min(10, 'Content too short')
    .max(10000, 'Content too long'),

  tags: z.array(z.string().min(1).max(50))
    .max(10, 'Too many tags'),

  price: z.number()
    .positive('Price must be positive')
    .max(1000000, 'Price too high'),

  category: z.enum(['electronics', 'clothing', 'books', 'other']),

  isPublic: z.boolean(),

  // File upload validation
  images: z.array(z.object({
    name: z.string(),
    size: z.number().max(5 * 1024 * 1024, 'File too large'), // 5MB
    type: z.string().regex(/^image\/(jpeg|png|webp)$/, 'Invalid file type')
  })).max(5, 'Too many images')
})

export const actions = {
  create: async ({ request, locals }) => {
    const { user } = await locals.safeGetSession()
    if (!user) throw error(401, 'Unauthorized')

    const formData = await request.formData()

    // ✅ Parse and validate all inputs
    const result = createPostSchema.safeParse({
      title: formData.get('title'),
      content: formData.get('content'),
      tags: formData.getAll('tags'),
      price: Number(formData.get('price')),
      category: formData.get('category'),
      isPublic: formData.get('isPublic') === 'on',
      images: JSON.parse(formData.get('images') as string || '[]')
    })

    if (!result.success) {
      return fail(400, {
        error: 'Invalid input',
        issues: result.error.issues
      })
    }

    // ✅ Additional business logic validation
    if (result.data.price > 0 && !result.data.category) {
      return fail(400, {
        error: 'Category required for paid items'
      })
    }

    // Sanitize HTML content
    const sanitizedContent = DOMPurify.sanitize(result.data.content)

    const post = await createPost({
      ...result.data,
      content: sanitizedContent,
      userId: user.id
    })

    throw redirect(303, `/posts/${post.id}`)
  }
} satisfies Actions
```

### File Upload Security
```ts
// lib/server/file-upload.ts
import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'
import { randomUUID } from 'crypto'

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp'
] as const

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function validateAndSaveFile(
  file: File,
  uploadDir: string
): Promise<{ path: string; url: string }> {
  // ✅ Validate file type
  if (!ALLOWED_MIME_TYPES.includes(file.type as any)) {
    throw new Error(`Invalid file type: ${file.type}`)
  }

  // ✅ Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large: ${file.size} bytes`)
  }

  // ✅ Generate safe filename
  const extension = extname(file.name)
  const safeFilename = `${randomUUID()}${extension}`
  const filePath = join(uploadDir, safeFilename)

  // ✅ Ensure upload directory exists
  await mkdir(uploadDir, { recursive: true })

  // ✅ Save file
  const buffer = new Uint8Array(await file.arrayBuffer())
  await writeFile(filePath, buffer)

  return {
    path: filePath,
    url: `/uploads/${safeFilename}`
  }
}

// Usage in action
export const actions = {
  uploadImage: async ({ request, locals }) => {
    const { user } = await locals.safeGetSession()
    if (!user) throw error(401, 'Unauthorized')

    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return fail(400, { error: 'No file uploaded' })
    }

    try {
      const result = await validateAndSaveFile(file, 'static/uploads')

      // Save to database
      await saveFileRecord({
        userId: user.id,
        filename: file.name,
        path: result.path,
        url: result.url,
        size: file.size,
        mimeType: file.type
      })

      return { success: true, url: result.url }
    } catch (error) {
      return fail(400, { error: error.message })
    }
  }
} satisfies Actions
```

## 6. Secure Headers & CSP

### Security Headers
```ts
// hooks.server.ts
export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event)

  // ✅ Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // ✅ HSTS (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  return response
}
```

### Content Security Policy
```ts
// svelte.config.js
const config = {
  kit: {
    csp: {
      mode: 'auto',
      directives: {
        'default-src': ['self'],
        'script-src': [
          'self',
          // ✅ Only specific CDNs
          'https://js.stripe.com',
          // ✅ Nonce for inline scripts
          'unsafe-inline' // Only with nonces
        ],
        'style-src': [
          'self',
          'unsafe-inline' // Needed for Tailwind
        ],
        'img-src': [
          'self',
          'data:',
          // ✅ Specific image hosts
          'https://images.unsplash.com',
          'https://your-supabase-project.supabase.co'
        ],
        'connect-src': [
          'self',
          'https://api.stripe.com',
          'https://your-supabase-project.supabase.co'
        ],
        'frame-src': ['https://js.stripe.com'],
        'object-src': ['none'],
        'base-uri': ['self']
      }
    }
  }
}
```

## 7. Error Handling & Information Disclosure

### Secure Error Responses
```ts
// lib/server/errors.ts
export function createSafeError(error: unknown, context: string): {
  message: string
  code: string
  statusCode: number
} {
  // ✅ Log full error server-side
  console.error(`Error in ${context}:`, error)

  // ✅ Return safe error to client
  if (error instanceof ValidationError) {
    return {
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      statusCode: 400
    }
  }

  if (error instanceof NotFoundError) {
    return {
      message: 'Resource not found',
      code: 'NOT_FOUND',
      statusCode: 404
    }
  }

  // ✅ Generic error for unexpected issues
  return {
    message: 'An error occurred',
    code: 'INTERNAL_ERROR',
    statusCode: 500
  }
}

// Usage in API routes
export const POST: RequestHandler = async ({ request }) => {
  try {
    // ... operation
    return json({ success: true })
  } catch (error) {
    const safeError = createSafeError(error, 'POST /api/users')
    return json(safeError, { status: safeError.statusCode })
  }
}
```

### Environment Variable Security
```ts
// lib/server/config.ts
// ✅ Server-only configuration
export const serverConfig = {
  database: {
    url: process.env.DATABASE_URL!,
    poolSize: Number(process.env.DB_POOL_SIZE) || 10
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET!,
    sessionDuration: 24 * 60 * 60 * 1000 // 24 hours
  },
  external: {
    stripeSecret: process.env.STRIPE_SECRET_KEY!,
    supabaseServiceRole: process.env.SUPABASE_SERVICE_ROLE_KEY!
  }
}

// ✅ Client-safe configuration
export const clientConfig = {
  api: {
    baseUrl: process.env.PUBLIC_API_URL!
  },
  stripe: {
    publishableKey: process.env.PUBLIC_STRIPE_PUBLISHABLE_KEY!
  },
  supabase: {
    url: process.env.PUBLIC_SUPABASE_URL!,
    anonKey: process.env.PUBLIC_SUPABASE_ANON_KEY!
  }
}

// ❌ NEVER expose server secrets to client
// export const dangerousConfig = {
//   stripeSecret: process.env.STRIPE_SECRET_KEY // DON'T!
// }
```

## Security Checklist

### Before Every Deploy
- [ ] **XSS**: All user input properly escaped or sanitized
- [ ] **CSRF**: Origin checks for state-changing requests
- [ ] **Auth**: Proper session management and logout
- [ ] **RLS**: Row Level Security enforced in database
- [ ] **Validation**: Server-side input validation with Zod
- [ ] **Rate Limiting**: Applied to auth and API endpoints
- [ ] **Headers**: Security headers and CSP configured
- [ ] **Secrets**: No secrets exposed in client code
- [ ] **Errors**: No sensitive data in error messages
- [ ] **HTTPS**: SSL/TLS enabled in production

### Code Review Security
- [ ] No `{@html}` with unsanitized content
- [ ] No client-side authentication logic
- [ ] No hardcoded secrets or credentials
- [ ] Proper error handling without data leaks
- [ ] Rate limiting on sensitive endpoints
- [ ] Input validation on all user inputs
- [ ] File upload restrictions enforced
- [ ] Database queries use parameterization
- [ ] Authorization checks before sensitive operations
- [ ] Secure cookie settings (httpOnly, secure, sameSite)

### Emergency Response
1. **Security Incident**: Revoke compromised tokens/sessions
2. **XSS Discovery**: Immediately sanitize affected outputs
3. **Data Breach**: Log out all users, investigate scope
4. **DoS Attack**: Implement temporary rate limiting
5. **Vulnerability Report**: Patch immediately, deploy hotfix

**Remember**: Security is not optional. Every feature must be secure by default!