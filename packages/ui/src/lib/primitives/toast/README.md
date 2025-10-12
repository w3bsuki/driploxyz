# Toast System - Svelte 5 + Melt UI

A comprehensive, mobile-first toast notification system built with Svelte 5 runes and Melt UI primitives.

## Features

- 🎯 **Mobile-first**: Optimized for touch interfaces with proper sizing
- ♿ **Accessible**: Full ARIA support and keyboard navigation
- 🎨 **Themable**: Uses semantic CSS classes from design system
- 🚀 **Performant**: Melt UI primitives for optimal rendering
- 📱 **Responsive**: Adapts to different screen sizes and orientations
- 🔄 **Compatible**: Works with existing `toasts.success()` pattern
- ⚡ **Rich Features**: Actions, persistence, promise handling

## Basic Usage

### Setup

Add the ToastContainer to your app root:

```svelte
<!-- app.html or root layout -->
<script>
  import { MeltToastContainer } from '@repo/ui';
</script>

<!-- Your app content -->
<main>
  <!-- App content -->
</main>

<!-- Toast container at root level -->
<MeltToastContainer position="bottom-right" />
```

### Simple Toasts

```typescript
import { modernToasts } from '@repo/ui';

// Basic toast types
modernToasts.success('Operation completed successfully');
modernToasts.error('Something went wrong');
modernToasts.warning('Please review your input');
modernToasts.info('New message received');
```

### Advanced Patterns

```typescript
import { toastPatterns, toastHelpers } from '@repo/ui';

// Form feedback
toastPatterns.formSuccess('Profile updated');
toastPatterns.formError();

// Network operations
toastPatterns.networkError('save your changes');

// File operations
const uploadId = toastPatterns.uploadProgress('image.jpg');
// Later...
toastPatterns.uploadSuccess('image.jpg');

// Promise-based loading
toastHelpers.promise(
  fetch('/api/data'),
  {
    loading: 'Fetching data...',
    success: 'Data loaded successfully',
    error: 'Failed to load data'
  }
);
```

### With Actions

```typescript
modernToasts.error('Failed to save', {
  action: {
    label: 'Retry',
    onclick: () => {
      // Retry logic
    },
    variant: 'secondary'
  }
});
```

## Migration Guide

### From Legacy Toast System

**Before (Legacy):**
```typescript
import { toasts } from '@repo/ui';

toasts.success('Message');
toasts.error('Error message');
```

**After (Modern):**
```typescript
import { modernToasts } from '@repo/ui';

modernToasts.success('Message');
modernToasts.error('Error message');
```

### From Window Global

**Before:**
```javascript
window.showToast('Message', 'success');
```

**After:**
```typescript
import { modernToasts } from '@repo/ui';

modernToasts.success('Message');
```

## Components

### ToastContainer

Main container component that manages all toasts:

```svelte
<MeltToastContainer
  position="bottom-right"
  limit={5}
  duration={5000}
  gap={8}
/>
```

### Individual Toast

For custom toast rendering:

```svelte
<script>
  import { Toast } from '@repo/ui';
  
  const toast = {
    id: 'custom-1',
    type: 'success',
    description: 'Custom toast',
    action: {
      label: 'View',
      onclick: () => console.log('Action clicked')
    }
  };
</script>

<Toast {toast} onDismiss={(id) => console.log('Dismissed:', id)} />
```

## Configuration

### Position Options

- `top` - Top center
- `bottom` - Bottom center  
- `top-left` - Top left corner
- `top-right` - Top right corner
- `bottom-left` - Bottom left corner
- `bottom-right` - Bottom right corner (default)

### Toast Types

- `success` - Green success toast
- `error` - Red error toast  
- `warning` - Orange warning toast
- `info` - Blue info toast

### Mobile Optimizations

- **Touch Targets**: Minimum 44px for primary actions, 36px for standard
- **Positioning**: Accounts for safe areas and bottom navigation
- **Gestures**: Swipe to dismiss support
- **Size**: Full width on mobile, constrained on desktop
- **Animations**: Reduced motion support

## Accessibility

- **ARIA**: Proper `role="alert"` and `aria-live` attributes
- **Focus**: Keyboard navigation for dismiss and actions
- **Screen Readers**: Descriptive labels and announcements
- **High Contrast**: Enhanced visibility in high contrast mode
- **Timing**: Sufficient time to read messages

## TypeScript

Full TypeScript support with comprehensive types:

```typescript
import type { ToastData, ToastType, ToastAction } from '@repo/ui';

const customToast: ToastData = {
  id: 'custom',
  type: 'success',
  description: 'Custom message',
  duration: 3000,
  action: {
    label: 'Action',
    onclick: () => {},
    variant: 'primary'
  }
};
```

## Best Practices

1. **Message Length**: Keep messages concise (< 150 characters)
2. **Duration**: Longer messages should have longer durations
3. **Actions**: Limit to one action per toast
4. **Positioning**: Bottom-right is recommended for mobile
5. **Limits**: Don't show more than 5 toasts simultaneously
6. **Types**: Use appropriate types for better UX

## Performance

- **Lazy Loading**: Components only render when needed
- **Memory**: Automatic cleanup of dismissed toasts
- **Animations**: GPU-accelerated CSS transitions
- **Bundle Size**: Tree-shakeable exports