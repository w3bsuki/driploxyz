# Toast System Documentation

## Overview

The toast system has been completely refactored to use Svelte 5 runes with Melt UI integration, providing a modern, mobile-first notification system with enhanced accessibility and developer experience.

## Architecture

### Enhanced Toast System (`packages/ui/src/lib/toast.ts`)

This is the **recommended** approach for all new code. It provides:
- Backward-compatible API with existing toast usage
- Enhanced error handling with `ErrorDetails` integration
- Smart toast type selection based on error severity
- Retry actions for retryable errors

```typescript
import { toast } from '@repo/ui';

// Basic usage
toast.success('Changes saved successfully');
toast.error('Something went wrong');

// Enhanced error handling
toast.fromError(errorDetails, { duration: 5000 });

// With actions
toast.show('Item deleted', 'success', {
  action: {
    label: 'Undo',
    onclick: () => handleUndo()
  }
});
```

### Modern Toast System (Melt UI based)

Low-level access to the Melt UI components for advanced use cases:

```typescript
import {
  ToastComponent,
  ToastProvider,
  MeltToastContainer,
  toastHelpers,
  toastPatterns,
  toastUtils
} from '@repo/ui';

// Advanced patterns
const loadingId = toastHelpers.loading('Uploading file...');
toastHelpers.update(loadingId, { type: 'success', description: 'Upload complete!' });

// Promise-based toasts
await toastHelpers.promise(uploadFile, {
  loading: 'Uploading...',
  success: 'File uploaded successfully',
  error: 'Upload failed'
});
```

## Migration Guide

### From Legacy Toast Store

**Before:**
```typescript
import { toasts } from '@repo/ui';

toasts.success('Success message');
```

**After:**
```typescript
import { toast } from '@repo/ui';

toast.success('Success message');
```

### From Error Handling

**Before:**
```typescript
toasts.error(error.message);
```

**After:**
```typescript
toast.fromError(errorDetails);
```

## Key Features

### 1. Deduplication
Prevents duplicate toasts within a 100ms window:
```typescript
// These won't create duplicates
toast.success('Item saved');
toast.success('Item saved'); // Ignored
```

### 2. Smart Duration
Toast duration based on message length and severity:
- Critical errors: 10 seconds (persistent)
- High severity: 8 seconds
- Medium/Low: 6 seconds
- Success/Info: 3-4 seconds

### 3. Mobile-First Design
- Touch-friendly 44px targets
- Optimized for mobile viewports
- Enhanced accessibility support

### 4. Error Handling Integration
```typescript
interface ErrorDetails {
  type: string;
  code?: string;
  userMessage: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  retryable?: boolean;
}
```

## Available Patterns

### Common Patterns
```typescript
import { toastPatterns } from '@repo/ui';

// Form operations
toastPatterns.formSuccess();
toastPatterns.formError();

// Network operations
toastPatterns.networkError('save changes');
toastPatterns.copied('Link');

// Authentication
toastPatterns.loginSuccess('username');
toastPatterns.sessionExpired();
toastPatterns.permissionDenied('delete items');
```

### Advanced Helpers
```typescript
import { toastHelpers } from '@repo/ui';

// Loading states
const loadingId = toastHelpers.loading('Processing...');

// Update existing toast
toastHelpers.update(loadingId, {
  type: 'success',
  description: 'Complete!'
});

// Toasts with actions
toastHelpers.withAction(
  'Delete item?',
  'warning',
  'Delete',
  () => handleDelete(),
  { persistent: true }
);
```

## Component Usage

### Layout Integration
```svelte
<!-- In your root layout (+layout.svelte) -->
<script>
  import { ToastContainer } from '@repo/ui';
</script>

<ToastContainer />
<!-- rest of your app -->
```

### Provider Setup
```svelte
<!-- For advanced integration -->
<script>
  import { ToastProvider, setToastProvider } from '@repo/ui';

  // Custom provider if needed
  setToastProvider(customProvider);
</script>

<ToastProvider>
  <ToastContainer />
</ToastProvider>
```

## TypeScript Support

Full TypeScript support with comprehensive types:

```typescript
import type {
  Toast,
  ToastType,
  ToastStoreOptions,
  ErrorDetails
} from '@repo/ui';

// Type-safe usage
function showError(message: string, options?: ToastStoreOptions): string {
  return toast.error(message, options);
}
```

## Testing

The toast system includes comprehensive test coverage:

```bash
# Run toast tests
pnpm --filter @repo/ui test -- --grep "toast"

# Test with coverage
pnpm --filter @repo/ui test -- --coverage
```

## Browser Support

- Modern browsers with ES2020+ support
- Safari 14+
- Firefox 88+
- Chrome 88+

## Performance

- Minimal bundle impact (~2KB gzipped)
- Efficient deduplication
- Memory-efficient cleanup
- Optimized for mobile devices

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure you're importing from `@repo/ui` not deep paths
2. **Type Errors**: Use the enhanced `toast` from the main export
3. **Provider Not Found**: Include `ToastContainer` in your root layout
4. **Duplicates Not Working**: Check your toast message formatting

### Debug Mode

Enable debug logging:
```typescript
import { toastUtils } from '@repo/ui';

// Check if system is ready
console.log('Toast ready:', toastUtils.isReady());

// Validate message
const warnings = toastUtils.validateMessage('Your message');
if (warnings.length > 0) {
  console.warn('Toast warnings:', warnings);
}
```