# Required GitHub Secrets for CI/CD

Add these secrets in your GitHub repository: **Settings → Secrets and variables → Actions**

## Vercel Secrets (Required for deployment)
```
VERCEL_TOKEN                    # From Vercel → Settings → Tokens
VERCEL_ORG_ID                   # From Vercel → Project Settings → General
VERCEL_PROJECT_ID               # From Vercel → Project Settings → General  
```

## Supabase Secrets (Required for app functionality)
```
PUBLIC_SUPABASE_URL             # Your production Supabase project URL
PUBLIC_SUPABASE_ANON_KEY        # Your production Supabase anon key
SUPABASE_SERVICE_ROLE_KEY       # Your production Supabase service role key

# Test environment (for preview deployments)
PREVIEW_SUPABASE_URL            # Your test/staging Supabase project URL  
PREVIEW_SUPABASE_ANON_KEY       # Your test/staging Supabase anon key
SUPABASE_ANON_KEY_TEST          # Same as preview anon key
SUPABASE_SERVICE_KEY_TEST       # Your test/staging service role key
```

## Stripe Secrets (Required for payments)
```
PUBLIC_STRIPE_PUBLISHABLE_KEY   # Production Stripe publishable key
STRIPE_SECRET_KEY               # Production Stripe secret key
STRIPE_WEBHOOK_SECRET           # Production Stripe webhook secret

# Test keys for development
PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST  # Test Stripe publishable key
STRIPE_SECRET_KEY_TEST             # Test Stripe secret key
```

## Sentry Secrets (Optional - for error tracking)
```
PUBLIC_SENTRY_DSN              # Your Sentry project DSN
SENTRY_AUTH_TOKEN              # Sentry auth token for releases
SENTRY_ORG                     # Your Sentry organization slug
SENTRY_PROJECT                 # Your Sentry project name (e.g. "driplo-web")
```

## Turbo Secrets (Optional - for caching)
```
TURBO_TOKEN                    # Vercel Turbo token (optional)
```

## How to Add Secrets:

1. Go to your GitHub repository
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret with the exact name and value

## Getting Secret Values:

### Vercel:
- Login to Vercel dashboard
- Go to Settings → Tokens → Create Token
- For Org/Project IDs: Go to your project → Settings → General

### Supabase:  
- Go to your Supabase project dashboard
- Settings → API → Copy URL and anon key
- For service role: Settings → API → service_role secret

### Stripe:
- Go to Stripe dashboard  
- Developers → API keys
- Copy publishable and secret keys
- For webhooks: Developers → Webhooks → Add endpoint

### Sentry:
- Go to Sentry dashboard
- Settings → Auth Tokens → Create token
- Project settings for org/project names