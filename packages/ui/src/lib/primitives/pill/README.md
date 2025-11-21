# Pill & PillGroup

A clean, accessible pill component for quick filters, tags, and categories.

## Props (Pill)
- label?: string (or provide children)
- variant: 'solid' | 'soft' | 'outline' | 'ghost' (default: 'soft')
- tone: 'neutral' | 'brand' (default: 'neutral')
- size: 'sm' | 'md' | 'lg' (default: 'md')
- selected?: boolean (adds aria-pressed on button)
- disabled?: boolean
- loading?: boolean
- href?: string (renders as <a>)
- type?: 'button'|'submit'|'reset' when button
- emoji?: string (leading)
- count?: number; showCount?: boolean
- dismissible?: boolean; onDismiss?: (e) => void
- ariaLabel?: string; ariaCurrent?: ARIA current values

## Accessibility
- Button pills use aria-pressed when selected. Link pills use aria-current when appropriate.
- Focus styles use the design token --state-focus and show ring.
- Dismiss button is tabbable and announces "Remove <label>".

## Usage
```svelte
<script>
  import { Pill, PillGroup } from '@driplo/ui';
  let selected = false;
</script>

<PillGroup>
  <Pill label="All" selected={selected} onClick={() => (selected = !selected)} />
  <Pill label="New" tone="brand" variant="solid" />
  <Pill label="Popular" variant="outline" />
  <Pill label="Sale" emoji="🔥" showCount count={12} />
</PillGroup>
```

## Notes
- Uses semantic tokens (surface, text, border, brand-primary). No raw grays.
- Keep groups scrollable on small screens: wrap `<PillGroup>` in an overflow-x container if needed.
