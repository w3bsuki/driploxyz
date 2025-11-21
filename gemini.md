# Codebase Audit and Refactoring Plan

## Duplicate & Redundant Configurations

| File | Recommendation | Justification |
|---|---|---|
| `apps/web/.prettierrc` | Delete (consolidate to root) | This file is a slightly modified version of the root `.prettierrc`. Merge any differences into the root `.prettierrc` and delete this file to avoid drift. |
| `packages/core/eslint.config.js` | **Delete** | This file is a duplicate of `packages/core/eslint.config.ts`. The `.ts` version should be used. |
| `packages/domain/eslint.config.js` | **Delete** | This file is a duplicate of `packages/domain/eslint.config.ts`. The `.ts` version should be used. |

## Root Directory

| File | Recommendation | Justification |
|---|---|---|
| `.env.example` | Keep | Boilerplate environment variables. |
| `.gitattributes` | Keep | Git configuration. |
| `.gitignore` | Keep | Git configuration. |
| `.node-version` | Keep | Node version specification. |
| `.npmrc` | Keep | NPM configuration. |
| `.nvmrc` | Keep | NVM configuration. |
| `.prettierignore` | Keep | Prettier configuration. |
| `.prettierrc` | Keep | Prettier configuration. |
| `.vercelignore` | Keep | Vercel configuration. |
| `add-missing-i18n-keys.mjs` | Review | Script, might be useful. |
| `app_implementation.md` | Review | Documentation, check for relevance. |
| `app.md` | Review | Documentation, check for relevance. |
| `applan.md` | Review | Documentation, check for relevance. |
| `AUDIT_EXECUTION_COMPLETE.md` | **Delete** | Temporary report file. |
| `AUDIT_FINAL_STATUS.md` | **Delete** | Temporary report file. |
| `AUTH_FIXES_APPLIED.md` | **Delete** | Temporary report file. |
| `DESIGN_TOKENS.md` | Review | Documentation, check for relevance. |
| `final-verification.js` | **Delete** | Temporary script. |
| `FIX_SUMMARY.md` | **Delete** | Temporary report file. |
| `fix-phase4b-imports.sh` | Review | Script, might be useful. |
| `FIXES_APPLIED_v2.md` | **Delete** | Temporary report file. |
| `FIXES_APPLIED.md` | **Delete** | Temporary report file. |
| `audit.py` | Review | Script, might be useful. |
| `jsconfig.json` | Keep | JS configuration. |
| `lint-ui.json` | Keep | Linting configuration. |
| `METRO_FIX.md` | Review | Documentation, check for relevance. |
| `MOBILE_APP_ARCHITECTURE_PLAN.md` | Review | Documentation, check for relevance. |
| `MOBILE_APP_BUILD_SUMMARY.md` | Review | Documentation, check for relevance. |
| `MOBILE_APP_COMPLETE.md` | Review | Documentation, check for relevance. |
| `MOBILE_APP_ROADMAP.md` | Review | Documentation, check for relevance. |
| `MOBILE_ARCHITECTURE_DIAGRAM.md` | Review | Documentation, check for relevance. |
| `MOBILE_CHECKLIST.md` | Review | Documentation, check for relevance. |
| `MOBILE_IMPLEMENTATION_GUIDE.md` | Review | Documentation, check for relevance. |
| `MOBILE_IMPLEMENTATION_STATUS.md` | Review | Documentation, check for relevance. |
| `MOBILE_QUICKSTART.md` | Review | Documentation, check for relevance. |
| `MOBILE_SHARED_PACKAGES_IMPLEMENTATION.md` | Review | Documentation, check for relevance. |
| `MOBILE_WEB_SUPABASE_INTEGRATION.md` | Review | Documentation, check for relevance. |
| `package.json` | Keep | Project manifest. |
| `pnpm-lock.yaml` | Keep | Dependency lock file. |
| `pnpm-workspace.yaml` | Keep | PNPM workspace configuration. |
| `PRODUCTION_AUDIT_COMPLETE.md` | **Delete** | Temporary report file. |
| `PRODUCTION_AUDIT_REPORT.md` | **Delete** | Temporary report file. |
| `PRODUCTION_AUDIT_SUPABASE.md` | **Delete** | Temporary report file. |
| `PRODUCTION_AUDIT_TYPESCRIPT.md` | **Delete** | Temporary report file. |
| `PRODUCTION_EXECUTION_PROMPT.md` | **Delete** | Temporary report file. |
| `QUICK_REFERENCE.md` | Review | Documentation, check for relevance. |
| `README.md` | Keep | Project documentation. |
| `REUSING_WEB_LOGIC_IN_MOBILE.md` | Review | Documentation, check for relevance. |
| `SELL_FORM_FIX_SUMMARY.md` | **Delete** | Temporary report file. |
| `SELL_PAGE_FIXED_FINAL.md` | **Delete** | Temporary report file. |
| `SELL_PAGE_PRODUCTION_AUDIT.md` | **Delete** | Temporary report file. |
| `SUPABASE_CLEANUP_COMPLETE.md` | **Delete** | Temporary report file. |
| `SUPABASE_REFACTOR_SUMMARY.md` | Review | Documentation, check for relevance. |
| `SUPABASE_TYPESCRIPT_AUDIT_PLAN.md` | Review | Documentation, check for relevance. |
| `tailwindcss-v4-refactor-plan.md` | Review | Documentation, check for relevance. |
| `tsconfig.json` | Keep | TypeScript configuration. |
| `turbo.json` | Keep | Turborepo configuration. |
| `TURBOREPO_ANALYSIS_AND_FIXES.md` | **Delete** | Temporary report file. |
| `TURBOREPO_FIX_SUMMARY.md` | **Delete** | Temporary report file. |
| `U1_COMPLETION_REPORT.md` | **Delete** | Temporary report file. |
| `UNUSED_INDEX_ANALYSIS.md` | **Delete** | Temporary report file. |
| `update-phase4c-imports.sh` | Review | Script, might be useful. |
| `vercel.json` | Keep | Vercel configuration. |
| `web-full-tree.txt` | **Delete** | Generated file. |

## .claude Directory

| File | Recommendation | Justification |
|---|---|---|
| `settings.local.json` | Keep | Local settings for the Claude agent. |
| `agents/brutal-code-auditor.md` | Keep | Agent definition. |
| `commands/check.md` | Keep | Command definition. |
| `commands/debug.md` | Keep | Command definition. |
| `commands/setup.md` | Keep | Command definition. |
| `commands/start.md` | Keep | Command definition. |
| `mcp/svelte5-mcp` | Review | Unknown file. |

## .github Directory

| File | Recommendation | Justification |
|---|---|---|
| `dependabot.yml` | Keep | Dependabot configuration. |
| `pull_request_template.md` | Keep | Pull request template. |
| `ISSUE_TEMPLATE/bug_report.yml` | Keep | Issue template. |
| `ISSUE_TEMPLATE/feature_request.yml` | Keep | Issue template. |
| `workflows/ci-simple.yml` | Keep | GitHub Actions workflow. |
| `workflows/ci.yml` | Keep | GitHub Actions workflow. |
| `workflows/dependabot-auto-merge.yml` | Keep | GitHub Actions workflow. |

## docs Directory

| File | Recommendation | Justification |
|---|---|---|
| `ARCHITECTURE.md` | Review | Documentation. |
| `AUDIT_SVELTEKIT_KIT2.md` | Review | Documentation. |
| `CLAUDE.md` | Review | Documentation. |
| `CONTRIBUTING.md` | Review | Documentation. |
| `DEVELOPMENT.md` | Review | Documentation. |
| `IMPLEMENTED.md` | Review | Documentation. |
| `LAUNCH_CHECKLIST.md` | Review | Documentation. |
| `PHASE_2_TODO.md` | Review | Documentation. |
| `PRODUCTION_PLAN.md` | Review | Documentation. |
| `PRODUCTION_TASKS.md` | Review | Documentation. |
| `README.md` | Review | Documentation. |
| `ROADMAP.md` | Review | Documentation. |
| `TAILWIND_V4_UI_UX_REFACTOR.md` | Review | Documentation. |
| `TRACK_0_U_BASELINE_REPORT.md` | Review | Documentation. |

## notes Directory

| File | Recommendation | Justification |
|---|---|---|
| `dependency-baseline-restore.md` | Review | Notes. |
| `error-inventory.md` | Review | Notes. |
| `post-lint-refactor.md` | Review | Notes. |
| `sql-functions-regeneration.md` | Review | Notes. |

## scripts Directory

| File | Recommendation | Justification |
|---|---|---|
| `analyze-components.js` | Review | Script. |
| `analyze-components.ps1` | Review | Script. |
| `drop-unused-indexes.ps1` | Review | Script. |
| `drop-unused-indexes.sh` | Review | Script. |
| `find-effect-usage.js` | Review | Script. |
| `run-analyzers.mjs` | Review | Script. |
| `analysis/analyze-server-code.ps1` | Review | Script. |
| `analysis/generate-route-map.ps1` | Review | Script. |
| `diagnostics/env.ts` | Review | Script. |
| `diagnostics/index.ts` | Review | Script. |
| `diagnostics/locals.ts` | Review | Script. |
| `diagnostics/ping.ts` | Review | Script. |
| `diagnostics/supabase.ts` | Review | Script. |
| `legacy/batch-fix-warnings.mjs` | Review | Script. |
| `legacy/final-verification.js` | Review | Script. |
| `legacy/fix-final-warnings.mjs` | Review | Script. |
| `legacy/fix-remaining-lint.js` | Review | Script. |
| `legacy/fix-remaining-specific.mjs` | Review | Script. |
| `migration/fix-imports.ps1` | Review | Script. |
| `migration/update-imports-simple.ps1` | Review | Script. |

## apps/mobile Directory

| File | Recommendation | Justification |
|---|---|---|
| `.env.example` | Keep | Boilerplate environment variables. |
| `.gitignore` | Keep | Git configuration. |
| `app.json` | Keep | Expo configuration. |
| `babel.config.js` | Keep | Babel configuration. |
| `eslint.config.js` | Keep | ESLint configuration. |
| `global.css` | Keep | Global CSS. |
| `metro.config.js` | Keep | Metro bundler configuration. |
| `package-lock.json` | **Delete** | `pnpm-lock.yaml` is used in the root. |
| `package.json` | Keep | Project manifest. |
| `README.md` | Review | Documentation. |
| `tailwind.config.js` | Keep | Tailwind CSS configuration. |
| `tsconfig.json` | Keep | TypeScript configuration. |

## apps/web Directory

| File | Recommendation | Justification |
|---|---|---|
| `.env.example` | Keep | Boilerplate environment variables. |
| `.gitignore` | Keep | Git configuration. |
| `.npmrc` | Keep | NPM configuration. |
| `.prettierignore` | Keep | Prettier configuration. |
| `.prettierrc` | Delete | Consolidate to root `.prettierrc` to avoid drift and duplication. |
| `eslint.config.ts` | Keep | ESLint configuration. |
| `lighthouserc.cjs` | Keep | Lighthouse configuration. |
| `package.json` | Keep | Project manifest. |
| `playwright.config.ts` | Keep | Playwright configuration. |
| `README.md` | Review | Documentation. |
| `SUPABASE_SECURITY.md` | Review | Documentation. |
| `svelte.config.js` | Keep | Svelte configuration. |
| `tsconfig.json` | Keep | TypeScript configuration. |
| `typescript-errors-detailed.txt` | **Delete** | Generated file. |
| `vite.config.ts` | Keep | Vite configuration. |
| `vite.dev.config.js` | **Delete** | Duplicate of `vite.dev.config.ts`. |
| `vite.dev.config.ts` | Keep | Vite development configuration. |
| `vitest.config.ts` | Keep | Vitest configuration. |

## packages/core Directory

| File | Recommendation | Justification |
|---|---|---|
| `.eslintignore` | Keep | ESLint ignore file. |
| `eslint.config.js` | **Delete** | `eslint.config.ts` exists. |
| `eslint.config.ts` | Keep | ESLint configuration. |
| `package.json` | Keep | Project manifest. |
| `README.md` | Review | Documentation. |
| `tsconfig.json` | Keep | TypeScript configuration. |
| `tsup.config.ts` | Keep | tsup configuration. |
| `dist/` | **Delete** | Build artifact. |
| `node_modules/` | **Delete** | Dependency folder. |
| `src/` | Keep | Source code. |

## packages/database Directory

| File | Recommendation | Justification |
|---|---|---|
| `eslint.config.ts` | Keep | ESLint configuration. |
| `package.json` | Keep | Project manifest. |
| `README.md` | Review | Documentation. |
| `tsconfig.json` | Keep | TypeScript configuration. |
| `dist/` | **Delete** | Build artifact. |
| `node_modules/` | **Delete** | Dependency folder. |
| `src/` | Keep | Source code. |
| `src/generated.ts` | Keep | Canonical Supabase generated types used to produce `generated.js` consumed by `src/index.ts`. Keep tracked or regenerate in CI via `pnpm db:types`. |
| `src/generated/database.ts` | Keep | Compatibility shim re-exporting from `../generated.js`; required by existing imports and internal re-exports. |

## packages/domain Directory

| File | Recommendation | Justification |
|---|---|---|
| `eslint.config.js` | **Delete** | `eslint.config.ts` exists. |
| `eslint.config.ts` | Keep | ESLint configuration. |
| `package.json` | Keep | Project manifest. |
| `README.md` | Review | Documentation. |
| `tsconfig.json` | Keep | TypeScript configuration. |
| `tsup.config.ts` | Keep | tsup configuration. |
| `vitest.config.ts` | Keep | Vitest configuration. |
| `dist/` | **Delete** | Build artifact. |
| `node_modules/` | **Delete** | Dependency folder. |
| `src/` | Keep | Source code. |

## packages/eslint-config Directory

| File | Recommendation | Justification |
|---|---|---|
| `index.d.ts` | **Delete** | Generated file. |
| `index.js` | Keep | Main entry point. |
| `package.json` | Keep | Project manifest. |
| `README.md` | Review | Documentation. |
| `tsconfig.json` | Keep | TypeScript configuration. |
| `node_modules/` | **Delete** | Dependency folder. |

## packages/i18n Directory

| File | Recommendation | Justification |
|---|---|---|
| `.gitignore` | Keep | Git configuration. |
| `eslint.config.ts` | Keep | ESLint configuration. |
| `generate-ts-exports.ts` | Review | Script, might be useful. |
| `LOCALIZATION.md` | Review | Documentation. |
| `OPTIMIZATION_GUIDE.md` | Review | Documentation. |
| `package.json` | Keep | Project manifest. |
| `README.md` | Review | Documentation. |
| `STRUCTURE_EXPLAINED.md` | Review | Documentation. |
| `tsconfig.json` | Keep | TypeScript configuration. |
| `vite-plugin-optimized-i18n.ts` | Review | Vite plugin, check for relevance. |
| `vitest.config.ts` | Keep | Vitest configuration. |
| `lib/` | Keep | Library code. |
| `messages/` | Keep | i18n messages. |
| `paraglide/` | Keep | Paraglide generated files. |
| `project.inlang/` | Keep | Inlang project configuration. |
| `scripts/` | Review | Scripts, check for relevance. |
| `src/` | Keep | Source code. |
| `tests/` | Keep | Tests. |
| `node_modules/` | **Delete** | Dependency folder. |
| `.turbo/` | **Delete** | Build artifact. |

## packages/mobile-shared Directory

| File | Recommendation | Justification |
|---|---|---|
| `package.json` | Keep | Project manifest. |
| `tsconfig.json` | Keep | TypeScript configuration. |
| `src/` | Keep | Source code. |
| `node_modules/` | **Delete** | Dependency folder. |

## packages/testing Directory

| File | Recommendation | Justification |
|---|---|---|
| `package.json` | Keep | Project manifest. |
| `tsconfig.json` | Keep | TypeScript configuration. |
| `vitest.config.app.js` | Keep | Vitest configuration for apps. |
| `vitest.config.base.js` | Keep | Base Vitest configuration. |
| `vitest.config.ui.js` | Keep | Vitest configuration for UI. |
| `node_modules/` | **Delete** | Dependency folder. |
| `.turbo/` | **Delete** | Build artifact. |

## packages/typescript-config Directory

| File | Recommendation | Justification |
|---|---|---|
| `base.json` | Keep | Base TypeScript configuration. |
| `package.json` | Keep | Project manifest. |
| `README.md` | Review | Documentation. |
| `svelte.json` | Keep | Svelte-specific TypeScript configuration. |
| `.turbo/` | **Delete** | Build artifact. |

## packages/ui Directory

| File | Recommendation | Justification |
|---|---|---|
| `.gitignore` | Keep | Git configuration. |
| `eslint.config.ts` | Keep | ESLint configuration. |
| `index.ts` | Keep | Main entry point. |
| `package.json` | Keep | Project manifest. |
| `README.md` | Review | Documentation. |
| `svelte.config.js` | Keep | Svelte configuration. |
| `tsconfig.json` | Keep | TypeScript configuration. |
| `vite.config.ts` | Keep | Vite configuration. |
| `vitest.config.ts` | Keep | Vitest configuration. |
| `.storybook/` | Keep | Storybook configuration. |
| `src/` | Keep | Source code. |
| `.svelte-kit/` | **Delete** | Build artifact. |
| `.turbo/` | **Delete** | Build artifact. |
| `dist/` | **Delete** | Build artifact. |
| `node_modules/` | **Delete** | Dependency folder. |

## supabase Directory

| File | Recommendation | Justification |
|---|---|---|
| `config.toml` | Keep | Supabase configuration. |
| `functions/` | Keep | Supabase functions. |
| `migrations/` | Keep | Supabase database migrations. |

## Post-cleanup verification checklist

Run these in order to ensure nothing broke after applying this plan:

1) Install and validate workspace
- pnpm install
- pnpm -w lint
- pnpm -w test

2) Regenerate Supabase types (local dev)
- pnpm db:types
- Verify types compile: pnpm -w check-types

3) Web app sanity
- pnpm --filter web check-types
- pnpm --filter web exec svelte-check --fail-on-warnings

4) Packages sanity
- pnpm --filter ./packages/* check-types

5) Optional deep checks
- pnpm --filter web test
- pnpm --filter @driplo/ui test

If any step fails, revert only the offending deletion or config change and re-run. Preserve `packages/database/src/generated.ts` and `packages/database/src/generated/database.ts` at all times; they are required by `packages/database/src/index.ts` and should be kept in Git or regenerated in CI via `pnpm db:types`.
