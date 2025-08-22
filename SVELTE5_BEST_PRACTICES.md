# Svelte 5 + SvelteKit 2 Best Practices

## Event Handling

### ✅ CORRECT - Svelte 5 Style
```svelte
<!-- ALL events use onclick syntax -->
<Avatar onclick={() => menuOpen = true} />
<Button onclick={handleSubmit} />
<button onclick={handler}>Native DOM</button>
```

### ❌ WRONG - Mixed Syntax Not Allowed
```svelte
<!-- Don't mix on:click and onclick in same component -->
<button on:click={handler}>Old syntax</button>
```

### Rule: 
- **Svelte 5**: Use `onclick` for ALL event handlers
- **No mixing**: Can't use both `on:click` and `onclick` in same file
- **Event modifiers**: Use wrapper functions instead

## Runes (State Management)

### ✅ CORRECT
```svelte
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);
  let { prop1, prop2 } = $props();
  
  $effect(() => {
    console.log('Count changed:', count);
  });
</script>
```

### ❌ WRONG  
```svelte
<script>
  // Don't use legacy syntax
  export let prop1, prop2;
  $: doubled = count * 2;
</script>
```

## TypeScript

### ✅ CORRECT
```svelte
<script lang="ts">
  interface Props {
    user: User;  // Use proper types
    profile: Profile;
    onSubmit?: (data: FormData) => void;
  }
  
  let { user, profile, onSubmit }: Props = $props();
</script>
```

### ❌ WRONG
```svelte
<script lang="ts">
  interface Props {
    user?: any;  // Don't use any
    profile?: any;
  }
</script>
```

## Tailwind CSS

### ✅ CORRECT
```svelte
<div class="shadow-sm backdrop-blur-sm bg-black/80">
```

### ❌ WRONG
```svelte
<div class="shadow-xs backdrop-blur-xs">
```

## Component Architecture

### Keep Components Small
- **Header**: Max 200 lines
- **Extract**: UserMenu, MobileMenu, NotificationCenter
- **Reuse**: Don't duplicate category grids

### ✅ GOOD
```svelte
<Header>
  <UserMenu />
  <MobileMenu />
  <NotificationCenter />
</Header>
```

### ❌ BAD
```svelte
<!-- 500+ line monolithic Header.svelte -->
```

## SSR/Hydration

### ✅ CORRECT
```svelte
<script>
  import { browser } from '$app/environment';
  
  $effect(() => {
    if (!browser) return;  // Guard client-only code
    
    // Initialize client services
    notificationService = new RealtimeService();
  });
</script>
```

## Mobile-First

### ✅ REQUIRED
- Search input in mobile menu when `showSearch=true`
- Min touch targets: `min-h-[44px]`
- Test on mobile devices

---

**Remember**: Follow these rules to avoid breaking production deployments.