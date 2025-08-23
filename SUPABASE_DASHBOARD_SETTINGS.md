# SUPABASE DASHBOARD CONFIGURATION FOR DRIPLO.XYZ

## 🚨 CRITICAL SETTINGS TO FIX PRODUCTION ISSUES

### 1. AUTHENTICATION SETTINGS
**Go to: Authentication > URL Configuration**

#### Site URL (MUST BE EXACT):
```
https://driplo.xyz
```

#### Redirect URLs (ADD ALL OF THESE):
```
https://driplo.xyz/**
https://driplo.xyz/auth/confirm
https://driplo.xyz/auth/callback
https://driplo.xyz/onboarding
https://driplo.xyz/dashboard
https://driplo.xyz/login
```

### 2. EMAIL TEMPLATES
**Go to: Authentication > Email Templates**

#### Confirm Signup Template:
Change the URL to:
```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup
```

#### Magic Link Template:
```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink
```

#### Change Email Address Template:
```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email_change
```

#### Reset Password Template:
```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password
```

### 3. AUTH PROVIDERS
**Go to: Authentication > Providers**

#### Email Provider Settings:
- Enable Email Provider: ✅
- Confirm Email: ✅ (or temporarily disable for testing)
- Secure Email Change: ✅
- Secure Password Update: ✅

### 4. STORAGE CONFIGURATION
**Go to: Storage > Buckets**

#### Products Bucket:
- Name: `products`
- Public bucket: ✅
- Allowed MIME types: `image/jpeg, image/png, image/webp, image/avif`
- Max file size: 5MB

#### CORS Configuration:
```json
[
  {
    "origin": ["https://driplo.xyz"],
    "allowed_headers": ["authorization", "content-type"],
    "allowed_methods": ["GET", "POST", "PUT", "DELETE"],
    "exposed_headers": ["content-range"],
    "max_age_seconds": 3600
  }
]
```

### 5. DATABASE SETTINGS
**Go to: Settings > Database**

#### Connection Pooling:
- Mode: Transaction
- Pool Size: 15
- Default Pool Timeout: 60 seconds

#### SSL Enforcement:
- Enforce SSL on incoming connections: ✅

### 6. API SETTINGS
**Go to: Settings > API**

#### Rate Limiting:
- Disable rate limiting: ❌ (Keep enabled)
- Requests per minute: 1000 (or adjust based on needs)

#### CORS:
Add `https://driplo.xyz` to allowed origins

### 7. REALTIME CONFIGURATION
**Go to: Realtime > Settings**

#### Enable Realtime:
- Enabled: ✅
- Max concurrent users: 200
- Max events per second: 10

### 8. ROW LEVEL SECURITY
**Go to: Authentication > Policies**

Ensure all tables have RLS enabled and proper policies:

#### Critical Tables to Check:
- `profiles` - RLS enabled ✅
- `products` - RLS enabled ✅
- `orders` - RLS enabled ✅
- `messages` - RLS enabled ✅
- `favorites` - RLS enabled ✅

### 9. EDGE FUNCTIONS (if using)
**Go to: Functions**

#### CORS Headers:
```json
{
  "Access-Control-Allow-Origin": "https://driplo.xyz",
  "Access-Control-Allow-Headers": "authorization, content-type"
}
```

### 10. WEBHOOK ENDPOINTS (if using)
**Go to: Database > Webhooks**

Ensure webhook URLs point to:
```
https://driplo.xyz/api/webhooks/supabase
```

## 🔴 TEMPORARY TESTING SETTINGS

### For Initial Testing Only:
1. **Disable Email Confirmation** (Authentication > Settings)
   - Enable email confirmations: ❌
   - This allows immediate login after signup
   - ⚠️ REMEMBER TO RE-ENABLE IN PRODUCTION

2. **Increase JWT Expiry** (Authentication > Settings)
   - JWT expiry limit: 3600 seconds (1 hour)
   - For testing, can increase to 86400 (24 hours)

## ✅ VERIFICATION CHECKLIST

After updating settings, test:

- [ ] User can sign up
- [ ] Verification email arrives (if enabled)
- [ ] Verification link works
- [ ] User can log in
- [ ] Session persists across page refreshes
- [ ] Logout works completely
- [ ] Images upload successfully
- [ ] Realtime features work (if applicable)

## 🚀 DEPLOYMENT VERIFICATION

1. Clear browser cache and cookies
2. Test in incognito/private mode
3. Test on mobile devices
4. Check browser console for errors
5. Monitor Supabase logs for auth errors

## 📝 NOTES

- Always use `https://driplo.xyz` not `http://`
- Don't include trailing slashes in URLs
- Changes may take 1-2 minutes to propagate
- Some settings require clearing browser cookies to test

## 🆘 TROUBLESHOOTING

### If email verification still hangs:
1. Check email template URL format
2. Verify redirect URLs include `/auth/confirm`
3. Check Supabase logs for errors
4. Temporarily disable email confirmation for testing

### If authentication fails:
1. Verify Site URL is exactly `https://driplo.xyz`
2. Check that cookies are being set properly
3. Ensure RLS policies aren't blocking access
4. Check JWT expiry settings

### If images won't upload:
1. Check CORS configuration for storage
2. Verify bucket is public
3. Check file size limits
4. Ensure MIME types are allowed

---
Last Updated: 2025-01-23
Status: CRITICAL - Required for production to work