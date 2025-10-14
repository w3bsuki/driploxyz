# Reusing Web Logic in Mobile App - Turborepo Strategy

## 🎯 Overview

Your Turborepo has **shared packages** with business logic that can be reused between the web (`/apps/web`) and mobile (`/apps/mobile`) apps!

---

## 📦 Available Shared Packages

### 1. **`@repo/domain`** - Business Logic (⭐ MUST USE)
**Location:** `packages/domain/`

Business logic for:
- **Auth** (`domain/auth`) - Authentication logic
- **Products** (`domain/products`) - Product CRUD, validation
- **Cart** (`domain/cart`) - Shopping cart logic
- **Orders** (`domain/orders`) - Order management
- **Users** (`domain/users`) - User profile logic
- **Payments** (`domain/payments`) - Payment processing
- **Conversations** (`domain/conversations`) - Chat/messaging
- **Shared** (`domain/shared`) - Common utilities

**Usage in Mobile:**
```typescript
// In your React Native component
import { createProduct, validateProductData } from '@repo/domain/products';
import { calculateCartTotal, addToCart } from '@repo/domain/cart';
import { processOrder } from '@repo/domain/orders';
import { sendMessage } from '@repo/domain/conversations';

// Use it directly!
const handleCreateListing = async (data) => {
  const validatedData = validateProductData(data);
  const result = await createProduct(supabase, validatedData);
};
```

### 2. **`@repo/core`** - Core Utilities (⭐ MUST USE)
**Location:** `packages/core/`

Core functionality:
- **Utils** (`core/utils`) - Utility functions
- **Services** (`core/services`) - Common services
- **Email** (`core/email`) - Email templates & sending
- **Validation** (`core/validation`) - Zod schemas
- **Types** (`core/types`) - Shared TypeScript types
- **Stripe** (`core/stripe`) - Payment integration

**Usage in Mobile:**
```typescript
import { formatCurrency, formatDate } from '@repo/core/utils';
import { stripe } from '@repo/core/stripe';
import { productSchema, userSchema } from '@repo/core/validation';

// Format prices
const price = formatCurrency(1500, 'USD'); // "$15.00"

// Validate forms
const result = productSchema.parse(formData);
```

### 3. **`@repo/database`** - Type-Safe Database (✅ ALREADY USING)
**Location:** `packages/database/`

- Supabase TypeScript types
- Database utility types
- Shared across web and mobile

**Already configured in mobile:** ✅

### 4. **`@repo/i18n`** - Internationalization (✅ ALREADY USING)
**Location:** `packages/i18n/`

- Translation strings
- Localization utilities
- Multi-language support

**Already configured in mobile:** ✅

### 5. **`@repo/mobile-shared`** - Mobile-Specific Shared Code (✅ CREATED)
**Location:** `packages/mobile-shared/`

Mobile-specific utilities:
- Supabase client for React Native
- AuthProvider
- UI components (Button, Input)
- Mobile hooks

---

## 🔥 What You Should Do NOW

### Step 1: Add Domain Logic to Mobile App

Update `apps/mobile/package.json`:

```json
{
  "dependencies": {
    "@repo/database": "workspace:*",
    "@repo/i18n": "workspace:*",
    "@repo/mobile-shared": "workspace:*",
    "@repo/domain": "workspace:*",        // ← ADD THIS
    "@repo/core": "workspace:*",          // ← ADD THIS
    // ... other deps
  }
}
```

Then run:
```bash
pnpm install
```

### Step 2: Use Domain Logic in Mobile Components

#### Example: Product Listing Screen

```typescript
// apps/mobile/app/(tabs)/index.tsx
import { useQuery } from '@tanstack/react-query';
import { getProducts, type Product } from '@repo/domain/products';
import { supabase } from '@repo/mobile-shared';

export default function HomeScreen() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts(supabase, {
      limit: 20,
      orderBy: 'created_at',
      order: 'desc'
    })
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <FlatList
      data={products}
      renderItem={({ item }) => <ProductCard product={item} />}
    />
  );
}
```

#### Example: Create Listing Screen

```typescript
// apps/mobile/app/(tabs)/create.tsx
import { useMutation } from '@tanstack/react-query';
import { createProduct, validateProductData } from '@repo/domain/products';
import { productSchema } from '@repo/core/validation';
import { supabase } from '@repo/mobile-shared';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export default function CreateListingScreen() {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(productSchema)
  });

  const createMutation = useMutation({
    mutationFn: (data) => createProduct(supabase, data),
    onSuccess: () => {
      Alert.alert('Success', 'Product listed!');
      router.push('/(tabs)');
    }
  });

  const onSubmit = async (data) => {
    // Validation happens automatically via Zod
    createMutation.mutate(data);
  };

  return (
    <View>
      <Controller
        control={control}
        name="title"
        render={({ field }) => (
          <Input
            label="Product Title"
            onChangeText={field.onChange}
            value={field.value}
          />
        )}
      />
      {/* More fields... */}
      <Button title="Create Listing" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}
```

#### Example: Shopping Cart

```typescript
// apps/mobile/components/Cart.tsx
import { useQuery, useMutation } from '@tanstack/react-query';
import { getCart, addToCart, removeFromCart, calculateCartTotal } from '@repo/domain/cart';
import { formatCurrency } from '@repo/core/utils';
import { supabase } from '@repo/mobile-shared';

export function CartScreen() {
  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: () => getCart(supabase)
  });

  const addMutation = useMutation({
    mutationFn: (productId: string) => addToCart(supabase, productId),
    onSuccess: () => queryClient.invalidateQueries(['cart'])
  });

  const total = cart ? calculateCartTotal(cart.items) : 0;

  return (
    <View>
      <FlatList
        data={cart?.items}
        renderItem={({ item }) => <CartItem item={item} />}
      />
      <Text>Total: {formatCurrency(total, 'USD')}</Text>
    </View>
  );
}
```

#### Example: Chat/Messaging

```typescript
// apps/mobile/app/chat/[id].tsx
import { useQuery, useMutation } from '@tanstack/react-query';
import { getMessages, sendMessage } from '@repo/domain/conversations';
import { supabase } from '@repo/mobile-shared';
import { useLocalSearchParams } from 'expo-router';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  
  const { data: messages } = useQuery({
    queryKey: ['messages', id],
    queryFn: () => getMessages(supabase, id as string)
  });

  const sendMutation = useMutation({
    mutationFn: (text: string) => sendMessage(supabase, {
      conversation_id: id as string,
      content: text
    })
  });

  const handleSend = (text: string) => {
    sendMutation.mutate(text);
  };

  return (
    <View>
      <MessageList messages={messages} />
      <MessageInput onSend={handleSend} />
    </View>
  );
}
```

---

## 🏗️ Architecture Benefits

### ✅ Shared Business Logic
```
┌─────────────────────┐
│   @repo/domain      │  ← Business logic (products, cart, orders, etc.)
└─────────────────────┘
         ↓       ↓
    ┌────────┐ ┌─────────┐
    │  Web   │ │ Mobile  │
    │(Svelte)│ │(React)  │
    └────────┘ └─────────┘
```

**Why this is great:**
- ✅ Fix a bug once, fixed everywhere
- ✅ Add a feature once, available everywhere
- ✅ Consistent behavior across platforms
- ✅ Less code to maintain

### ✅ Shared Validation
```typescript
// Same Zod schema used on web and mobile!
import { productSchema } from '@repo/core/validation';

// Web (SvelteKit)
const result = productSchema.safeParse(formData);

// Mobile (React Native)
const { control } = useForm({
  resolver: zodResolver(productSchema)
});
```

### ✅ Shared Types
```typescript
// One source of truth for types
import type { Product, User, Order } from '@repo/database';
import type { CartItem } from '@repo/domain/cart';

// Same types on web and mobile!
```

---

## 📝 Updated Mobile Package Structure

```
apps/mobile/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Home (uses @repo/domain/products)
│   │   ├── create.tsx         # Create listing (uses @repo/domain/products)
│   │   ├── messages.tsx       # Chats (uses @repo/domain/conversations)
│   │   └── profile.tsx        # Profile (uses @repo/domain/users)
│   ├── product/
│   │   └── [id].tsx           # Product detail (uses @repo/domain/products)
│   └── chat/
│       └── [id].tsx           # Chat detail (uses @repo/domain/conversations)
└── package.json               # Add @repo/domain, @repo/core
```

---

## 🔧 How to Implement

### 1. Update package.json
```bash
cd apps/mobile
# Add to package.json dependencies:
# "@repo/domain": "workspace:*"
# "@repo/core": "workspace:*"
pnpm install
```

### 2. Build the packages
```bash
cd packages/domain
pnpm build

cd packages/core
pnpm build
```

### 3. Use in your mobile app
```typescript
// Start using domain logic immediately!
import { getProducts } from '@repo/domain/products';
import { formatCurrency } from '@repo/core/utils';
```

---

## 🚀 Example: Complete Product Listing Flow

### Web (SvelteKit) - Already Working
```typescript
// apps/web/src/routes/products/+page.ts
import { getProducts } from '@repo/domain/products';

export async function load({ locals }) {
  const products = await getProducts(locals.supabase);
  return { products };
}
```

### Mobile (React Native) - Now the Same!
```typescript
// apps/mobile/app/(tabs)/index.tsx
import { getProducts } from '@repo/domain/products';

export default function HomeScreen() {
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts(supabase)
  });
  
  return <ProductList products={products} />;
}
```

**Same logic, different UI!** 🎉

---

## 🎯 Next Steps

1. ✅ `pnpm install --force` (DONE)
2. 📦 Add `@repo/domain` and `@repo/core` to mobile/package.json
3. 🏗️ Build the packages: `pnpm build --filter=@repo/domain --filter=@repo/core`
4. 💻 Start using domain logic in mobile screens
5. 🎨 Focus on mobile UI (domain logic already done!)

---

## 💡 Key Insight

**You don't need to rewrite any business logic!**

The web app already has:
- ✅ Product CRUD
- ✅ Cart logic
- ✅ Order processing
- ✅ User management
- ✅ Chat/messaging
- ✅ Payment integration
- ✅ Validation schemas

The mobile app just needs to:
- 📱 Build the React Native UI
- 📱 Use the same logic from `@repo/domain`
- 📱 Style with NativeWind
- 📱 Add mobile-specific features (camera, push notifications)

**That's the power of Turborepo! 🚀**

---

**Last Updated:** October 14, 2025
