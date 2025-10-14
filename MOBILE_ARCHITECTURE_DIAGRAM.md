# Mobile App Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         TURBOREPO MONOREPO                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌───────────────────┐                    ┌───────────────────┐    │
│  │   WEB (SvelteKit) │                    │  MOBILE (Expo RN) │    │
│  │                   │                    │                   │    │
│  │  ┌─────────────┐  │                    │  ┌─────────────┐  │    │
│  │  │  UI Layer   │  │                    │  │  UI Layer   │  │    │
│  │  │  (Svelte)   │  │                    │  │ (React      │  │    │
│  │  │             │  │                    │  │  Native)    │  │    │
│  │  └─────┬───────┘  │                    │  └─────┬───────┘  │    │
│  │        │          │                    │        │          │    │
│  │        ↓          │                    │        ↓          │    │
│  │  ┌─────────────┐  │                    │  ┌─────────────┐  │    │
│  │  │ Repositories│  │                    │  │ Repositories│  │    │
│  │  │ (Supabase)  │  │                    │  │ (Supabase)  │  │    │
│  │  └─────┬───────┘  │                    │  └─────┬───────┘  │    │
│  └────────┼──────────┘                    └────────┼──────────┘    │
│           │                                        │               │
│           │                                        │               │
│           └────────────────┬───────────────────────┘               │
│                            │                                       │
│                   ┌────────▼────────┐                              │
│                   │  SHARED PACKAGES │                             │
│                   └─────────────────┘                              │
│                            │                                       │
│          ┌─────────────────┼─────────────────┐                    │
│          │                 │                 │                    │
│    ┌─────▼─────┐    ┌─────▼─────┐    ┌─────▼─────┐              │
│    │  @repo/   │    │  @repo/   │    │  @repo/   │              │
│    │  domain   │    │   core    │    │ database  │              │
│    │           │    │           │    │           │              │
│    │ Business  │    │ Utilities │    │   Types   │              │
│    │  Logic    │    │ Helpers   │    │  Schemas  │              │
│    └───────────┘    └───────────┘    └───────────┘              │
│                                                                     │
│                            ↓                                       │
│                   ┌─────────────────┐                              │
│                   │    SUPABASE     │                              │
│                   │   (PostgreSQL)  │                              │
│                   │                 │                              │
│                   │  • Products     │                              │
│                   │  • Users        │                              │
│                   │  • Orders       │                              │
│                   │  • Messages     │                              │
│                   │  • Cart         │                              │
│                   │  • Payments     │                              │
│                   └─────────────────┘                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow - Product Listing Example

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. USER ACTION                                                    │
│    User types in search box → "vintage jacket"                   │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ↓
┌──────────────────────────────────────────────────────────────────┐
│ 2. REACT NATIVE UI LAYER                                          │
│    apps/mobile/app/(tabs)/index.tsx                              │
│                                                                   │
│    const { data } = useQuery({                                   │
│      queryKey: ['products', searchQuery],                        │
│      queryFn: async () => {                                      │
│        return await searchProductsService.execute({              │
│          query: "vintage jacket"                                 │
│        });                                                        │
│      }                                                            │
│    });                                                            │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ↓
┌──────────────────────────────────────────────────────────────────┐
│ 3. TANSTACK QUERY LAYER                                           │
│    @tanstack/react-query                                         │
│                                                                   │
│    • Manages cache                                               │
│    • Handles loading states                                      │
│    • Automatic refetching                                        │
│    • Background updates                                          │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ↓
┌──────────────────────────────────────────────────────────────────┐
│ 4. DOMAIN SERVICE LAYER                                           │
│    @repo/domain/products                                         │
│    packages/domain/src/products/services.ts                     │
│                                                                   │
│    class SearchProducts {                                        │
│      async execute(params) {                                     │
│        // 1. Validate search params                             │
│        // 2. Apply business rules                               │
│        // 3. Call repository                                     │
│        // 4. Filter results                                      │
│        return result;                                            │
│      }                                                            │
│    }                                                              │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ↓
┌──────────────────────────────────────────────────────────────────┐
│ 5. REPOSITORY LAYER                                               │
│    apps/mobile/app/(tabs)/index.tsx (ProductRepository)         │
│                                                                   │
│    class ProductRepository {                                     │
│      async search(params) {                                      │
│        return await supabase                                     │
│          .from('products')                                       │
│          .select('...')                                          │
│          .or(`title.ilike.%vintage jacket%,...`)                │
│          .eq('is_active', true)                                  │
│      }                                                            │
│    }                                                              │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ↓
┌──────────────────────────────────────────────────────────────────┐
│ 6. SUPABASE CLIENT                                                │
│    @repo/mobile-shared/lib/supabase.ts                          │
│                                                                   │
│    const supabase = createClient<Database>(url, key, {          │
│      auth: {                                                     │
│        storage: AsyncStorage,                                    │
│        flowType: 'pkce'                                          │
│      }                                                            │
│    });                                                            │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ↓
┌──────────────────────────────────────────────────────────────────┐
│ 7. DATABASE (Supabase PostgreSQL)                                │
│                                                                   │
│    SELECT * FROM products                                        │
│    WHERE (title ILIKE '%vintage jacket%'                        │
│           OR description ILIKE '%vintage jacket%')               │
│      AND is_active = true                                        │
│      AND is_sold = false                                         │
│    ORDER BY created_at DESC                                      │
│    LIMIT 20;                                                     │
│                                                                   │
│    ┌─────────────────────────────────────────┐                  │
│    │ Result: 5 products found                │                  │
│    │ - Vintage Leather Jacket (€89)          │                  │
│    │ - Retro Denim Jacket (€45)              │                  │
│    │ - Classic Bomber Jacket (€120)          │                  │
│    │ - Vintage Suede Jacket (€95)            │                  │
│    │ - 80s Windbreaker Jacket (€35)          │                  │
│    └─────────────────────────────────────────┘                  │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ↓
┌──────────────────────────────────────────────────────────────────┐
│ 8. RESPONSE FLOWS BACK UP                                         │
│                                                                   │
│    Database → Supabase Client → Repository                      │
│         → Domain Service → TanStack Query → UI                  │
│                                                                   │
│    UI renders:                                                   │
│    ┌────────────┐  ┌────────────┐                               │
│    │ Vintage    │  │ Retro      │                               │
│    │ Leather    │  │ Denim      │                               │
│    │ Jacket     │  │ Jacket     │                               │
│    │ €89        │  │ €45        │                               │
│    └────────────┘  └────────────┘                               │
│    (Grid continues...)                                           │
└──────────────────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### 🎨 UI Layer (React Native)
**Location**: `apps/mobile/app/`

**Responsibilities**:
- Render components
- Handle user interactions
- Display loading/error states
- Navigate between screens
- Call domain services via TanStack Query

**Examples**:
- Product listing screen
- Product detail screen
- Cart screen
- Login screen

### 📦 Repository Layer
**Location**: `apps/mobile/app/` (inline) or `packages/mobile-shared/repositories/`

**Responsibilities**:
- Implement domain repository interfaces
- Abstract Supabase API calls
- Transform database results to domain entities
- Handle database errors

**Examples**:
- ProductRepository
- CartRepository
- UserRepository
- OrderRepository

### 🏢 Domain Layer (Business Logic)
**Location**: `packages/domain/src/`

**Responsibilities**:
- Enforce business rules
- Validate inputs
- Coordinate operations
- Independent of UI/database
- Platform-agnostic

**Examples**:
- SearchProducts service
- AddToCart service
- CreateOrder service
- SendMessage service

### 🛠️ Core Layer (Utilities)
**Location**: `packages/core/src/`

**Responsibilities**:
- Formatting helpers
- Validation schemas
- Type definitions
- Email templates
- Stripe integration

**Examples**:
- formatCurrency()
- productSchema
- Email templates
- Stripe utilities

### 🗄️ Database Layer (Types)
**Location**: `packages/database/src/`

**Responsibilities**:
- TypeScript types generated from database
- Supabase type definitions
- Ensure type safety

**Examples**:
- Database type
- Tables type
- Enums type

### 🔌 Supabase Client
**Location**: `packages/mobile-shared/src/lib/supabase.ts`

**Responsibilities**:
- Configure Supabase client
- Manage authentication
- Handle sessions
- AsyncStorage integration

## Shared Package Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                        @repo/domain                          │
│                      (Business Logic)                        │
│                                                              │
│  Exports:                                                    │
│  • SearchProducts                                            │
│  • GetProductBySlug                                          │
│  • AddToCart, RemoveFromCart                                │
│  • CreateOrder, GetOrders                                    │
│  • SendMessage, GetConversations                            │
│  • CreatePaymentIntent                                       │
│                                                              │
│  Depends on: @repo/database (types only)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓ Uses
┌─────────────────────────────────────────────────────────────┐
│                        @repo/core                            │
│                    (Shared Utilities)                        │
│                                                              │
│  Exports:                                                    │
│  • formatCurrency()                                          │
│  • formatDate()                                              │
│  • slugify()                                                 │
│  • productSchema (Zod)                                       │
│  • Email templates                                           │
│  • Stripe utilities                                          │
│                                                              │
│  Depends on: @repo/database (types only)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓ Uses
┌─────────────────────────────────────────────────────────────┐
│                      @repo/database                          │
│                    (TypeScript Types)                        │
│                                                              │
│  Exports:                                                    │
│  • Database (full DB schema types)                          │
│  • Tables (table row types)                                 │
│  • Enums (database enums)                                    │
│                                                              │
│  Generated from: Supabase database schema                   │
│  Depends on: Nothing (leaf package)                         │
└─────────────────────────────────────────────────────────────┘
```

## Mobile vs Web - Comparison

```
┌──────────────────────┬──────────────────────┬──────────────────────┐
│      Layer           │      Web (Svelte)    │   Mobile (React)     │
├──────────────────────┼──────────────────────┼──────────────────────┤
│ UI Framework         │ SvelteKit            │ React Native + Expo  │
│ Styling              │ Tailwind CSS         │ NativeWind/StyleSheet│
│ Routing              │ File-based (Svelte)  │ Expo Router          │
│ State Management     │ Svelte stores        │ Zustand/TanStack     │
│ Forms                │ SvelteKit forms      │ React Hook Form      │
│ Auth                 │ @supabase/ssr        │ @supabase/supabase-js│
│ Session Storage      │ Cookies              │ AsyncStorage         │
│                      │                      │                      │
│ SHARED (Same Code):  │                      │                      │
│ Business Logic       │ @repo/domain ✅      │ @repo/domain ✅      │
│ Utilities            │ @repo/core ✅        │ @repo/core ✅        │
│ Types                │ @repo/database ✅    │ @repo/database ✅    │
│ Validation           │ @repo/core/validation│ @repo/core/validation│
│ Supabase Instance    │ Same ✅              │ Same ✅              │
└──────────────────────┴──────────────────────┴──────────────────────┘
```

## Benefits Visualization

```
        WITHOUT Turborepo                    WITH Turborepo
  (Traditional Multi-Project)              (Monorepo - Our Setup)

┌──────────────────────────┐         ┌──────────────────────────┐
│    WEB PROJECT           │         │    TURBOREPO MONOREPO    │
│  ┌────────────────────┐  │         │  ┌─────────────────────┐ │
│  │ Business Logic 1   │  │         │  │  @repo/domain       │ │
│  │ (duplicated)       │  │         │  │  (shared)           │ │
│  │                    │  │         │  └─────┬───────┬───────┘ │
│  │ • Products         │  │         │        │       │          │
│  │ • Cart             │  │         │   ┌────▼───┐ ┌▼─────┐   │
│  │ • Orders           │  │         │   │  Web   │ │Mobile│   │
│  │ • Users            │  │         │   │        │ │      │   │
│  └────────────────────┘  │         │   │  Uses  │ │Uses  │   │
└──────────────────────────┘         │   │ domain │ │domain│   │
                                     │   └────────┘ └──────┘   │
┌──────────────────────────┐         └──────────────────────────┘
│  MOBILE PROJECT          │
│  ┌────────────────────┐  │         ✅ Single source of truth
│  │ Business Logic 2   │  │         ✅ No duplication
│  │ (duplicated!)      │  │         ✅ Fix bugs once
│  │                    │  │         ✅ Add features once
│  │ • Products ❌      │  │         ✅ Type-safe
│  │ • Cart ❌          │  │         ✅ Consistent behavior
│  │ • Orders ❌        │  │
│  │ • Users ❌         │  │
│  └────────────────────┘  │
└──────────────────────────┘

❌ Bugs must be fixed twice
❌ Features must be added twice
❌ Logic can diverge
❌ No shared types
❌ Maintenance nightmare
```

## Summary

✅ **Web** and **Mobile** share the same:
- Business logic (@repo/domain)
- Utilities (@repo/core)
- Types (@repo/database)
- Supabase instance
- Database schema

✅ **Web** and **Mobile** differ in:
- UI framework (Svelte vs React Native)
- Routing (SvelteKit vs Expo Router)
- Styling (Tailwind vs StyleSheet)
- Platform (Browser vs iOS/Android)

✅ **Result**: 
- 🚀 Faster development
- 🐛 Fewer bugs
- 📦 Less code to maintain
- 🎯 Consistent behavior
- 💪 Type-safe
