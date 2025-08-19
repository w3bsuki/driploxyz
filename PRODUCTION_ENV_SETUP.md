# Production Environment Variables Setup Guide

This guide covers all required environment variables for secure production deployment of Driplo.

## Critical Security Requirements

**⚠️ NEVER commit actual secrets to version control**
- Use secure environment variable management (Vercel, AWS Secrets Manager, etc.)
- Generate cryptographically secure random values for all secrets
- Rotate secrets regularly in production

## Required Environment Variables

### Supabase Configuration
```bash
# Required - Your Supabase project URL
PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Required - Supabase anonymous key (public, safe to expose)
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Required - Service role key (SECRET - never expose to client)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional - For Supabase Management API operations
SUPABASE_ACCESS_TOKEN=your_supabase_management_token
```

### Security Secrets (CRITICAL)
```bash
# Required - 32+ character random string for rate limiting
# Generate with: openssl rand -hex 32
RATE_LIMIT_SECRET=your_secure_random_string_64_chars_minimum

# Required - 32+ character random string for CSRF protection  
# Generate with: openssl rand -hex 32
CSRF_SECRET=your_secure_random_string_64_chars_minimum
```

### Stripe Payment Processing
```bash
# Required for payments - Stripe publishable key (public)
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key

# Required for payments - Stripe secret key (SECRET)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key

# Required for webhooks - Stripe webhook secret (SECRET)
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
```

### Email Service (Optional but Recommended)
```bash
# Resend API key for transactional emails
RESEND_API_KEY=your_resend_api_key
```

### Monitoring & Error Tracking (Optional)
```bash
# Sentry DSN for error tracking
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project
```

### Environment Configuration
```bash
# Set to production for production deployments
PUBLIC_ENVIRONMENT=production
NODE_ENV=production
```

## Security Validation Checklist

### ✅ Before Production Deployment

1. **Secret Generation**
   - [ ] All secrets are cryptographically secure (32+ chars)
   - [ ] No development/test secrets in production
   - [ ] Secrets are unique per environment

2. **Access Control**
   - [ ] Service role key is never exposed to client
   - [ ] Stripe secret keys are properly secured
   - [ ] Webhook secrets are correctly configured

3. **Rate Limiting**
   - [ ] RATE_LIMIT_SECRET is set and secure
   - [ ] Rate limiting is enabled in production

4. **CSRF Protection**
   - [ ] CSRF_SECRET is set and secure
   - [ ] CSRF protection is enabled

5. **Database Security**
   - [ ] RLS policies are active
   - [ ] Service role usage is minimal and secured
   - [ ] Database audit logs are enabled

## Generating Secure Secrets

### Using OpenSSL (Recommended)
```bash
# Generate 64-character hex string
openssl rand -hex 32

# Generate 44-character base64 string
openssl rand -base64 32
```

### Using Node.js
```javascript
// Generate secure random string
crypto.randomBytes(32).toString('hex')
```

### Using Python
```python
import secrets
secrets.token_hex(32)  # 64-character hex
secrets.token_urlsafe(32)  # URL-safe base64
```

## Deployment Platform Setup

### Vercel
```bash
# Set environment variables via CLI
vercel env add RATE_LIMIT_SECRET
vercel env add CSRF_SECRET
# ... etc for all variables
```

### Netlify
```bash
# Set via Netlify CLI
netlify env:set RATE_LIMIT_SECRET "your_secret_here"
netlify env:set CSRF_SECRET "your_secret_here"
```

### Manual Platform Setup
1. Copy `.env.example` to your deployment platform
2. Replace all placeholder values with production secrets
3. Verify all required variables are set
4. Test deployment in staging first

## Security Best Practices

1. **Secret Rotation**
   - Rotate CSRF_SECRET monthly
   - Rotate RATE_LIMIT_SECRET monthly
   - Monitor for any exposed secrets

2. **Access Logging**
   - Enable audit logs for all secret access
   - Monitor for unusual access patterns
   - Alert on failed authentication attempts

3. **Environment Isolation**
   - Use separate secrets for staging/production
   - Never reuse development secrets
   - Implement proper CI/CD secret management

## Verification Commands

```bash
# Verify all required env vars are set (run in production)
node -e "
const required = [
  'PUBLIC_SUPABASE_URL',
  'PUBLIC_SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY',
  'RATE_LIMIT_SECRET',
  'CSRF_SECRET'
];
required.forEach(key => {
  if (!process.env[key]) {
    console.error(\`Missing required environment variable: \${key}\`);
    process.exit(1);
  }
});
console.log('✅ All required environment variables are set');
"
```

## Troubleshooting

### Rate Limiting Issues
- Verify RATE_LIMIT_SECRET is set and 32+ characters
- Check rate limiter is properly imported and used
- Monitor rate limiting logs

### CSRF Protection Issues  
- Verify CSRF_SECRET is set and 32+ characters
- Ensure CSRF tokens are properly generated
- Check form submissions include CSRF tokens

### Authentication Issues
- Verify Supabase keys are correct and active
- Check service role key permissions
- Monitor Supabase auth logs

---

**🔒 Security Note**: This configuration enables production-ready security for a C2C marketplace platform handling user transactions and sensitive data. All security measures have been tested and validated.