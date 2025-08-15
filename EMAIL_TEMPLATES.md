# Driplo Email Templates for Supabase + Resend

## 1. Email Confirmation Template

**Subject:** Verify your email address

**HTML Template:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your Driplo account</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff;">
                    <!-- Logo -->
                    <tr>
                        <td style="padding: 48px 40px 32px 40px; text-align: center;">
                            <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #000000; letter-spacing: -0.5px;">
                                Driplo
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 0 40px 32px 40px;">
                            <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #000000;">
                                Verify your email address
                            </h2>
                            <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #525252;">
                                To complete your Driplo account setup and start buying and selling clothes, please verify your email address.
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 500; border-radius: 6px;">
                                            Verify Email Address
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Alternative Link -->
                    <tr>
                        <td style="padding: 0 40px 40px 40px;">
                            <p style="margin: 0 0 8px 0; font-size: 13px; color: #737373;">
                                Or copy and paste this link into your browser:
                            </p>
                            <p style="margin: 0; font-size: 13px; word-break: break-all; color: #737373;">
                                {{ .ConfirmationURL }}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #e5e5e5;">
                            <p style="margin: 0; font-size: 13px; line-height: 20px; color: #737373; text-align: center;">
                                This link will expire in 24 hours.<br>
                                If you didn't create an account, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                </table>
                
                <!-- Company Footer -->
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px;">
                    <tr>
                        <td style="padding: 24px 40px; text-align: center;">
                            <p style="margin: 0; font-size: 13px; color: #a3a3a3;">
                                © 2025 Driplo. All rights reserved.<br>
                                <a href="https://driplo.xyz" style="color: #737373; text-decoration: none;">driplo.xyz</a> · 
                                <a href="mailto:hi@driplo.xyz" style="color: #737373; text-decoration: none;">hi@driplo.xyz</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

## 2. Password Reset Template

**Subject:** Reset your password

**HTML Template:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset your password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff;">
                    <!-- Logo -->
                    <tr>
                        <td style="padding: 48px 40px 32px 40px; text-align: center;">
                            <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #000000; letter-spacing: -0.5px;">
                                Driplo
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 0 40px 32px 40px;">
                            <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #000000;">
                                Reset your password
                            </h2>
                            <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #525252;">
                                We received a request to reset your password. Click the button below to choose a new password.
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 500; border-radius: 6px;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Alternative Link -->
                    <tr>
                        <td style="padding: 0 40px 40px 40px;">
                            <p style="margin: 0 0 8px 0; font-size: 13px; color: #737373;">
                                Or copy and paste this link into your browser:
                            </p>
                            <p style="margin: 0; font-size: 13px; word-break: break-all; color: #737373;">
                                {{ .ConfirmationURL }}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #e5e5e5;">
                            <p style="margin: 0; font-size: 13px; line-height: 20px; color: #737373; text-align: center;">
                                This link will expire in 1 hour.<br>
                                If you didn't request a password reset, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                </table>
                
                <!-- Company Footer -->
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px;">
                    <tr>
                        <td style="padding: 24px 40px; text-align: center;">
                            <p style="margin: 0; font-size: 13px; color: #a3a3a3;">
                                © 2025 Driplo. All rights reserved.<br>
                                <a href="https://driplo.xyz" style="color: #737373; text-decoration: none;">driplo.xyz</a> · 
                                <a href="mailto:hi@driplo.xyz" style="color: #737373; text-decoration: none;">hi@driplo.xyz</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

## 3. Magic Link Template

**Subject:** Sign in to Driplo

**HTML Template:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign in to Driplo</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff;">
                    <!-- Logo -->
                    <tr>
                        <td style="padding: 48px 40px 32px 40px; text-align: center;">
                            <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #000000; letter-spacing: -0.5px;">
                                Driplo
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 0 40px 32px 40px;">
                            <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #000000;">
                                Sign in to your account
                            </h2>
                            <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #525252;">
                                Click the button below to sign in to your Driplo account. No password needed.
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 500; border-radius: 6px;">
                                            Sign In
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Alternative Link -->
                    <tr>
                        <td style="padding: 0 40px 40px 40px;">
                            <p style="margin: 0 0 8px 0; font-size: 13px; color: #737373;">
                                Or copy and paste this link into your browser:
                            </p>
                            <p style="margin: 0; font-size: 13px; word-break: break-all; color: #737373;">
                                {{ .ConfirmationURL }}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #e5e5e5;">
                            <p style="margin: 0; font-size: 13px; line-height: 20px; color: #737373; text-align: center;">
                                This link will expire in 1 hour.<br>
                                If you didn't request this link, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                </table>
                
                <!-- Company Footer -->
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px;">
                    <tr>
                        <td style="padding: 24px 40px; text-align: center;">
                            <p style="margin: 0; font-size: 13px; color: #a3a3a3;">
                                © 2025 Driplo. All rights reserved.<br>
                                <a href="https://driplo.xyz" style="color: #737373; text-decoration: none;">driplo.xyz</a> · 
                                <a href="mailto:hi@driplo.xyz" style="color: #737373; text-decoration: none;">hi@driplo.xyz</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

## How to Configure in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Email Templates**
3. For each template type (Confirm signup, Reset password, Magic Link):
   - Toggle "Enable custom template"
   - Paste the HTML template above
   - Save changes

4. Go to **Authentication** → **SMTP Settings**
5. Configure with Resend:
   ```
   Enable custom SMTP: ON
   Sender email: hi@driplo.xyz
   Sender name: Driplo
   Host: smtp.resend.com
   Port: 465
   Username: resend
   Password: [Your Resend API Key]
   ```

## Resend Setup Steps

1. **Add Domain to Resend:**
   - Login to Resend Dashboard
   - Go to Domains → Add Domain
   - Enter: driplo.xyz
   - Add the DNS records shown (DKIM, SPF, DMARC)

2. **Get API Key:**
   - Go to API Keys
   - Create new API key
   - Copy the key (starts with `re_`)

3. **Verify Domain:**
   - Wait for DNS propagation (5-30 minutes)
   - Click "Verify DNS records" in Resend

## Vercel Environment Variables

Add to your Vercel project settings:
```
RESEND_API_KEY=re_your_api_key
```

## Testing

After setup, test the flow:
1. Sign up with a test email
2. Check inbox for verification email
3. Verify link works correctly
4. Test password reset flow