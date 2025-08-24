# Country-Based Filtering Implementation Guide

## ✅ What's Been Implemented

### 1. **Database Structure**
- Added `country_code` column to `products`, `profiles`, and `orders` tables
- Created `country_config` table for managing country-specific settings
- Added automatic triggers to set country codes on insert
- Implemented indexes for performance optimization

### 2. **Server-Side Detection**
- IP-based country detection using ipapi.co (free tier)
- Cookie-based country persistence
- URL parameter override for testing (`?country=GB`)
- Automatic fallback chain: URL → Cookie → IP → Default (BG)

### 3. **Components Created**
- `CountrySwitcher.svelte` - Dropdown/inline/modal country selector
- `CountryDetectionBanner.svelte` - Auto-detection suggestion banner
- Both components exported from `@repo/ui` package

### 4. **Helper Functions**
- `getUserCountry()` - Get user's country with fallback
- `getProductsByCountry()` - Fetch products filtered by country
- `formatPriceForCountry()` - Format prices in local currency
- `convertPrice()` - Basic currency conversion

## 📝 How to Use

### 1. **In Your Pages (+page.server.ts)**

```typescript
import { getProductsByCountry } from '$lib/supabase/country-queries';

export async function load({ locals }) {
  const country = locals.country; // Automatically set by server hooks
  
  // Fetch products for user's country
  const { data: products } = await getProductsByCountry(
    locals.supabase,
    country,
    20 // limit
  );
  
  return {
    products,
    country
  };
}
```

### 2. **In Your Components**

```svelte
<script>
  import { CountrySwitcher } from '@repo/ui';
  
  let { data } = $props();
</script>

<!-- Add country switcher to header -->
<CountrySwitcher 
  currentCountry={data.country}
  variant="dropdown"
  showFlag={true}
/>

<!-- Display products filtered by country -->
{#each data.products as product}
  <ProductCard {product} country={data.country} />
{/each}
```

### 3. **Country Detection Banner**

```svelte
<script>
  import { CountryDetectionBanner } from '@repo/ui';
  import { detectCountryFromIP } from '$lib/country/detection';
  
  let showBanner = $state(false);
  let detectedCountry = $state(null);
  
  onMount(async () => {
    // Only show if country mismatch
    const detected = await detectCountryFromIP();
    if (detected && detected !== data.country) {
      detectedCountry = detected;
      showBanner = true;
    }
  });
  
  function handleAccept() {
    // Switch to detected country
    goto(`?country=${detectedCountry}`);
  }
</script>

{#if showBanner}
  <CountryDetectionBanner
    {detectedCountry}
    currentCountry={data.country}
    onAccept={handleAccept}
    onDismiss={() => showBanner = false}
  />
{/if}
```

### 4. **Creating Products with Country**

```typescript
import { createProductInCountry } from '$lib/supabase/country-queries';

// Product automatically assigned to user's country
const { data: product } = await createProductInCountry(
  supabase,
  locals.country,
  productData
);
```

## 🌍 Supported Countries

| Country | Code | Currency | Locale |
|---------|------|----------|--------|
| Bulgaria | BG | BGN | bg |
| United Kingdom | GB | GBP | en |
| United States | US | USD | en |
| Russia | RU | RUB | ru |
| Ukraine | UA | UAH | ua |
| Germany | DE | EUR | en |
| France | FR | EUR | en |
| Spain | ES | EUR | en |
| Italy | IT | EUR | en |
| Netherlands | NL | EUR | en |
| Poland | PL | PLN | en |
| Romania | RO | RON | en |

## 🚀 Testing

1. **Manual Country Switch**
   - Add `?country=GB` to any URL to switch to UK
   - Cookie will persist the selection

2. **IP Detection**
   - Works automatically in production
   - Falls back to BG in development

3. **Check Current Country**
   ```javascript
   // In browser console
   document.cookie.split(';').find(c => c.includes('country'))
   ```

## 🔄 Migration Notes

### For Existing Data
All existing products/profiles/orders have been set to 'BG' by default. No action needed.

### For UK Launch
1. UK users will automatically see UK products
2. BG users continue seeing BG products
3. Users can manually switch countries if needed
4. Products are isolated by country (no cross-country listings)

## 🎯 Next Steps for Full Implementation

1. **Update all product queries** to use `getProductsByCountry()`
2. **Add CountrySwitcher** to your main navigation
3. **Implement country detection banner** on homepage
4. **Update checkout flow** to handle country-specific pricing
5. **Add currency conversion** for displaying prices

## 💰 Currency Conversion

Currently using basic hardcoded rates. For production:
1. Integrate real-time exchange rate API
2. Cache rates for performance
3. Update `convertPrice()` function

## 🔒 Security Notes

- Country filtering happens at application layer
- RLS policies remain product-agnostic
- Users can view all their own products regardless of country
- Orders inherit country from products

## 📊 Analytics

Track country-specific metrics:
```typescript
const stats = await getCountryStats(supabase, 'GB');
// Returns: totalProducts, totalSellers, monthlyOrders
```

## ⚠️ Important Considerations

1. **Single Backend**: Using one Supabase instance for all countries
2. **Data Isolation**: Products/orders filtered by country
3. **Performance**: Indexed on country_code for fast queries
4. **Scalability**: Can easily add new countries to the enum

## 🆘 Troubleshooting

### Country not detecting?
- Check browser console for errors
- Verify IP detection API is accessible
- Check cookie permissions

### Products not filtering?
- Ensure country_code is set on products
- Check that queries use country parameter
- Verify indexes are created

### Wrong currency showing?
- Update `COUNTRY_CONFIGS` in detection.ts
- Implement proper exchange rate API

## 📚 Files Modified/Created

- `/apps/web/src/lib/country/detection.ts` - Country detection logic
- `/apps/web/src/lib/supabase/country-queries.ts` - Database queries
- `/apps/web/src/lib/server/country.ts` - Server-side setup
- `/packages/ui/src/lib/CountrySwitcher.svelte` - UI component
- `/packages/ui/src/lib/CountryDetectionBanner.svelte` - UI component
- Database migrations for country support