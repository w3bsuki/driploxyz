# UX Enhancement Backlog (Post Tailwind v4 Cutover)

Track higher-level UX and product improvements separately from the core Tailwind v4 migration. Prioritise based on data after the upgrade ships.

## Conversion & Trust Components
- [ ] Build trust signal blocks (secure checkout badges, guarantees, certification icons).
- [ ] Add urgency/availability patterns (countdown timers, low-stock indicators, “X left” messages).
- [ ] Implement social proof surfaces (ratings breakdown, review snippets, “X people viewing now”).
- [ ] Enhance CTA variants (contrast >7:1, loading states, disabled logic, iconography).
- [ ] Surface cart persistence messaging (“Your cart is saved”, cross-device reminders).
- [ ] Provide progress indicators for multi-step journeys (checkout, onboarding).
- [ ] Explore exit-intent/cart-abandonment prompts with respectful frequency caps.

## Performance & Resilience Enhancements
- [ ] Introduce service worker caching with offline fallbacks and queued mutations.
- [ ] Layer in optimistic UI flows for cart, wishlist, and follow actions.
- [ ] Implement virtualised lists/grids for large product collections.
- [ ] Add CSS containment hints to heavy components to protect scroll performance.

## Visual & Design System Parity
- [ ] Sync tokens with Figma (Style Dictionary / Figma Tokens) for source-of-truth parity.
- [ ] Expand visual regression coverage across breakpoints and key components.
- [ ] Document subpixel rendering rules (hairline borders, shadow blur) to ensure cross-browser fidelity.
- [ ] Establish an image optimisation pipeline (WebP/AVIF, responsive sizes, caching strategy).

## Accessibility & Assistive Patterns
- [ ] Roll out reusable focus traps for modals/drawers.
- [ ] Add live regions for asynchronous updates and cart changes.
- [ ] Provide skip links, landmarks, and enforce heading hierarchy.
- [ ] Supply reduced-motion variants for all animations and respect user preferences.
- [ ] Announce dynamic content updates via polite/assertive ARIA patterns.
- [ ] Consider keyboard shortcuts (`/` for search, `J/K` navigation) where appropriate.

## Analytics, Experimentation & Feedback
- [ ] Integrate feature flags to gate new UI experiments.
- [ ] Instrument conversion funnels (`view_item`, `add_to_cart`, `purchase`) and cart abandonment tracking.
- [ ] Launch A/B tests for high-impact surfaces (hero, CTA, checkout forms).
- [ ] Capture heatmaps/scroll depth (especially mobile thumb zones).
- [ ] Enable privacy-compliant session recording to surface UX friction.

Log additional ideas here instead of bloating the core migration plan. Triage regularly with Product & Design.
