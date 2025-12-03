# Once UI Design System (Tailwind CSS v4)

This package includes a comprehensive implementation of the Once UI design system using Tailwind CSS v4.

## Setup

1.  **Import the CSS**:
    In your main entry file (e.g., `+layout.svelte` or `app.css`), import the system CSS:

    ```css
    @import "@repo/ui/styles/once-ui-system.css";
    ```

2.  **Use the ThemeProvider**:
    Wrap your application root with `OnceThemeProvider` to enable dynamic theming.

    ```svelte
    <script>
      import { OnceThemeProvider } from '@repo/ui';
    </script>

    <OnceThemeProvider>
      <slot />
    </OnceThemeProvider>
    ```

## Configuration

You can control the theme using the `onceTheme` store.

```svelte
<script>
  import { onceTheme } from '@repo/ui';

  function toggleTheme() {
    onceTheme.update(current => ({
      ...current,
      theme: current.theme === 'dark' ? 'light' : 'dark'
    }));
  }
</script>

<button onclick={toggleTheme}>Toggle Theme</button>
```

## Tokens

The system exposes the following tokens via Tailwind utilities and CSS variables:

### Colors
-   **Brand**: `bg-brand-500`, `text-brand-100`, etc.
-   **Accent**: `bg-accent-500`, `text-accent-100`, etc.
-   **Neutral**: `bg-neutral-500`, `text-neutral-100`, etc.
-   **Semantic**: `bg-brand-background-strong`, `text-brand-on-background-weak`

### Typography
-   **Sans**: `font-sans` (Inter)
-   **Mono**: `font-mono` (JetBrains Mono)
-   **Display**: `font-display` (Inter)

### Spacing
-   `p-xs` (0.25rem) to `p-5xl` (8rem)

### Radius
-   `rounded-xs` to `rounded-full`

### Shadows
-   `shadow-xs` to `shadow-xl`

## Customization

The system is built on CSS variables that change based on `data-` attributes on the root element.
-   `data-theme`: `light` | `dark`
-   `data-brand`: `blue` | `violet` | `magenta` | ...
-   `data-accent`: `indigo` | `cyan` | ...
-   `data-neutral`: `gray` | `slate` | `sand`
