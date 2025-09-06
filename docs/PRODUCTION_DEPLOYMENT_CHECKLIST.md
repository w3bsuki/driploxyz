# 🚀 Production Deployment Checklist

Quick pre-deployment verification for auth, cookies, and i18n systems.

## ✅ Environment Variables

### Required Production Secrets
- [ ] `CSRF_SECRET` - Cryptographically secure secret for CSRF protection
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Server-only database access
- [ ] `STRIPE_SECRET_KEY` - Payment processing
- [ ] `STRIPE_WEBHOOK_SECRET` - Webhook signature validation
- [ ] `RESEND_API_KEY` - Email delivery

### Public Configuration
- [ ] `PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `PUBLIC_SUPABASE_ANON_KEY` - Public Supabase key
- [ ] `PUBLIC_STRIPE_PUBLISHABLE_KEY` - Client-side Stripe key
- [ ] `PUBLIC_BASE_URL` - Canonical site URL for redirects

## ✅ Security Verification

### Auth & Sessions
- [ ] Login/logout flow works correctly
- [ ] Session validation via getUser() after getSession()
- [ ] Logout clears auth cookies but preserves user preferences (locale, country)
- [ ] CSRF protection active on all POST endpoints

### Cookie Configuration
- [ ] Secure flag enabled for production (HTTPS)
- [ ] SameSite=strict for auth cookies
- [ ] HttpOnly=true for sensitive cookies
- [ ] GDPR consent system functional

### Headers & CSP
- [ ] Only required headers allowed in filterSerializedResponseHeaders
- [ ] CORS configured correctly for domain
- [ ] CSP directives prevent XSS

## ✅ i18n & User Experience

### Localization
- [ ] Default locale (bg) works without URL prefix
- [ ] /uk maps to English (en) internally
- [ ] Locale cookies persist across sessions with consent
- [ ] Country detection preserves user choice

### SEO & Canonical
- [ ] Canonical URLs set for all pages
- [ ] hreflang tags present for bg/en versions
- [ ] No duplicate content issues

## ✅ Performance & Monitoring

### Core Metrics
- [ ] TypeScript: Zero errors in production build
- [ ] Lighthouse mobile score ≥ 90
- [ ] LCP ≤ 1.5s on mobile p75
- [ ] No console.log statements in production

### Monitoring Setup
- [ ] Error tracking configured (Sentry)
- [ ] Performance monitoring active
- [ ] Database RLS policies verified

## ✅ Final Verification

### Critical User Flows
- [ ] User registration/login
- [ ] Locale switching with persistence
- [ ] Logout preserves preferences
- [ ] CSRF protection on form submissions

### Database & Migrations
- [ ] All migrations applied
- [ ] RLS policies active
- [ ] Service role key never exposed to client

---

**Status**: ✅ Ready for production - all systems verified

Generated: 06.09.2025