# Driplo Security Configuration

**Version:** 1.0  
**Last Updated:** November 25, 2025  
**Phase:** 5 - Security Hardening

---

## Overview

This document describes the security configuration implemented for the Driplo marketplace platform. All security measures follow OWASP guidelines and industry best practices.

---

## 1. Authentication Security

### 1.1 Password Security

**Location:** `apps/web/src/lib/server/security/password-security.ts`

#### HaveIBeenPwned Integration
- Uses k-anonymity model (only first 5 chars of SHA-1 hash sent to API)
- Rejects passwords found in known data breaches
- Fails open if HIBP API is unavailable

#### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one number
- Cannot be a common password (blocklist maintained)

```typescript
import { isPasswordSafe } from '$lib/server/security';

const result = await isPasswordSafe(password);
if (!result.safe) {
  // Handle breach warning: result.reason, result.breachCount
}
```

### 1.2 Account Lockout

**Location:** `apps/web/src/lib/server/security/account-lockout.ts`

#### Progressive Lockout Durations
| Level | Duration | Trigger |
|-------|----------|---------|
| 0 | 5 minutes | 5 failed attempts |
| 1 | 15 minutes | 5 more failed attempts |
| 2 | 1 hour | 5 more failed attempts |
| 3 | 24 hours | 5 more failed attempts |

#### Dual Tracking
- **Per-Account:** Tracks by email address
- **Per-IP:** Tracks by client IP (stricter limits)

```typescript
import { checkLockout, recordAuthFailure, recordAuthSuccess } from '$lib/server/security';

// Before login
const lockout = checkLockout(email, clientIp);
if (lockout.locked) {
  return fail(429, { message: lockout.message });
}

// After failed login
recordAuthFailure(email, clientIp);

// After successful login
recordAuthSuccess(email, clientIp);
```

### 1.3 Supabase Auth Configuration

**⚠️ Action Required in Supabase Dashboard:**

1. **OTP Expiry:** Set to < 1 hour (currently > 1 hour)
2. **Enable PKCE:** Already enabled for secure auth flow
3. **Email Confirmation:** Required for new signups

---

## 2. Rate Limiting

### 2.1 Configuration

**Location:** `apps/web/src/lib/server/security/rate-limiter.ts`

| Endpoint | Max Requests | Window | Block Duration |
|----------|--------------|--------|----------------|
| Login | 10 | 15 min | 15 min |
| Signup | 20 | 1 hour | 15 min |
| Password Reset | 3 | 1 hour | 1 hour |
| Search API | 20 | 1 min | 5 min |
| API (General) | 100 | 1 min | 5 min |
| API (Read-only) | 300 | 1 min | 1 min |
| Payment | 5 | 10 min | 30 min |
| Checkout | 10 | 15 min | 10 min |
| Favorites | 50 | 1 min | 2 min |
| Messaging | 20 | 1 min | 5 min |
| Product Upload | 10 | 15 min | 10 min |
| Admin | 5 | 5 min | 30 min |

### 2.2 Usage

```typescript
import { checkRateLimit, withRateLimit } from '$lib/server/security';

// Manual check
const { allowed, retryAfter } = checkRateLimit(key, 'login');

// As middleware
export const POST = withRateLimit('api')(async (event) => {
  // Handler code
});
```

---

## 3. Security Headers

### 3.1 Production Headers (Vercel + SvelteKit)

**Locations:**
- `vercel.json` - Edge-level headers
- `apps/web/src/hooks.server.ts` - SvelteKit middleware

| Header | Value |
|--------|-------|
| X-Frame-Options | DENY |
| X-Content-Type-Options | nosniff |
| Referrer-Policy | strict-origin-when-cross-origin |
| X-DNS-Prefetch-Control | on |
| Strict-Transport-Security | max-age=31536000; includeSubDomains; preload |
| Permissions-Policy | camera=(), microphone=(), geolocation=(), payment=(), usb=(), vr=(), speaker-selection=(), accelerometer=(), gyroscope=(), magnetometer=(), clipboard-read=(), display-capture=() |

### 3.2 Content Security Policy

```
default-src 'self';
script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com https://checkout.stripe.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: https: blob:;
font-src 'self' https://fonts.gstatic.com data:;
connect-src 'self' https://*.supabase.co https://*.supabase.io wss://*.supabase.co https://www.google-analytics.com https://api.stripe.com https://vitals.vercel-insights.com;
frame-src https://checkout.stripe.com https://js.stripe.com;
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
block-all-mixed-content;
upgrade-insecure-requests
```

---

## 4. Row Level Security (RLS)

### 4.1 Policy Optimization

**Migration:** `supabase/migrations/20251125100000_security_phase5_rls.sql`

All RLS policies have been optimized:
- Consolidated multiple permissive policies into single policies
- Replaced `auth.uid()` with cached `auth.current_user_id()` function
- Prevents InitPlan re-evaluation per row

### 4.2 Policy Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| products | Owner + Public (active) | Owner | Owner/Admin | Owner/Admin |
| profiles | Own + Public profiles | - | Owner/Admin | - |
| conversations | Participants | Buyer | - | - |
| messages | Participants | Sender (if participant) | - | - |
| favorites | Owner | Owner | - | Owner |
| orders | Buyer/Seller/Admin | Buyer | - | - |
| notifications | Owner | - | Owner | Owner |
| search_analytics | Admin only | Anyone | - | - |
| followers | Public | Follower (not self) | - | Follower |

### 4.3 Verifying RLS Configuration

```sql
-- Check current policies
SELECT tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test as specific user
SET request.jwt.claim.sub = 'user-uuid-here';
SELECT * FROM products; -- Should only show allowed rows
```

---

## 5. CSRF Protection

**Location:** `apps/web/src/lib/server/csrf.ts`

### Implementation
- HMAC-SHA256 signed tokens
- Cryptographically secure random nonces
- Timing-safe token comparison
- 1-hour token expiration
- Cookie-based storage with httpOnly, sameSite, secure flags

### Usage
CSRF protection is automatically applied through SvelteKit form actions.

---

## 6. Input Validation

**Location:** `packages/core/src/validation/`

### Validation Schemas
- Auth: Login, Signup, Password Reset
- Products: Create, Update, Search filters
- Profiles: Update, Settings
- Messages: Send, Report
- Reviews: Create, Update
- File uploads: Type, size, extension validation

### XSS Prevention
- All user input sanitized before storage
- HTML entities escaped in output
- CSP prevents inline script execution

---

## 7. Security Testing

### 7.1 Automated Tests

**Location:** `apps/web/tests/security.spec.ts`

Tests cover:
- Brute force protection
- Session security
- Password strength requirements
- XSS prevention
- SQL injection prevention
- File upload restrictions
- CSRF validation
- Authorization/access control
- Security headers verification
- Rate limiting

### 7.2 Running Security Tests

```bash
pnpm --filter web test:e2e tests/security.spec.ts
```

---

## 8. Monitoring & Alerting

### Error Tracking
- Sentry integration for production errors
- Security events logged with correlation IDs

### Recommended Alerts
- Error rate > 1% → Page on-call
- 429 responses > 100/min → Potential attack
- Failed logins > 50/min → Brute force attempt

---

## 9. Incident Response

### If Breach Suspected

1. **Immediately:**
   - Revoke compromised API keys/secrets
   - Enable Supabase maintenance mode if needed
   - Check audit logs in Supabase dashboard

2. **Within 1 hour:**
   - Rotate all secrets
   - Review recent auth.users changes
   - Check for unauthorized data access

3. **Within 24 hours:**
   - Full security audit
   - Notify affected users if required
   - Document incident timeline

---

## 10. Security Checklist

### Pre-Launch
- [ ] OTP expiry configured < 1 hour
- [ ] All API keys rotated from development
- [ ] Supabase security advisors reviewed (0 critical)
- [ ] Rate limiting tested under load
- [ ] Security headers validated (securityheaders.com)
- [ ] CSP violations monitored
- [ ] Sentry alerts configured

### Ongoing
- [ ] Monthly security dependency updates
- [ ] Quarterly penetration testing
- [ ] Annual security audit
- [ ] Regular backup verification

---

## Related Documentation

- [PRODUCTION_AUDIT_PLAN.md](../PRODUCTION_AUDIT_PLAN.md) - Full audit plan
- [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) - Launch requirements
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture

---

**Document Maintainer:** Security Team  
**Review Schedule:** Monthly
