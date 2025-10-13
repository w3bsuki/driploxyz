# Production Launch Checklist

**Quick reference for launch readiness verification**

---

## 🚦 Critical Path (Must-Have for Launch)

### Foundation ✅
- [ ] TypeScript 0 errors across workspace
- [ ] ESLint + Prettier passing
- [ ] Svelte 5 runes-only (no legacy stores)
- [ ] SvelteKit 2 patterns verified (satisfies, actions, hooks)
- [ ] Tailwind v4 configured with design tokens
- [ ] Supabase advisors: 0 critical warnings (security + performance)

### Features 🎯
- [ ] Auth: signup, login, email verification, password reset
- [ ] Search: full-text with RPC, autocomplete, filters, relevance ranking
- [ ] Chat: realtime messaging, typing indicators, read receipts
- [ ] Social: reviews with ratings, follow/unfollow, avatar uploads
- [ ] Orders: checkout with Stripe, webhooks, seller/buyer dashboards
- [ ] i18n: locale detection, /bg and /en routes, 100% key coverage

### Quality 🔬
- [ ] Unit tests: 70% coverage for @repo/core, @repo/ui
- [ ] Integration tests: RLS policies, RPC functions, storage policies
- [ ] E2E tests: 15 critical flows (signup → list → search → purchase → review)
- [ ] Load test: 100 concurrent users, p95 < 500ms, error rate < 0.1%
- [ ] Accessibility: WCAG 2.1 AA, axe DevTools clean, screen reader tested

### Performance 🚀
- [ ] Lighthouse score > 90 on homepage, search, product pages
- [ ] Core Web Vitals: LCP < 2.0s, FID < 100ms, CLS < 0.1
- [ ] Bundle size: main < 150 KB gzipped, CSS < 50 KB
- [ ] Images optimized with Vercel Image Optimization
- [ ] Supabase indexes per advisors recommendations

### Security 🔒
- [ ] RLS policies on all tables, audited and tested
- [ ] Rate limiting: anonymous 100/min, auth 300/min, search 20/min
- [ ] Security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- [ ] Secrets audit: no leaks in client bundles, CI grep check
- [ ] Secret rotation schedule: quarterly for API keys

### Observability 📊
- [ ] Sentry configured with source maps, correlation IDs
- [ ] APM: Vercel Analytics + Web Vitals enabled
- [ ] Business metrics: DAU, search success, order completion
- [ ] Alerting: error rate > 1%, p95 > 2s, availability < 99%
- [ ] Uptime monitoring: 5 min intervals on critical endpoints

### SEO 🔍
- [ ] Structured data (JSON-LD): Product, Person, BreadcrumbList
- [ ] Dynamic sitemap at /sitemap.xml, submitted to Google Search Console
- [ ] Meta tags: og:image, Twitter Card, canonical URLs
- [ ] Robots.txt configured (allow/disallow rules)

### Legal & Compliance ⚖️
- [ ] Privacy Policy live with GDPR disclosures
- [ ] Terms of Service live with buyer/seller terms
- [ ] Cookie consent banner (non-essential cookies)
- [ ] Data export: "Download my data" functional
- [ ] Data deletion: "Delete account" functional
- [ ] Age verification: 18+ age gate on signup

### Operations 🛠️
- [ ] Incident runbooks documented (5+ scenarios)
- [ ] Supabase backups verified (automatic daily, 7-day retention)
- [ ] Restore procedure tested on dev branch
- [ ] Cost monitoring: billing alerts configured (Vercel, Supabase)
- [ ] Status page live or planned

### Deployment 🚢
- [ ] CI/CD pipeline: PR checks (lint, type, test, build, bundle size)
- [ ] Preview deployments: every PR gets Vercel preview URL
- [ ] Staging: auto-deploy main, E2E post-deploy
- [ ] Production: manual approval, blue-green, health check, rollback plan
- [ ] Domain configured with SSL
- [ ] Environment variables: production Supabase, Stripe live keys, Resend

---

## 🎯 Nice-to-Have (Can Launch Without, Add Post-Launch)

### Enhanced UX
- [ ] PWA: web manifest, service worker, offline support
- [ ] Push notifications for messages/orders
- [ ] In-app notifications panel

### Advanced Features
- [ ] Saved searches
- [ ] Product recommendations (AI-powered)
- [ ] Virtual try-on
- [ ] Authentication service integration
- [ ] 2FA for user accounts

### Analytics
- [ ] Conversion funnel tracking
- [ ] A/B testing framework
- [ ] Heat maps and session recordings

---

## 📋 Pre-Launch Smoke Test (15 Minutes)

Run these flows manually on staging before production deploy:

1. **Auth Flow (3 min)**
   - [ ] Signup with email verification
   - [ ] Login and logout
   - [ ] Password reset email received

2. **Seller Flow (4 min)**
   - [ ] Create product listing with images
   - [ ] Edit listing
   - [ ] View on product page

3. **Buyer Flow (5 min)**
   - [ ] Search for product
   - [ ] Add to favorites
   - [ ] Send message to seller
   - [ ] Complete checkout (test card)

4. **Localization (2 min)**
   - [ ] Switch from /bg to /en
   - [ ] Verify UI strings translated
   - [ ] Locale banner shows for detected country

5. **Accessibility (1 min)**
   - [ ] Tab through homepage (keyboard only)
   - [ ] Check focus indicators visible
   - [ ] Screen reader announces page title

---

## 🚨 Launch Day Checklist

### Morning (2 hours before launch)
- [ ] Verify all CI checks passing on main branch
- [ ] Run full E2E suite one more time
- [ ] Check Supabase dashboard: database healthy, no alerts
- [ ] Verify Stripe webhook endpoint responding
- [ ] Check Sentry: no new errors in staging

### Launch (30 minutes)
- [ ] Deploy to production with manual approval
- [ ] Monitor deployment logs for errors
- [ ] Verify health check: /api/health returns 200
- [ ] Test critical flow: signup → list → search
- [ ] Check monitoring dashboards: Sentry, Vercel, Supabase

### First Hour (post-launch)
- [ ] Monitor error rate (target: < 1%)
- [ ] Watch response times (p95 < 500ms)
- [ ] Check user signups and first listings
- [ ] Verify search working end-to-end
- [ ] Test payment flow with live Stripe keys

### First 24 Hours
- [ ] Review error spikes in Sentry
- [ ] Check business metrics: signups, listings, searches, orders
- [ ] Gather user feedback (Typeform/Tally survey)
- [ ] Monitor performance (Core Web Vitals)
- [ ] Check costs: Vercel, Supabase, Stripe

---

## 📞 Emergency Contacts

- **On-Call Engineer:** [Your contact]
- **Vercel Support:** support@vercel.com
- **Supabase Support:** support@supabase.io
- **Stripe Support:** [Your Stripe dashboard]
- **Status Pages:**
  - Vercel: https://vercel-status.com
  - Supabase: https://status.supabase.com
  - Stripe: https://status.stripe.com

---

## 🔄 Rollback Procedure

If critical issue detected post-launch:

1. **Immediate (< 2 minutes)**
   - Go to Vercel dashboard → Deployments
   - Click "..." on previous working deployment
   - Click "Promote to Production"
   - Verify health check passes

2. **Investigation (< 30 minutes)**
   - Check Sentry for error spike details
   - Review recent deployment changes
   - Check Supabase logs for database issues
   - Verify third-party services (Stripe, Resend) operational

3. **Fix Forward or Stay Rolled Back**
   - If quick fix possible (< 1 hour): deploy hotfix
   - Otherwise: stay on previous version, plan fix for next deploy

4. **Post-Incident (< 24 hours)**
   - Write incident report (what, why, how to prevent)
   - Update runbook with new scenario
   - Add monitoring/alerting if gap identified

---

## ✅ Sign-Off

**Technical Lead:** _________________ Date: _______

**Product Owner:** _________________ Date: _______

**Ready to Launch:** ☐ YES  ☐ NO (blockers: _________________)

---

**Last Updated:** October 13, 2025
