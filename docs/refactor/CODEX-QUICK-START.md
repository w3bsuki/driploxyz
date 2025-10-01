# 🚀 CODEX WEB QUICK START PROMPT

Copy everything below this line and paste into Codex Web:

---

You are executing a **solo production refactor** of a SvelteKit 2 + Svelte 5 monorepo with Supabase MCP integration.

**CRITICAL CONTEXT:**
- Repository: `w3bsuki/driploxyz` on branch `codex/audit-codebase-and-create-documentation`
- Workspace root: `k:\driplo-turbo-1`
- Your command center: `docs/refactor/` (read these files FIRST)
- Ticket 1 (Toast Consolidation) is ✅ COMPLETE
- Tickets 2-6 are 🔄 READY TO START

**YOUR MISSION:**
Execute the remaining 5 tickets in this exact order:
1. **Ticket 2:** Service-Role Hardening (HIGH - Security)
2. **Ticket 3:** UI Package Cleanup (HIGH - Code Quality)  
3. **Ticket 4:** Testing Infrastructure (HIGH - QA)
4. **Ticket 5:** Environment Validation (MEDIUM - DevX)
5. **Ticket 6:** Svelte 5 Compliance Audit (MEDIUM - Future-proof)

**REQUIRED READING (in this order):**
1. `docs/refactor/CODEX-WEB-PROMPT.md` ← Full detailed specs for all 5 tickets
2. `docs/refactor/PHASE-2-4-KICKOFF.md` ← Context and ownership matrix
3. `docs/refactor/QUICK-REFERENCE.md` ← Validation commands
4. `docs/refactor/task-board.md` ← Update this as you progress

**WORKFLOW FOR EACH TICKET:**

**Before starting:**
1. Read full ticket spec in `CODEX-WEB-PROMPT.md`
2. Update `task-board.md`: Change status to `🏗️ IN PROGRESS`, add your name
3. Review files you'll be modifying

**During implementation:**
1. Make changes following spec exactly
2. Run tests continuously: `pnpm --filter <package> test`
3. Use MCP for validation: `"@supabase list tables"`, `"@supabase get advisors for security"`
4. Document in `docs/refactor/reports/phase-4-validation-log.md`

**Before committing:**
1. Run full validation gate (from `QUICK-REFERENCE.md`):
   ```bash
   pnpm --filter @repo/i18n build
   pnpm --filter @repo/ui test
   pnpm --filter web test
   pnpm --filter web test:e2e
   pnpm --filter web build
   pnpm --filter web build:metrics
   pnpm -w turbo run lint
   pnpm -w turbo run check-types
   pnpm -w turbo run build
   ```
2. Verify MCP security advisors show no new warnings
3. Update `task-board.md`: Change status to `✅ COMPLETE`
4. Commit with template from `CODEX-WEB-PROMPT.md`

**CRITICAL RULES:**
- TypeScript strict mode: No `any`, no `@ts-ignore` without justification
- Svelte 5 runes only: Use `$state`, `$derived`, `$effect` (not `$:`)
- Event handlers lowercase: `onclick` not `onClick`
- Test everything: Run tests after every file change
- Document everything: Add notes to validation log as you go
- MCP validation: Always check security advisors after backend changes

**SUCCESS METRICS:**
Track these in `phase-4-validation-log.md`:
- [ ] Lines of code removed: Target >1000
- [ ] Bundle size reduction: Target >10%
- [ ] Test coverage increase: Target +20%
- [ ] MCP security warnings: Reduced to 0
- [ ] All validation gates passed

**SUPABASE MCP CONTEXT:**
- Project Ref: `koowfhsaqmarfdkwsfiz`
- Database: 45 tables, 312 migrations
- Security warnings: 3 (Auth OTP, Password protection, Postgres patches)
- Use `@supabase` prefix for all MCP commands in Copilot Chat

**YOUR FIRST ACTION:**
Read `docs/refactor/CODEX-WEB-PROMPT.md` completely, then start with **Ticket 2: Service-Role Hardening**. This ticket unblocks security improvements and has no dependencies.

Update the task board immediately after reading the full prompt to show you're starting Ticket 2.

**REMEMBER:**
- Read before coding (specs are detailed for a reason)
- Test continuously (catch errors early)
- Document everything (humans need to review your work)
- Use MCP (it's your database assistant)
- Small commits (one logical change at a time)

**GO! 🚀**

Start by saying: "I've read the full prompt. Reading ticket specs now from CODEX-WEB-PROMPT.md..."
