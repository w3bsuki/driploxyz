# Comprehensive Playwright Testing Suite for Driplo

This directory contains a complete end-to-end testing suite for the Driplo marketplace application using Playwright with MCP (Model Context Protocol) integration.

## 🎯 Test Overview

Our testing strategy covers all aspects of the application:

- **Smoke Tests**: Critical path validation (10-15 minutes)
- **Accessibility Tests**: WCAG 2.1 AA compliance 
- **Component Tests**: UI component interaction testing
- **Feature Tests**: Complete user journey validation
- **Performance Tests**: Core Web Vitals and optimization metrics

## 📁 Directory Structure

```
apps/web/tests/
├── smoke/                 # Critical path smoke tests
│   ├── critical-path.spec.ts
│   └── mcp-critical-path.spec.ts
├── a11y/                  # Accessibility compliance tests
│   ├── wcag-compliance.spec.ts
│   ├── home.spec.ts
│   ├── product.spec.ts
│   ├── search.spec.ts
│   └── checkout.spec.ts
├── components/            # UI component interaction tests
│   └── ui-components.spec.ts
├── features/              # Complete user flow tests
│   └── complete-user-flows.spec.ts
├── performance/           # Performance and Core Web Vitals
│   └── core-web-vitals.spec.ts
├── fixtures/              # Test data and helper functions
│   ├── test-data.ts
│   ├── test-helpers.ts
│   └── mcp-helpers.ts
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites

1. **Development server running**: `pnpm dev` in root directory
2. **Database seeded**: Test users and products available
3. **MCP Playwright enabled**: Browser automation functions available

### Running Tests

```bash
# Run all tests
pnpm test:e2e

# Run specific test suites
pnpm test:smoke          # Critical path only (fast)
pnpm test:a11y           # Accessibility tests
pnpm test:components     # Component interaction tests
pnpm test:features       # Complete user flows
pnpm test:performance    # Performance metrics

# Run tests in headed mode (see browser)
pnpm test:e2e --headed

# Run tests with debugging
pnpm test:e2e --debug
```

## 🔥 Test Categories

### 1. Smoke Tests (Critical Path)

**Purpose**: Validate core functionality works
**Duration**: 10-15 minutes
**Files**: `smoke/critical-path.spec.ts`, `smoke/mcp-critical-path.spec.ts`

**Coverage**:
- Homepage loads correctly
- Authentication (signup/login/logout)
- Search functionality
- Product viewing
- Listing creation
- Basic checkout flow
- Mobile responsiveness
- Performance baseline

**When to run**: Before every deployment, in CI/CD pipeline

### 2. Accessibility Tests (WCAG 2.1 AA)

**Purpose**: Ensure accessibility compliance
**Duration**: 15-20 minutes  
**Files**: `a11y/wcag-compliance.spec.ts`, `a11y/*.spec.ts`

**Coverage**:
- Images have alt text (1.1.1)
- Proper heading structure (1.3.1)
- Logical reading order (1.3.2)
- Color contrast ratios (1.4.3)
- Text resizable to 200% (1.4.4)
- Keyboard navigation (2.1.1)
- No keyboard traps (2.1.2)
- Skip links available (2.4.1)
- Descriptive page titles (2.4.2)
- Focus order logical (2.4.3)
- Clear link purposes (2.4.4)
- Language specified (3.1.1)
- No unexpected context changes (3.2.1)
- Error identification (3.3.1)
- Form labels present (3.3.2)
- Valid HTML markup (4.1.1)
- Proper ARIA implementation (4.1.2)
- Touch targets ≥44px (mobile)

**When to run**: Weekly, before accessibility audits

### 3. Component Tests

**Purpose**: Test individual UI component behavior
**Duration**: 20-25 minutes
**Files**: `components/ui-components.spec.ts`

**Coverage**:
- Button variants and states
- FavoriteButton toggle functionality  
- SearchBar input and submission
- ProductCard interactions
- Modal/Dialog open/close behavior
- Form components (Input, Select, TextArea)
- ImageUploader file handling
- Navigation components
- Filter components
- Toast notifications
- Loading components
- Badge components

**When to run**: After UI changes, weekly regression

### 4. Feature Tests (Complete User Flows)

**Purpose**: Validate end-to-end user journeys
**Duration**: 45-60 minutes
**Files**: `features/complete-user-flows.spec.ts`

**Coverage**:
- Complete buyer journey (signup → purchase)
- Complete seller journey (signup → first sale)
- Messaging system conversations
- Search and filter functionality
- Favorites/wishlist management
- Order management and reviews
- Mobile responsive flows

**When to run**: Before major releases, weekly full regression

### 5. Performance Tests

**Purpose**: Measure Core Web Vitals and optimization
**Duration**: 20-30 minutes
**Files**: `performance/core-web-vitals.spec.ts`

**Coverage**:
- Core Web Vitals (LCP, FID, CLS)
- Network performance and resource loading
- Image optimization and lazy loading
- JavaScript bundle size and execution
- Memory usage monitoring
- Mobile vs desktop comparison
- Third-party performance impact
- PWA feature performance

**When to run**: Before deployments, performance reviews

## 🔧 Test Configuration

### Performance Thresholds

```typescript
const PERFORMANCE_THRESHOLDS = {
  LCP: 1500, // Largest Contentful Paint - 1.5s mobile
  FID: 100,  // First Input Delay - 100ms  
  CLS: 0.1,  // Cumulative Layout Shift - 0.1
  TTFB: 600, // Time to First Byte - 600ms
  FCP: 900,  // First Contentful Paint - 900ms
  TTI: 3800, // Time to Interactive - 3.8s mobile
  TBT: 200   // Total Blocking Time - 200ms mobile
};
```

### Test Data

Test users and data are defined in `fixtures/test-data.ts`:

```typescript
const testUsers = {
  buyer: { email: 'buyer@test.driplo.com', password: 'TestBuyer123!' },
  seller: { email: 'seller@test.driplo.com', password: 'TestSeller123!' },
  admin: { email: 'admin@test.driplo.com', password: 'TestAdmin123!' }
};
```

### MCP Playwright Functions

The tests use MCP (Model Context Protocol) Playwright functions for browser automation:

- `mcp__playwright__browser_navigate({ url })`
- `mcp__playwright__browser_click({ element, ref })`  
- `mcp__playwright__browser_type({ element, ref, text })`
- `mcp__playwright__browser_snapshot()` - Accessibility snapshots
- `mcp__playwright__browser_take_screenshot({ filename })`
- `mcp__playwright__browser_fill_form({ fields })`
- `mcp__playwright__browser_wait_for({ text, time })`

## 📊 Test Reporting

### Screenshots

All tests generate screenshots saved to `test-results/`:
- `smoke-*`: Critical path validation
- `a11y-*`: Accessibility state capture  
- `component-*`: Component interaction states
- `feature-*`: User journey milestones
- `performance-*`: Performance measurement states

### Console Output

Tests provide detailed console logging:
- Performance metrics with pass/fail indicators
- Network request analysis
- Memory usage statistics
- Accessibility violation reports

### Test Results

Results include:
- Pass/fail status for each test
- Performance metric measurements
- Accessibility compliance scores
- Error logs and stack traces

## 🎯 Success Criteria

### Smoke Tests
- ✅ All critical paths functional
- ✅ No console errors
- ✅ Basic performance acceptable (<5s load)

### Accessibility Tests  
- ✅ Zero critical WCAG violations
- ✅ All images have alt text
- ✅ Keyboard navigation works
- ✅ Touch targets ≥44px

### Component Tests
- ✅ All interactive elements respond
- ✅ Form validation works
- ✅ Modals open/close properly
- ✅ Loading states display

### Feature Tests
- ✅ Complete user journeys successful
- ✅ Data persistence works
- ✅ Error handling functional
- ✅ Mobile flows equivalent

### Performance Tests
- ✅ LCP ≤ 1.5s mobile
- ✅ CLS ≤ 0.1
- ✅ TTFB ≤ 600ms
- ✅ No failed network requests

## 🚨 Troubleshooting

### Common Issues

**Tests timeout**: 
- Check dev server is running on correct port
- Verify database contains test data
- Increase timeout in specific tests

**Screenshot failures**:
- Ensure `test-results/` directory exists
- Check disk space availability
- Verify screenshot directory permissions

**Performance test failures**:
- Warm up application before testing
- Run tests on consistent hardware
- Check for background processes affecting performance

**MCP function errors**:
- Verify MCP Playwright integration is enabled
- Check function declarations match usage
- Ensure browser automation permissions

### Debugging Tests

```bash
# Run single test file
npx playwright test smoke/critical-path.spec.ts

# Debug specific test
npx playwright test --debug smoke/critical-path.spec.ts

# Run in headed mode to see browser
npx playwright test --headed

# Generate test report
npx playwright show-report
```

## 🔄 Maintenance

### Adding New Tests

1. **Choose appropriate category** (smoke/a11y/components/features/performance)
2. **Follow naming conventions** (`feature-description.spec.ts`)
3. **Use test helpers** from `fixtures/` directory
4. **Add proper documentation** in test descriptions
5. **Update this README** if adding new categories

### Updating Test Data

1. **Modify `fixtures/test-data.ts`** for new test data
2. **Keep test users consistent** across environments
3. **Use realistic data** that matches production patterns
4. **Avoid hardcoded values** in individual tests

### Performance Threshold Updates

1. **Monitor real user metrics** to set realistic thresholds
2. **Update thresholds** in `performance/core-web-vitals.spec.ts`
3. **Document threshold changes** in version control
4. **Test threshold changes** before deployment

## 🔗 Related Documentation

- [Playwright Documentation](https://playwright.dev/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Driplo Development Guide](../../README.md)

## 📈 Metrics & Analytics

### Test Execution Metrics
- **Total test runtime**: ~2-3 hours (all suites)
- **Smoke tests**: 10-15 minutes  
- **Coverage**: >95% of user flows
- **Reliability**: >98% pass rate expected

### Performance Benchmarks
- **Homepage LCP**: <1.2s target
- **Search results**: <1.5s target  
- **Product pages**: <1.3s target
- **Checkout flow**: <2.0s target

### Accessibility Compliance
- **WCAG 2.1 AA**: 100% compliance target
- **Keyboard navigation**: All interactive elements
- **Screen reader**: Full compatibility
- **Mobile accessibility**: Touch targets ≥44px

---

**Last Updated**: $(date)
**Test Suite Version**: 1.0.0
**Maintainer**: Development Team