# Melt UI Playbook

Best practices
- Use Melt as headless behavior; keep visuals in `@repo/ui` with tokens.
- Wrap primitives in `packages/ui/src/lib/primitives/*` and re‑export from `@repo/ui`.
- Use actions (`use:trigger/menu/option`) and Svelte 5 snippets.

Anti‑patterns seen
- `.js` re‑exports in barrels; app importing `@repo/ui/primitives` directly.
- Primitive Select using mixed `use:melt={...}` API; should use actions from `createSelect` destructure.

Refactor tasks
- [ ] Fix UI barrel: import semantic.css; extensionless exports; re‑export `./primitives`
- [ ] Fix primitives barrel re‑exports to extensionless
- [ ] Replace `from '@repo/ui/primitives'` → `from '@repo/ui'` in app
- [ ] Wire top‑level Select to Melt primitive; primitive uses `use:trigger/menu/option`
- [ ] Adopt Tabs/Tooltip/Toast in app; mount ToastProvider/Container
- [ ] Header menu: add mobile `menuClass="w-screen max-w-xs sm:w-56 mx-4"`

Snippets
```svelte
<!-- Dialog snippet/trigger pattern -->
<Dialog>
  {#snippet trigger()}Open{/snippet}
  {#snippet title()}Confirm Action{/snippet}
  {#snippet children()}Content{/snippet}
  {#snippet actions()}<button class="btn">OK</button>{/snippet}
</Dialog>
```

Short prompts
- “Fix ui barrels, import semantic.css, refactor Select to use Melt actions, and adopt Tabs/Tooltip/Toast in at least one page.”
