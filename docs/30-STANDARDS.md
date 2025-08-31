# Engineering Standards

Authoritative conventions for code, tooling, and collaboration. New code follows these by default.

## 1) TypeScript & Svelte

- `tsconfig` strict mode; no `any` in new code.
- Components in PascalCase; files end with `.svelte` / `.ts`.
- Use `$lib` alias for imports; avoid deep relative paths.
- Svelte 5: use runes for local state; prefer context over global stores.

## 2) Project Structure

- Features under `src/lib/features/<feature>` with `server/` and `components/`.
- Shared UI under `src/lib/components/ui` and `composite`.
- Server utilities live in `src/lib/server` and are not imported by client code.
- Monorepo packages: prefer promoting reusable app components/utilities into `@repo/ui` or a future `@repo/utils` when used 2+ times.

## 3) Linting & Formatting

- ESLint with `eslint-plugin-svelte` and TypeScript rules.
- Prettier with Svelte plugin; no rule conflicts with ESLint.
- CI enforces lint + typecheck on PRs.

## 4) Testing

- Unit: Vitest for utilities and critical logic.
- Component: Svelte Testing Library for interactive components.
- E2E: Playwright for key user journeys; run on PR and post‑deploy.
- Accessibility: run aXe/pa11y checks on core routes.

## 5) API Endpoints

- Use a thin `lib/server/api.ts` helper to compose: auth guard, zod validation, rate limiting, and typed JSON responses.
- Endpoints focus on business logic; validation and error mapping centralized.

## 6) Git & Reviews

- Branch naming: `feat/*`, `fix/*`, `chore/*`, `docs/*`, `refactor/*`.
- Conventional Commits; squash on merge; keep PRs ≤ 400 lines diff where possible.
- PR Checklist: types ok, tests added/updated, a11y, Lighthouse, screenshots.

## 7) Secrets & Env

- No secrets in repo; use `.env.local` locally and platform secrets in deploy.
- Never expose service keys to the browser; server‑only modules read sensitive env.

## 8) Error Handling

- Throw typed domain errors in server modules; convert to user messages at the edge.
- Log with context (user id, route, correlation id) without PII.

## 9) Dependencies

- Prefer standard libs over adding packages; justify any new dependency in PR.
- Keep the surface area small; remove unused packages regularly.
