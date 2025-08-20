# Driplo Integration Tests

This directory contains comprehensive integration tests for the Driplo marketplace API endpoints and server-side functionality.

## Test Structure

### Test Files

- **`auth.test.ts`** - Authentication endpoints and flows
- **`products.test.ts`** - Product CRUD, search, and management
- **`payments.test.ts`** - Payment processing and Stripe integration
- **`profile.test.ts`** - User profiles, onboarding, and social features

### Supporting Files

- **`../../test/utils/server-test-utils.ts`** - Utilities for SvelteKit server testing
- **`../../test/mocks/`** - Mock implementations for Supabase, Stripe, etc.
- **`../../test/setup.ts`** - Global test setup and configuration

## Running Tests

### Prerequisites

```bash
# Install dependencies
pnpm install

# Build the UI package (required for tests)
pnpm build --filter @repo/ui
```

### Test Commands

```bash
# Run all tests
pnpm test

# Run only unit tests (including integration tests in src/)
pnpm test:unit

# Watch mode for development
pnpm test:unit:watch

# Run with UI
pnpm test:ui

# Generate coverage report
pnpm test:coverage

# Run specific test file
pnpm vitest src/routes/test/auth.test.ts

# Run tests matching a pattern
pnpm vitest --grep "authentication"
```

## Test Coverage

### Authentication Tests (`auth.test.ts`)

✅ **Login Flow**
- Valid credential authentication
- Invalid credential handling
- Email confirmation requirements
- Rate limiting enforcement
- Onboarding redirection
- Form validation

✅ **Signup Flow**
- Account creation with valid data
- Duplicate email handling
- Password confirmation validation
- Terms acceptance requirement
- Rate limiting

✅ **Logout Flow**
- Authenticated user logout
- Error handling
- Unauthenticated user handling

✅ **Edge Cases**
- Missing profile data
- Database connection errors
- Session handling

### Products Tests (`products.test.ts`)

✅ **Product API Endpoints**
- GET `/api/products/[id]` - Product retrieval with proper formatting
- GET `/api/products/price-suggestions` - Price suggestion engine
- Product not found handling
- Service error handling

✅ **Product Pages**
- Product detail page loading
- Category page with pagination
- Related products loading
- User favorites integration

✅ **Product Creation**
- Valid product creation (sell action)
- Field validation
- Image upload handling
- Subscription limits enforcement
- Authentication requirements

✅ **Search and Filtering**
- Product search with filters
- Empty result handling
- Parameter validation

✅ **Product Management**
- Owner permissions
- Edit restrictions
- Sold product status updates

### Payments Tests (`payments.test.ts`)

✅ **Payment Intent Creation**
- Valid product purchase flow
- Already sold product rejection
- Self-purchase prevention
- Authentication requirements
- Shipping address validation
- Total calculation with shipping

✅ **Payment Confirmation**
- Successful payment confirmation
- Failed payment handling
- Invalid payment intent handling

✅ **Stripe Webhooks**
- Payment success processing
- Transaction record creation
- Order status updates
- Product sold status updates
- Signature verification
- Error handling
- Subscription webhooks

✅ **Error Scenarios**
- Stripe API errors
- Database errors during processing
- Amount validation
- Missing metadata handling

### Profile Tests (`profile.test.ts`)

✅ **User Onboarding**
- Complete onboarding with valid data
- Username uniqueness validation
- Required field validation
- Username format validation
- Authentication requirements

✅ **Profile Management**
- Public profile viewing with stats
- Private profile restrictions
- Profile editing with validation
- Avatar upload handling
- Permission enforcement

✅ **Social Features**
- Follow/unfollow functionality
- Self-following prevention
- Favorites management
- Profile statistics calculation

✅ **Privacy and Security**
- Profile privacy settings
- Owner access control
- Update permission validation
- Data sanitization

## Test Utilities and Mocks

### Server Test Utils (`server-test-utils.ts`)

**Mock Factories:**
- `createMockServerRequestEvent()` - SvelteKit request events
- `createAuthenticatedRequestEvent()` - Authenticated user events
- `createValidFormData()` - Form data with validation
- `createJsonRequest()` - JSON API requests
- `createWebhookRequest()` - Stripe webhook requests

**Database Mocking:**
- `mockSupabaseQuery()` - Mock database query results
- `createTestUser()` - Test user data factory
- `createTestProfile()` - Test profile data factory
- `createTestProduct()` - Test product data factory

**Assertion Helpers:**
- `expectValidationError()` - Validate form errors
- `expectSuccessfulAction()` - Validate successful actions
- `expectAuthenticationRequired()` - Validate auth requirements

### Mock Services

**Supabase Mock (`mocks/supabase.ts`):**
- Complete Supabase client mock
- Authentication methods
- Database query methods
- Storage operations
- Real-time subscriptions

**Stripe Mock (`mocks/stripe.ts`):**
- Client-side Stripe mock
- Server-side Stripe mock
- Payment intents
- Customers and subscriptions
- Webhook construction

## Writing New Tests

### Basic Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { 
  createAuthenticatedRequestEvent,
  testServerAction,
  resetAllMocks
} from '../../test/utils/server-test-utils.js';

describe('Your Feature Tests', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('Feature Group', () => {
    it('should test specific behavior', async () => {
      // Arrange
      const event = createAuthenticatedRequestEvent();
      
      // Act
      const result = await testServerAction(action, event);
      
      // Assert
      expect(result).toBeDefined();
    });
  });
});
```

### Testing Server Actions

```typescript
import { actions } from '../path/to/+page.server.js';

it('should handle form submission', async () => {
  const formData = createValidFormData({
    field: 'value'
  });
  
  const request = createFormRequest(formData);
  const event = createMockServerRequestEvent({ request });
  
  const result = await testServerAction(actions.actionName, event);
  
  expectSuccessfulAction(result);
});
```

### Testing Load Functions

```typescript
import { load } from '../path/to/+page.server.js';

it('should load page data', async () => {
  const event = createMockServerRequestEvent({
    params: { id: 'test-id' }
  });
  
  const result = await testServerLoad(load, event);
  
  expect(result.data).toBeDefined();
});
```

### Testing API Endpoints

```typescript
import { GET } from '../api/endpoint/+server.js';

it('should return JSON response', async () => {
  const event = createMockServerRequestEvent();
  
  const response = await GET(event);
  const result = await response.json();
  
  expect(response.status).toBe(200);
  expect(result).toEqual(expectedData);
});
```

## Best Practices

### Test Organization
- Group related tests in `describe` blocks
- Use descriptive test names that explain the behavior
- Follow Arrange-Act-Assert pattern
- Clean up mocks between tests with `beforeEach`

### Mock Management
- Use `resetAllMocks()` in `beforeEach` hooks
- Set up specific mock responses for each test
- Mock at the appropriate level (service vs. database)
- Verify mock calls when testing integrations

### Assertions
- Use specific assertions over generic ones
- Test both success and failure cases
- Verify error messages are user-friendly
- Check that side effects occur (database updates, etc.)

### Authentication Testing
- Test both authenticated and unauthenticated scenarios
- Verify permission and authorization checks
- Test with different user roles/permissions
- Mock session data appropriately

### Database Testing
- Mock database responses consistently
- Test error handling for database failures
- Verify correct query parameters
- Test pagination and filtering logic

## Debugging Tests

### Common Issues

**Mock Not Working:**
```typescript
// Ensure mocks are reset between tests
beforeEach(() => {
  resetAllMocks();
});

// Check mock setup
console.log(mockSupabaseClient.from.mock.calls);
```

**Request Event Issues:**
```typescript
// Ensure proper request event structure
const event = createMockServerRequestEvent({
  request: createFormRequest(formData),
  params: { id: 'test-id' },
  locals: {
    supabase: mockSupabaseClient,
    safeGetSession: vi.fn().mockResolvedValue({ session, user })
  }
});
```

**Async Test Problems:**
```typescript
// Always await async operations
await expect(asyncFunction()).rejects.toThrow();

// Use proper async test syntax
it('should handle async operation', async () => {
  const result = await asyncOperation();
  expect(result).toBeDefined();
});
```

## Maintenance

### Adding New Endpoints
1. Create test cases for all HTTP methods
2. Test authentication and authorization
3. Validate input parameters
4. Test error responses
5. Update this README

### Updating Mocks
1. Keep mocks in sync with actual API changes
2. Update mock data factories when schemas change
3. Test mock behavior matches real services
4. Document mock limitations

### Performance Considerations
- Use `vi.fn().mockResolvedValue()` for fast async mocks
- Avoid real network calls in tests
- Keep test data minimal but representative
- Use test timeouts for integration scenarios

## Continuous Integration

These tests are designed to run in CI environments:

```bash
# CI test command
pnpm test:unit --reporter=junit --outputFile=test-results.xml
```

**Environment Variables for CI:**
- Tests use mocked services (no real API calls)
- Mock environment variables are set in test setup
- No external dependencies required

## Related Documentation

- [SvelteKit Testing](https://kit.svelte.dev/docs/testing)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/docs/svelte-testing-library/intro)
- [Supabase Testing Guide](https://supabase.com/docs/guides/getting-started/testing)
- [Stripe Testing](https://stripe.com/docs/testing)