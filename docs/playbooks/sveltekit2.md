# SvelteKit 2 Playbook

Best practices
- Server‑first: use `+page.server.ts`/`+layout.server.ts` for data loads and actions for mutations.
- Type loads/actions with `satisfies` and return typed PageData.
- Use `depends('supabase:auth')` in root layout to react to auth changes.
- Centralize hooks: auth, i18n, sentry; single reroute impl server + client.
- Use `$env/dynamic/*`; never import secrets in client code.

Anti‑patterns seen
- Duplicate reroute implementations and inconsistent default locale handling.

Refactor tasks
- [ ] Unify reroute (server/client); default bg, map `/uk` → `en`
- [ ] Add canonical/hreflang for product/search/home
- [ ] Ensure all POSTs use actions or origin checks

Snippets
```ts
export const load = (async ({ locals }) => {
  const { user } = await locals.safeGetSession()
  return { user }
}) satisfies PageServerLoad

export const actions: Actions = {
  save: async ({ request, locals }) => { /* zod validate */ }
}
```

Short prompts
- “Unify reroute in hooks, ensure default bg without prefix, add canonical/hreflang utilities, and type all loads/actions.”
