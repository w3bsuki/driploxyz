# Deployment Checklist - Mobile 500 Fix

## Pre-Deployment Verification

### 1. Local Testing
- [ ] Run `pnpm build --filter web` to ensure builds successfully
- [ ] Run `pnpm preview --filter web` to test production build locally  
- [ ] Test on mobile browser emulator in Chrome DevTools
- [ ] Check for any console errors or warnings

### 2. Code Changes Summary
✅ **Completed:**
- Switched from `adapter-auto` to `@sveltejs/adapter-vercel` with Node.js 20 runtime
- Added comprehensive production logging to identify failing endpoints
- Fixed environment variable handling with static imports and fail-fast errors
- Added proper cookie attributes (SameSite, Secure, HttpOnly) for mobile Safari
- Fixed redirect loops by consolidating onboarding logic in layout.server.ts
- Added null guards for all supabase client usage
- Added timeout to locale detection API calls
- Created health check and debug endpoints

## Deployment Steps

### 1. Commit Changes
```bash
git add -A
git commit -m "Fix mobile 500: Switch to Vercel adapter, fix redirects, add logging

- Use @sveltejs/adapter-vercel with Node.js 20 runtime
- Fix cookie handling for mobile Safari
- Consolidate redirect logic to prevent loops  
- Add null guards for supabase client
- Add production logging and debug endpoints
- Fix locale detection timeout issues"

git push origin main
```

### 2. Vercel Environment Variables
Check in Vercel Dashboard (www.driplo.xyz project):

**Required Environment Variables:**
- [ ] `PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (NEVER expose to client)
- [ ] `PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- [ ] `RESEND_API_KEY` - Resend API key for emails

### 3. Post-Deployment Testing

#### Immediate Tests (5 minutes after deploy)
1. **Health Check**: Visit `https://www.driplo.xyz/api/health`
   - Verify all environment variables show as `true`
   - Check runtime shows as `nodejs20.x`

2. **Mobile Device Test**:
   - Open on real iOS device (Safari)
   - Navigate to homepage
   - Check if page loads without 500 error
   - Test language selector
   - Test cookie consent banner

3. **Debug Endpoints** (Remove after verification):
   - `/api/debug/cookies` - Check cookies are set
   - `/api/debug/session` - Verify session handling

#### Monitoring (First 30 minutes)
1. **Vercel Function Logs**:
   - Go to Vercel Dashboard → Functions tab
   - Monitor for any 500 errors
   - Look for `[HOOK_START]`, `[LAYOUT_LOAD]` logs

2. **Error Patterns to Watch For**:
   - `[CRITICAL] Missing Supabase environment variables`
   - `[AUTH_ERROR]` 
   - `[PROFILE_ERROR]`
   - `[REDIRECT]` loops

## Rollback Plan

If issues persist after deployment:

### Quick Rollback
1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." menu → "Promote to Production"

### Manual Rollback
```bash
git revert HEAD
git push origin main
```

## Success Criteria

✅ **Deployment is successful when:**
- [ ] Mobile iOS loads without 500 error
- [ ] No redirect loops in network tab
- [ ] Cookies persist across page navigations
- [ ] Language selector works without breaking
- [ ] Onboarding flow completes successfully
- [ ] Health check returns all green

## Debugging Commands

If issues persist, gather more info:

### 1. Check Vercel Build Output
```bash
vercel logs www.driplo.xyz --follow
```

### 2. Test Specific Routes
```bash
# Test health endpoint
curl https://www.driplo.xyz/api/health

# Test with mobile user agent
curl -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)" https://www.driplo.xyz
```

### 3. Check Supabase Logs
- Go to Supabase Dashboard → Logs
- Check Auth logs for failed authentications
- Check Database logs for query errors

## Clean Up After Success

Once confirmed working:
1. Remove debug endpoints (`/api/debug/*`)
2. Reduce logging verbosity in production
3. Document the fix in team knowledge base

## Contact for Issues

If deployment fails or issues persist:
- Check Vercel status page: https://www.vercel-status.com/
- Check Supabase status: https://status.supabase.com/
- Review logs with team

---

**Remember**: Deploy during low-traffic hours if possible, and have someone else test on their mobile device to confirm the fix works across different devices and networks.