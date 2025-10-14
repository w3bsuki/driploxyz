# Comprehensive E2E Test Suite

This directory contains a comprehensive Playwright E2E test suite for your marketplace application.

## Test Structure

### Core Test Files

- **`fixtures.ts`** - Enhanced test fixtures with comprehensive mocking
- **`auth.spec.ts`** - Authentication flow tests (existing)
- **`search.spec.ts`** - Search functionality tests (existing)
- **`checkout.spec.ts`** - Checkout flow tests (existing)
- **`a11y.spec.ts`** - Basic accessibility tests (existing)
- **`localization.spec.ts`** - Internationalization tests (existing)
- **`onboarding.spec.ts`** - User onboarding tests (existing)

### New Comprehensive Test Files

- **`selling.spec.ts`** - Product listing and selling flow tests
- **`dashboard.spec.ts`** - Dashboard and user management tests
- **`messaging.spec.ts`** - Messaging and communication tests
- **`payments.spec.ts`** - Payment and subscription flow tests
- **`mobile.spec.ts`** - Mobile responsiveness tests
- **`error-handling.spec.ts`** - Error handling and edge case tests
- **`accessibility-comprehensive.spec.ts`** - Comprehensive accessibility tests

## Running Tests

### Install Dependencies

```bash
pnpm install
```

### Run All Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run with UI mode for debugging
pnpm exec playwright test --ui

# Run with headed mode (shows browser)
pnpm exec playwright test --headed
```

### Run Specific Test Suites

```bash
# Run selling flow tests
pnpm exec playwright test selling.spec.ts

# Run dashboard tests
pnpm exec playwright test dashboard.spec.ts

# Run messaging tests
pnpm exec playwright test messaging.spec.ts

# Run payment tests
pnpm exec playwright test payments.spec.ts

# Run mobile tests
pnpm exec playwright test mobile.spec.ts

# Run error handling tests
pnpm exec playwright test error-handling.spec.ts

# Run accessibility tests
pnpm exec playwright test accessibility-comprehensive.spec.ts
```

### Run Tests by Tag

```bash
# Run smoke tests
pnpm exec playwright test --grep "@smoke"

# Run mobile-specific tests
pnpm exec playwright test --project "mobile-chrome"

# Run accessibility tests
pnpm exec playwright test --grep "accessibility"
```

### Debug Tests

```bash
# Run with debug mode
pnpm exec playwright test --debug

# Run with trace on first retry
pnpm exec playwright test --trace on-first-retry

# Run with video recording
pnpm exec playwright test --video on
```

## Test Configuration

### Browser Support

The test suite is configured to run on:
- **Chromium** (Desktop Chrome)
- **Firefox** (Desktop Firefox)
- **WebKit** (Desktop Safari)
- **Mobile Chrome** (Mobile viewport)

### Viewport Sizes

- **Desktop**: 1280x720
- **Mobile**: 375x667 (iPhone)
- **Tablet**: 768x1024 (iPad)

### Test Fixtures

The enhanced fixtures provide:

1. **Comprehensive API Mocking**
   - Search API responses
   - Product data
   - User authentication
   - Payment processing
   - Messaging system
   - Dashboard analytics

2. **User Role Simulation**
   - `authenticatedPage` - Regular authenticated user
   - `adminPage` - Admin user
   - `sellerPage` - Seller user

3. **Performance Optimizations**
   - Disabled animations
   - Mocked external services
   - Optimized loading

## Test Coverage

### 🔐 Authentication & Authorization
- User signup and login flows
- Password reset functionality
- OAuth provider integration
- Session management
- Role-based access control

### 🛍️ Product Management
- Product listing creation flow
- Image upload and management
- Category selection
- Pricing and shipping setup
- Product editing and deactivation
- Inventory management

### 📊 Dashboard & Analytics
- Sales overview and metrics
- Order management interface
- Purchase history
- Earnings and payouts
- Profile management
- Settings and preferences

### 💬 Messaging System
- Conversation management
- Message sending and receiving
- File attachments
- Search and filtering
- Mobile messaging experience
- Notifications

### 💳 Payments & Subscriptions
- Checkout flow testing
- Payment method handling
- Stripe integration
- Subscription management
- Billing history
- Payment error handling

### 📱 Mobile Responsiveness
- Multi-device testing
- Touch interaction testing
- Orientation changes
- Performance on mobile
- Mobile-specific features

### ♿ Accessibility
- Keyboard navigation
- Screen reader support
- Color contrast testing
- Focus management
- ARIA compliance
- Mobile accessibility

### 🚨 Error Handling
- Network error scenarios
- Form validation edge cases
- Navigation error handling
- Resource loading failures
- Browser compatibility issues
- Security edge cases

## Best Practices

### Test Organization

1. **Use Descriptive Test Names**
   ```typescript
   test('should allow user to signup with valid credentials', async ({ page }) => {
     // Test implementation
   });
   ```

2. **Group Related Tests**
   ```typescript
   test.describe('Authentication Flow', () => {
     test.beforeEach(async ({ page }) => {
       await page.goto('/auth/login');
     });
     
     test('should login with valid credentials', async ({ page }) => {
       // Test implementation
     });
   });
   ```

3. **Use Page Object Pattern**
   ```typescript
   class LoginPage {
     constructor(private page: Page) {}
     
     async login(email: string, password: string) {
       await this.page.fill('[data-testid="email"]', email);
       await this.page.fill('[data-testid="password"]', password);
       await this.page.click('[data-testid="login-button"]');
     }
   }
   ```

### Test Data Management

1. **Use Mock Data Factories**
   ```typescript
   const createMockUser = (overrides = {}) => ({
     id: 'test-user-id',
     email: 'test@example.com',
     ...overrides
   });
   ```

2. **Avoid Hard-coded Test Data**
   - Use data factories
   - Generate unique data for each test
   - Clean up test data after tests

### Error Handling

1. **Handle Flaky Tests**
   ```typescript
   test('should handle slow loading', async ({ page }) => {
     await page.waitForSelector('[data-testid="content"]', { timeout: 10000 });
   });
   ```

2. **Provide Helpful Error Messages**
   ```typescript
   expect(await errorMessage.isVisible()).toBeTruthy('Error message should be visible');
   ```

## Troubleshooting

### Common Issues

1. **Tests Failing Due to Timing**
   - Increase wait timeouts
   - Use `waitForSelector` instead of fixed waits
   - Check for loading states

2. **Element Not Found**
   - Verify selectors are correct
   - Check if element is in viewport
   - Use more specific selectors

3. **Flaky Tests**
   - Add proper waits
   - Use retry mechanisms
   - Check for race conditions

### Debugging Tips

1. **Use Playwright Inspector**
   ```bash
   PWDEBUG=1 pnpm exec playwright test
   ```

2. **Take Screenshots**
   ```typescript
   await page.screenshot({ path: 'debug.png', fullPage: true });
   ```

3. **Console Logging**
   ```typescript
   console.log('Current URL:', page.url());
   console.log('Element text:', await element.textContent());
   ```

## Continuous Integration

### GitHub Actions Configuration

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm test:e2e
```

### Test Reporting

- HTML reports are generated automatically
- Screenshots are captured on failure
- Videos are recorded for debugging
- Trace files provide detailed execution info

## Contributing

When adding new tests:

1. **Follow existing patterns** and conventions
2. **Add descriptive test names** and comments
3. **Include proper error handling**
4. **Test both positive and negative scenarios**
5. **Ensure tests are independent** and can run in parallel
6. **Add appropriate selectors** to test elements
7. **Update this documentation** when adding new test suites

## Performance Considerations

- Tests run in parallel by default
- Use mocking to avoid external dependencies
- Optimize test data and setup
- Monitor test execution times
- Use appropriate wait strategies

## Security Testing

The test suite includes basic security testing:
- XSS prevention testing
- CSRF token validation
- Input sanitization verification
- Authentication bypass attempts
- Data exposure checks

For more comprehensive security testing, consider integrating dedicated security testing tools.