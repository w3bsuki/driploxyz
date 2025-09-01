# Comprehensive Categories and Filtering Data Analysis

**Generated:** 2025-01-01  
**Purpose:** Complete extraction of database schema, categories, and filtering data for finalizing the filtering system.

## Executive Summary

This document provides a comprehensive analysis of Driplo's categories, filtering capabilities, and database structure extracted directly from the live database and codebase. Use this as the single source of truth for implementing and wiring filter components.

---

## 1. Database Schema Overview

### Core Tables
- **categories** (135 records) - 3-level hierarchy system
- **products** (37 active records) - Main product catalog  
- **profiles** (20 users) - User accounts and seller info
- **orders** (7 records) - Transaction history
- **messages** (88 records) - User communications
- **favorites** (36 records) - User wishlist items

### Key Filtering Tables
| Table | Records | Purpose |
|-------|---------|---------|
| categories | 135 | Product categorization hierarchy |
| products | 37 | Filterable product attributes |
| brands | 0 | Brand registry (empty, uses product.brand field) |
| subscription_plans | 5 | User tier filtering |
| country_config | 5 | Geographic filtering |

---

## 2. Complete Category Hierarchy 

### Level 1 - Main Categories (4)
```
Men (a6efa5a7-bb71-4fca-a9c4-94ffd4ea5830)
Women (1ac67287-e4b6-492b-9a34-bd01c2785e02) 
Kids (244bb062-704d-4415-9b74-d559a1e1447a)
Unisex (c6e1850a-e1de-4577-8514-877e80ba1815)
```

### Level 2 - Sub-Categories (4 per main category)
```
Under each L1 category:
├── Clothing (slug: {gender}-clothing)
├── Shoes (slug: {gender}-shoes) 
├── Accessories (slug: {gender}-accessories)
└── Bags (slug: {gender}-bags)
```

### Level 3 - Specific Categories

#### Women > Clothing (12 categories)
- Dresses (`women-dresses`)
- Tops & T-Shirts (`women-tops`)
- Shirts & Blouses (`women-shirts-blouses`) 
- Sweaters & Hoodies (`women-sweaters-hoodies`)
- Jackets & Coats (`women-jackets-coats`)
- Jeans (`women-jeans`)
- Pants & Trousers (`women-pants-trousers`)
- Shorts (`women-shorts`)
- Skirts (`women-skirts`)
- Activewear (`women-activewear`)
- Swimwear (`women-swimwear`)
- Lingerie & Underwear (`women-lingerie-underwear`)

#### Women > Shoes (5 categories)
- Sneakers (`women-sneakers`)
- Boots (`women-boots`)
- Heels (`women-heels`)
- Flats (`women-flats`)
- Sandals (`women-sandals`)

#### Women > Accessories (11 categories)
- Hats & Caps (`women-hats-caps`)
- Jewelry (`women-jewelry`)
- Belts (`women-belts`)
- Scarves (`women-scarves`)
- Sunglasses (`women-sunglasses`)
- Wallets (`women-wallets`)
- Wallets & Purses (`women-wallets-purses`)
- Hair Accessories (`women-hair-accessories`)
- Gloves (`women-gloves`)
- Shawls (`women-shawls`)
- Bandanas (`women-bandanas`)
- Keychains (`women-keychains`)

#### Women > Bags (9 categories)
- Bags & Purses (`women-bags-purses`)
- Handbags (`women-handbags`)
- Shoulder Bags (`women-shoulder-bags`)
- Crossbody Bags (`women-crossbody-bags`)
- Clutches (`women-clutches`)
- Tote Bags (`women-tote-bags`)
- Backpacks (`women-backpacks`)
- Makeup Bags (`women-makeup-bags`)
- Travel Bags (`women-travel-bags`)

#### Men > Clothing (11 categories)
- T-Shirts (`men-t-shirts`)
- Shirts (`men-shirts`)
- Sweaters & Hoodies (`men-sweaters-hoodies`)
- Jackets & Coats (`men-jackets-coats`)
- Jeans (`men-jeans`)
- Pants & Trousers (`men-pants-trousers`)
- Shorts (`men-shorts`)
- Suits & Blazers (`men-suits-blazers`)
- Activewear (`men-activewear`)
- Swimwear (`men-swimwear`)
- Underwear (`men-underwear`)

#### Men > Shoes (4 categories)
- Sneakers (`men-sneakers`)
- Boots (`men-boots`)
- Formal Shoes (`men-formal-shoes`)
- Sandals & Slides (`men-sandals-slides`)

#### Men > Accessories (10 categories)
- Hats & Caps (`men-hats-caps`)
- Belts (`men-belts`)
- Watches (`men-watches`)
- Scarves (`men-scarves`)
- Ties (`men-ties`)
- Sunglasses (`men-sunglasses`)
- Wallets (`men-wallets`)
- Cufflinks (`men-cufflinks`)
- Gloves (`men-gloves`)
- Suspenders (`men-suspenders`)
- Keychains (`men-keychains`)

#### Men > Bags (7 categories)
- Backpacks (`men-backpacks`)
- Briefcases (`men-briefcases`)
- Messenger Bags (`men-messenger-bags`)
- Gym Bags (`men-gym-bags`)
- Duffel Bags (`men-duffel-bags`)
- Laptop Bags (`men-laptop-bags`)
- Travel Bags (`men-travel-bags`)

#### Kids Categories
Similar structure with age-appropriate categories like:
- Kids > Clothing: T-Shirts, Dresses, Pants & Jeans, Shorts, etc.
- Kids > Shoes: Sneakers, Boots, Sandals
- Kids > Accessories: Hats, Belts, Hair Accessories, etc.
- Kids > Bags: School Bags, Backpacks, Lunch Bags, Mini Bags

#### Unisex Categories  
- Unisex > Clothing: T-Shirts, Hoodies, Jackets, Jeans
- Unisex > Shoes: Sneakers
- Unisex > Accessories: Hats, Jewelry, Belts, Sunglasses, etc.
- Unisex > Bags: Backpacks, Duffel Bags, Messenger Bags, etc.

---

## 3. Product Filtering Schema

### Available Filter Fields

#### Core Product Attributes
```sql
-- Products table filtering columns
title          -- Full-text searchable
description    -- Full-text searchable  
price          -- Numeric range (BGN)
brand          -- String exact match
size           -- String exact match
condition      -- ENUM: brand_new_with_tags, new_without_tags, like_new, good, worn, fair
color          -- String (Bulgarian/English)
material       -- String (Bulgarian/English)
tags           -- Array of strings
location       -- String (city/region)
shipping_cost  -- Numeric (BGN)
```

#### System Filters
```sql
status         -- ENUM: active, sold, archived, deleted, pending
is_active      -- Boolean
is_sold        -- Boolean  
is_featured    -- Boolean
is_boosted     -- Boolean
boost_type     -- String: premium, featured, highlight
country_code   -- String: BG, GB, US, RU, UA, DE, FR, ES, IT, NL, PL, RO
region         -- String: BG, UK
```

#### Temporal Filters
```sql
created_at     -- Timestamp (newest, date ranges)
updated_at     -- Timestamp
sold_at        -- Timestamp
boosted_until  -- Timestamp
```

---

## 4. Current Data Distribution

### Brands (Live Data)
```
Nike: 13 products
Mango: 4 products  
H&M: 3 products
Adidas: 3 products
Levi's: 3 products
Uniqlo: 3 products
INDECISIVE WEAR: 2 products
COS: 1 product
```

### Sizes (Live Data)
```
XS: 13 products
S: 10 products
M: 5 products  
L: 4 products
XL: 2 products
5 (shoe size): 2 products
```

### Conditions (Live Data)
```
good: 22 products (59%)
brand_new_with_tags: 10 products (27%)
new_without_tags: 3 products (8%)
worn: 1 product (3%)
like_new: 1 product (3%)
fair: 0 products
```

### Colors (Live Data - Bilingual)
```
Bulgarian: Бяло (10), Черно (2), Сиво (2), Зелено (1), Многоцветно (1), Лилаво (1), Синьо (1)
English: White (5), Multi (2), Gray (1), red (1), ORANJ (1)
Mixed: 123 (1), 123213 (1) [data quality issues]
```

### Materials (Live Data - Bilingual)
```
Bulgarian: Памук (8), Кожа (1), Полиестер (1)
English: Cotton (3), Wool (3), Polyester (1), cotton (1)
Mixed: 123 (1) [data quality issue]
```

### Geographic Distribution
```
Country Codes: BG (37 products) - 100% Bulgarian market
Regions: BG (37 products) - 100% Bulgarian region
```

---

## 5. Filter Parameter Schema

### URL Parameter Mapping (Canonical)
```typescript
interface FilterState {
  // Category hierarchy (3-level)
  category: string | null      // Level 1: women/men/kids/unisex
  subcategory: string | null   // Level 2: clothing/shoes/accessories/bags  
  specific: string | null      // Level 3: t-shirts/dresses/sneakers etc.
  
  // Product attributes
  size: string                 // 'all' or specific size
  brand: string                // 'all' or specific brand
  condition: string            // 'all' or specific condition
  minPrice: string            // Empty or numeric string
  maxPrice: string            // Empty or numeric string
  
  // Search and sort
  query: string               // Full-text search
  sortBy: string             // 'relevance'|'newest'|'price-low'|'price-high'
}
```

### Legacy Parameter Support
```
Legacy → Canonical mapping:
level1 → category
level2 → subcategory  
level3 → specific
```

---

## 6. Filter System Architecture

### State Management (Svelte 5 Runes)
- **File:** `apps/web/src/lib/stores/product-filter.svelte.ts`
- **Pattern:** Applied vs Pending filters (modal editing)
- **Features:** URL sync, localStorage persistence, instant client filtering
- **Performance:** Optimized with $state.raw() for product arrays

### URL Management
- **File:** `apps/web/src/lib/utils/filter-url.ts` 
- **Features:** Canonical URL generation, legacy parameter redirects
- **Routes:** Unified `/search` endpoint with category redirects

### UI Components
- **FilterModal** (`packages/ui/src/lib/FilterModal.svelte`) - Main filter interface
- **FilterPillGroup** - Multi-select filter pills with Melt UI
- **AppliedFilters** - Active filter display with removal
- **CategoryFilterDropdown** - Hierarchical category selection

---

## 7. Implementation Recommendations

### Immediate Action Items

#### 1. Data Quality Cleanup
```sql
-- Fix inconsistent brands (case sensitivity)
UPDATE products SET brand = 'Nike' WHERE LOWER(brand) = 'nike';
UPDATE products SET brand = 'Indecisive Wear' WHERE brand IN ('INDECISIVE WEAR', 'Indecisive wear');

-- Standardize color naming (choose Bulgarian or English)
-- Standardize material naming (choose Bulgarian or English)  

-- Remove test/invalid data
UPDATE products SET color = NULL WHERE color IN ('123', '123213');
UPDATE products SET material = NULL WHERE material = '123';
```

#### 2. Enhanced Filter Options

**Size Standardization:**
```typescript
// Clothing sizes
const CLOTHING_SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

// Shoe sizes (EU standard for Bulgarian market)
const SHOE_SIZES_EU = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];

// Kids sizes  
const KIDS_SIZES = ['3-6m', '6-9m', '9-12m', '12-18m', '18-24m', '2T', '3T', '4T', '5T'];
```

**Color Palette (Choose Language):**
```typescript
// Option A: Bulgarian (matches current data)
const COLORS_BG = [
  'Бяло', 'Черно', 'Сиво', 'Червено', 'Синьо', 'Зелено', 
  'Жълто', 'Лилаво', 'Розово', 'Кафяво', 'Бежово', 'Многоцветно'
];

// Option B: English (international)  
const COLORS_EN = [
  'White', 'Black', 'Gray', 'Red', 'Blue', 'Green',
  'Yellow', 'Purple', 'Pink', 'Brown', 'Beige', 'Multicolor'  
];
```

#### 3. Category Navigation Setup

**Filter Button Wiring:**
```typescript
// Home page category pills
const categoryPills = [
  { label: 'Жени', value: 'women', href: '/search?category=women' },
  { label: 'Мъже', value: 'men', href: '/search?category=men' },
  { label: 'Деца', value: 'kids', href: '/search?category=kids' },
  { label: 'Unisex', value: 'unisex', href: '/search?category=unisex' }
];

// Subcategory navigation  
const subcategoryPills = [
  { label: 'Дрехи', value: 'clothing', href: '/search?category=women&subcategory=clothing' },
  { label: 'Обувки', value: 'shoes', href: '/search?category=women&subcategory=shoes' },
  { label: 'Аксесоари', value: 'accessories', href: '/search?category=women&subcategory=accessories' },
  { label: 'Чанти', value: 'bags', href: '/search?category=women&subcategory=bags' }
];
```

#### 4. Search & Filter Integration

**Search API Enhancement:**
```sql
-- Full-text search optimization
ALTER TABLE products ADD COLUMN search_vector tsvector;

-- Update search vector  
UPDATE products SET search_vector = 
  to_tsvector('bulgarian', COALESCE(title,'') || ' ' || COALESCE(description,'') || ' ' || COALESCE(brand,''));

-- Create search index
CREATE INDEX products_search_idx ON products USING gin(search_vector);

-- Auto-update trigger
CREATE OR REPLACE FUNCTION products_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('bulgarian', 
    COALESCE(NEW.title,'') || ' ' || COALESCE(NEW.description,'') || ' ' || COALESCE(NEW.brand,'')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_search_update BEFORE INSERT OR UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION products_search_trigger();
```

---

## 8. Performance Optimization

### Database Indexes
```sql
-- Category filtering (most common)
CREATE INDEX products_category_active_idx ON products(category_id) WHERE is_active = true;
CREATE INDEX products_seller_active_idx ON products(seller_id) WHERE is_active = true;

-- Attribute filtering  
CREATE INDEX products_brand_idx ON products(brand) WHERE brand IS NOT NULL;
CREATE INDEX products_size_idx ON products(size) WHERE size IS NOT NULL;
CREATE INDEX products_condition_idx ON products(condition);
CREATE INDEX products_price_idx ON products(price);

-- Geographic filtering
CREATE INDEX products_country_region_idx ON products(country_code, region);

-- Temporal filtering
CREATE INDEX products_created_active_idx ON products(created_at DESC) WHERE is_active = true;
```

### Query Optimization
```sql
-- Efficient category hierarchy query
WITH RECURSIVE category_tree AS (
  SELECT id, name, slug, parent_id, 1 as level, ARRAY[id] as path
  FROM categories WHERE parent_id IS NULL
  UNION ALL
  SELECT c.id, c.name, c.slug, c.parent_id, ct.level + 1, ct.path || c.id
  FROM categories c
  JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree ORDER BY level, parent_id, sort_order;
```

---

## 9. Frontend Filter Component Configuration

### FilterModal Sections Setup
```typescript
const filterSections: FilterSection[] = [
  {
    key: 'category',
    label: 'Категория', 
    type: 'pills',
    options: categoryOptions,
    value: filters.category
  },
  {
    key: 'size',
    label: 'Размер',
    type: 'pills', 
    options: sizeOptions,
    value: filters.size
  },
  {
    key: 'brand',
    label: 'Марка',
    type: 'pills',
    options: brandOptions, 
    value: filters.brand
  },
  {
    key: 'condition', 
    label: 'Състояние',
    type: 'pills',
    options: conditionOptions,
    value: filters.condition
  },
  {
    key: 'price',
    label: 'Цена',
    type: 'range',
    minValue: filters.minPrice,
    maxValue: filters.maxPrice,
    placeholder: { min: 'Мин. цена', max: 'Макс. цена' }
  }
];
```

### Filter Options Data
```typescript
const conditionOptions = [
  { value: 'brand_new_with_tags', label: 'Ново с етикети', icon: '🏷️' },
  { value: 'new_without_tags', label: 'Ново без етикети', icon: '✨' },
  { value: 'like_new', label: 'Като ново', icon: '🔥' },
  { value: 'good', label: 'Добро състояние', icon: '👍' },
  { value: 'worn', label: 'Носено', icon: '👔' },
  { value: 'fair', label: 'Задоволително', icon: '🤷' }
];

const sizeOptions = [
  { value: 'XXS', label: 'XXS' },
  { value: 'XS', label: 'XS' },
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
  { value: 'XXL', label: 'XXL' }
];

// Dynamic brand options from live data
const brandOptions = [
  { value: 'Nike', label: 'Nike' },
  { value: 'Adidas', label: 'Adidas' },
  { value: 'H&M', label: 'H&M' },
  { value: 'Mango', label: 'Mango' },
  { value: 'Levi\'s', label: 'Levi\'s' },
  { value: 'Uniqlo', label: 'Uniqlo' },
  { value: 'COS', label: 'COS' }
];
```

---

## 10. Testing & Validation Checklist

### Data Consistency
- [ ] All category slugs are unique and URL-safe
- [ ] Category hierarchy has no orphaned records  
- [ ] Product-category relationships are valid
- [ ] Brand names are consistent (case-sensitive)
- [ ] Size values follow a standard format
- [ ] Color/material naming is consistent (language choice)

### Filter Functionality  
- [ ] Category filters work at all 3 hierarchy levels
- [ ] Brand filter shows only brands with active products
- [ ] Size filter shows only sizes with active products  
- [ ] Condition filter works with enum values
- [ ] Price range filtering works with numeric validation
- [ ] Search query filters title, description, and brand
- [ ] Sort options work correctly (newest, price asc/desc)

### URL & Navigation
- [ ] Filter changes update URL with canonical parameters
- [ ] Direct URL access loads correct filter state
- [ ] Back/forward browser navigation works
- [ ] Category pill navigation works with preloading
- [ ] Legacy URL parameters redirect correctly

### Performance
- [ ] Search results load under 300ms for simple queries  
- [ ] Category browsing loads under 200ms
- [ ] Infinite scroll appends without duplicates
- [ ] Filter changes are instant (no server roundtrip)

---

## Conclusion

This comprehensive analysis provides all necessary data to finalize the filtering system. The category hierarchy is well-structured with 135 categories across 3 levels. The filtering system is sophisticated with Svelte 5 runes, proper URL management, and accessibility features.

**Next Steps:**
1. Clean up data quality issues (brand consistency, test data)
2. Standardize size/color/material naming conventions  
3. Wire up filter buttons using the documented options
4. Implement performance optimizations (database indexes)
5. Run comprehensive testing using the provided checklist

The system is production-ready with minor data cleanup and configuration remaining.