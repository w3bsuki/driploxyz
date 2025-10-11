# 🌍 PHASE 5: Multi-Region & Global Backend Architecture

**Date**: 2025-01-22 (Draft - Execute after Phase 4)  
**Status**: Planning / Not Started  
**Prerequisites**: Phase 1 ✅ | Phase 2 ✅ | Phase 3 ✅ | Phase 4 ✅

---

## Quick Context

- ✅ **Phase 1-3 COMPLETE** - Clean package architecture, framework-agnostic core
- ✅ **Phase 4 COMPLETE** - Path-based i18n (`/bg`, `/en`), clean structure, zero bloat
- 🎯 **Phase 5 NOW** - Global multi-region system with region-based data filtering

---

## 🌍 Mission: Make Driplo Globally Available

**Goal**: Transform Driplo from a single-region app to a **global multi-region platform** where:

1. **UK users** see only UK products/listings (no Bulgarian items mixed in)
2. **Bulgarian users** see only BG products/listings (no UK items mixed in)
3. **Users can switch regions** via modal: "We noticed you're from the UK. Switch to Driplo UK?"
4. **Fast performance globally** via edge routing and CDN
5. **Clean data isolation** - region is first-class in database schema

---

## The Big Picture

### Current State (After Phase 4):
```
User visits driplo.xyz/en
└── Shows ALL products from ALL regions (mixed BG + UK + future regions)
└── No region detection or filtering
└── Single Supabase instance with no region column
```

### Target State (After Phase 5):
```
User from UK visits driplo.xyz
├── Detects geolocation: UK
├── Shows modal: "Switch to Driplo UK? You'll see UK products and faster loading"
├── User clicks "Yes" → URL becomes driplo.xyz/uk/en
├── Database queries filtered: WHERE region = 'UK'
├── User sees ONLY UK products/listings
└── Future: Add more regions (US, DE, FR, etc.)

User from Bulgaria visits driplo.xyz
├── Detects geolocation: BG
├── Default region already BG, no modal
├── URL: driplo.xyz/bg/bg (or driplo.xyz for short)
├── Database queries filtered: WHERE region = 'BG'
└── User sees ONLY Bulgarian products/listings
```

---

## Architecture Overview

### URL Structure:
```
/[region]/[lang]/[...path]

Examples:
/uk/en/category/fashion          ← UK user, English language
/uk/bg/category/fashion          ← UK user, Bulgarian language (Bulgarian living in UK)
/bg/en/category/fashion          ← BG user, English language
/bg/bg/category/fashion          ← BG user, Bulgarian language

Default:
/category/fashion                ← Detects region, redirects to /bg/bg/category/fashion
```

### Database Schema:
```sql
-- Add region column to all content tables
ALTER TABLE products ADD COLUMN region TEXT NOT NULL DEFAULT 'BG';
ALTER TABLE listings ADD COLUMN region TEXT NOT NULL DEFAULT 'BG';
ALTER TABLE categories ADD COLUMN region TEXT; -- NULL = global category

-- Create region enum for type safety
CREATE TYPE region_code AS ENUM ('BG', 'UK', 'US', 'DE', 'FR');

-- Create index for fast region filtering
CREATE INDEX idx_products_region ON products(region);
CREATE INDEX idx_listings_region ON listings(region);

-- Row Level Security (RLS) for region isolation
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY products_region_access ON products
  FOR SELECT
  USING (region = current_setting('app.current_region', true));
```

### Tech Stack:
- **Supabase MCP**: Schema management, migrations, table auditing
- **Vercel Edge Config**: Region routing and geolocation
- **Supabase RLS**: Data isolation per region
- **Geolocation API**: IP-based country detection
- **Edge Functions**: Server-side region detection

---

## Step-by-Step Plan (Estimated: 10-12 hours)

### Step 1: Audit Current Database Schema with Supabase MCP (1 hour)

**Goal**: Understand current schema and plan region column additions.

#### Commands:
```powershell
# List all Supabase projects
mcp_supabase_list_projects

# Get project details (replace PROJECT_ID)
mcp_supabase_get_project --id PROJECT_ID

# List all tables
mcp_supabase_list_tables --project_id PROJECT_ID

# List current migrations
mcp_supabase_list_migrations --project_id PROJECT_ID

# Check for existing region columns
mcp_supabase_execute_sql --project_id PROJECT_ID --query "
  SELECT table_name, column_name, data_type 
  FROM information_schema.columns 
  WHERE column_name LIKE '%region%' 
  ORDER BY table_name;
"

# Get current products table schema
mcp_supabase_execute_sql --project_id PROJECT_ID --query "
  SELECT column_name, data_type, is_nullable, column_default
  FROM information_schema.columns
  WHERE table_name = 'products'
  ORDER BY ordinal_position;
"

# Get current listings table schema
mcp_supabase_execute_sql --project_id PROJECT_ID --query "
  SELECT column_name, data_type, is_nullable, column_default
  FROM information_schema.columns
  WHERE table_name = 'listings'
  ORDER BY ordinal_position;
"
```

#### Questions to Answer:
- [ ] Which tables need `region` column? (products, listings, users?)
- [ ] What is the current primary key structure?
- [ ] Are there any existing multi-tenancy patterns?
- [ ] How many existing rows will need default region assignment?
- [ ] What foreign key relationships exist that need updating?

#### Output:
Create a migration plan document:
```markdown
### Tables Requiring Region Column:
1. products - 10,000 rows → default to 'BG'
2. listings - 5,000 rows → default to 'BG'
3. categories - 50 rows → NULL (global)

### Foreign Keys to Update:
- products.category_id → categories.id (no change, categories are global)
- listings.product_id → products.id (region must match)

### Indexes to Create:
- products(region)
- listings(region)
- Composite: products(region, category_id)
```

---

### Step 2: Create Region Migration (2 hours)

**Goal**: Add region columns and indexes to database schema.

#### Migration 1: Add Region Enum & Columns
```sql
-- File: supabase/migrations/20250122000001_add_region_support.sql

-- Create region enum
CREATE TYPE region_code AS ENUM ('BG', 'UK');

-- Add region column to products
ALTER TABLE products 
ADD COLUMN region region_code NOT NULL DEFAULT 'BG';

-- Add region column to listings
ALTER TABLE listings 
ADD COLUMN region region_code NOT NULL DEFAULT 'BG';

-- Add region column to users (for region preference)
ALTER TABLE users 
ADD COLUMN preferred_region region_code DEFAULT 'BG';

-- Create indexes for performance
CREATE INDEX idx_products_region ON products(region);
CREATE INDEX idx_listings_region ON listings(region);
CREATE INDEX idx_products_region_category ON products(region, category_id);
CREATE INDEX idx_listings_region_status ON listings(region, status);

-- Add check constraint to ensure listings match product region
ALTER TABLE listings
ADD CONSTRAINT listings_region_matches_product
CHECK (
  region = (SELECT region FROM products WHERE id = listings.product_id)
);

-- Comment columns for documentation
COMMENT ON COLUMN products.region IS 'Geographic region where product is available';
COMMENT ON COLUMN listings.region IS 'Geographic region where listing is active (must match product region)';
COMMENT ON COLUMN users.preferred_region IS 'User preferred region for browsing';
```

#### Migration 2: Row Level Security (RLS)
```sql
-- File: supabase/migrations/20250122000002_add_region_rls.sql

-- Enable RLS on products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see products from their current region
CREATE POLICY products_region_access ON products
  FOR SELECT
  USING (
    region::text = current_setting('app.current_region', true)
    OR current_setting('app.current_region', true) IS NULL
  );

-- Policy: Admins can see all regions
CREATE POLICY products_admin_access ON products
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Enable RLS on listings
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see listings from their current region
CREATE POLICY listings_region_access ON listings
  FOR SELECT
  USING (
    region::text = current_setting('app.current_region', true)
    OR current_setting('app.current_region', true) IS NULL
  );

-- Policy: Users can only create listings in their preferred region
CREATE POLICY listings_region_insert ON listings
  FOR INSERT
  WITH CHECK (
    region::text = (
      SELECT preferred_region::text 
      FROM users 
      WHERE id = auth.uid()
    )
  );
```

#### Apply Migrations with Supabase MCP:
```powershell
# Apply migration 1
mcp_supabase_apply_migration `
  --project_id PROJECT_ID `
  --name "add_region_support" `
  --query @"
$(Get-Content supabase/migrations/20250122000001_add_region_support.sql -Raw)
"@

# Apply migration 2
mcp_supabase_apply_migration `
  --project_id PROJECT_ID `
  --name "add_region_rls" `
  --query @"
$(Get-Content supabase/migrations/20250122000002_add_region_rls.sql -Raw)
"@

# Verify migrations applied
mcp_supabase_list_migrations --project_id PROJECT_ID

# Check for security advisories after DDL changes
mcp_supabase_get_advisors --project_id PROJECT_ID --type security
```

---

### Step 3: Update TypeScript Types (1 hour)

**Goal**: Generate TypeScript types from new schema and update domain models.

#### Commands:
```powershell
# Generate TypeScript types from Supabase
mcp_supabase_generate_typescript_types --project_id PROJECT_ID > packages/database/src/generated/database.types.ts

# Verify types generated correctly
Get-Content packages/database/src/generated/database.types.ts | Select-String -Pattern "region"
```

#### Update Domain Types:
```typescript
/// file: packages/domain/src/models/region.ts

/**
 * Supported regions for Driplo platform
 */
export type RegionCode = 'BG' | 'UK';

export const REGIONS = {
  BG: {
    code: 'BG' as const,
    name: 'Bulgaria',
    currency: 'BGN',
    defaultLang: 'bg',
    emoji: '🇧🇬',
  },
  UK: {
    code: 'UK' as const,
    name: 'United Kingdom',
    currency: 'GBP',
    defaultLang: 'en',
    emoji: '🇬🇧',
  },
} as const;

export type Region = typeof REGIONS[keyof typeof REGIONS];

/**
 * Check if string is valid region code
 */
export function isRegionCode(value: string): value is RegionCode {
  return value === 'BG' || value === 'UK';
}

/**
 * Get region by code
 */
export function getRegion(code: string): Region | null {
  return isRegionCode(code) ? REGIONS[code] : null;
}
```

```typescript
/// file: packages/domain/src/models/product.ts

import type { RegionCode } from './region';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  region: RegionCode;  // NEW
  category_id: string;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  product_id: string;
  region: RegionCode;  // NEW
  status: 'active' | 'inactive';
  seller_id: string;
  created_at: string;
}
```

---

### Step 4: Implement Geolocation Detection (2 hours)

**Goal**: Detect user's country and suggest region switch.

#### A. Create Geolocation Service:
```typescript
/// file: packages/core/src/services/geolocation.ts

import type { RegionCode } from '@repo/domain';

/**
 * Geolocation service for detecting user region
 */
export class GeolocationService {
  /**
   * Detect region from Vercel headers (server-side)
   */
  static detectRegionFromHeaders(headers: Headers): RegionCode | null {
    // Vercel provides geo headers
    const country = headers.get('x-vercel-ip-country');
    
    switch (country) {
      case 'GB':
        return 'UK';
      case 'BG':
        return 'BG';
      default:
        return null; // Unknown region
    }
  }

  /**
   * Detect region from IP address (fallback)
   */
  static async detectRegionFromIP(ip: string): Promise<RegionCode | null> {
    try {
      // Use free IP geolocation API
      const response = await fetch(`https://ipapi.co/${ip}/country/`);
      const country = await response.text();
      
      switch (country) {
        case 'GB':
          return 'UK';
        case 'BG':
          return 'BG';
        default:
          return null;
      }
    } catch (error) {
      console.error('Geolocation detection failed:', error);
      return null;
    }
  }

  /**
   * Get default region for unknown locations
   */
  static getDefaultRegion(): RegionCode {
    return 'BG'; // Default to Bulgaria
  }
}
```

#### B. Update hooks.server.ts:
```typescript
/// file: apps/web/src/hooks.server.ts

import { GeolocationService } from '@repo/core';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // Extract region and locale from URL params
  const region = event.params.region || 'BG';
  const lang = event.params.lang || 'bg';
  
  // Detect user's actual region from headers
  const detectedRegion = GeolocationService.detectRegionFromHeaders(event.request.headers);
  
  // Store in locals for use in load functions
  event.locals.region = region;
  event.locals.detectedRegion = detectedRegion;
  event.locals.locale = lang;
  
  // Set Supabase RLS context for region filtering
  // This ensures all DB queries are automatically filtered by region
  await event.locals.supabase.rpc('set_current_region', { region });
  
  const response = await resolve(event, {
    transformPageChunk: ({ html }) => {
      return html.replace('%lang%', lang);
    }
  });
  
  return response;
};
```

#### C. Create Supabase RLS Helper Function:
```sql
-- File: supabase/migrations/20250122000003_add_region_setter.sql

-- Function to set current region for RLS policies
CREATE OR REPLACE FUNCTION set_current_region(region TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config('app.current_region', region, false);
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION set_current_region TO authenticated;
```

Apply:
```powershell
mcp_supabase_apply_migration `
  --project_id PROJECT_ID `
  --name "add_region_setter" `
  --query @"
$(Get-Content supabase/migrations/20250122000003_add_region_setter.sql -Raw)
"@
```

---

### Step 5: Build Region Switcher UI (2 hours)

**Goal**: Create modal for region switching with persistence.

#### A. Region Switcher Modal Component:
```svelte
<!--- file: packages/ui/src/lib/components/modals/RegionSwitcherModal.svelte --->
<script lang="ts">
  import { REGIONS, type RegionCode } from '@repo/domain';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  interface Props {
    detectedRegion: RegionCode;
    currentRegion: RegionCode;
    onClose: () => void;
  }

  let { detectedRegion, currentRegion, onClose }: Props = $props();

  const detected = REGIONS[detectedRegion];
  const current = REGIONS[currentRegion];

  function switchRegion() {
    // Store preference in cookie
    document.cookie = `preferred_region=${detectedRegion}; path=/; max-age=31536000`; // 1 year
    
    // Navigate to detected region
    const currentPath = window.location.pathname;
    const pathWithoutRegion = currentPath.replace(/^\/(bg|uk)/, '') || '/';
    const lang = $page.params.lang || detected.defaultLang;
    
    goto(`/${detectedRegion}/${lang}${pathWithoutRegion}`);
    onClose();
  }

  function stayInCurrentRegion() {
    // Store preference
    document.cookie = `preferred_region=${currentRegion}; path=/; max-age=31536000`;
    onClose();
  }
</script>

<div class="modal-backdrop">
  <div class="modal">
    <div class="modal-header">
      <h2>{detected.emoji} Welcome from {detected.name}!</h2>
    </div>
    
    <div class="modal-body">
      <p>
        We noticed you're browsing from <strong>{detected.name}</strong>.
      </p>
      <p>
        Would you like to switch to <strong>Driplo {detected.name}</strong> 
        to see products available in your region?
      </p>
      
      <div class="benefits">
        <h3>Benefits:</h3>
        <ul>
          <li>✅ See only {detected.name} products and listings</li>
          <li>✅ Prices in {detected.currency}</li>
          <li>✅ Faster shipping options</li>
          <li>✅ Local payment methods</li>
        </ul>
      </div>
    </div>
    
    <div class="modal-footer">
      <button class="btn-primary" onclick={switchRegion}>
        Switch to Driplo {detected.name}
      </button>
      <button class="btn-secondary" onclick={stayInCurrentRegion}>
        Stay in Driplo {current.name}
      </button>
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }

  .modal {
    background: white;
    border-radius: 8px;
    max-width: 500px;
    width: 90%;
    padding: 2rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }

  .modal-header h2 {
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
  }

  .benefits {
    background: #f5f5f5;
    padding: 1rem;
    border-radius: 4px;
    margin: 1rem 0;
  }

  .benefits ul {
    margin: 0.5rem 0 0 1.5rem;
  }

  .modal-footer {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  button {
    flex: 1;
    padding: 0.75rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }

  .btn-primary {
    background: #0070f3;
    color: white;
  }

  .btn-secondary {
    background: #eaeaea;
    color: #333;
  }
</style>
```

#### B. Integrate in Root Layout:
```svelte
<!--- file: apps/web/src/routes/[[region]]/[[lang]]/+layout.svelte --->
<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { RegionSwitcherModal } from '@repo/ui';
  
  let { data, children } = $props();
  
  let showRegionModal = $state(false);
  
  onMount(() => {
    // Check if user has region preference stored
    const preferredRegion = getCookie('preferred_region');
    
    // If no preference and detected region differs from current
    if (!preferredRegion && data.detectedRegion && data.detectedRegion !== data.region) {
      showRegionModal = true;
    }
  });
  
  function getCookie(name: string): string | null {
    if (!browser) return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }
</script>

{#if showRegionModal}
  <RegionSwitcherModal
    detectedRegion={data.detectedRegion}
    currentRegion={data.region}
    onClose={() => showRegionModal = false}
  />
{/if}

{@render children()}
```

---

### Step 6: Update All Database Queries (2 hours)

**Goal**: Ensure all queries respect region filtering.

#### A. Update Product Service:
```typescript
/// file: packages/core/src/services/products.ts

import type { RegionCode, Product } from '@repo/domain';
import type { SupabaseClient } from '@supabase/supabase-js';

export class ProductService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get products by region
   * RLS automatically filters, but explicit filter for clarity
   */
  async getProducts(region: RegionCode, options?: {
    category?: string;
    limit?: number;
  }): Promise<Product[]> {
    let query = this.supabase
      .from('products')
      .select('*')
      .eq('region', region); // Explicit region filter
    
    if (options?.category) {
      query = query.eq('category_id', options.category);
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  }

  /**
   * Get product by ID (region-scoped)
   */
  async getProductById(id: string, region: RegionCode): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('region', region)
      .single();
    
    if (error) throw error;
    return data;
  }
}
```

#### B. Update All Load Functions:
```typescript
/// file: apps/web/src/routes/[[region]]/[[lang]]/category/[...segments]/+page.server.ts

import type { PageServerLoad } from './$types';
import { createServices } from '@repo/core';

export const load: PageServerLoad = async ({ params, locals }) => {
  const region = params.region || 'BG';
  const services = createServices(locals.supabase);
  
  // All queries automatically scoped to region via RLS
  const products = await services.products.getProducts(region, {
    category: params.segments
  });
  
  return {
    region,
    products
  };
};
```

---

### Step 7: Update Routing Structure (1 hour)

**Goal**: Add region parameter to route structure.

#### New Route Structure:
```
apps/web/src/routes/
├── [[region]]/                ← Optional region (defaults to 'BG')
│   ├── [[lang]]/              ← Optional locale (defaults to 'bg')
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── +layout.svelte
│   │   ├── (app)/
│   │   │   ├── dashboard/
│   │   │   └── +layout.svelte
│   │   ├── category/
│   │   │   └── [...segments]/
│   │   ├── product/
│   │   │   └── [id]/
│   │   ├── +layout.svelte
│   │   ├── +layout.ts
│   │   ├── +page.svelte
│   │   └── +error.svelte
│   └── +layout.svelte
└── api/                       ← API routes (no region/lang)
```

#### Update hooks.ts Reroute:
```typescript
/// file: apps/web/src/hooks.ts

import type { Reroute } from '@sveltejs/kit';

export const reroute: Reroute = ({ url }) => {
  const pathname = url.pathname;
  
  // Match: /region/lang/path or /region/path or /path
  const match = pathname.match(/^\/?(bg|uk)?\/?(?:(bg|en)\/)?(.*)$/);
  
  if (!match) return pathname;
  
  const [, region, lang, rest] = match;
  
  // Default region and lang
  const finalRegion = region || 'bg';
  const finalLang = lang || 'bg';
  const finalPath = rest || '';
  
  // Return path with optional params filled
  return `/${finalRegion}/${finalLang}/${finalPath}`;
};
```

---

### Step 8: Testing & Validation (2 hours)

**Goal**: Comprehensive testing of multi-region functionality.

#### Database Testing:
```powershell
# Test region filtering works
mcp_supabase_execute_sql --project_id PROJECT_ID --query @"
-- Set region context
SELECT set_current_region('UK');

-- Should only return UK products
SELECT id, name, region FROM products LIMIT 5;

-- Switch to BG
SELECT set_current_region('BG');

-- Should only return BG products
SELECT id, name, region FROM products LIMIT 5;
"@

# Test RLS policies
mcp_supabase_get_advisors --project_id PROJECT_ID --type security
```

#### Manual Testing Checklist:
- [ ] Visit `http://localhost:5173` → redirects to `/bg/bg`
- [ ] Mock UK IP (set header) → shows region switcher modal
- [ ] Click "Switch to UK" → URL becomes `/uk/en`
- [ ] UK products shown, BG products hidden
- [ ] Switch back to BG via region selector
- [ ] Cookie persists region preference across refreshes
- [ ] All navigation maintains region prefix
- [ ] Category pages filter by region
- [ ] Product pages check region match
- [ ] Search respects region

#### Load Testing:
```powershell
# Test with large dataset
mcp_supabase_execute_sql --project_id PROJECT_ID --query @"
-- Create test data
INSERT INTO products (name, description, price, region)
SELECT 
  'Product ' || generate_series,
  'Description',
  random() * 100,
  CASE WHEN random() < 0.5 THEN 'BG'::region_code ELSE 'UK'::region_code END
FROM generate_series(1, 10000);

-- Test query performance
EXPLAIN ANALYZE
SELECT * FROM products WHERE region = 'UK' LIMIT 100;
"@
```

---

## Expected Outcomes

### ✅ Success Criteria:

1. **Database Schema**:
   - [ ] Region columns added to products, listings, users
   - [ ] RLS policies active and working
   - [ ] Indexes created for performance
   - [ ] Zero security advisories from Supabase MCP

2. **Geolocation**:
   - [ ] UK visitors shown region switcher modal
   - [ ] BG visitors default to BG region (no modal)
   - [ ] Region preference persisted in cookie
   - [ ] Vercel headers correctly detected

3. **Data Isolation**:
   - [ ] UK users ONLY see UK products/listings
   - [ ] BG users ONLY see BG products/listings
   - [ ] No cross-region data leakage
   - [ ] Admin users can see all regions

4. **URL Structure**:
   - [ ] `/uk/en/category/fashion` works
   - [ ] `/bg/bg/product/123` works
   - [ ] Region persists across navigation
   - [ ] Language switcher maintains region

5. **Performance**:
   - [ ] Queries fast with region indexes
   - [ ] No N+1 query issues
   - [ ] Edge routing configured
   - [ ] CDN caching per region

---

## Rollback Plan

```powershell
# Rollback migrations in reverse order
mcp_supabase_execute_sql --project_id PROJECT_ID --query @"
-- Drop RLS policies
DROP POLICY IF EXISTS products_region_access ON products;
DROP POLICY IF EXISTS products_admin_access ON products;
DROP POLICY IF EXISTS listings_region_access ON listings;

-- Drop indexes
DROP INDEX IF EXISTS idx_products_region;
DROP INDEX IF EXISTS idx_listings_region;

-- Drop columns
ALTER TABLE products DROP COLUMN IF EXISTS region;
ALTER TABLE listings DROP COLUMN IF EXISTS region;
ALTER TABLE users DROP COLUMN IF EXISTS preferred_region;

-- Drop enum
DROP TYPE IF EXISTS region_code;
"@
```

---

## Documentation Updates

After Phase 5:
- [ ] `docs/MULTI_REGION_ARCHITECTURE.md` - Document region system
- [ ] `packages/core/README.md` - Update service documentation
- [ ] `packages/domain/README.md` - Document Region types
- [ ] Update API documentation with region requirements

---

## Future Enhancements (Phase 6+)

After Phase 5 is stable, consider:

1. **More Regions**: US, DE, FR, ES, etc.
2. **Subdomain Routing**: `uk.driplo.xyz`, `bg.driplo.xyz`
3. **Currency Conversion**: Real-time exchange rates
4. **Localized Shipping**: Region-specific carriers
5. **Payment Gateways**: Region-specific payment providers
6. **SEO**: Region-specific sitemaps and structured data

---

## Estimated Timeline

| Task | Duration | Dependencies |
|------|----------|--------------|
| Step 1: Schema Audit | 1 hour | Supabase MCP access |
| Step 2: Migrations | 2 hours | Step 1 |
| Step 3: TypeScript Types | 1 hour | Step 2 |
| Step 4: Geolocation | 2 hours | Step 3 |
| Step 5: Region Switcher UI | 2 hours | Step 4 |
| Step 6: Update Queries | 2 hours | Step 5 |
| Step 7: Routing Updates | 1 hour | Step 6 |
| Step 8: Testing | 2 hours | Step 7 |
| **TOTAL** | **13 hours** | Sequential |

Add 2-3 hours buffer = **15-16 hours total**

---

## Prerequisites Before Starting

- [x] Phase 4 complete (clean structure, path-based i18n)
- [ ] Supabase MCP configured and working
- [ ] Supabase project ID known
- [ ] Backup of production database
- [ ] Vercel project configured for geo headers
- [ ] Git commit before starting (clean working tree)

---

## Ready to Execute?

**DO NOT START until Phase 4 is 100% complete!**

Phase 5 builds on top of a clean, well-structured codebase. Trying to implement multi-region on top of messy structure will create technical debt that's hard to fix later.

**Execute in this order:**
1. Phase 4: Clean structure + i18n routing ← **DO THIS FIRST**
2. Phase 5: Multi-region backend ← **THEN THIS**
3. Phase 6+: Performance, SEO, analytics ← **THEN THESE**
