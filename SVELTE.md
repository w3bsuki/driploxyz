# SvelteKit Best Practices & Reference Guide

## Table of Contents
1. [Quick Reference](#quick-reference)
2. [Project Structure & Organization](#project-structure--organization)
3. [Performance Optimization](#performance-optimization)
4. [Authentication & Security](#authentication--security)
5. [Routing & Navigation](#routing--navigation)
6. [Data Loading Patterns](#data-loading-patterns)
7. [Form Handling & Actions](#form-handling--actions)
8. [State Management](#state-management)
9. [Assets & Media](#assets--media)
10. [Accessibility](#accessibility)
11. [SEO Optimization](#seo-optimization)
12. [Hooks & Middleware](#hooks--middleware)
13. [Server-Only Modules](#server-only-modules)
14. [Development Tools & MCPs](#development-tools--mcps)

---

## Quick Reference

### Essential Svelte 5 Runes (NEVER use legacy syntax)
```typescript
// ✅ State management
let count = $state(0);
let user = $state({ name: 'John', email: '' });

// ✅ Derived/computed values
let doubled = $derived(count * 2);
let isValidEmail = $derived(user.email.includes('@'));

// ✅ Component props
interface Props {
  title: string;
  variant?: 'primary' | 'secondary';
  children?: import('svelte').Snippet;
}
let { title, variant = 'primary', children }: Props = $props();

// ✅ Two-way binding
let { value = $bindable() }: Props = $props();

// ✅ Effects for side effects
$effect(() => {
  console.log('Count changed:', count);
});

// ✅ Cleanup effects
$effect(() => {
  const interval = setInterval(() => count++, 1000);
  return () => clearInterval(interval);
});
```

### Page Configuration Options
```typescript
// +page.js or +layout.js
export const prerender = true;        // Generate static HTML
export const ssr = false;             // Disable server-side rendering
export const csr = true;              // Enable client-side rendering
export const trailingSlash = 'always';// URL handling
export const config = {
  runtime: 'edge'                      // Platform-specific config
};
```

### Essential Navigation
```typescript
import { page } from '$app/stores';
import { goto, invalidateAll } from '$app/navigation';
import { afterNavigate, beforeNavigate } from '$app/navigation';

// Navigation with replace
goto('/dashboard', { replaceState: true });

// Invalidate data
invalidateAll();

// Navigation guards
beforeNavigate(({ to, cancel }) => {
  if (hasUnsavedChanges) cancel();
});
```

---

## Project Structure & Organization

### Recommended Directory Structure
```
my-sveltekit-app/
├── src/
│   ├── lib/                    # Reusable code
│   │   ├── components/         # Shared components
│   │   │   ├── ui/            # Basic UI components
│   │   │   ├── forms/         # Form components
│   │   │   └── layout/        # Layout components
│   │   ├── stores/            # Svelte stores
│   │   ├── utils/             # Utility functions
│   │   ├── types/             # TypeScript interfaces
│   │   └── server/            # Server-only modules
│   ├── params/                # Route parameter matchers
│   ├── routes/                # Application routes
│   │   ├── (auth)/           # Route groups
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── api/              # API routes
│   │   │   ├── auth/
│   │   │   └── products/
│   │   ├── products/
│   │   │   └── [id]/
│   │   └── dashboard/
│   ├── app.html              # Page template
│   ├── error.html            # Error fallback
│   ├── hooks.client.js       # Client hooks
│   └── hooks.server.js       # Server hooks
├── static/                   # Static assets
│   ├── favicon.png
│   ├── robots.txt
│   └── images/
├── tests/                    # Test files
├── package.json
├── svelte.config.js
├── vite.config.js
└── tsconfig.json
```

### Configuration Files
```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-auto';

export default {
  kit: {
    adapter: adapter(),
    alias: {
      '$components': 'src/lib/components',
      '$stores': 'src/lib/stores',
      '$utils': 'src/lib/utils',
      '$types': 'src/lib/types'
    }
  }
};
```

```json
// tsconfig.json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true
  }
}
```

---

## Performance Optimization

### Out-of-the-Box Optimizations
SvelteKit provides these optimizations by default:
- Code-splitting for automatic bundle optimization
- Asset preloading for faster page loads  
- File hashing for eternal caching
- Request coalescing to prevent duplicate requests
- Parallel data loading across routes
- Data inlining for reduced network requests
- Conservative invalidation strategies
- Prerendering for static content
- Automatic link preloading

### Asset Optimization

#### Enhanced Images
```typescript
// Install enhanced image support
// npm install @sveltejs/enhanced-img

// Use responsive images with automatic optimization
<enhanced:img 
  src="./product.png?w=1280;640;400" 
  sizes="(min-width:1920px) 1280px, (min-width:768px) 640px, 400px"
  alt="Product image"
  fetchpriority="high"
/>
```

#### Font Optimization
```javascript
// hooks.server.js - Preload fonts
export function handle({ event, resolve }) {
  return resolve(event, {
    preload: ({ type, path }) => type === 'font'
  });
}
```

#### Bundle Analysis
```bash
# Install bundle analyzer
npm install --save-dev rollup-plugin-visualizer

# Add to vite.config.js
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  plugins: [
    sveltekit(),
    visualizer({ open: true, gzipSize: true })
  ]
};
```

### Navigation Preloading
```typescript
// Preload data on hover
<a href="/products" data-sveltekit-preload-data="hover">Products</a>

// Preload code when in viewport
<a href="/about" data-sveltekit-preload-code="viewport">About</a>

// Preload both data and code immediately
<a href="/dashboard" data-sveltekit-preload-data data-sveltekit-preload-code>
  Dashboard
</a>
```

### Dynamic Imports
```typescript
// Lazy load components
const LazyComponent = lazy(() => import('./LazyComponent.svelte'));

// Conditional loading
async function loadFeature() {
  if (userHasPermission) {
    const { AdminPanel } = await import('./AdminPanel.svelte');
    return AdminPanel;
  }
}
```

---

## Authentication & Security

### Session-Based Authentication
```typescript
// lib/server/auth.js
interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
}

export async function createSession(userId: string): Promise<Session> {
  const session = {
    id: crypto.randomUUID(),
    userId,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  };
  
  await db.insert('sessions', session);
  return session;
}

export async function validateSession(sessionId: string) {
  const session = await db.query('SELECT * FROM sessions WHERE id = ?', [sessionId]);
  
  if (!session || session.expiresAt < new Date()) {
    return null;
  }
  
  return session;
}
```

### Authentication Hook
```typescript
// hooks.server.js
export async function handle({ event, resolve }) {
  // Get session from cookie
  const sessionId = event.cookies.get('session');
  
  if (sessionId) {
    const session = await validateSession(sessionId);
    if (session) {
      event.locals.user = await getUser(session.userId);
      event.locals.session = session;
    }
  }
  
  return resolve(event);
}
```

### Protected Routes
```typescript
// routes/dashboard/+layout.server.js
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
  if (!locals.user) {
    throw redirect(303, '/login');
  }
  
  return {
    user: locals.user
  };
}
```

### JWT Token Authentication
```typescript
import jwt from 'jsonwebtoken';

export async function handle({ event, resolve }) {
  const token = event.cookies.get('jwt');
  
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      event.locals.user = payload;
    } catch (error) {
      // Invalid token - clear it
      event.cookies.delete('jwt', { path: '/' });
    }
  }
  
  return resolve(event);
}
```

### Lucia Integration
```bash
# Add Lucia authentication
npx sv add lucia
```

```typescript
// lib/server/lucia.js
import { Lucia } from 'lucia';
import { dev } from '$app/environment';

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: !dev
    }
  }
});
```

---

## Routing & Navigation

### File-Based Routing
```
src/routes/
├── +layout.svelte                    # Root layout
├── +page.svelte                      # Homepage (/)
├── about/
│   └── +page.svelte                  # /about
├── products/
│   ├── +layout.svelte               # Layout for all product pages
│   ├── +page.svelte                 # /products
│   ├── [id]/
│   │   ├── +page.svelte            # /products/123
│   │   └── edit/
│   │       └── +page.svelte        # /products/123/edit
│   └── [[page]]/                   # Optional parameters
│       └── +page.svelte            # /products or /products/2
├── (auth)/                         # Route groups (no URL impact)
│   ├── +layout.svelte             # Layout for auth pages
│   ├── login/
│   │   └── +page.svelte           # /login
│   └── signup/
│       └── +page.svelte           # /signup
└── admin/
    └── [...path]/                 # Catch-all route
        └── +page.svelte           # /admin/anything/here
```

### Dynamic Route Parameters
```typescript
// routes/products/[id]/+page.js
export async function load({ params, fetch }) {
  const product = await fetch(`/api/products/${params.id}`).then(r => r.json());
  
  if (!product) {
    throw error(404, 'Product not found');
  }
  
  return { product };
}
```

### Optional Parameters
```typescript
// routes/blog/[[page]]/+page.js
export async function load({ params, url }) {
  const page = params.page ? parseInt(params.page) : 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  
  const posts = await getPosts({ limit, offset });
  const total = await getPostsCount();
  
  return {
    posts,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasNext: offset + limit < total,
      hasPrevious: page > 1
    }
  };
}
```

### Route Groups
```typescript
// (auth)/+layout.svelte - Shared layout without affecting URL
<div class="auth-container">
  <header>
    <h1>Authentication</h1>
  </header>
  <main>
    <slot />
  </main>
</div>
```

### Parameter Matching
```typescript
// src/params/uuid.js
export function match(param) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(param);
}

// Use in routes: products/[id=uuid]/+page.svelte
```

---

## Data Loading Patterns

### Universal vs Server Load Functions
```typescript
// +page.js (Universal - runs everywhere)
export async function load({ fetch, params }) {
  const response = await fetch(`/api/posts/${params.id}`);
  
  if (!response.ok) {
    throw error(404, 'Post not found');
  }
  
  return {
    post: await response.json()
  };
}

// +page.server.js (Server-only - access to secrets/database)
import { db } from '$lib/server/database';

export async function load({ params }) {
  const post = await db.query(
    'SELECT * FROM posts WHERE id = $1',
    [params.id]
  );
  
  if (!post.length) {
    throw error(404, 'Post not found');
  }
  
  return {
    post: post[0]
  };
}
```

### Parallel Data Loading
```typescript
export async function load({ fetch, params }) {
  // Run these requests in parallel
  const [postResponse, commentsResponse, relatedResponse] = await Promise.all([
    fetch(`/api/posts/${params.id}`),
    fetch(`/api/posts/${params.id}/comments`),
    fetch(`/api/posts/${params.id}/related`)
  ]);
  
  return {
    post: await postResponse.json(),
    comments: await commentsResponse.json(),
    related: await relatedResponse.json()
  };
}
```

### Streaming Data
```typescript
export async function load({ fetch, params }) {
  // Essential data loads immediately
  const post = await fetch(`/api/posts/${params.id}`).then(r => r.json());
  
  return {
    post,
    // These stream in later (Promise resolved on client)
    comments: fetch(`/api/posts/${params.id}/comments`).then(r => r.json()),
    analytics: fetch(`/api/posts/${params.id}/analytics`).then(r => r.json())
  };
}
```

### Data Invalidation
```typescript
import { invalidate, invalidateAll } from '$app/navigation';

// Invalidate specific data
await invalidate('/api/posts');

// Invalidate all data
await invalidateAll();

// Invalidate data that depends on a specific value
await invalidate((url) => url.pathname.startsWith('/api/user'));
```

---

## Form Handling & Actions

### Basic Form Actions
```typescript
// +page.server.js
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const formData = {
      email: data.get('email'),
      password: data.get('password')
    };
    
    // Validate input
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      return fail(400, {
        errors: result.error.flatten().fieldErrors,
        data: formData
      });
    }
    
    // Authenticate user
    const user = await authenticateUser(result.data.email, result.data.password);
    
    if (!user) {
      return fail(400, {
        errors: { email: ['Invalid credentials'] },
        data: formData
      });
    }
    
    // Set session
    const session = await createSession(user.id);
    cookies.set('session', session.id, { 
      path: '/', 
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });
    
    throw redirect(303, '/dashboard');
  }
};
```

### Named Actions
```typescript
export const actions = {
  login: async ({ request, cookies }) => {
    // Handle login
  },
  
  register: async ({ request }) => {
    // Handle registration
  },
  
  logout: async ({ cookies }) => {
    cookies.delete('session', { path: '/' });
    throw redirect(303, '/');
  }
};
```

### Progressive Enhancement
```svelte
<script>
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  
  let { form } = $props();
  let loading = $state(false);
</script>

<form 
  method="POST" 
  action="?/login"
  use:enhance={() => {
    loading = true;
    
    return async ({ result, update }) => {
      loading = false;
      
      if (result.type === 'success') {
        // Handle success
      } else if (result.type === 'failure') {
        // Handle validation errors
      }
      
      // Apply default behavior
      update();
    };
  }}
>
  <div class="field">
    <label for="email">Email</label>
    <input 
      id="email"
      name="email" 
      type="email" 
      value={form?.data?.email ?? ''}
      required 
    />
    {#if form?.errors?.email}
      <span class="error">{form.errors.email[0]}</span>
    {/if}
  </div>
  
  <div class="field">
    <label for="password">Password</label>
    <input 
      id="password"
      name="password" 
      type="password" 
      required 
    />
    {#if form?.errors?.password}
      <span class="error">{form.errors.password[0]}</span>
    {/if}
  </div>
  
  <button type="submit" disabled={loading}>
    {loading ? 'Logging in...' : 'Log in'}
  </button>
</form>
```

### File Upload Handling
```typescript
export const actions = {
  upload: async ({ request }) => {
    const data = await request.formData();
    const file = data.get('file') as File;
    
    if (!file || file.size === 0) {
      return fail(400, { error: 'No file uploaded' });
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return fail(400, { error: 'Invalid file type' });
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return fail(400, { error: 'File too large' });
    }
    
    const buffer = await file.arrayBuffer();
    const filename = `${crypto.randomUUID()}.${file.name.split('.').pop()}`;
    
    // Save file
    await saveFile(filename, buffer);
    
    return { success: true, filename };
  }
};
```

---

## State Management

### Avoid Shared Server State
```typescript
// ❌ Don't do this - shared mutable state on server
let users = [];

export async function load() {
  users = await getUsers(); // This affects all requests!
  return { users };
}

// ✅ Do this instead - no shared state
export async function load() {
  const users = await getUsers();
  return { users };
}
```

### Component State with Context
```typescript
// Parent component
import { setContext } from 'svelte';

let cartItems = $state([]);

const cartContext = {
  get items() { return cartItems; },
  addItem: (item) => cartItems.push(item),
  removeItem: (id) => cartItems = cartItems.filter(i => i.id !== id),
  clearCart: () => cartItems = []
};

setContext('cart', cartContext);
```

```typescript
// Child component
import { getContext } from 'svelte';

const cart = getContext('cart');

function addToCart() {
  cart.addItem({ id: '1', name: 'Product', price: 29.99 });
}
```

### URL-Based State Management
```typescript
// Read state from URL
import { page } from '$app/stores';

let searchQuery = $derived(page.url.searchParams.get('q') ?? '');
let currentPage = $derived(parseInt(page.url.searchParams.get('page') ?? '1'));
let selectedCategory = $derived(page.url.searchParams.get('category') ?? 'all');

// Update URL with new state
import { goto } from '$app/navigation';

function updateFilters(filters: Record<string, string>) {
  const url = new URL($page.url);
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
  });
  
  goto(url, { keepFocus: true, noScroll: true });
}
```

### Global Stores
```typescript
// lib/stores/user.svelte.js
import { browser } from '$app/environment';

class UserStore {
  user = $state(null);
  loading = $state(false);
  
  async login(credentials) {
    this.loading = true;
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (response.ok) {
        this.user = await response.json();
        if (browser) {
          localStorage.setItem('user', JSON.stringify(this.user));
        }
      }
    } finally {
      this.loading = false;
    }
  }
  
  logout() {
    this.user = null;
    if (browser) {
      localStorage.removeItem('user');
    }
  }
  
  initialize() {
    if (browser && !this.user) {
      const stored = localStorage.getItem('user');
      if (stored) {
        this.user = JSON.parse(stored);
      }
    }
  }
}

export const userStore = new UserStore();
```

---

## Assets & Media

### Images
```typescript
// Use enhanced-img for automatic optimization
<enhanced:img 
  src="./hero-image.jpg?w=1920;1280;640;400" 
  sizes="(min-width: 1920px) 1920px, (min-width: 1280px) 1280px, (min-width: 640px) 640px, 400px"
  alt="Hero image"
  fetchpriority="high"
  loading="eager"
/>

// Regular images with manual optimization
<img 
  src="/images/product.jpg"
  alt="Product name"
  width="400"
  height="300"
  loading="lazy"
/>
```

### Icons - CSS-Based (Recommended)
```typescript
// Use Iconify for CSS-based icons
import { Icon } from '@iconify/svelte';

<Icon icon="mdi:home" width="24" height="24" />
<Icon icon="heroicons:user-circle" class="w-8 h-8" />

// Or use icon fonts
<i class="icon-home" aria-hidden="true"></i>
<span class="sr-only">Home</span>
```

### Video Optimization
```bash
# Compress videos with FFmpeg
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -c:a aac -b:a 128k output.mp4

# Strip audio from muted videos  
ffmpeg -i input.mp4 -an -c:v copy output.mp4

# Create WebM version for better compression
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 output.webm
```

```html
<!-- Responsive video with multiple formats -->
<video controls poster="video-poster.jpg">
  <source src="video.webm" type="video/webm">
  <source src="video.mp4" type="video/mp4">
  <p>Your browser doesn't support HTML video. 
     <a href="video.mp4">Download the video</a>.
  </p>
</video>
```

### Font Loading
```javascript
// hooks.server.js - Preload critical fonts
export function handle({ event, resolve }) {
  return resolve(event, {
    preload: ({ type, path }) => {
      if (type === 'font') return true;
      if (type === 'css' && path.includes('fonts')) return true;
      return false;
    }
  });
}
```

```css
/* Use font-display: swap for better performance */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom-font.woff2') format('woff2');
  font-display: swap;
}
```

---

## Accessibility

### Route Announcements
```html
<!-- Automatic live region updates on navigation -->
<svelte:head>
  <title>Unique, Descriptive Page Title</title>
</svelte:head>
```

### Focus Management
```typescript
import { afterNavigate } from '$app/navigation';
import { tick } from 'svelte';

afterNavigate(async () => {
  // Wait for DOM updates
  await tick();
  
  // Focus the main content area
  const main = document.getElementById('main-content');
  if (main) {
    main.focus();
  }
});
```

### Language Configuration
```html
<!-- app.html -->
<html lang="%lang%">
```

```javascript
// hooks.server.js
export function handle({ event, resolve }) {
  const lang = getLanguageFromRequest(event.request);
  
  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%lang%', lang)
  });
}
```

### Accessible Forms
```svelte
<form>
  <div class="field">
    <label for="email">Email address</label>
    <input 
      id="email"
      name="email" 
      type="email" 
      required
      aria-describedby="email-help email-error"
      aria-invalid={form?.errors?.email ? 'true' : 'false'}
    />
    <div id="email-help" class="help-text">
      We'll never share your email address.
    </div>
    {#if form?.errors?.email}
      <div id="email-error" class="error" role="alert">
        {form.errors.email[0]}
      </div>
    {/if}
  </div>
</form>
```

### Keyboard Navigation
```typescript
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeModal();
  }
  
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    toggleItem();
  }
}
```

### Screen Reader Support
```svelte
<button 
  onclick={toggleMenu}
  aria-expanded={isMenuOpen}
  aria-controls="navigation-menu"
  aria-label="Toggle navigation menu"
>
  {#if isMenuOpen}
    <Icon icon="mdi:close" aria-hidden="true" />
  {:else}
    <Icon icon="mdi:menu" aria-hidden="true" />
  {/if}
</button>

<nav id="navigation-menu" aria-hidden={!isMenuOpen}>
  <!-- Navigation content -->
</nav>
```

---

## SEO Optimization

### Dynamic Meta Tags
```typescript
// +page.js
export async function load({ params, fetch }) {
  const product = await fetch(`/api/products/${params.id}`).then(r => r.json());
  
  return {
    product,
    meta: {
      title: `${product.name} - My Store`,
      description: product.description,
      canonical: `https://mystore.com/products/${params.id}`,
      openGraph: {
        title: product.name,
        description: product.description,
        image: product.image,
        type: 'product'
      }
    }
  };
}
```

```svelte
<!-- +page.svelte -->
<script>
  let { data } = $props();
</script>

<svelte:head>
  <title>{data.meta.title}</title>
  <meta name="description" content={data.meta.description} />
  <link rel="canonical" href={data.meta.canonical} />
  
  <!-- Open Graph -->
  <meta property="og:title" content={data.meta.openGraph.title} />
  <meta property="og:description" content={data.meta.openGraph.description} />
  <meta property="og:image" content={data.meta.openGraph.image} />
  <meta property="og:type" content={data.meta.openGraph.type} />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={data.meta.openGraph.title} />
  <meta name="twitter:description" content={data.meta.openGraph.description} />
  <meta name="twitter:image" content={data.meta.openGraph.image} />
</svelte:head>
```

### Structured Data
```svelte
<script>
  let { product } = $props();
  
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.images,
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "USD",
      "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };
</script>

<svelte:head>
  {@html `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`}
</svelte:head>
```

### Dynamic Sitemap
```typescript
// routes/sitemap.xml/+server.js
export async function GET() {
  const [products, posts] = await Promise.all([
    getProducts(),
    getBlogPosts()
  ]);
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>https://example.com/</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <priority>1.0</priority>
      </url>
      ${products.map(product => `
        <url>
          <loc>https://example.com/products/${product.id}</loc>
          <lastmod>${product.updatedAt}</lastmod>
          <priority>0.8</priority>
        </url>
      `).join('')}
      ${posts.map(post => `
        <url>
          <loc>https://example.com/blog/${post.slug}</loc>
          <lastmod>${post.updatedAt}</lastmod>
          <priority>0.6</priority>
        </url>
      `).join('')}
    </urlset>`;
  
  return new Response(sitemap.trim(), {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=3600' // Cache for 1 hour
    }
  });
}
```

### Robots.txt
```typescript
// routes/robots.txt/+server.js
export async function GET() {
  const robots = `
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /private

Sitemap: https://example.com/sitemap.xml
  `.trim();
  
  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain'
    }
  });
}
```

---

## Hooks & Middleware

### Server Hooks
```typescript
// hooks.server.js
import { sequence } from '@sveltejs/kit/hooks';

// Authentication hook
async function authentication({ event, resolve }) {
  const sessionId = event.cookies.get('session');
  
  if (sessionId) {
    const session = await validateSession(sessionId);
    if (session && session.expiresAt > new Date()) {
      event.locals.user = await getUser(session.userId);
      event.locals.session = session;
    }
  }
  
  return resolve(event);
}

// CORS hook
async function cors({ event, resolve }) {
  // Handle CORS preflight requests
  if (event.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }
  
  const response = await resolve(event);
  
  // Add CORS headers to all responses
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  
  return response;
}

// Security headers hook
async function security({ event, resolve }) {
  const response = await resolve(event);
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  return response;
}

// Compose all hooks
export const handle = sequence(authentication, cors, security);

// Custom fetch for API calls
export async function handleFetch({ event, request, fetch }) {
  // Add authentication to internal API calls
  if (request.url.startsWith('https://api.myapp.com/')) {
    request.headers.set('Authorization', `Bearer ${event.locals.session?.token}`);
  }
  
  // Add user agent for external APIs
  if (!request.url.startsWith(event.url.origin)) {
    request.headers.set('User-Agent', 'MyApp/1.0');
  }
  
  return fetch(request);
}

// Error handling
export function handleError({ error, event }) {
  console.error('Server error:', error, {
    url: event.url.pathname,
    user: event.locals.user?.id
  });
  
  // Don't expose sensitive error details to client
  return {
    message: 'An unexpected error occurred',
    code: error?.code ?? 'INTERNAL_ERROR'
  };
}
```

### Client Hooks
```typescript
// hooks.client.js
export async function handleError({ error, event }) {
  console.error('Client error:', error);
  
  // Send error to monitoring service
  if (typeof window !== 'undefined') {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          url: event.url?.pathname,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        })
      });
    } catch (e) {
      // Ignore errors when reporting errors
    }
  }
  
  return {
    message: 'Something went wrong'
  };
}
```

---

## Server-Only Modules

### Directory Structure
```
src/lib/
├── server/              # Server-only directory
│   ├── auth.js         # Authentication utilities
│   ├── database.js     # Database connections
│   ├── email.js        # Email service
│   ├── payment.js      # Payment processing
│   └── secrets.js      # API keys and secrets
├── shared/              # Shared utilities
│   ├── validation.js   # Validation schemas
│   └── types.js        # Type definitions
└── client/              # Client-only utilities
    └── analytics.js    # Client-side analytics
```

### Naming Convention
```typescript
// secrets.server.js - Server-only by naming convention
import { env } from '$env/dynamic/private';

export const DATABASE_URL = env.DATABASE_URL;
export const STRIPE_SECRET_KEY = env.STRIPE_SECRET_KEY;
export const JWT_SECRET = env.JWT_SECRET;

// database.server.js
import { DATABASE_URL } from './secrets.server.js';
import pkg from 'pg';
const { Pool } = pkg;

export const db = new Pool({
  connectionString: DATABASE_URL
});

export async function query(text: string, params: any[] = []) {
  const client = await db.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    client.release();
  }
}
```

### Environment Variables
```typescript
// Use private environment variables for server-only code
import { SECRET_API_KEY } from '$env/static/private';
import { DB_URL } from '$env/dynamic/private';

// Use public environment variables for client code
import { PUBLIC_API_URL } from '$env/static/public';
```

### Server-Only API Utilities
```typescript
// lib/server/api.js
export async function makeSecureRequest(endpoint: string, options = {}) {
  return fetch(`https://api.secure-service.com${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${SECRET_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
}

export function validateServerSideToken(token: string) {
  // Server-only validation logic
  return jwt.verify(token, JWT_SECRET);
}
```

---

## Development Tools & MCPs

### Official Svelte MCPs

#### mcp-svelte-docs
A comprehensive MCP server providing access to Svelte documentation with caching and search capabilities.

**Features:**
- Complete Svelte documentation access
- Advanced search with context-aware excerpts
- Migration patterns from Svelte 4 to Svelte 5
- Svelte 5 features reference and best practices
- Optimized for different LLM context window sizes

**Installation:**
```json
{
  "mcpServers": {
    "svelte-docs": {
      "command": "npx",
      "args": ["mcp-svelte-docs"]
    }
  }
}
```

#### svelte5-mcp
Specialized MCP server for Svelte 5 development with curated knowledge and code examples.

**Features:**
- Svelte 5 runes, snippets, and enhanced reactivity
- Modern development patterns
- Code examples and intelligent assistance
- Svelte 5 specific guidance

### Development Commands

```bash
# Development
pnpm dev                    # Start development server
pnpm dev --host            # Expose to network
pnpm dev --port 4000       # Custom port

# Building
pnpm build                 # Build for production
pnpm preview              # Preview production build

# Quality Assurance
pnpm lint                  # Lint code
pnpm format               # Format code  
pnpm check                # Type check
pnpm test                 # Run tests

# Package Management
pnpm audit                # Security audit
pnpm outdated             # Check for updates
pnpm update               # Update dependencies
```

### Useful Development Extensions
- Svelte for VS Code
- Tailwind CSS IntelliSense  
- Auto Import - ES6, TS, JSX, TSX
- Error Lens
- Pretty TypeScript Errors

---

## Common Patterns & Troubleshooting

### Error Boundaries
```svelte
<!-- +error.svelte -->
<script>
  import { page } from '$app/stores';
  import { dev } from '$app/environment';
  
  let { error } = $props();
</script>

<div class="error-container">
  <h1>Oops! Something went wrong</h1>
  
  {#if dev}
    <details>
      <summary>Error details (dev only)</summary>
      <pre>{error.message}</pre>
      <pre>{error.stack}</pre>
    </details>
  {/if}
  
  <a href="/">Go home</a>
  <button onclick={() => window.location.reload()}>
    Reload page
  </button>
</div>
```

### Loading States
```svelte
<script>
  import { loading } from '$lib/stores/ui.svelte.js';
  
  let data = $state(null);
  let isLoading = $state(false);
  
  async function loadData() {
    isLoading = true;
    loading.show();
    
    try {
      const response = await fetch('/api/data');
      data = await response.json();
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      isLoading = false;
      loading.hide();
    }
  }
</script>

{#if isLoading}
  <div class="loading">Loading...</div>
{:else if data}
  <!-- Show data -->
{:else}
  <button onclick={loadData}>Load data</button>
{/if}
```

### Infinite Scroll
```svelte
<script>
  let items = $state([]);
  let loading = $state(false);
  let page = $state(1);
  let hasMore = $state(true);
  
  async function loadMore() {
    if (loading || !hasMore) return;
    
    loading = true;
    const response = await fetch(`/api/items?page=${page}`);
    const newItems = await response.json();
    
    if (newItems.length === 0) {
      hasMore = false;
    } else {
      items = [...items, ...newItems];
      page++;
    }
    
    loading = false;
  }
  
  function handleScroll() {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      loadMore();
    }
  }
  
  // Initialize
  $effect(() => {
    loadMore();
    window.addEventListener('scroll', handleScroll);
    
    return () => window.removeEventListener('scroll', handleScroll);
  });
</script>

<div class="items">
  {#each items as item}
    <div class="item">{item.name}</div>
  {/each}
</div>

{#if loading}
  <div class="loading">Loading more...</div>
{/if}
```

This comprehensive guide covers all essential SvelteKit patterns, best practices, and modern development approaches for building performant, accessible, and maintainable web applications with Svelte 5 and SvelteKit 2.