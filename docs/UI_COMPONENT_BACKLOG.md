# UI Component Backlog: Driplo Platform

## Overview

This document outlines the complete backlog of new and updated UI components required for the UI/UX improvements. Each component includes detailed specifications, props, states, accessibility notes, and usage examples.

## Enhanced Navigation Components

### 1. Enhanced BottomNav Component

**File**: `packages/ui/src/lib/components/navigation/BottomNav.svelte`

**Description**: Redesigned bottom navigation with elevated "Sell" FAB and improved mobile experience.

#### Props Interface
```typescript
interface BottomNavProps {
  currentPath: string;
  unreadMessageCount?: number;
  profileHref?: string;
  isAuthenticated?: boolean;
  labels?: {
    home: string;
    search: string;
    sell: string;
    messages: string;
    profile: string;
  };
  // Enhanced props
  elevatedSellButton?: boolean;
  activeStateIndicator?: 'background' | 'underline' | 'icon';
  showLabels?: boolean;
  safeAreaInsets?: boolean;
  sellButtonVariant?: 'fab' | 'elevated' | 'standard';
}
```

#### States
- **Active State**: Enhanced visual feedback with background color and icon fill
- **Hover State**: Smooth transitions with color changes
- **Focus State**: Visible focus ring with proper contrast
- **Pressed State**: Subtle scale animation for touch feedback

#### Accessibility Features
- Proper ARIA labels for all navigation items
- Keyboard navigation support
- Screen reader announcements for navigation changes
- High contrast mode support

#### Usage Example
```svelte
<BottomNav
  currentPath={page.url.pathname}
  unreadMessageCount={unreadCount}
  profileHref={profileHref}
  isAuthenticated={!!user}
  elevatedSellButton={true}
  activeStateIndicator="background"
  showLabels={true}
  safeAreaInsets={true}
  sellButtonVariant="fab"
  labels={{
    home: i18n.nav_home(),
    search: i18n.nav_search(),
    sell: i18n.nav_sell(),
    messages: i18n.nav_messages(),
    profile: i18n.nav_profile()
  }}
/>
```

### 2. FilterChips Component

**File**: `packages/ui/src/lib/components/product/FilterChips.svelte`

**Description**: Sticky filter chips for applied filters with easy removal functionality.

#### Props Interface
```typescript
interface FilterChipsProps {
  appliedFilters: Record<string, any>;
  onRemoveFilter: (key: string) => void;
  onClearAll: () => void;
  categoryLabels: Record<string, string>;
  maxDisplay?: number;
  showMore?: boolean;
  variant?: 'default' | 'compact' | 'expanded';
  sticky?: boolean;
  position?: 'top' | 'bottom';
}
```

#### States
- **Default**: All applied filters displayed as removable chips
- **Overflow**: "More" indicator when filters exceed maxDisplay
- **Sticky**: Fixed position when scrolling
- **Loading**: Skeleton state while filters are being applied

#### Accessibility Features
- ARIA labels for filter removal actions
- Keyboard navigation between chips
- Screen reader announcements for filter changes
- High contrast support

#### Usage Example
```svelte
<FilterChips
  appliedFilters={filters}
  onRemoveFilter={handleRemoveFilter}
  onClearAll={handleClearAll}
  categoryLabels={categoryLabels}
  maxDisplay={8}
  showMore={true}
  variant="default"
  sticky={true}
  position="top"
/>
```

### 3. Enhanced SearchBar Component

**File**: `packages/ui/src/lib/components/navigation/EnhancedSearchBar.svelte`

**Description**: Prominent search bar with history, suggestions, and enhanced mobile experience.

#### Props Interface
```typescript
interface EnhancedSearchBarProps {
  searchValue: string;
  onSearch: (query: string) => void;
  onQuickSearch: (query: string) => Promise<SearchResult[]>;
  placeholder?: string;
  showHistory?: boolean;
  showSuggestions?: boolean;
  sticky?: boolean;
  variant?: 'default' | 'prominent' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  autofocus?: boolean;
}
```

#### States
- **Idle**: Search bar with placeholder and optional history
- **Active**: Expanded search with suggestions dropdown
- **Loading**: Loading indicator while fetching suggestions
- **Focused**: Enhanced visual feedback with focus ring

#### Accessibility Features
- Proper search form labeling
- Keyboard navigation for suggestions
- Screen reader announcements for search results
- High contrast mode support

#### Usage Example
```svelte
<EnhancedSearchBar
  bind:searchValue={searchQuery}
  onSearch={handleSearch}
  onQuickSearch={handleQuickSearch}
  placeholder={i18n.search_placeholder()}
  showHistory={true}
  showSuggestions={true}
  sticky={true}
  variant="prominent"
  size="lg"
  autofocus={false}
/>
```

## Enhanced Product Components

### 4. Enhanced ProductCard Component

**File**: `packages/ui/src/lib/components/cards/ProductCard.svelte`

**Description**: Redesigned product card with standardized image ratio, enhanced trust signals, and better information hierarchy.

#### Props Interface
```typescript
interface EnhancedProductCardProps {
  product: Product;
  layout?: 'compact' | 'standard' | 'detailed';
  imageRatio?: '4:5' | '1:1' | '16:9';
  showTrustSignals?: boolean;
  priceProminence?: 'standard' | 'enhanced' | 'prominent';
  onFavorite?: (productId: string) => void;
  onclick?: (product: Product) => void;
  favorited?: boolean;
  priority?: boolean;
  index?: number;
  totalCount?: number;
  favoritesState?: { favoriteCounts: Record<string, number> };
  showBoostBadge?: boolean;
  showSellerBadges?: boolean;
  translations?: ProductCardTranslations;
}
```

#### States
- **Default**: Standard product display with all information
- **Hover**: Enhanced visual feedback with shadow and scale effects
- **Loading**: Skeleton state while product data is loading
- **Error**: Error state for failed product loads

#### Accessibility Features
- Semantic HTML structure
- Proper ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader friendly product information

#### Usage Example
```svelte
<EnhancedProductCard
  {product}
  layout="standard"
  imageRatio="4:5"
  showTrustSignals={true}
  priceProminence="enhanced"
  onFavorite={handleFavorite}
  onclick={handleProductClick}
  favorited={isFavorited}
  showBoostBadge={true}
  showSellerBadges={true}
  translations={productCardTranslations}
/>
```

### 5. ProductGalleryEnhanced Component

**File**: `packages/ui/src/lib/components/product/ProductGalleryEnhanced.svelte`

**Description**: Enhanced product gallery with zoom functionality, better mobile experience, and improved loading states.

#### Props Interface
```typescript
interface ProductGalleryEnhancedProps {
  images: string[];
  title: string;
  alt?: string;
  enableZoom?: boolean;
  enableSwipe?: boolean;
  showThumbnails?: boolean;
  thumbnailPosition?: 'bottom' | 'side' | 'overlay';
  loadingStrategy?: 'eager' | 'lazy' | 'progressive';
  zoomMode?: 'magnifier' | 'lightbox' | 'inline';
}
```

#### States
- **Gallery**: Main image display with navigation controls
- **Zoom**: Activated zoom mode with magnifier or lightbox
- **Thumbnails**: Thumbnail navigation with active state
- **Loading**: Progressive image loading with placeholders

#### Accessibility Features
- Proper image alt text and descriptions
- Keyboard navigation for gallery controls
- Screen reader announcements for image changes
- High contrast mode support

#### Usage Example
```svelte
<ProductGalleryEnhanced
  images={product.images}
  title={product.title}
  alt={product.title}
  enableZoom={true}
  enableSwipe={true}
  showThumbnails={true}
  thumbnailPosition="bottom"
  loadingStrategy="progressive"
  zoomMode="magnifier"
/>
```

### 6. TrustSignals Component

**File**: `packages/ui/src/lib/components/ui/TrustSignals.svelte`

**Description**: Component for displaying trust signals including seller verification, ratings, and safety badges.

#### Props Interface
```typescript
interface TrustSignalsProps {
  seller: {
    id: string;
    username: string;
    avatar?: string;
    rating?: number;
    reviewCount?: number;
    verificationLevel?: 'basic' | 'verified' | 'pro' | 'brand';
    responseTime?: number;
    salesCount?: number;
  };
  showRating?: boolean;
  showVerification?: boolean;
  showResponseTime?: boolean;
  showSalesCount?: boolean;
  layout?: 'horizontal' | 'vertical' | 'compact';
  size?: 'sm' | 'md' | 'lg';
}
```

#### States
- **Default**: All trust signals displayed based on props
- **Loading**: Skeleton state while seller data loads
- **Error**: Error state for failed seller data

#### Accessibility Features
- Semantic markup for trust information
- Proper ARIA labels for verification badges
- Screen reader friendly rating display
- High contrast support

#### Usage Example
```svelte
<TrustSignals
  seller={product.seller}
  showRating={true}
  showVerification={true}
  showResponseTime={true}
  showSalesCount={true}
  layout="horizontal"
  size="md"
/>
```

## Enhanced Form Components

### 7. Stepper Component

**File**: `packages/ui/src/lib/components/forms/Stepper.svelte`

**Description**: Multi-step form stepper with progress indication and navigation controls.

#### Props Interface
```typescript
interface StepperProps {
  currentStep: number;
  totalSteps: number;
  steps: StepItem[];
  onStepChange?: (step: number) => void;
  allowSkip?: boolean;
  showProgress?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  orientation?: 'horizontal' | 'vertical';
}
```

#### States
- **Active**: Current step with enhanced visual indication
- **Completed**: Steps that have been successfully completed
- **Upcoming**: Future steps that are not yet accessible
- **Error**: Steps with validation errors

#### Accessibility Features
- Proper ARIA labels for step navigation
- Keyboard navigation between steps
- Screen reader announcements for progress
- High contrast mode support

#### Usage Example
```svelte
<Stepper
  currentStep={currentStep}
  totalSteps={4}
  steps={sellSteps}
  onStepChange={handleStepChange}
  allowSkip={false}
  showProgress={true}
  variant="detailed"
  orientation="horizontal"
/>
```

### 8. FilterDrawerEnhanced Component

**File**: `packages/ui/src/lib/components/product/FilterDrawerEnhanced.svelte`

**Description**: Enhanced filter drawer with better mobile experience, preview functionality, and improved UX.

#### Props Interface
```typescript
interface FilterDrawerEnhancedProps {
  open: boolean;
  filters: FilterConfig[];
  appliedFilters: Record<string, any>;
  onApply: (filters: Record<string, any>) => void;
  onReset: () => void;
  onClose: () => void;
  onPreview?: (filters: Record<string, any>) => void;
  showPreview?: boolean;
  variant?: 'drawer' | 'modal' | 'sheet';
  position?: 'bottom' | 'side';
}
```

#### States
- **Closed**: Filter drawer hidden from view
- **Open**: Filter drawer visible with all filter options
- **Preview**: Preview mode showing filtered results count
- **Loading**: Loading state while applying filters

#### Accessibility Features
- Proper ARIA labels for filter controls
- Keyboard navigation within drawer
- Screen reader announcements for filter changes
- Focus management when opening/closing

#### Usage Example
```svelte
<FilterDrawerEnhanced
  bind:open={showFilters}
  filters={filterConfig}
  appliedFilters={appliedFilters}
  onApply={handleApplyFilters}
  onReset={handleResetFilters}
  onClose={handleCloseFilters}
  onPreview={handlePreviewFilters}
  showPreview={true}
  variant="drawer"
  position="bottom"
/>
```

## Enhanced Layout Components

### 9. CategoryHero Component

**File**: `packages/ui/src/lib/components/layout/CategoryHero.svelte`

**Description**: Optimized category hero section with reduced height and better mobile experience.

#### Props Interface
```typescript
interface CategoryHeroProps {
  category: {
    name: string;
    description?: string;
    image?: string;
    productCount?: number;
  };
  breadcrumbs?: BreadcrumbItem[];
  showDescription?: boolean;
  showImage?: boolean;
  maxHeight?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'minimal';
}
```

#### States
- **Default**: Full hero with all elements
- **Compact**: Reduced height with essential information only
- **Minimal**: Minimal hero with breadcrumbs only

#### Accessibility Features
- Semantic HTML structure
- Proper heading hierarchy
- ARIA labels for navigation elements
- Screen reader friendly content

#### Usage Example
```svelte
<CategoryHero
  category={categoryData}
  breadcrumbs={breadcrumbs}
  showDescription={true}
  showImage={false}
  maxHeight="sm"
  variant="compact"
/>
```

### 10. StickyActionsBar Component

**File**: `packages/ui/src/lib/components/layout/StickyActionsBar.svelte`

**Description**: Sticky actions bar for mobile with primary CTAs and enhanced touch experience.

#### Props Interface
```typescript
interface StickyActionsBarProps {
  actions: ActionItem[];
  visible: boolean;
  position?: 'bottom' | 'top';
  variant?: 'default' | 'elevated' | 'minimal';
  safeArea?: boolean;
  shadow?: boolean;
}
```

#### States
- **Hidden**: Actions bar not visible
- **Visible**: Actions bar fixed in position
- **Elevated**: Enhanced visual elevation
- **Minimal**: Reduced chrome for better content visibility

#### Accessibility Features
- Proper ARIA labels for action buttons
- Keyboard navigation support
- Screen reader announcements
- High contrast mode support

#### Usage Example
```svelte
<StickyActionsBar
  actions={productActions}
  visible={true}
  position="bottom"
  variant="elevated"
  safeArea={true}
  shadow={true}
/>
```

## Enhanced Utility Components

### 11. LoadingSkeletonEnhanced Component

**File**: `packages/ui/src/lib/components/skeleton/LoadingSkeletonEnhanced.svelte`

**Description**: Enhanced loading skeleton with better animations and multiple variants.

#### Props Interface
```typescript
interface LoadingSkeletonEnhancedProps {
  variant?: 'text' | 'card' | 'image' | 'custom';
  lines?: number;
  width?: string | number;
  height?: string | number;
  animated?: boolean;
  shimmer?: boolean;
  className?: string;
}
```

#### States
- **Loading**: Active skeleton animation
- **Loaded**: Skeleton removed and content displayed
- **Error**: Error state if content fails to load

#### Accessibility Features
- Proper ARIA labels for loading state
- Screen reader announcements
- Reduced motion support

#### Usage Example
```svelte
<LoadingSkeletonEnhanced
  variant="card"
  animated={true}
  shimmer={true}
  className="w-full h-64"
/>
```

### 12. EmptyStateEnhanced Component

**File**: `packages/ui/src/lib/components/utilities/EmptyStateEnhanced.svelte`

**Description**: Enhanced empty state component with better messaging and contextual actions.

#### Props Interface
```typescript
interface EmptyStateEnhancedProps {
  type: 'no-results' | 'no-products' | 'error' | 'custom';
  title: string;
  description?: string;
  illustration?: string;
  actions?: ActionItem[];
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'detailed';
}
```

#### States
- **Default**: Standard empty state display
- **Interactive**: Empty state with actionable items
- **Minimal**: Reduced empty state for limited space

#### Accessibility Features
- Semantic HTML structure
- Proper ARIA labels for actions
- Screen reader friendly content
- Keyboard navigation support

#### Usage Example
```svelte
<EmptyStateEnhanced
  type="no-products"
  title="No products found"
  description="Try adjusting your filters or search terms"
  illustration="/illustrations/empty-search.svg"
  actions={emptyStateActions}
  size="md"
  variant="detailed"
/>
```

## Implementation Guidelines

### Component Development Standards

1. **TypeScript**: All components must have proper TypeScript interfaces
2. **Accessibility**: Components must meet WCAG 2.1 AA standards
3. **Responsive**: Components must work across all viewport sizes
4. **Performance**: Components should not impact page performance
5. **Testing**: Components must have comprehensive test coverage

### Design System Integration

1. **Tokens**: Use design tokens for all styling values
2. **Spacing**: Follow the established spacing scale (4, 8, 12, 16, 20, 24, 32px)
3. **Typography**: Use fluid typography with clamp() for responsive text
4. **Colors**: Use semantic color tokens for consistency
5. **Shadows**: Use the established shadow system for elevation

### Mobile-First Development

1. **Touch Targets**: Minimum 44px touch targets for all interactive elements
2. **Safe Areas**: Proper handling of device safe areas
3. **Gestures**: Support for common mobile gestures where appropriate
4. **Performance**: Optimize for mobile network conditions
5. **Input Types**: Use appropriate mobile input types for forms

### Accessibility Requirements

1. **Keyboard Navigation**: Full keyboard support for all components
2. **Screen Readers**: Proper ARIA labels and announcements
3. **Color Contrast**: Minimum 4.5:1 contrast ratio for text
4. **Focus Management**: Proper focus handling and visible indicators
5. **Reduced Motion**: Respect user's motion preferences

## Testing Strategy

### Unit Testing
- Test component rendering with different props
- Test user interactions and state changes
- Test accessibility features
- Test error states and edge cases

### Integration Testing
- Test component interactions with parent components
- Test data flow and state management
- Test routing and navigation
- Test API integration

### E2E Testing
- Test critical user journeys
- Test mobile and desktop experiences
- Test accessibility with screen readers
- Test performance under various conditions

### Visual Testing
- Test component appearance across browsers
- Test responsive design at different viewports
- Test dark mode and high contrast
- Test loading states and animations

## Migration Strategy

### Phase 1: Enhanced Navigation
1. Update `BottomNav.svelte` with new design
2. Implement `FilterChips.svelte` component
3. Enhance `SearchBar.svelte` components
4. Update navigation across all pages

### Phase 2: Enhanced Product Display
1. Update `ProductCard.svelte` with new layout
2. Implement `ProductGalleryEnhanced.svelte`
3. Add `TrustSignals.svelte` component
4. Update product-related pages

### Phase 3: Enhanced Forms & Layout
1. Implement `Stepper.svelte` for sell flow
2. Update `FilterDrawerEnhanced.svelte`
3. Add `StickyActionsBar.svelte` for mobile
4. Optimize category pages with new components

### Phase 4: Enhanced Utilities
1. Implement enhanced loading and error states
2. Add better empty states
3. Optimize performance and accessibility
4. Complete migration and testing

## Conclusion

This component backlog provides a comprehensive foundation for implementing the UI/UX improvements identified in the audit. The components are designed to be modular, accessible, and performant while maintaining consistency with the existing design system.

The phased implementation approach allows for incremental improvements with proper testing and validation at each stage. The detailed specifications ensure that development teams have clear guidance for implementation while maintaining flexibility for iteration and improvement.