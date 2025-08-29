# /ship-now — Production Ship Checklist

Do these in order; one PR per step.

1) Baseline Metrics
- pnpm check-types > baseline-types.txt
- pnpm -C apps/web build > web-build.txt

2) SSR/Auth Verification
- Compare to SUPABASE_SSR_CHECKLIST.md
- Validate login/logout, cookie path '/', single auth listener

3) Debloat UI
- Run /debloat-ui
- Ensure builds pass and budgets met (JS <200KB, CSS <50KB)

4) Data Loading Hygiene
- Audit +page(.server).ts
- Add .limit(), minimal selects
- Replace invalidateAll with targeted invalidation

5) Admin Tailwind v4 Align
- Upgrade to @tailwindcss/vite, remove PostCSS
- Confirm build passes

6) CI Green
- Ensure .github/workflows/ci-simple.yml passes on PR

7) Release
- Deploy off-peak, monitor Sentry 30–60m
- If regressions: rollback PR, document in REFACTOR_ISSUES.md

