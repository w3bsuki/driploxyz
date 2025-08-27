# 📱 DRIPLO PROJECT SPECIFICATION

## 🎯 **Project Overview**

### **Mission Statement**
Build the world's fastest mobile-first C2C clothing marketplace that combines Vinted's simplicity with Depop's social engagement, delivering superior mobile UX to dominate the €5B+ secondhand fashion market.

### **Target Market**
- **Primary**: Gen Z (18-25) mobile-native fashion enthusiasts
- **Secondary**: Millennials (26-35) sustainable fashion advocates  
- **Geographic**: EU/UK initial launch, global expansion ready
- **Market Size**: €5B+ European secondhand clothing market

### **Unique Value Proposition**
- **2x Faster**: <2s mobile loading vs competitors' 3-5s
- **Native Feel**: True mobile-first, not responsive afterthought
- **Perfect Balance**: Social features without complexity
- **Zero Friction**: 3-step listing vs Depop's professional requirements

## 🏗 **Technical Architecture**

### **Tech Stack**
```yaml
Frontend:
  Framework: Svelte 5.2.14 + SvelteKit 2.15.0
  Styling: TailwindCSS v4 (OKLCH color system)
  Language: TypeScript 5.7 (strict mode)
  State: Svelte stores + $state runes
  
Backend:
  Database: Supabase (PostgreSQL 15)
  Auth: Supabase Auth (email/social)
  Storage: Supabase Storage (S3 compatible)
  Payments: Stripe Connect (marketplace model)
  
Infrastructure:
  Hosting: Vercel Edge Functions
  CDN: Vercel Global CDN
  Monitoring: Vercel Analytics
  Build: Turborepo + pnpm workspaces
```

### **System Architecture**
```
┌─────────────────────────────────────┐
│         Mobile PWA (375px+)         │
├─────────────────────────────────────┤
│     SvelteKit SSR/Edge Functions    │
├─────────────────────────────────────┤
│         Supabase Services           │
│  ┌──────────┬─────────┬──────────┐ │
│  │ Database │  Auth   │ Storage  │ │
│  └──────────┴─────────┴──────────┘ │
├─────────────────────────────────────┤
│     External Services               │
│  ┌──────────┬─────────────────────┐│
│  │  Stripe  │  Email (Resend)    ││
│  └──────────┴─────────────────────┘│
└─────────────────────────────────────┘
```

### **Monorepo Structure**
```
apps/
  web/              # Main marketplace application
    src/
      routes/       # SvelteKit file-based routing
      lib/          # Shared utilities and components
      
packages/
  ui/              # Component library (@repo/ui)
  database/        # Database types and utilities
  i18n/           # Internationalization (Paraglide)
  config-*/       # Shared configurations
```

## ✨ **Features Inventory**

### **Core Commerce Features**
- ✅ **Product Listings**: Multi-image (10 max), categories, conditions
- ✅ **Search & Discovery**: Real-time search, filters, sorting
- ✅ **Shopping Cart**: Add to cart, quantity management
- ✅ **Checkout**: Stripe payment, shipping address, order confirmation
- ✅ **Order Management**: Status tracking, history, receipts

### **User Features**
- ✅ **Authentication**: Email/password, social login ready
- ✅ **Profiles**: Public profiles, ratings, reviews, followers
- ✅ **Messaging**: Real-time chat between buyers/sellers
- ✅ **Notifications**: In-app, push-ready architecture
- ✅ **Favorites**: Save products, create collections

### **Seller Features**
- ✅ **Quick Listing**: 3-step mobile flow (Category → Photos → Details)
- ✅ **Dashboard**: Sales analytics, inventory management
- ✅ **Payouts**: Stripe Connect, multiple payout methods
- ✅ **Promotions**: Highlight products, bundle deals
- ✅ **Insights**: View counts, conversion metrics

### **Mobile-First UX**
- ✅ **Bottom Navigation**: iOS/Android native pattern
- ✅ **Touch Optimized**: 44px primary, 36px secondary targets
- ✅ **PWA Ready**: Installable, offline support structure
- ✅ **Gestures**: Swipe galleries, pull-to-refresh ready
- ✅ **Safe Areas**: iOS notch, Android navigation support

### **Admin Features**
- ✅ **User Management**: Ban, verify, moderate users
- ✅ **Content Moderation**: Flag system, review queue
- ✅ **Analytics Dashboard**: Revenue, user metrics, trends
- ✅ **Payout Management**: Process seller payments
- ✅ **System Health**: Performance monitoring, error tracking

## 📊 **Competitive Analysis**

### **Market Leaders Comparison**

| Feature | Vinted | Depop | **Driplo** |
|---------|---------|--------|------------|
| **Valuation** | €5B | $1.6B | - |
| **Users** | 100M+ | 35M+ | Target: 1M Y1 |
| **Mobile Performance** | 3-5s LCP | 3-5s LCP | **<2s LCP** |
| **Listing Process** | 5 steps | Complex | **3 steps** |
| **Touch Targets** | 36px | 36px | **44px** |
| **Social Features** | Basic | Heavy | **Balanced** |
| **Fees** | 0% + buyer protection | 10% | **5% planned** |
| **PWA Support** | No | No | **Yes** |

### **Competitive Advantages**
1. **Performance**: Svelte 5's superior mobile performance
2. **UX Design**: Larger touch targets, native gestures
3. **Simplicity**: Streamlined flows vs Depop complexity
4. **Social Balance**: More engaging than Vinted, simpler than Depop
5. **Technology**: Modern stack vs legacy React apps

## 💼 **Business Model**

### **Revenue Streams**
1. **Transaction Fees**: 5% seller fee (vs Depop's 10%)
2. **Premium Sellers**: Subscription for pro features
3. **Promoted Listings**: Paid visibility boosts
4. **Buyer Protection**: Optional insurance fee

### **Key Metrics (Targets)**
- **Conversion Rate**: 3%+ (beat Vinted's 2-2.5%)
- **Mobile Bounce Rate**: <40%
- **Average Order Value**: €35-50
- **Seller Retention**: 60% monthly active
- **LTV:CAC Ratio**: 3:1 minimum

## 🔒 **Security & Compliance**

### **Data Protection**
- **GDPR Compliant**: EU data regulations
- **PCI DSS**: Stripe handles payment security
- **Password Security**: Bcrypt hashing, 2FA ready
- **Data Encryption**: TLS 1.3, encrypted at rest

### **User Safety**
- **Identity Verification**: Email confirmation, phone optional
- **Seller Verification**: Bank account linkage via Stripe
- **Content Moderation**: AI + manual review pipeline
- **Fraud Prevention**: Stripe Radar integration

### **Platform Policies**
- **Terms of Service**: User agreements, seller terms
- **Privacy Policy**: Data collection, usage, rights
- **Community Guidelines**: Prohibited items, behavior
- **Refund Policy**: Buyer protection program

## 📈 **Success Criteria**

### **Technical KPIs**
- ✅ Mobile LCP <2s (currently 820ms)
- ⚠️ 0 TypeScript errors (71 remaining)
- ✅ 44px touch targets (implemented)
- ✅ PWA score >90 (achievable)
- ✅ Bundle size <200KB initial

### **Business KPIs**
- [ ] 10,000 active listings within 3 months
- [ ] 1,000 monthly transactions by month 6
- [ ] 3% conversion rate sustained
- [ ] 60% mobile traffic share
- [ ] 4.5+ App Store rating equivalent

### **User Experience KPIs**
- [ ] <40% mobile bounce rate
- [ ] >3 minutes average session
- [ ] >60% returning user rate
- [ ] <3 seconds task completion
- [ ] >80% user satisfaction score

## 🌍 **Internationalization**

### **Supported Languages**
- 🇬🇧 English (primary)
- 🇧🇬 Bulgarian (implemented)
- 🇷🇺 Russian (implemented)
- 🇺🇦 Ukrainian (implemented)

### **Localization Features**
- **Currency**: Multi-currency support ready
- **Shipping**: Country-specific shipping rates
- **Payment Methods**: Local payment options via Stripe
- **Content**: Translated UI, categories, emails

## 🚀 **Project Status**

### **Current Phase**: Pre-Production Cleanup
- **Completion**: 85% feature complete
- **Blockers**: TypeScript errors, code cleanup needed
- **Timeline**: Production launch Q4 2025

### **Development Team**
- **Frontend**: Svelte 5 specialists required
- **Backend**: Supabase/PostgreSQL experience
- **Mobile**: PWA and performance optimization focus
- **Design**: Mobile-first UI/UX expertise

---

*Last Updated: August 27, 2025*
*Version: 1.0.0*
*Status: Pre-Production*