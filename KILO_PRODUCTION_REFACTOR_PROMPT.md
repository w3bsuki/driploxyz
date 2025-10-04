# 🚀 DRIPLO PRODUCTION-READY REFACTORING MISSION

**Target:** Transform Driplo from staging to production-ready marketplace platform  
**Duration:** Extended multi-hour autonomous execution  
**Mission Criticality:** HIGHEST - Final production push  
**Agent:** Kilo (with subagents)  
**Date:** October 4, 2025

---

## 🎯 MISSION OBJECTIVE

Execute a **complete, systematic, production-ready refactoring** of the Driplo marketplace codebase. Remove ALL mocks, placeholders, demo data, technical debt, and incomplete implementations. Ensure ALL core features work flawlessly with proper error handling, type safety, testing, and production-grade code quality.

### Zero-Tolerance Items
- ❌ No mock data or placeholder content
- ❌ No TODO/FIXME comments without resolution
- ❌ No `any` types or unsafe TypeScript
- ❌ No unused code, imports, or variables
- ❌ No broken features or half-implementations
- ❌ No missing error handling
- ❌ No untested critical paths
- ❌ No unoptimized queries or N+1 problems
- ❌ No accessibility violations
- ❌ No security vulnerabilities

---

## 📋 PROJECT CONTEXT

### Technology Stack
- **Frontend:** SvelteKit 2.36+ | Svelte 5.36+ (runes API)
- **Backend:** Supabase (PostgreSQL, Auth, Storage, RLS)
- **Payments:** Stripe 18.4.0
- **Styling:** Tailwind CSS 4.1+ (native CSS, no @apply)
- **i18n:** Paraglide JS 2.2.0
- **Monorepo:** pnpm workspaces + Turborepo 2.5.4
- **Node:** 22.12.0

### Monorepo Structure
```
apps/
  ├── web/          # Main marketplace (primary focus)
  ├── admin/        # Admin dashboard
  └── docs/         # Marketing site
packages/
  ├── ui/           # Shared components (Svelte 5)
  ├── core/         # Business logic & services
  ├── database/     # Supabase types & schema
  ├── domain/       # Domain models & validation
  └── i18n/         # Translations (Paraglide)
supabase/
  └── migrations/   # Database schema & RLS
```

### Core Features (ALL Must Work)
1. **Authentication & Authorization** - Sign up, login, OAuth, sessions, RLS
2. **Onboarding** - User profile setup, seller verification
3. **Product Management** - Create, edit, delete, image upload, categories
4. **Product Discovery** - Search, filters, sorting, category pages
5. **Product Pages** - Details, images, seller info, reviews, favorites
6. **Shopping Cart & Checkout** - Cart management, Stripe integration
7. **Order Management** - Order creation, status tracking, buyer/seller views
8. **Messaging System** - Peer-to-peer chat between buyers and sellers
9. **Reviews & Ratings** - Product and seller reviews
10. **Favorites/Wishlist** - Save products, manage wishlist
11. **User Profiles** - Public profiles, seller stats, product listings
12. **Seller Dashboard** - Inventory, orders, analytics, payouts
13. **Notifications** - Real-time updates for orders, messages, etc.
14. **Search & Filters** - Full-text search, multi-criteria filtering

---

## 🛠️ AVAILABLE MCP TOOLS

### 1. Supabase MCP (For ALL Database Tasks)
**Use for:**
- Database schema analysis and migrations
- RLS policy creation, testing, and optimization
- Query optimization and performance analysis
- Auth configuration (email, OAuth, magic links)
- Storage bucket configuration and policies
- Database function creation (RPC endpoints)
- Type generation from schema
- Connection string management
- Real-time subscription setup

**Commands:**
```bash
# Query Supabase MCP for auth best practices
<use supabase-mcp>
  What are the best practices for implementing OAuth with Supabase?
</use>

# Analyze RLS policies
<use supabase-mcp>
  Review RLS policies for products table and ensure proper security
</use>

# Optimize queries
<use supabase-mcp>
  Analyze this query for N+1 problems and suggest optimizations:
  [paste query]
</use>
```

### 2. Svelte LLM MCP (For ALL Svelte/SvelteKit Tasks)
**Use for:**
- Svelte 5 runes API ($state, $derived, $effect, $props)
- SvelteKit 2 routing, form actions, load functions
- Server-side rendering (SSR) best practices
- Component composition patterns
- State management with Svelte stores
- Lifecycle management with runes
- Performance optimization
- Migration from older Svelte patterns

**Commands:**
```bash
# Query Svelte best practices
<use svelte-llm>
  What is the correct Svelte 5 pattern for form binding with $state?
</use>

# Get SvelteKit routing guidance
<use svelte-llm>
  How should I structure parallel routes in SvelteKit 2?
</use>

# Performance optimization
<use svelte-llm>
  Optimize this component for SSR and reduce hydration cost
</use>
```

---

## 🎯 PHASE 1: AUDIT & ANALYSIS (1-2 hours)

### 1.1 Codebase Health Assessment

**Task:** Generate comprehensive audit reports using available tools.

#### A. Type Safety Audit
```bash
# Run type checking across all packages
pnpm --filter web check-types
pnpm --filter @repo/core check-types
pnpm --filter @repo/ui check-types
pnpm --filter @repo/domain check-types

# Document ALL TypeScript errors
# Create: AUDIT_TYPE_ERRORS.md
```

**Subagent Assignment:** Assign subagent to analyze and categorize type errors by severity.

#### B. Build Health Check
```bash
# Verify all packages build
pnpm --filter @repo/ui build
pnpm --filter @repo/core build
pnpm --filter @repo/domain build
pnpm --filter @repo/database build
pnpm --filter web build

# Document ALL build failures
# Create: AUDIT_BUILD_FAILURES.md
```

#### C. Lint & Code Quality
```bash
# Run linters
pnpm --filter web lint > lint-report-web.txt
pnpm --filter @repo/core lint > lint-report-core.txt
pnpm --filter @repo/ui lint > lint-report-ui.txt

# Analyze output
# Create: AUDIT_CODE_QUALITY.md
```

#### D. Database Schema Analysis
**Use Supabase MCP:**
```
Analyze the current database schema in supabase/migrations/ and:
1. List all tables and their relationships
2. Identify missing indexes
3. Check for RLS policy gaps
4. Find unoptimized queries in the codebase
5. Verify foreign key constraints
6. Check for missing NOT NULL constraints
```

**Output:** `AUDIT_DATABASE_SCHEMA.md`

#### E. Feature Completeness Audit
**Scan codebase for:**
- TODOs, FIXMEs, HACKs, XXX comments
- Mock data patterns (`mock`, `placeholder`, `demo`)
- Incomplete implementations (`throw new Error('Not implemented')`)
- Commented-out code blocks
- Console.log statements
- Hardcoded values that should be env vars

```bash
# Search for issues
grep -r "TODO\|FIXME\|HACK\|XXX" apps/web/src --include="*.ts" --include="*.svelte" > todos.txt
grep -r "mock\|placeholder\|demo\|test data" apps/web/src --include="*.ts" --include="*.svelte" > mocks.txt
grep -r "console\\.log\|console\\.error" apps/web/src --include="*.ts" --include="*.svelte" > console-logs.txt
```

**Output:** `AUDIT_FEATURE_COMPLETENESS.md`

#### F. Dependency Audit
```bash
# Check for outdated/vulnerable dependencies
pnpm audit --prod
pnpm outdated

# Create: AUDIT_DEPENDENCIES.md
```

### 1.2 Test Coverage Analysis
```bash
# Run test suites
pnpm --filter web test:coverage
pnpm --filter @repo/core test:coverage

# Analyze coverage gaps
# Create: AUDIT_TEST_COVERAGE.md
```

### 1.3 Performance Baseline
```bash
# Build production bundle
pnpm --filter web build

# Analyze bundle size
# Check for: apps/web/.svelte-kit/output/client/_app/immutable/

# Create: AUDIT_PERFORMANCE.md
```

**Deliverables:**
- [ ] 7 comprehensive audit reports
- [ ] Prioritized issues list by severity (Critical, High, Medium, Low)
- [ ] Estimated effort for each category

---

## 🔧 PHASE 2: CRITICAL FIXES (3-4 hours)

**Priority Order:** Fix blockers that prevent builds, tests, or core features.

### 2.1 Type Safety & Build Fixes

#### A. Regenerate Database Types
**Use Supabase MCP:**
```
Connect to Supabase project and generate TypeScript types from the current schema.
Ensure all tables, views, functions, and enums are properly typed.
```

```bash
# After MCP guidance, run:
cd packages/database
pnpm db:types

# Verify generated types
cat src/generated.ts
```

#### B. Fix Missing Exports
**Issue:** `FormField` not exported from `@repo/ui`

```typescript
// packages/ui/src/lib/index.ts
// Add missing exports:
export { default as FormField } from './components/forms/FormField.svelte';
```

**Subagent:** Audit ALL component exports in `@repo/ui` and verify completeness.

#### C. Build @repo/domain Package
```bash
cd packages/domain
pnpm build

# Verify dist/ output
ls -la dist/
```

#### D. Eliminate ALL `any` Types
**Use Svelte LLM for complex Svelte props:**
```
What is the proper TypeScript interface for these Svelte 5 component props?
[paste component]
```

**Replace patterns:**
```typescript
// ❌ BEFORE
function handler(data: any) { ... }

// ✅ AFTER
interface HandlerData {
  id: string;
  status: 'pending' | 'completed';
  metadata?: Record<string, unknown>;
}
function handler(data: HandlerData) { ... }
```

**Subagent:** Create shared type definitions in `packages/core/src/types/` for reuse.

### 2.2 Database & RLS Hardening

#### A. Complete RLS Policy Coverage
**Use Supabase MCP:**
```
For each table, ensure RLS policies exist for:
1. SELECT (read) - Who can view records?
2. INSERT (create) - Who can create records?
3. UPDATE (modify) - Who can edit records?
4. DELETE (remove) - Who can delete records?

Tables to review:
- profiles
- products
- orders
- order_items
- messages
- reviews
- favorites
- transactions
- notifications
- seller_balances
- followers
- categories
```

**Create missing policies following these patterns:**

```sql
-- Public read, authenticated write (own records)
CREATE POLICY "users_select_own_profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Participant access (orders, messages)
CREATE POLICY "participants_access_orders"
  ON orders FOR ALL
  USING (
    auth.uid() = buyer_id
    OR auth.uid() = seller_id
  );

-- Admin-only operations
CREATE POLICY "admin_manage_categories"
  ON categories FOR ALL
  USING (
    (auth.jwt() ->> 'role') = 'admin'
  );
```

#### B. Add Missing Indexes
**Use Supabase MCP to identify slow queries:**
```
Analyze query performance and suggest indexes for:
1. Foreign keys (if not auto-indexed)
2. Frequently filtered columns (status, created_at)
3. Search columns (full-text search vectors)
4. Join columns
```

**Example:**
```sql
-- Add to new migration file
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(search_vector);
```

#### C. Add Database Constraints
**Use Supabase MCP for validation:**
```
Review tables and add constraints for data integrity:
1. NOT NULL for required fields
2. CHECK constraints for valid enum values
3. UNIQUE constraints where needed
4. Foreign key ON DELETE behaviors
```

```sql
-- Example constraints
ALTER TABLE products
  ALTER COLUMN title SET NOT NULL,
  ALTER COLUMN price SET NOT NULL,
  ADD CONSTRAINT check_price_positive CHECK (price > 0),
  ADD CONSTRAINT check_status CHECK (status IN ('draft', 'active', 'sold', 'archived'));

ALTER TABLE orders
  ADD CONSTRAINT check_order_status CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled'));
```

### 2.3 Authentication & Session Management

#### A. Implement Robust Auth Flow
**Use Supabase MCP:**
```
Review authentication implementation and ensure:
1. Proper session handling with cookies
2. OAuth providers configured (Google, GitHub)
3. Email verification flow
4. Password reset flow
5. Session refresh logic
6. Logout cleans up properly
```

**Use Svelte LLM for SvelteKit integration:**
```
What is the best practice for handling Supabase auth in SvelteKit 2 hooks?
Show complete implementation with proper TypeScript types.
```

#### B. Fix Auth Hooks
**File:** `apps/web/src/hooks.server.ts`

```typescript
// Ensure proper sequence:
// 1. Create Supabase client with request/response
// 2. Get session
// 3. Set locals.session and locals.user
// 4. Refresh session if needed
// 5. Return response with updated cookies
```

**Use Svelte LLM for validation:**
```
Review this SvelteKit auth hook implementation for Svelte 5 + Supabase SSR:
[paste code]
```

### 2.4 Critical Feature Implementations

#### A. Complete Order Management System
**Files to implement/fix:**
- `apps/web/src/lib/services/orders.ts`
- `apps/web/src/routes/(protected)/orders/+page.svelte`
- `apps/web/src/routes/(protected)/orders/[id]/+page.svelte`
- `apps/web/src/routes/(protected)/dashboard/orders/+page.svelte`

**Requirements:**
1. Create order from cart (with order_items)
2. Update order status (pending → paid → shipped → delivered)
3. Buyer and seller views
4. Status change notifications
5. Cancellation flow
6. Refund handling (Stripe)

**Use Supabase MCP for order queries:**
```
Design an optimized query to fetch orders with related items, product details, and buyer/seller profiles.
Minimize N+1 queries.
```

#### B. Complete Messaging System
**Files:**
- `apps/web/src/lib/services/messaging.ts`
- `apps/web/src/routes/(protected)/messages/+page.svelte`
- `apps/web/src/routes/(protected)/messages/[conversationId]/+page.svelte`

**Requirements:**
1. Create conversation between buyer and seller
2. Send/receive messages (real-time)
3. Mark as read
4. Typing indicators
5. Image attachments
6. Delete messages

**Use Supabase MCP for real-time:**
```
Set up Supabase real-time subscriptions for the messages table.
Show proper cleanup and TypeScript types.
```

**Use Svelte LLM for UI:**
```
Create a production-ready chat interface using Svelte 5 runes with:
- Auto-scroll to bottom
- Optimistic UI updates
- Loading states
- Error handling
```

#### C. Complete Reviews & Ratings
**Files:**
- `apps/web/src/lib/services/reviews.ts`
- `apps/web/src/routes/product/[id]/+page.svelte` (review section)
- `apps/web/src/routes/(protected)/reviews/+page.svelte`

**Requirements:**
1. Create review (after order delivery)
2. Rate product and seller (1-5 stars)
3. Edit/delete own reviews
4. Display on product page and seller profile
5. Calculate average ratings
6. Prevent duplicate reviews

**Use Supabase MCP for aggregation:**
```
Create a database function to calculate average ratings efficiently.
Should return: avg_rating, total_reviews
```

#### D. Complete Search & Filtering
**Files:**
- `apps/web/src/routes/search/+page.server.ts`
- `apps/web/src/routes/search/+page.svelte`
- `apps/web/src/lib/services/search.ts`

**Requirements:**
1. Full-text search on products (title, description, tags)
2. Filter by category, price range, condition, size, brand
3. Sort by relevance, price, date
4. Pagination
5. Search suggestions
6. Recent searches

**Use Supabase MCP:**
```
Implement full-text search using PostgreSQL ts_vector.
Show migration to add search_vector column and trigger to keep it updated.
```

---

## 🎨 PHASE 3: UI/UX POLISH (2-3 hours)

### 3.1 Component Modernization (Svelte 5)

**Use Svelte LLM extensively:**

#### A. Migrate Legacy Patterns
**Find and replace:**
```bash
# Search for old patterns
grep -r "let.*=.*" apps/web/src --include="*.svelte" | grep -v "$state"
grep -r "\\$:" apps/web/src --include="*.svelte"
grep -r "onMount" apps/web/src --include="*.svelte"
```

**Migration patterns:**
```svelte
<!-- ❌ OLD (Svelte 4) -->
<script>
  let count = 0;
  $: doubled = count * 2;
  
  onMount(() => {
    console.log('mounted');
  });
</script>

<!-- ✅ NEW (Svelte 5) -->
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);
  
  $effect(() => {
    console.log('mounted');
  });
</script>
```

**Use Svelte LLM for each file:**
```
Modernize this Svelte component to use Svelte 5 runes API:
[paste component]
Ensure proper TypeScript types and follow best practices.
```

**Subagent:** Create a checklist of all `.svelte` files and track migration progress.

#### B. Fix Form Handling
**Use Svelte LLM:**
```
Show the proper way to handle forms in SvelteKit 2 with:
1. Progressive enhancement
2. Form actions
3. Validation (Zod)
4. Loading states
5. Error handling
6. Success feedback
```

**Apply to:**
- Registration form
- Login form
- Product creation/edit form
- Profile edit form
- Review form
- Message form

#### C. Improve Loading States
**Pattern to apply everywhere:**
```svelte
<script lang="ts">
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  
  async function handleSubmit() {
    isLoading = true;
    error = null;
    
    try {
      // Operation
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      isLoading = false;
    }
  }
</script>

{#if isLoading}
  <LoadingSpinner />
{:else if error}
  <ErrorMessage message={error} />
{:else}
  <!-- Content -->
{/if}
```

### 3.2 Accessibility Fixes

#### A. Keyboard Navigation
**Audit all interactive elements:**
- Buttons, links, form controls
- Dropdowns, modals, dialogs
- Tab trapping in modals
- Skip links

```bash
# Run accessibility tests
pnpm --filter web test:e2e --project=accessibility
```

#### B. ARIA Labels
**Add to all:**
- Icon buttons (aria-label)
- Form inputs (aria-describedby for errors)
- Loading states (aria-live)
- Dialogs (aria-modal, role="dialog")

**Example:**
```svelte
<button
  aria-label="Add to favorites"
  aria-pressed={isFavorited}
  onclick={toggleFavorite}
>
  <HeartIcon />
</button>
```

#### C. Focus Management
**Ensure visible focus indicators:**
```css
/* apps/web/src/app.css */
*:focus-visible {
  outline: 2px solid var(--state-focus);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

### 3.3 Error Handling & User Feedback

#### A. Implement Toast System
**File:** `packages/ui/src/lib/components/Toast.svelte`

**Use Svelte LLM:**
```
Create a production-ready toast notification system using Svelte 5 with:
- Success, error, warning, info types
- Auto-dismiss with configurable duration
- Pause on hover
- Dismiss button
- Stacking behavior
- Accessible (aria-live)
```

#### B. Error Boundaries
**File:** `apps/web/src/routes/+error.svelte`

**Improve error page:**
- User-friendly messages
- Error reporting (Sentry)
- Recovery actions (back, home, retry)
- Contact support link

#### C. Empty States
**Add to all list views:**
```svelte
{#if products.length === 0}
  <EmptyState
    icon={PackageIcon}
    title="No products found"
    description="Try adjusting your filters or search term"
    action={{
      label: "Clear filters",
      href: "/search"
    }}
  />
{/if}
```

### 3.4 Performance Optimization

#### A. Image Optimization
**Use enhanced:img for all product images:**
```svelte
<script>
  import { Image } from '@sveltejs/enhanced-img';
</script>

<Image
  src={product.images[0]?.image_url}
  alt={product.title}
  sizes="(max-width: 768px) 100vw, 50vw"
  loading="lazy"
/>
```

#### B. Code Splitting
**Add to large routes:**
```typescript
// +page.ts
export const load = async () => {
  // Lazy load heavy components
  const { default: HeavyComponent } = await import('$lib/components/HeavyComponent.svelte');
  
  return {
    HeavyComponent
  };
};
```

#### C. Database Query Optimization
**Use Supabase MCP to review all queries:**
```
Analyze these product queries for N+1 problems:
[paste queries from products.ts, orders.ts, etc.]

Suggest optimizations using JOINs or batch queries.
```

---

## ✅ PHASE 4: TESTING & VALIDATION (2-3 hours)

### 4.1 Unit Test Coverage

**Target Coverage:**
- `@repo/core`: 80%
- `@repo/domain`: 90%
- `@repo/ui`: 60%
- `apps/web`: 50%

#### A. Service Layer Tests
**For each service file, create tests:**
- `services/products.test.ts`
- `services/orders.test.ts`
- `services/messaging.test.ts`
- `services/reviews.test.ts`
- `services/search.test.ts`

**Template:**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductService } from './products';

describe('ProductService', () => {
  let service: ProductService;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    service = new ProductService(mockSupabase);
  });

  describe('getProduct', () => {
    it('should fetch product by id', async () => {
      // Arrange
      const productId = 'test-id';
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: productId, title: 'Test Product' },
              error: null
            })
          })
        })
      });

      // Act
      const result = await service.getProduct(productId);

      // Assert
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe(productId);
    });

    it('should handle errors gracefully', async () => {
      // Test error case
    });
  });
});
```

**Subagent:** Generate test suites for all service files.

#### B. Component Tests (Critical UI)
**Test these components:**
- `ProductCard.svelte`
- `ProductGrid.svelte`
- `CartButton.svelte`
- `SearchBar.svelte`
- `FilterPanel.svelte`

**Use Svelte LLM:**
```
Show how to test this Svelte 5 component with Vitest and Testing Library:
[paste component]
Test user interactions, loading states, and error handling.
```

#### C. Validation Logic Tests
**Test Zod schemas:**
```typescript
import { describe, it, expect } from 'vitest';
import { productSchema } from './schemas';

describe('productSchema', () => {
  it('should validate valid product data', () => {
    const validProduct = {
      title: 'Test Product',
      price: 29.99,
      description: 'A test product',
      category_id: 'uuid'
    };
    
    expect(() => productSchema.parse(validProduct)).not.toThrow();
  });

  it('should reject invalid price', () => {
    const invalidProduct = { price: -10 };
    expect(() => productSchema.parse(invalidProduct)).toThrow();
  });
});
```

### 4.2 E2E Test Coverage

**Critical User Flows:**

#### A. Authentication Flow
```typescript
// tests/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can register and login', async ({ page }) => {
    // Navigate to register
    await page.goto('/register');
    
    // Fill form
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.fill('[name="username"]', 'testuser');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify redirect to onboarding
    await expect(page).toHaveURL('/onboarding');
  });

  test('user can logout', async ({ page }) => {
    // Login first
    await loginAsUser(page);
    
    // Click logout
    await page.click('[aria-label="Logout"]');
    
    // Verify redirect to home
    await expect(page).toHaveURL('/');
  });
});
```

#### B. Product Listing Flow
```typescript
test('seller can create product', async ({ page }) => {
  await loginAsSeller(page);
  
  await page.goto('/dashboard/products/new');
  
  // Fill product form
  await page.fill('[name="title"]', 'Nike Air Max');
  await page.fill('[name="price"]', '120');
  await page.fill('[name="description"]', 'Excellent condition');
  await page.selectOption('[name="category"]', 'shoes');
  
  // Upload image
  await page.setInputFiles('[name="images"]', 'tests/fixtures/product.jpg');
  
  // Submit
  await page.click('button[type="submit"]');
  
  // Verify success
  await expect(page.locator('text=Product created')).toBeVisible();
});
```

#### C. Purchase Flow
```typescript
test('buyer can purchase product', async ({ page }) => {
  await loginAsBuyer(page);
  
  // Go to product page
  await page.goto('/product/test-product-id');
  
  // Add to cart
  await page.click('button:has-text("Add to Cart")');
  
  // Go to checkout
  await page.goto('/cart');
  await page.click('button:has-text("Checkout")');
  
  // Fill shipping info
  await page.fill('[name="address"]', '123 Main St');
  await page.fill('[name="city"]', 'New York');
  await page.fill('[name="zip"]', '10001');
  
  // Enter payment (Stripe test mode)
  const stripeFrame = page.frameLocator('iframe[name*="stripe"]');
  await stripeFrame.locator('[name="cardnumber"]').fill('4242424242424242');
  await stripeFrame.locator('[name="exp-date"]').fill('12/25');
  await stripeFrame.locator('[name="cvc"]').fill('123');
  
  // Submit payment
  await page.click('button:has-text("Pay")');
  
  // Verify order confirmation
  await expect(page.locator('text=Order confirmed')).toBeVisible();
});
```

#### D. Messaging Flow
```typescript
test('buyer can message seller', async ({ page }) => {
  await loginAsBuyer(page);
  
  // Go to product page
  await page.goto('/product/test-product-id');
  
  // Click "Contact Seller"
  await page.click('button:has-text("Contact Seller")');
  
  // Send message
  await page.fill('[name="message"]', 'Is this still available?');
  await page.click('button:has-text("Send")');
  
  // Verify message sent
  await expect(page.locator('text=Is this still available?')).toBeVisible();
});
```

#### E. Search & Filter Flow
```typescript
test('user can search and filter products', async ({ page }) => {
  await page.goto('/search');
  
  // Enter search query
  await page.fill('[name="q"]', 'nike shoes');
  await page.press('[name="q"]', 'Enter');
  
  // Apply filters
  await page.click('text=Filters');
  await page.check('[name="category"][value="shoes"]');
  await page.fill('[name="minPrice"]', '50');
  await page.fill('[name="maxPrice"]', '200');
  await page.click('button:has-text("Apply")');
  
  // Verify results
  await expect(page.locator('[data-testid="product-card"]')).toHaveCount.greaterThan(0);
});
```

**Subagent:** Create test fixtures and helper functions for E2E tests.

### 4.3 API Endpoint Testing

**Test all API routes:**
```typescript
// tests/api/search.test.ts
import { describe, it, expect } from 'vitest';
import { GET } from '../routes/api/search/+server';

describe('/api/search', () => {
  it('should return products matching query', async () => {
    const request = new Request('http://localhost/api/search?q=nike');
    const response = await GET({ request, url: new URL(request.url) });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.products).toBeInstanceOf(Array);
  });

  it('should validate query parameters', async () => {
    const request = new Request('http://localhost/api/search');
    const response = await GET({ request, url: new URL(request.url) });
    
    expect(response.status).toBe(400);
  });
});
```

### 4.4 RLS Policy Testing

**Use Supabase MCP:**
```
Generate test cases for RLS policies to ensure:
1. Users can only access their own data
2. Public data is accessible to all
3. Admin-only operations are properly restricted
4. Participant-based access works (orders, messages)
```

**Create:** `supabase/tests/rls-policies.test.sql`

```sql
-- Test user can only update own profile
BEGIN;
  SET LOCAL "request.jwt.claims" = '{"sub": "user-id-123"}';
  
  -- Should succeed
  UPDATE profiles SET username = 'newname' WHERE id = 'user-id-123';
  
  -- Should fail
  UPDATE profiles SET username = 'hacked' WHERE id = 'other-user-id';
  
ROLLBACK;
```

---

## 🔒 PHASE 5: SECURITY HARDENING (1-2 hours)

### 5.1 Environment Variables Audit

**Check for exposed secrets:**
```bash
# Search for hardcoded values
grep -r "sk_live\|pk_live\|api_key\|secret" apps/web/src --include="*.ts" --include="*.svelte"
```

**Ensure proper usage:**
```typescript
// ❌ BAD
const stripeKey = 'sk_live_12345';

// ✅ GOOD
import { STRIPE_SECRET_KEY } from '$env/static/private';
```

**Verify `.env.example` is complete:**
```bash
# apps/web/.env.example
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
PUBLIC_SITE_URL=
RATE_LIMIT_SECRET=
```

### 5.2 Input Validation & Sanitization

**Use Zod for all inputs:**
```typescript
// packages/core/src/validation/schemas.ts
import { z } from 'zod';

export const createProductSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  price: z.number().positive().max(100000),
  category_id: z.string().uuid(),
  images: z.array(z.string().url()).min(1).max(10),
  condition: z.enum(['new', 'like-new', 'good', 'fair', 'poor']),
  tags: z.array(z.string()).max(10).optional()
});
```

**Apply to all form actions:**
```typescript
// apps/web/src/routes/products/new/+page.server.ts
import { createProductSchema } from '@repo/core/validation/schemas';

export const actions = {
  create: async ({ request, locals }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    
    // Validate
    const result = createProductSchema.safeParse(data);
    if (!result.success) {
      return fail(400, { errors: result.error.flatten() });
    }
    
    // Process validated data
    const product = await createProduct(locals.supabase, result.data);
    
    return { success: true, product };
  }
};
```

### 5.3 Rate Limiting

**Apply to public endpoints:**
```typescript
// apps/web/src/routes/api/search/+server.ts
import { RateLimiter } from 'sveltekit-rate-limiter/server';

const limiter = new RateLimiter({
  IP: [50, 'h'], // 50 requests per hour per IP
  IPUA: [20, 'm'] // 20 requests per minute per IP+UserAgent
});

export async function GET({ request, getClientAddress }) {
  // Check rate limit
  if (await limiter.isLimited(request)) {
    return json({ error: 'Too many requests' }, { status: 429 });
  }
  
  // Process request...
}
```

### 5.4 CSRF Protection

**Ensure SvelteKit CSRF is enabled:**
```typescript
// apps/web/svelte.config.js
const config = {
  kit: {
    csrf: {
      checkOrigin: true
    }
  }
};
```

### 5.5 Content Security Policy

**Add CSP headers:**
```typescript
// apps/web/src/hooks.server.ts
export async function handle({ event, resolve }) {
  const response = await resolve(event);
  
  response.headers.set('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://api.stripe.com",
    "frame-src https://js.stripe.com"
  ].join('; '));
  
  return response;
}
```

---

## 🧹 PHASE 6: CLEANUP & OPTIMIZATION (1-2 hours)

### 6.1 Remove ALL Dead Code

**Patterns to delete:**
```bash
# Commented-out code
# Unused imports
# Unused variables (prefix with _ if needed for callbacks)
# Unused functions
# Unused components
# Empty files
```

**Run automated cleanup:**
```bash
# ESLint autofix
pnpm --filter web lint --fix
pnpm --filter @repo/core lint --fix
pnpm --filter @repo/ui lint --fix

# Remove unused imports (with eslint-plugin-unused-imports)
```

### 6.2 Remove ALL Mocks & Placeholders

**Search and destroy:**
```bash
# Find all mocks
grep -r "mock\|placeholder\|demo\|fake\|dummy\|lorem ipsum" apps/web/src --include="*.ts" --include="*.svelte"

# Replace with real implementations or remove
```

**Common patterns:**
```typescript
// ❌ DELETE
const mockData = [...];

// ❌ DELETE
// TODO: Replace with real API call
const data = demoProducts;

// ❌ DELETE
<img src="/placeholder.svg" />
```

### 6.3 Resolve ALL TODOs

**For each TODO:**
1. If quick fix (<10 min): Fix immediately
2. If requires design decision: Document in GitHub issue, add issue link to TODO
3. If truly not needed: Delete the TODO

**Format for remaining TODOs:**
```typescript
// TODO(#123): Implement advanced search filters
// Tracking: https://github.com/owner/repo/issues/123
```

### 6.4 Remove Console Logs

**Replace with proper logging:**
```typescript
// ❌ DELETE
console.log('User logged in', user);

// ✅ USE (in development)
import { dev } from '$app/environment';
if (dev) {
  console.debug('User logged in', user);
}

// ✅ USE (for errors)
import * as Sentry from '@sentry/sveltekit';
Sentry.captureException(error);
```

### 6.5 Optimize Bundle Size

**Analyze build output:**
```bash
pnpm --filter web build

# Check bundle sizes
ls -lh apps/web/.svelte-kit/output/client/_app/immutable/chunks/
```

**Use rollup-plugin-visualizer:**
```typescript
// apps/web/vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  plugins: [
    visualizer({
      emitFile: true,
      filename: 'stats.html'
    })
  ]
};
```

**Optimize large dependencies:**
- Use `lucide-svelte` with tree-shaking (import individual icons)
- Lazy load heavy components
- Code split routes

### 6.6 Database Query Optimization

**Use Supabase MCP:**
```
Review all database queries in the codebase and:
1. Identify N+1 query patterns
2. Suggest batching or JOIN optimizations
3. Add missing indexes
4. Optimize SELECT statements (don't use SELECT *)
```

**Create optimized queries:**
```typescript
// ❌ N+1 Problem
const products = await supabase.from('products').select('*');
for (const product of products.data) {
  const seller = await supabase.from('profiles').select('*').eq('id', product.seller_id).single();
}

// ✅ Optimized with JOIN
const { data: products } = await supabase
  .from('products')
  .select(`
    *,
    seller:profiles!seller_id(
      id,
      username,
      avatar_url
    )
  `);
```

---

## 📚 PHASE 7: DOCUMENTATION (1 hour)

### 7.1 Update Technical Documentation

**Files to update:**
- `README.md` - Project overview, quick start
- `ARCHITECTURE.md` - System design, patterns
- `DEVELOPMENT.md` - Local setup, workflows
- `TESTING.md` - Testing strategies
- `supabase.md` - Database guide
- `CONTRIBUTING.md` - Contribution guidelines

**Ensure each file:**
- Is accurate and up-to-date
- Has no outdated information
- Includes code examples that work
- Has proper formatting

### 7.2 API Documentation

**Create:** `docs/API.md`

**Document all API endpoints:**
```markdown
## GET /api/search

Search products with filters.

**Query Parameters:**
- `q` (string, required): Search query
- `category` (string, optional): Category filter
- `minPrice` (number, optional): Minimum price
- `maxPrice` (number, optional): Maximum price
- `page` (number, optional): Page number (default: 1)
- `pageSize` (number, optional): Items per page (default: 24, max: 100)

**Response:**
```json
{
  "products": [...],
  "total": 42,
  "page": 1,
  "pageSize": 24
}
```

**Errors:**
- `400`: Invalid parameters
- `429`: Rate limit exceeded
- `500`: Internal server error
```

### 7.3 Component Documentation

**Add JSDoc to all components:**
```svelte
<script lang="ts">
  /**
   * Product card component for displaying product information in grids and lists.
   * 
   * @component
   * @example
   * ```svelte
   * <ProductCard
   *   product={product}
   *   onclick={() => goto(`/product/${product.id}`)}
   * />
   * ```
   */
  
  interface Props {
    /** Product data to display */
    product: Product;
    /** Optional click handler */
    onclick?: () => void;
    /** Display variant */
    variant?: 'default' | 'compact' | 'featured';
  }
  
  let { product, onclick, variant = 'default' }: Props = $props();
</script>
```

### 7.4 Deployment Guide

**Create:** `docs/DEPLOYMENT.md`

**Include:**
1. Vercel deployment steps
2. Environment variables checklist
3. Supabase configuration
4. Stripe setup (webhooks, products)
5. DNS configuration
6. Post-deployment verification checklist

### 7.5 User Documentation

**Create user-facing docs:**
- How to create a listing
- How to purchase items
- How to message sellers
- Payment and shipping info
- Returns and refunds policy

---

## 🚀 PHASE 8: FINAL VALIDATION (1-2 hours)

### 8.1 Build & Type Check All Packages

```bash
# Clean install
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install

# Build all packages in order
pnpm --filter @repo/database build
pnpm --filter @repo/domain build
pnpm --filter @repo/core build
pnpm --filter @repo/ui build
pnpm --filter web build

# Type check all
pnpm check-types
```

**Success criteria:**
- [ ] All packages build without errors
- [ ] Zero TypeScript errors
- [ ] All imports resolve correctly

### 8.2 Run Complete Test Suite

```bash
# Unit tests with coverage
pnpm --filter @repo/core test:coverage
pnpm --filter @repo/domain test:coverage
pnpm --filter @repo/ui test:coverage
pnpm --filter web test:unit

# E2E tests
pnpm --filter web test:e2e
```

**Success criteria:**
- [ ] All tests pass
- [ ] Coverage meets thresholds
- [ ] No flaky tests

### 8.3 Lint All Code

```bash
# Run linters
pnpm --filter web lint
pnpm --filter @repo/core lint
pnpm --filter @repo/ui lint
pnpm --filter @repo/domain lint

# Format code
pnpm format
```

**Success criteria:**
- [ ] Zero lint errors
- [ ] Consistent formatting
- [ ] No unused code

### 8.4 Security Audit

```bash
# Dependency audit
pnpm audit --prod

# Check for exposed secrets
pnpm dlx @gitguardian/ggshield secret scan path .
```

**Success criteria:**
- [ ] No high/critical vulnerabilities
- [ ] No exposed secrets

### 8.5 Performance Audit

```bash
# Build production bundle
pnpm --filter web build

# Run Lighthouse
pnpm dlx lighthouse https://driplo.xyz --view
```

**Success criteria:**
- [ ] Performance score > 90
- [ ] Accessibility score > 95
- [ ] Best Practices score > 90
- [ ] SEO score > 90

### 8.6 Feature Completeness Checklist

**Manually verify each feature works end-to-end:**

#### Authentication ✅
- [ ] Sign up with email
- [ ] Email verification
- [ ] Login
- [ ] Password reset
- [ ] OAuth (Google, GitHub)
- [ ] Logout
- [ ] Session persistence

#### Onboarding ✅
- [ ] Profile setup
- [ ] Avatar upload
- [ ] Seller verification
- [ ] Preferences

#### Product Management ✅
- [ ] Create listing
- [ ] Upload images (multiple)
- [ ] Edit listing
- [ ] Delete listing
- [ ] Mark as sold
- [ ] Draft mode

#### Product Discovery ✅
- [ ] Search products
- [ ] Filter by category
- [ ] Filter by price
- [ ] Filter by condition
- [ ] Sort results
- [ ] Pagination

#### Product Pages ✅
- [ ] View product details
- [ ] View seller info
- [ ] Add to favorites
- [ ] Contact seller
- [ ] Share product

#### Shopping Cart ✅
- [ ] Add to cart
- [ ] Update quantity
- [ ] Remove from cart
- [ ] View cart total
- [ ] Apply promo code

#### Checkout ✅
- [ ] Enter shipping address
- [ ] Enter payment (Stripe)
- [ ] Review order
- [ ] Submit order
- [ ] Order confirmation

#### Order Management ✅
- [ ] View order history (buyer)
- [ ] View order details
- [ ] Track shipment
- [ ] Cancel order
- [ ] Request refund
- [ ] View sales (seller)
- [ ] Update order status (seller)

#### Messaging ✅
- [ ] Start conversation
- [ ] Send message
- [ ] Receive message (real-time)
- [ ] View conversation list
- [ ] Mark as read
- [ ] Delete conversation

#### Reviews & Ratings ✅
- [ ] Write review
- [ ] Rate product (1-5 stars)
- [ ] Rate seller
- [ ] Edit review
- [ ] Delete review
- [ ] View reviews

#### Favorites ✅
- [ ] Add to favorites
- [ ] Remove from favorites
- [ ] View favorites list
- [ ] Favorite count

#### User Profiles ✅
- [ ] View public profile
- [ ] View user's products
- [ ] View user's reviews
- [ ] Follow user
- [ ] Unfollow user
- [ ] Edit own profile

#### Seller Dashboard ✅
- [ ] View sales stats
- [ ] View active listings
- [ ] View sold items
- [ ] View orders
- [ ] View messages
- [ ] View ratings
- [ ] Manage inventory
- [ ] Payout settings

#### Category Pages ✅
- [ ] Browse by category
- [ ] Subcategory navigation
- [ ] Category filters
- [ ] Category breadcrumbs

#### Search & Filters ✅
- [ ] Full-text search
- [ ] Category filter
- [ ] Price range filter
- [ ] Condition filter
- [ ] Size filter
- [ ] Brand filter
- [ ] Sort options
- [ ] Search suggestions

#### Notifications ✅
- [ ] New message notification
- [ ] Order update notification
- [ ] Review notification
- [ ] Follow notification
- [ ] Mark as read

---

## 🎯 EXECUTION GUIDELINES

### Working with Subagents

**Assign subagents to parallel tasks:**
1. **Subagent Alpha**: Type safety and build fixes
2. **Subagent Beta**: Database and RLS work
3. **Subagent Gamma**: UI/UX modernization
4. **Subagent Delta**: Testing infrastructure
5. **Subagent Epsilon**: Documentation

**Coordination:**
- Each subagent reports progress every 30 minutes
- Block on dependencies (e.g., type generation before component work)
- Share context via shared files (CONTEXT.md, PROGRESS.md)

### MCP Usage Patterns

**Supabase MCP - Use frequently:**
- Before writing any SQL migration
- Before implementing auth logic
- Before optimizing queries
- When testing RLS policies
- When configuring storage

**Svelte LLM - Use frequently:**
- Before migrating Svelte 4 to 5
- When implementing complex forms
- When optimizing components
- When setting up reactive state
- When implementing transitions

### Quality Gates

**Do NOT proceed to next phase until:**
1. All blockers in current phase are resolved
2. All tests in current phase pass
3. Code review checklist is complete
4. Documentation is updated

### Error Handling Strategy

**When encountering errors:**
1. **Gather context**: Read error message, stack trace, relevant files
2. **Query MCP**: Ask Supabase/Svelte LLM for guidance
3. **Research**: Check documentation, GitHub issues
4. **Implement fix**: Make targeted changes
5. **Verify fix**: Run tests, check related functionality
6. **Document**: Update KNOWN_ISSUES.md if not fully resolved

### Progress Tracking

**Create and maintain:**
- `PROGRESS.md` - Real-time progress log with timestamps
- `ISSUES.md` - Discovered issues not yet resolved
- `DECISIONS.md` - Technical decisions and rationale
- `METRICS.md` - Build times, test coverage, bundle size

**Update every hour:**
```markdown
## 2025-10-04 14:00

### Completed
- [x] Regenerated Supabase types
- [x] Fixed FormField export
- [x] Implemented order creation flow

### In Progress
- [ ] Messaging real-time subscriptions (50% complete)

### Blocked
- [ ] Stripe webhook testing (need production webhook secret)

### Next Up
- [ ] Reviews & ratings implementation
- [ ] Search optimization
```

---

## ✅ DEFINITION OF DONE

**The codebase is production-ready when:**

### Build & Deploy
- [x] All packages build successfully
- [x] Zero TypeScript errors
- [x] Zero lint errors
- [x] Production build completes
- [x] Deploy to Vercel succeeds

### Code Quality
- [x] No `any` types
- [x] No unused imports/variables
- [x] No console.logs (except in dev mode)
- [x] No TODO comments (or documented in issues)
- [x] No mock/placeholder/demo code
- [x] Proper error handling everywhere
- [x] All functions have JSDoc

### Testing
- [x] Unit test coverage > thresholds
- [x] E2E tests for critical flows pass
- [x] No flaky tests
- [x] RLS policies tested

### Features
- [x] All 14 core features work end-to-end
- [x] Error states handled
- [x] Loading states shown
- [x] Empty states designed
- [x] Success feedback clear

### Security
- [x] No exposed secrets
- [x] Input validation with Zod
- [x] Rate limiting on public endpoints
- [x] CSRF protection enabled
- [x] CSP headers configured
- [x] RLS policies comprehensive

### Performance
- [x] Lighthouse score > 90
- [x] Bundle size optimized
- [x] Images optimized
- [x] Database queries optimized
- [x] No N+1 queries

### Accessibility
- [x] Axe score > 95
- [x] Keyboard navigation works
- [x] ARIA labels present
- [x] Focus indicators visible
- [x] Screen reader tested

### Documentation
- [x] README.md complete
- [x] API docs created
- [x] Component docs added
- [x] Deployment guide written
- [x] User guides created

---

## 🚨 CRITICAL SUCCESS FACTORS

### 1. Use MCPs Extensively
**Do NOT guess or assume** - Query Supabase MCP and Svelte LLM for best practices, patterns, and guidance. They are your expert knowledge base.

### 2. Work Systematically
**Do NOT jump around** - Complete each phase before moving to the next. Document blockers and come back to them.

### 3. Test Continuously
**Do NOT accumulate untested code** - Run tests after each significant change. Fix broken tests immediately.

### 4. Be Thorough
**Do NOT leave half-finished work** - Every feature must work completely, or be removed. No "mostly working" code.

### 5. Document Everything
**Do NOT skip documentation** - Update docs as you go. Future developers (and you) will thank you.

### 6. Communicate Progress
**Do NOT work in silence** - Update PROGRESS.md regularly. Report blockers. Share wins.

---

## 🎉 FINAL OUTPUT

**Upon completion, deliver:**

1. **Production-ready codebase** - All code is clean, tested, and documented
2. **Comprehensive test suite** - Unit + E2E tests for all features
3. **Complete documentation** - README, architecture, API docs, user guides
4. **Deployment artifacts** - Build succeeds, ready for production deploy
5. **Quality reports** - Test coverage, Lighthouse scores, bundle analysis
6. **Migration guide** - Summary of changes, breaking changes, upgrade path

**Status report format:**
```markdown
# Driplo Production Refactoring - COMPLETE

## Metrics
- **Duration**: 12 hours 34 minutes
- **Files Changed**: 247
- **Tests Added**: 189
- **Coverage**: Core 82%, Web 54%
- **Lighthouse Score**: 94/100
- **Build Size**: 345 KB (gzipped)

## Features Delivered
- [x] All 14 core features working
- [x] 100% feature completeness
- [x] 0 critical bugs
- [x] 0 blockers

## Technical Achievements
- [x] 0 TypeScript errors (was 127)
- [x] 0 lint errors (was 53)
- [x] 0 security vulnerabilities
- [x] 189 new tests (coverage: 54% → 68%)

## Deployment Ready
- [x] Production build succeeds
- [x] Environment variables documented
- [x] Deployment guide complete
- [x] Monitoring configured

## Next Steps
1. Deploy to production
2. Monitor error rates
3. Collect user feedback
4. Iterate based on metrics
```

---

## 🚀 BEGIN EXECUTION

**Start with Phase 1: Audit & Analysis**

You have all the context, tools, and guidance needed. Execute with precision, thoroughness, and excellence.

**Good luck, Kilo. Make this codebase shine. 🌟**
