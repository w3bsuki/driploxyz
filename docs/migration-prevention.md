# Migration Prevention Guide

**Stop Svelte 4 → 5 Mistakes Before They Happen** - Complete guide to avoid every common migration error.

## Critical Migration Rules

### ✅ ALWAYS Use Svelte 5 Patterns
- **State**: `let count = $state(0)` (NOT `let count = 0`)
- **Props**: `let { title }: Props = $props()` (NOT `export let title`)
- **Derived**: `let doubled = $derived(count * 2)` (NOT `$: doubled = count * 2`)
- **Events**: `onclick={handler}` (NOT `on:click={handler}`)
- **Effects**: `$effect(() => {})` (NOT `onMount(() => {})`)

### ❌ NEVER Use Svelte 4 Patterns (Forbidden)
- Reactive statements: `$:`
- Export let: `export let prop`
- Event directives: `on:click`
- Lifecycle functions: `onMount`, `onDestroy`
- Stores for component state: `writable()`

## 1. State Management Mistakes

### Mistake: Using `let` for Reactive Data
```svelte
<!-- ❌ WRONG: Svelte 4 pattern -->
<script>
  let count = 0  // Not reactive in Svelte 5!

  function increment() {
    count++  // UI won't update
  }
</script>

<p>Count: {count}</p>
<button on:click={increment}>+</button>

<!-- ✅ CORRECT: Svelte 5 pattern -->
<script lang="ts">
  let count = $state(0)  // Reactive state

  function increment() {
    count++  // UI updates properly
  }
</script>

<p>Count: {count}</p>
<button onclick={increment}>+</button>
```

### Mistake: Using Reactive Statements (`$:`)
```svelte
<!-- ❌ WRONG: Svelte 4 reactive statements -->
<script>
  let count = $state(0)
  $: doubled = count * 2        // Don't use $:
  $: tripled = count * 3        // Don't use $:
  $: console.log('count:', count)  // Don't use $:
</script>

<!-- ✅ CORRECT: Svelte 5 derived and effects -->
<script lang="ts">
  let count = $state(0)
  let doubled = $derived(count * 2)    // Use $derived
  let tripled = $derived(count * 3)    // Use $derived

  $effect(() => {                      // Use $effect
    console.log('count:', count)
  })
</script>
```

### Mistake: Mixing Svelte 4 and 5 Patterns
```svelte
<!-- ❌ WRONG: Mixed patterns -->
<script lang="ts">
  export let initialCount = 0    // Svelte 4 prop
  let count = $state(initialCount) // Svelte 5 state
  $: doubled = count * 2         // Svelte 4 reactive
  let tripled = $derived(count * 3) // Svelte 5 derived
</script>

<!-- ✅ CORRECT: Pure Svelte 5 -->
<script lang="ts">
  interface Props {
    initialCount?: number
  }

  let { initialCount = 0 }: Props = $props()
  let count = $state(initialCount)
  let doubled = $derived(count * 2)
  let tripled = $derived(count * 3)
</script>
```

## 2. Props & Component Communication Mistakes

### Mistake: Using `export let`
```svelte
<!-- ❌ WRONG: Svelte 4 props -->
<script>
  export let title
  export let count = 0
  export let items = []
  export let onUpdate
</script>

<!-- ✅ CORRECT: Svelte 5 props -->
<script lang="ts">
  interface Props {
    title: string
    count?: number
    items?: Item[]
    onUpdate?: (value: number) => void
  }

  let { title, count = 0, items = [], onUpdate }: Props = $props()
</script>
```

### Mistake: Using Event Dispatchers
```svelte
<!-- ❌ WRONG: Svelte 4 event dispatching -->
<script>
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  function handleClick() {
    dispatch('message', { text: 'Hello' })
  }
</script>

<button on:click={handleClick}>Send</button>

<!-- ✅ CORRECT: Svelte 5 callback props -->
<script lang="ts">
  interface Props {
    onMessage?: (data: { text: string }) => void
  }

  let { onMessage }: Props = $props()

  function handleClick() {
    onMessage?.({ text: 'Hello' })
  }
</script>

<button onclick={handleClick}>Send</button>
```

### Mistake: Mutating Props Directly
```svelte
<!-- ❌ WRONG: Direct prop mutation -->
<script lang="ts">
  interface Props {
    count: number
  }

  let { count }: Props = $props()

  function increment() {
    count++  // Error: ownership_invalid_mutation
  }
</script>

<!-- ✅ CORRECT: Callback pattern -->
<script lang="ts">
  interface Props {
    count: number
    onIncrement: () => void
  }

  let { count, onIncrement }: Props = $props()
</script>

<button onclick={onIncrement}>
  Count: {count}
</button>
```

## 3. Event Handling Mistakes

### Mistake: Using Event Directives
```svelte
<!-- ❌ WRONG: Svelte 4 event directives -->
<script>
  function handleClick(event) {
    console.log('clicked')
  }

  function handleKeydown(event) {
    if (event.key === 'Enter') {
      console.log('enter pressed')
    }
  }
</script>

<button on:click={handleClick}>Click</button>
<input on:keydown={handleKeydown} />
<form on:submit|preventDefault={handleSubmit}>
  <button type="submit">Submit</button>
</form>

<!-- ✅ CORRECT: Svelte 5 standard events -->
<script lang="ts">
  function handleClick(event: MouseEvent) {
    console.log('clicked')
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      console.log('enter pressed')
    }
  }

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault()  // Manual prevention
    console.log('form submitted')
  }
</script>

<button onclick={handleClick}>Click</button>
<input onkeydown={handleKeydown} />
<form onsubmit={handleSubmit}>
  <button type="submit">Submit</button>
</form>
```

### Mistake: Event Modifier Syntax
```svelte
<!-- ❌ WRONG: Svelte 4 event modifiers -->
<button on:click|preventDefault={handleClick}>Click</button>
<button on:click|stopPropagation={handleClick}>Click</button>
<form on:submit|preventDefault|stopPropagation={handleSubmit}>
  <input on:keydown|preventDefault={handleKeydown} />
</form>

<!-- ✅ CORRECT: Manual event handling -->
<script lang="ts">
  function handleClick(event: MouseEvent) {
    event.preventDefault()
    // Handle click
  }

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    event.stopPropagation()
    // Handle submit
  }
</script>

<button onclick={handleClick}>Click</button>
<form onsubmit={handleSubmit}>
  <input onkeydown={handleKeydown} />
</form>
```

## 4. Lifecycle & Side Effects Mistakes

### Mistake: Using Lifecycle Functions
```svelte
<!-- ❌ WRONG: Svelte 4 lifecycle -->
<script>
  import { onMount, onDestroy, beforeUpdate, afterUpdate } from 'svelte'

  let intervalId

  onMount(() => {
    console.log('component mounted')
    intervalId = setInterval(() => {
      console.log('tick')
    }, 1000)
  })

  onDestroy(() => {
    clearInterval(intervalId)
  })

  beforeUpdate(() => {
    console.log('before update')
  })

  afterUpdate(() => {
    console.log('after update')
  })
</script>

<!-- ✅ CORRECT: Svelte 5 effects -->
<script lang="ts">
  let intervalId: number

  // Mount/destroy equivalent
  $effect(() => {
    console.log('component mounted')

    intervalId = setInterval(() => {
      console.log('tick')
    }, 1000)

    // Cleanup (onDestroy equivalent)
    return () => {
      clearInterval(intervalId)
    }
  })

  // beforeUpdate equivalent
  $effect.pre(() => {
    console.log('before update')
  })

  // afterUpdate equivalent (default $effect timing)
  $effect(() => {
    console.log('after update')
  })
</script>
```

### Mistake: Using Effects for Derived State
```svelte
<!-- ❌ WRONG: Effect for computation -->
<script lang="ts">
  let count = $state(0)
  let doubled = $state(0)

  $effect(() => {
    doubled = count * 2  // Don't use effects for this!
  })
</script>

<!-- ✅ CORRECT: Derived state -->
<script lang="ts">
  let count = $state(0)
  let doubled = $derived(count * 2)  // Use $derived
</script>
```

## 5. Store Migration Mistakes

### Mistake: Using Stores for Component State
```svelte
<!-- ❌ WRONG: Stores for local state -->
<script>
  import { writable } from 'svelte/store'

  const count = writable(0)
  const doubled = derived(count, $count => $count * 2)

  function increment() {
    count.update(n => n + 1)
  }
</script>

<p>Count: {$count}</p>
<p>Doubled: {$doubled}</p>
<button on:click={increment}>+</button>

<!-- ✅ CORRECT: Runes for component state -->
<script lang="ts">
  let count = $state(0)
  let doubled = $derived(count * 2)

  function increment() {
    count++
  }
</script>

<p>Count: {count}</p>
<p>Doubled: {doubled}</p>
<button onclick={increment}>+</button>
```

### Mistake: Auto-subscribing with `$`
```svelte
<!-- ❌ WRONG: Store auto-subscription -->
<script>
  import { userStore, settingsStore } from '$lib/stores'

  // Auto-subscriptions with $
  $: currentUser = $userStore
  $: theme = $settingsStore.theme
</script>

<p>User: {$userStore.name}</p>
<p>Theme: {$settingsStore.theme}</p>

<!-- ✅ CORRECT: Convert stores to reactive modules -->
<script lang="ts">
  import { getUser, getSettings } from '$lib/state.svelte'

  // Reactive state access
  let currentUser = $derived(getUser())
  let theme = $derived(getSettings().theme)
</script>

<p>User: {currentUser?.name}</p>
<p>Theme: {theme}</p>
```

## 6. Binding & Two-Way Data Flow Mistakes

### Mistake: Complex Bind Patterns
```svelte
<!-- ❌ WRONG: Complex binding with stores -->
<script>
  import { writable } from 'svelte/store'

  const formData = writable({
    name: '',
    email: ''
  })
</script>

<input bind:value={$formData.name} />
<input bind:value={$formData.email} />

<!-- ✅ CORRECT: Simple state binding -->
<script lang="ts">
  let formData = $state({
    name: '',
    email: ''
  })
</script>

<input bind:value={formData.name} />
<input bind:value={formData.email} />
```

### Mistake: Using `bind:this` Unnecessarily
```svelte
<!-- ❌ WRONG: Unnecessary bind:this usage -->
<script>
  let inputRef
  let value = ''

  function focusInput() {
    inputRef.focus()
  }

  onMount(() => {
    inputRef.addEventListener('focus', () => {
      console.log('focused')
    })
  })
</script>

<input bind:this={inputRef} bind:value />
<button on:click={focusInput}>Focus</button>

<!-- ✅ CORRECT: Direct event handling -->
<script lang="ts">
  let inputRef: HTMLInputElement
  let value = $state('')

  function focusInput() {
    inputRef.focus()
  }

  function handleFocus() {
    console.log('focused')
  }
</script>

<input bind:this={inputRef} bind:value onfocus={handleFocus} />
<button onclick={focusInput}>Focus</button>
```

## 7. Slot Migration Mistakes

### Mistake: Using Old Slot Syntax
```svelte
<!-- ❌ WRONG: Svelte 4 slots -->
<!-- Card.svelte -->
<div class="card">
  <div class="header">
    <slot name="header"></slot>
  </div>

  <div class="content">
    <slot></slot>
  </div>

  <div class="footer">
    <slot name="footer" {data}></slot>
  </div>
</div>

<!-- Usage -->
<Card>
  <h1 slot="header">Title</h1>
  <p>Content here</p>
  <div slot="footer" let:data>
    Footer: {data.info}
  </div>
</Card>

<!-- ✅ CORRECT: Svelte 5 snippets -->
<!-- Card.svelte -->
<script lang="ts">
  interface Props {
    header?: Snippet
    children?: Snippet
    footer?: Snippet<[{ info: string }]>
  }

  let { header, children, footer }: Props = $props()

  let data = { info: 'Footer data' }
</script>

<div class="card">
  <div class="header">
    {@render header?.()}
  </div>

  <div class="content">
    {@render children?.()}
  </div>

  <div class="footer">
    {@render footer?.(data)}
  </div>
</div>

<!-- Usage -->
<Card>
  {#snippet header()}
    <h1>Title</h1>
  {/snippet}

  {#snippet children()}
    <p>Content here</p>
  {/snippet}

  {#snippet footer(data)}
    <div>Footer: {data.info}</div>
  {/snippet}
</Card>
```

## 8. TypeScript Migration Mistakes

### Mistake: Component Typing
```svelte
<!-- ❌ WRONG: Svelte 4 TypeScript -->
<script lang="ts">
  export let title: string
  export let count: number = 0
  export let items: Item[] = []
  export let onClick: (event: MouseEvent) => void = () => {}
</script>

<!-- ✅ CORRECT: Svelte 5 TypeScript -->
<script lang="ts">
  interface Props {
    title: string
    count?: number
    items?: Item[]
    onClick?: (event: MouseEvent) => void
  }

  let {
    title,
    count = 0,
    items = [],
    onClick = () => {}
  }: Props = $props()
</script>
```

## Quick Migration Checklist

### Search & Replace Patterns
```bash
# ❌ Find these patterns in your code:
# Reactive statements
grep -r '\$:' src/

# Export let
grep -r 'export let' src/

# Event directives
grep -r 'on:' src/

# Lifecycle imports
grep -r 'onMount\|onDestroy\|beforeUpdate\|afterUpdate' src/

# Store subscriptions
grep -r '\$[a-zA-Z]' src/
```

### Automated Migration
```bash
# ✅ Use official migration tool
npx sv migrate svelte-5

# ✅ Check for remaining issues
npx svelte-check
```

### Manual Migration Steps
1. **State**: Replace `let` with `$state()`
2. **Props**: Replace `export let` with `$props()`
3. **Derived**: Replace `$:` with `$derived()`
4. **Events**: Replace `on:click` with `onclick`
5. **Effects**: Replace `onMount` with `$effect`
6. **Slots**: Replace slots with snippets
7. **Stores**: Convert to reactive modules where appropriate

## Common Error Messages & Fixes

### "Export 'let' is not valid in rune mode"
```svelte
<!-- ❌ Error -->
export let title: string

<!-- ✅ Fix -->
let { title }: { title: string } = $props()
```

### "Reactive statement cannot be used in rune mode"
```svelte
<!-- ❌ Error -->
$: doubled = count * 2

<!-- ✅ Fix -->
let doubled = $derived(count * 2)
```

### "Event directive 'on:click' cannot be used in rune mode"
```svelte
<!-- ❌ Error -->
<button on:click={handler}>Click</button>

<!-- ✅ Fix -->
<button onclick={handler}>Click</button>
```

**Remember**: Svelte 5 is a complete paradigm shift. Don't mix old and new patterns—commit fully to the runes approach for the best experience!