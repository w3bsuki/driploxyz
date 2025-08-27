# 🤖 CLAUDE.md - AI Development Context

*Mobile-first C2C clothing marketplace beating Vinted/Depop with superior UX*

## 🎯 **CORE PRINCIPLES**

### Think Before Acting
1. **Read docs first**: PROJECT.md → DEVELOPMENT.md → ROADMAP.md
2. **Use MCP tools**: `mcp__svelte-docs`, `mcp__supabase` before implementing
3. **Mobile-first always**: 375px viewport, 44px touch targets
4. **Verify everything**: Test → Check types → Build → Verify

### Brutal Honesty
- Say "I don't know" rather than guess
- Ask for clarification when uncertain
- Flag overengineering immediately
- Admit mistakes and fix them

## 📱 **MOBILE-FIRST RULES**

### Touch Targets
```css
Primary actions: 44px (11 * 4px grid)
Secondary actions: 36px minimum
Spacing between: 8px minimum
```

### Performance Targets
- LCP <2s mobile (current: 820ms ✅)
- Bundle <200KB initial
- Images lazy loaded
- Code split by route

### Testing Viewport
- Always start: 375x667 (iPhone SE)
- Test up to: 428x926 (iPhone Pro Max)
- Then desktop: 1920x1080

## 🛠 **DEVELOPMENT WORKFLOW**

### Quality Gates (MUST PASS)
```bash
pnpm check-types      # 0 errors required
pnpm lint            # 0 warnings
svelte-check         # No Svelte errors
pnpm build:web       # Successful build
```

### Commit Standards
```bash
feat: new feature
fix: bug fix
perf: performance improvement
docs: documentation only
refactor: code restructuring
test: test additions
```

## 🎨 **DESIGN SYSTEM**

### Colors (OKLCH ONLY)
```css
--primary: oklch(60% 0.2 250);
--surface: oklch(98% 0.01 250);
--text: oklch(10% 0.02 250);
/* NEVER use hex colors */
```

### Spacing (4px grid)
```css
spacing-1: 4px;
spacing-2: 8px;
spacing-3: 12px;
spacing-4: 16px;
/* Always multiples of 4 */
```

### Typography
```css
Base: 16px (prevents mobile zoom)
Scale: 1.25 (Major third)
Line height: 1.5 for body
```

## ⚡ **SVELTE 5 PATTERNS**

### Always Use Runes
```svelte
<!-- ✅ CORRECT -->
let count = $state(0);
let doubled = $derived(count * 2);

<!-- ❌ WRONG -->
let count = 0;
$: doubled = count * 2;
```

### Component Props
```typescript
interface Props {
  product: Product;
  variant?: 'card' | 'list';
}

let { product, variant = 'card' }: Props = $props();
```

## 🔥 **FORBIDDEN PRACTICES**

### Never Do
- Desktop-first CSS (no max-width media queries)
- Hex colors (breaks design system)
- Touch targets <36px (accessibility fail)
- Any TypeScript errors (blocks deployment)
- Guess Supabase schemas (use mcp__supabase)
- Create files without need (prefer editing)
- Ship features without mobile testing

### Always Do
- Test at 375px width first
- Use OKLCH color space
- Implement 44px primary touch targets
- Run type checking before commits
- Use MCP tools for API queries
- Follow existing code patterns
- Maintain <2s mobile loading

## 🚀 **PROJECT CONTEXT**

### What We're Building
**Driplo**: Mobile-first C2C clothing marketplace
**Mission**: Beat Depop/Vinted with superior mobile UX
**Stack**: Svelte 5 + SvelteKit 2 + Supabase + Stripe

### Current Status
- 85% feature complete
- 71 TypeScript errors blocking production
- LCP: 820ms (excellent)
- Ready for cleanup and optimization

### Key Files
- **PROJECT.md**: Complete project specification
- **DEVELOPMENT.md**: Dev workflow and standards
- **ROADMAP.md**: Priorities and technical debt
- **OPERATIONS.md**: Deployment and monitoring

## ✅ **SUCCESS METRICS**

Technical:
- 0 TypeScript errors
- <2s mobile LCP
- 44px touch targets
- OKLCH colors only

Business:
- Faster than Vinted/Depop
- Higher conversion rate
- Better mobile retention

---

*Mobile-first or nothing. Every pixel matters at 375px.*