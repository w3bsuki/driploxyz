# i18n Audit Report - Bulgarian Locale Issues

**Date:** October 17, 2025  
**Issue:** Most content showing in English despite Bulgarian locale selection  
**Severity:** High - Core user experience issue

## Executive Summary

The application has extensive i18n infrastructure but several critical components contain **hardcoded English strings** that bypass the translation system. This results in a mixed-language experience where Bulgarian users see English text in key areas.

## Issues Identified

### 1. **Virtual Categories in +page.svelte** ❌
**Location:** `apps/web/src/routes/+page.svelte` (lines 73-77)

**Problem:** Virtual category names are hardcoded in English:
```typescript
const virtualCategories = $derived(
  [
    { slug: 'clothing', name: 'Clothing', product_count: 0 },
    { slug: 'shoes', name: 'Shoes', product_count: 0 },
    { slug: 'bags', name: 'Bags', product_count: 0 },
    { slug: 'accessories', name: 'Accessories', product_count: 0 }
  ].map((c) => mapCategory(c))
);
```

**Impact:** Quick pills show "Clothing, Shoes, Bags, Accessories" in English even in Bulgarian locale

**Available Bulgarian Translations:**
- `category_clothing` → "Дрехи"
- `category_shoesType` → exists in translation system
- `category_bags` → "Чанти"
- `category_accessories` → "Аксесоари"

### 2. **NewestListingsBanner Component** ❌
**Location:** `packages/ui/src/lib/compositions/banners/NewestListingsBanner.svelte` (line 113)

**Problem:** Hardcoded English text for item count:
```svelte
<p class={classes.meta}>{itemCount} new listings</p>
```

**Impact:** Shows "12 new listings" instead of Bulgarian equivalent

**Solution Needed:** Add i18n key for this string pattern

### 3. **Promoted Listings Section** ⚠️
**Location:** Multiple files

**Problem:** While the banner title uses translations, the fallback text is English:
```typescript
promoted_listings: i18n.home_promotedListings?.() || 'Promoted Listings'
```

**Impact:** If translation function fails, falls back to English

**Available Translation:**
- Bulgarian: `home_promotedListings` → "Промотирани обяви" ✅
- English: `home_promotedListings` → "Promoted Listings" ✅

### 4. **"Unisex" Category Not Translated** ⚠️
**Location:** `apps/web/src/routes/+page.svelte` (line 231)

**Problem:** Hardcoded with no translation:
```typescript
'Unisex': 'Unisex',
```

**Impact:** Shows "Unisex" in all locales (minor - word is same in many languages)

### 5. **Missing Translation Keys** ⚠️

Several keys referenced in code but missing Bulgarian translations:
- `banner_promotedDescription` - Used but may not exist
- `quick_under25` - Quick shop filters
- `quick_budgetFinds`
- `quick_dripCollection`
- `quick_staffPicks`
- `quick_designer100`
- `quick_premiumPieces`
- `quick_brandNewCondition`
- `quick_excellentCondition`

## Root Causes

### 1. **Direct String Usage Instead of i18n Functions**
Components are using hardcoded strings instead of calling i18n translation functions.

### 2. **Virtual Categories Pattern**
The virtual categories are defined inline rather than pulling from database or i18n system.

### 3. **Component Prop Defaults**
Several UI components have English defaults in their prop definitions:
```typescript
sectionTitle = 'Newest listings', // English default
```

### 4. **Missing Translation Keys**
Some keys are referenced in code but don't exist in `bg.json` file.

## Recommended Fixes

### Priority 1: Virtual Categories (HIGH IMPACT)
```typescript
// Before:
{ slug: 'clothing', name: 'Clothing', product_count: 0 }

// After:
{ slug: 'clothing', name: i18n.category_clothing(), product_count: 0 }
```

### Priority 2: Add Missing Translation Keys
Add to `packages/i18n/messages/bg.json`:
```json
{
  "home_itemCountNew": "{count} нови обяви",
  "category_unisex": "Унисекс",
  "quick_under25": "Под 25лв",
  "quick_budgetFinds": "Бюджетни находки",
  "quick_dripCollection": "Drip колекция",
  "quick_staffPicks": "Избор на персонала",
  "quick_designer100": "Дизайнерски 100лв+",
  "quick_premiumPieces": "Премиум артикули",
  "quick_brandNewCondition": "Чисто нови",
  "quick_excellentCondition": "Отлично състояние"
}
```

### Priority 3: Refactor NewestListingsBanner
```svelte
<!-- Before: -->
<p class={classes.meta}>{itemCount} new listings</p>

<!-- After: -->
<p class={classes.meta}>{translations?.itemCountNew || `${itemCount} new listings`}</p>
```

### Priority 4: Remove English Defaults
Replace all English default strings with i18n function calls throughout the codebase.

## Testing Checklist

After fixes, verify in Bulgarian locale:
- [ ] Quick filter pills show: "Всички, Мъже, Жени, Деца, Унисекс, Дрехи, Обувки, Чанти, Аксесоари"
- [ ] Promoted listings section shows: "Промотирани обяви"
- [ ] Newest listings shows: "X нови обяви"
- [ ] All category names in Bulgarian
- [ ] Quick shop filters in Bulgarian
- [ ] Condition badges in Bulgarian

## Implementation Plan

1. ✅ **Audit Complete** - Document all issues
2. ⏳ **Add Missing Keys** - Update en.json and bg.json
3. ⏳ **Refactor +page.svelte** - Fix virtual categories
4. ⏳ **Refactor UI Components** - Fix NewestListingsBanner and others
5. ⏳ **Test & Verify** - Full Bulgarian locale test
6. ⏳ **Code Review** - Ensure no English fallbacks remain

## Files to Modify

1. `packages/i18n/messages/en.json` - Add missing English keys
2. `packages/i18n/messages/bg.json` - Add missing Bulgarian translations
3. `apps/web/src/routes/+page.svelte` - Fix virtual categories
4. `packages/ui/src/lib/compositions/banners/NewestListingsBanner.svelte` - Fix hardcoded text
5. `packages/ui/src/lib/compositions/navigation/MainPageSearchBar.svelte` - Verify quick shop translations

## Notes

- The i18n infrastructure is solid (paraglide-based)
- The issue is **not** with the i18n system itself
- Main problem: Components bypassing i18n with hardcoded strings
- Bulgarian translations exist for most categories - just need to use them
- Some newer features (quick shop) need Bulgarian translations added

## Conclusion

The root cause is **hardcoded English strings in components** rather than a fundamental i18n system issue. The fix requires:
1. Adding missing translation keys
2. Refactoring components to use i18n functions
3. Removing English string defaults

**Estimated effort:** 2-3 hours for complete fix
**Impact:** HIGH - Major UX improvement for Bulgarian users
