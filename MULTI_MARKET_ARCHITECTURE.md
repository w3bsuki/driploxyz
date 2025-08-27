# Multi-Market Architecture: Current State

*Analysis of existing country/market system in Driplo*

## 🎯 **Current Architecture**

Driplo already has a sophisticated multi-market system implemented:

- **Server-side country detection** from subdomains/IP/cookies
- **Database filtering** by `country_code` column  
- **12 country configurations** with currencies/locales
- **Automatic user profile sync** when switching markets

## ✅ **What's Already Working**

### Server-Side Detection (`apps/web/src/lib/country/detection.ts`)
- Subdomain detection: `uk.driplo.xyz` → GB, `bg.driplo.xyz` → BG
- IP-based geolocation with country mappings
- Cookie persistence across sessions
- URL parameter overrides for testing

### Database Architecture
- `products.country_code` column filters all queries
- `profiles.country_code` syncs with subdomain access
- Search automatically filters by market (line 145: `.eq('country_code', country)`)

### Country Configurations
```typescript
COUNTRY_CONFIGS = {
  BG: { currency: 'BGN', locale: 'bg', defaultShipping: 5 },
  GB: { currency: 'GBP', locale: 'en', defaultShipping: 3.99 },
  // + 10 more countries with mappings
}
```

## 🏗️ **Current Data Flow**

```
Subdomain/IP → Country Detection → Database Filter → Components
     ↓              ↓                    ↓              ↓
uk.driplo.xyz → locals.country='GB' → WHERE country_code='GB' → Clean Data
```

## 🔧 **What Was Added**

### Client-Side Hook (`apps/web/src/lib/hooks/use-country.ts`)
```typescript
const country = useCountry();
// Provides: { code, config, currency, locale, formatPrice }
```

This eliminates the need for components to access `data.country` from page props.

## 💡 **Key Insight: You Don't Need Major Changes**

Your existing system is excellent. The only improvement needed is the client-side hook, which is now implemented.

## 📋 **Usage Examples**

### Before (Manual Page Data Access)
```svelte
<!-- Component needs page data -->
<script lang="ts">
  let { data } = $props();
  const country = data.country || 'BG';
  const currency = country === 'GB' ? 'GBP' : 'BGN';
</script>
```

### After (Clean Hook)
```svelte
<!-- Component uses hook -->
<script lang="ts">
  import { useCountry } from '$lib/hooks/use-country.js';
  const country = useCountry();
  
  // Access: country.code, country.currency, country.formatPrice()
</script>
```

## 🚀 **Benefits**

### Code Quality
- **No conditionals**: Components don't know about markets
- **Type safety**: Market config is fully typed
- **Testable**: Mock market config easily
- **Maintainable**: Add new markets without touching components

### Performance
- **Bundle splitting**: Market-specific code lazy loads
- **Single build**: One deployment pipeline
- **Optimal size**: ~170KB per market (lazy loaded)

### Developer Experience
- **Clear patterns**: Every dev knows where market logic lives
- **Easy testing**: Switch market config for tests
- **Simple onboarding**: New markets = add config object

## 📦 **Code Organization**

```
lib/
├── market-config.ts           # Central config
├── hooks/
│   └── use-market.ts         # Market detection
├── services/
│   ├── products.ts           # Uses market.supabase
│   ├── checkout.ts           # Uses market.paymentProvider
│   └── search.ts             # Uses market.searchPrefix
└── components/
    ├── SearchBar.svelte      # Clean, no market logic
    ├── ProductCard.svelte    # Clean, no market logic
    └── CheckoutForm.svelte   # Clean, no market logic
```

## ⚡ **Smart Optimizations**

### Lazy Load Market Features
```typescript
// Only load bundle builder for UK
const BundleBuilder = market.features.bundleBuilder 
  ? lazy(() => import('./BundleBuilder.svelte'))
  : null;
```

### Market-Specific Routes
```typescript
// apps/web/src/routes/+layout.server.ts
export async function load({ url }) {
  const market = detectMarket(url.hostname);
  
  return {
    market: market.code,
    features: market.features
  };
}
```

## 🔧 **Migration Strategy**

### Phase 1: Setup Infrastructure
1. Create `market-config.ts` with UK/BG configs
2. Implement `useMarket()` hook
3. Update one component to use pattern

### Phase 2: Migrate Components
1. SearchBar → use `market.supabase`
2. CheckoutForm → use `market.paymentProvider`
3. ProductCard → use `market.currency`

### Phase 3: Optimize
1. Add lazy loading for market-specific features
2. Implement bundle analysis
3. Add market-specific caching

## ✅ **Success Criteria**

- [ ] Zero conditional market logic in components
- [ ] Sub 200KB bundle size per market
- [ ] <2s mobile load time maintained
- [ ] New market addition takes <1 day
- [ ] All TypeScript errors resolved

## 🚨 **Anti-Patterns to Avoid**

```typescript
// ❌ DON'T: Scattered conditionals
if (country === 'uk') {
  return ukSupabase.from('products');
} else {
  return bgSupabase.from('products');
}

// ✅ DO: Use market config
return market.supabase.from('products');
```

```typescript
// ❌ DON'T: Hardcode market logic
const currency = isUK ? 'GBP' : 'BGN';

// ✅ DO: Use market config
const currency = market.currency;
```

## 🎯 **Next Markets**

Adding Romania (`ro.driplo.xyz`):

```typescript
ro: {
  code: 'ro',
  currency: 'RON',
  locale: 'ro-RO',
  supabase: createClient(RO_SUPABASE_URL, RO_SUPABASE_KEY),
  searchPrefix: 'ro_',
  paymentProvider: 'stripe-ro',
  domain: 'ro.driplo.xyz',
  features: {
    bundleBuilder: false,
    premiumListings: false, // Launch basic first
  }
}
```

Total effort: 30 minutes + translations.

---

*One codebase, infinite markets. Scale through configuration, not complexity.*