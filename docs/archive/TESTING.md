# Testing Guide for Driplo Marketplace

## Overview

This guide covers the comprehensive testing setup for Driplo's marketplace components using Vitest, @testing-library/svelte, and proper Svelte 5 rune handling.

## Test Structure

### UI Component Tests (`packages/ui/src/test/`)

- **ProductCard.test.ts** - Complete product card functionality
- **ProductGallery.test.ts** - Image carousel and zoom features
- **SellerCard.test.ts** - Seller information and interaction
- **skeleton-components.test.ts** - Loading states and accessibility
- **test-utils.ts** - Shared utilities and mocks

### App Component Tests (`apps/web/src/lib/components/test/`)

- **Header.test.ts** - Navigation, authentication, and mobile menu

## Running Tests

### Basic Commands

```bash
# Run all tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage

# Run only component tests
pnpm test:components

# Watch mode for development
pnpm test:watch
```

### Package-specific Testing

```bash
# UI package tests
cd packages/ui
pnpm test

# Web app tests  
cd apps/web
pnpm test
```

## Test Features

### Svelte 5 Rune Support

Our tests properly handle Svelte 5's new rune system:

```typescript
// ✅ CORRECT - Testing Svelte 5 components with runes
it('handles product click with proper rune reactivity', async () => {
  const mockHandler = vi.fn();
  
  renderSvelte5Component(ProductCard, {
    product: mockProduct,
    onclick: mockHandler
  });

  const card = screen.getByRole('button');
  await userInteraction.click(card);
  
  expect(mockHandler).toHaveBeenCalledWith(mockProduct);
});
```

### Component Testing Patterns

#### 1. Props and Reactivity
```typescript
it('updates when props change', async () => {
  const { rerender } = renderSvelte5Component(ProductCard, {
    product: mockProduct,
    favorited: false
  });

  expect(screen.getByLabelText('Add to favorites')).toBeInTheDocument();

  // Test prop reactivity
  rerender({ product: mockProduct, favorited: true });
  
  expect(screen.getByLabelText('Remove from favorites')).toBeInTheDocument();
});
```

#### 2. User Interactions
```typescript
it('handles keyboard navigation', async () => {
  renderSvelte5Component(ProductCard, {
    product: mockProduct,
    onclick: mockHandler
  });

  const card = screen.getByRole('button');
  await userInteraction.keyDown(card, 'Enter');
  
  expect(mockHandler).toHaveBeenCalledTimes(1);
});
```

#### 3. Accessibility Testing
```typescript
it('meets accessibility requirements', () => {
  renderSvelte5Component(ProductCard, { product: mockProduct });

  const card = screen.getByRole('button');
  expect(checkAccessibility.hasRole(card, 'button')).toBe(true);
  expect(checkAccessibility.isKeyboardAccessible(card)).toBe(true);
});
```

### Mock Utilities

#### Product Mocks
```typescript
const mockProduct = createMockProduct({
  title: 'Custom Product',
  price: 99.99,
  condition: 'new'
});
```

#### Event Handler Mocks
```typescript
const handlers = createMockHandlers();
// Provides: onFavorite, onclick, onFollow, onMessage, etc.
```

#### Translation Mocks
```typescript
const customTranslations = {
  ...mockTranslations,
  addToFavorites: 'Zu Favoriten hinzufügen'
};
```

## Test Coverage Goals

### Component Coverage
- **Props handling**: ✅ All props validated and tested
- **Event handlers**: ✅ Click, keyboard, touch interactions
- **Accessibility**: ✅ ARIA labels, roles, keyboard navigation
- **Responsive behavior**: ✅ Mobile and desktop layouts
- **Error states**: ✅ Missing data, failed loads
- **Translation support**: ✅ Custom and fallback translations

### Critical Test Areas

#### ProductCard Component
- [x] Product information display
- [x] Pricing with different currencies  
- [x] Favorite toggle functionality
- [x] Condition badges and colors
- [x] Image handling (URL strings and objects)
- [x] Click handlers and keyboard navigation
- [x] Hover effects and prefetching
- [x] Accessibility compliance

#### ProductGallery Component
- [x] Multi-image carousel navigation
- [x] Zoom functionality
- [x] Keyboard controls (arrows, escape)
- [x] Touch/swipe gestures
- [x] Thumbnail navigation
- [x] Condition badges
- [x] Image counter display
- [x] Responsive design

#### SellerCard Component
- [x] Seller stats and ratings
- [x] Verification badges
- [x] Activity indicators
- [x] Follow/message actions
- [x] Response time formatting
- [x] Join date calculations
- [x] Extended stats toggle
- [x] Translation support

#### Header Component
- [x] Authentication states
- [x] Mobile menu toggle
- [x] Language switching
- [x] Navigation links
- [x] User profile dropdown
- [x] Notification handling
- [x] Sign out functionality
- [x] Responsive behavior

#### Skeleton Components
- [x] Loading state animations
- [x] Proper structure and sizing
- [x] Accessibility considerations
- [x] Reduced motion support
- [x] High contrast compatibility

## Best Practices

### 1. Test Structure
```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    setupGlobalMocks();
    // Component-specific setup
  });

  describe('Feature Group', () => {
    it('specific behavior description', () => {
      // Test implementation
    });
  });
});
```

### 2. Async Testing
```typescript
// Always use userInteraction helper for proper timing
await userInteraction.click(button);
await userInteraction.keyDown(element, 'Enter');
await userInteraction.hover(element);
```

### 3. Mock Management
```typescript
beforeEach(() => {
  vi.clearAllMocks();
  setupGlobalMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});
```

### 4. Accessibility Testing
```typescript
// Use helper functions for consistent checks
expect(checkAccessibility.hasRole(element, 'button')).toBe(true);
expect(checkAccessibility.isKeyboardAccessible(element)).toBe(true);
```

## Common Issues and Solutions

### Issue: Svelte 5 Rune Testing
**Problem**: Tests fail because of improper rune handling
```typescript
// ❌ WRONG - Testing legacy Svelte patterns
$: doubled = count * 2;

// ✅ CORRECT - Testing Svelte 5 runes
let doubled = $derived(count * 2);
```

### Issue: Async State Updates
**Problem**: State changes not reflected in tests
```typescript
// ✅ SOLUTION - Wait for Svelte updates
await userInteraction.click(button);
await waitForSvelteUpdate();
```

### Issue: Component Mocking
**Problem**: External dependencies break tests
```typescript
// ✅ SOLUTION - Mock at module level
vi.mock('@repo/ui', () => ({
  Button: vi.fn(() => ({ render: vi.fn() })),
  Avatar: vi.fn(() => ({ render: vi.fn() }))
}));
```

## Performance Testing

### Component Render Time
```typescript
it('renders quickly for immediate feedback', () => {
  const startTime = performance.now();
  renderSvelte5Component(ProductCardSkeleton, {});
  const endTime = performance.now();
  
  expect(endTime - startTime).toBeLessThan(100);
});
```

### Memory Leaks
```typescript
afterEach(() => {
  // Cleanup DOM elements
  document.body.innerHTML = '';
  
  // Clear component instances
  vi.clearAllMocks();
});
```

## CI/CD Integration

### GitHub Actions
```yaml
- name: Run Component Tests
  run: |
    pnpm test:run --reporter=junit --outputFile=test-results.xml
    pnpm test:coverage --reporter=json --outputFile=coverage.json
```

### Coverage Requirements
- **Statements**: 90%+
- **Branches**: 85%+  
- **Functions**: 90%+
- **Lines**: 90%+

## Debugging Tests

### Visual Testing UI
```bash
# Launch Vitest UI for interactive debugging
pnpm test:ui
```

### Debug Specific Components
```bash
# Run only ProductCard tests in watch mode
pnpm vitest ProductCard --watch
```

### Console Debugging
```typescript
it('debug test', () => {
  renderSvelte5Component(ProductCard, { product: mockProduct });
  
  // Debug DOM state
  screen.debug();
  
  // Debug specific element
  const card = screen.getByRole('button');
  console.log('Card classes:', card.className);
});
```

This comprehensive testing setup ensures that all Driplo marketplace components are thoroughly tested, accessible, and maintain compatibility with Svelte 5's rune system.