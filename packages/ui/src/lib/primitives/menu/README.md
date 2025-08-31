# Menu Component

A mobile-first dropdown menu component built with Melt UI and Svelte 5 runes.

## Features

- ✅ **Svelte 5 Ready**: Uses modern runes (`$props`, `$state`, `$derived`, `$effect`)
- ✅ **Mobile-First**: 44px touch targets for primary interactions
- ✅ **Accessible**: Full keyboard navigation and ARIA support
- ✅ **Flexible**: Static items array or custom content via snippets
- ✅ **Positioning**: Multiple positioning options
- ✅ **TypeScript**: Full type safety with interfaces

## Basic Usage

```svelte
<script lang="ts">
  import { Menu } from '@repo/ui/primitives';
  
  const menuItems = [
    {
      id: 'profile',
      label: 'View Profile',
      icon: '👤',
      onSelect: () => console.log('Profile clicked')
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      shortcut: '⌘,',
      onSelect: () => console.log('Settings clicked')
    },
    {
      id: 'separator',
      separator: true
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: '🚪',
      onSelect: () => console.log('Logout clicked')
    }
  ];
</script>

<Menu items={menuItems}>
  {#snippet trigger()}
    User Menu
    <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
    </svg>
  {/snippet}
</Menu>
```

## Props

```typescript
interface Props {
  // Bindable open state
  open?: boolean;
  
  // Callback when open state changes
  onOpenChange?: (open: boolean) => void;
  
  // Menu items array
  items?: MenuItemData[];
  
  // Menu positioning
  positioning?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'bottom' | 'top';
  
  // Enable focus looping through items
  loop?: boolean;
  
  // Custom trigger content
  trigger?: Snippet;
  
  // Custom menu content
  children?: Snippet;
  
  // CSS classes
  class?: string;
  triggerClass?: string;
  menuClass?: string;
}
```

## Menu Item Interface

```typescript
interface MenuItemData {
  id: string;
  label: string;
  disabled?: boolean;
  separator?: boolean;  // Creates a separator line
  onSelect?: () => void;
  icon?: string;        // Emoji or icon string
  shortcut?: string;    // Keyboard shortcut display
}
```

## Examples

### Controlled Menu

```svelte
<script lang="ts">
  let isOpen = $state(false);
</script>

<Menu 
  bind:open={isOpen}
  items={menuItems}
  onOpenChange={(open) => console.log('Menu:', open)}
/>

<button onclick={() => isOpen = !isOpen}>
  Toggle Programmatically
</button>
```

### Custom Positioning

```svelte
<Menu items={menuItems} positioning="top-end">
  {#snippet trigger()}
    Top Right Menu
  {/snippet}
</Menu>
```

### Custom Content

```svelte
<Menu items={basicItems}>
  {#snippet trigger()}
    <CustomIcon />
    Menu
  {/snippet}
  
  {#snippet children()}
    <!-- Custom content after static items -->
    <div class="px-4 py-2 border-t border-gray-200">
      <p class="text-xs text-gray-500">Custom footer content</p>
    </div>
  {/snippet}
</Menu>
```

## Mobile-First Design

- **Touch Targets**: Minimum 44px height for primary actions
- **Responsive**: Adapts to mobile viewport constraints
- **Performance**: Optimized animations and interactions
- **Accessibility**: High contrast and reduced motion support

## Styling

The component uses semantic CSS classes:

- `.menu` - Menu container
- `.menu-item` - Individual menu items
- `.btn`, `.btn-ghost` - Trigger button styles

Colors use OKLCH color space following the design system:
- `oklch(98% 0.01 250)` - Light backgrounds
- `oklch(60% 0.2 250)` - Primary accent colors

## Integration

Import from the primitives module:

```typescript
import { Menu } from '@repo/ui/primitives';
// or
import { Menu, type MenuItemData } from '@repo/ui/primitives/menu';
```