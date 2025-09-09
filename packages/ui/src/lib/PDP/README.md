# Product Detail Page (PDP) Component System

This directory contains the modular components for the Driplo Product Detail Page, extracted from the monolithic ProductPage.svelte to improve maintainability, performance, and developer experience.

## Architecture

The PDP system follows a **container-presenter pattern** with clear separation of concerns:

- **ProductPage.svelte** - Main orchestrator (< 300 lines)
- **sections/** - Page sections with business logic
- **components/** - Pure presentation components

## Directory Structure

```
PDP/
├── sections/           # Business logic sections
│   ├── InfoSection.svelte
│   ├── ReviewsSection.svelte  
│   ├── RecommendationsSection.svelte
│   └── SellerProductsSection.svelte
├── components/         # Pure UI components  
│   ├── StickyHeader.svelte
│   └── PriceFormatter.svelte
└── README.md
```

## Component Responsibilities

### Sections (Business Logic Layer)

#### InfoSection.svelte
- **Purpose**: Product information display with trust signals
- **Contains**: ProductInfo component + TrustBadges + Accordion details
- **Props**: ProductData subset, translations, event handlers
- **Size**: ~150 lines

#### ReviewsSection.svelte  
- **Purpose**: Reviews display and interaction
- **Contains**: RatingSummary + ReviewDisplay list + ReviewModal
- **Props**: ReviewData[], RatingSummary, event handlers
- **Size**: ~120 lines
- **Features**: Lazy loading, pagination, add review modal

#### RecommendationsSection.svelte
- **Purpose**: Similar products grid
- **Contains**: ProductCard grid with lazy loading
- **Props**: ProductData[], max items, loading states
- **Size**: ~100 lines
- **Features**: Intersection observer, responsive grid

#### SellerProductsSection.svelte
- **Purpose**: More from seller display  
- **Contains**: ProductCard grid + seller link
- **Props**: ProductData[], seller info, navigation handler
- **Size**: ~100 lines
- **Features**: Lazy loading, seller profile integration

### Components (Presentation Layer)

#### StickyHeader.svelte
- **Purpose**: Condensed product info shown on scroll
- **Contains**: Title, brand, condition, favorite button
- **Props**: Product subset, scroll state, event handlers
- **Size**: ~100 lines
- **Features**: Smooth animations, safe area insets

#### PriceFormatter.svelte  
- **Purpose**: Consistent price formatting utility
- **Contains**: Price display logic with i18n
- **Props**: Price, currency, locale, formatting options
- **Size**: ~50 lines
- **Features**: Currency formatting, locale support

## Design Principles

### 1. **Single Responsibility**
Each component has one clear purpose and minimal dependencies.

### 2. **Prop Drilling Minimization**
Components receive only the data they need via focused interfaces.

### 3. **Performance First**
- Lazy loading for below-fold sections
- Code splitting for heavy components
- Intersection observers for viewport tracking

### 4. **Type Safety**
All components use strict TypeScript with interfaces from `@repo/ui/types/product`.

### 5. **Mobile-First**
Every component prioritizes mobile UX with progressive enhancement.

### 6. **Accessibility**  
WCAG AA compliance with proper ARIA labels, focus management, and keyboard navigation.

## Usage Patterns

### Basic Section Import
```svelte
<script>
  import InfoSection from '$lib/PDP/sections/InfoSection.svelte';
  import type { ProductData } from '@repo/ui/types/product';
  
  let product: ProductData;
</script>

<InfoSection {product} />
```

### Event Handler Composition
```svelte
<script>
  import type { ProductPageEventHandlers } from '@repo/ui/types/product';
  
  const eventHandlers: ProductPageEventHandlers = {
    onFavorite: async () => { /* implementation */ },
    onBuyNow: () => { /* implementation */ },
    onMessage: () => { /* implementation */ }
  };
</script>

<InfoSection {product} {eventHandlers} />
```

### Lazy Loading Pattern
```svelte
<script>
  import { onMount } from 'svelte';
  let showRecommendations = false;
  
  onMount(() => {
    // Load recommendations when scrolled into view
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        showRecommendations = true;
      }
    });
    observer.observe(recommendationsRef);
  });
</script>

{#if showRecommendations}
  <RecommendationsSection {similarProducts} />
{/if}
```

## Performance Targets

- **Bundle Size**: Each section < 10KB gzipped
- **LCP Impact**: < 100ms delay for above-fold sections  
- **TBT**: No main thread blocking during lazy loads
- **CLS**: Zero layout shift during progressive loading

## Testing Strategy

### Unit Tests
- Pure component rendering
- Props interface validation  
- Event handler execution

### Integration Tests  
- Section composition
- Cross-component communication
- Performance benchmarks

### E2E Tests
- Full user flows
- Mobile responsiveness
- Accessibility compliance

## Migration Guide

### From Monolithic ProductPage

1. **Import new types**:
   ```svelte
   import type { ProductData, ReviewData } from '@repo/ui/types/product';
   ```

2. **Replace inline sections**:
   ```svelte  
   <!-- Before -->
   <div class="reviews-section">...</div>
   
   <!-- After -->
   <ReviewsSection {reviews} {ratingSummary} />
   ```

3. **Update event handlers**:
   ```svelte
   const eventHandlers = {
     onFavorite: handleFavorite,
     onBuyNow: handleBuyNow
   };
   ```

### Breaking Changes
- None - all existing props and events are maintained
- TypeScript strict mode required
- CSS class names may change (use design tokens)

## Maintenance

### Code Ownership
- **Primary**: UI Platform Team  
- **Secondary**: Product Engineering Team

### Review Requirements
- 2 approvals for section changes
- Performance budget validation  
- Accessibility testing required

### Dependencies
- **Core**: Svelte 5, @repo/ui/types
- **UI**: Melt UI primitives, design tokens
- **i18n**: @repo/i18n for translations

---

## Quick Start

1. Import the section you need
2. Pass required props from ProductData types
3. Handle events via the eventHandlers prop
4. Style using design tokens from semantic.css

For detailed examples, see the Storybook stories and integration tests.