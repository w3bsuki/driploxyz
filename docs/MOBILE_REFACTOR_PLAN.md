# Driplo Mobile Refactoring Plan 📱

> Comprehensive refactoring plan based on mobile testing of driplo.xyz  
> Goal: iOS-style Svelte 5 + Tailwind 4 native perfection

## Overview

This plan addresses critical functionality issues, standardizes UI components, and achieves iOS-native polish across the mobile experience. Each phase builds upon the previous to ensure stability and consistency.

---

## Phase 1: Critical Functionality Fixes 🚨

**Priority:** URGENT | **Timeline:** 1-2 days

### 1.1 Messages Connection Issue
- **Issue:** Messages page stuck on "connecting"
- **Action:** Debug Supabase realtime connection, check WebSocket connectivity
- **Files:** `apps/web/src/routes/messages/+page.svelte`, realtime service
- **Validation:** Test message sending/receiving on mobile

### 1.2 Search Dropdown Navigation Bug  
- **Issue:** Category dropdown (Women/Men/Kids) closes instead of expanding
- **Action:** Fix event propagation and dropdown state management
- **Files:** Search component dropdowns, category navigation
- **Validation:** Test all dropdown navigation flows on mobile

### 1.3 Header Emoji Animation Performance
- **Issue:** Broken animation potentially slowing website
- **Action:** Audit animation performance, optimize or remove if degrading UX
- **Files:** Header component with emoji animation
- **Decision:** Remove if performance impact > UX benefit

---

## Phase 2: Search Bar Standardization 🔍

**Priority:** HIGH | **Timeline:** 2-3 days

### 2.1 Search Component Consolidation
- **Current State:** 3 different search bars across pages
- **Goal:** Single reusable search component with configurable dropdowns

#### 2.1.1 Create Unified Search Component
- **Location:** `@repo/ui/src/lib/Search.svelte`
- **Props:**
  ```typescript
  interface SearchProps {
    variant: 'main' | 'search' | 'category'
    category?: 'men' | 'women' | 'kids'
    placeholder: string
    dropdownConfig: DropdownConfig
  }
  ```

#### 2.1.2 Dropdown Configurations
- **Main Page:** Quick search + top sellers + newest ads
- **Search Page:** Full shopping experience with category selection
- **Category Pages:** Category-specific options (clothing, shoes, accessories for men)

#### 2.1.3 Implementation Strategy
1. Audit existing search implementations
2. Create unified component in `@repo/ui`
3. Replace all instances across apps
4. Ensure consistent styling and behavior

---

## Phase 3: Navigation & Interaction Overhaul 🧭

**Priority:** HIGH | **Timeline:** 2-3 days

### 3.1 Hamburger Menu Enhancement
- **Current:** Opens under header
- **Target:** Full viewport overlay with internal close button
- **Features:**
  - Slide over current content
  - Close button (X) in top-right
  - Smooth iOS-style animations
  - Proper z-index layering

### 3.2 Bottom Navigation iOS Perfection
- **Goal:** Native iOS tab bar feel with Svelte 5 + Tailwind 4
- **Features:**
  - Proper tap targets (44px minimum)
  - Subtle haptic-style feedback
  - Clean iconography
  - Smooth transitions

### 3.3 Notification Dropdown Fix
- **Issue:** Transparency when should be solid
- **Action:** Remove transparency, ensure proper background color
- **Styling:** Full opacity background matching theme

---

## Phase 4: Content & Display Improvements 🎨

**Priority:** MEDIUM | **Timeline:** 3-4 days

### 4.1 Highlight Section Seller Showcase
- **Current:** Basic product highlights  
- **Options to Evaluate:**
  1. **Best Sellers Cards:** Profile-style cards with seller info
  2. **Seller Avatars:** Add avatars under highlighted products
  3. **Hybrid Approach:** Same size cards as product grid with seller info

#### 4.1.1 Decision Framework
- A/B test different approaches
- Measure engagement vs complexity
- Maintain mobile performance

### 4.2 Profile Page Improvements
- **Route Fix:** Change `/profile/Tintin` → `/profile/me` for own profile
- **Missing Images:** Fix listing images display
- **Tab Refinement:** Evaluate emoji sizing (current assessment: "not bad")

### 4.3 Typography & Badge Consistency  
- **Pro Badge:** Less rounded to match condition badges
- **Condition Badges:** Ensure Bulgarian translation consistency
- **Typography:** Audit across all card types for consistency

---

## Phase 5: Filter & Category UX 🎛️

**Priority:** MEDIUM | **Timeline:** 2-3 days

### 5.1 Category Page Filter Redesign
- **Current Issues:**
  - "Най-популярни" and "Филтри" buttons look inconsistent
  - Full sheet filter experience needs UX review
  
#### 5.1.1 Filter Button Standardization
- Consistent styling with other UI elements
- Clear hierarchy and visual weight
- Proper touch targets

#### 5.1.2 Filter Sheet UX Review
- Evaluate modal vs inline filtering
- Streamline filter categories
- Improve selection feedback

### 5.2 Bulgarian Localization Audit
- **Condition Badges:** Ensure all translated properly  
- **Filter Labels:** Consistent terminology
- **Error Messages:** Proper localization

---

## Phase 6: Polish & Performance 🚀

**Priority:** LOW | **Timeline:** 1-2 days

### 6.1 iOS Native Perfection Audit
- **Remove:** Any zoom animations, hover effects, over-engineered interactions
- **Enhance:** Natural iOS-style micro-interactions
- **Optimize:** Core Web Vitals, especially mobile LCP

### 6.2 Quick View Dialog Refinement
- Minor UX improvements based on user feedback
- Consistent with overall design system
- Performance optimization

### 6.3 Wishlist Button Polish
- **Current:** "Isn't perfect"
- **Action:** Refine interaction, visual feedback, positioning
- **Consistency:** Match overall button design patterns

---

## Implementation Guidelines

### Technical Standards
- **Framework:** Svelte 5 runes + SvelteKit 2
- **Styling:** Tailwind v4 with design tokens
- **Performance:** Mobile-first, LCP ≤ 1.5s
- **Accessibility:** 44px touch targets, proper ARIA
- **Code Quality:** Zero TypeScript errors

### Testing Protocol
1. **Mobile-first testing** on actual devices
2. **Cross-browser validation** (iOS Safari, Android Chrome)
3. **Performance monitoring** (Core Web Vitals)
4. **Accessibility audit** (WCAG AA compliance)

### Component Strategy
- **Promote to `@repo/ui`** if used in 2+ places
- **Single source of truth** for all shared components
- **Consistent API design** across component props
- **Proper TypeScript typing** with satisfies pattern

### Quality Gates
- [ ] Zero TypeScript errors
- [ ] All animations perform at 60fps on low-end mobile
- [ ] Touch targets minimum 44px (primary), 36-40px (secondary)
- [ ] Proper color contrast ratios
- [ ] Consistent visual hierarchy

---

## Success Metrics

### Functionality
- [ ] Messages connect and send properly
- [ ] All dropdowns navigate correctly  
- [ ] Search works across all pages
- [ ] Filters apply and clear properly

### Performance
- [ ] LCP ≤ 1.5s on mobile
- [ ] No janky animations
- [ ] Smooth scrolling throughout
- [ ] Fast navigation between pages

### User Experience  
- [ ] Consistent search experience across pages
- [ ] Intuitive navigation patterns
- [ ] Clear visual feedback for all interactions
- [ ] iOS-native feel throughout

---

## Risk Mitigation

### High Risk Items
1. **Messages refactor** - Test thoroughly on various networks
2. **Search standardization** - Ensure no regression in search functionality  
3. **Navigation changes** - Validate all routing works correctly

### Rollback Strategy
- Feature flags for major UI changes
- Database migration reversibility
- Component versioning in `@repo/ui`

---

## Post-Implementation

### Monitoring
- Real User Monitoring (RUM) for performance
- User feedback collection on key flows
- A/B testing for highlight section variants

### Maintenance
- Regular mobile testing protocol
- Performance budget enforcement  
- Component library documentation updates

---

*Plan created based on comprehensive mobile testing of driplo.xyz*  
*Focus: iOS-native Svelte 5 perfection with zero over-engineering*