# DESIGN TOKENS REFERENCE

**Version:** Tailwind CSS v4  
**Last Updated:** October 17, 2025  
**Color Space:** OKLCH

This document provides a comprehensive reference for all design tokens in the Driplo design system. All tokens are defined using CSS custom properties and leverage Tailwind CSS v4's `@theme` directive.

---

## Table of Contents

1. [Color Tokens](#color-tokens)
2. [Typography Tokens](#typography-tokens)
3. [Spacing Tokens](#spacing-tokens)
4. [Shadow Tokens](#shadow-tokens)
5. [Border Radius Tokens](#border-radius-tokens)
6. [Component-Specific Tokens](#component-specific-tokens)
7. [Usage Examples](#usage-examples)

---

## Color Tokens

### Brand Colors

Our brand colors use OKLCH color space for better perceptual uniformity and vibrant colors.

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--brand-primary-strong` | `oklch(0.52 0.15 240)` | `oklch(0.62 0.12 240)` | Primary actions, links, CTAs |
| `--brand-primary-medium` | `oklch(0.62 0.12 240)` | `oklch(0.52 0.15 240)` | Secondary emphasis |
| `--brand-primary-subtle` | `oklch(0.72 0.08 240)` | `oklch(0.42 0.18 240)` | Backgrounds, accents |
| `--color-gold-500` | `oklch(0.75 0.08 85)` | `oklch(0.75 0.08 85)` | Luxury variant, premium features |
| `--color-burgundy-500` | `oklch(0.35 0.15 25)` | `oklch(0.45 0.12 25)` | Premium variant, exclusive items |
| `--color-sage-500` | `oklch(0.70 0.05 145)` | `oklch(0.70 0.05 145)` | Elegant variant, sustainable |

### Semantic Colors

Semantic tokens automatically adapt to light/dark themes.

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--text-primary` | `oklch(0.20 0 0)` | `oklch(0.95 0 0)` | Primary text, headings |
| `--text-secondary` | `oklch(0.45 0 0)` | `oklch(0.70 0 0)` | Secondary text, labels |
| `--text-tertiary` | `oklch(0.60 0 0)` | `oklch(0.50 0 0)` | Placeholder, disabled text |
| `--text-inverse` | `oklch(1.0 0 0)` | `oklch(0.10 0 0)` | Text on colored backgrounds |
| `--text-disabled` | `oklch(0.70 0 0)` | `oklch(0.40 0 0)` | Disabled state text |

### Surface Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--surface-base` | `oklch(1.0 0 0)` | `oklch(0.20 0 0)` | Default background |
| `--surface-subtle` | `oklch(0.98 0 0)` | `oklch(0.18 0 0)` | Subtle backgrounds |
| `--surface-muted` | `oklch(0.96 0 0)` | `oklch(0.25 0 0)` | Disabled backgrounds |
| `--surface-elevated` | `oklch(1.0 0 0)` | `oklch(0.22 0 0)` | Cards, modals |
| `--surface-overlay` | `rgba(0,0,0,0.5)` | `rgba(0,0,0,0.7)` | Modal overlays |

### Border Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--border-base` | `oklch(0.85 0 0)` | `oklch(0.30 0 0)` | Standard borders |
| `--border-subtle` | `oklch(0.92 0 0)` | `oklch(0.25 0 0)` | Dividers, separators |
| `--border-strong` | `oklch(0.70 0 0)` | `oklch(0.45 0 0)` | Emphasized borders |

### State Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--state-focus` | `oklch(0.52 0.15 240)` | Focus rings, keyboard navigation |
| `--state-success` | `oklch(0.60 0.15 142)` | Success messages, confirmations |
| `--state-warning` | `oklch(0.75 0.15 85)` | Warnings, caution states |
| `--state-error` | `oklch(0.55 0.22 25)` | Errors, validation failures |
| `--state-info` | `oklch(0.60 0.15 240)` | Information, tips |

---

## Typography Tokens

### Font Families

| Token | Value | Usage |
|-------|-------|-------|
| `--font-sans` | `Inter, system-ui, sans-serif` | Body text, UI |
| `--font-serif` | `Georgia, serif` | Luxury content |
| `--font-mono` | `'Fira Code', monospace` | Code, technical content |

### Font Sizes

| Token | Value | Line Height | Usage |
|-------|-------|-------------|-------|
| `--text-xs` | `12px` | `1.25` | Small labels, captions, badges |
| `--text-sm` | `14px` | `1.5` | Body text (compact), metadata |
| `--text-base` | `16px` | `1.5` | Body text (default) |
| `--text-lg` | `18px` | `1.5` | Large body text, subheadings |
| `--text-xl` | `20px` | `1.4` | Small headings, card titles |
| `--text-2xl` | `24px` | `1.3` | Section headings |
| `--text-3xl` | `30px` | `1.2` | Page titles |
| `--text-4xl` | `36px` | `1.1` | Hero headings |
| `--text-5xl` | `48px` | `1` | Large hero text |

### Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `--font-normal` | `400` | Body text, descriptions |
| `--font-medium` | `500` | Emphasized text, links |
| `--font-semibold` | `600` | Buttons, labels, UI elements |
| `--font-bold` | `700` | Headings, prices, important text |
| `--font-extrabold` | `800` | Hero text, dramatic emphasis |

### Line Heights

| Token | Value | Usage |
|-------|-------|-------|
| `--leading-none` | `1` | Tight headings |
| `--leading-tight` | `1.25` | Headings, titles |
| `--leading-snug` | `1.375` | Compact text |
| `--leading-normal` | `1.5` | Body text (default) |
| `--leading-relaxed` | `1.625` | Comfortable reading |
| `--leading-loose` | `2` | Very spacious text |

---

## Spacing Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--space-0` | `0` | No spacing |
| `--space-px` | `1px` | Hairline spacing |
| `--space-0.5` | `2px` | Micro spacing |
| `--space-1` | `4px` | Minimal spacing |
| `--space-1.5` | `6px` | Compact spacing |
| `--space-2` | `8px` | Small spacing |
| `--space-2.5` | `10px` | Small-medium spacing |
| `--space-3` | `12px` | Standard spacing |
| `--space-3.5` | `14px` | Medium spacing |
| `--space-4` | `16px` | Comfortable spacing |
| `--space-5` | `20px` | Large spacing |
| `--space-6` | `24px` | Extra large spacing |
| `--space-7` | `28px` | XXL spacing |
| `--space-8` | `32px` | Section spacing |
| `--space-10` | `40px` | Large section spacing |
| `--space-12` | `48px` | Hero spacing |
| `--space-16` | `64px` | Extra hero spacing |
| `--space-20` | `80px` | Massive spacing |

---

## Shadow Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-xs` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Minimal elevation |
| `--shadow-sm` | `0 1px 3px 0 rgb(0 0 0 / 0.1)` | Subtle elevation, cards |
| `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | Card elevation, dropdowns |
| `--shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1)` | Elevated cards, modals |
| `--shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1)` | Premium cards, dialogs |
| `--shadow-2xl` | `0 25px 50px -12px rgb(0 0 0 / 0.25)` | Hero sections, overlays |

---

## Border Radius Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-none` | `0` | Sharp corners |
| `--radius-sm` | `2px` | Minimal rounding |
| `--radius-md` | `4px` | Standard rounding (buttons, inputs) |
| `--radius-lg` | `6px` | Cards, small components |
| `--radius-xl` | `8px` | Large cards, panels |
| `--radius-2xl` | `12px` | Hero cards, modals |
| `--radius-3xl` | `16px` | Extra large components |
| `--radius-full` | `9999px` | Pills, avatars, badges |

---

## Component-Specific Tokens

### Button Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--btn-height-sm` | `32px` | Small button height |
| `--btn-height-md` | `40px` | Medium button height |
| `--btn-height-lg` | `48px` | Large button height |
| `--btn-padding-sm` | `8px 12px` | Small button padding |
| `--btn-padding-md` | `10px 16px` | Medium button padding |
| `--btn-padding-lg` | `12px 24px` | Large button padding |
| `--btn-radius` | `4px` | Button corner radius |
| `--btn-font-sm` | `14px` | Small button text |
| `--btn-font-md` | `16px` | Medium button text |
| `--btn-font-lg` | `18px` | Large button text |
| `--btn-primary-bg` | `var(--brand-primary-strong)` | Primary button background |
| `--btn-primary-text` | `var(--text-inverse)` | Primary button text |
| `--btn-primary-border` | `var(--brand-primary-strong)` | Primary button border |
| `--btn-focus-ring` | `0 0 0 3px var(--brand-primary-subtle)` | Button focus ring |

### Card Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--card-bg` | `var(--surface-elevated)` | Card background |
| `--card-border` | `var(--border-subtle)` | Card border |
| `--card-shadow` | `var(--shadow-sm)` | Card shadow (default) |
| `--card-shadow-lg` | `var(--shadow-md)` | Card shadow (hover) |
| `--card-radius` | `4px` | Card corner radius |
| `--card-padding-sm` | `12px` | Small card padding |
| `--card-padding-md` | `16px` | Medium card padding |
| `--card-padding-lg` | `24px` | Large card padding |
| `--card-padding-xl` | `32px` | Extra large card padding |
| `--card-luxury-bg` | `linear-gradient(...)` | Luxury card background |
| `--card-luxury-border` | `var(--color-gold-500)` | Luxury card border |
| `--card-luxury-shadow` | `0 4px 20px rgba(...)` | Luxury card shadow |

### Input Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--input-height` | `44px` | Input field height |
| `--input-padding` | `12px` | Input horizontal padding |
| `--input-font` | `16px` | Input text size |
| `--input-radius` | `4px` | Input corner radius |
| `--input-bg` | `var(--surface-base)` | Input background |
| `--input-border` | `var(--border-base)` | Input border |
| `--input-border-focus` | `var(--state-focus)` | Input focused border |
| `--input-border-error` | `var(--state-error)` | Input error border |

---

## Usage Examples

### Using Color Tokens

```svelte
<!-- Direct usage in Tailwind classes -->
<div class="bg-[var(--surface-base)] text-[var(--text-primary)]">
  Content
</div>

<!-- Using in component class prop -->
<Card class="bg-[var(--card-luxury-bg)]">
  Luxury content
</Card>

<!-- Custom CSS -->
<style>
  .custom-element {
    background-color: var(--surface-elevated);
    border-color: var(--border-subtle);
  }
</style>
```

### Using Spacing Tokens

```svelte
<!-- Padding -->
<div class="p-[var(--space-4)] gap-[var(--space-2)]">
  Spaced content
</div>

<!-- Margin -->
<div class="mt-[var(--space-6)] mb-[var(--space-4)]">
  Vertically spaced
</div>
```

### Using Typography Tokens

```svelte
<!-- Font size and weight -->
<p class="text-[length:var(--text-base)] font-[var(--font-medium)]">
  Body text
</p>

<!-- Heading with custom tokens -->
<h1 class="text-[length:var(--text-3xl)] font-[var(--font-bold)] leading-[var(--leading-tight)]">
  Page Title
</h1>
```

### Using Shadow Tokens

```svelte
<!-- Card with shadow -->
<div class="shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]">
  Elevated card
</div>

<!-- Custom shadow -->
<div class="shadow-[var(--card-luxury-shadow)]">
  Premium card
</div>
```

### Using Component Tokens

```svelte
<!-- Button with component tokens -->
<button class="
  h-[var(--btn-height-md)] 
  px-[var(--btn-padding-md)] 
  rounded-[var(--btn-radius)]
  bg-[var(--btn-primary-bg)]
  text-[var(--btn-primary-text)]
">
  Button
</button>

<!-- Input with component tokens -->
<input class="
  h-[var(--input-height)]
  px-[var(--input-padding)]
  text-[length:var(--input-font)]
  rounded-[var(--input-radius)]
  border-[var(--input-border)]
  bg-[var(--input-bg)]
" />
```

### Theme Switching

```svelte
<script lang="ts">
  let darkMode = $state(false);
  
  $effect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  });
</script>

<button onclick={() => darkMode = !darkMode}>
  Toggle Theme
</button>

<!-- All tokens automatically adapt to dark theme -->
<div class="bg-[var(--surface-base)] text-[var(--text-primary)]">
  Theme-aware content
</div>
```

---

## Best Practices

1. **Always use semantic tokens** instead of direct color values
2. **Prefer component-specific tokens** for consistent component styling
3. **Use spacing tokens** for consistent layout rhythm
4. **Leverage OKLCH** for more vibrant and perceptually uniform colors
5. **Test in both light and dark modes** to ensure proper contrast
6. **Use var() syntax** with Tailwind's arbitrary value syntax: `class="bg-[var(--token)]"`

---

## Migration from v3

If migrating from Tailwind v3, replace hardcoded values with tokens:

```diff
- class="bg-blue-600 text-white"
+ class="bg-[var(--brand-primary-strong)] text-[var(--text-inverse)]"

- class="p-4 rounded-lg shadow-md"
+ class="p-[var(--space-4)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]"

- class="text-base font-semibold"
+ class="text-[length:var(--text-base)] font-[var(--font-semibold)]"
```

---

**Questions or Updates?**  
This document is maintained as part of the Driplo design system. For questions or proposed changes, please refer to the design team or open an issue.
