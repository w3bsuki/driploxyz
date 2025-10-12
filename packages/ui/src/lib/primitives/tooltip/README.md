# Tooltip Component

A robust, accessible Svelte 5 tooltip component built with Melt UI's `createTooltip` primitive. Designed for mobile-first experiences with proper touch support and accessibility features.

## Features

- ✅ **Mobile-first design** - Touch-friendly with proper 44px targets
- ✅ **Accessibility** - Full ARIA support, keyboard navigation, screen reader friendly
- ✅ **Svelte 5 runes** - Modern reactive syntax with `$state`, `$props`, `$derived`
- ✅ **Melt UI integration** - Built on solid, tested primitives
- ✅ **Design system aligned** - Uses OKLCH colors and design tokens
- ✅ **Touch optimization** - Smart touch/hover behavior detection
- ✅ **Customizable** - Extensive styling and positioning options
- ✅ **Performance optimized** - Minimal bundle impact, efficient animations

## Basic Usage

```svelte
<script>
  import { Tooltip } from '@repo/ui/primitives';
</script>

<Tooltip content="This is a helpful tooltip">
  {#snippet trigger()}
    <button class="btn btn-primary">Hover me</button>
  {/snippet}
</Tooltip>
```

## Props Interface

```typescript
interface TooltipProps {
  // Core props
  content: string;                    // Required: Tooltip text content
  open?: boolean;                     // Bindable: Control open state
  onOpenChange?: (open: boolean) => void; // Callback for state changes
  
  // Positioning
  positioning?: TooltipPosition;      // Default: { side: 'top', align: 'center' }
  
  // Timing
  openDelay?: number;                 // Default: 700ms
  closeDelay?: number;                // Default: 300ms
  
  // Behavior
  closeOnEscape?: boolean;            // Default: true
  closeOnPointerDown?: boolean;       // Default: true
  disabled?: boolean;                 // Default: false
  forceTouch?: boolean;               // Default: false (auto-detect)
  
  // Styling
  triggerClass?: string;              // Custom trigger classes
  tooltipClass?: string;              // Custom tooltip classes
  arrowClass?: string;                // Custom arrow classes
  
  // Content
  trigger: Snippet;                   // Required: Trigger element content
}

interface TooltipPosition {
  side: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
}
```

## Examples

### Positioning

```svelte
<!-- Top positioning (default) -->
<Tooltip content="Top tooltip" positioning={{ side: 'top' }}>
  {#snippet trigger()}
    <button class="btn">Top</button>
  {/snippet}
</Tooltip>

<!-- Bottom with start alignment -->
<Tooltip content="Bottom start" positioning={{ side: 'bottom', align: 'start' }}>
  {#snippet trigger()}
    <button class="btn">Bottom Start</button>
  {/snippet}
</Tooltip>
```

### Custom Delays

```svelte
<!-- Fast tooltip -->
<Tooltip content="Quick tooltip" openDelay={100} closeDelay={100}>
  {#snippet trigger()}
    <button class="btn">Fast</button>
  {/snippet}
</Tooltip>

<!-- Slow tooltip -->
<Tooltip content="Slow tooltip" openDelay={1500} closeDelay={500}>
  {#snippet trigger()}
    <button class="btn">Slow</button>
  {/snippet}
</Tooltip>
```

### Touch/Mobile Behavior

```svelte
<!-- Force touch behavior (tap to toggle) -->
<Tooltip content="Tap to toggle" forceTouch={true}>
  {#snippet trigger()}
    <button class="btn">Touch-enabled</button>
  {/snippet}
</Tooltip>
```

### Controlled State

```svelte
<script>
  let tooltipOpen = $state(false);
</script>

<Tooltip content="Controlled tooltip" bind:open={tooltipOpen}>
  {#snippet trigger()}
    <button class="btn">Controlled</button>
  {/snippet}
</Tooltip>

<button onclick={() => tooltipOpen = !tooltipOpen}>
  Toggle
</button>
```

### Custom Styling

```svelte
<!-- Success themed tooltip -->
<Tooltip 
  content="Success message"
  tooltipClass="!bg-[color:var(--green-500)] !text-white"
  arrowClass="!fill-[color:var(--green-500)]"
>
  {#snippet trigger()}
    <button class="btn">Success</button>
  {/snippet}
</Tooltip>
```

### Icon Trigger

```svelte
<Tooltip content="More information about this feature">
  {#snippet trigger()}
    <div class="w-5 h-5 rounded-full bg-[color:var(--blue-500)] text-white flex items-center justify-center text-xs cursor-help">
      ?
    </div>
  {/snippet}
</Tooltip>
```

## Accessibility Features

- **ARIA attributes**: `role="tooltip"`, `aria-describedby`, `aria-expanded`
- **Keyboard navigation**: Enter/Space keys toggle on touch devices
- **Focus management**: Proper focus ring and escape key handling
- **Screen reader support**: Content properly announced
- **High contrast mode**: Enhanced borders and colors
- **Reduced motion**: Respects user motion preferences
- **Touch targets**: Minimum 36px touch targets (44px for primary actions)

## Mobile Optimizations

- **Touch detection**: Auto-detects touch devices and adapts behavior
- **Font size**: 16px on mobile to prevent iOS zoom
- **Touch targets**: Proper sizing for finger interaction
- **Positioning**: Smart positioning that works within viewport
- **Performance**: Optimized animations and minimal reflows

## Styling Customization

The component uses CSS custom properties from the design system:

```css
/* Default tooltip styles */
.tooltip {
  background: var(--gray-900);
  color: white;
  border: 1px solid var(--gray-800);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  padding: var(--space-2) var(--space-3);
  max-width: 20rem;
}
```

### Custom CSS Classes

```svelte
<Tooltip 
  content="Custom styled tooltip"
  tooltipClass="!bg-purple-500 !text-white !border-purple-600 !font-semibold"
  arrowClass="!fill-purple-500 !border-purple-600"
>
  {#snippet trigger()}
    <button class="btn">Custom</button>
  {/snippet}
</Tooltip>
```

## Best Practices

### Do's ✅
- Keep tooltip content concise and helpful
- Use for supplementary information, not critical actions
- Ensure trigger has proper hover/focus states
- Test on both desktop and mobile devices
- Provide keyboard alternatives for important information

### Don'ts ❌
- Don't put critical information only in tooltips
- Don't use for complex interactive content
- Don't override positioning unless necessary
- Don't disable accessibility features without good reason
- Don't use on disabled elements (they can't receive focus)

## Integration Examples

### With Form Fields

```svelte
<div class="form-field">
  <label for="password">Password</label>
  <div class="flex items-center gap-2">
    <input id="password" type="password" class="input" />
    <Tooltip content="Password must be at least 8 characters with numbers and symbols">
      {#snippet trigger()}
        <div class="w-4 h-4 text-gray-400 cursor-help">ⓘ</div>
      {/snippet}
    </Tooltip>
  </div>
</div>
```

### With Action Buttons

```svelte
<div class="action-buttons">
  <Tooltip content="Save your changes">
    {#snippet trigger()}
      <button class="btn btn-primary">
        <SaveIcon />
        Save
      </button>
    {/snippet}
  </Tooltip>
  
  <Tooltip content="Discard all changes">
    {#snippet trigger()}
      <button class="btn btn-ghost">
        <CancelIcon />
        Cancel
      </button>
    {/snippet}
  </Tooltip>
</div>
```

### With Product Information

```svelte
<div class="product-info">
  <h3>Product Title</h3>
  <div class="flex items-center gap-2">
    <span class="price">$29.99</span>
    <Tooltip content="Price includes taxes and shipping">
      {#snippet trigger()}
        <span class="text-xs text-gray-400 cursor-help">ⓘ</span>
      {/snippet}
    </Tooltip>
  </div>
</div>
```

## Performance Considerations

- Tooltips are rendered conditionally (only when open)
- Uses efficient CSS animations with GPU acceleration
- Minimal JavaScript for touch detection
- No polling or intervals used
- Proper cleanup on component unmount

## Browser Support

- Modern browsers with CSS custom properties support
- iOS Safari 12+
- Chrome 69+
- Firefox 63+
- Edge 79+

## TypeScript Support

Full TypeScript support with proper type inference:

```typescript
import type { TooltipProps, TooltipPosition } from '@repo/ui/primitives';

const tooltipConfig: TooltipProps = {
  content: "Typed tooltip",
  positioning: { side: "bottom", align: "center" },
  openDelay: 500
};
```