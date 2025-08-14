# Complete Stripe Setup Guide for Driplo

## Step 1: Stripe Dashboard Setup

### 1.1 Get Your API Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click "Developers" → "API keys"
3. Copy these keys (we'll use them later):
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

### 1.2 Configure Webhooks (OPTIONAL - Not Required Initially)

**IMPORTANT**: Webhooks are NOT mandatory for basic payment processing! You can launch without them.

**What webhooks do**: Automatically update order status when payments complete
**Without webhooks**: Payments still work, but you'll need to manually check payment status

If you want to set up webhooks later:
1. In Stripe Dashboard, go to "Developers" → "Webhooks"
2. Click "Add endpoint"
3. Set endpoint URL to: `https://your-project-name.vercel.app/api/webhooks/stripe`
   - ✅ Vercel domains work fine: `driplo-turbo.vercel.app`
   - ✅ No custom domain needed
4. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed` 
   - `payment_intent.canceled`
5. Click "Add endpoint"
6. Copy the **Webhook signing secret** (starts with `whsec_`)

### 1.3 Business Settings
1. Go to "Settings" → "Business settings"
2. Fill in your business information
3. Add bank account for payouts
4. Complete tax information

## Step 2: Vercel Deployment Setup

### 2.1 Deploy to Vercel
```bash
# If you haven't already, install Vercel CLI
npm i -g vercel

# In your project root
vercel

# Follow prompts to link your project
```

### 2.2 Set Environment Variables in Vercel
After deployment, go to your Vercel dashboard and add these environment variables:

#### Production Environment Variables
```bash
# Supabase (from your Supabase dashboard)
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (from Step 1.1)
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51... (or pk_live_51... for production)
STRIPE_SECRET_KEY=sk_test_51... (or sk_live_51... for production)

# Stripe Webhook (OPTIONAL - only if you set up webhooks)
STRIPE_WEBHOOK_SECRET=whsec_... (leave empty if no webhooks)
```

#### How to Add in Vercel:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add each variable:
   - **Name**: Variable name (e.g., `PUBLIC_STRIPE_PUBLISHABLE_KEY`)
   - **Value**: Your actual key
   - **Environment**: Select "Production", "Preview", and "Development"

## Step 3: Test Your Setup

### 3.1 Test Cards for Development
Use these test card numbers in your development environment:

```
# Successful payment
4242 4242 4242 4242

# Declined payment
4000 0000 0000 0002

# Requires authentication
4000 0025 0000 3155

# Any future expiry date (e.g., 12/34)
# Any 3-digit CVC
# Any postal code
```

### 3.2 Test the Payment Flow
1. Visit your deployed site: `https://your-project.vercel.app`
2. Navigate to a product page
3. Click "Buy Now" or similar
4. Use test card `4242 4242 4242 4242`
5. Complete the payment

### 3.3 Verify Webhooks
1. In Stripe Dashboard, go to "Developers" → "Webhooks"
2. Click on your webhook endpoint
3. Check the "Recent deliveries" to see if events are being received

## Step 4: Production Checklist

### 4.1 Switch to Live Mode
When ready for real payments:
1. In Stripe Dashboard, toggle from "Test" to "Live" mode
2. Get new live API keys (starting with `pk_live_` and `sk_live_`)
3. Update your Vercel environment variables with live keys
4. Update webhook endpoint if domain changed

### 4.2 Security Verification
- [ ] All API keys are properly configured
- [ ] Webhook secret is correctly set
- [ ] No test keys in production environment
- [ ] HTTPS is enabled on your domain

## Step 5: Information I Need From You

Please provide me with these details so I can help you configure everything:

### 5.1 Your Stripe Keys (Masked)
```
Publishable Key: pk_test_51ABC...XYZ (just show first/last few chars)
Secret Key: sk_test_51ABC...XYZ (just show first/last few chars)  
Webhook Secret: whsec_ABC...XYZ (just show first/last few chars)
```

### 5.2 Your Deployment Info
```
Vercel Project URL: https://your-project.vercel.app
Supabase Project URL: https://your-project.supabase.co
Custom Domain (if any): https://yourdomain.com
```

### 5.3 Any Errors You're Seeing
- Screenshots of any error messages
- Browser console errors
- Vercel deployment logs if there are issues

## Step 6: Common Issues & Solutions

### Issue 1: "Invalid API Key"
**Cause**: Wrong environment (test vs live) or incorrect key format
**Solution**: 
- Verify you're using the right key for your environment
- Check the key starts with correct prefix (`pk_test_` or `sk_test_`)

### Issue 2: "Webhook Verification Failed"
**Cause**: Incorrect webhook secret or URL mismatch
**Solution**:
- Verify webhook URL matches exactly: `/api/webhooks/stripe`
- Check webhook secret in environment variables
- Ensure HTTPS is used

### Issue 3: "Payment Element Not Loading"
**Cause**: Missing or incorrect publishable key
**Solution**:
- Verify `PUBLIC_STRIPE_PUBLISHABLE_KEY` is set in Vercel
- Check browser console for errors
- Ensure key is publicly accessible (starts with `PUBLIC_`)

## Step 7: Monitoring & Maintenance

### 7.1 Monitor Payments
- Check Stripe Dashboard regularly for failed payments
- Set up email notifications for important events
- Monitor webhook delivery success rates

### 7.2 Handle Disputes
- Respond to chargebacks promptly in Stripe Dashboard
- Keep order records and customer communication
- Use Stripe Radar for fraud prevention

## Quick Commands for Testing

```bash
# Test webhook locally (requires Stripe CLI)
stripe listen --forward-to localhost:5173/api/webhooks/stripe

# Trigger test webhook
stripe trigger payment_intent.succeeded

# Check webhook logs
stripe logs tail
```

---

## What to Send Me

1. **Stripe Keys** (first 10 and last 4 characters only for security)
2. **Your Vercel URL** 
3. **Any error messages** you're seeing
4. **Screenshots** of your Stripe webhook configuration

Example:
```
Publishable: pk_test_51Abc...xyz9
Secret: sk_test_51Abc...xyz9  
Webhook: whsec_1234...xyz9
Vercel URL: https://driplo-turbo.vercel.app
```

Once you provide this info, I can help you troubleshoot any issues and ensure everything is working perfectly!