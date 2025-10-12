# GitHub Copilot CLI Agent - Testing & Validation Prompt

**Mission:** Validate Phase 5 implementation through manual testing and monitoring  
**Agent Type:** GitHub Copilot CLI (Terminal-based, **NO MCP ACCESS**)  
**Workspace:** `K:\driplo-turbo-1`  
**Prerequisites:** Phase 4E complete + Paraglide middleware migration done  
**Coordination:** Working in parallel with Copilot Chat (backend implementation via MCPs)

---

## 🎯 Your Objective

**PRIMARY GOAL:**  
Validate multi-region architecture through comprehensive manual testing. Ensure UK users see only UK listings, BG users see only BG listings, and all locale combinations work correctly.

**SCOPE:**  
- Manual browser testing (region filtering)
- Language switching validation (/en ↔ /bg)
- Production build testing
- Type checking and linting
- Performance monitoring
- Integration validation

**OUT OF SCOPE (handled by Chat agent via MCPs):**
- Database migrations (Chat uses Supabase MCP)
- Backend code implementation (Chat uses Svelte MCP for patterns)
- API endpoint updates (Chat uses Supabase MCP)
- Security audits (Chat uses Supabase MCP advisors)

---

## 📋 Context You Need

### Current Architecture:
- **Monorepo:** Turborepo with pnpm workspaces
- **App:** SvelteKit 2.18.x + Svelte 5 runes
- **Database:** Supabase PostgreSQL
- **Packages:**
  - `@repo/database` — Supabase client
  - `@repo/core` — Business logic utilities
  - `@repo/i18n` — Paraglide translations (1829 keys)
  - `@repo/ui` — UI primitives
- **i18n:** Paraglide-JS v2.2.0 with official middleware
- **Locales:** `en` (English), `bg` (Bulgarian)
- **Regions:** `uk` (United Kingdom), `bg` (Bulgaria)

### Key Files You'll Work With:
```
apps/web/
├── src/
│   ├── lib/
│   │   └── server/
│   │       ├── db.ts                    # Database queries
│   │       ├── region-detection.ts      # NEW: Create this
│   │       └── hooks.ts                 # Middleware stack
│   └── routes/
│       └── api/
│           └── listings/
│               └── +server.ts           # API endpoint to update
packages/
├── database/
│   └── src/
│       └── supabase.ts                  # Supabase client config
└── core/
    └── src/
        └── region.ts                    # NEW: Create this (if needed)
```

### Database Schema (Current):
```sql
-- Main tables (simplified)
listings (
  id UUID PRIMARY KEY,
  title TEXT,
  description TEXT,
  price NUMERIC,
  user_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
  -- MISSING: region column (you'll add this)
)

users (
  id UUID PRIMARY KEY,
  email TEXT,
  -- MISSING: preferred_region column (optional)
)
```

---

## 🛠️ Your Tasks

### **Phase 1: Environment Setup & Baseline Testing (15 min)**

#### Task 1.1: Start Dev Server & Verify Current State
**Goal:** Establish baseline before Phase 5 changes

**Steps:**
1. Open PowerShell terminal
2. Navigate to workspace: `cd K:\driplo-turbo-1`
3. Start dev server: `pnpm dev`
4. Wait for server to start (usually ~10-30 seconds)
5. Open browser to `http://localhost:5173/en`
6. Verify homepage loads without errors

**Expected Output:**
```powershell
  VITE v7.1.7  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Browser Console Should Show:**
```
✅ No red errors
✅ Paraglide initialized
✅ Translations loaded
```

#### Task 1.2: Test Current Translation System
**Goal:** Validate Phase 4E Paraglide implementation

**Steps:**
1. On `/en` route, verify English translations
2. Navigate to `/bg` route
3. Verify Bulgarian translations load
4. Check console for any translation warnings
5. Document current behavior (baseline)

**Expected Results:**
```
✅ /en shows English content
✅ /bg shows Bulgarian content
✅ Language switching works
✅ No console errors
```

#### Task 1.3: Run Type Checking (Baseline)
**Goal:** Establish TypeScript baseline before changes

**Steps:**
```powershell
pnpm exec tsc --noEmit
```

**Expected Output:**
```
✅ No TypeScript errors (or document existing errors)
```

**Note:** Document any existing errors so we know what's new vs. old

#### Task 5A.2: Seed Existing Listings with Region Data
**Goal:** Populate region column for existing listings

**Options:**
1. **Option A (Simple):** Set all existing listings to `uk`
   ```sql
   UPDATE listings SET region = 'uk' WHERE region IS NULL;
   ```

2. **Option B (Smart):** Detect region from user IP or location if available
   ```sql
   UPDATE listings l
   SET region = CASE 
     WHEN u.country_code = 'BG' THEN 'bg'
     ELSE 'uk'
   END
   FROM users u
   WHERE l.user_id = u.id;
   ```

**Decision:** Ask user which approach to use, or default to Option A.

**Expected Output:**
```
✅ X listings updated with region='uk'
✅ Y listings updated with region='bg'
```

#### Task 5A.3: Add Region Column to Users Table (Optional)
**Goal:** Store user's preferred region

**Migration:**
```sql
-- Migration: add_region_to_users
ALTER TABLE users
ADD COLUMN preferred_region TEXT DEFAULT 'uk'
CHECK (preferred_region IN ('uk', 'bg'));
```

**Ask user:** Should we track user preferred region? (Yes/No)

---

### **Phase 2: Monitor Chat Agent's Backend Implementation (Ongoing)**

#### Task 2.1: Watch for Chat Agent Announcements
**Goal:** Stay synchronized with backend changes

**What to Watch For:**

**Announcement 1: "🔄 Migration applied"**
- **When:** Chat completes database migration
- **Your Action:**
  1. Restart dev server: `Ctrl+C` then `pnpm dev`
  2. Wait for server to restart
  3. Check terminal for database connection errors
  4. Reply: "✅ Dev server restarted, no errors"

**Announcement 2: "🔄 Region detection implemented"**
- **When:** Chat creates region-detection.ts
- **Your Action:**
  1. Verify dev server still running (no need to restart)
  2. Prepare browser for cookie testing
  3. Reply: "✅ Ready for region testing"

**Announcement 3: "🔄 Query filtering complete"**
- **When:** Chat updates all database queries
- **Your Action:**
  1. Restart dev server: `Ctrl+C` then `pnpm dev`
  2. Prepare for comprehensive region testing
  3. Reply: "✅ Dev server restarted, ready to test filtering"

#### Task 2.2: Monitor Terminal Output
**Goal:** Catch errors early during Chat's implementation

**What to Monitor:**
```
✅ No "Module not found" errors
✅ No TypeScript compilation errors
✅ No Vite warnings (should stay quiet)
✅ No Supabase connection errors
```

**If You See Errors:**
1. Copy full error message
2. Announce to Chat: "🔴 Error detected: [paste error]"
3. Wait for Chat to fix before proceeding

#### Task 5B.2: Integrate Region Detection in Middleware
**File:** `apps/web/src/lib/server/hooks.ts`

**Goal:** Detect region and attach to `event.locals` for all requests

**Changes:**
```typescript
// Add to hooks.ts
import { detectRegion, type Region } from './region-detection';

// Update locals type (if not already done)
declare global {
  namespace App {
    interface Locals {
      region: Region;
      // ... other locals
    }
  }
}

// Create region handler
const regionHandler: Handle = async ({ event, resolve }) => {
  event.locals.region = detectRegion(event);
  return resolve(event);
};

// Update sequence
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

**Expected Output:**
```
✅ Updated: hooks.ts with regionHandler
✅ Type: event.locals.region available globally
✅ Order: regionHandler runs after auth, before country detection
```

---

### **Phase 5C: Query Filtering (DATABASE QUERIES)**

#### Task 5C.1: Update Listing Queries to Filter by Region
**Files to Update:**
- `apps/web/src/lib/server/db.ts`
- `apps/web/src/routes/api/listings/+server.ts`
- Any route that loads listings

**Example Changes:**

**Before:**
```typescript
// apps/web/src/lib/server/db.ts
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
export async function getListings(region: Region) {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('region', region) // ← FILTER BY REGION
    .order('created_at', { ascending: false });

  return { data, error };
}
```

**Expected Output:**
```
✅ Updated: getListings() with region parameter
✅ Updated: getFeaturedListings() with region filter
✅ Updated: searchListings() with region filter
✅ Verified: All listing queries filter by region
```

#### Task 5C.2: Update API Endpoints
**File:** `apps/web/src/routes/api/listings/+server.ts`

**Changes:**
```typescript
// Before
export async function GET() {
  const listings = await getListings();
  return json(listings);
}

// After
export async function GET({ locals }) {
  const listings = await getListings(locals.region);
  return json(listings);
}
```

**Expected Output:**
```
✅ Updated: API endpoints use locals.region
✅ Verified: All endpoints respect region filtering
```

#### Task 5C.3: Update Page Load Functions
**Files:** `apps/web/src/routes/+page.server.ts` (and other pages loading listings)

**Changes:**
```typescript
// Before
export async function load() {
  const listings = await getListings();
  return { listings };
}

// After
export async function load({ locals }) {
  const listings = await getListings(locals.region);
  return { listings };
}
```

**Expected Output:**
```
✅ Updated: +page.server.ts with region parameter
✅ Updated: All page load functions use locals.region
```

---

### **Phase 3: Region Filtering Validation (CRITICAL)**

#### Task 3.1: Test Region Cookie Functionality
**Goal:** Verify region detection via cookies works

**Steps:**
1. Open browser to `http://localhost:5173/en`
2. Open DevTools → Application → Cookies
3. Add cookie:
   - Name: `region-override`
   - Value: `uk`
   - Domain: `localhost`
   - Path: `/`
4. Reload page
5. Verify listings displayed (should be UK listings only)
6. Change cookie value to `bg`
7. Reload page
8. Verify listings change (should be BG listings only)

**Expected Results:**
```
✅ Cookie `region-override=uk` shows UK listings
✅ Cookie `region-override=bg` shows BG listings
✅ Listings differ between regions
✅ No console errors
```

**How to Verify Listings Differ:**
- Count number of listings shown
- Note specific listing titles/locations
- Compare UK vs BG results (should be different sets)

**If Listings Don't Change:**
1. Check browser console for errors
2. Verify cookie is set correctly
3. Check Network tab for API requests
4. Report to Chat: "🔴 Region filtering not working"

#### Task 5D.2: Create Region Switching Endpoint (Optional)
**File:** `apps/web/src/routes/api/region/+server.ts`

**Goal:** Allow users to manually switch regions for testing

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
✅ Users can switch regions via POST request
✅ Cookie persists region choice
```

---

## 🔧 Tools You'll Use

### Primary Tools: Terminal Commands (PowerShell)

**Development Server:**
```powershell
# Start dev server
pnpm dev

# Stop server
Ctrl+C

# Restart server
Ctrl+C; pnpm dev
```

**Build & Validation:**
```powershell
# Type checking
pnpm exec tsc --noEmit

# Linting
pnpm lint

# Production build
pnpm build

# Build specific workspace
pnpm --filter=web build
```

**Testing Commands:**
```powershell
# Run tests (if configured)
pnpm test

# Check all workspaces
pnpm -r lint
```

### Browser Testing Tools:

**DevTools:**
- **Console:** Monitor for errors, warnings, logs
- **Network:** Check API requests, response times
- **Application → Cookies:** Set `region-override` cookie
- **Performance:** Lighthouse audits

**Manual Testing:**
- Navigate to `http://localhost:5173/en`
- Navigate to `http://localhost:5173/bg`
- Switch between locales
- Set cookies to test region filtering

---

## 🚫 What NOT to Touch

**Leave to Copilot Chat Agent (has MCP access):**
- Database schema (Chat uses Supabase MCP)
- Server-side code (`apps/web/src/lib/server/`)
- API endpoints (`+server.ts` files)
- Backend logic implementations
- Security configurations

**Your Role is TESTING ONLY:**
- ✅ Run commands in terminal
- ✅ Open browser and navigate
- ✅ Set cookies in DevTools
- ✅ Observe results
- ✅ Report findings to Chat agent
- ❌ DO NOT edit code files (Chat handles all code changes)

---

## 📊 Success Criteria

### Phase 5 Complete When:
- ✅ Database migration applied (`region` column exists)
- ✅ Region detection logic implemented and working
- ✅ All listing queries filter by region
- ✅ UK users see UK listings only (verified)
- ✅ BG users see BG listings only (verified)
- ✅ Logs show filtered SQL queries
- ✅ No TypeScript errors
- ✅ Dev server running without warnings
- ✅ Security advisors pass (RLS policies reviewed)

### Deliverables:
1. **Migration Files:**
   - `add_region_to_listings.sql` (applied)
   - `add_region_to_users.sql` (if user chooses)

2. **New Files:**
   - `apps/web/src/lib/server/region-detection.ts`
   - `apps/web/src/routes/api/region/+server.ts` (optional)

3. **Updated Files:**
   - `apps/web/src/lib/server/hooks.ts` (region middleware)
   - `apps/web/src/lib/server/db.ts` (query filtering)
   - All page load functions (`+page.server.ts` files)
   - API endpoints (`+server.ts` files)

4. **Documentation:**
   - `PHASE_5_IMPLEMENTATION_SUMMARY.md` (what you did, how to test)

---

## 🔄 Coordination with Copilot Chat

### Handoff Points:
1. **AFTER Task 5A (Migration):** Tell Chat agent region column is ready
2. **AFTER Task 5B (Detection):** Tell Chat agent to test in browser
3. **AFTER Task 5C (Filtering):** Tell Chat agent to verify UI displays correct listings
4. **AFTER Task 5D (Testing):** Both agents verify integration works end-to-end

### Communication:
- Use comments in code to mark coordination points
- Update shared doc: `PARALLEL_EXECUTION_STATUS.md`
- Tag Chat agent when backend changes affect frontend

---

## 🚀 Execution Order

1. **START:** Read current database schema with `mcp_supabase_list_tables`
2. **Phase 5A:** Apply migrations, seed data
3. **Phase 5B:** Create region detection logic, update middleware
4. **Phase 5C:** Update all database queries and API endpoints
5. **Phase 5D:** Test region filtering, verify logs
6. **FINISH:** Create summary document, notify Chat agent

---

## 💡 Tips for Success

### Do:
- ✅ Use Supabase MCP for ALL database operations
- ✅ Test each migration before proceeding
- ✅ Check logs frequently with `mcp_supabase_get_logs`
- ✅ Run security advisors after schema changes
- ✅ Ask user for confirmation before major migrations

### Don't:
- ❌ Don't modify UI components (Chat's job)
- ❌ Don't run migrations without user confirmation
- ❌ Don't skip testing region detection logic
- ❌ Don't forget to update TypeScript types

### If Stuck:
1. Check Supabase logs: `mcp_supabase_get_logs`
2. Verify schema: `mcp_supabase_list_tables`
3. Ask user for clarification
4. Coordinate with Chat agent if frontend issues arise

---

## 📝 Example Workflow

```bash
# 1. Check current schema
turbo query "query { packages { name } }"

# 2. Apply migration
# (via Supabase MCP)

# 3. Create region detection
# (create_file region-detection.ts)

# 4. Update middleware
# (replace_string_in_file hooks.ts)

# 5. Update queries
# (grep_search + replace_string_in_file)

# 6. Test
pnpm dev
# Check logs, verify filtering

# 7. Document
# Create PHASE_5_IMPLEMENTATION_SUMMARY.md
```

---

**🎯 READY TO START!**

**First Command:** Ask user which migration strategy to use for existing listings (Option A: all UK, or Option B: smart detection).

**Then:** Begin Phase 5A.1 with `mcp_supabase_apply_migration`.

**Good luck! 🚀**
