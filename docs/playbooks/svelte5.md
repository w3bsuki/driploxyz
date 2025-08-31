# Svelte 5 Playbook

Best practices
- Use runes for state: `$state`, `$derived`, `$props`, `$bindable`.
- Prefer DOM `onclick`/`oninput` over `on:click` in Svelte 5 for consistency.
- Use snippets and actions for Melt wrappers (e.g., `{#snippet trigger()}` with `use:trigger`).
- Keep components small; extract feature components into `src/lib/features/*/components`.

Anti‑patterns seen
- Mixed event styles; inconsistent runes usage.

Refactor tasks
- [ ] Standardize events to `onclick`, `oninput`, etc.
- [ ] Replace `$:` reactive assignments with `$derived` where reasonable.
- [ ] Ensure bindable props use `$bindable` in two‑way components.

Snippets
```svelte
<script lang="ts">
  let count = $state(0)
  let doubled = $derived(count * 2)
  let { label = 'Add' }: { label?: string } = $props()
</script>
<button class="btn" onclick={() => count++}>{label} {count}</button>
```

Short prompts
- “Normalize events to Svelte 5 property events and convert reactive `$:` to `$derived` where appropriate.”
