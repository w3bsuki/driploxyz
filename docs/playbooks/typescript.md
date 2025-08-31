# TypeScript Playbook

Best practices
- Strict mode everywhere; zero `any` in new code.
- Use `satisfies` to assert shapes (load/actions/data), `as const` for literals.
- Prefer discriminated unions for domain states; avoid booleans for multi‑state flows.
- Keep barrels extensionless; don’t export from non‑existing `.js` in src.
- Type ambient app context in `app.d.ts` (App.Locals, PageData), not ad‑hoc.

Anti‑patterns seen
- Barrel paths exporting from `.js` in `packages/ui/src/lib/index.ts` and primitives.
- Stray implicit `any` via untyped event handlers.

Refactor tasks
- [ ] Unify barrels to extensionless TS paths (ui + primitives)
- [ ] Ensure `apps/web/src/app.d.ts` defines Locals and PageData precisely
- [ ] Replace any implicit `any` handlers with typed signatures
- [ ] Add `satisfies` to `+page.server.ts` and `+layout.server.ts` loads

Snippets
```ts
// Assert load type
export const load = (async (event) => { /* ... */ }) satisfies PageServerLoad

// Literal objects
const cfg = { role: 'seller', flags: ['onboarding'] } as const

// Narrow events
function onSubmit(e: SubmitEvent) { e.preventDefault() }
```

Short prompts
- “Fix ui barrels to extensionless, add satisfies on server loads, and remove any implicit anys in event handlers.”
