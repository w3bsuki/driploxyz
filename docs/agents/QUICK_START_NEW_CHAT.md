# QUICK START - New Chat Execution

**Status:** 🔴 **COPY THIS INTO NEW CHAT SESSION**  
**Purpose:** Get new chat up to speed FAST

---

## 🎯 COPY THIS ENTIRE MESSAGE

```
I need you to execute a major project cleanup based on a comprehensive audit.

CRITICAL CONTEXT:
- Project score: 45/100 (severe issues found)
- Translation system BROKEN: 20+ hardcoded English strings
- Paraglide v2 NOT optimized: Loading ALL locales for ALL users (bloat)
- Root directory POLLUTED: 63+ markdown/script files
- Architecture WRONG: Business logic in UI package

FILES TO READ IMMEDIATELY:
1. COMPREHENSIVE_PROJECT_AUDIT.md - Full problem analysis
2. CHAT_AGENT_IMPLEMENTATION_GUIDE.md - Your tasks (12-18 hours)
3. CLI_AGENT_FULL_CLEANUP_PROMPT.md - Parallel CLI agent tasks

YOUR ROLE (Chat Agent):
You have Supabase MCP, Svelte MCP, Context7 MCP access.

Phase 1 (6-8h): Translation fixes
- Audit hardcoded strings in UI components
- Create translation keys (en + bg)
- Update badge components to accept translation props
- Validate with mcp_svelte_svelte-autofixer

Phase 2 (8-10h): Paraglide v2 optimization
- Research code splitting strategies (Context7 MCP)
- Implement locale-based tree-shaking
- Add region detection (UK vs BG)
- Reduce bundle size 50%+

Phase 3 (4-6h): Architecture refactoring
- Move business logic from packages/ui to apps/web
- Update all imports
- Coordinate with CLI agent

Phase 4 (2-3h): Package exports
- Define exports in packages/ui/package.json
- Update 50+ imports to clean paths

Phase 5 (1-2h): Type definitions
- Generate .d.ts files
- Ensure intellisense works

CLI AGENT (Parallel execution):
- Root directory cleanup (move 63+ files)
- Script consolidation/deletion
- Manual browser testing
- TypeScript validation
- Database verification

COORDINATION:
- You announce: "🔄 [Task done]"
- CLI responds: "✅ [Confirmation]"
- Wait for confirmation before dependent tasks

MY CHOICE: Option A (Full cleanup - 24-32 hours total)

Please confirm you understand the scope, then let's start Phase 1: Use grep_search to find all hardcoded strings matching "Premium|Coming Soon|Verified|Pro Account|Brand Account" in packages/ui/**/*.svelte
```

---

## 📋 EXPECTED RESPONSE

New chat should:

1. ✅ Confirm reading audit document
2. ✅ Acknowledge severity (45/100 score)
3. ✅ Start with `grep_search` for hardcoded strings
4. ✅ Use `mcp_svelte_get-documentation` for Svelte 5 patterns
5. ✅ Begin Phase 1 execution

---

## ⚠️ IF NEW CHAT ASKS QUESTIONS

**Q: "Should I start or wait for user confirmation?"**
**A:** "Yes, start immediately with grep_search for hardcoded strings"

**Q: "Which option do you want (A, B, or C)?"**
**A:** "Option A - Full cleanup, 24-32 hours"

**Q: "Do you want me to read all files first?"**
**A:** "Yes, read COMPREHENSIVE_PROJECT_AUDIT.md and CHAT_AGENT_IMPLEMENTATION_GUIDE.md"

**Q: "What about the CLI agent?"**
**A:** "CLI agent will execute CLI_AGENT_FULL_CLEANUP_PROMPT.md in parallel. We'll coordinate."

---

## 🚨 RED FLAGS (New chat doing it wrong)

❌ **If new chat says:** "Let me create a plan first"
✅ **You say:** "No, the plan is in CHAT_AGENT_IMPLEMENTATION_GUIDE.md - execute it"

❌ **If new chat says:** "Should we fix the UI package first?"
✅ **You say:** "No, follow the guide: Phase 1 is translation fixes, not UI restructure"

❌ **If new chat says:** "Let me analyze the codebase"
✅ **You say:** "Analysis done in COMPREHENSIVE_PROJECT_AUDIT.md - start executing fixes"

❌ **If new chat creates MORE markdown docs**
✅ **You say:** "STOP. We have 63+ docs already. Execute code changes only."

---

## ✅ SUCCESS INDICATORS (New chat doing it right)

✅ Runs `grep_search` for hardcoded strings
✅ Uses `mcp_svelte_get-documentation` for patterns
✅ Creates translation keys in packages/i18n/messages/*.json
✅ Updates components with `replace_string_in_file`
✅ Validates with `mcp_svelte_svelte-autofixer`
✅ Announces completion: "🔄 Badge components updated"

---

## 📞 EMERGENCY PROMPT (If new chat confused)

```
STOP. Let me clarify:

You are executing PRE-WRITTEN instructions from:
- CHAT_AGENT_IMPLEMENTATION_GUIDE.md (your tasks)

Do NOT:
- Create new plans
- Analyze the codebase again
- Create more documentation
- Ask me what to do

DO:
- Read CHAT_AGENT_IMPLEMENTATION_GUIDE.md
- Execute Phase 1, Task 1.1: grep_search for hardcoded strings
- Follow the guide step-by-step
- Use MCP tools as instructed

Start NOW with: grep_search({ query: "Premium|Coming Soon|Verified", isRegexp: true, includePattern: "packages/ui/**/*.svelte" })
```

---

## 🎯 THAT'S IT

**Just copy the "COPY THIS ENTIRE MESSAGE" section into new chat.**

**New chat will:**
1. Read audit (understand problems)
2. Read guide (understand tasks)
3. Execute Phase 1 (fix translations)
4. Continue through Phase 2-5
5. Coordinate with CLI agent

**Total time: 12-18 hours for Chat agent, 12-16 hours for CLI agent**

**Result: Professional codebase with working translations and optimized performance**

---

**GO!** 🚀
