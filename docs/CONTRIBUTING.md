# Contributing & PR Checklist

Workflow
- Plan → Implement → Validate → Summarize (update CODEX_TASKLIST)
- Keep diffs small (≤ 400 LOC), single responsibility; conventional commits

Before opening a PR
- `pnpm -w turbo run check-types`
- `pnpm -w turbo run lint`
- `pnpm -w turbo run test` (incl. Playwright smokes where changed)
- Build affected app(s)

PR checklist
- Uses `@repo/ui` components (no new duplicates)
- A11y: keyboard/focus/ARIA; 44px/36–40px tap targets
- Tailwind v4 + tokens; no raw color literals
- Server mutations: POST + origin-check + zod validation + rate limit
- Security: no service role keys in client; RLS enforced
- Performance: mobile LCP ≤ 1.5s p75 budgets respected

