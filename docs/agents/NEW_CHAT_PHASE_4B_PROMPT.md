# 🚀 NEW CHAT: Execute Phase 4B - Domain Package Restructure

Hey! I need your help executing **Phase 4B: Domain Package Restructure** for my monorepo.

## 📍 Context

I'm working on `driplo-turbo-1`, a **SvelteKit 2 + Turborepo monorepo** for a fashion marketplace.

**Current Status:**
- ✅ **Phase 4A Complete**: Successfully restructured UI package (174 components organized into primitives/compositions/layouts)
- ✅ Dev server working on http://localhost:5173/
- ✅ All builds passing
- ✅ Git is clean

**What I Need Now:**
Execute **Phase 4B** to restructure the `packages/domain` package, organizing business logic by domain boundaries (cart, products, auth, orders, users, payments).

## 📋 Your Task

**Read and execute the plan in `PHASE_4B_FRESH_START_PROMPT.md`**

This file contains:
- Complete 13-step execution checklist
- Lessons learned from Phase 4A (what worked, what to avoid)
- PowerShell script templates
- Success criteria
- Critical rules to follow

## ⚡ Quick Start

1. Read `K:\driplo-turbo-1\PHASE_4B_FRESH_START_PROMPT.md` in full
2. Follow the 13-step checklist exactly
3. Use PowerShell scripts for import fixes (NOT manual edits)
4. Test dev server BEFORE deleting old files
5. Commit only when everything works

## 🎓 Key Lessons from Phase 4A

**What worked perfectly:**
- Creating import mapping JSON before moving files
- Copying files first (keeping old as backup)
- Using PowerShell scripts for systematic import fixes
- Testing dev server before cleanup
- One commit at the end

**What NOT to do:**
- ❌ Manual import fixes (too error-prone)
- ❌ Deleting old files before testing
- ❌ Skipping dev server test
- ❌ Multiple commits during execution

## 🎯 Expected Outcome

After Phase 4B, the domain package should look like:

```
packages/domain/
├── src/
│   ├── cart/          # Cart business logic
│   ├── products/      # Product business logic  
│   ├── auth/          # Auth business logic
│   ├── orders/        # Order business logic
│   ├── users/         # User business logic
│   ├── payments/      # Payment business logic
│   └── shared/        # Shared domain utilities
├── package.json       # With updated exports
└── tsconfig.json
```

All imports across the monorepo should be updated from:
```typescript
// Old
import { CartService } from '@repo/domain/cart-service';

// New  
import { CartService } from '@repo/domain/cart';
```

## ✅ Success Criteria

- Domain package organized by boundaries
- All imports fixed across monorepo
- package.json exports updated
- Domain package builds
- Monorepo builds
- **Dev server runs without errors** ← CRITICAL
- Old files deleted after testing
- Changes committed to git

## 🚨 Critical Rules

1. **NEVER delete old files until dev server test passes**
2. **ALWAYS use PowerShell scripts for import fixes**
3. **TEST dev server before claiming completion**
4. **One commit at the end, not during execution**

## 📂 Important Files to Reference

- `PHASE_4B_FRESH_START_PROMPT.md` - Your execution guide (READ THIS FIRST)
- `PHASE_4A_FRESH_START_PROMPT.md` - Learn from Phase 4A's pattern
- `PHASE_4_COMPLETE_RESTRUCTURE.md` - Overall Phase 4 context
- `packages/domain/src/` - Current domain package structure

## 💬 Communication Style

- Ask for clarification if anything is unclear
- Show me your progress as you go
- Tell me when each step is complete
- If something breaks, stop and tell me immediately
- Test frequently during execution

## 🎉 Let's Do This!

Please start by reading `PHASE_4B_FRESH_START_PROMPT.md` and then begin Step 1: Audit Domain Package Structure.

Create a TODO list to track progress through all 13 steps.

Good luck! < 3
