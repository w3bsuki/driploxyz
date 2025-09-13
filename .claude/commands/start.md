# Start Working Session

Quick command to get oriented and start productive work.

## Session Kickoff

```bash
# 1. Check what's currently being worked on
echo "📋 Current Tasks:"
cat TASKS.md | grep -A 5 "High Priority"

# 2. Get recent context
echo "🧠 Recent Context:"
cat CONTEXT.md | grep -A 10 "Current Focus"

# 3. Quick health check
echo "🔧 Project Health:"
pnpm -w turbo run check-types | head -5
echo "TypeScript status: $(pnpm -w turbo run check-types 2>&1 | grep -c 'error' || echo '0') errors"
```

## Typical Session Flow

1. **Get oriented**: Read `TASKS.md` → Check `CONTEXT.md`
2. **Pick a task**: From High Priority section
3. **Make changes**: Follow patterns in `TECHNICAL.md`
4. **Test**: Mobile-first (375px), run quality checks
5. **Update tracking**: Mark progress in `TASKS.md`

## Common Starting Points

### "What should I work on?"
→ Check `TASKS.md` High Priority section

### "I need to understand the codebase"
→ Read `CONTEXT.md` then `DEVELOPER.md`

### "How do I do X in Svelte 5?"
→ Check `TECHNICAL.md` for patterns

### "What are the business requirements?"
→ Check `PRODUCT.md`

## Quick Fixes to Jump Into

- TypeScript errors: `pnpm -w turbo run check-types` then fix
- Legacy Svelte syntax: Search for `export let`, `$:`, `on:click`
- Import issues: Look for relative imports, change to `@repo/ui`
- Mobile UX: Test at 375px viewport

## Update Workflow

**After completing any task:**
1. Update `TASKS.md` (check off completed items)
2. Add any new discoveries to `CONTEXT.md`
3. Run quality checks: `/check`