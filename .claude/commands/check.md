# Quality Gates

Run all quality checks to ensure code meets Driplo standards.

## Essential Checks (Must Pass)

```bash
# TypeScript - Zero errors tolerance
pnpm -w turbo run check-types

# ESLint - Zero errors tolerance
pnpm -w turbo run lint

# Tests - All must pass
pnpm -w turbo run test
```

## Additional Checks

```bash
# Format code
pnpm -w turbo run format

# Build check
pnpm -w turbo run build

# Accessibility check (if available)
pnpm -w turbo run test:a11y
```

## Mobile Testing

1. Open Chrome DevTools
2. Set viewport to 375x667 (iPhone SE)
3. Test core flows:
   - [ ] Homepage loads quickly
   - [ ] Product listing works
   - [ ] Search functionality
   - [ ] Navigation responsive

## Performance Checks

- [ ] Lighthouse mobile score ≥ 90
- [ ] LCP ≤ 1.5s on mobile
- [ ] No console errors
- [ ] All images optimized

## Code Quality Standards

- [ ] No `any` types in TypeScript
- [ ] Svelte 5 runes only (no legacy syntax)
- [ ] Server-first load functions
- [ ] Proper error handling
- [ ] Mobile-first responsive design

## Before Commit

1. All quality checks pass
2. Mobile viewport tested
3. No TypeScript errors
4. No ESLint errors
5. All tests pass

## Troubleshooting

- **TypeScript errors**: Check `TECHNICAL.md` for patterns
- **Lint errors**: Run `pnpm -w turbo run lint --fix`
- **Test failures**: Check test output and fix issues
- **Performance issues**: Review `DEVELOPER.md` performance section