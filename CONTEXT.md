# Session Context & Memory

**Project:** Driplo (mobile-first C2C marketplace)
**Current Phase:** Pre-production cleanup → V1 launch
**Last Updated:** 2025-01-13

## 🎯 Current Focus

**Main Goal:** Drive TypeScript errors from 71 → 0, eliminate Svelte 4 legacy syntax

**Current Status:**
- 85% feature complete
- Performance: 820ms LCP (excellent)
- Major blocker: 71 TypeScript errors
- Need: Svelte 5 runes migration completion

## 📋 Session Memory

### What We Just Did
- **Massive doc cleanup**: 72 files → 5 core files (93% reduction)
- **CLAUDE.md optimization**: 200+ → 49 lines for faster context loading
- **Created task management system**: TASKS.md for active work tracking

### Current Issues We're Tracking
1. **TypeScript Errors (Priority 1)**
   - Import path confusion (`@repo/ui` vs relative)
   - `any` types need proper type guards
   - Server vs client import violations

2. **Svelte 4 Legacy Syntax (Priority 2)**
   - Still finding `export let`, `$:`, `on:click` patterns
   - Need systematic replacement with Svelte 5 runes

3. **UI Component Duplication**
   - Multiple components not following "Rule of 2"
   - Need promotion to `@repo/ui`

### Key Decisions Made
- ✅ Keep extracted docs vs referencing massive llms.txt
- ✅ Focus on 5 core files for Claude Code optimization
- ✅ Use TASKS.md for active work, CONTEXT.md for memory
- ✅ Mobile-first development (375px viewport always)

## 🛠️ Working Knowledge

### Tech Stack Reminders
- **Frontend:** Svelte 5 (runes only) + SvelteKit 2 + TypeScript strict
- **Styling:** Tailwind v4 with CSS variables
- **Backend:** Supabase (Postgres + Auth + Storage)
- **Monorepo:** Turborepo with `@repo/ui`, `@repo/utils`, etc.

### Key Commands
```bash
# Quality gates (must pass)
pnpm -w turbo run check-types  # 0 errors required
pnpm -w turbo run lint         # 0 errors required
pnpm -w turbo run test         # all pass required

# Development
pnpm dev --filter web          # Start dev server
```

### Import Patterns (Critical)
```ts
// ✅ CORRECT
import { Button } from '@repo/ui'
import { formatCurrency } from '@repo/utils'
import { supabase } from '$lib/supabase'

// ❌ WRONG
import { Button } from '../../../packages/ui/src/lib/Button.svelte'
```

### Svelte 5 Patterns (Critical)
```svelte
<!-- ✅ CORRECT -->
<script lang="ts">
  let count = $state(0)
  let doubled = $derived(count * 2)
  let { title, onclick }: Props = $props()
</script>
<button {onclick}>{title}: {count}</button>

<!-- ❌ WRONG -->
<script>
  export let title
  $: doubled = count * 2
</script>
<button on:click={onclick}>{title}: {count}</button>
```

## 🔄 Workflow Context

### When Starting New Session
1. **Read TASKS.md first** - see what's actively being worked on
2. **Check CONTEXT.md** - understand recent decisions and current state
3. **Reference TECHNICAL.md** - for specific Svelte 5/TypeScript patterns
4. **Use DEVELOPER.md** - for architecture and setup info

### When Adding Tasks
- Add to TASKS.md under appropriate priority
- Update CONTEXT.md with any important decisions
- Keep tasks actionable and specific

### When Working on Code
- Always test mobile-first (375px)
- Run quality gates before committing
- Follow import patterns and Svelte 5 syntax strictly
- Update TASKS.md progress as you work

## 📝 Notes & Reminders

- **Claude Code tip:** Use `/setup`, `/check`, `/debug` commands from `.claude/commands/`
- **Performance target:** LCP ≤ 1.5s mobile (currently 820ms = excellent)
- **Architecture:** SSR-first, progressive enhancement, mobile-first
- **Quality:** Zero tolerance for TypeScript errors, accessibility AA compliance

## 🧠 Memory Refresh

If you're starting fresh and need context:
1. We're building a mobile-first C2C marketplace (beating Depop/Vinted)
2. Built with Svelte 5 + SvelteKit 2 + TypeScript strict mode
3. Currently in pre-production cleanup phase
4. Main blockers: TypeScript errors + legacy Svelte 4 syntax
5. Goal: V1 launch with <1.5s mobile LCP and zero errors

---

**💡 Pro tip:** When Claude asks what to work on, just say "check TASKS.md" and he'll know exactly where to start!