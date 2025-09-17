# Navigation UX Finalization

## Purpose
- Align the three navigation surfaces so shoppers instantly know where to search, browse, and convert.
- Document the mobile-first IA while we still have engineering runway to refactor safely.
- Clarify how Supabase category, seller, and brand data flows into each surface without duplicating UI.
- Define measurable outcomes so we can prove the redesign outperforms the current mixed UX.

## Shared Mobile-First Principles
- Guarantee 44px tap targets, 16px minimum body copy, and <32px side gutters for scroll comfort.
- Keep the sticky bottom nav consistent across main, search, and category screens with matched icons and labels.
- Persist the last used search mode and filter set in local storage so route swaps feel continuous.
- Use skeleton loaders and optimistic empty states to avoid jarring blank screens on slower networks.

## Main Page UX

### Role and Goals
- Act as the brand showcase and discovery teaser, not the full shopping workstation.
- Convert new users fast with proof of trust (top sellers), freshness (newest listings), and breadth (pills to categories).
- Maintain bounce rate under 25 percent on mobile and push quick pill engagement above 30 percent of sessions.
- Capture lightweight search intent, then escalate to /search for depth when needed.

### Layout and Content
- Hero stack: logo, simple search input (no dropdown) that hands query and mode into /search.
- Horizontal quick pills capped at six (Men, Women, Kids, Unisex, Drip, Designer) mapped to level one slugs.
- Module order for mobile: hero search, quick pills, dual CTA cards (Sell, Download App), promoted listings, newest listings, top sellers.
- Section headers get sticky awareness so users remember context while scrolling.

### Key Interactions
- Tapping search triggers /search with the preserved query, last mode, and scrolls user to the search bar.
- Quick pill tap deep links to /category/[slug] and highlights the active pill state for recall.
- Secondary CTAs offer icons plus microcopy to drive toward selling and brand browsing without clutter.
- Footer card reminds users they can always switch to the search tab for advanced filtering.

### Data and Technical Notes
- Promoted listings, top sellers, and newest listings pull via Supabase views so load stays under 300ms at p75.
- Local storage saves lastSearchMode and recentQueries for hydration when /search opens.
- Hero copy, CTA text, and headline strings resolve through Paraglide to stay localization-ready.
- Analytics: track hero search submissions, quick pill taps, CTA taps, and scroll depth.

### Implementation Priorities
- Finalize quick pill taxonomy and ensure icons and colors ship from @repo/ui tokens.
- Confirm main search input pushes router query params that /search can hydrate without extra fetch.
- Audit hero art for responsive aspect ratios so the fold stays clean on small phones.
- Ship analytics events alongside the UI update to benchmark impact against current baseline.

## Search Page UX

### Role in the System
- Serve as the dedicated shopping workbench once intent is clear, covering Products, Sellers, and Brands.
- Receive traffic from the main page search, global nav search icon, push notifications, and saved searches.
- Provide advanced filters without overwhelming the homepage or forcing deep navigation hops.
- Own KPIs: search-to-result conversion, filter application rate, and time-to-first result.

### Search Entry and Mode Switching
- Refactor SearchPageSearchBar into a self-contained component with an inline segmented control.
- Segments: Products, Sellers, Brands (copy test Collections vs Products later); default to Products.
- Each segment updates placeholder text, analytics event name, and available filter chips instantly.
- On mobile, render segments as 44px pill buttons under the input with horizontal scroll when needed.

### Result Presentation and Filters
- Sticky top region: search bar, segmented control, filter button, applied chips, breadcrumb to category when relevant.
- Products mode: two-column card grid with price, size, and badge glimpses; supports infinite scroll with skeletons.
- Sellers mode: vertical list with avatar, rating stars, shipping speed, and quick follow CTA.
- Brands mode: grid of brand tiles with logo, follower count, and quick tap to brand hub.
- Filters open as a bottom sheet on mobile with sections for condition, price, size, shipping, and availability toggles.

### Discovery and Empty States
- No query: show recent searches, trending queries, and quick entry cards for Men Clothing, Women Shoes, Kids Accessories.
- Sparse results: surface related filters (popular sizes, price ranges) generated from Supabase telemetry.
- Include CTA chips to jump to relevant category pages when inventory is richer there.
- Provide quick action buttons for saved search creation and back-to-home for safety.

### Mobile-Specific Considerations
- Keep header collapse subtle so segmented control never scrolls off screen during first viewport.
- Use bottom sheet for filters and details; gestures allow swipe down to dismiss to avoid hidden close buttons.
- Persist scroll position per mode so switching to Sellers and back does not reset Products results.
- Ensure keyboard-safe area pushes content up without overlapping segmented control.

### /search Scope Options
- Option A (recommended): Dedicated search workbench with segmented control, preserving advanced filters in one place; keeps mental model clear.
- Option B: Light search surface that primarily routes into category pages after shortlists; reduces component work but fragments intent.
- Option C: Sunset /search and rely on categories plus inline search chips; simplest but sacrifices seller and brand discovery.
- Launch with Option A, monitor segment usage and completion rates, and revisit if branch adoption stays below defined targets.

### Implementation Tasks and Dependencies
- Build segmented control as a reusable @repo/ui primitive with keyboard and screen reader support.
- Split search state machines per mode so filters persist independently and share analytics context.
- Expose Supabase endpoints for seller and brand search with proper indexes on name, slug, and badge fields.
- Update bottom nav to highlight the Search tab consistently and keep context after deep links.

## Category Pages UX

### Role and Objectives
- Deliver focused browsing once a user commits to a pillar such as Men or Designer.
- Offer level two choices (Clothing, Shoes, Accessories, Bags) immediately without extra dropdowns.
- Showcase curated content like featured brands and trending products to keep momentum.
- Encourage deeper filtering by providing quick handoff into the search page when needed.

### Layout Blueprint
- Hero banner with contextual copy, quick swap pills to jump between adjacent pillars, and applied filter chips.
- Level two grid uses iconography and count badges; tapping routes to /category/[level1]/[level2] with preloaded level three filters.
- Below the grid, stack modules: featured brands, trending listings, condition spotlights, and recently viewed items.
- Persistent filter button launches the shared product filter modal; applied chips sit under the hero for clarity.

### Interaction Patterns
- Auto-scroll to the level two grid when arriving from a quick pill so users see immediate choices.
- Breadcrumb header (Men > Clothing > Sneakers) remains sticky with tap targets sized for thumb use.
- Provide inline "Refine in Search" CTA that opens /search with mode Products and relevant filters preapplied.
- For level three pages, surface back-to-level-two chip and quick toggles for sizes, condition, and price sliders.

### Data and Technical Considerations
- Prefetch level two and level three categories via Supabase hierarchical query and cache in the client store.
- Pull brand counts and popularity metrics from Supabase views to power featured brand ordering.
- Use fallback imagery or emoji tokens when a category lacks art to avoid broken tiles.
- Instrument category engagement, tile taps, and filter usage for future IA iterations.

### Implementation Roadmap
- Audit existing category routes to ensure URL patterns align with the level two and three hierarchy.
- Centralize category metadata in a single loader util so all pages share the same data contract.
- Build the hero module and grid in @repo/ui to keep styling consistent and reduce rework.
- Tune SEO metadata per category page, reflecting supabase counts and primary keywords.

## Cross-Surface Alignment Checklist
- Bottom nav icons, labels, and active states stay uniform; only the highlighted tab changes per route.
- Applied filter chips use the same visual system across search and category pages for muscle memory.
- Saved searches and recent queries remain accessible from /search and category pages to prevent dead ends.
- Analytics naming conventions align so funnel tracking compares surfaces without manual relabeling.

## Open Questions
- Test whether "Products" or "Collections" resonates more with target users before final copy freeze.
- Validate that quick pills continue to drive enough traffic once /search houses advanced filters.
- Determine how saved searches should surface across main and category pages without cluttering UI.
- Confirm seller and brand search endpoints meet latency budgets once indexes are applied.

## Next Steps
- 1) Socialize this plan with design and analytics to agree on Option A for /search.
- 2) Break the work into tickets: segmented control component, search state refactor, category hero rework, analytics instrumentation.
- 3) Schedule mobile usability tests (5 participants) focusing on segmented control comprehension and bottom sheet filters.
