# @repo/core Domain Layer Contamination - Technical Debt

**Date**: 2025-01-21  
**Severity**: 🔴 **CRITICAL - Blocks Production Builds**  
**Priority**: P0 - Must fix before deployment  
**Status**: 📋 Documented, refactor plan required

---

## Problem Summary

The `@repo/core` shared package imports SvelteKit-specific modules (`$env`, `$lib`, `$app`), violating monorepo architecture principles. This causes build failures and prevents proper tree-shaking, code splitting, and deployment.

---

## Root Cause

According to [SvelteKit Server-Only Modules documentation](https://svelte.dev/docs/kit/server-only-modules):

> **Shared packages should NOT use SvelteKit-specific imports**

The `@repo/core` package is a shared utility package that should be framework-agnostic but incorrectly depends on:
- `$env/dynamic/public` - Runtime environment variables
- `$env/static/public` - Build-time environment variables  
- `$lib/utils/log` - Application-specific logger
- `$lib/utils/error-handling` - Application-specific error utils
- `$lib/stores/notifications` - Svelte stores (UI layer)
- `$app/environment` - Browser detection

---

## Affected Files (13 violations)

### 1. Client-Side Code (Should move to apps/web/src/lib/)
```typescript
// packages/core/src/stripe/client.ts
import { env } from '$env/dynamic/public'; // ❌ 
// Solution: Move entire file to apps/web/src/lib/stripe/client.ts
```

### 2. Services with Logging Dependencies
```typescript
// packages/core/src/services/stripe.ts
import { paymentLogger } from '$lib/utils/log'; // ❌

// packages/core/src/services/products.ts  
import { createLogger } from '$lib/utils/log'; // ❌

// packages/core/src/services/collections.ts
import { createLogger } from '$lib/utils/log'; // ❌

// packages/core/src/services/ConversationService.ts
import { messagingLogger } from '$lib/utils/log'; // ❌
```

**Solution**: Use dependency injection pattern:
```typescript
// ✅ Refactored version
export function createStripeService(logger: Logger) {
  return {
    async createPaymentIntent(...) {
      logger.info('Creating payment intent');
      // ...
    }
  };
}
```

### 3. Services with Environment Dependencies
```typescript
// packages/core/src/services/ConversationService.ts
import { PUBLIC_SUPABASE_URL } from '$env/static/public'; // ❌
```

**Solution**: Pass as constructor parameter:
```typescript
// ✅ Refactored version
export class ConversationService {
  constructor(
    private supabaseUrl: string,
    private logger: Logger
  ) {}
}
```

### 4. Services with App-Specific Utils
```typescript
// packages/core/src/services/transactions.ts
import { calculateCommission as calculateCommissionUtil } from '$lib/utils/payments'; // ❌

// packages/core/src/services/payouts.ts
import { validatePayoutMethod } from '$lib/utils/payments'; // ❌
import type { PayoutMethod } from '$lib/stripe/types'; // ❌

// packages/core/src/services/products.ts
import { parseError, withRetry, ErrorType } from '$lib/utils/error-handling.svelte'; // ❌
```

**Solution**: Move utilities to @repo/core or pass as deps:
```typescript
// Option 1: Move to @repo/core/src/utils/payments.ts
export { calculateCommission, validatePayoutMethod };

// Option 2: Dependency injection
export function createTransactionService(paymentUtils: PaymentUtils) {
  // ...
}
```

### 5. Services with UI Dependencies (MAJOR VIOLATION)
```typescript
// packages/core/src/services/realtimeNotifications.ts
import { browser } from '$app/environment'; // ❌ UI concern
import { notificationActions, showBrowserNotification } from '$lib/stores/notifications.svelte'; // ❌ Svelte store
```

**Solution**: Move entire file to apps/web/src/lib/realtime/notifications.ts  
**Reason**: Realtime notifications are UI-specific, not domain logic

---

## Impact Analysis

### Build Failures
```bash
$ pnpm turbo build
@repo/core:build: X [ERROR] Could not resolve "$env/dynamic/public"
@repo/core:build: X [ERROR] Could not resolve "$lib/utils/log"
@repo/core:build: X [ERROR] Could not resolve "$env/static/public"
```

### Dependency Graph Pollution
```
apps/web → @repo/core → $lib (circular!)
                      → $env (framework-specific!)
                      → $app (runtime-specific!)
```

This creates:
- ❌ Circular dependencies
- ❌ Framework lock-in (can't reuse in non-SvelteKit apps)
- ❌ Build complexity (requires special handling)
- ❌ Tree-shaking failures (can't remove unused code)

### Production Risks
- **Secrets exposure**: If `$env` handling is wrong, could leak service keys
- **Runtime crashes**: Browser-only code running on server
- **Bundle bloat**: UI code bundled with server code

---

## Refactoring Strategy

### Phase 1: Extract Client-Side Code (1-2 hours)
**Move to apps/web/src/lib/**:
- `packages/core/src/stripe/client.ts` → `apps/web/src/lib/stripe/client.ts`
- `packages/core/src/services/realtimeNotifications.ts` → `apps/web/src/lib/realtime/notifications.ts`

**Update imports** in:
- All components using `getStripe()` 
- All components using `realtimeNotifications`

### Phase 2: Implement Dependency Injection (3-4 hours)
**Create interface contracts**:
```typescript
// packages/core/src/types/dependencies.ts
export interface Logger {
  info(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
}

export interface AppConfig {
  supabaseUrl: string;
  stripePublishableKey?: string;
}

export interface PaymentUtils {
  calculateCommission(amount: number): number;
  validatePayoutMethod(method: PayoutMethod): boolean;
}
```

**Refactor services**:
```typescript
// packages/core/src/services/stripe.ts
export function createStripeService(
  config: AppConfig,
  logger: Logger,
  paymentUtils: PaymentUtils
) {
  return {
    async createPaymentIntent(...) {
      logger.info('Creating payment intent');
      const commission = paymentUtils.calculateCommission(amount);
      // ...
    }
  };
}
```

**Wire up in apps**:
```typescript
// apps/web/src/lib/services/index.ts
import { createStripeService } from '@repo/core/services/stripe';
import { createLogger } from '$lib/utils/log';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import * as paymentUtils from '$lib/utils/payments';

export const stripeService = createStripeService(
  { supabaseUrl: PUBLIC_SUPABASE_URL },
  createLogger('stripe'),
  paymentUtils
);
```

### Phase 3: Move Shared Utils to @repo/core (2-3 hours)
**Extract framework-agnostic utils**:
- `$lib/utils/payments.ts` → `@repo/core/src/utils/payments.ts`
- `$lib/stripe/types.ts` → `@repo/core/src/stripe/types.ts`

**Keep framework-specific in apps**:
- `$lib/utils/log.ts` (uses Sentry, SvelteKit context)
- `$lib/utils/error-handling.svelte` (uses Svelte runes)

### Phase 4: Validation (1 hour)
- ✅ `pnpm turbo build` succeeds for all packages
- ✅ `pnpm turbo check-types` passes with 0 errors
- ✅ Apps/web dev server starts without errors
- ✅ Apps/admin dev server starts without errors
- ✅ All tests pass

---

## Validation Checklist

- [ ] `packages/core/` has NO imports starting with `$env`, `$lib`, `$app`
- [ ] `packages/core/package.json` has NO `@sveltejs/kit` dependency
- [ ] `pnpm turbo build --filter=@repo/core` succeeds
- [ ] `grep -r "\$env\|$lib\|$app" packages/core/src/` returns no matches
- [ ] All services use dependency injection
- [ ] Client-side code moved to apps/web/src/lib/
- [ ] UI-specific code (notifications) moved to apps/web/src/lib/
- [ ] Framework-agnostic utils remain in @repo/core
- [ ] All 13 violations resolved
- [ ] Build time improved (no circular deps)
- [ ] Type safety maintained (proper interfaces)

---

## Estimated Effort

| Phase | Tasks | Time | Complexity |
|-------|-------|------|------------|
| Phase 1 | Move client code | 1-2h | Low |
| Phase 2 | Dependency injection | 3-4h | High |
| Phase 3 | Extract utils | 2-3h | Medium |
| Phase 4 | Validation | 1h | Low |
| **Total** | **11 files** | **7-10h** | **High** |

---

## Alternative: Quick Fix (NOT RECOMMENDED)

**Option**: Add `external` config to tsup.config.ts
```typescript
// packages/core/tsup.config.ts
export default defineConfig({
  external: [
    '$env/dynamic/public',
    '$env/static/public',
    '$lib',
    '$app'
  ]
});
```

**Why NOT recommended**:
- ❌ Doesn't fix architectural issue
- ❌ Still violates monorepo principles
- ❌ Runtime errors when used outside SvelteKit
- ❌ Prevents proper tree-shaking
- ❌ Technical debt accumulates

---

## References

- [SvelteKit Server-Only Modules](https://svelte.dev/docs/kit/server-only-modules)
- [SvelteKit Project Structure](https://svelte.dev/docs/kit/project-structure)
- [Dependency Injection Pattern](https://en.wikipedia.org/wiki/Dependency_injection)
- [Monorepo Best Practices](https://turbo.build/repo/docs/handbook/sharing-code/internal-packages)

---

## Decision Required

**Before proceeding with refactor, confirm approach**:
1. ✅ **Full Refactor (Phase 1-4)** - Proper solution, 7-10 hours
2. ❌ **Quick Fix (external config)** - Technical debt, 30 minutes
3. 🤔 **Hybrid (Phase 1 only)** - Move client code, defer DI - 1-2 hours

**Recommendation**: Option 1 (Full Refactor) - This is critical infrastructure that affects all future development.

---

**Status**: 📋 Awaiting user decision on refactoring approach
