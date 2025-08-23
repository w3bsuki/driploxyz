# TESTING - Vitest & Component Testing

**Reference**: https://svelte.dev/docs/kit/testing

## UNIT TESTING

### 1. Vitest Setup
```bash
pnpm add -D vitest @testing-library/svelte jsdom
```

```javascript
// vite.config.js
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest-setup.js'],
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
});
```

### 2. Component Testing
```typescript
// Button.test.ts
import { render, fireEvent } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';
import Button from './Button.svelte';

test('renders button with text', () => {
  const { getByRole } = render(Button, {
    props: { text: 'Click me' }
  });
  
  const button = getByRole('button');
  expect(button).toHaveTextContent('Click me');
});

test('calls onclick handler', async () => {
  const handleClick = vi.fn();
  const { getByRole } = render(Button, {
    props: { onclick: handleClick }
  });
  
  const button = getByRole('button');
  await fireEvent.click(button);
  
  expect(handleClick).toHaveBeenCalledOnce();
});
```

### 3. Store Testing
```typescript
// store.test.ts
import { get } from 'svelte/store';
import { cartStore, addItem } from './cart';

test('adds item to cart', () => {
  const item = { id: 1, name: 'Product', price: 10 };
  
  addItem(item);
  
  const cart = get(cartStore);
  expect(cart.items).toContainEqual(item);
  expect(cart.total).toBe(10);
});
```

## INTEGRATION TESTING

### 1. Load Function Testing
```typescript
// +page.test.ts
import { load } from './+page.server';

test('load returns products', async () => {
  const result = await load({
    params: {},
    url: new URL('http://localhost'),
    locals: { supabase: mockSupabase }
  });
  
  expect(result.products).toHaveLength(10);
  expect(result.products[0]).toHaveProperty('id');
});
```

### 2. Form Action Testing
```typescript
// +page.server.test.ts
import { actions } from './+page.server';

test('login action validates input', async () => {
  const formData = new FormData();
  formData.append('email', 'invalid');
  
  const result = await actions.login({
    request: { formData: async () => formData },
    locals: {}
  });
  
  expect(result.status).toBe(400);
  expect(result.data.errors).toHaveProperty('email');
});
```

### 3. Hook Testing
```typescript
// hooks.test.ts
import { handle } from './hooks.server';

test('adds user to locals', async () => {
  const event = createMockEvent();
  const resolve = vi.fn(e => e);
  
  await handle({ event, resolve });
  
  expect(event.locals.user).toBeDefined();
  expect(resolve).toHaveBeenCalled();
});
```

## E2E TESTING

### 1. Playwright Setup
```bash
pnpm create playwright
```

```typescript
// playwright.config.ts
export default {
  webServer: {
    command: 'pnpm build && pnpm preview',
    port: 4173
  },
  testDir: 'tests',
  testMatch: /(.+\.)?(test|spec)\.[jt]s/
};
```

### 2. Page Tests
```typescript
// tests/home.test.ts
import { expect, test } from '@playwright/test';

test('homepage has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Driplo - Fashion Marketplace');
});

test('navigation works', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Products');
  await expect(page).toHaveURL('/products');
});
```

### 3. Form Testing
```typescript
test('can submit form', async ({ page }) => {
  await page.goto('/contact');
  
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('textarea[name="message"]', 'Test message');
  await page.click('button[type="submit"]');
  
  await expect(page.locator('.success')).toBeVisible();
});
```

## API TESTING

### 1. Endpoint Testing
```typescript
// api.test.ts
test('GET /api/products returns list', async () => {
  const response = await app.request('/api/products');
  const data = await response.json();
  
  expect(response.status).toBe(200);
  expect(Array.isArray(data)).toBe(true);
});

test('POST /api/products requires auth', async () => {
  const response = await app.request('/api/products', {
    method: 'POST',
    body: JSON.stringify({ name: 'Product' })
  });
  
  expect(response.status).toBe(401);
});
```

### 2. Mock Responses
```typescript
// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      data: mockData,
      error: null
    }))
  }))
};
```

## ACCESSIBILITY TESTING

### 1. Axe Testing
```typescript
import { axe } from 'jest-axe';

test('has no accessibility violations', async () => {
  const { container } = render(Component);
  const results = await axe(container);
  
  expect(results).toHaveNoViolations();
});
```

### 2. Keyboard Testing
```typescript
test('is keyboard navigable', async () => {
  const { getByRole } = render(Menu);
  
  const menu = getByRole('navigation');
  await fireEvent.keyDown(menu, { key: 'Tab' });
  
  expect(document.activeElement).toHaveAttribute('href', '/first-link');
});
```

## PERFORMANCE TESTING

### 1. Bundle Size
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
};
```

### 2. Lighthouse CI
```yaml
# .github/workflows/lighthouse.yml
- name: Lighthouse CI
  uses: treosh/lighthouse-ci-action@v9
  with:
    urls: |
      https://driplo.xyz
      https://driplo.xyz/products
    uploadArtifacts: true
```

## SNAPSHOT TESTING

```typescript
import { render } from '@testing-library/svelte';

test('matches snapshot', () => {
  const { container } = render(Component, {
    props: { title: 'Test' }
  });
  
  expect(container.firstChild).toMatchSnapshot();
});
```

## TESTING UTILITIES

### 1. Test Helpers
```typescript
// test-utils.ts
export function createMockEvent(overrides = {}) {
  return {
    request: new Request('http://localhost'),
    locals: {},
    params: {},
    ...overrides
  };
}

export function createMockFormData(data: Record<string, string>) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
}
```

### 2. Custom Matchers
```typescript
// vitest-setup.js
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    return { pass };
  }
});
```

## TEST ORGANIZATION

### 1. File Structure
```
src/
  lib/
    components/
      Button.svelte
      Button.test.ts
  routes/
    +page.svelte
    +page.test.ts
tests/
  e2e/
    home.test.ts
  integration/
    api.test.ts
```

### 2. Test Naming
```typescript
// Descriptive test names
describe('ProductCard', () => {
  describe('when product is on sale', () => {
    test('displays sale badge', () => {});
    test('shows discounted price', () => {});
  });
  
  describe('when out of stock', () => {
    test('disables add to cart button', () => {});
    test('shows out of stock message', () => {});
  });
});
```

## COVERAGE

### 1. Configuration
```javascript
// vite.config.js
export default {
  test: {
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
      ]
    }
  }
};
```

### 2. Coverage Goals
```bash
# Run with coverage
pnpm test:coverage

# Minimum thresholds
coverage:
  statements: 80%
  branches: 75%
  functions: 80%
  lines: 80%
```

## CI/CD TESTING

### 1. GitHub Actions
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test
      - run: pnpm test:e2e
```

## TESTING RULES

### ✅ DO
- Test user behavior, not implementation
- Use semantic queries (getByRole, getByLabelText)
- Test accessibility
- Mock external dependencies
- Test error states
- Test loading states
- Write descriptive test names
- Keep tests isolated
- Test critical paths first

### ❌ DON'T
- Test framework internals
- Test third-party libraries
- Use arbitrary timeouts
- Test styling details
- Share state between tests
- Test private functions
- Ignore flaky tests
- Skip error scenarios

## AUDIT COMMANDS

```bash
# Run unit tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run e2e tests
pnpm test:e2e

# Run specific test file
pnpm test Button.test.ts

# Watch mode
pnpm test:watch

# Update snapshots
pnpm test -u
```