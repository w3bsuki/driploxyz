# Testing Strategy

Comprehensive testing guide for the Driplo monorepo.

---

## Philosophy

**Testing gives confidence** - Write tests before refactoring, ship features with tests, prevent regressions.

### Principles

1. **Test critical paths first** - Auth, checkout, messaging
2. **Fast feedback loops** - Unit tests in watch mode
3. **Maintainable tests** - Clear, isolated, well-named
4. **Coverage as a guide** - Not a goal, but a health metric

---

## Test Types

### Unit Tests (Vitest)
- **What:** Individual functions, utilities, services
- **Where:** `*.test.ts`, `*.spec.ts`
- **Tool:** Vitest
- **Speed:** Fast (<1s)

### Component Tests (Testing Library)
- **What:** Svelte components in isolation
- **Where:** `*.test.ts` next to components
- **Tool:** Vitest + @testing-library/svelte
- **Speed:** Fast (<5s)

### E2E Tests (Playwright)
- **What:** Full user flows across pages
- **Where:** `tests/e2e/*.spec.ts`
- **Tool:** Playwright
- **Speed:** Slow (10-30s per test)

---

## Running Tests

### Unit Tests

```bash
# Run all unit tests
pnpm test

# Run tests for specific package
pnpm --filter web test
pnpm --filter @repo/core test
pnpm --filter @repo/ui test

# Watch mode (recommended for development)
pnpm --filter web test:watch

# Coverage
pnpm --filter web test:coverage

# Specific file
pnpm --filter web test ProductCard.test.ts
```

### E2E Tests

```bash
# Install browsers (first time only)
pnpm --filter web exec playwright install

# Run E2E tests
pnpm --filter web test:e2e

# Run in headed mode (see browser)
pnpm --filter web test:e2e --headed

# Debug mode
pnpm --filter web test:e2e --debug

# Specific test
pnpm --filter web test:e2e checkout.spec.ts
```

### CI Pipeline

```bash
# Full pipeline (runs in CI)
pnpm -w turbo run lint check-types test build
```

---

## Coverage Requirements

Target coverage thresholds per package:

| Package | Threshold | Rationale |
|---------|-----------|-----------|
| @repo/core | 70% | Business logic is critical |
| @repo/domain | 80% | Pure functions, easy to test |
| @repo/ui | 50% | UI harder to test, focus on logic |
| apps/web | 40% | Integration via Playwright |

**No `--passWithNoTests` flags** - All packages must have real tests.

---

## Writing Tests

### Unit Test Example (Service)

```typescript
// lib/services/products.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createProduct, getProduct } from './products';

describe('products service', () => {
  let mockSupabase;

  beforeEach(() => {
    mockSupabase = {
      from: (table) => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: {}, error: null })
      })
    };
  });

  it('creates a product', async () => {
    const product = {
      name: 'Test Product',
      price: 100
    };

    const result = await createProduct(mockSupabase, product);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('handles creation errors', async () => {
    mockSupabase.from = () => ({
      insert: () => ({ data: null, error: { message: 'Failed' } })
    });

    const result = await createProduct(mockSupabase, {});

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### Component Test Example (Svelte)

```typescript
// lib/components/ProductCard.test.ts
import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import ProductCard from './ProductCard.svelte';

describe('ProductCard', () => {
  it('renders product name and price', () => {
    const product = {
      name: 'Test Product',
      price: 100,
      image: 'test.jpg'
    };

    render(ProductCard, { props: { product } });

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    let clicked = false;
    const product = { name: 'Test', price: 100 };

    const { component } = render(ProductCard, {
      props: {
        product,
        onclick: () => { clicked = true; }
      }
    });

    await component.$set({ product });
    // Simulate click
    expect(clicked).toBe(true);
  });
});
```

### E2E Test Example (Playwright)

```typescript
// tests/e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('completes purchase', async ({ page }) => {
    // Navigate to product
    await page.goto('/products/123');

    // Add to cart
    await page.click('[data-testid="add-to-cart"]');

    // Navigate to checkout
    await page.click('[data-testid="cart-icon"]');
    await page.click('[data-testid="checkout-button"]');

    // Fill shipping info
    await page.fill('[name="address"]', '123 Main St');
    await page.fill('[name="city"]', 'New York');
    await page.fill('[name="zip"]', '10001');

    // Fill payment (test mode)
    await page.fill('[name="card_number"]', '4242424242424242');
    await page.fill('[name="card_expiry"]', '12/25');
    await page.fill('[name="card_cvc"]', '123');

    // Submit
    await page.click('[data-testid="submit-order"]');

    // Verify success
    await expect(page.locator('text=Order confirmed')).toBeVisible();
  });
});
```

---

## Mocking Strategies

### Supabase

```typescript
// mocks/supabase.ts
export const mockSupabaseClient = {
  from: (table: string) => ({
    select: () => ({ data: [], error: null }),
    insert: (data: any) => ({ data, error: null }),
    update: (data: any) => ({ data, error: null }),
    delete: () => ({ data: null, error: null }),
    eq: (column: string, value: any) => mockSupabaseClient.from(table),
    single: () => ({ data: {}, error: null })
  }),
  auth: {
    getSession: () => ({ data: { session: null }, error: null }),
    signIn: () => ({ data: {}, error: null }),
    signOut: () => ({ error: null })
  }
};
```

### Stripe

```typescript
// mocks/stripe.ts
export const mockStripe = {
  paymentIntents: {
    create: async (params: any) => ({
      id: 'pi_test_123',
      client_secret: 'secret_test_123',
      status: 'requires_payment_method'
    }),
    retrieve: async (id: string) => ({
      id,
      status: 'succeeded'
    })
  }
};
```

### Fetch Requests

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts']
  }
});

// tests/setup.ts
import { vi } from 'vitest';

global.fetch = vi.fn((url) => {
  if (url === '/api/products') {
    return Promise.resolve({
      json: () => Promise.resolve({ products: [] })
    });
  }
  return Promise.reject(new Error('Not found'));
});
```

---

## Test Organization

### File Structure

```
packages/core/
├── src/
│   ├── services/
│   │   ├── products.ts
│   │   └── products.test.ts     # Co-located with source
│   └── utils/
│       ├── format.ts
│       └── format.test.ts
└── tests/
    └── setup.ts                  # Global test setup

apps/web/
├── src/
│   └── lib/
│       └── components/
│           ├── ProductCard.svelte
│           └── ProductCard.test.ts
└── tests/
    ├── e2e/
    │   ├── auth.spec.ts
    │   ├── checkout.spec.ts
    │   └── messaging.spec.ts
    └── setup.ts
```

### Naming Conventions

- **Unit tests:** `filename.test.ts`
- **Component tests:** `ComponentName.test.ts`
- **E2E tests:** `feature.spec.ts`
- **Test suites:** `describe('feature name', () => {})`
- **Test cases:** `it('does something', () => {})`

---

## Best Practices

### DO

- ✅ Write tests before refactoring
- ✅ Test behavior, not implementation
- ✅ Use clear, descriptive test names
- ✅ Keep tests isolated and independent
- ✅ Mock external dependencies (APIs, databases)
- ✅ Test edge cases and error conditions
- ✅ Run tests in CI before merging

### DON'T

- ❌ Skip tests for "simple" code
- ❌ Test internal implementation details
- ❌ Share state between tests
- ❌ Write brittle tests that break often
- ❌ Ignore failing tests
- ❌ Test third-party libraries
- ❌ Use `--passWithNoTests` flags

---

## Debugging Tests

### Vitest

```bash
# Run with debug output
pnpm --filter web test --reporter=verbose

# Run single test
pnpm --filter web test -t "creates a product"

# Update snapshots
pnpm --filter web test -u
```

### Playwright

```bash
# Debug mode (step through tests)
pnpm --filter web test:e2e --debug

# Headed mode (see browser)
pnpm --filter web test:e2e --headed

# Generate test report
pnpm --filter web test:e2e --reporter=html
```

### VS Code Integration

**Vitest extension** - Run tests inline in editor

**Playwright extension** - Record and debug E2E tests

---

## CI Integration

### GitHub Actions

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '22.12.0'
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm -w turbo run lint
      - run: pnpm -w turbo run check-types
      - run: pnpm -w turbo run test
      - run: pnpm --filter web test:e2e
      - run: pnpm -w turbo run build
```

---

## Coverage Reports

### Generate Coverage

```bash
# Unit test coverage
pnpm --filter web test:coverage

# View HTML report
open coverage/index.html
```

### Coverage Thresholds

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70
      }
    }
  }
});
```

---

## Continuous Testing

### TDD Workflow

1. **Write failing test** - Red
2. **Make it pass** - Green
3. **Refactor** - Clean up
4. **Repeat**

### Watch Mode

```bash
# Run tests on file save
pnpm --filter web test:watch

# Run specific test file
pnpm --filter web test:watch ProductCard
```

---

## See Also

- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development workflow
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture