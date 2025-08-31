# Tabs Component

A comprehensive, accessible Tabs component built with Melt UI's `createTabs` primitive. Supports mobile-first design, proper touch targets, keyboard navigation, and various styling variants.

## Features

- ✅ **Svelte 5 Ready**: Uses modern runes (`$props`, `$state`, `$derived`, `$effect`)
- ✅ **Mobile-First**: 44px touch targets, scrollable tabs, proper responsive design
- ✅ **Accessible**: Full ARIA support, keyboard navigation, focus management
- ✅ **Flexible**: Controlled/uncontrolled modes, custom content via snippets
- ✅ **Variants**: Default underline, pills, custom styling options
- ✅ **Touch-Optimized**: Smooth scrolling, proper touch targets for mobile

## Usage

### Basic Example

```svelte
<script>
  import { Tabs } from '@repo/ui/primitives';

  let activeTab = $state('posts');
  
  const tabs = [
    { id: 'posts', label: 'Posts', count: 42 },
    { id: 'reviews', label: 'Reviews', count: 8 },
    { id: 'about', label: 'About' }
  ];
</script>

<Tabs 
  {tabs} 
  bind:value={activeTab}
  variant="underline"
  size="lg"
>
  {#snippet children(tab)}
    {#if tab.id === 'posts'}
      <div class="p-4">Posts content...</div>
    {:else if tab.id === 'reviews'}  
      <div class="p-4">Reviews content...</div>
    {:else if tab.id === 'about'}
      <div class="p-4">About content...</div>
    {/if}
  {/snippet}
</Tabs>
```

### Uncontrolled Mode

```svelte
<script>
  import { Tabs } from '@repo/ui/primitives';

  const tabs = [
    { id: 'pending', label: 'Pending', count: 5, badge: 'new' },
    { id: 'processing', label: 'Processing', count: 2 },
    { id: 'completed', label: 'Completed', count: 24 }
  ];

  function handleTabChange(tabId) {
    console.log('Tab changed to:', tabId);
  }
</script>

<Tabs 
  {tabs} 
  onTabChange={handleTabChange}
  variant="pills"
  class="mb-6"
>
  {#snippet children(activeTab)}
    <div class="p-6">
      <h2>Content for {activeTab.label}</h2>
      <p>Count: {activeTab.count}</p>
    </div>
  {/snippet}
</Tabs>
```

### Custom Tab Content

```svelte
<script>
  import { Tabs } from '@repo/ui/primitives';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '<svg>...</svg>' },
    { id: 'analytics', label: 'Analytics', icon: '<svg>...</svg>' },
    { id: 'settings', label: 'Settings', icon: '<svg>...</svg>', disabled: true }
  ];
</script>

<Tabs {tabs} variant="default">
  {#snippet tabContent({ tab, isActive })}
    <div class="flex items-center gap-2">
      {#if tab.icon}
        <span class="w-5 h-5" class:text-blue-500={isActive}>
          {@html tab.icon}
        </span>
      {/if}
      <span>{tab.label}</span>
      {#if tab.disabled}
        <span class="text-xs bg-gray-200 px-1 rounded">Soon</span>
      {/if}
    </div>
  {/snippet}
  
  {#snippet children(tab)}
    <div class="p-4">
      Content for {tab.label}
    </div>
  {/snippet}
</Tabs>
```

### Vertical Layout

```svelte
<script>
  import { Tabs } from '@repo/ui/primitives';

  const tabs = [
    { id: 'profile', label: 'Profile Settings' },
    { id: 'security', label: 'Security' },
    { id: 'billing', label: 'Billing' }
  ];
</script>

<Tabs 
  {tabs} 
  orientation="vertical"
  class="min-h-[400px]"
>
  {#snippet children(tab)}
    <div class="p-6 flex-1">
      <h2 class="text-xl font-bold mb-4">{tab.label}</h2>
      <p>Settings content for {tab.label}...</p>
    </div>
  {/snippet}
</Tabs>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | `TabData[]` | `[]` | Array of tab data objects |
| `value` | `string` | `tabs[0]?.id` | Currently active tab ID (bindable) |
| `onTabChange` | `(tabId: string) => void` | `undefined` | Callback when tab changes |
| `scrollable` | `boolean` | `true` | Enable horizontal scrolling on mobile |
| `loop` | `boolean` | `true` | Loop keyboard navigation |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Tab orientation |
| `variant` | `'default' \| 'pills' \| 'underline'` | `'default'` | Visual style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Touch target size |
| `class` | `string` | `''` | Additional CSS classes |
| `tabListClass` | `string` | `''` | CSS classes for tab list |
| `tabClass` | `string` | `''` | CSS classes for individual tabs |
| `panelClass` | `string` | `''` | CSS classes for content panels |

## TabData Interface

```typescript
interface TabData {
  id: string;           // Unique identifier
  label: string;        // Display text
  count?: number;       // Optional count badge
  disabled?: boolean;   // Disable tab
  badge?: string;       // Optional badge text
  icon?: string;        // Optional icon HTML
}
```

## Snippets

### `tabContent({ tab, isActive })`
Custom content for individual tabs. Receives the tab data and active state.

### `children(activeTab)`
Content for the active tab panel. Receives the currently active tab data.

## Styling

The component uses CSS custom properties for theming:

```css
.tabs-root {
  --primary: oklch(60% 0.2 250);    /* Primary accent color */
  --surface: oklch(98% 0.01 250);   /* Surface background */
  --text: oklch(10% 0.02 250);      /* Text color */
  --muted: oklch(50% 0.02 250);     /* Muted text */
}
```

## Accessibility

- Full ARIA support with proper roles and states
- Keyboard navigation (Arrow keys, Home, End)
- Focus management and visual indicators
- Screen reader announcements for counts and badges
- Proper tab order and focus trapping

## Mobile Considerations

- Touch targets are 44px minimum (configurable via `size` prop)
- Horizontal scrolling with momentum and snap points
- Proper viewport handling to prevent zoom
- Optimized for thumb navigation
- Visual scroll indicators on overflow

## Migration from TabGroup

Replace existing `TabGroup` usage:

```svelte
<!-- Old TabGroup -->
<TabGroup 
  {tabs} 
  {activeTab}
  onTabChange={handleTabChange}
/>

<!-- New Tabs -->
<Tabs 
  {tabs} 
  bind:value={activeTab}
  onTabChange={handleTabChange}
/>
```

The new component provides the same functionality with better accessibility, mobile support, and more styling options.