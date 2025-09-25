# Driplo Monorepo Security Audit Report

## Executive Summary

I have completed a comprehensive audit of the driplo monorepo focusing on Supabase authentication, country isolation, product visibility, and security practices. The codebase demonstrates good overall security practices but has several critical vulnerabilities and configuration issues that require immediate attention.

## 🔴 Critical Security Issues

### 1. **Country Code Mismatch Bug** - `apps/web/src/lib/server/country.ts:38-39`
```typescript
const dbCountryCode = detectedCountry === 'GB' ? 'UK' : detectedCountry;
```
**Risk**: Data isolation failure - UK users accessing GB subdomain get `UK` in database but `GB` in app state
**Impact**: Users may see products from wrong country, RLS policies may fail
**Fix**: Standardize on either `GB` or `UK` across all systems

### 2. **Silent Authentication Failures** - `apps/web/src/lib/auth/hooks.ts:31-36`
```typescript
} catch (error) {
  console.warn('[Auth] Setup failed:', error);
  // Don't break the app if auth setup fails
  event.locals.supabase = null as any;
  event.locals.safeGetSession = async () => ({ session: null, user: null });
}
```
**Risk**: Auth failures silently downgrade to unauthenticated state
**Impact**: Security-sensitive routes may receive null session instead of throwing auth error
**Fix**: Differentiate between setup errors and critical auth failures

### 3. **Inner Join Product Images Risk** - `apps/web/src/routes/+page.server.ts:149`
```typescript
product_images!inner (image_url)
```
**Risk**: Products without images are completely hidden from homepage
**Impact**: Legitimate products become invisible to buyers
**Fix**: Use left join and handle missing images in UI

## 🟠 High Priority Issues

### 4. **Missing CSRF Protection Coverage**
**Files**: Multiple API routes lack explicit CSRF checks
**Risk**: State-changing operations vulnerable to CSRF attacks
**Impact**: Users can be tricked into unauthorized actions
**Fix**: Ensure all mutating API routes verify CSRF tokens

### 5. **Incomplete Error Handling** - Various API routes
```typescript
} catch {
  return json({ error: 'Internal server error' }, { status: 500 });
}
```
**Risk**: Generic error handling masks security issues
**Impact**: Makes debugging and monitoring difficult
**Fix**: Implement structured error logging with proper error types

### 6. **Session Validation Inconsistencies**
**Files**: `apps/web/src/lib/auth/index.ts:77-85`
**Risk**: Using both `getUser()` and `getSession()` creates race conditions
**Impact**: Session state may be inconsistent between server and client
**Fix**: Use single source of truth for session validation

## 🟡 Medium Priority Issues

### 7. **RLS Policy Optimization Needed**
**File**: `supabase/migrations/20250818195246_optimize_rls_policies.sql`
**Issue**: Some policies still use bare `auth.uid()` calls
**Impact**: Performance degradation on large datasets
**Fix**: Ensure all policies use `(SELECT auth.uid())` pattern

### 8. **Country Detection Race Conditions**
**File**: `apps/web/src/lib/country/detection.ts:23-38`
**Issue**: Multiple async country detection methods may conflict
**Impact**: Inconsistent country state across requests
**Fix**: Implement proper fallback chain with caching

### 9. **Empty State Handling in UI Components**
**Files**: `packages/ui/src/lib/components/business/FeaturedSellers.svelte:132-136`
**Issue**: Components show "No sellers available" without checking loading state
**Impact**: Poor UX during data loading
**Fix**: Differentiate between loading and truly empty states

## 🟢 Best Practices Observed

### ✅ **Strong Authentication Architecture**
- Proper server-side session validation with `getUser()`
- Clean separation of server and client auth states
- Svelte 5 runes properly implemented for reactive auth state

### ✅ **Comprehensive Rate Limiting**
- Payment endpoints have proper rate limiting
- Client IP tracking implemented correctly

### ✅ **Good Hook Sequencing**
```typescript
export const handle: Handle = sequence(
  localeRedirectHandler,
  csrfGuard,
  authHandler,
  languageHandler,
  authGuardHandler
);
```

## 📋 Recommended Actions

### Immediate (Week 1)
1. **Fix country code standardization** - Critical data integrity issue
2. **Add explicit error handling** to auth bootstrap
3. **Change inner join to left join** for product images
4. **Audit all API routes** for CSRF protection

### Short Term (Month 1)
1. **Implement structured error logging** across all API routes
2. **Add unit tests** for country detection logic
3. **Create monitoring** for silent auth failures
4. **Review and optimize** all RLS policies

### Long Term (Quarter 1)
1. **Implement comprehensive security headers**
2. **Add security scanning** to CI/CD pipeline
3. **Create runbooks** for security incident response
4. **Regular security audits** of dependencies

## 📊 Risk Assessment Matrix

| Issue | Likelihood | Impact | Priority |
|-------|------------|--------|----------|
| Country Code Mismatch | High | High | Critical |
| Silent Auth Failures | Medium | High | Critical |
| Missing CSRF | Low | High | High |
| Inner Join Images | High | Medium | High |
| Error Handling | Medium | Medium | Medium |

## 🔧 Required Data Migrations

```sql
-- Standardize country codes (choose either GB or UK)
UPDATE profiles SET country_code = 'GB' WHERE country_code = 'UK';
UPDATE products SET country_code = 'GB' WHERE country_code = 'UK';
UPDATE orders SET country_code = 'GB' WHERE country_code = 'UK';
```

## 🔍 Detailed Findings

### Supabase Auth Bootstrap Analysis
The authentication system uses a solid architecture with proper server-side validation:
- `setupAuth()` in `apps/web/src/lib/server/hooks.ts` properly creates server clients
- `safeGetSession()` correctly uses `getUser()` for secure validation
- Client-side auth store properly syncs with server state using Svelte 5 runes

**Vulnerabilities Found:**
- Silent failure mode masks critical auth errors
- Race condition between server and client auth state initialization
- Missing validation in some protected route guards

### Region/Country Isolation Audit
Country detection implements a robust fallback chain:
1. URL parameters (testing)
2. Vercel headers (production)
3. Subdomain mapping
4. Cookies
5. IP geolocation

**Critical Flaw:**
The GB/UK mismatch creates data isolation failures where users see inconsistent product sets based on their access method.

### Product Visibility Pipeline Analysis
Homepage data loading uses optimized queries but has visibility risks:
- Inner join on product_images excludes products without photos
- Country filtering properly applied but inconsistent due to GB/UK issue
- Category hierarchy resolution works correctly
- Boost system properly implemented

### Security Practices Review
**Strengths:**
- CSRF protection properly implemented in hook sequence
- Rate limiting on sensitive endpoints
- Proper input validation on most routes
- Structured error responses

**Weaknesses:**
- Generic catch blocks hide error details
- Some API routes missing explicit CSRF verification
- Session state inconsistencies between server/client

## 🚀 Implementation Priorities

### P0 - Critical (Fix This Week)
- [ ] Standardize country codes to GB everywhere
- [ ] Fix auth error handling to fail securely
- [ ] Change product_images to left join
- [ ] Audit CSRF coverage on all API routes

### P1 - High (Fix This Month)
- [ ] Add structured logging to all API endpoints
- [ ] Implement session state consistency checks
- [ ] Add monitoring for auth failures
- [ ] Create country detection unit tests

### P2 - Medium (Fix This Quarter)
- [ ] Optimize remaining RLS policies
- [ ] Implement comprehensive security headers
- [ ] Add automated security scanning
- [ ] Create incident response playbooks

The codebase shows sophisticated engineering but requires immediate attention to these security and data integrity issues to ensure production readiness.