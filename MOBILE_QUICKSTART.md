# Mobile App - Quick Start Guide 🚀

## Prerequisites Checklist

✅ Node.js 20.x installed
✅ pnpm installed
✅ All dependencies installed (`pnpm install` from root)
✅ Expo Go app on your iOS/Android device
✅ WiFi connection (same network for device and computer)

## Running the Mobile App

### 1. Start the Development Server

```bash
cd k:\driplo-turbo-1\apps\mobile
npx expo start
```

You should see:
```
Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

### 2. Open on Your Device

**iOS:**
1. Open native Camera app
2. Point at QR code
3. Tap the notification
4. Opens in Expo Go

**Android:**
1. Open Expo Go app
2. Tap "Scan QR code"
3. Point at QR code on screen
4. App loads automatically

### 3. What You'll See

- **Home Tab**: Product listing screen with search
- **Explore Tab**: Placeholder screen
- **Auth Screens**: Login/Signup (not yet wired to nav)

## Testing the Product Listing

### Expected Behavior

1. ✅ See "Products" header at top
2. ✅ See search input below header
3. ✅ See grid of products (2 columns)
4. ✅ Each product shows: image, title, price, condition
5. ✅ Pull down to refresh
6. ✅ Type in search to filter products
7. ✅ See loading spinner during fetch
8. ✅ See error message if fetch fails

### If Products Don't Load

**Check Supabase Connection:**

1. Open `packages/mobile-shared/src/lib/supabase.ts`
2. Verify URL and anon key match your Supabase project
3. Check `.env` file has correct values

**Check Database:**

```sql
-- Run in Supabase SQL Editor
SELECT COUNT(*) FROM products WHERE is_active = true AND is_sold = false;
```

Should return count > 0. If 0, add some test products via web app.

**Check Network:**

- Device and computer must be on same WiFi
- Check firewall isn't blocking port 8081
- Try using tunnel: `npx expo start --tunnel` (slower but works across networks)

### Debugging

**Open DevTools:**
- iOS: Shake device → "Debug JS Remotely"  
- Android: Shake device → "Debug JS Remotely"
- Opens Chrome DevTools

**View Logs:**
```bash
# In another terminal
cd apps/mobile
npx expo start --dev-client
# Then press 'j' to open Chrome DevTools
```

**Check React Query:**
```typescript
// Add to HomeScreen temporarily
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();
console.log('Query cache:', queryClient.getQueryCache().getAll());
```

## Modifying the Product Screen

### Change Number of Columns

In `apps/mobile/app/(tabs)/index.tsx`:
```typescript
<FlatList
  numColumns={3}  // Change from 2 to 3
  // ...
/>
```

### Change Sort Order

```typescript
const { data } = useQuery({
  queryFn: async () => {
    const result = await searchProductsService.execute({
      sort: { by: 'price', direction: 'asc' }  // Sort by price low to high
    });
    return result.data;
  }
});
```

### Add Price Filter

```typescript
const [minPrice, setMinPrice] = useState<number>();
const [maxPrice, setMaxPrice] = useState<number>();

const { data } = useQuery({
  queryKey: ['products', searchQuery, minPrice, maxPrice],
  queryFn: async () => {
    const result = await searchProductsService.execute({
      query: searchQuery || undefined,
      min_price: minPrice,
      max_price: maxPrice,
      // ...
    });
    return result.data;
  }
});
```

### Add Category Filter

```typescript
const [categoryIds, setCategoryIds] = useState<string[]>([]);

const { data } = useQuery({
  queryKey: ['products', searchQuery, categoryIds],
  queryFn: async () => {
    const result = await searchProductsService.execute({
      category_ids: categoryIds.length > 0 ? categoryIds : undefined,
      // ...
    });
    return result.data;
  }
});
```

## Next: Implement Product Details Screen

Create `apps/mobile/app/products/[slug].tsx`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { GetProductBySlug } from '@repo/domain/products';
import { useLocalSearchParams } from 'expo-router';

export default function ProductDetailsScreen() {
  const { slug, seller } = useLocalSearchParams<{ slug: string; seller: string }>();
  
  const { data: product } = useQuery({
    queryKey: ['product', slug, seller],
    queryFn: async () => {
      const result = await getProductBySlugService.execute(slug, seller);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!slug && !!seller,
  });
  
  return (
    <View>
      <Text>{product?.title}</Text>
      {/* Product details UI */}
    </View>
  );
}
```

## Next: Implement Cart Screen

Create/Update `apps/mobile/app/(tabs)/cart.tsx`:

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
// Import cart services from domain
// Create CartRepository
// Use with TanStack Query
```

## Common Issues & Solutions

### Issue: "Unable to resolve module @repo/domain"

**Solution:**
```bash
# From root
pnpm install
cd packages/domain && pnpm build
cd ../core && pnpm build
```

### Issue: "Network request failed"

**Solution:**
- Check device and computer on same network
- Try `npx expo start --tunnel`
- Check Supabase URL is accessible from mobile device

### Issue: "Cannot find name 'Product'"

**Solution:**
```typescript
// Make sure to import the type
import type { Product } from '@repo/domain/products';
```

### Issue: "Query is undefined"

**Solution:**
```typescript
// Add optional chaining
data?.products || []
```

### Issue: Metro bundler error

**Solution:**
```bash
# Clear cache
npx expo start -c
```

## File Structure Reference

```
apps/mobile/
├── app/
│   ├── _layout.tsx           ✅ Root with providers (already done)
│   ├── (tabs)/
│   │   ├── _layout.tsx       ✅ Tab navigation
│   │   ├── index.tsx         ✅ Product listing (DONE)
│   │   ├── cart.tsx          🔜 Next to implement
│   │   ├── messages.tsx      🔜 Implement later
│   │   └── profile.tsx       🔜 Implement later
│   ├── (auth)/
│   │   ├── login.tsx         ✅ Already done
│   │   └── signup.tsx        ✅ Already done
│   └── products/
│       └── [slug].tsx        🔜 Next to implement
└── package.json              ✅ Has @repo/domain & @repo/core
```

## Useful Commands

```bash
# Start dev server
npx expo start

# Start with cache cleared
npx expo start -c

# Start with tunnel (cross-network)
npx expo start --tunnel

# Open on iOS simulator (if installed)
npx expo start --ios

# Open on Android emulator (if installed)
npx expo start --android

# Install iOS/Android dependencies
npx expo install

# Check for issues
npx expo-doctor
```

## Development Workflow

1. **Make changes** to `apps/mobile/app/(tabs)/index.tsx`
2. **Save file** - Expo auto-reloads
3. **See changes** instantly on device (Fast Refresh)
4. **Shake device** to open developer menu
5. **Repeat** - Fast feedback loop!

## Performance Tips

- Use `React.memo` for product cards
- Use `useMemo` for filtered/sorted lists
- Use `useCallback` for handlers
- Enable Hermes (already enabled in config)
- Use FlashList instead of FlatList for very long lists

## Ready to Continue?

You now have:
- ✅ Mobile app running on device
- ✅ Product listing screen working
- ✅ Domain logic integrated
- ✅ TanStack Query set up
- ✅ Supabase connected

Next steps:
1. Test the product screen thoroughly
2. Implement product details screen
3. Implement cart screen
4. Add navigation between screens

---

**Need Help?**
- Check Metro bundler logs
- Check device logs (shake → "Show Dev Menu" → "Debug JS Remotely")
- Check Supabase logs in dashboard
- Review `MOBILE_SHARED_PACKAGES_IMPLEMENTATION.md` for patterns
