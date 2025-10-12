# Supabase Security Advisors Report

**Date**: 2025-10-12
**Project**: koowfhsaqmarfdkwsfiz

## Security Advisors (3 Warnings)

### 1. Auth OTP Long Expiry ⚠️
- **Level**: WARN
- **Category**: SECURITY
- **Description**: OTP expiry exceeds recommended threshold
- **Detail**: Email provider OTP expiry is set to more than an hour. Recommended: <1 hour
- **Remediation**: https://supabase.com/docs/guides/platform/going-into-prod#security
- **Action Required**: Update Auth settings to reduce OTP expiry to <60 minutes

### 2. Leaked Password Protection Disabled ⚠️
- **Level**: WARN
- **Category**: SECURITY
- **Description**: Leaked password protection is currently disabled
- **Detail**: Supabase Auth can check passwords against HaveIBeenPwned.org to prevent use of compromised passwords
- **Remediation**: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
- **Action Required**: Enable leaked password protection in Auth settings

### 3. Vulnerable Postgres Version ⚠️
- **Level**: WARN
- **Category**: SECURITY
- **Description**: Current Postgres version has security patches available
- **Detail**: Current version: supabase-postgres-17.4.1.074 has outstanding security patches
- **Remediation**: https://supabase.com/docs/guides/platform/upgrading
- **Action Required**: Schedule database upgrade to latest Postgres version

## Migrations Status ✅

**Total Migrations**: 353 migrations applied successfully
**Latest Migration**: `20251011081545_fix_products_public_access_rls`
**Status**: All migrations applied correctly

### Recent Migrations (Last 10):
1. 20251008125831 - add_regional_pricing_support
2. 20251011081545 - fix_products_public_access_rls
3. 20251008125533 - optimize_critical_rls_policies
4. 20251008125404 - fix_rls_policies_corrected
5. 20251008125150 - add_missing_indexes
6. 20251008125023 - remove_duplicate_indexes
7. 20251008124953 - remove_unused_indexes_batch_4
8. 20251008124927 - remove_unused_indexes_batch_3
9. 20251008124858 - remove_unused_indexes_batch_2
10. 20251008124828 - remove_unused_indexes_batch_1

## Recommendations

**Critical Actions**:
1. ✅ Database migrations are healthy - no action needed
2. ⚠️ Enable leaked password protection (high priority security feature)
3. ⚠️ Reduce OTP expiry to <1 hour (recommended best practice)
4. ⚠️ Schedule Postgres upgrade during maintenance window (security patches available)

**Non-Critical**: All warnings are configuration-based, no data integrity issues found.
