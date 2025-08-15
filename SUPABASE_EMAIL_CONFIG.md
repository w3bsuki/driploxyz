# Supabase Email Configuration Guide

## 1. Configure Redirect URLs in Supabase Dashboard

Go to **Authentication → URL Configuration** and add these URLs:

### Site URL
```
https://driplo.xyz
```

### Redirect URLs (Add ALL of these)
```
https://driplo.xyz/auth/callback
https://driplo.xyz/onboarding
https://driplo.xyz/auth/verify-email
https://driplo.xyz/auth/reset-password
http://localhost:5173/auth/callback
http://localhost:5173/onboarding
http://localhost:5173/auth/verify-email
http://localhost:5173/auth/reset-password
```

## 2. Configure Email Templates in Supabase

Go to **Authentication → Email Templates**

### Confirm Signup Template
- **Enable custom template**: ON
- **Subject**: Verify your email address
- **Redirect URL**: `{{ .SiteURL }}/auth/callback?type=signup`
- **HTML Template**: Use the template from EMAIL_TEMPLATES.md

### Reset Password Template  
- **Enable custom template**: ON
- **Subject**: Reset your password
- **Redirect URL**: `{{ .SiteURL }}/auth/callback?type=recovery&token_hash={{ .TokenHash }}`
- **HTML Template**: Use the template from EMAIL_TEMPLATES.md

### Magic Link Template
- **Enable custom template**: ON
- **Subject**: Sign in to Driplo
- **Redirect URL**: `{{ .SiteURL }}/auth/callback?type=magiclink`
- **HTML Template**: Use the template from EMAIL_TEMPLATES.md

## 3. Configure SMTP with Resend

Go to **Authentication → SMTP Settings**

```
Enable custom SMTP: ON
Sender email: hi@driplo.xyz
Sender name: Driplo
Host: smtp.resend.com
Port: 465
Secure connection: ON
Username: resend
Password: [Your Resend API Key starting with re_]
```

## 4. Email Auth Settings

Go to **Authentication → Providers → Email**

```
Enable Email provider: ON
Confirm email: ON (Required)
Secure email change: ON
Secure password change: ON
Email OTP expiry: 3600 (1 hour)
```

## 5. Auth Flow After Configuration

1. **User signs up** → Receives verification email
2. **User clicks verify link** → Goes to `/auth/callback?type=signup`
3. **Callback checks verification** → Redirects to `/onboarding` if not completed
4. **User completes onboarding** → Redirects to homepage
5. **Future logins** → Skip onboarding if already completed

## 6. Testing the Flow

1. Sign up with a test email
2. Check email for verification link
3. Click link → Should go to `/auth/callback`
4. Automatically redirect to `/onboarding`
5. Complete onboarding → Go to homepage

## 7. Important Notes

- The `{{ .ConfirmationURL }}` in email templates automatically includes the token
- The `/auth/callback` route handles all auth callbacks (signup, recovery, magiclink)
- User's locale preference is stored in their profile after onboarding
- Emails will be sent in user's preferred language once implemented

## 8. Vercel Environment Variables

Add to your Vercel project:

```env
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=re_your_resend_api_key
```

## 9. DNS Configuration for driplo.xyz

Add these DNS records to your domain:

### For Resend (Email Sending)
- **DKIM Records**: Add the 3 CNAME records provided by Resend
- **SPF Record**: TXT record with value from Resend
- **DMARC Record**: TXT record `_dmarc` with value `v=DMARC1; p=none;`

### For Email Receiving (Optional)
- **MX Records**: If you want to receive emails at hi@driplo.xyz

## 10. Troubleshooting

If emails aren't being sent:
1. Check Resend dashboard for API key status
2. Verify DNS records are propagated (can take 5-30 mins)
3. Check Supabase logs for SMTP errors
4. Ensure redirect URLs match exactly (including protocol)
5. Test with a real email address (not example.com)

If redirect isn't working:
1. Ensure URL is in the allowed list
2. Check browser console for errors
3. Verify `/auth/callback` route exists and handles the type parameter
4. Check Supabase logs for auth errors