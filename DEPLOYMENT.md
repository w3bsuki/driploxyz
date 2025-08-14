# Deployment Guide - Driplo

## Production Deployment Checklist

### 1. Environment Variables Setup

Create production environment files with the following variables:

#### Required Environment Variables
```bash
# Supabase Configuration
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe Configuration  
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_endpoint_secret

# Optional: Analytics and Monitoring
PUBLIC_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
SENTRY_DSN=your_sentry_dsn
```

### 2. Stripe Configuration

#### Setup Live Mode
1. Switch your Stripe account to live mode
2. Update all environment variables with live keys (`pk_live_...` and `sk_live_...`)
3. Configure webhook endpoints in Stripe Dashboard:
   - Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events to send:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `payment_intent.canceled`

#### Test Webhooks
```bash
# Install Stripe CLI for local testing
stripe listen --forward-to localhost:5173/api/webhooks/stripe
```

### 3. Database Setup (Supabase)

#### Required Tables
Ensure the following tables exist in your Supabase project:

```sql
-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  buyer_id UUID REFERENCES profiles(id),
  seller_id UUID REFERENCES profiles(id),
  amount INTEGER NOT NULL,
  status TEXT CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
  payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders 
  FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "System can create orders" ON orders 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update orders" ON orders 
  FOR UPDATE USING (true);
```

### 4. Build and Deploy

#### Build the Application
```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run type checking
pnpm check-types

# Run linting
pnpm lint
```

#### Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# Or via CLI:
vercel env add PUBLIC_SUPABASE_URL
vercel env add PUBLIC_SUPABASE_ANON_KEY
# ... etc
```

#### Deploy to Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
netlify deploy --prod --dir=apps/web/build
```

### 5. DNS and SSL

1. Configure your custom domain
2. Ensure SSL certificate is properly configured
3. Update CORS settings in Supabase to include your production domain

### 6. Monitoring and Analytics

#### Setup Error Monitoring
```bash
# Add Sentry DSN to environment variables
SENTRY_DSN=your_sentry_dsn_here
```

#### Setup Analytics
```bash
# Add Google Analytics ID
PUBLIC_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

### 7. Security Checklist

- [ ] All environment variables use production values
- [ ] Stripe is in live mode with live keys
- [ ] Database RLS policies are properly configured
- [ ] CORS settings include only necessary domains
- [ ] Webhook endpoints are secured with proper secrets
- [ ] Error logging is configured but doesn't expose sensitive data

### 8. Performance Optimization

#### Image Optimization
- Configure Supabase Storage with CDN
- Set up image transformations and compression

#### Caching
- Configure CDN caching rules
- Set appropriate cache headers for static assets

### 9. Backup and Recovery

#### Database Backups
- Enable automated daily backups in Supabase
- Test backup restoration process

#### Code Deployment
- Use Git-based deployment for rollback capability
- Tag releases for easy rollback

### 10. Post-Deployment Testing

#### Payment Flow Testing
1. Test with Stripe test cards in production environment
2. Verify webhook delivery and processing
3. Test payment success and failure scenarios

#### User Journey Testing
1. User registration and authentication
2. Product listing and search
3. Complete purchase flow
4. Order management

### Common Issues and Solutions

#### Webhook Delivery Failures
- Check webhook endpoint URL is accessible
- Verify webhook secret is correctly configured
- Monitor webhook delivery in Stripe Dashboard

#### Payment Processing Errors
- Ensure Stripe keys match the environment (test/live)
- Check error logs for API key issues
- Verify webhook signature validation

#### Database Connection Issues
- Check Supabase connection limits
- Verify connection string and credentials
- Monitor database performance metrics

### Production Monitoring

#### Key Metrics to Monitor
- Payment success rate
- Page load times
- Error rates
- User registration/conversion rates
- Database query performance

#### Alerting Setup
- Payment processing failures
- High error rates
- Database performance issues
- Webhook delivery failures

---

## Quick Commands Reference

```bash
# Production build
pnpm build

# Start production server locally
pnpm preview

# Deploy to Vercel
vercel --prod

# Check webhooks
stripe listen --forward-to https://yourdomain.com/api/webhooks/stripe

# Database migrations
npx supabase db push

# Monitor logs
npx supabase functions logs
```