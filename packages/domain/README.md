# @repo/domain

Business logic layer for the Driplo platform.

## Purpose

This package contains the core business logic extracted from the web application to enable code reuse across all apps (web, admin, docs). It provides:

- **Domain Services**: Business operations for different domains (products, orders, profiles, etc.)
- **Validation**: Business rules and validation logic
- **Types**: Domain-specific type definitions

## Package Structure

```
src/
├── services/           # Business domain services
│   ├── products/       # Product management, categories, brands
│   ├── orders/         # Order processing, transactions
│   ├── profiles/       # User profiles, preferences
│   ├── messaging/      # Conversations, notifications
│   └── payments/       # Payment processing
├── validation/         # Business rules & validators
└── types/             # Domain-specific types
```

## Usage

### Importing from the package

```typescript
// Import specific domain services
import { productService } from '@repo/domain/services/products';
import { orderService } from '@repo/domain/services/orders';
import { profileService } from '@repo/domain/services/profiles';

// Import validation utilities
import { productValidator } from '@repo/domain/validation';

// Import types
import { Product, Order } from '@repo/domain/types';
```

### Using services

```typescript
import { productService } from '@repo/domain/services/products';

// Fetch products with business logic applied
const products = await productService.findFeaturedProducts();

// Create a new product with validation
const newProduct = await productService.createProduct(productData);
```

## Development

### Building

```bash
pnpm --filter @repo/domain build
```

### Development mode

```bash
pnpm --filter @repo/domain dev
```

### Testing

```bash
pnpm --filter @repo/domain test
```

### Type checking

```bash
pnpm --filter @repo/domain check-types
```

### Linting

```bash
pnpm --filter @repo/domain lint
```

## Dependencies

- **@repo/database**: Database access and generated types
- **@repo/core**: Core utilities and authentication
- **@supabase/supabase-js**: Supabase client
- **zod**: Runtime type validation

## Migration Status

This package is part of Phase 5 of the monorepo refactor. Services are being migrated from `apps/web/src/lib/services/` to their respective domain folders.

### Completed Migrations

- ✅ Package foundation setup
- ✅ Basic directory structure
- ✅ TypeScript configuration
- ✅ Build configuration

### Pending Migrations

- ⏳ Product services (Task 2)
- ⏳ Order services (Task 3)
- ⏳ Profile services (Task 4)
- ⏳ Messaging services (Task 7)
- ⏳ Payment services (Task 5)

## Architecture Guidelines

1. **Pure Business Logic**: Services should contain only business logic, no HTTP handlers
2. **Type Safety**: All functions should be fully typed with TypeScript
3. **Error Handling**: Use consistent error patterns across all services
4. **Validation**: Implement business rules validation at the domain level
5. **Testing**: Each service should have comprehensive unit tests
6. **Documentation**: Document complex business logic and edge cases

## Contributing

When adding new services:

1. Create the service in the appropriate domain folder
2. Add comprehensive unit tests
3. Update the relevant index.ts exports
4. Document the service's purpose and usage
5. Run full validation suite before committing

```bash
pnpm --filter @repo/domain test
pnpm --filter @repo/domain check-types
pnpm --filter @repo/domain lint
pnpm --filter @repo/domain build
```