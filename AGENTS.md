# Repository Guidelines

## Project Structure & Module Organization

- `src/`: Application and library code grouped by feature.
- `tests/` or `__tests__/`: Unit/integration tests mirroring `src/` layout.
- `public/` or `assets/`: Static files (images, fonts, etc.).
- `scripts/`: Local tooling and one‑off maintenance scripts.
- Monorepo note (if present): `apps/*` for runnable apps, `packages/*` for shared libs.
- Keep modules cohesive; import via public entry points rather than deep paths.

## Build, Test, and Development Commands

- Install: `npm ci` (or `pnpm i` / `yarn install`).
- Develop: `npm run dev` — starts local server/watch mode.
- Build: `npm run build` — production build artifacts.
- Test: `npm test` — runs the test suite once.
- Lint/Format: `npm run lint`, `npm run format` — static checks/auto‑format.
- Monorepo: `turbo run build` / `turbo run test` if Turborepo is used.
- Makefile (if present): `make <target>`; see `Makefile` for available targets.

Check `package.json` scripts (or the Makefile) for the authoritative commands in this repo.

## Coding Style & Naming Conventions

- Match existing patterns; prefer small, focused modules.
- Formatting: run `npm run format` (e.g., Prettier) before commits.
- Linting: run `npm run lint` and resolve warnings.
- Naming: files `kebab-case` (e.g., `user-profile.ts`), variables/functions `camelCase`, classes/types `PascalCase`.
- Avoid breaking public APIs; document changes in code and PR descriptions.

## Testing Guidelines

- Framework: use the configured runner (e.g., Jest/Vitest) found in `package.json`.
- Location: mirror `src/` structure under `tests/` or place alongside as `*.test.*`.
- Names: `*.test.ts` / `*.spec.ts` (JS/TS) or `test_*.py` (Python).
- Run locally: `npm test` (watch mode via `npm run test:watch` if available).
- Aim for meaningful coverage; prefer fast, deterministic tests with clear assertions.

## Commit & Pull Request Guidelines

- Commits: follow Conventional Commits when possible.
  - Examples: `feat(api): add pagination`, `fix(ui): correct button focus`, `chore: update deps`.
- PRs: include summary, linked issues (e.g., `Closes #123`), test instructions, and screenshots for UI changes.
- Keep PRs focused and small; include notes on breaking changes and migration steps.

## Security & Configuration

- Secrets: never commit `.env*`; provide `./.env.example` for required variables.
- Validate inputs and handle errors; avoid logging secrets.
