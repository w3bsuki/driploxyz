# UI/UX Improvement Plan: Vinted-Inspired Search & Catalog

This plan outlines the steps to transform the current `/search` page and product catalog into a high-trust, efficient browsing experience modeled after Vinted.co.uk.

## 1. Core Philosophy
- **Trust First**: Show the "real" price (including fees) upfront to prevent checkout shock.
- **Efficiency**: Allow users to filter by key attributes (Size, Brand, Condition) without digging into menus.
- **Density**: Show more products per screen with a cleaner card design.

## 2. Layout Structure

### Header & Navigation
- **Sticky Header**: Contains the search bar (simplified).
- **Filter Bar (New)**: A horizontal, sticky bar below the header containing dropdowns for:
  - **Category**: Quick access to top-level departments.
  - **Size**: Multi-select for clothing sizes.
  - **Brand**: Searchable brand list.
  - **Condition**: Checkbox filters.
  - **Price**: Min/Max range.
  - **Sort**: Dropdown for ordering results.
- **Sidebar (Desktop)**: A fixed left sidebar for navigating the category tree (Women > Clothing > Dresses).

### Grid Layout
- **Desktop**: 5 columns (tight spacing).
- **Mobile**: 2 columns.
- **Pagination/Scroll**: Continue with Infinite Scroll but improve loading indicators.

## 3. Component Refactors

### A. `ProductCard.svelte`
The current card is too generic. The new design will focus on:
1.  **Price Hierarchy**:
    - **Primary**: Item Price (Bold, Large).
    - **Secondary**: "Total: $X.XX incl. protection" (Small, Gray).
2.  **Metadata**:
    - Remove/De-emphasize user-generated titles.
    - Show **Brand • Size** prominently.
3.  **Visuals**:
    - Aspect ratio: 3:4 or 4:5.
    - Heart icon overlay on the image.
    - Simplified seller info (small avatar only).

### B. `FilterBar.svelte` (New Component)
- **Location**: `packages/ui/src/lib/compositions/search/FilterBar.svelte`
- **Functionality**:
  - Horizontal scroll container.
  - Dropdown menus for each filter type.
  - Active state indicators (e.g., "Size (2)").
  - "Clear All" button.

### C. `CategorySidebar.svelte` (New Component)
- **Location**: `packages/ui/src/lib/compositions/navigation/CategorySidebar.svelte`
- **Functionality**:
  - Tree view of categories.
  - Highlight active category.
  - Collapsible sections.

## 4. Implementation Steps

### Phase 1: Foundation (Completed)
- [x] Create `FilterBar` component.
- [x] Refactor `ProductCard` to Vinted style.
- [x] Integrate `FilterBar` into `/search` page.

### Phase 2: Refinement (Completed)
- [x] **Fix Imports**: Ensure all new components are correctly exported and imported.
- [x] **Real Data**: Connect the "Total Price" mock calculation to actual backend logic (Standardized in `price.ts`).
- [x] **Mobile Optimization**: Ensure `FilterBar` works well on small screens (horizontal scroll).
- [x] **Empty States**: Improve the "No Results" experience with category suggestions.

### Phase 3: Desktop Sidebar (Completed)
- [x] Build `CategorySidebar`.
- [x] Update search page layout to `grid-cols-[250px_1fr]` on desktop to accommodate the sidebar.

## 5. Technical Considerations
- **State Management**: Use `filterStore` for all filter interactions.
- **URL Sync**: Ensure all filter changes reflect in the URL query parameters.
- **Performance**: Use client-side filtering where possible for instant feedback, but support server-side initial load.
