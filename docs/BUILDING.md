# BUILDING - Production Build Process

**Reference**: https://svelte.dev/docs/kit/building-your-app

## BUILD PROCESS

### 1. Build Command
```bash
# Standard build
vite build

# With environment
NODE_ENV=production vite build

# Custom mode
vite build --mode staging
```

### 2. Build Output
```
.svelte-kit/         # Build artifacts
  output/
    client/          # Static assets
    server/          # Server code
    prerendered/     # Prerendered pages
    
build/               # Adapter output
.vercel/output/      # Vercel specific
```

## VITE CONFIGURATION

### 1. Build Options
```javascript
// vite.config.js
export default defineConfig({
  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 500,
    
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log']
      }
    },
    
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['svelte', '@sveltejs/kit'],
          supabase: ['@supabase/supabase-js', '@supabase/ssr']
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
        entryFileNames: 'entries/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
});
```

### 2. Asset Optimization
```javascript
// Image optimization
import imagemin from 'vite-plugin-imagemin';

export default {
  plugins: [
    imagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: false }
        ]
      }
    })
  ]
};
```

## CODE SPLITTING

### 1. Dynamic Imports
```typescript
// Lazy load components
const HeavyComponent = await import('$lib/components/Heavy.svelte');

// Conditional loading
if (needsFeature) {
  const { feature } = await import('$lib/features/premium');
  feature();
}
```

### 2. Route-based Splitting
```typescript
// +page.ts
export async function load({ data }) {
  // Only load when needed
  if (data.showChart) {
    const { Chart } = await import('$lib/components/Chart.svelte');
    return { Chart };
  }
}
```

## OPTIMIZATION

### 1. Tree Shaking
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false
      }
    }
  }
};
```

### 2. Compression
```javascript
// Enable gzip/brotli
import compress from 'vite-plugin-compression';

export default {
  plugins: [
    compress({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240
    }),
    compress({
      algorithm: 'gzip',
      ext: '.gz'
    })
  ]
};
```

### 3. CSS Optimization
```javascript
export default {
  css: {
    postcss: {
      plugins: [
        autoprefixer(),
        cssnano({
          preset: 'default'
        })
      ]
    }
  },
  build: {
    cssCodeSplit: true,
    cssMinify: 'lightningcss'
  }
};
```

## PRERENDERING

### 1. Static Pages
```typescript
// +page.ts
export const prerender = true;

// Prerender with parameters
export async function entries() {
  const products = await getProducts();
  return products.map(p => ({ id: p.id }));
}
```

### 2. Crawl Configuration
```javascript
// svelte.config.js
export default {
  kit: {
    prerender: {
      concurrency: 5,
      crawl: true,
      entries: ['*', '/sitemap.xml'],
      handleHttpError: ({ path, referrer, message }) => {
        if (path.startsWith('/admin')) return;
        throw new Error(message);
      }
    }
  }
};
```

## ENVIRONMENT VARIABLES

### 1. Build-time Variables
```bash
# .env.production
PUBLIC_API_URL=https://api.driplo.xyz
PUBLIC_SUPABASE_URL=https://xxx.supabase.co

# Private (server-only)
DATABASE_URL=postgresql://...
SECRET_KEY=xxx
```

### 2. Runtime Variables
```javascript
// Access in code
import { PUBLIC_API_URL } from '$env/static/public';
import { SECRET_KEY } from '$env/static/private';

// Dynamic access
import { env } from '$env/dynamic/public';
```

## BUNDLE ANALYSIS

### 1. Visualizer Plugin
```javascript
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  plugins: [
    visualizer({
      emitFile: true,
      filename: 'stats.html',
      gzipSize: true,
      brotliSize: true
    })
  ]
};
```

### 2. Size Limits
```javascript
// package.json
{
  "size-limit": [
    {
      "path": "build/client/**/*.js",
      "limit": "200 KB"
    }
  ]
}
```

## DEPLOYMENT BUILD

### 1. Vercel Adapter
```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-vercel';

export default {
  kit: {
    adapter: adapter({
      runtime: 'nodejs20.x',
      maxDuration: 30,
      memory: 1024,
      split: true,
      regions: ['iad1']
    })
  }
};
```

### 2. Edge Functions
```javascript
// +server.ts
export const config = {
  runtime: 'edge',
  regions: ['iad1', 'sfo1']
};
```

## CACHING STRATEGY

### 1. Static Assets
```javascript
// svelte.config.js
export default {
  kit: {
    serviceWorker: {
      register: true,
      files: (filepath) => !/\.map$/.test(filepath)
    }
  }
};
```

### 2. HTTP Headers
```typescript
// hooks.server.ts
export async function handle({ event, resolve }) {
  const response = await resolve(event);
  
  // Cache static assets
  if (event.url.pathname.startsWith('/assets')) {
    response.headers.set('cache-control', 'public, max-age=31536000, immutable');
  }
  
  // Cache HTML
  if (response.headers.get('content-type')?.includes('text/html')) {
    response.headers.set('cache-control', 'public, max-age=3600, must-revalidate');
  }
  
  return response;
}
```

## SECURITY HEADERS

```typescript
// hooks.server.ts
export async function handle({ event, resolve }) {
  const response = await resolve(event);
  
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  return response;
}
```

## PRODUCTION CHECKLIST

### Pre-Build
```bash
# Clean previous builds
rm -rf .svelte-kit build .vercel

# Update dependencies
pnpm update

# Run tests
pnpm test

# Type check
pnpm check
```

### Build Steps
```bash
# 1. Sync types
svelte-kit sync

# 2. Build packages first (monorepo)
pnpm build --filter ./packages/*

# 3. Build app
pnpm build --filter web

# 4. Preview locally
pnpm preview
```

### Post-Build
```bash
# Analyze bundle
pnpm analyze

# Check build size
du -sh build/

# Test production build
pnpm preview
```

## PERFORMANCE TARGETS

```javascript
// Web Vitals targets
{
  "LCP": "< 2.5s",    // Largest Contentful Paint
  "FID": "< 100ms",   // First Input Delay
  "CLS": "< 0.1",     // Cumulative Layout Shift
  "FCP": "< 1.8s",    // First Contentful Paint
  "TTFB": "< 600ms"   // Time to First Byte
}
```

## COMMON ISSUES

### 1. Build Failures
```bash
# Clear cache
rm -rf node_modules/.vite

# Reinstall deps
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Force rebuild
pnpm build --force
```

### 2. Memory Issues
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" pnpm build

# Reduce concurrency
export JOBS=1
pnpm build
```

### 3. Type Errors
```bash
# Regenerate types
svelte-kit sync

# Skip type checking (emergency)
pnpm build --no-tsconfig
```

## CI/CD BUILD

### GitHub Actions
```yaml
name: Build
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      
      - uses: actions/upload-artifact@v3
        with:
          name: build
          path: build/
```

## RULES

- Always test production build locally
- Enable source maps only in staging
- Drop console.logs in production
- Minify and compress all assets
- Use CDN for static assets
- Enable HTTP/2 push
- Implement cache headers
- Monitor bundle size
- Use code splitting
- Optimize images

## AUDIT COMMANDS

```bash
# Build with analysis
ANALYZE=true pnpm build

# Check build size
find build -name "*.js" -exec du -h {} + | sort -h

# Lighthouse audit
npx lighthouse https://localhost:4173

# Bundle size check
npx bundlesize

# Check for unused CSS
npx purgecss --config purgecss.config.js
```