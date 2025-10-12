# Copilot Chat Agent - Phase 5 Full-Stack Implementation (MCP-Powered)

**Mission:** Implement Phase 5 multi-region architecture using MCP servers  
**Agent Type:** GitHub Copilot Chat (VS Code with **Supabase MCP + Svelte MCP + Context7 MCP**)  
**Workspace:** `K:\driplo-turbo-1`  
**Prerequisites:** Phase 4E complete + Paraglide middleware migration done  
**Coordination:** Working in parallel with GitHub Copilot CLI (manual testing)

---

## 🎯 Your Objective

**PRIMARY GOAL:**  
Implement complete multi-region backend architecture (UK vs BG separation) using MCP servers.

**YOUR RESPONSIBILITIES (You have MCP access!):**
- ✅ Database migrations (Supabase MCP)
- ✅ Region detection logic (Svelte MCP for patterns)
- ✅ Query filtering (Supabase MCP)
- ✅ API endpoint updates
- ✅ Security audit (Supabase MCP advisors)
- ✅ Best practices implementation (Context7 MCP)

**CLI AGENT RESPONSIBILITIES (No MCP access):**
- ✅ Manual browser testing
- ✅ Dev server monitoring
- ✅ Cookie testing
- ✅ Performance validation
- ✅ Production build testing

---

## 🔧 MCP Tools Available

### Supabase MCP
- `mcp_supabase_list_projects` — Get Supabase project ID
- `mcp_supabase_apply_migration` — Apply schema migrations
- `mcp_supabase_execute_sql` — Run SQL queries
- `mcp_supabase_list_tables` — Verify schema
- `mcp_supabase_get_logs` — Debug API queries
- `mcp_supabase_get_advisors` — Security audit (RLS)

### Svelte MCP
- `mcp_svelte_list-sections` — Find relevant docs
- `mcp_svelte_get-documentation` — SvelteKit best practices
- `mcp_svelte_svelte-autofixer` — Validate Svelte code

### Context7 MCP
- `mcp_context7_resolve-library-id` — Find library docs
- `mcp_context7_get-library-docs` — Architecture patterns

---

## 📋 Implementation Tasks

### **Phase 5A: Database Migration (30 min) 🔴 CRITICAL**

#### Task 5A.1: Get Supabase Project ID
```
Tool: mcp_supabase_list_projects
Goal: Identify which project to work with
```

**Expected Output:**
```json
{
  "projects": [
    {
      "id": "abcd1234...",
      "name": "driplo-production",
      "region": "eu-west-1",
      "status": "ACTIVE"
    }
  ]
}
```

**Action:** Note the project_id for all subsequent operations.

---

#### Task 5A.2: Verify Current Schema
```
Tool: mcp_supabase_list_tables
Parameters: { project_id: "..." }
```

**Expected Output:**
```
✅ listings table exists
✅ users table exists
✅ Current columns documented
```

---

#### Task 5A.3: Apply Region Column Migration
**Goal:** Add region column to listings table

**Migration SQL:**
```sql
-- Migration: add_region_to_listings
ALTER TABLE listings 
ADD COLUMN region TEXT NOT NULL DEFAULT 'uk'
CHECK (region IN ('uk', 'bg'));

CREATE INDEX idx_listings_region ON listings(region);
```

**Steps:**
1. Use `mcp_supabase_apply_migration`:
   - **project_id:** (from Task 5A.1)
   - **name:** `add_region_to_listings`
   - **query:** [SQL above]

2. Verify success with `mcp_supabase_list_tables`

**Expected Output:**
```
✅ Migration applied: add_region_to_listings
✅ Column added: listings.region (TEXT)
✅ Index created: idx_listings_region
```

**ANNOUNCE TO CLI:** 
> "🔄 Migration applied - please restart dev server"

**WAIT FOR CLI CONFIRMATION:**
> "✅ Dev server restarted, no errors"

---

#### Task 5A.4: Seed Existing Data
**Goal:** Populate region for existing listings

**Ask User First:** Which strategy?
- **Option A:** Default all to 'uk' (simple, fast)
- **Option B:** Detect from user country (complex, accurate)

**Option A (Recommended):**
```sql
UPDATE listings SET region = 'uk';
```

**Option B (If user wants smart detection):**
```sql
UPDATE listings l
SET region = CASE 
  WHEN (SELECT country_code FROM users u WHERE u.id = l.user_id) = 'BG' THEN 'bg'
  ELSE 'uk'
END;
```

**Steps:**
1. Ask user which option
2. Use `mcp_supabase_execute_sql`:
   - **project_id:** (from Task 5A.1)
   - **query:** [chosen SQL]

3. Verify row count in response

**Expected Output:**
```
✅ 150 listings updated to region='uk'
✅ Data seeding complete
```

---

### **Phase 5B: Region Detection Logic (45 min) 🟡**

#### Task 5B.1: Fetch SvelteKit Best Practices
**Goal:** Learn recommended patterns for request context handling

**Steps:**
1. Use `mcp_svelte_list-sections` to find relevant docs
2. Use `mcp_svelte_get-documentation` with sections:
   - `kit/hooks` — Middleware patterns
   - `kit/load` — Data loading patterns
   - `kit/server-only-modules` — Server-only code

**Expected Output:**
```
✅ SvelteKit middleware patterns documented
✅ event.locals pattern understood
✅ Cookie handling best practices noted
```

---

#### Task 5B.2: Create Region Detection Service
**File:** `apps/web/src/lib/server/region-detection.ts`

**Implementation:**
```typescript
import type { RequestEvent } from '@sveltejs/kit';

export type Region = 'uk' | 'bg';

/**
 * Detect user's region based on multiple factors
 * Priority: Cookie > User Preference > IP Geolocation > Locale Fallback
 */
export function detectRegion(event: RequestEvent): Region {
  // Priority 1: Cookie override (for testing)
  const cookieRegion = event.cookies.get('region-override');
  if (cookieRegion === 'uk' || cookieRegion === 'bg') {
    return cookieRegion;
  }

  // Priority 2: User preference (if authenticated)
  const user = event.locals.user;
  if (user?.preferred_region) {
    return user.preferred_region as Region;
  }

  // Priority 3: Vercel geolocation (x-vercel-ip-country header)
  const countryCode = event.request.headers.get('x-vercel-ip-country');
  if (countryCode === 'BG') {
    return 'bg';
  }

  // Priority 4: Locale fallback
  const locale = event.locals.locale;
  if (locale === 'bg') {
    return 'bg';
  }

  // Default: UK
  return 'uk';
}

/**
 * Set region override cookie for testing
 */
export function setRegionCookie(cookies: any, region: Region): void {
  cookies.set('region-override', region, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
    httpOnly: false // Allow JS access for testing
  });
}
```

**Steps:**
1. Create file with `create_file`
2. Validate with `mcp_svelte_svelte-autofixer` if possible

**Expected Output:**
```
✅ Created: apps/web/src/lib/server/region-detection.ts
✅ Exported: detectRegion() function
✅ Exported: setRegionCookie() helper
✅ Type-safe with TypeScript
```

---

#### Task 5B.3: Update App.Locals Type
**File:** `apps/web/src/app.d.ts` (or wherever App namespace is)

**Add Region Type:**
```typescript
declare global {
  namespace App {
    interface Locals {
      locale: 'en' | 'bg';
      region: Region; // ← ADD THIS
      user?: {
        id: string;
        email: string;
        preferred_region?: Region;
      };
      // ... other locals
    }
  }
}

export type Region = 'uk' | 'bg';
```

**Steps:**
1. Find App.Locals declaration (use `grep_search`)
2. Add `region: Region` field
3. Export Region type

**Expected Output:**
```
✅ Updated: App.Locals interface
✅ Added: region field
✅ Type safety ensured
```

---

#### Task 5B.4: Integrate Region Middleware
**File:** `apps/web/src/lib/server/hooks.ts`

**Changes:**
```typescript
import { detectRegion, type Region } from './region-detection';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

// Create region detection handler
const regionHandler: Handle = async ({ event, resolve }) => {
  event.locals.region = detectRegion(event);
  console.log(`[Region] Detected: ${event.locals.region} for ${event.url.pathname}`);
  return resolve(event);
};

// Update sequence - add regionHandler after auth, before country
export const handle: Handle = sequence(
  debugBypassHandler,
  i18nHandler,
  localeRedirectHandler,
  authHandler,
  csrfGuard,
  regionHandler, // ← ADD THIS
  countryHandler,
  authGuardHandler
);
```

**Steps:**
1. Read current `hooks.ts` with `read_file`
2. Add import for `detectRegion`
3. Create `regionHandler`
4. Add to sequence (use `replace_string_in_file`)

**Expected Output:**
```
✅ Updated: hooks.ts with regionHandler
✅ Middleware order correct
✅ Region attached to event.locals
```

**ANNOUNCE TO CLI:**
> "🔄 Region detection implemented - ready for cookie testing"

**WAIT FOR CLI:**
> "✅ Ready for region testing"

---

### **Phase 5C: Query Filtering (60 min) 🟡**

#### Task 5C.1: Find All Listing Queries
**Goal:** Identify where listings are loaded

**Steps:**
1. Use `grep_search` to find:
   - Pattern: `from('listings')`
   - Pattern: `supabase.*listings`
   - Pattern: `getListings`

2. Document all files that query listings

**Expected Files:**
```
✅ apps/web/src/lib/server/db.ts
✅ apps/web/src/routes/+page.server.ts
✅ apps/web/src/routes/api/listings/+server.ts
✅ ... others
```

---

#### Task 5C.2: Update Database Query Functions
**File:** `apps/web/src/lib/server/db.ts`

**Before:**
```typescript
export async function getListings() {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false });

  return { data, error };
}
```

**After:**
```typescript
import type { Region } from './region-detection';

export async function getListings(region: Region) {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('region', region) // ← FILTER BY REGION
    .order('created_at', { ascending: false });

  return { data, error };
}
```

**Steps:**
1. Read current `db.ts`
2. Update each listing query function to:
   - Accept `region: Region` parameter
   - Add `.eq('region', region)` to query
3. Update all query functions:
   - `getListings()`
   - `getFeaturedListings()`
   - `searchListings()`
   - Any others found in Task 5C.1

**Expected Output:**
```
✅ Updated: getListings() with region parameter
✅ Updated: getFeaturedListings() with region filter
✅ Updated: searchListings() with region filter
✅ All queries filter by region
```

---

#### Task 5C.3: Update API Endpoints
**File:** `apps/web/src/routes/api/listings/+server.ts`

**Before:**
```typescript
export async function GET() {
  const listings = await getListings();
  return json(listings);
}
```

**After:**
```typescript
export async function GET({ locals }) {
  const listings = await getListings(locals.region);
  return json(listings);
}
```

**Steps:**
1. Find all API endpoints that load listings
2. Update to pass `locals.region` to query functions
3. Verify TypeScript types are correct

**Expected Output:**
```
✅ Updated: /api/listings endpoint
✅ Updated: Other API endpoints
✅ All endpoints use locals.region
```

---

#### Task 5C.4: Update Page Load Functions
**File:** `apps/web/src/routes/+page.server.ts` (and others)

**Before:**
```typescript
export async function load() {
  const listings = await getListings();
  return { listings };
}
```

**After:**
```typescript
export async function load({ locals }) {
  const listings = await getListings(locals.region);
  return { listings };
}
```

**Steps:**
1. Find all `+page.server.ts` files that load listings
2. Update to pass `locals.region`
3. Verify all page loads filter by region

**Expected Output:**
```
✅ Updated: Homepage load function
✅ Updated: Search page load function
✅ Updated: Other page load functions
✅ All pages filter by region
```

**ANNOUNCE TO CLI:**
> "🔄 Query filtering complete - please restart dev server and test"

**WAIT FOR CLI:**
> "✅ Dev server restarted, ready to test filtering"

---

### **Phase 5D: Testing & Security (30 min) 🟢**

#### Task 5D.1: Monitor Logs
**Goal:** Verify queries are filtering correctly

**Steps:**
1. Use `mcp_supabase_get_logs`:
   - **project_id:** (from Task 5A.1)
   - **service:** `api`

2. Check logs for:
   - SQL queries include `WHERE region = 'uk'` or `WHERE region = 'bg'`
   - No unfiltered queries

**Expected Output:**
```
✅ Logs show filtered queries
✅ All listing queries include region filter
✅ No unfiltered queries detected
```

---

#### Task 5D.2: Security Audit
**Goal:** Verify RLS policies and security

**Steps:**
1. Use `mcp_supabase_get_advisors`:
   - **project_id:** (from Task 5A.1)
   - **type:** `security`

2. Review advisors for:
   - Missing RLS policies
   - Security vulnerabilities
   - Performance issues

**Expected Output:**
```
✅ RLS policies active on listings table
✅ No critical security issues
✅ All advisors reviewed
```

---

#### Task 5D.3: Create Region Switching Endpoint (Optional)
**File:** `apps/web/src/routes/api/region/+server.ts`

**Implementation:**
```typescript
import { json } from '@sveltejs/kit';
import { setRegionCookie } from '$lib/server/region-detection';

export async function POST({ request, cookies }) {
  const { region } = await request.json();
  
  if (region !== 'uk' && region !== 'bg') {
    return json({ error: 'Invalid region' }, { status: 400 });
  }

  setRegionCookie(cookies, region);
  return json({ success: true, region });
}
```

**Expected Output:**
```
✅ Created: /api/region endpoint
✅ Users can switch regions via POST
✅ Cookie persists selection
```

---

## 🔄 Coordination with CLI Agent

### Communication Protocol:

**When You Announce:**
```
🔄 [What you did]
✅ [Expected CLI action]
```

**Example Announcements:**
1. **After Migration:** "🔄 Migration applied - please restart dev server"
2. **After Region Logic:** "🔄 Region detection implemented - ready for cookie testing"
3. **After Filtering:** "🔄 Query filtering complete - please restart and test all regions"

**Wait for CLI Confirmation:**
- CLI will test in browser
- CLI will report results
- CLI will find bugs (if any)

---

## 📊 Success Criteria

### Phase 5 Complete When:
- ✅ Migration applied (`region` column exists)
- ✅ Region detection working (verified by CLI with cookies)
- ✅ All queries filter by region (verified in logs)
- ✅ CLI confirms UK users see UK listings only
- ✅ CLI confirms BG users see BG listings only
- ✅ Security advisors pass
- ✅ No TypeScript errors
- ✅ Implementation documented

---

## 📝 Final Deliverable

**File:** `PHASE_5_IMPLEMENTATION_SUMMARY.md`

**Contents:**
```markdown
# Phase 5 Implementation Summary

## What Was Done
- Migration: Added region column to listings
- Files Created: region-detection.ts
- Files Updated: hooks.ts, db.ts, +page.server.ts, API endpoints
- Security: RLS policies reviewed

## How to Test
1. Set cookie: region-override=uk
2. Verify UK listings displayed
3. Change to: region-override=bg
4. Verify BG listings displayed

## Migration Details
- Name: add_region_to_listings
- Applied: [timestamp]
- Rows affected: [count]

## Known Issues
- [List any issues or limitations]

## Next Steps
- Deploy to production
- Monitor region detection in live traffic
```

---

**🎯 READY TO START!**

**First Step:** Get Supabase project ID with `mcp_supabase_list_projects`

**Then:** Proceed through phases systematically, coordinating with CLI at each checkpoint.

**Good luck! 🚀**
