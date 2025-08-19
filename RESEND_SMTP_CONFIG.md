# Configure Supabase to Use Resend SMTP

## Your Resend SMTP Settings

Go to **Supabase Dashboard → Project Settings → Auth → SMTP Settings** and enter:

```
SMTP Host: smtp.resend.com
SMTP Port: 465
SMTP User: resend
SMTP Pass: re_SkiowXbt_6C9jYDVKZ8nUj4jdXsMc5kL5
Sender Email: onboarding@resend.dev (or your verified domain email)
Sender Name: Driplo
```

## Steps to Configure:

1. **Go to Supabase Dashboard**
   - Navigate to Authentication → Settings
   - Scroll to "SMTP Settings"
   - Toggle "Enable Custom SMTP"

2. **Enter Resend SMTP Details:**
   - **Host:** `smtp.resend.com`
   - **Port:** `465` (SSL) or `587` (TLS)
   - **Username:** `resend`
   - **Password:** `re_SkiowXbt_6C9jYDVKZ8nUj4jdXsMc5kL5`
   - **Sender email:** `onboarding@resend.dev` (default) or your verified domain
   - **Sender name:** `Driplo`

3. **Test Configuration**
   - Click "Send Test Email"
   - Enter your email address
   - Verify you receive the test email

4. **Update Email Templates** (optional)
   - Go to Authentication → Email Templates
   - Customize the verification email template
   - Use your brand colors and messaging

## Alternative: Direct Resend API Integration

If SMTP doesn't work, we can send emails directly through Resend API (already implemented in your code at `src/lib/email/resend.ts`).

## Verify Domain (For Production)

For production, verify your domain in Resend:
1. Go to https://resend.com/domains
2. Add your domain (driplo.xyz)
3. Add the DNS records shown
4. Update sender email to `noreply@driplo.xyz`

## Important Notes
- The API key `re_SkiowXbt_6C9jYDVKZ8nUj4jdXsMc5kL5` is already in your `.env.local`
- Default sender `onboarding@resend.dev` works for testing
- For production, use your verified domain email