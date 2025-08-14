# Minimal Stripe Setup (No Webhooks Required)

## 🚀 Quick Launch Guide - No Custom Domain Needed!

### Step 1: Get Stripe Keys (2 minutes)
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click "Developers" → "API keys"
3. Copy these two keys:
   - **Publishable key**: `pk_test_51...`
   - **Secret key**: `sk_test_51...`

### Step 2: Deploy to Vercel (5 minutes)
```bash
# Deploy your app
vercel

# Your app will be available at:
# https://driplo-turbo-xxx.vercel.app (or similar)
```

### Step 3: Add Environment Variables in Vercel
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these **3 required variables**:
```bash
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51ABC123...
STRIPE_SECRET_KEY=sk_test_51ABC123...
PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
```

**That's it! No webhooks needed initially.**

## ✅ What Works Without Webhooks:
- ✅ Complete payment processing
- ✅ Stripe checkout flow
- ✅ Payment success/failure handling
- ✅ Order creation in your database

## 🔄 What You Miss Without Webhooks:
- ❌ Automatic order status updates
- ❌ Handling edge cases (network issues during payment)
- ❌ Real-time payment notifications

## 🧪 Test Your Payment Flow:
1. Visit your deployed app
2. Go to checkout page: `/checkout/test-product`
3. Use test card: `4242 4242 4242 4242`
4. Any future date, any CVC
5. Payment should complete successfully!

## 📱 Vercel Domain Facts:
- ✅ **Stripe works with Vercel domains**: `your-app.vercel.app`
- ✅ **No custom domain required** for payments
- ✅ **Webhooks work with Vercel** if you add them later
- ✅ **Production ready** on free Vercel plan

## 🎯 Next Steps:
1. **Start with minimal setup** (just API keys)
2. **Test payments thoroughly**
3. **Add webhooks later** when you're ready
4. **Buy custom domain** only if you want branding

---

## Ready to Launch? Just Need:
1. Your Stripe **publishable key** (`pk_test_...`)
2. Your Stripe **secret key** (`sk_test_...`)
3. Deploy to Vercel and add those 2 environment variables

**No domain purchase required!** 🎉