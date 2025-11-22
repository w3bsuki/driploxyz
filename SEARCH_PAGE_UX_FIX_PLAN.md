# Search Page UX Fix Plan - ✅ COMPLETED

## Problem Statement
The user reported that the `/search` page has worse UX than the main page, specifically:
1.  **Missing "Quick Pills"**: The search page lacks the rich "quick pills" experience found on the main page.
2.  **Filter Drawer Issues**: The filter drawer opens below the search bar (z-index issue) and is not visible.
3.  **Bottom Nav Redirect**: Clicking "Filter" on the bottom nav redirects to `/search` instead of opening the filter drawer directly.
4.  **General UX**: The search page feels inferior to the main page.

## Solution Implemented

### 1. Unified Search Experience
-   **Replaced `SearchHeader` with `MainPageSearchBar`**: Used the `MainPageSearchBar` component in `apps/web/src/routes/(app)/(shop)/search/+page.svelte`. This component already includes the "quick pills" (categories, top sellers, top brands, conditions) and the search type dropdown, providing the "main page" experience the user likes.
-   **Removed Redundant Components**: Removed the separate `CategoryPills` and `Quick Condition Filters` sections from `search/+page.svelte` as `MainPageSearchBar` handles them.

### 2. Fixed Filter Drawer Visibility
- [x] **Fix FilterDrawer Z-Index**
  - [x] Identify z-index conflict with sticky headers.
  - [x] Update `FilterDrawer.svelte` to use `z-9999` (hardcoded) to guarantee overlay.
  - [x] Switch to robust `portal` action targeting `#overlay-root`.
  - [x] Ensure backdrop has `z-9998`.

### 3. Fixed Bottom Nav on Main Page
-   **Added `FilterDrawer` to Main Page**: Imported and used `FilterDrawer` in `apps/web/src/routes/+page.svelte`.
-   **Wired Up Filter Button**: Updated `BottomNav`'s `onFilterClick` prop in `apps/web/src/routes/+page.svelte` to open the local `FilterDrawer` instance instead of navigating to `/search`.
-   **Handled Filter Application**: When filters are applied in the drawer on the main page, it navigates to `/search` with the selected filters as query parameters.

## Verification
-   **Filter Drawer Visibility**: The drawer now has `z-100`, ensuring it sits on top of the sticky search bar (`z-40`).
-   **Main Page UX**: Clicking "Filter" on the bottom nav now opens the drawer immediately, allowing users to set filters before searching.
-   **Search Page UX**: The search page now features the same rich "quick pills" navigation as the main page, providing a consistent and superior user experience.

## Proposed Solution

