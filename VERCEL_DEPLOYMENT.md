# Vercel Deployment Guide for Driplo

## Vercel Project Configuration

### 1. Project Settings
- **Framework**: SvelteKit
- **Root Directory**: `/` (entire monorepo)
- **Build Settings**:
  - **Build Command**: `pnpm --filter=web build`
  - **Output Directory**: `apps/web/.svelte-kit`
  - **Install Command**: `pnpm install`

### 2. Environment Variables
Set these in your Vercel dashboard under "Environment Variables":

#### Required Environment Variables:
```env
# Supabase Configuration
PUBLIC_SUPABASE_URL=https://koowfhsaqmarfdkwsfiz.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe Configuration  
PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# Sentry Configuration (Optional but Recommended)
PUBLIC_SENTRY_DSN=your_sentry_dsn

# Resend Configuration (For Email)
RESEND_API_KEY=your_resend_api_key

# Application Settings
NODE_ENV=production
```

#### Getting Your Keys:

**Supabase Keys:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `koowfhsaqmarfdkwsfiz` 
3. Go to Settings → API
4. Copy the `anon` `public` key for `PUBLIC_SUPABASE_ANON_KEY`
5. Copy the `service_role` `secret` key for `SUPABASE_SERVICE_ROLE_KEY`

**Stripe Keys:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your publishable key (starts with `pk_`)
3. Get your secret key (starts with `sk_`)

**Sentry DSN:**
1. Go to [Sentry Dashboard](https://sentry.io)
2. Create a project or use existing
3. Copy the DSN from project settings

**Resend API Key:**
1. Go to [Resend Dashboard](https://resend.com/dashboard)
2. Create API key in API Keys section

### 3. Build Configuration

Create `vercel.json` in project root:

```json
{
  "buildCommand": "pnpm --filter=web build",
  "outputDirectory": "apps/web/.svelte-kit",
  "framework": "sveltekit",
  "regions": ["iad1"],
  "functions": {
    "apps/web/.svelte-kit/**": {
      "runtime": "nodejs20.x"
    }
  },
  "installCommand": "pnpm install"
}
```

### 4. Package.json Scripts

Your root `package.json` should have:
```json
{
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "lint": "turbo lint",
    "type-check": "turbo type-check"
  }
}
```

Apps/web `package.json` should have:
```json
{
  "scripts": {
    "build": "svelte-kit sync && vite build",
    "dev": "vite dev",
    "preview": "vite preview"
  }
}
```

## Deployment Steps

### 1. Connect Repository to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Connect your GitHub repository: `https://github.com/w3bsuki/driploxyz.git`
4. Select the main branch

### 2. Configure Build Settings
1. Set Framework: **SvelteKit** (not just "Svelte")
2. Set Root Directory: `/` (entire monorepo)
3. Override Build Command: `pnpm --filter=web build`
4. Override Output Directory: `apps/web/.svelte-kit`
5. Override Install Command: `pnpm install`

### 3. Add Environment Variables
1. Go to Project Settings → Environment Variables
2. Add all the environment variables listed above
3. Set them for Production, Preview, and Development environments

### 4. Deploy
1. Click "Deploy"
2. Vercel will build and deploy your project
3. You'll get a deployment URL like `https://your-project.vercel.app`

## Troubleshooting

### Common Build Issues:

1. **"Module not found" errors**:
   - Ensure all workspace dependencies are properly installed
   - Check that `@repo/ui` and `@repo/i18n` are built correctly

2. **Build timeouts**:
   - The build should complete in ~5-10 minutes
   - If it takes longer, check for build optimizations

3. **Supabase connection issues**:
   - Verify environment variables are set correctly
   - Check Supabase project is accessible

4. **Type errors during build**:
   - Run `pnpm run check-types` locally first
   - Ensure TypeScript configuration is correct

### Performance Optimization:

1. **Enable Edge Functions** (optional):
   ```json
   {
     "functions": {
       "apps/web/.svelte-kit/output/server/**": {
         "runtime": "edge"
       }
     }
   }
   ```

2. **Enable Caching**:
   - Vercel automatically caches static assets
   - Consider adding cache headers for API routes

3. **Image Optimization**:
   - Use Vercel's built-in image optimization
   - Or stick with Supabase Storage (already configured)

## Post-Deployment Checklist

After successful deployment:

1. ✅ **Test Core Functionality**:
   - User registration/login
   - Product listing creation
   - Search functionality
   - Payment flow (test mode)

2. ✅ **Verify Integrations**:
   - Supabase database connections
   - Stripe payment processing
   - Email sending (Resend)
   - Error monitoring (Sentry)

3. ✅ **Performance Testing**:
   - Page load speeds
   - Image loading
   - Search responsiveness
   - Mobile experience

4. ✅ **SEO Setup**:
   - Meta tags are working
   - Open Graph images
   - Sitemap generation

5. ✅ **Security Checks**:
   - Environment variables not exposed
   - HTTPS working correctly
   - API endpoints secured

## Domain Setup (Optional)

To use a custom domain:

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS settings as instructed
4. Wait for SSL certificate generation

## Monitoring and Analytics

Consider adding:
- Vercel Analytics (built-in)
- Sentry for error monitoring (already configured)
- Google Analytics or similar
- Uptime monitoring

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Sentry for runtime errors
3. Review Supabase logs for database issues
4. Test locally with production environment variables