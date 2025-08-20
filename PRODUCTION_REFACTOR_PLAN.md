# Driplo Production Refactor Plan

**Current Date: 20.08.2025 (20 AUGUST 2025)**

## Executive Summary
This comprehensive refactor plan transforms Driplo into a production-ready C2C marketplace built on SvelteKit 2, Svelte 5, Supabase SSR, and TailwindCSS v4. The plan emphasizes security, performance, type safety, and maintainability while leveraging SvelteKit's cutting-edge features including remote functions.

## Core Architecture Principles

### SvelteKit Philosophy Applied
- **"Boring stuff automated"**: Let SvelteKit handle infrastructure while we focus on business logic
- **Web standards first**: Follow platform conventions and progressive enhancement
- **Performance by default**: Leverage automatic optimizations (code splitting, preloading, SSR)
- **Flexibility without complexity**: Mix rendering strategies per page requirements

### Driplo-Specific Principles
- **Single Source of Truth**: One Supabase client per context (server/browser)
- **Type Safety First**: Strict TypeScript with generated Supabase types
- **Security by Default**: RLS policies, secure cookies, input validation
- **Performance Optimized**: SSR, code splitting, image optimization
- **Developer Experience**: Clear patterns, minimal boilerplate, comprehensive testing

## Technology Stack
- **Framework**: SvelteKit 2.25+ with Svelte 5.36+
- **Database**: Supabase (PostgreSQL 15+)
- **Authentication**: Supabase Auth with SSR
- **Styling**: TailwindCSS v4.1+ with PostCSS
- **Payments**: Stripe Connect
- **Type System**: TypeScript 5.8 (strict mode)
- **Testing**: Vitest + Playwright
- **Deployment**: Vercel Edge

## SvelteKit Best Practices Reference

### Routing Patterns
- **File-based routing**: Use `+page.svelte`, `+layout.svelte`, `+server.ts` naming
- **Route groups**: Use `(group)` directories for organization without URL impact
- **Dynamic routes**: `[slug]`, `[[optional]]`, `[...rest]` parameter patterns
- **Parameter matching**: Custom validators in `src/params/` directory
- **Layout inheritance**: Use `+page@` and `+layout@` to break layout hierarchies

### Load Functions Best Practices
- **Universal loads** (`+page.js`): Client/server compatible, return any data type
- **Server loads** (`+page.server.js`): Server-only, access sensitive data, return serializable
- **Parallel loading**: Use `Promise.all()` for concurrent data fetching
- **Dependency tracking**: Use `depends()` for custom invalidation
- **Error handling**: Use `error()` helper for expected errors
- **Streaming**: Return promises for progressive loading with skeletons

### Form Actions Patterns
- **Progressive enhancement**: Use `use:enhance` for client-side improvements
- **Validation**: Return `fail()` with detailed error information
- **Security**: Always use `POST` method, validate server-side
- **User feedback**: Return actionable error messages
- **Multiple actions**: Use named actions for different form operations

### Page Configuration
- **Prerendering**: Enable for static content (`export const prerender = true`)
- **SSR control**: Disable when not needed (`export const ssr = false`)
- **CSR control**: Disable for static pages (`export const csr = false`)
- **SEO optimization**: Prerender public pages, SSR for dynamic content

### Hooks Architecture
- **Request handling**: Use `handle` hook for request modification
- **Error management**: `handleError` for centralized error processing
- **Fetch customization**: `handleFetch` for request transformation
- **Sequence composition**: Use `sequence()` to combine multiple hooks
- **Client/server separation**: Separate hooks by execution context

### State Management
- **Avoid server state**: Never store user data in server variables
- **Context API**: Use `setContext`/`getContext` for component trees
- **URL state**: Store navigational state in URL parameters
- **Reactive patterns**: Use `$derived` for computed values
- **Component preservation**: Leverage SvelteKit's component reuse during navigation

### Remote Functions (Experimental)
- **Type safety**: Compile-time type checking for client-server communication
- **Query functions**: Read dynamic data with caching and validation
- **Form functions**: Handle form submissions with progressive enhancement
- **Command functions**: State-changing operations from anywhere in the app
- **Prerender functions**: Build-time data generation for static content
- **Server security**: Direct access to server-only modules and databases
- **Performance**: Reduces boilerplate, automatic caching, query refreshing

### Error Handling Patterns
- **Expected errors**: Use `error()` helper with proper status codes
- **Unexpected errors**: Handle through `handleError` hook
- **Error boundaries**: Create `+error.svelte` pages for graceful failures
- **Type safety**: Define custom `App.Error` interface in `app.d.ts`
- **Client vs server**: Different error handling strategies per context

### Server-Only Security
- **File naming**: Use `.server.js` suffix or `$lib/server/` directory
- **Import restrictions**: Prevent client-side access to sensitive modules
- **Environment variables**: Proper separation of public/private env vars
- **Testing**: Restrictions disabled when `process.env.TEST === 'true'`
- **Security by design**: Entire import chains are protected

### Performance Optimization
- **Code splitting**: Automatic per-page code splitting
- **Asset optimization**: Use `@sveltejs/enhanced-img` for images
- **Lazy loading**: Dynamic imports for conditional components
- **Preloading**: Built-in link preloading and data fetching
- **Caching**: File hashing and long-term caching strategies
- **Bundle analysis**: Use rollup-plugin-visualizer for size analysis

### SEO & Accessibility
- **SSR by default**: Reliable content indexing
- **Metadata**: Dynamic `<title>` and `<meta>` in `<svelte:head>`
- **Structured data**: JSON-LD in page load functions
- **Performance impact**: Core Web Vitals affect rankings
- **Accessibility**: Route announcements, focus management, language support
- **Sitemaps**: Dynamic XML generation through server endpoints

---

## Phase 1: Foundation & Infrastructure (Week 1)

### 1.1 TypeScript & Build Configuration
**Goal**: Enable strict TypeScript and optimize build pipeline

#### Tasks:
- [ ] Enable TypeScript strict mode in all `tsconfig.json` files
- [ ] Configure path aliases consistently across monorepo
- [ ] Update `vite.config.ts` for optimal chunking strategy
- [ ] Configure source maps for production debugging
- [ ] Set up environment variable validation at build time
- [ ] Configure experimental features (remote functions, async components)

#### Implementation:
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "forceConsistentCasingInFileNames": true
  }
}

// vite.config.ts
export default defineConfig({
  kit: {
    experimental: {
      remoteFunctions: true
    }
  },
  compilerOptions: {
    experimental: {
      async: true
    }
  }
});
```

### 1.2 Supabase Type Generation
**Goal**: Replace handwritten types with generated ones

#### Tasks:
- [ ] Install Supabase CLI globally
- [ ] Generate types: `supabase gen types typescript --project-id [id] > packages/database/src/generated.ts`
- [ ] Create type utilities for common patterns
- [ ] Replace all `Database` imports with generated types
- [ ] Add npm script for type generation
- [ ] Set up pre-commit hook for type freshness check

#### Implementation:
```json
// package.json scripts
{
  "db:types": "supabase gen types typescript --project-id $PROJECT_ID > packages/database/src/generated.ts",
  "db:types:watch": "nodemon --watch supabase/migrations -x 'npm run db:types'"
}
```

### 1.3 Environment Configuration
**Goal**: Secure, validated environment variables

#### Tasks:
- [ ] Create `.env.example` with all required variables
- [ ] Implement env validation module using Zod
- [ ] Add startup validation in `app.html`
- [ ] Configure different env files for dev/preview/prod
- [ ] Document all environment variables
- [ ] Set up secret rotation strategy

#### Implementation:
```typescript
// $lib/env/validation.ts
import { z } from 'zod';

const envSchema = z.object({
  PUBLIC_SUPABASE_URL: z.string().url(),
  PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  SENTRY_DSN: z.string().url().optional(),
});

export function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.flatten());
    throw new Error('Invalid environment configuration');
  }
  return result.data;
}
```

### 1.4 Monitoring & Observability
**Goal**: Production-grade error tracking and performance monitoring

#### SvelteKit Best Practice Applied:
- Use `+error.svelte` pages for graceful error boundaries
- Implement `handleError` hook for centralized error processing
- Define custom `App.Error` interface for type-safe error handling
- Use server-only modules for sensitive monitoring configuration

#### Tasks:
- [ ] Configure Sentry with proper DSN handling in server-only modules
- [ ] Set up error boundaries using `+error.svelte` pages
- [ ] Implement custom error pages (404, 500) with proper error() usage
- [ ] Add performance monitoring (Web Vitals) with SvelteKit performance patterns
- [ ] Create health check endpoint using `+server.ts`
- [ ] Set up uptime monitoring with proper error categorization

#### Implementation:
```typescript
// app.d.ts - Define custom error interface
declare global {
  namespace App {
    interface Error {
      code?: string;
      id?: string;
      details?: Record<string, any>;
    }
  }
}

// $lib/server/monitoring.server.ts - Server-only monitoring config
import * as Sentry from '@sentry/sveltekit';

const SENTRY_DSN = process.env.SENTRY_DSN; // Only accessible server-side

export function initServerMonitoring() {
  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: process.env.NODE_ENV,
      beforeSend(event, hint) {
        // Filter sensitive data - server-only processing
        if (event.request?.cookies) {
          event.request.cookies = '[FILTERED]';
        }
        return event;
      },
    });
  }
}

// hooks.server.ts - Following error handling best practices
export const handleError: HandleServerError = async ({ error, event, status, message }) => {
  const errorId = crypto.randomUUID();
  
  // Log detailed error server-side only
  console.error(`Error ${errorId}:`, {
    error: error.stack,
    url: event.url.pathname,
    userId: event.locals.user?.id,
    userAgent: event.request.headers.get('user-agent'),
  });
  
  // Send to Sentry if configured
  if (SENTRY_DSN) {
    Sentry.captureException(error, {
      tags: { errorId },
      user: { id: event.locals.user?.id },
      extra: { url: event.url.pathname },
    });
  }
  
  // Return safe error info to client
  return {
    message: status >= 500 ? 'Internal Server Error' : message,
    code: status >= 500 ? 'INTERNAL_ERROR' : 'CLIENT_ERROR',
    id: errorId,
  } satisfies App.Error;
};

// routes/+error.svelte - Error boundary component
<script lang="ts">
  import { page } from '$app/stores';
  import { Button } from '@repo/ui';
  
  // Typed error from our App.Error interface
  $: error = $page.error as App.Error;
  $: status = $page.status;
</script>

<div class="error-container">
  <h1>{status}</h1>
  
  {#if status === 404}
    <h2>Page not found</h2>
    <p>The page you're looking for doesn't exist.</p>
    <Button href="/">Go Home</Button>
  {:else if status >= 500}
    <h2>Something went wrong</h2>
    <p>We're sorry, but something unexpected happened.</p>
    {#if error?.id}
      <p class="error-id">Error ID: {error.id}</p>
    {/if}
    <Button onclick={() => location.reload()}>Try Again</Button>
  {:else}
    <h2>Error</h2>
    <p>{error?.message || 'An error occurred'}</p>
  {/if}
</div>

// routes/api/health/+server.ts - Health check endpoint
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  try {
    // Check database connectivity
    const { error: dbError } = await locals.supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (dbError) {
      throw error(503, {
        message: 'Database unavailable',
        code: 'DB_ERROR',
        details: { service: 'supabase' }
      });
    }
    
    return json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'ok',
        auth: 'ok',
      }
    });
  } catch (err) {
    throw error(503, {
      message: 'Service unavailable', 
      code: 'HEALTH_CHECK_FAILED'
    });
  }
};
```

---

## Phase 2: Supabase SSR & Authentication Hardening (Week 1-2)

### 2.1 Supabase Client Architecture
**Goal**: Single, secure Supabase client with proper SSR support

#### Tasks:
- [ ] Refactor `hooks.server.ts` for single server client
- [ ] Implement cookie security (httpOnly, secure, sameSite)
- [ ] Add mobile user agent detection for cookie compatibility
- [ ] Create service client factory for admin operations
- [ ] Implement connection pooling strategy
- [ ] Add retry logic with exponential backoff

#### Implementation:
```typescript
// hooks.server.ts
const supabase: Handle = async ({ event, resolve }) => {
  const isMobile = /Mobile|Android|iPhone/i.test(event.request.headers.get('user-agent') || '');
  
  event.locals.supabase = createServerClient<Database>(
    env.PUBLIC_SUPABASE_URL,
    env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => event.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            event.cookies.set(name, value, {
              path: '/',
              secure: !dev,
              httpOnly: true,
              sameSite: isMobile ? 'none' : 'lax',
              maxAge: 60 * 60 * 24 * 365,
              ...options,
            });
          });
        },
      },
      global: {
        fetch: event.fetch, // Critical for Vercel
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    }
  );
  
  // Implement safeGetSession with JWT validation
  event.locals.safeGetSession = async () => {
    const { data: { session } } = await event.locals.supabase.auth.getSession();
    if (!session) return { session: null, user: null };
    
    const { data: { user }, error } = await event.locals.supabase.auth.getUser();
    if (error || !user) {
      await event.locals.supabase.auth.signOut();
      return { session: null, user: null };
    }
    
    return { session, user };
  };
  
  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version';
    },
  });
};
```

### 2.2 Authentication Flow Enhancement
**Goal**: Bulletproof signup, login, and email verification

#### Tasks:
- [ ] Implement comprehensive auth error handling
- [ ] Add email normalization (lowercase, trim)
- [ ] Create email verification flow with resend capability
- [ ] Implement password strength requirements
- [ ] Add MFA support preparation
- [ ] Create auth callback handler for OAuth

#### Implementation:
```typescript
// routes/(auth)/signup/+page.server.ts
export const actions: Actions = {
  signup: async ({ request, locals: { supabase }, url }) => {
    const form = await superValidate(request, zod(SignupSchema));
    if (!form.valid) return fail(400, { form });
    
    const { email, password, username } = form.data;
    
    // Check username availability
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .single();
    
    if (existingUser) {
      return fail(400, { 
        form, 
        error: 'Username already taken' 
      });
    }
    
    // Create auth user
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        emailRedirectTo: `${url.origin}/auth/callback`,
        data: {
          username: username.toLowerCase(),
          full_name: form.data.fullName,
        },
      },
    });
    
    if (error) {
      return fail(400, { form, error: error.message });
    }
    
    // Create profile via trigger or manual insert
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        username: username.toLowerCase(),
        full_name: form.data.fullName,
        onboarding_completed: false,
      });
    }
    
    throw redirect(303, '/verify-email?email=' + encodeURIComponent(email));
  },
};
```

### 2.3 Session Management
**Goal**: Secure, consistent session handling across the app

#### Tasks:
- [ ] Implement session refresh strategy
- [ ] Add session expiry warnings
- [ ] Create logout handler with cleanup
- [ ] Implement "remember me" functionality
- [ ] Add device management UI
- [ ] Create session activity tracking

#### Implementation:
```typescript
// $lib/stores/auth.svelte.ts
class AuthStore {
  #session = $state<Session | null>(null);
  #user = $state<User | null>(null);
  #profile = $state<Profile | null>(null);
  
  get session() { return this.#session; }
  get user() { return this.#user; }
  get profile() { return this.#profile; }
  get isAuthenticated() { return !!this.#session; }
  
  async initialize(data: PageData) {
    this.#session = data.session;
    this.#user = data.user;
    this.#profile = data.profile;
    
    // Set up real-time subscription
    if (browser && this.#session) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_OUT') {
            this.#session = null;
            this.#user = null;
            this.#profile = null;
            await goto('/');
          } else if (session) {
            this.#session = session;
            this.#user = session.user;
            await this.refreshProfile();
          }
        }
      );
      
      return () => subscription.unsubscribe();
    }
  }
  
  async refreshProfile() {
    if (!this.#user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', this.#user.id)
      .single();
    
    if (data) this.#profile = data;
  }
}

export const auth = new AuthStore();
```

### 2.4 Route Protection
**Goal**: Granular access control with clear patterns

#### SvelteKit Best Practice Applied:
- Use route groups `(protected)`, `(auth)`, `(admin)` for logical organization
- Implement custom parameter matchers for role validation
- Apply proper hook sequencing with `sequence()`

#### Tasks:
- [ ] Implement route guards in hooks using SvelteKit route groups
- [ ] Create role-based access control with parameter matchers
- [ ] Add onboarding flow enforcement with layout inheritance
- [ ] Implement redirect after login pattern using URL state
- [ ] Create admin route protection with `(admin)` route group
- [ ] Add API endpoint security with proper `+server.ts` patterns

#### Route Structure:
```
src/routes/
├── (auth)/          # Auth pages (login, signup)
│   ├── +layout.svelte
│   └── login/+page.svelte
├── (protected)/     # Authenticated routes
│   ├── +layout.svelte
│   ├── sell/+page.svelte
│   └── dashboard/
└── (admin)/         # Admin-only routes
    ├── +layout@.svelte  # Break out of parent layout
    └── +page.svelte
```

#### Implementation:
```typescript
// hooks.server.ts - Following hooks best practices
const authGuard: Handle = async ({ event, resolve }) => {
  const { session, user } = await event.locals.safeGetSession();
  event.locals.session = session;
  event.locals.user = user;
  
  const route = event.route.id;
  
  // Use route groups for logical organization
  if (route?.startsWith('/(protected)')) {
    if (!session) {
      // Store redirect URL in URL state (SvelteKit best practice)
      const redirectUrl = encodeURIComponent(event.url.pathname + event.url.search);
      throw redirect(303, `/login?redirect=${redirectUrl}`);
    }
    
    // Check onboarding using depends() for proper invalidation
    const { data: profile } = await event.locals.supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single();
    
    if (!profile?.onboarding_completed && !route?.includes('/onboarding')) {
      throw redirect(303, '/onboarding');
    }
  }
  
  // Admin route group protection
  if (route?.startsWith('/(admin)')) {
    if (!session) throw redirect(303, '/login');
    
    const { data: profile } = await event.locals.supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile?.role !== 'admin') {
      throw error(403, 'Access denied');
    }
  }
  
  return resolve(event);
};

// Parameter matcher for role validation
// src/params/role.ts
export function match(param: string): boolean {
  return ['admin', 'seller', 'buyer'].includes(param);
}

// Usage in route: /profile/[role=role]/dashboard
```

---

## Phase 3: Onboarding & Profile Management (Week 2)

### 3.1 Profile Bootstrap
**Goal**: Automatic profile creation with sensible defaults

#### Tasks:
- [ ] Create database trigger for profile creation
- [ ] Implement username generation strategy
- [ ] Add avatar upload with image optimization
- [ ] Create profile completion tracking
- [ ] Implement social links validation
- [ ] Add profile visibility settings

#### Database Migration:
```sql
-- Create profile on signup trigger
CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (
    id, 
    username, 
    full_name,
    avatar_url,
    onboarding_completed,
    created_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', generate_unique_username(NEW.email)),
    NEW.raw_user_meta_data->>'full_name',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id,
    false,
    NOW()
  ) ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_on_signup();
```

### 3.2 Onboarding Flow
**Goal**: Smooth, progressive onboarding experience

#### Tasks:
- [ ] Create multi-step onboarding wizard
- [ ] Implement progress persistence
- [ ] Add skip options for optional steps
- [ ] Create onboarding analytics
- [ ] Implement welcome email trigger
- [ ] Add onboarding completion rewards

#### Implementation:
```typescript
// routes/onboarding/+page.svelte
<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth.svelte';
  
  let currentStep = $state(1);
  const totalSteps = 4;
  
  const steps = [
    { id: 'profile', title: 'Complete Profile', required: true },
    { id: 'avatar', title: 'Upload Avatar', required: false },
    { id: 'preferences', title: 'Set Preferences', required: false },
    { id: 'payment', title: 'Payment Setup', required: false },
  ];
  
  async function completeOnboarding() {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq('id', auth.user.id);
    
    if (!error) {
      // Set welcome modal cookie
      document.cookie = 'welcome_modal=pending; path=/; max-age=86400';
      await goto('/');
    }
  }
</script>

<div class="onboarding-container">
  <progress value={currentStep} max={totalSteps} />
  
  {#if currentStep === 1}
    <ProfileStep bind:currentStep />
  {:else if currentStep === 2}
    <AvatarStep bind:currentStep />
  {:else if currentStep === 3}
    <PreferencesStep bind:currentStep />
  {:else if currentStep === 4}
    <PaymentStep on:complete={completeOnboarding} />
  {/if}
</div>
```

### 3.3 Welcome Modal
**Goal**: One-time welcome experience after onboarding

#### Tasks:
- [ ] Create welcome modal component
- [ ] Implement cookie-based display logic
- [ ] Add tutorial highlights
- [ ] Create quick action buttons
- [ ] Add dismissal tracking
- [ ] Implement A/B testing capability

#### Implementation:
```typescript
// $lib/components/WelcomeModal.svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  
  let showModal = $state(false);
  
  onMount(() => {
    if (browser) {
      const welcomePending = document.cookie
        .split('; ')
        .find(row => row.startsWith('welcome_modal='))
        ?.split('=')[1] === 'pending';
      
      if (welcomePending) {
        showModal = true;
        // Mark as shown
        document.cookie = 'welcome_modal=shown; path=/; max-age=31536000';
      }
    }
  });
  
  function dismiss() {
    showModal = false;
    // Track dismissal
    analytics.track('welcome_modal_dismissed');
  }
</script>

{#if showModal}
  <dialog open class="welcome-modal">
    <h2>Welcome to Driplo! 🎉</h2>
    <p>Your account is all set up. Here's how to get started:</p>
    
    <div class="quick-actions">
      <button onclick={() => goto('/sell')}>List Your First Item</button>
      <button onclick={() => goto('/browse')}>Browse Products</button>
      <button onclick={() => goto('/profile/edit')}>Complete Profile</button>
    </div>
    
    <button onclick={dismiss}>Get Started</button>
  </dialog>
{/if}
```

---

## Phase 4: Product Listing & Remote Functions (Week 2-3)

### 4.1 Remote Functions Implementation
**Goal**: Type-safe server functions for product operations

#### SvelteKit Best Practice Applied:
- Enable experimental remote functions for type-safe client-server communication
- Use query functions for read operations with automatic caching
- Use command functions for state-changing operations
- Leverage compile-time type checking across the boundary

#### Tasks:
- [ ] Enable experimental remote functions in `svelte.config.js`
- [ ] Create product service remote functions following query/command pattern
- [ ] Implement category fetching with query functions and caching
- [ ] Add image upload handlers using command functions
- [ ] Create validation functions with proper error handling
- [ ] Implement caching strategy using SvelteKit's built-in mechanisms

#### Implementation:
```typescript
// $lib/remote/products.remote.ts - All remote function types
import { query, command, form, prerender } from '@sveltejs/kit/remote';
import { supabase } from '$lib/server/supabase.server';
import { z } from 'zod';
import { ProductSchema } from '$lib/validation/product';

// QUERY FUNCTIONS - Read dynamic data with caching
export const getCategories = query(async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  
  if (error) throw error;
  return data;
});

export const getProduct = query(async (productId: string) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*),
      category:categories!category_id(name),
      seller:profiles!seller_id(username, avatar_url, rating)
    `)
    .eq('id', productId)
    .single();
  
  if (error) throw error;
  return data;
});

export const searchProducts = query(async (filters: {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
}) => {
  const { data, error } = await supabase.rpc('search_products', {
    search_query: filters.query,
    category_ids: filters.category ? [filters.category] : null,
    min_price: filters.minPrice,
    max_price: filters.maxPrice,
    limit_count: filters.limit || 20,
  });
  
  if (error) throw error;
  return data;
});

// PRERENDER FUNCTIONS - Build-time data generation
export const getFeaturedCategories = prerender(async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_featured', true)
    .order('sort_order')
    .limit(8);
  
  if (error) throw error;
  return data;
}, {
  // Optional: specify inputs for cache invalidation
  inputs: () => ['featured-categories']
});

export const getPopularProducts = prerender(async () => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, title, price,
      images:product_images(image_url),
      seller:profiles!seller_id(username)
    `)
    .eq('is_active', true)
    .order('view_count', { ascending: false })
    .limit(12);
  
  if (error) throw error;
  return data;
});

// FORM FUNCTIONS - Handle form submissions with progressive enhancement
export const createProduct = form(async (formData: FormData, { locals }) => {
  const { session } = await locals.safeGetSession();
  if (!session) throw new Error('Unauthorized');
  
  // Extract and validate form data
  const productData = {
    title: formData.get('title'),
    description: formData.get('description'),
    price: Number(formData.get('price')),
    category_id: formData.get('category_id'),
    condition: formData.get('condition'),
    brand: formData.get('brand'),
    size: formData.get('size'),
    color: formData.get('color'),
    shipping_cost: Number(formData.get('shipping_cost')) || null,
  };
  
  // Validate with Zod
  const validated = ProductSchema.parse(productData);
  
  // Check user listing permissions
  const { data: canList } = await supabase.rpc('can_user_create_listing', {
    user_id_param: session.user.id
  });
  
  if (!canList) {
    throw new Error('Listing limit reached. Please upgrade your plan.');
  }
  
  // Create product
  const { data: product, error } = await supabase
    .from('products')
    .insert({
      ...validated,
      seller_id: session.user.id,
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Handle file uploads
  const files = formData.getAll('images') as File[];
  if (files.length > 0) {
    await uploadProductImages(product.id, files, session.user.id);
  }
  
  return { success: true, productId: product.id };
});

export const updateProduct = form(async (formData: FormData, { locals }) => {
  const { session } = await locals.safeGetSession();
  if (!session) throw new Error('Unauthorized');
  
  const productId = formData.get('productId') as string;
  
  // Verify ownership
  const { data: product } = await supabase
    .from('products')
    .select('seller_id')
    .eq('id', productId)
    .single();
  
  if (product?.seller_id !== session.user.id) {
    throw new Error('Unauthorized');
  }
  
  // Update product logic...
  return { success: true };
});

// COMMAND FUNCTIONS - State-changing operations from anywhere
export const toggleFavorite = command(async (productId: string, { locals }) => {
  const { session } = await locals.safeGetSession();
  if (!session) throw new Error('Unauthorized');
  
  // Check if already favorited
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('product_id', productId)
    .eq('user_id', session.user.id)
    .single();
  
  if (existing) {
    // Remove favorite
    await supabase
      .from('favorites')
      .delete()
      .eq('id', existing.id);
    return { favorited: false };
  } else {
    // Add favorite
    await supabase
      .from('favorites')
      .insert({
        product_id: productId,
        user_id: session.user.id,
      });
    return { favorited: true };
  }
});

export const followSeller = command(async (sellerId: string, { locals }) => {
  const { session } = await locals.safeGetSession();
  if (!session) throw new Error('Unauthorized');
  
  // Toggle follow status
  const { data: existing } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', session.user.id)
    .eq('following_id', sellerId)
    .single();
  
  if (existing) {
    await supabase.from('follows').delete().eq('id', existing.id);
    return { following: false };
  } else {
    await supabase.from('follows').insert({
      follower_id: session.user.id,
      following_id: sellerId,
    });
    return { following: true };
  }
});

export const markProductAsSold = command(async (productId: string, { locals }) => {
  const { session } = await locals.safeGetSession();
  if (!session) throw new Error('Unauthorized');
  
  // Verify ownership and update
  const { data, error } = await supabase
    .from('products')
    .update({ 
      is_sold: true, 
      sold_at: new Date().toISOString() 
    })
    .eq('id', productId)
    .eq('seller_id', session.user.id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
});

// Helper function for image uploads
async function uploadProductImages(productId: string, files: File[], userId: string) {
  const uploadPromises = files.map(async (file, index) => {
    if (!file.size) return null;
    
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(fileExt || '')) {
      throw new Error(`Invalid file type: ${fileExt}`);
    }
    
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File too large (max 5MB)');
    }
    
    const fileName = `${userId}/${productId}/${Date.now()}_${index}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);
    
    // Save to database
    await supabase.from('product_images').insert({
      product_id: productId,
      image_url: publicUrl,
      sort_order: index,
    });
    
    return publicUrl;
  });
  
  return Promise.all(uploadPromises);
}
```

### 4.2 Sell Page Enhancement
**Goal**: Robust product listing with real-time validation

#### SvelteKit Best Practice Applied:
- Use remote form functions for progressive enhancement
- Implement proper error handling and validation
- Apply type-safe client-server communication
- Leverage experimental async component syntax

#### Tasks:
- [ ] Implement multi-step listing form using remote form functions
- [ ] Add drag-and-drop image upload with command functions
- [ ] Create real-time price suggestions with query functions
- [ ] Implement draft saving with command functions
- [ ] Add listing preview with prerendered categories
- [ ] Create boost options UI with subscription checks

#### Implementation:
```svelte
<!-- routes/sell/+page.svelte - Using remote functions -->
<script lang="ts">
  import { 
    createProduct,           // form function
    getCategories,          // query function  
    toggleFavorite,         // command function
    getFeaturedCategories   // prerender function
  } from '$lib/remote/products.remote';
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  
  // Query functions with automatic caching
  const categories = $derived(await getCategories());
  const featuredCategories = $derived(await getFeaturedCategories());
  
  let form = $state({
    title: '',
    description: '',
    price: 0,
    category_id: '',
    condition: 'good' as const,
    brand: '',
    size: '',
    color: '',
    shipping_cost: 0,
  });
  
  let files = $state<File[]>([]);
  let isSubmitting = $state(false);
  let errors = $state<Record<string, string>>({});
  
  // Real-time validation
  const titleError = $derived(() => {
    if (!form.title.trim()) return 'Title is required';
    if (form.title.length < 5) return 'Title must be at least 5 characters';
    return null;
  });
  
  // Price suggestions based on category
  const suggestedPrice = $derived(async () => {
    if (!form.category_id || !form.title) return null;
    
    // This could be another query function
    const suggestions = await fetch(`/api/price-suggestions`, {
      method: 'POST',
      body: JSON.stringify({ 
        category: form.category_id, 
        title: form.title.slice(0, 50) 
      }),
    }).then(r => r.json());
    
    return suggestions.averagePrice;
  });
  
  // Handle form submission with progressive enhancement
  async function handleFormSubmission(event: SubmitEvent) {
    event.preventDefault();
    isSubmitting = true;
    
    try {
      const formData = new FormData();
      
      // Add form fields
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
      
      // Add files
      files.forEach(file => formData.append('images', file));
      
      // Use remote form function
      const result = await createProduct(formData);
      
      if (result.success) {
        await goto(`/product/${result.productId}?created=true`);
      }
    } catch (error) {
      errors = { general: error.message };
    } finally {
      isSubmitting = false;
    }
  }
</script>

<!-- Progressive enhancement - works without JS -->
<form 
  method="POST" 
  action="?/createProduct"
  enctype="multipart/form-data"
  onsubmit={handleFormSubmission}
  use:enhance={{
    pending: () => { isSubmitting = true; },
    result: ({ update }) => { isSubmitting = false; update(); }
  }}
>
  <div class="image-upload">
    <input 
      type="file" 
      name="images" 
      multiple 
      accept="image/*"
      onchange={(e) => {
        const target = e.target as HTMLInputElement;
        files = Array.from(target.files || []);
      }}
    />
    
    {#each files as file, index}
      <div class="image-preview">
        <img src={URL.createObjectURL(file)} alt="Preview {index + 1}" />
        <button 
          type="button" 
          onclick={() => {
            files = files.filter((_, i) => i !== index);
          }}
        >
          Remove
        </button>
      </div>
    {/each}
  </div>
  
  <div class="form-field">
    <input
      name="title"
      bind:value={form.title}
      placeholder="What are you selling?"
      required
      class:error={titleError}
    />
    {#if titleError}
      <span class="error-message">{titleError}</span>
    {/if}
  </div>
  
  <div class="form-field">
    <select name="category_id" bind:value={form.category_id} required>
      <option value="">Select category</option>
      {#each categories as category}
        <option value={category.id}>{category.name}</option>
      {/each}
    </select>
    
    <!-- Show featured categories as quick select -->
    <div class="featured-categories">
      <p>Popular categories:</p>
      {#each featuredCategories as category}
        <button 
          type="button"
          class="category-chip"
          onclick={() => { form.category_id = category.id; }}
        >
          {category.name}
        </button>
      {/each}
    </div>
  </div>
  
  <div class="form-field">
    <input
      name="price"
      type="number"
      bind:value={form.price}
      placeholder="Price in cents"
      required
    />
    
    <!-- Show price suggestion -->
    {#if suggestedPrice}
      {#await suggestedPrice then price}
        {#if price}
          <div class="price-suggestion">
            💡 Similar items sell for around ${(price / 100).toFixed(2)}
          </div>
        {/if}
      {/await}
    {/if}
  </div>
  
  <div class="form-field">
    <textarea
      name="description"
      bind:value={form.description}
      placeholder="Describe your item"
      required
    ></textarea>
  </div>
  
  <div class="form-row">
    <select name="condition" bind:value={form.condition}>
      <option value="new">New</option>
      <option value="like-new">Like New</option>
      <option value="good">Good</option>
      <option value="fair">Fair</option>
    </select>
    
    <input
      name="brand"
      bind:value={form.brand}
      placeholder="Brand (optional)"
    />
    
    <input
      name="size"
      bind:value={form.size}
      placeholder="Size (optional)"
    />
    
    <input
      name="color"
      bind:value={form.color}
      placeholder="Color (optional)"
    />
  </div>
  
  <div class="form-field">
    <input
      name="shipping_cost"
      type="number"
      bind:value={form.shipping_cost}
      placeholder="Shipping cost (optional)"
    />
  </div>
  
  {#if errors.general}
    <div class="error-banner">{errors.general}</div>
  {/if}
  
  <div class="form-actions">
    <button type="button" onclick={() => history.back()}>
      Cancel
    </button>
    
    <button 
      type="submit" 
      disabled={isSubmitting || !!titleError}
      class="primary"
    >
      {isSubmitting ? 'Creating listing...' : 'List item'}
    </button>
  </div>
</form>

<!-- Example of using command functions for interactions -->
<div class="listing-actions">
  {#if $page.data.session}
    <button onclick={() => toggleFavorite($page.params.id)}>
      ❤️ Add to favorites
    </button>
  {/if}
</div>

<style>
  .featured-categories {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  
  .category-chip {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 1rem;
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
  }
  
  .category-chip:hover {
    background: var(--color-primary);
    color: white;
  }
  
  .price-suggestion {
    background: var(--color-info);
    padding: 0.5rem;
    border-radius: 0.5rem;
    margin-top: 0.5rem;
    font-size: 0.875rem;
  }
  
  .error-message {
    color: var(--color-error);
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }
  
  .error-banner {
    background: var(--color-error-bg);
    color: var(--color-error);
    padding: 1rem;
    border-radius: 0.5rem;
    margin: 1rem 0;
  }
</style>
```

```typescript
// svelte.config.js - Enable remote functions
import { defineConfig } from '@sveltejs/kit/vite';

export default defineConfig({
  kit: {
    experimental: {
      remoteFunctions: true, // Enable experimental remote functions
    },
  },
  compilerOptions: {
    experimental: {
      async: true, // Enable await in components
    },
  },
});
```

### 4.3 Image Optimization
**Goal**: Fast, optimized image handling

#### Tasks:
- [ ] Implement client-side image compression
- [ ] Add WebP conversion
- [ ] Create responsive image URLs
- [ ] Implement lazy loading
- [ ] Add image CDN integration
- [ ] Create fallback strategies

#### Implementation:
```typescript
// $lib/utils/images.ts
export async function optimizeImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      // Calculate dimensions (max 1920px wide)
      let { width, height } = img;
      if (width > 1920) {
        height = (height / width) * 1920;
        width = 1920;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/webp' }));
          } else {
            reject(new Error('Compression failed'));
          }
        },
        'image/webp',
        0.85 // 85% quality
      );
    };
    
    img.src = URL.createObjectURL(file);
  });
}

// Image component with optimization
export function getOptimizedUrl(url: string, options: ImageOptions) {
  const params = new URLSearchParams({
    w: options.width?.toString() || '',
    h: options.height?.toString() || '',
    q: options.quality?.toString() || '85',
    fit: options.fit || 'cover',
  });
  
  return `${url}?${params}`;
}
```

---

## Phase 5: Stripe Integration & Payments (Week 3)

### 5.1 Stripe Connect Setup
**Goal**: Enable seller payouts via Stripe Connect

#### Tasks:
- [ ] Implement Connect onboarding flow
- [ ] Store account IDs securely
- [ ] Create payout scheduling
- [ ] Implement fee calculation
- [ ] Add tax handling
- [ ] Create financial reporting

#### Implementation:
```typescript
// $lib/stripe/connect.ts
export async function createConnectAccount(userId: string) {
  const account = await stripe.accounts.create({
    type: 'express',
    country: 'US',
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: 'individual',
    metadata: {
      user_id: userId,
    },
  });
  
  // Save to database
  await supabase
    .from('profiles')
    .update({
      stripe_account_id: account.id,
      payout_enabled: false,
    })
    .eq('id', userId);
  
  // Create onboarding link
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${BASE_URL}/dashboard/payments/refresh`,
    return_url: `${BASE_URL}/dashboard/payments/success`,
    type: 'account_onboarding',
  });
  
  return accountLink.url;
}

// Webhook handler for account updates
export async function handleConnectWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'account.updated': {
      const account = event.data.object as Stripe.Account;
      
      await supabase
        .from('profiles')
        .update({
          payout_enabled: account.charges_enabled && account.payouts_enabled,
          stripe_account_status: account.charges_enabled ? 'active' : 'pending',
        })
        .eq('stripe_account_id', account.id);
      
      break;
    }
  }
}
```

### 5.2 Checkout Flow
**Goal**: Secure, PCI-compliant checkout

#### Tasks:
- [ ] Implement Stripe Elements
- [ ] Create payment intent flow
- [ ] Add 3D Secure support
- [ ] Implement order creation
- [ ] Add payment confirmation
- [ ] Create refund handling

#### Implementation:
```typescript
// routes/api/checkout/+server.ts
export async function POST({ request, locals }) {
  const { productId, shippingAddress } = await request.json();
  const { session } = await locals.safeGetSession();
  
  if (!session) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Get product and seller info
  const { data: product } = await supabase
    .from('products')
    .select('*, seller:profiles!seller_id(*)')
    .eq('id', productId)
    .single();
  
  if (!product || product.is_sold) {
    return json({ error: 'Product unavailable' }, { status: 400 });
  }
  
  // Calculate amounts
  const platformFee = Math.round(product.price * 0.1); // 10% platform fee
  const sellerAmount = product.price - platformFee;
  
  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: product.price + (product.shipping_cost || 0),
    currency: 'usd',
    application_fee_amount: platformFee,
    transfer_data: {
      destination: product.seller.stripe_account_id,
    },
    metadata: {
      product_id: productId,
      buyer_id: session.user.id,
      seller_id: product.seller_id,
    },
  });
  
  // Create order record
  const { data: order } = await supabase
    .from('orders')
    .insert({
      product_id: productId,
      buyer_id: session.user.id,
      seller_id: product.seller_id,
      total_amount: product.price + (product.shipping_cost || 0),
      shipping_cost: product.shipping_cost,
      shipping_address: shippingAddress,
      status: 'pending',
      stripe_payment_intent_id: paymentIntent.id,
    })
    .select()
    .single();
  
  return json({
    clientSecret: paymentIntent.client_secret,
    orderId: order.id,
  });
}
```

### 5.3 Subscription Management
**Goal**: Tiered subscriptions for sellers

#### Tasks:
- [ ] Create subscription tiers
- [ ] Implement upgrade/downgrade flow
- [ ] Add usage-based billing
- [ ] Create invoice handling
- [ ] Implement trial periods
- [ ] Add subscription analytics

#### Implementation:
```typescript
// $lib/services/subscriptions.ts
export class SubscriptionService {
  async createSubscription(userId: string, planId: string) {
    // Get user's Stripe customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .single();
    
    // Create customer if needed
    let customerId = profile.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email,
        metadata: { user_id: userId },
      });
      customerId = customer.id;
      
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }
    
    // Get plan details
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();
    
    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: plan.stripe_price_id }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        user_id: userId,
        plan_id: planId,
      },
    });
    
    // Save to database
    await supabase.from('user_subscriptions').insert({
      user_id: userId,
      plan_id: planId,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    });
    
    return subscription;
  }
}
```

---

## Phase 6: Locale & Internationalization (Week 3-4)

### 6.1 Cookie Consolidation
**Goal**: Single source of truth for locale

#### Tasks:
- [ ] Remove legacy cookie names
- [ ] Implement accept-language detection
- [ ] Create locale middleware
- [ ] Add URL-based locale support
- [ ] Implement locale persistence
- [ ] Create language switcher component

#### Implementation:
```typescript
// hooks.server.ts
const localeHandler: Handle = async ({ event, resolve }) => {
  // Clean up legacy cookies
  const legacyCookies = ['driplo_language', 'language', 'lang'];
  legacyCookies.forEach(name => {
    if (event.cookies.get(name)) {
      event.cookies.delete(name, { path: '/' });
    }
  });
  
  // Get locale from cookie or detect
  let locale = event.cookies.get('locale');
  
  if (!locale) {
    // Try URL parameter
    locale = event.url.searchParams.get('locale');
    
    // Try accept-language header
    if (!locale) {
      const acceptLanguage = event.request.headers.get('accept-language');
      if (acceptLanguage) {
        const detected = acceptLanguage
          .split(',')[0]
          .split('-')[0]
          .toLowerCase();
        
        locale = i18n.isAvailableLanguageTag(detected) ? detected : 'en';
      } else {
        locale = 'en';
      }
    }
    
    // Set cookie
    event.cookies.set('locale', locale, {
      path: '/',
      maxAge: 365 * 24 * 60 * 60,
      httpOnly: false,
      sameSite: 'lax',
      secure: !dev,
    });
  }
  
  // Apply locale
  i18n.setLanguageTag(locale as any);
  event.locals.locale = locale;
  
  // Add lang attribute to HTML
  return resolve(event, {
    transformPageChunk: ({ html }) => 
      html.replace('<html', `<html lang="${locale}"`),
  });
};
```

### 6.2 Translation System
**Goal**: Comprehensive i18n with type safety

#### Tasks:
- [ ] Set up Paraglide or similar
- [ ] Create translation keys structure
- [ ] Implement pluralization
- [ ] Add date/time formatting
- [ ] Create currency formatting
- [ ] Implement RTL support preparation

#### Implementation:
```typescript
// $lib/i18n/index.ts
import * as runtime from '@inlang/paraglide-js';
import * as m from './messages';

export const { 
  languageTag, 
  setLanguageTag, 
  isAvailableLanguageTag 
} = runtime;

// Typed message functions
export const t = m;

// Format utilities
export function formatCurrency(amount: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD', // Make dynamic based on user location
  }).format(amount / 100);
}

export function formatDate(date: Date, locale: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function formatRelativeTime(date: Date, locale: string) {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const diff = date.getTime() - Date.now();
  const diffDays = Math.round(diff / (1000 * 60 * 60 * 24));
  
  if (Math.abs(diffDays) < 1) {
    const diffHours = Math.round(diff / (1000 * 60 * 60));
    return rtf.format(diffHours, 'hour');
  }
  
  return rtf.format(diffDays, 'day');
}
```

---

## Phase 7: Performance & Optimization (Week 4)

### 7.1 Load Function Optimization
**Goal**: Fast, efficient data loading

#### SvelteKit Best Practice Applied:
- Use `Promise.all()` for parallel data fetching in load functions
- Apply `depends()` for custom dependency tracking and invalidation
- Implement streaming with promises for progressive loading
- Use server-only loads for sensitive operations
- Apply proper error handling with `error()` helper
- Leverage universal loads where appropriate for client-side navigation

#### Tasks:
- [ ] Implement parallel data fetching using Promise.all in load functions
- [ ] Add request deduplication with custom depends() tracking
- [ ] Create caching strategies using SvelteKit's built-in invalidation
- [ ] Implement streaming SSR with promise returns for skeleton states
- [ ] Add prefetching using data-sveltekit-prefetch attributes
- [ ] Optimize database queries with proper joins and RPC functions

#### Implementation:
```typescript
// routes/product/[id]/+page.server.ts - Server-only for DB access
export async function load({ params, locals, depends, untrack }) {
  // Custom dependency for manual invalidation
  depends('product:detail');
  depends(`product:${params.id}`);
  
  // Parallel fetching with Promise.all (SvelteKit best practice)
  const productPromise = locals.supabase
    .from('products')
    .select(`
      *,
      images:product_images(*),
      category:categories!category_id(name, slug),
      seller:profiles!seller_id(
        username, 
        avatar_url, 
        rating, 
        sales_count
      )
    `)
    .eq('id', params.id)
    .single();

  // Get main product first to get seller_id
  const { data: product, error: productError } = await productPromise;
  
  if (productError) {
    throw error(404, 'Product not found');
  }

  // Now fetch related data in parallel
  const [relatedProducts, sellerProducts] = await Promise.all([
    locals.supabase.rpc('get_related_products', {
      product_id: params.id,
      limit: 8,
    }),
    locals.supabase
      .from('products')
      .select('id, title, price, images:product_images(image_url)')
      .eq('seller_id', product.seller_id)
      .neq('id', params.id)
      .eq('is_active', true)
      .limit(4),
  ]);

  // Fire-and-forget operations (don't block rendering)
  // Use untrack to prevent invalidation from these calls
  untrack(() => {
    locals.supabase
      .rpc('increment_product_view', { product_id: params.id })
      .catch(console.error); // Silent error handling
  });

  // Return streaming promises for progressive loading
  return {
    product,
    // These can be streamed for faster initial render
    relatedProducts: relatedProducts.data || [],
    sellerProducts: sellerProducts.data || [],
    // Stream seller stats separately if complex
    sellerStats: locals.supabase.rpc('get_seller_stats', { 
      seller_id: product.seller_id 
    }),
  };
}

// Universal load for client-side navigation optimization
// routes/product/[id]/+page.ts
export async function load({ data, fetch }) {
  // Return server data directly, add client-side enhancements
  return {
    ...data,
    // Client-side data augmentation if needed
    meta: {
      title: `${data.product.title} - Driplo`,
      description: data.product.description.slice(0, 160),
    }
  };
}
```

### 7.2 Image Performance  
**Goal**: Optimal image loading and display

#### SvelteKit Best Practice Applied:
- Use `@sveltejs/enhanced-img` for automatic optimization
- Implement responsive images with proper `sizes` attribute
- Apply performance-focused image loading strategies
- Prevent layout shift with intrinsic dimensions

#### Tasks:
- [ ] Implement lazy loading with enhanced-img
- [ ] Add progressive image loading with multiple formats (avif, webp)
- [ ] Create srcset for responsive images using enhanced-img
- [ ] Implement WebP with automatic fallbacks
- [ ] Add image preloading for LCP using `fetchpriority="high"`
- [ ] Create image optimization pipeline with build-time processing

#### Implementation:
```svelte
<!-- $lib/components/OptimizedImage.svelte - Using enhanced-img -->
<script lang="ts">
  interface Props {
    src: string;
    alt: string;
    priority?: boolean;
    sizes?: string;
    class?: string;
  }
  
  let { src, alt, priority = false, sizes, class: className = '' }: Props = $props();
  
  // Generate multiple image sizes for enhanced-img
  const imageSizes = '?w=400;800;1200;1600';
  const optimizedSrc = src.includes('?') ? src : src + imageSizes;
</script>

<!-- Use SvelteKit's enhanced-img for automatic optimization -->
<enhanced:img 
  src={optimizedSrc}
  {alt}
  {sizes}
  fetchpriority={priority ? 'high' : 'auto'}
  loading={priority ? 'eager' : 'lazy'}
  class={className}
/>

<!-- For dynamic images not available at build time -->
{#if src.startsWith('http')}
  <img
    src={src}
    {alt}
    {sizes}
    fetchpriority={priority ? 'high' : 'auto'}
    loading={priority ? 'eager' : 'lazy'}
    class={className}
  />
{/if}

<!-- Usage examples -->
<!-- Hero image - critical for LCP -->
<!-- <OptimizedImage 
  src="./hero.jpg" 
  alt="Hero image"
  priority={true}
  sizes="(min-width: 1024px) 1200px, 100vw"
/> -->

<!-- Product grid images - lazy loaded -->
<!-- <OptimizedImage 
  src="./product.jpg"
  alt="Product name"
  sizes="(min-width: 768px) 300px, 200px"
/> -->

// vite.config.js - Enhanced image configuration
import { enhancedImages } from '@sveltejs/enhanced-img';

export default defineConfig({
  plugins: [
    enhancedImages({
      inlineBelow: 1024, // Inline images smaller than 1KB
      quality: {
        avif: 80,
        webp: 85,
        jpeg: 85,
      },
    }),
    svelte(),
  ],
});
```

### 7.3 Bundle Optimization
**Goal**: Minimal JavaScript bundles

#### Tasks:
- [ ] Implement code splitting
- [ ] Add dynamic imports
- [ ] Create vendor chunking strategy
- [ ] Remove unused code
- [ ] Implement tree shaking
- [ ] Add bundle analysis

#### Implementation:
```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['svelte', '@sveltejs/kit'],
          'supabase': ['@supabase/supabase-js', '@supabase/ssr'],
          'stripe': ['@stripe/stripe-js'],
          'ui': ['@repo/ui'],
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? 
            chunkInfo.facadeModuleId.split('/').pop().split('.')[0] : 
            'chunk';
          return `${facadeModuleId}-[hash].js`;
        },
      },
    },
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js', '@stripe/stripe-js'],
  },
});
```

---

## Phase 8: Testing & Quality Assurance (Week 4-5)

### 8.1 Unit Testing
**Goal**: Comprehensive unit test coverage

#### Tasks:
- [ ] Set up Vitest configuration
- [ ] Create test utilities
- [ ] Write service tests
- [ ] Test validation schemas
- [ ] Create store tests
- [ ] Add snapshot testing

#### Implementation:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['**/node_modules/**', '**/dist/**'],
    },
  },
});

// tests/services/products.test.ts
describe('ProductService', () => {
  it('should validate product data', async () => {
    const invalid = { title: '', price: -1 };
    expect(() => ProductSchema.parse(invalid)).toThrow();
  });
  
  it('should create product with valid data', async () => {
    const valid = {
      title: 'Test Product',
      description: 'Description',
      price: 1000,
      category_id: 'cat-1',
      condition: 'good',
    };
    
    const result = await productService.create(valid);
    expect(result.id).toBeDefined();
    expect(result.title).toBe(valid.title);
  });
});
```

### 8.2 Integration Testing
**Goal**: End-to-end flow testing with Playwright

#### Tasks:
- [ ] Set up Playwright configuration
- [ ] Create test database seeding
- [ ] Write auth flow tests
- [ ] Test product listing flow
- [ ] Test checkout process
- [ ] Add visual regression tests

#### Implementation:
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should complete signup flow', async ({ page }) => {
    await page.goto('/signup');
    
    // Fill form
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.fill('[name="username"]', 'testuser');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should redirect to email verification
    await expect(page).toHaveURL('/verify-email');
    await expect(page.locator('text=Check your email')).toBeVisible();
  });
  
  test('should complete onboarding', async ({ page, context }) => {
    // Set auth cookie
    await context.addCookies([
      {
        name: 'sb-auth-token',
        value: 'test-token',
        domain: 'localhost',
        path: '/',
      },
    ]);
    
    await page.goto('/onboarding');
    
    // Step 1: Profile
    await page.fill('[name="full_name"]', 'Test User');
    await page.fill('[name="bio"]', 'Test bio');
    await page.click('button:has-text("Next")');
    
    // Step 2: Avatar
    await page.setInputFiles('input[type="file"]', 'tests/fixtures/avatar.jpg');
    await page.click('button:has-text("Next")');
    
    // Step 3: Preferences
    await page.click('[name="newsletter"]');
    await page.click('button:has-text("Complete")');
    
    // Should redirect to home with welcome modal
    await expect(page).toHaveURL('/');
    await expect(page.locator('.welcome-modal')).toBeVisible();
  });
});
```

### 8.3 Performance Testing
**Goal**: Ensure performance benchmarks are met

#### Tasks:
- [ ] Set up Lighthouse CI
- [ ] Create performance budgets
- [ ] Add Core Web Vitals monitoring
- [ ] Implement load testing
- [ ] Add database query analysis
- [ ] Create performance regression tests

#### Implementation:
```javascript
// .lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:5173/',
        'http://localhost:5173/browse',
        'http://localhost:5173/product/sample',
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

---

## Phase 9: Security & Compliance (Week 5)

### 9.1 Security Hardening
**Goal**: Production-grade security measures

#### Tasks:
- [ ] Implement CSRF protection
- [ ] Add rate limiting
- [ ] Create input sanitization
- [ ] Implement CSP headers
- [ ] Add SQL injection prevention
- [ ] Create security headers

#### Implementation:
```typescript
// $lib/security/index.ts
export const securityHeaders: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CSP
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://api.stripe.com",
    "frame-src https://js.stripe.com https://hooks.stripe.com",
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  return response;
};

// Rate limiting
import { RateLimiter } from 'sveltekit-rate-limiter/server';

export const authLimiter = new RateLimiter({
  IP: [5, 'm'], // 5 requests per minute per IP
  IPUA: [10, 'm'], // 10 requests per minute per IP+User Agent
});

export const apiLimiter = new RateLimiter({
  IP: [100, 'm'], // 100 requests per minute
  cookie: {
    name: 'session',
    rate: [200, 'm'], // 200 per minute for authenticated users
  },
});
```

### 9.2 Data Privacy
**Goal**: GDPR/CCPA compliance

#### Tasks:
- [ ] Implement cookie consent
- [ ] Create privacy controls
- [ ] Add data export functionality
- [ ] Implement account deletion
- [ ] Create audit logging
- [ ] Add data retention policies

#### Implementation:
```typescript
// $lib/privacy/gdpr.ts
export class PrivacyService {
  async exportUserData(userId: string) {
    const data = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('products').select('*').eq('seller_id', userId),
      supabase.from('orders').select('*').eq('buyer_id', userId),
      supabase.from('messages').select('*').or(`sender_id.eq.${userId},receiver_id.eq.${userId}`),
    ]);
    
    return {
      profile: data[0].data,
      products: data[1].data,
      orders: data[2].data,
      messages: data[3].data,
      exported_at: new Date().toISOString(),
    };
  }
  
  async deleteUserAccount(userId: string) {
    // Soft delete with anonymization
    await supabase.rpc('anonymize_user', { user_id: userId });
    
    // Schedule hard delete after retention period
    await supabase.from('deletion_queue').insert({
      user_id: userId,
      scheduled_for: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });
    
    // Delete auth account
    await supabase.auth.admin.deleteUser(userId);
  }
}
```

---

### 9.3 SEO & Accessibility Implementation
**Goal**: Search engine optimization and accessibility compliance

#### SvelteKit Best Practice Applied:
- Use SSR by default for reliable content indexing
- Implement dynamic metadata through page load functions
- Apply built-in accessibility features (route announcements, focus management)
- Generate structured data and sitemaps using server endpoints
- Optimize Core Web Vitals for ranking factors

#### Tasks:
- [ ] Implement dynamic meta tags using load functions
- [ ] Create XML sitemap generation through server endpoints
- [ ] Add structured data (JSON-LD) for products and organization
- [ ] Implement accessibility features (ARIA labels, focus management)
- [ ] Configure language support through server hooks
- [ ] Set up Core Web Vitals monitoring

#### Implementation:
```typescript
// routes/+layout.server.ts - SEO data in root layout
export async function load({ url, locals }) {
  return {
    seo: {
      title: 'Driplo - Buy & Sell Pre-loved Fashion',
      description: 'Discover unique fashion finds on Driplo marketplace',
      url: url.toString(),
      siteName: 'Driplo',
    }
  };
}

// routes/product/[id]/+page.server.ts - Product-specific SEO
export async function load({ params, locals, depends }) {
  depends('product:seo');
  
  const { data: product } = await locals.supabase
    .from('products')
    .select(`
      title, description, price, 
      images:product_images(image_url),
      seller:profiles!seller_id(username),
      category:categories!category_id(name)
    `)
    .eq('id', params.id)
    .single();

  if (!product) throw error(404, 'Product not found');

  // Return SEO data
  return {
    product,
    seo: {
      title: `${product.title} - ${product.seller.username} | Driplo`,
      description: product.description.slice(0, 160),
      image: product.images[0]?.image_url,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        description: product.description,
        offers: {
          '@type': 'Offer',
          price: product.price / 100,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        seller: {
          '@type': 'Person',
          name: product.seller.username,
        },
        category: product.category.name,
      }
    }
  };
}
```

```svelte
<!-- routes/+layout.svelte - SEO head management -->
<script lang="ts">
  import { page } from '$app/stores';
  
  // Access SEO data from layout or page load
  $: seo = $page.data.seo || {};
  $: structuredData = $page.data.seo?.structuredData;
</script>

<svelte:head>
  <title>{seo.title}</title>
  <meta name="description" content={seo.description} />
  
  <!-- Open Graph -->
  <meta property="og:title" content={seo.title} />
  <meta property="og:description" content={seo.description} />
  <meta property="og:url" content={seo.url} />
  <meta property="og:site_name" content={seo.siteName} />
  {#if seo.image}
    <meta property="og:image" content={seo.image} />
  {/if}
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={seo.title} />
  <meta name="twitter:description" content={seo.description} />
  
  <!-- Structured Data -->
  {#if structuredData}
    {@html `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`}
  {/if}
</svelte:head>

<!-- Accessibility: Skip to main content -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<Header />
<main id="main-content" tabindex="-1">
  <slot />
</main>
<Footer />

<style>
  .skip-link {
    position: absolute;
    top: -40px;
    left: 6px;
    background: var(--color-primary);
    color: white;
    padding: 8px;
    text-decoration: none;
    transition: top 0.3s;
  }
  
  .skip-link:focus {
    top: 6px;
  }
</style>
```

```typescript
// routes/sitemap.xml/+server.ts - Dynamic sitemap generation
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  // Get all active products for sitemap
  const { data: products } = await locals.supabase
    .from('products')
    .select('id, updated_at')
    .eq('is_active', true)
    .order('updated_at', { ascending: false });

  const baseUrl = 'https://driplo.com';
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <!-- Static pages -->
      <url>
        <loc>${baseUrl}</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      <url>
        <loc>${baseUrl}/browse</loc>
        <changefreq>hourly</changefreq>
        <priority>0.8</priority>
      </url>
      
      <!-- Product pages -->
      ${products?.map(product => `
        <url>
          <loc>${baseUrl}/product/${product.id}</loc>
          <lastmod>${product.updated_at}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.7</priority>
        </url>
      `).join('')}
    </urlset>`.trim();

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=3600', // Cache for 1 hour
    },
  });
};

// hooks.server.ts - Language support
const languageHandler: Handle = async ({ event, resolve }) => {
  // Get locale from cookie or header
  const locale = event.cookies.get('locale') || 
    event.request.headers.get('accept-language')?.split(',')[0]?.split('-')[0] || 
    'en';
  
  // Set language attribute in HTML
  return resolve(event, {
    transformPageChunk: ({ html }) => 
      html.replace('<html', `<html lang="${locale}"`),
  });
};
```

### 9.4 Page Configuration Optimization
**Goal**: Optimal rendering strategy for each page type

#### SvelteKit Best Practice Applied:
- Configure prerender for static content (about, terms, privacy)
- Control SSR/CSR based on page requirements
- Optimize SEO with proper rendering strategies
- Use route-specific configurations for performance

#### Tasks:
- [ ] Configure prerendering for static pages
- [ ] Set up SSR/CSR controls per route type
- [ ] Optimize SEO pages with full server rendering
- [ ] Configure trailing slash behavior
- [ ] Set up proper cache headers per page type

#### Implementation:
```typescript
// routes/(marketing)/about/+page.ts
export const prerender = true; // Static content, prerender at build time
export const ssr = true;       // SEO important
export const csr = false;      // No interactivity needed

// routes/(auth)/login/+page.ts
export const prerender = false; // Dynamic content
export const ssr = true;        // SEO important, meta tags
export const csr = true;        // Form interactivity

// routes/(protected)/dashboard/+page.ts
export const prerender = false; // User-specific data
export const ssr = false;       // No SEO needed, private page
export const csr = true;        // Rich interactivity

// routes/product/[id]/+page.ts
export const prerender = 'auto'; // Prerender popular products
export const ssr = true;         // SEO critical
export const csr = true;         // Interactive features

// routes/api/products/+server.ts
export const prerender = false; // API endpoint, dynamic
// No SSR/CSR config needed for server routes
```

---

## Phase 10: Deployment & Monitoring (Week 5-6)

### 10.1 Deployment Configuration
**Goal**: Reliable, scalable deployment

#### Tasks:
- [ ] Configure Vercel deployment
- [ ] Set up preview deployments
- [ ] Create production environment
- [ ] Configure edge functions
- [ ] Set up CDN
- [ ] Implement rollback strategy

#### Implementation:
```json
// vercel.json
{
  "functions": {
    "routes/**/*.js": {
      "maxDuration": 10
    }
  },
  "regions": ["iad1"],
  "env": {
    "ENABLE_EXPERIMENTAL_COREPACK": "1"
  },
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "framework": "sveltekit",
  "rewrites": [
    {
      "source": "/api/health",
      "destination": "/api/health"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/(.*).(js|css|ico|png|jpg|jpeg|webp|svg|woff|woff2)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 10.2 Monitoring Setup
**Goal**: Comprehensive observability

#### Tasks:
- [ ] Configure Sentry error tracking
- [ ] Set up performance monitoring
- [ ] Create custom metrics
- [ ] Implement logging strategy
- [ ] Add uptime monitoring
- [ ] Create alerting rules

#### Implementation:
```typescript
// $lib/monitoring/index.ts
import * as Sentry from '@sentry/sveltekit';

export function initMonitoring() {
  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: dev ? 'development' : 'production',
      integrations: [
        new Sentry.BrowserTracing({
          tracingOrigins: ['localhost', /^\//],
        }),
        new Sentry.Replay({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      tracesSampleRate: dev ? 1.0 : 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      beforeSend(event, hint) {
        // Filter sensitive data
        if (event.request?.cookies) {
          event.request.cookies = '[FILTERED]';
        }
        return event;
      },
    });
  }
  
  // Custom metrics
  if (browser) {
    // Web Vitals
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(metric => trackMetric('CLS', metric.value));
      getFID(metric => trackMetric('FID', metric.value));
      getFCP(metric => trackMetric('FCP', metric.value));
      getLCP(metric => trackMetric('LCP', metric.value));
      getTTFB(metric => trackMetric('TTFB', metric.value));
    });
  }
}

function trackMetric(name: string, value: number) {
  // Send to analytics
  if (window.gtag) {
    window.gtag('event', 'web_vitals', {
      event_category: 'Performance',
      event_label: name,
      value: Math.round(name === 'CLS' ? value * 1000 : value),
    });
  }
  
  // Send to Sentry
  Sentry.addBreadcrumb({
    category: 'performance',
    message: `${name}: ${value}`,
    level: 'info',
  });
}
```

---

## 🚨 CRITICAL: Turborepo-Safe Execution Strategy

### Principles for Safe Refactoring
1. **NEVER break the build pipeline** - Preserve existing turbo tasks
2. **One change at a time** - Test each change thoroughly  
3. **Keep packages/ui minimal** - Remove duplicate components, don't add more
4. **Use route groups** - Move files, don't rewrite them
5. **Enhance, don't replace** - Build on existing foundation

### ⚠️ What NOT to Touch
- `turbo.json` - Keep build pipeline intact
- `packages/*/package.json` - Don't change dependencies without testing
- Existing component APIs in `packages/ui` - Enhance, don't break

### ✅ Safe to Modify
- Add new routes with proper grouping `(auth)`, `(protected)`, `(admin)`
- Fix TypeScript errors gradually
- Add server-only modules in `$lib/server/`
- Enhance existing forms with better validation
- Add error boundaries without breaking routing

## Incremental Implementation (SAFE MODE)

### Week 1: Foundation (NO BREAKING CHANGES)
```bash
# Safe TypeScript improvements
- Enable strict mode in apps/web/tsconfig.json only
- Generate types: pnpm db:types 
- Add apps/web/src/lib/env.ts for validation
- Create apps/web/src/routes/+error.svelte

# Test: pnpm build && pnpm dev should still work
```

### Week 2: Route Organization (FILE MOVES ONLY)
```bash
# Use SvelteKit route groups - just move files
mkdir -p apps/web/src/routes/{(auth),(protected),(admin)}
mv apps/web/src/routes/login apps/web/src/routes/(auth)/login
mv apps/web/src/routes/signup apps/web/src/routes/(auth)/signup
mv apps/web/src/routes/sell apps/web/src/routes/(protected)/sell
mv apps/web/src/routes/dashboard apps/web/src/routes/(protected)/dashboard

# Update imports, test everything still works
```

### Week 3: Security & Server-Only (ADD FILES ONLY)
```bash
# Move sensitive code to server-only modules
mkdir -p apps/web/src/lib/server
# Create new files, don't modify existing ones initially
```

### Week 4: UI Package Cleanup (REMOVE DUPLICATES)
```bash
# Delete these duplicates from packages/ui/src/:
rm CookieConsentAdvanced.svelte CookieConsentPro.svelte SimpleCookieConsent.svelte
# Keep only: CookieConsent.svelte, UnifiedCookieConsent.svelte

# Update packages/ui/src/index.ts exports
# Test: pnpm build --filter @repo/ui
```

### Week 5: Form & Payment Enhancement (ENHANCE EXISTING)
```bash
# Don't rewrite sell page, just enhance it
# Add proper validation to existing form
# Improve error handling in existing flows
# Add Stripe webhook handling to existing endpoints
```

## Quick Start Commands

### Prerequisites Check
```bash
# Ensure everything builds currently
pnpm build

# Ensure dev works
pnpm dev

# Check for TypeScript errors
pnpm check-types
```

### Phase 1 Execution
```bash
# 1. Enable strict TypeScript
echo '{"compilerOptions": {"strict": true}}' > apps/web/tsconfig.json

# 2. Generate fresh Supabase types  
pnpm db:types

# 3. Test the build
pnpm build

# If build fails, revert and fix issues one by one
```

---

## Success Metrics

### Performance
- [ ] Lighthouse score > 90
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Bundle size < 200KB (initial)

### Reliability
- [ ] 99.9% uptime
- [ ] < 1% error rate
- [ ] < 500ms p95 response time
- [ ] Zero security vulnerabilities

### Business
- [ ] < 2% cart abandonment
- [ ] > 80% onboarding completion
- [ ] < 24h support response time
- [ ] > 4.5 star user satisfaction

---

## Risk Mitigation

### Technical Risks
- **Database performance**: Implement caching, optimize queries
- **Payment failures**: Add retry logic, fallback payment methods
- **Image storage costs**: Implement compression, CDN caching
- **Scaling issues**: Use edge functions, implement rate limiting

### Business Risks
- **User adoption**: A/B testing, gradual rollout
- **Compliance**: Legal review, automated compliance checks
- **Competition**: Fast iteration, user feedback loops
- **Revenue**: Multiple monetization streams

---

## Maintenance Plan

### Daily
- Monitor error rates
- Check payment processing
- Review security alerts

### Weekly
- Performance analysis
- Database optimization
- Dependency updates

### Monthly
- Security audit
- Cost optimization
- Feature planning

### Quarterly
- Major updates
- Architecture review
- Disaster recovery testing

---

## Conclusion

This comprehensive refactor plan transforms Driplo into a production-ready, scalable marketplace. By following this methodical approach, we ensure security, performance, and maintainability while delivering an exceptional user experience.

The plan emphasizes:
- **Security first**: Every component is built with security in mind
- **Performance optimized**: Fast load times and smooth interactions
- **Developer friendly**: Clear patterns and comprehensive testing
- **Business ready**: Scalable architecture with monitoring and analytics

Success depends on disciplined execution, continuous testing, and rapid iteration based on user feedback.

---

## Reviewer Audit & Comment (Assistant)

### Summary
- Overall, the plan is thorough, phased, and aligned with SvelteKit/Supabase best practices. Strong emphasis on DX, SSR auth, and safe turborepo execution is appreciated. The main risks center on experimental features, payment complexity, and operational hardening.

### High-Risk Areas
- Remote Functions (experimental): Keep optional behind a flag with clear fallbacks to conventional `load`/actions to avoid blocking releases.
- Stripe Connect details: Decide account type (Express vs. Custom), charge model (destination vs. separate), required capabilities, and onboarding states. Enforce idempotency keys and replay protection on all payment mutations.
- Edge vs. Node runtime: Verify Supabase client behavior on Vercel Edge; if any limitations arise (e.g., libraries expecting Node APIs), prefer Node adapter for sensitive endpoints or isolate edge-safe code paths.
- Cookie security/compat: `SameSite=None` requires `Secure`; preview/dev on HTTP can fail. Avoid UA heuristics if possible; document environment-specific cookie behavior and test on iOS Safari/Chrome.
- RLS correctness: Ensure all reads/writes enforce RLS policies; never rely solely on route guards or `profile.role`. Admin actions must use server-only service role and keep the service-key strictly server-side.

### Critical Gaps
- Account lifecycle: Define seller onboarding flow (KYC, disabled states, payouts)
- Rate limiting: Add per-IP and per-user limits on auth, listing, and payment endpoints
- Secrets & rotation: Document source-of-truth, rotation cadence, and access controls
- Observability: Add PII/secret scrubbing policy and correlation IDs

### Testing Requirements
- Payments: E2E flows with Stripe Test Clocks, webhook verification, idempotency tests
- Auth/SSR: Email verification, session refresh, protected route redirects
- RLS: Policy tests asserting unauthorized access is denied

### Operational Checklist
- Document Supabase backup/restore procedures
- Set SLO alert thresholds (p95 > 500ms, error rate > 1%)
- Feature flags for risky features (remote functions, new payment flows)
- Health/ready endpoints for monitoring

### Final Comment
The plan is strong and execution-focused. De-risk Remote Functions behind a flag, lock down Stripe Connect decisions early, and shore up RLS/rate-limiting/runbooks for stable production.
