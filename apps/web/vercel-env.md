# Required Environment Variables for Vercel

## Critical Production Variables

These MUST be set in your Vercel project settings:

```
PUBLIC_SUPABASE_URL=<your-supabase-url>
PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# CRITICAL: Set your production domain
PUBLIC_SITE_URL=https://your-domain.com

# Optional but recommended
SENTRY_DSN=<your-sentry-dsn>
RESEND_API_KEY=<your-resend-key>
```

## Supabase Dashboard Configuration

1. Go to your Supabase project dashboard
2. Navigate to Authentication > URL Configuration
3. Add these redirect URLs:

### For Production:
- `https://your-domain.com/**`

### For Vercel Preview Deployments:
- `https://*-your-team-slug.vercel.app/**`
- `http://localhost:5173/**` (for local development)

## Common Issues

### Auth not working on Vercel but works locally
- Ensure PUBLIC_SITE_URL is set in Vercel
- Check redirect URLs in Supabase match your deployment URLs
- Verify all environment variables are set in Vercel dashboard

### Cookies not persisting
- Make sure you're using HTTPS in production
- Check that cookies path is set to '/'
- Verify no custom domain issues

### Email callbacks not working
- Update email templates in Supabase to use correct callback URLs
- Ensure PUBLIC_SITE_URL is properly configured