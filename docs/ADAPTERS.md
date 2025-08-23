# ADAPTERS - Vercel Deployment Best Practices

**Reference**: https://svelte.dev/docs/kit/adapter-vercel

## VERCEL ADAPTER CONFIGURATION

### 1. Optimal Configuration
```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-vercel';

export default {
  kit: {
    adapter: adapter({
      // Runtime
      runtime: 'nodejs20.x', // Latest stable
      
      // Performance
      maxDuration: 30,      // 30 seconds max
      memory: 1024,         // 1GB memory
      
      // Regions (match Supabase region)
      regions: ['iad1'],    // US East
      
      // Split functions for better cold starts
      split: false,         // Keep false for small apps
      
      // ISR for static-ish content
      isr: {
        expiration: 3600,   // 1 hour cache
        bypassToken: process.env.ISR_BYPASS_TOKEN
      }
    })
  }
};
```

### 2. Edge Functions (When Needed)
```javascript
// For geo-distributed content
adapter({
  runtime: 'edge',
  regions: ['iad1', 'sfo1', 'fra1'] // Multi-region
})
```

### 3. Function Configuration Per Route
```typescript
// +page.server.ts or +server.ts
export const config = {
  runtime: 'edge',
  regions: ['iad1'],
  maxDuration: 60
};
```

## DEPLOYMENT RULES

### 1. Environment Variables
```bash
# Vercel Dashboard or CLI
PUBLIC_SUPABASE_URL=https://xxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx # Secret only
```

### 2. Build Settings
```json
// vercel.json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".vercel/output",
  "installCommand": "pnpm install",
  "framework": "sveltekit"
}
```

### 3. Headers & Redirects
```json
// vercel.json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    }
  ]
}
```

## OPTIMIZATION STRATEGIES

### 1. Image Optimization
```javascript
// Use Vercel's image optimization
import { VERCEL_URL } from '$env/static/private';

export function getImageUrl(path: string, width: number) {
  return `https://${VERCEL_URL}/_vercel/image?url=${path}&w=${width}&q=75`;
}
```

### 2. ISR (Incremental Static Regeneration)
```typescript
// +page.server.ts
export const config = {
  isr: {
    expiration: 3600, // Revalidate every hour
  }
};
```

### 3. Function Splitting
```javascript
// Split large apps into multiple functions
adapter({
  split: true // Each route gets its own function
})
```

## MONITORING

### 1. Vercel Analytics
```svelte
<!-- app.html -->
<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="/_vercel/insights/script.js"></script>
```

### 2. Function Logs
```bash
# View logs
vercel logs --follow

# Check function performance
vercel inspect [deployment-url]
```

## COMMON ISSUES & FIXES

### 1. Cold Starts
```javascript
// Reduce bundle size
split: true,
external: ['sharp', 'canvas'] // Exclude heavy deps
```

### 2. Timeout Errors
```javascript
// Increase duration
maxDuration: 60 // Up to 60s for Pro plans
```

### 3. Memory Issues
```javascript
// Increase memory
memory: 3008 // Up to 3GB for Pro plans
```

## DEPLOYMENT CHECKLIST

- [ ] Environment variables set in Vercel
- [ ] Correct Node.js runtime version
- [ ] Region matches database location
- [ ] ISR configured for static content
- [ ] Error pages configured
- [ ] Analytics enabled
- [ ] Custom domain configured
- [ ] SSL certificate active

## COMMANDS

```bash
# Deploy
vercel --prod

# Preview deployment
vercel

# Link to project
vercel link

# Pull env variables
vercel env pull

# Check deployment
vercel inspect [url]
```