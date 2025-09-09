# Accessibility Tests

This directory contains comprehensive accessibility tests for critical pages in the Driplo application using Playwright and @axe-core/playwright.

## Test Coverage

### Home Page (`home.spec.ts`)
- Zero critical accessibility violations
- Proper focus management and visible focus indicators
- Keyboard navigation support
- ARIA landmarks and navigation structure
- Heading hierarchy (single h1, logical structure)
- Search functionality accessibility
- Image alt text compliance
- Screen reader navigation support
- Touch target minimum sizes (44px/36px standards)
- Color contrast compliance
- Progressive enhancement (works without JavaScript)

### Search and Category Pages (`search.spec.ts`)
- Search form accessibility with proper labeling
- Autocomplete/listbox ARIA patterns
- Filter controls accessibility
- Search results with proper semantic structure
- Keyboard navigation through results
- Live region announcements for results
- Breadcrumb navigation
- Category hierarchy and navigation
- Consistent navigation patterns

### Product Detail Page (`product.spec.ts`)
- Product image gallery with keyboard navigation
- Descriptive alt text for all images
- Product information semantic structure
- Add to cart and purchase controls accessibility
- Product reviews and ratings accessibility
- Seller information accessibility
- Breadcrumb navigation
- Keyboard navigation through all interactive elements
- Product variations and options accessibility
- Dynamic content announcements (cart updates, etc.)
- Wishlist/favorite functionality accessibility

### Checkout Page (`checkout.spec.ts`)
- Form accessibility with proper labels and validation
- Shipping address form structure
- Billing information form accessibility
- Payment form with error handling
- Order summary accessibility
- Progress indication during checkout
- Shipping and delivery options
- Form validation error announcements
- Loading and processing state accessibility
- Promo code functionality

## Running the Tests

### All accessibility tests
```bash
# From project root
pnpm -w turbo run test --filter=web

# From web app directory
cd apps/web
pnpm test
```

### Specific accessibility tests
```bash
cd apps/web

# Run all a11y tests
npx playwright test tests/a11y/

# Run specific page tests
npx playwright test tests/a11y/home.spec.ts
npx playwright test tests/a11y/search.spec.ts
npx playwright test tests/a11y/product.spec.ts
npx playwright test tests/a11y/checkout.spec.ts

# Run with headed browser for debugging
npx playwright test tests/a11y/home.spec.ts --headed

# Run with debug mode
npx playwright test tests/a11y/home.spec.ts --debug
```

## Test Requirements

### Prerequisites
- Development server running on `http://localhost:5181`
- @axe-core/playwright package installed (already in devDependencies)
- Test data/products available for navigation tests

### WCAG Compliance
All tests check for compliance with:
- WCAG 2.0 Level A and AA
- WCAG 2.1 Level A and AA

### Critical Accessibility Areas Tested
1. **Zero Critical Violations**: All pages must pass axe-core scans
2. **Keyboard Navigation**: All interactive elements accessible via keyboard
3. **Screen Reader Support**: Proper ARIA patterns and semantic markup
4. **Focus Management**: Visible focus indicators and logical focus order
5. **Form Accessibility**: Proper labels, validation, and error handling
6. **Touch Target Sizes**: Minimum 44px for primary actions, 36px for secondary
7. **Color Contrast**: WCAG AA compliance for text and interactive elements

## Integration with CI/CD

These tests are automatically run as part of the test suite:
- Included in `pnpm test` command
- Integrated with Turbo for monorepo builds
- Can be run in CI environments with `--reporter=github` for proper annotations

## Troubleshooting

### Common Issues
1. **Connection Refused**: Ensure dev server is running (`pnpm dev`)
2. **Navigation Failures**: Check if routes exist and are accessible
3. **Third-party Elements**: Some violations from Stripe/external elements are excluded
4. **Flaky Tests**: Increase timeouts if network-dependent tests fail

### Debugging
Use `--headed` and `--debug` flags to visually inspect test failures. The tests log accessibility violations to console for easier debugging.

## Future Enhancements

- Add tests for mobile-specific interactions
- Include performance accessibility metrics
- Add tests for dynamic content updates
- Expand coverage to admin and dashboard areas
- Add visual regression testing for focus states