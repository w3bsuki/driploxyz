# Driplo UI/UX Style Guide

## Overview

This guide documents the enhanced UI/UX system for Driplo, focusing on the improvements made to elevate the shopper/seller experience to match C2C fashion marketplaces like Vinted, Depop, and Grailed.

## Design System Enhancements

### 1. Enhanced Theme System

#### Brand Color Scales
We've expanded the theme system with comprehensive brand color scales:

```css
/* Primary Brand Colors */
--brand-primary-50: oklch(0.98 0.01 240);
--brand-primary-100: oklch(0.95 0.02 240);
--brand-primary-200: oklch(0.90 0.04 240);
--brand-primary-300: oklch(0.82 0.06 240);
--brand-primary-400: oklch(0.72 0.09 240);
--brand-primary-500: oklch(0.62 0.12 240);
--brand-primary-600: oklch(0.52 0.15 240);
--brand-primary-700: oklch(0.42 0.18 240);
--brand-primary-800: oklch(0.32 0.15 240);
--brand-primary-900: oklch(0.22 0.10 240);

/* Secondary Brand Colors */
--brand-secondary-50: oklch(0.98 0.01 300);
/* ... (50-900 scale) */

/* Accent Brand Colors */
--brand-accent-50: oklch(0.98 0.01 50);
/* ... (50-900 scale) */
```

#### Enhanced Elevation Tokens
New elevation tokens provide consistent depth and hierarchy:

```css
--elevation-xs: 0 1px 2px rgba(0, 0, 0, 0.03);
--elevation-sm: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03);
--elevation-md: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05);
--elevation-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.07);
--elevation-xl: 0 20px 25px rgba(0, 0, 0, 0.12), 0 10px 10px rgba(0, 0, 0, 0.08);
--elevation-2xl: 0 25px 50px rgba(0, 0, 0, 0.15), 0 12px 24px rgba(0, 0, 0, 0.1);
```

#### Enhanced Button States
Comprehensive button state tokens for consistent interactions:

```css
--btn-primary-bg: var(--brand-primary-600);
--btn-primary-bg-hover: var(--brand-primary-700);
--btn-primary-bg-active: var(--brand-primary-800);
--btn-primary-text: var(--color-white);
--btn-primary-shadow: var(--elevation-sm);
--btn-primary-shadow-hover: var(--elevation-md);
```

### 2. Typography Hierarchy

#### Enhanced Spacing
Improved typography with consistent spacing:

```css
h1 {
  font-size: var(--text-4xl);
  line-height: var(--leading-tight);
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
  margin-bottom: var(--space-6);
}

h2 {
  font-size: var(--text-3xl);
  line-height: var(--leading-tight);
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-normal);
  color: var(--text-primary);
  margin-bottom: var(--space-5);
}

/* ... (h3-h6 with appropriate spacing) */
```

#### Enhanced Focus States
Improved focus indicators for better accessibility:

```css
*:focus-visible {
  outline: 2px solid var(--state-focus);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

button:focus-visible,
input:focus-visible,
textarea:focus-visible,
select:focus-visible,
a:focus-visible {
  box-shadow: var(--focus-ring);
}
```

### 3. Microinteractions & Hover Feedback

#### Button Interactions
Enhanced button interactions with ripple effects:

```css
.btn-interactive {
  position: relative;
  overflow: hidden;
  transition: all var(--duration-fast) var(--ease-out);
  transform: translateZ(0); /* Hardware acceleration */
}

.btn-interactive::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  transition: width var(--duration-base) var(--ease-out),
              height var(--duration-base) var(--ease-out);
}

.btn-interactive:active::before {
  width: 300px;
  height: 300px;
}
```

#### Card Hover Effects
Subtle card elevation on hover:

```css
.card-interactive {
  transition: transform var(--duration-fast) var(--ease-out),
              box-shadow var(--duration-fast) var(--ease-out);
}

.card-interactive:hover {
  transform: translateY(-2px);
  box-shadow: var(--elevation-lg);
}

.product-card-interactive:hover {
  transform: translateY(-4px);
  box-shadow: var(--elevation-xl);
}
```

#### Loading Animations
Consistent loading states with skeleton animations:

```css
.skeleton {
  background: linear-gradient(90deg, 
    var(--surface-muted) 25%, 
    var(--surface-subtle) 50%, 
    var(--surface-muted) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 4. Component Patterns

#### Loading States Component
New `LoadingStates` component for consistent loading indicators:

```svelte
<LoadingStates type="skeleton" variant="product" count={4} />
<LoadingStates type="spinner" size="lg" />
<LoadingStates type="dots" size="md" />
```

#### Error States Component
New `ErrorStates` component for consistent error handling:

```svelte
<ErrorStates type="network" action={{ label: "Retry", handler: handleRetry }} />
<ErrorStates type="notFound" title="Custom Title" message="Custom Message" />
<ErrorStates type="server" />
```

#### Trust Badges Component
New `TrustBadges` component for checkout trust signals:

```svelte
<TrustBadges variant="default" />
<TrustBadges variant="compact" showPayment={false} />
<TrustBadges variant="detailed" />
```

## Mobile Optimization

### Touch Targets
All interactive elements meet minimum touch target requirements (44px):

```css
@media (hover: none) and (pointer: coarse) {
  .touch-feedback {
    transition: transform var(--duration-fast) var(--ease-out);
  }
  
  .touch-feedback:active {
    transform: scale(0.95);
  }
}
```

### Safe Area Support
Proper safe area handling for iOS devices:

```css
.safe-area {
  padding-top: env(safe-area-inset-top);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  padding-bottom: env(safe-area-inset-bottom);
}
```

## Accessibility Improvements

### Focus Management
Enhanced focus states with proper contrast and indicators:

```css
--focus-ring: 0 0 0 2px var(--brand-primary-500), 0 0 0 4px rgba(59, 130, 246, 0.1);
--focus-ring-error: 0 0 0 2px var(--status-error-solid), 0 0 0 4px rgba(239, 68, 68, 0.1);
--focus-ring-success: 0 0 0 2px var(--status-success-solid), 0 0 0 4px rgba(34, 197, 94, 0.1);
```

### Keyboard Navigation
Proper keyboard navigation support for all interactive elements:

```css
/* Enhanced focus for specific elements */
button:focus-visible,
input:focus-visible,
textarea:focus-visible,
select:focus-visible,
a:focus-visible {
  box-shadow: var(--focus-ring);
}
```

## Usage Guidelines

### 1. Color Usage
- Use brand primary colors for primary actions and CTAs
- Use brand secondary colors for secondary actions
- Use brand accent colors for highlights and special elements
- Maintain proper contrast ratios (4.5:1 for normal text, 3:1 for large text)

### 2. Spacing
- Follow the 4px spacing rhythm for consistency
- Use semantic spacing variables (space-1, space-2, etc.)
- Maintain consistent margins between elements (h1: space-6, h2: space-5, etc.)

### 3. Typography
- Maintain clear hierarchy with proper font sizes and weights
- Use semantic typography variables (text-base, text-lg, etc.)
- Ensure proper line height for readability (leading-normal, leading-snug, etc.)

### 4. Interactions
- Provide clear hover states for all interactive elements
- Use consistent transition durations (duration-fast: 150ms, duration-base: 200ms)
- Add microinteractions for better user feedback
- Ensure touch targets meet minimum size requirements (44px)

### 5. Loading & Error States
- Use LoadingStates component for all loading scenarios
- Use ErrorStates component for consistent error handling
- Provide clear messaging and actionable next steps
- Maintain accessibility with proper ARIA labels

## Implementation Checklist

- [ ] Use brand color scales for all UI elements
- [ ] Apply enhanced elevation tokens for depth and hierarchy
- [ ] Implement consistent typography with proper spacing
- [ ] Add microinteractions for all interactive elements
- [ ] Use LoadingStates component for loading scenarios
- [ ] Use ErrorStates component for error handling
- [ ] Use TrustBadges component for checkout trust signals
- [ ] Ensure all touch targets meet minimum size requirements
- [ ] Test keyboard navigation and focus states
- [ ] Verify color contrast ratios meet accessibility standards

## Browser Compatibility

All enhancements are designed to work with modern browsers while maintaining graceful degradation for older browsers:

- OKLCH colors include SRGB fallbacks
- CSS custom properties include fallback values
- Animations respect prefers-reduced-motion
- Focus states work with :focus-visible where supported

## Future Enhancements

1. Dark theme support with proper color adjustments
2. Animation library integration for more complex microinteractions
3. Advanced loading patterns with skeleton screens
4. Enhanced error recovery mechanisms
5. Performance optimizations for animations and transitions