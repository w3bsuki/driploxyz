# Phase 4 Validation Log

## Environment
- Node: v22.12.0 (`node -p "process.version"`)
- pnpm: 8.15.6 (`pnpm -v`)

## Commands & Results
- `pnpm --filter @repo/i18n build` – ✅ Generates runtime, types, and message
  exports via the new generator script. 【2af6f8†L1-L8】【4f0348†L1-L3】
- `pnpm --filter @repo/ui test` – ✅ Vitest exits cleanly with no test files
  pending. 【432124†L1-L11】
- `pnpm --filter web test` – ✅ SvelteKit sync + Vitest + Playwright bundle; all
  stages pass with no specs detected. 【b0065b†L1-L4】【3deabc†L1-L9】【56e35c†L1-L5】
- `pnpm --filter web test:e2e` – ✅ Playwright smoke run completes (no specs
  defined yet). 【10ab83†L1-L4】【e4eab5†L1-L5】
- `pnpm --filter web build` – ✅ Production build succeeds with accessibility
  warnings noted for follow-up. 【e1a088†L1-L4】【981bd9†L1-L94】
- `pnpm --filter web build:metrics` – ✅ Custom metrics script rebuilds the app
  and prints bundle sizes. 【de0b59†L1-L4】【b3fd29†L1-L30】
- `pnpm -w turbo run lint` – ⚠️ Fails in this container with repeated
  `ENETUNREACH` errors when Turbo invokes config-package scripts. Manual fallbacks
  (`pnpm --filter @repo/eslint-config lint`, `pnpm --filter @repo/typescript-config lint`)
  confirm the scripts succeed locally. 【052f94†L1-L68】【781128†L1-L4】【6aa01a†L1-L2】【17b830†L1-L6】
- `pnpm -w turbo run check-types` – ⚠️ Same network limitation hits the config
  packages. Individual scripts succeed (`pnpm --filter @repo/eslint-config check-types`,
  `pnpm --filter @repo/typescript-config check-types`). 【3556ea†L1-L87】【c7b621†L1-L6】【0180c0†L1-L5】
- `pnpm -w turbo run build` – ⚠️ Turbo cannot run `@repo/i18n`’s build in this
  environment (`ENETUNREACH`). The direct package build succeeds separately.
  【0b3c4a†L1-L92】【2af6f8†L1-L8】

## Build Metrics Snapshot (`pnpm --filter web build:metrics`)
- Client bundle total: **3.49 MB**. Largest artifacts:
  - `_app/immutable/chunks/BpwkbuV5.js` – 750.69 KB
  - `fonts/InterVariable-Italic.woff2` – 378.88 KB
  - `fonts/InterVariable.woff2` – 343.98 KB
  - `_app/immutable/chunks/CRyRXexo.js` – 294.89 KB
  - `_app/immutable/entry/app.CwbPzGF6.js` – 261.54 KB
- Server output total: **2.90 MB**. Largest artifacts:
  - `chunks/messages.js` – 559.37 KB
  - `_app/immutable/assets/_layout.D8qucNGX.css` – 205.90 KB
  - `index.js` – 138.06 KB
  - `chunks/Footer.js` – 114.33 KB
  - `.vite/manifest.json` – 79.46 KB

## Additional Notes
- Updated legal/offline routes now export `prerender = false` to avoid runtime
  env lookups during static generation.
- Documented the testing workflow in `docs/testing/testing-guidelines.md` and
  added QA notes to `apps/web/README.md`.
- Toast provider deduplication now records provider IDs, preventing duplicate
  UI notifications when the Melt provider is registered.
- Fixed vitest configuration import from `@repo/testing` to use relative path
  due to workspace package resolution issues.
- Successfully migrated all toast consumers to use shared `@repo/ui` primitives
  instead of local stores.
- Removed duplicate `.ts` toast store file, keeping canonical `.svelte.ts` version.
- All .svelte.ts artifacts now follow proper Svelte 5 patterns with runes.
