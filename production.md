# Production Checklist V1

Minimal, definitive checks for production. No bloat.

## Pre-Deploy Verification

```bash
# One-shot - must pass with zero errors
pnpm -w check-types && pnpm -w lint && pnpm -w build && pnpm -w test
```

## Environment Variables

### Required
```env
# Public (client-safe)
PUBLIC_SUPABASE_URL=https://xxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=xxx
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
PUBLIC_APP_URL=https://driplo.xyz

# Server-only
SUPABASE_SERVICE_ROLE_KEY=xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NODE_ENV=production

# Security (32+ char random strings)
RATE_LIMIT_SECRET=xxx  # Required in production
CSRF_SECRET=xxx        # Required in production
```

### Optional
```env
# Monitoring (no-op if not set)
PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx
SENTRY_ORG=xxx
SENTRY_PROJECT=driplo-web
```

## Deploy Configuration

### Vercel
- Adapter: `@sveltejs/adapter-vercel` with `runtime: 'nodejs22.x'`
- Security headers: Applied via `vercel.json`
- Admin excluded: `.vercelignore` blocks `apps/admin/**`
- Redirects: Locale host routing in `vercel.json`

### CI/CD
- GitHub Actions: Builds fail on errors (strictness enabled)
- Build command: `pnpm build --filter web`
- Install command: `pnpm install`

## Security Checklist

✅ **Headers** (via vercel.json)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: no-referrer-when-downgrade
- Permissions-Policy: camera=(), microphone=(), geolocation=()
- HSTS: Auto-added by Vercel

✅ **Auth**
- Supabase SSR with PKCE
- Secure cookies (httpOnly, secure, sameSite='strict')
- CSRF protection with env secret

✅ **Rate Limiting**
- Server-side via sveltekit-rate-limiter
- In-memory fallback for edge cases
- Note: In-memory won't scale horizontally

## Database

```bash
# Generate types before deploy
pnpm db:types
```

- RLS policies: Applied via `SUPABASE_POLICIES.sql`
- Types: `packages/database/src/generated.ts` must match schema

## Performance Targets

- Mobile LCP: <2s
- Bundle: <200KB initial
- Images: Lazy loaded, optimized
- Cache headers: Set on high-traffic routes

## Final Checks

1. No `/demo` routes exist
2. Secrets are production values (not dev/test)
3. Stripe webhook configured
4. robots.txt and sitemap.xml present
5. Build passes locally

## Quick Commands

```bash
# Verify all
pnpm -w check-types && pnpm -w lint && pnpm -w build && pnpm -w test

# Check for exposed secrets
git ls-files | rg -i "\.env\.|secret|key" | rg -v "\.example$"

# Generate DB types
pnpm db:types
```

## Deferred for Post-V1

- Service worker (adds complexity)
- Advanced monitoring dashboards
- Horizontal scaling for rate limits

Ship lean. Add complexity only when needed.