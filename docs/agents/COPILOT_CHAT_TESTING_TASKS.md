# Copilot Chat Agent - Full-Stack Implementation (with MCP Access)

**Mission:** Implement Phase 5 multi-region architecture using MCP servers  
**Agent Type:** GitHub Copilot Chat (VS Code extension with **Supabase MCP, Svelte MCP, Context7 MCP**)  
**Workspace:** `K:\driplo-turbo-1`  
**Prerequisites:** Phase 4E complete + Paraglide middleware migration done  
**Coordination:** Working in parallel with GitHub Copilot CLI (manual testing & validation)

---

## 🎯 Your Objective

**PRIMARY GOAL:**  
Implement complete multi-region backend architecture (UK vs BG separation) using MCP servers for database operations, best practices, and implementation guidance.

**SCOPE (You have MCP access!):**
- ✅ **Database migrations** (via Supabase MCP)
- ✅ **Region detection logic** (guided by Svelte MCP best practices)
- ✅ **Query filtering** (via Supabase MCP)
- ✅ **API endpoint updates** (with MCP guidance)
- ✅ **Security audit** (via Supabase MCP advisors)
- ✅ **Best practices implementation** (via Context7 MCP for patterns)

**OUT OF SCOPE (handled by CLI agent):**
- Manual browser testing (CLI opens browser)
- Performance monitoring (CLI uses DevTools)
- Cookie testing (CLI sets cookies manually)
- Production build validation (CLI runs `pnpm build`)

---

## 📋 Context You Need

### Current Status:
- ✅ Paraglide-JS v2.2.0 integrated with official middleware
- ✅ Vite serving warnings FIXED (no more spam!)
- ✅ Translation keys: 1829 total (en: 1824, bg: 1839)
- ✅ Dev server running: `http://localhost:5173/`
- ✅ Locales: `/en` (English), `/bg` (Bulgarian)
- ✅ Middleware: `paraglideMiddleware` active, `deLocalizeUrl` in reroute hook
- ✅ Import path fixes: SocialLinksEditor + PayoutMethodSelector corrected

### What Was Just Fixed:
1. **Vite Warnings:** Added Paraglide paths to `server.fs.allow` ✅
2. **Middleware:** Migrated to official `paraglideMiddleware` ✅
3. **Reroute Hook:** Using `deLocalizeUrl()` from Paraglide runtime ✅
4. **HTML Template:** Fixed `%lang%` placeholder ✅
5. **Import Paths:** Fixed broken imports in UI components ✅

### What Needs Testing:
1. **Browser Testing:** Verify translations display correctly
2. **Language Switching:** Test `/en` ↔ `/bg` navigation
3. **Console Errors:** Monitor for runtime warnings
4. **SSR/Hydration:** Check for hydration mismatches
5. **Translation Keys:** Verify new banner translations work

---

## 🧪 Your Tasks

### **Task 1: Browser Testing (Paraglide Validation) — 15 min**

#### Task 1.1: Test Homepage Translations
**Goal:** Verify new translation keys display correctly

**Steps:**
1. Navigate to `http://localhost:5173/en`
2. Check banner sections for translations:
   - "Curated picks" (should be `banner_curatedPicks` key)
   - "View All" button (should be `banner_viewAll` key)
   - "New listings" badge (should be `badge_newListings` key)
   - Property type tabs ("Houses", "Apartments", etc.)

3. Verify NO hardcoded English strings remain

**Expected Results:**
```
✅ Banner titles display translations
✅ "View All" button shows translated text
✅ Badges show translated text
✅ No hardcoded "Curated picks" or "View all" visible
```

**If Issues Found:**
- Check `messages/en/*.js` files for key existence
- Verify component props accept translation functions
- Check console for missing key warnings

#### Task 1.2: Test Language Switching
**Goal:** Verify switching between English and Bulgarian works

**Steps:**
1. Start at `http://localhost:5173/en`
2. Switch to Bulgarian: Navigate to `http://localhost:5173/bg`
3. Observe:
   - URL changes to `/bg`
   - Page content updates to Bulgarian
   - No hydration errors in console
   - HTML `lang` attribute updates to `bg`

4. Switch back to English: Navigate to `http://localhost:5173/en`
5. Verify all content reverts to English

**Expected Results:**
```
✅ URL locale changes correctly
✅ Content updates without page reload
✅ HTML lang attribute updates
✅ No console errors during switch
✅ Translations persist across navigation
```

**If Issues Found:**
- Check `paraglideMiddleware` is running
- Verify `deLocalizeUrl` in reroute hook
- Check for hydration mismatches

#### Task 1.3: Test Translation Fallbacks
**Goal:** Verify missing translations fall back gracefully

**Steps:**
1. Navigate to `http://localhost:5173/bg`
2. Check if any keys are missing in Bulgarian:
   - Look for English text appearing in Bulgarian pages
   - Check console for "missing translation" warnings
   - Verify fallback behavior matches expectations

**Expected Results:**
```
✅ Missing translations fall back to English (or key name)
✅ Console warns about missing keys (if any)
✅ No blank spaces where translations should be
```

---

### **Task 2: Monitor Dev Server & Console (Ongoing)**

#### Task 2.1: Check for Runtime Warnings
**Goal:** Ensure no new warnings after Paraglide migration

**Monitor:**
- Browser console for:
  - Svelte warnings
  - Hydration mismatches
  - Paraglide runtime errors
  - Missing translation key warnings

- Terminal (dev server) for:
  - Build errors
  - Module resolution issues
  - Middleware errors

**Expected Results:**
```
✅ No Svelte warnings in console
✅ No hydration mismatches
✅ No Paraglide errors
✅ Dev server stable without crashes
```

**If Issues Found:**
- Document error messages
- Take screenshots
- Report to user for resolution

#### Task 2.2: Performance Check
**Goal:** Ensure Paraglide doesn't degrade performance

**Steps:**
1. Open browser DevTools → Network tab
2. Navigate to homepage
3. Check:
   - Initial page load time
   - Size of Paraglide message files loaded
   - Number of requests

**Expected Results:**
```
✅ Page loads in <2 seconds
✅ Message files are code-split (not all loaded at once)
✅ No large bundle sizes (>500KB)
```

---

### **Task 3: Prepare for Phase 5 Integration (When CLI Agent Ready)**

#### Task 3.1: Monitor Backend Changes
**Goal:** Stay aware of CLI agent's progress

**What to Watch:**
- CLI agent announces: "Migration applied" → Restart dev server
- CLI agent announces: "Region detection ready" → Test in browser
- CLI agent announces: "Filtering complete" → Verify listings change

**Action Items:**
1. When migration applied:
   - Restart dev server: `Ctrl+C`, then `pnpm dev`
   - Check for database connection errors

2. When region detection ready:
   - Test with cookie: Set `region-override=uk` in DevTools
   - Verify listings update based on region

3. When filtering complete:
   - Test UK region shows UK listings only
   - Test BG region shows BG listings only

**Expected Results:**
```
✅ Dev server restarts cleanly after migrations
✅ Region switching works in browser
✅ Listings filter by region correctly
```

#### Task 3.2: Test Region + Locale Combinations
**Goal:** Verify region filtering works with both locales

**Test Matrix:**
| Locale | Region | Expected Behavior |
|--------|--------|-------------------|
| `/en` | UK | UK listings in English |
| `/en` | BG | BG listings in English |
| `/bg` | UK | UK listings in Bulgarian |
| `/bg` | BG | BG listings in Bulgarian |

**Steps:**
1. Set cookie `region-override=uk`
2. Navigate to `/en` → Verify UK listings in English
3. Navigate to `/bg` → Verify UK listings in Bulgarian
4. Change cookie to `region-override=bg`
5. Navigate to `/en` → Verify BG listings in English
6. Navigate to `/bg` → Verify BG listings in Bulgarian

**Expected Results:**
```
✅ All 4 combinations work correctly
✅ Listings update based on region cookie
✅ Translations update based on locale URL
✅ No conflicts between region and locale
```

---

### **Task 4: Quick Fixes & Adjustments (As Needed)**

#### Task 4.1: Fix Minor UI Issues
**Goal:** Address small UI problems discovered during testing

**Examples:**
- Misaligned buttons
- Incorrect spacing
- Missing translations
- Broken links

**Process:**
1. Identify issue during testing
2. Fix immediately if trivial (<5 min)
3. Document if requires more time
4. Coordinate with CLI agent if backend change needed

**Expected Results:**
```
✅ Small issues fixed on-the-spot
✅ Larger issues documented for later
✅ No breaking changes introduced
```

#### Task 4.2: Update Translation Keys (If Needed)
**Goal:** Add missing translation keys discovered during testing

**Steps:**
1. If you find hardcoded text, create translation key
2. Update component to use translation prop
3. Add key to `messages/en/*.json`
4. Add key to `messages/bg/*.json` (or leave blank for fallback)
5. Test in browser

**Example:**
```typescript
// Before
<h2>New listings</h2>

// After
<h2>{m.badge_newListings()}</h2>

// Then add to messages/en/badges.json:
{
  "badge_newListings": "New listings"
}
```

**Expected Results:**
```
✅ New translation keys added
✅ Components use translation functions
✅ Keys exist in both locales
```

---

### **Task 5: Documentation & Reporting (End of Session)**

#### Task 5.1: Create Testing Report
**Goal:** Document what was tested and results

**File:** `PHASE_4E_TESTING_REPORT.md`

**Contents:**
- ✅ What was tested (homepage, language switching, etc.)
- ✅ Issues found (if any)
- ✅ Issues fixed
- ✅ Screenshots (optional)
- ✅ Performance metrics

**Template:**
```markdown
# Phase 4E Testing Report

## Tests Performed
- [x] Homepage translations (EN)
- [x] Homepage translations (BG)
- [x] Language switching (EN ↔ BG)
- [x] Translation fallbacks
- [x] Console errors check
- [x] Performance check

## Results
- ✅ All translations display correctly
- ✅ Language switching works smoothly
- ⚠️ Minor issue: Badge text too small (FIXED)
- ✅ No console errors
- ✅ Page load time: 1.2s

## Issues Found & Fixed
1. Badge text size too small → Increased to text-sm
2. Missing translation for "Featured" → Added key

## Phase 5 Readiness
- ✅ Frontend ready for region filtering integration
- ✅ No blocking issues
```

**Expected Results:**
```
✅ Report created with all test results
✅ User has clear understanding of current state
✅ Issues documented for follow-up
```

---

## 🔧 Tools You'll Use (MCP-Powered!)

### Primary Tools: MCP Servers

**1. Supabase MCP** (Database Operations)
- `mcp_supabase_apply_migration` — Apply database migrations
- `mcp_supabase_execute_sql` — Run SQL queries (data seeding)
- `mcp_supabase_list_tables` — Verify schema changes
- `mcp_supabase_get_logs` — Debug API queries in real-time
- `mcp_supabase_get_advisors` — Security audit (RLS policies)
- `mcp_supabase_list_projects` — Get project details

**2. Svelte MCP** (Best Practices & Patterns)
- `mcp_svelte_get-documentation` — Fetch SvelteKit best practices
- `mcp_svelte_list-sections` — Find relevant docs
- `mcp_svelte_svelte-autofixer` — Validate component patterns

**3. Context7 MCP** (Architecture Patterns)
- `mcp_context7_resolve-library-id` — Find library docs
- `mcp_context7_get-library-docs` — Fetch implementation patterns

### File Operations:
- `create_file` — Create new files (region-detection.ts)
- `replace_string_in_file` — Update existing code
- `read_file` — Read current implementations
- `grep_search` — Find patterns across codebase
- `semantic_search` — Find relevant code sections

---

## 🚫 What NOT to Touch

**Leave to CLI Agent:**
- Database schema files
- `apps/web/src/lib/server/db.ts` (query changes)
- `apps/web/src/lib/server/region-detection.ts` (new file)
- API endpoints (`+server.ts` files with SQL queries)
- Migration files

**Coordinate Before Changing:**
- `apps/web/src/lib/server/hooks.ts` — CLI may be updating this
- Shared types in `@repo/core` — Discuss with CLI agent

---

## 📊 Success Criteria

### Testing Complete When:
- ✅ Homepage translations verified (EN + BG)
- ✅ Language switching tested (both directions)
- ✅ No console errors or warnings
- ✅ Translation fallbacks working
- ✅ Performance acceptable (<2s load time)
- ✅ Dev server stable
- ✅ Testing report created

### Phase 5 Integration Complete When:
- ✅ Region filtering tested with cookie
- ✅ All locale + region combinations work
- ✅ Listings filter correctly by region
- ✅ No conflicts between region and locale
- ✅ End-to-end flow validated

---

## 🔄 Coordination with CLI Agent

### Handoff Points:
1. **DURING CLI Phase 5A (Migration):** Monitor terminal for migration success
2. **DURING CLI Phase 5B (Detection):** Be ready to test region switching
3. **DURING CLI Phase 5C (Filtering):** Test listings change based on region
4. **AFTER CLI Phase 5D (Testing):** Verify end-to-end integration

### Communication:
- Watch terminal for CLI agent's progress updates
- Report frontend issues immediately
- Confirm when testing phases complete
- Tag CLI agent if backend changes cause frontend errors

---

## 🚀 Execution Order

1. **START:** Open browser to `http://localhost:5173/en`
2. **Task 1:** Test translations (homepage, switching, fallbacks)
3. **Task 2:** Monitor console and dev server
4. **Task 3:** (Wait for CLI agent to complete Phase 5)
5. **Task 3:** Test region integration after CLI ready
6. **Task 4:** Fix minor issues discovered during testing
7. **Task 5:** Create testing report
8. **FINISH:** Confirm Phase 4E validated, Phase 5 integrated

---

## 💡 Tips for Success

### Do:
- ✅ Test in both Chrome and Firefox (if possible)
- ✅ Clear browser cache if seeing old content
- ✅ Take screenshots of issues for documentation
- ✅ Test with browser DevTools open (Console + Network tabs)
- ✅ Communicate with user about progress

### Don't:
- ❌ Don't modify backend files (CLI's job)
- ❌ Don't skip testing language switching
- ❌ Don't assume translations work without browser testing
- ❌ Don't restart dev server unnecessarily (wait for CLI migrations)

### If Stuck:
1. Check browser console for errors
2. Verify dev server is running
3. Clear browser cache and retry
4. Ask user for clarification
5. Coordinate with CLI agent if backend-related

---

## 📝 Example Testing Workflow

```bash
# 1. Open browser
Navigate to http://localhost:5173/en

# 2. Test translations
✅ Check banner text
✅ Check "View All" button
✅ Check badges

# 3. Switch language
Navigate to http://localhost:5173/bg
✅ Verify content updates

# 4. Monitor console
✅ No errors
✅ No warnings

# 5. Test performance
DevTools → Network → Reload
✅ Page loads in <2s

# 6. Wait for CLI agent
(CLI announces: "Region detection ready")

# 7. Test region switching
Set cookie: region-override=uk
Reload page
✅ UK listings visible

Set cookie: region-override=bg
Reload page
✅ BG listings visible

# 8. Create report
Create PHASE_4E_TESTING_REPORT.md
```

---

**🎯 READY TO START!**

**First Action:** Open browser to `http://localhost:5173/en` and begin Task 1 (Browser Testing).

**Stay in contact with CLI agent for Phase 5 coordination!**

**Good luck! 🚀**
