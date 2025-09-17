# UX Navigation Revamp Plan

Mobile-first navigation strategy covering the landing (main) page, the dedicated search experience, and category landing pages. Goals: keep discovery fast, mirror mental models (search vs browse), and lean on Supabase data (159 categories across 3 levels, brand collections, sellers) without overwhelming mobile users.

## Main Page UX

### Role & KPIs
- Convert first-time visitors by showcasing brand trust, liquidity, and breadth; target bounce <25% on mobile and push quick-path CTR >30%.
- Serve as editorial surface (promoted drops, newest listings) rather than deep filter UI.

### Layout Principles
- Keep hero band: logo, 44px tall search input that routes into `/search` with contextual mode preselected.
- Maintain horizontally scrollable quick pills (Men, Women, Kids, Unisex, Drip, Designer) mapped to Supabase level-1 slugs; limit to 6 to avoid overflow noise.
- Stack modules in this order for mobile: Hero search, quick pills, primary CTA cards (Become a seller / App download), Promoted listings, Newest listings, Top sellers.
- Keep section headers sticky-aware for easier scanning when scrolling.

### Interaction Notes
- Search input here stays simple (no dropdown); tapping pushes to `/search` with current mode (default Products) and preserves recent query from local storage.
- Quick pills deep-link to `/category/[slug]`; highlight the active pill when user arrives from that pill for context.
- Add secondary CTA row (Sell something, Browse brands) with icons for quick comprehension.

### Outstanding Tasks
- Audit analytics to confirm which modules drive engagement before finalizing order.
- Ensure hero assets + CTA copy localized via Paraglide.
- Verify main page bottom nav parity with `/search` bottom nav for muscle memory.

## Search Page UX

### Role Within The System
- Dedicated "workbench" for shopping intent; must scale across Products, Sellers, and Brands without duplicating main page cards.
- Entry points: main header search, persistent nav search icon, deep links from push notifications.

### Search Bar & Mode Switcher
- Use `SearchPageSearchBar` foundation but replace current dropdown with a segmented control (Products / Sellers / Brands) inspired by Vinted. Default to Products.
- Each segment modifies placeholder, onSubmit handler, and filter chips:
  - **Products (Collections)**: show product filters (condition, size, price, brand) and category hierarchy chips powered by Supabase categories tree.
  - **Sellers**: filter by country, rating, shipping speed; surface verified badge toggle.
  - **Brands**: pull from brand collections (Designer, Drip) with popularity counts.
- On mobile, segments render as pill buttons directly under the search bar; maintain 44px tap height and horizontal scroll if needed.

### Results Layout (Mobile-first)
- Keep sticky top region: search bar, segmented control, filter button (opens bottom sheet), applied filter chips.
- Display vertical product grid (2-up) with lazy loading for Products mode; switch to seller list (avatar, rating, CTA) for Sellers and brand grid tiles for Brands.
- Retain "Quick filters" row but limit to 4 visible chips; "More filters" opens the modal.
- Integrate infinite scroll with skeleton states to avoid jarring transitions.

### Discovery Enhancements
- Empty state: show recent searches (stored client-side), trending queries, and top categories (Men Clothing, Women Shoes, etc.). Include CTA to browse category and to go back home.
- Provide "Related filters" inline suggestions after 5+ scroll loads using Supabase telemetry (e.g., popular sizes for Men Clothing).
- For Brands mode, include alphabetical index (A-Z) accessible via modal to avoid huge dropdowns.

### Technical / UX Action Items
- Refactor `SearchPageSearchBar` to decouple dropdown state from main search; implement segmented control component with accessible keyboard navigation.
- Split query state machine per mode (products, sellers, brands) so filters persist when switching modes.
- Create new Supabase RPC or query helpers for seller/brand search endpoints (ensure indexes on name, slug, badges).
- Update mobile bottom nav to highlight Search tab when on `/search` and keep context after route transitions.
- Validate analytics: track segment usage, filter application, and scroll depth.

## Category Pages UX

### Role & Structure
- Provide focused browsing once a user chooses a pillar (Men, Women, Kids, Unisex, Drip, Designer).
- Category URL pattern `/category/[level1]` (Men) or `/category/[level1]/[level2]` (Men/Clothing) should expose Supabase hierarchy without forcing dropdown exploration.

### Layout Guidelines (Mobile-first)
- Hero banner with contextual copy (“Men’s Wardrobe”) plus CTA to switch gender quickly.
- Grid of level-2 buckets (Clothing, Shoes, Accessories, Bags) with iconography; each tile links to nested page with level-3 quick filters (T-Shirts, Hoodies…).
- Beneath grid, show curated modules: Featured brands (from brand collections), Trending products, Condition spotlights (e.g., Like New sneakers).
- Provide persistent filter button opening the shared product filter modal; show applied chips inline under hero.
- Add "Recently viewed in Men" module when user has history.

### Navigation & Interaction
- When arriving from quick pill, auto-scroll to level-2 grid and highlight the relevant tile to orient the user.
- Offer breadcrumb header across nested pages (Men › Clothing › T-Shirts) with tap targets for back-stepping.
- Ensure consistent bottom nav and maintain CTA to jump into `/search` with mode preset (Products + Men Clothing filter) for deeper filtering.

### Data Integration
- Prefetch level-2 and level-3 categories via Supabase using hierarchical query to minimize client requests; cache in store for offline-first feel.
- Surface brand counts and availability badges (e.g., “120 listings”) leveraging Supabase aggregated views.
- Keep fallback for categories lacking imagery by using emoji placeholders from taxonomy.

## Open Questions & Follow-ups
- Do we sunset `/search` if segmented control adoption is low? Collect data post-launch before deciding.
- Confirm whether "Collections" naming resonates vs "Products"; run quick copy test with target users.
- Identify which Supabase indexes are missing for seller/brand search to avoid slow queries.
- Validate bottom sheet filter UX with 5-user mobile test (focus on comprehension of multi-level categories).

Next steps: align on this plan, then break down into implementation tickets (component refactors, Supabase queries, analytics updates, QA script).
