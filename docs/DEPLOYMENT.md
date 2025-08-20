# Deployment Guide

## Overview

Driplo uses Vercel for frontend hosting with automated CI/CD through GitHub Actions. This guide covers deployment setup, configuration, and maintenance.

## Prerequisites

- GitHub repository
- Vercel account
- Supabase project
- Stripe account
- Sentry account (optional)

## Initial Setup

### 1. Vercel Project Setup

1. Connect your GitHub repository to Vercel
2. Configure the project:
   - Framework Preset: SvelteKit
   - Root Directory: `./`
   - Build Command: `pnpm turbo build --filter=web`
   - Install Command: `pnpm install`
   - Output Directory: `apps/web/.svelte-kit`

### 2. Environment Variables

Set these in Vercel Dashboard > Settings > Environment Variables:

```bash
# Supabase
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-key
STRIPE_SECRET_KEY=sk_live_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-secret

# Sentry (optional)
PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ORG=your-org
SENTRY_PROJECT=driplo-web
```

### 3. GitHub Secrets

Add these secrets in GitHub > Settings > Secrets:

```
VERCEL_TOKEN          # From Vercel account settings
VERCEL_ORG_ID         # From Vercel project settings
VERCEL_PROJECT_ID     # From Vercel project settings
PUBLIC_SUPABASE_URL
PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
PUBLIC_STRIPE_PUBLISHABLE_KEY
PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST  # For preview deployments
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
PUBLIC_SENTRY_DSN
SENTRY_AUTH_TOKEN
SENTRY_ORG
SENTRY_PROJECT
```

## Deployment Workflow

### Automatic Deployments

**Production (main branch):**
- Triggers on push to `main`
- Runs tests and type checking
- Builds and deploys to production
- Creates Sentry release

**Preview Deployments (PRs):**
- Triggers on pull request events
- Creates preview deployment
- Comments PR with preview URL
- Uses test Stripe keys

### Manual Deployment

```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel

# Deploy with specific environment
vercel --env production
```

## Build Optimization

### Bundle Size Analysis

```bash
# Analyze build size
node scripts/analyze-bundle.js

# Generate build stats
pnpm build --filter=web -- --stats
```

### Performance Checklist

- [x] Code splitting with dynamic imports
- [x] Vendor chunk optimization
- [x] Asset inlining < 4KB
- [x] CSS code splitting
- [x] Terser minification
- [x] Source maps in production (hidden)
- [x] Console stripping in production

## Monitoring

### Sentry Error Tracking

- Automatic error capture
- Session replay on errors
- Performance monitoring
- Release tracking

View dashboard at: https://sentry.io/organizations/your-org/projects/driplo-web

### Vercel Analytics

- Web Vitals tracking
- Real User Monitoring (RUM)
- Custom events

Enable in Vercel Dashboard > Analytics

## Rollback Procedures

### Via Vercel Dashboard

1. Go to Deployments tab
2. Find previous stable deployment
3. Click "..." menu > "Promote to Production"

### Via CLI

```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>
```

## Database Migrations

### Production Migrations

```bash
# Apply migration to production
pnpm supabase migration push --db-url $DATABASE_URL

# Check migration status
pnpm supabase migration list --db-url $DATABASE_URL
```

### Rollback Database

```bash
# Revert last migration
pnpm supabase migration repair --status reverted <version>
```

## Troubleshooting

### Common Issues

**Build Failures:**
- Check Node version (requires 20.x)
- Verify environment variables
- Clear cache: `vercel --force`

**Type Errors:**
- Run `pnpm check-types` locally
- Ensure packages are built: `pnpm build --filter=@repo/ui`

**Database Connection:**
- Verify Supabase URL and keys
- Check RLS policies
- Monitor connection pool

### Debug Commands

```bash
# Check deployment logs
vercel logs <deployment-url>

# Inspect build output
vercel inspect <deployment-url>

# Test production build locally
pnpm build --filter=web
pnpm preview --filter=web
```

## Security

### Environment Variable Security

- Never commit `.env` files
- Use different keys for preview/production
- Rotate keys regularly
- Limit service role key usage

### Headers Configuration

Security headers are configured in `vercel.json`:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

## Maintenance

### Regular Tasks

**Weekly:**
- Review error reports in Sentry
- Check bundle size trends
- Monitor performance metrics

**Monthly:**
- Update dependencies
- Review and optimize slow queries
- Audit security advisories

**Quarterly:**
- Rotate API keys
- Review access logs
- Performance audit

### Health Checks

```bash
# Check production status
curl https://driplo.com/api/health

# Monitor uptime
# Configure uptime monitoring at:
# - Vercel (built-in)
# - UptimeRobot
# - Pingdom
```

## Cost Optimization

### Vercel Usage

- Monitor bandwidth usage
- Optimize image sizes
- Use ISR for static content
- Configure proper cache headers

### Supabase Usage

- Monitor database size
- Optimize queries with indexes
- Use connection pooling
- Archive old data

## Backup Strategy

### Database Backups

Supabase provides automatic daily backups. Additional backup strategy:

```bash
# Manual backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore backup
psql $DATABASE_URL < backup-20240101.sql
```

### Code Backups

- Git repository (primary)
- GitHub automatic backups
- Local clones on team machines

## Support

For deployment issues:
1. Check deployment logs in Vercel
2. Review GitHub Actions logs
3. Check Sentry for errors
4. Contact team lead for assistance