# Svelte 5 Runes Guide

**Extracted from official Svelte documentation** - Complete reference for zero-mistake Svelte 5 development.

## What Are Runes?

Runes are symbols that control the Svelte compiler. They use a `$` prefix and look like functions. **Runes are the ONLY way to handle reactivity in Svelte 5.**

## Core Rules (NEVER Break These)

### ✅ DO - Svelte 5 Patterns
- Use `$state()` for all reactive data
- Use `$derived()` instead of `$:` reactive statements
- Use `$props()` instead of `export let`
- Use `onclick` instead of `on:click`
- Use `$effect()` instead of `onMount`/`onDestroy`

### ❌ NEVER - Svelte 4 Patterns (Forbidden)
- `let count = 0` for reactive data → Use `let count = $state(0)`
- `$: doubled = count * 2` → Use `let doubled = $derived(count * 2)`
- `export let title` → Use `let { title } = $props()`
- `on:click={handler}` → Use `onclick={handler}`
- `onMount(() => {})` → Use `$effect(() => {})`

## 1. State Management (`$state`)

### Basic Usage
```svelte
<script lang="ts">
  // ✅ CORRECT: Reactive primitives
  let count = $state(0)
  let name = $state('Alice')
  let isVisible = $state(true)

  // ✅ CORRECT: Arrays and objects (deeply reactive)
  let todos = $state([
    { id: 1, text: 'Learn Svelte 5', done: false },
    { id: 2, text: 'Build awesome app', done: false }
  ])

  let user = $state({
    name: 'John',
    age: 30,
    preferences: { theme: 'dark' }
  })

  // ❌ NEVER: Plain let for reactive data
  // let count = 0 // Not reactive in Svelte 5!
</script>
```

### Deep Reactivity Rules
```svelte
<script lang="ts">
  let todos = $state([{ text: 'Task 1', done: false }])

  function addTodo(text: string) {
    // ✅ CORRECT: Push to reactive array
    todos.push({ text, done: false })
  }

  function toggleTodo(index: number) {
    // ✅ CORRECT: Mutate nested property (works with proxy)
    todos[index].done = !todos[index].done
  }

  function clearTodos() {
    // ✅ CORRECT: Reassign entire array
    todos = []
  }
</script>
```

### Non-Reactive State (`$state.raw`)
```svelte
<script lang="ts">
  // ✅ CORRECT: Large static data that doesn't need reactivity
  let staticConfig = $state.raw({
    apiEndpoints: { /* hundreds of entries */ },
    constants: { /* large config */ }
  })

  // ✅ CORRECT: Reassign entire object (only way to update)
  function updateConfig() {
    staticConfig = { ...staticConfig, newField: 'value' }
  }

  // ❌ NEVER: Mutate $state.raw objects
  // staticConfig.newField = 'value' // Has no effect!
</script>
```

### Class-Based State
```svelte
<script lang="ts">
  class Todo {
    text = $state('')
    done = $state(false)

    constructor(text: string) {
      this.text = text
    }

    toggle() {
      this.done = !this.done
    }
  }

  let todo = new Todo('Learn Svelte 5')
</script>
```

## 2. Derived State (`$derived`)

### Simple Derivations
```svelte
<script lang="ts">
  let count = $state(0)

  // ✅ CORRECT: Simple derived value
  let doubled = $derived(count * 2)
  let message = $derived(`Count is ${count}`)

  // ✅ CORRECT: Derived from multiple states
  let firstName = $state('John')
  let lastName = $state('Doe')
  let fullName = $derived(`${firstName} ${lastName}`)

  // ❌ NEVER: Use $: reactive statements
  // $: doubled = count * 2 // Svelte 4 syntax, FORBIDDEN
</script>
```

### Complex Derivations (`$derived.by`)
```svelte
<script lang="ts">
  let items = $state([1, 2, 3, 4, 5])
  let filter = $state('even')

  // ✅ CORRECT: Complex logic with $derived.by
  let filteredItems = $derived.by(() => {
    switch (filter) {
      case 'even':
        return items.filter(n => n % 2 === 0)
      case 'odd':
        return items.filter(n => n % 2 === 1)
      default:
        return items
    }
  })

  // ✅ CORRECT: Expensive computations
  let expensiveResult = $derived.by(() => {
    // Complex algorithm that takes time
    return items.reduce((acc, item) => {
      // ... expensive computation
      return acc + item * Math.random()
    }, 0)
  })
</script>
```

### Dependency Tracking Rules
```svelte
<script lang="ts">
  let a = $state(1)
  let b = $state(2)
  let condition = $state(true)

  // ✅ Dependencies tracked automatically
  let result = $derived(condition ? a : b)
  // Dependencies: condition, a, b (all tracked)

  // ✅ Only reads synchronously tracked dependencies
  let asyncResult = $derived.by(() => {
    const base = a // Tracked
    setTimeout(() => {
      console.log(b) // NOT tracked (async)
    }, 100)
    return base * 2
  })
</script>
```

## 3. Props (`$props`)

### Basic Props Pattern
```svelte
<script lang="ts">
  // ✅ CORRECT: TypeScript interface + destructuring
  interface Props {
    title: string
    count?: number
    items?: string[]
    onUpdate?: (value: number) => void
  }

  let { title, count = 0, items = [], onUpdate }: Props = $props()

  // ✅ CORRECT: Use props in component
  function handleClick() {
    onUpdate?.(count + 1)
  }

  // ❌ NEVER: Export let (Svelte 4 syntax)
  // export let title: string // FORBIDDEN
  // export let count = 0     // FORBIDDEN
</script>

<h1>{title}</h1>
<p>Count: {count}</p>
<button onclick={handleClick}>Update</button>
```

### Props Mutation Rules
```svelte
<script lang="ts">
  interface Props {
    count: number
    user: { name: string; age: number }
  }

  let { count, user }: Props = $props()

  // ❌ NEVER: Mutate props directly
  // count++ // Error: ownership_invalid_mutation

  // ❌ NEVER: Mutate nested prop properties
  // user.name = 'Alice' // Warning: ownership_invalid_mutation

  // ✅ CORRECT: Use callback props for parent communication
  interface PropsWithCallback {
    count: number
    onIncrement: () => void
  }

  let { count: safeCount, onIncrement }: PropsWithCallback = $props()

  function handleClick() {
    onIncrement() // Let parent handle state change
  }
</script>
```

### Rest Props Pattern
```svelte
<script lang="ts">
  interface Props {
    title: string
    count?: number
    [key: string]: any // For rest props
  }

  let { title, count = 0, ...restProps }: Props = $props()
</script>

<div {...restProps}>
  <h1>{title}</h1>
  <p>{count}</p>
</div>
```

## 4. Bindable Props (`$bindable`)

### Two-Way Binding
```svelte
<!-- Child.svelte -->
<script lang="ts">
  interface Props {
    value: string
  }

  let { value = $bindable() }: Props = $props()
</script>

<input bind:value />

<!-- Parent.svelte -->
<script lang="ts">
  let text = $state('Hello')
</script>

<!-- Both patterns work -->
<Child bind:value={text} />          <!-- Two-way binding -->
<Child value={text} />               <!-- One-way prop -->
```

### Bindable with Default Values
```svelte
<script lang="ts">
  interface Props {
    count: number
    step?: number
  }

  let {
    count = $bindable(0),      // Bindable with default
    step = 1                   // Regular prop with default
  }: Props = $props()
</script>

<button onclick={() => count += step}>
  Count: {count} (step: {step})
</button>
```

## 5. Effects (`$effect`)

### Basic Effect Patterns
```svelte
<script lang="ts">
  let count = $state(0)
  let name = $state('Alice')

  // ✅ CORRECT: Side effects (DOM, analytics, etc.)
  $effect(() => {
    console.log(`Count changed to: ${count}`)
    // Dependencies tracked automatically: count
  })

  // ✅ CORRECT: Multiple dependencies
  $effect(() => {
    document.title = `${name} - Count: ${count}`
    // Dependencies: name, count
  })

  // ✅ CORRECT: Cleanup with return function
  $effect(() => {
    const timer = setInterval(() => {
      console.log('Timer tick')
    }, 1000)

    // Cleanup function
    return () => {
      clearInterval(timer)
    }
  })

  // ❌ NEVER: Don't update state inside effects (infinite loops)
  // $effect(() => {
  //   count++ // DON'T DO THIS!
  // })
</script>
```

### DOM Manipulation
```svelte
<script lang="ts">
  let canvas: HTMLCanvasElement
  let color = $state('red')
  let size = $state(100)

  // ✅ CORRECT: DOM manipulation in effects
  $effect(() => {
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = color
        ctx.fillRect(0, 0, size, size)
      }
    }
  })
</script>

<canvas bind:this={canvas} width={200} height={200}></canvas>
```

### Effect Timing (`$effect.pre`)
```svelte
<script lang="ts">
  let items = $state([1, 2, 3])
  let element: HTMLElement

  // ✅ Runs before DOM updates
  $effect.pre(() => {
    console.log('Before DOM update, items:', items.length)
  })

  // ✅ Runs after DOM updates (default)
  $effect(() => {
    console.log('After DOM update, element height:', element?.offsetHeight)
  })
</script>

<div bind:this={element}>
  {#each items as item}
    <p>{item}</p>
  {/each}
</div>
```

### When NOT to Use Effects
```svelte
<script lang="ts">
  let count = $state(0)

  // ❌ DON'T: Use effects to derive state
  // let doubled = $state(0)
  // $effect(() => {
  //   doubled = count * 2 // Use $derived instead!
  // })

  // ✅ CORRECT: Use $derived for computed values
  let doubled = $derived(count * 2)

  // ❌ DON'T: Use effects to sync state
  // let a = $state(1)
  // let b = $state(1)
  // $effect(() => {
  //   b = a // Use $derived instead!
  // })

  // ✅ CORRECT: Derive one from the other
  let a = $state(1)
  let b = $derived(a)
</script>
```

## 6. Event Handling (Svelte 5 Style)

### Standard HTML Events
```svelte
<script lang="ts">
  let count = $state(0)

  function handleClick(event: MouseEvent) {
    console.log('Clicked at:', event.clientX, event.clientY)
    count++
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      count++
    }
  }

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement
    console.log('Input value:', target.value)
  }
</script>

<!-- ✅ CORRECT: Standard HTML attributes -->
<button onclick={handleClick}>Count: {count}</button>
<button onkeydown={handleKeydown}>Press Enter</button>
<input oninput={handleInput} />

<!-- ❌ NEVER: Use on: directives (Svelte 4 syntax) -->
<!-- <button on:click={handleClick}> FORBIDDEN -->
```

### Event Modifiers (Svelte 5 way)
```svelte
<script lang="ts">
  function handleSubmit(event: SubmitEvent) {
    event.preventDefault() // Manual prevention
    console.log('Form submitted')
  }

  function handleClick(event: MouseEvent) {
    event.stopPropagation() // Manual stop propagation
    console.log('Button clicked')
  }
</script>

<!-- ✅ CORRECT: Manual event handling -->
<form onsubmit={handleSubmit}>
  <button onclick={handleClick}>Submit</button>
</form>

<!-- ❌ Svelte 4 modifiers don't exist in Svelte 5 -->
<!-- <form on:submit|preventDefault={handleSubmit}> FORBIDDEN -->
```

## 7. Component Communication

### Parent-Child Communication
```svelte
<!-- Child.svelte -->
<script lang="ts">
  interface Props {
    title: string
    onMessage: (msg: string) => void
    onUpdate: (data: { id: number; text: string }) => void
  }

  let { title, onMessage, onUpdate }: Props = $props()

  function sendMessage() {
    onMessage('Hello from child!')
  }

  function sendData() {
    onUpdate({ id: 1, text: 'Updated data' })
  }
</script>

<h2>{title}</h2>
<button onclick={sendMessage}>Send Message</button>
<button onclick={sendData}>Send Data</button>

<!-- Parent.svelte -->
<script lang="ts">
  function handleMessage(msg: string) {
    console.log('Received:', msg)
  }

  function handleUpdate(data: { id: number; text: string }) {
    console.log('Data update:', data)
  }
</script>

<Child
  title="My Component"
  onMessage={handleMessage}
  onUpdate={handleUpdate}
/>
```

## 8. Advanced Patterns

### Reactive Module State
```ts
// store.svelte.ts
let count = $state(0)
let user = $state<{ name: string } | null>(null)

export function getCount() {
  return count
}

export function increment() {
  count++
}

export function setUser(newUser: { name: string } | null) {
  user = newUser
}

export function getUser() {
  return user
}
```

```svelte
<!-- Component.svelte -->
<script lang="ts">
  import { getCount, increment, getUser } from './store.svelte.ts'

  // ✅ CORRECT: Reactive access to module state
  let count = $derived(getCount())
  let user = $derived(getUser())
</script>

<p>Count: {count}</p>
<p>User: {user?.name ?? 'Anonymous'}</p>
<button onclick={increment}>Increment</button>
```

### Component State Inspection
```svelte
<script lang="ts">
  let count = $state(0)
  let user = $state({ name: 'Alice', age: 30 })

  // ✅ Debug reactive state (like console.log but reactive)
  $inspect(count) // Logs whenever count changes
  $inspect(user)  // Logs whenever user changes (deep)

  // ✅ Conditional inspection
  $inspect(count > 5 ? 'High count!' : count)
</script>
```

## Common Mistakes & Solutions

### Mistake 1: Using Svelte 4 Syntax
```svelte
<!-- ❌ WRONG: Svelte 4 patterns -->
<script>
  let count = 0
  $: doubled = count * 2
  export let title

  import { onMount } from 'svelte'
  onMount(() => {
    console.log('mounted')
  })
</script>
<button on:click={() => count++}>{title}</button>

<!-- ✅ CORRECT: Svelte 5 patterns -->
<script lang="ts">
  interface Props {
    title: string
  }

  let count = $state(0)
  let doubled = $derived(count * 2)
  let { title }: Props = $props()

  $effect(() => {
    console.log('mounted')
  })
</script>
<button onclick={() => count++}>{title}</button>
```

### Mistake 2: Mutating Props
```svelte
<!-- ❌ WRONG: Direct prop mutation -->
<script lang="ts">
  interface Props {
    count: number
  }

  let { count }: Props = $props()

  function increment() {
    count++ // Error: ownership_invalid_mutation
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
<button onclick={onIncrement}>Count: {count}</button>
```

### Mistake 3: Effects for Derived State
```svelte
<!-- ❌ WRONG: Effect for computation -->
<script lang="ts">
  let count = $state(0)
  let doubled = $state(0)

  $effect(() => {
    doubled = count * 2 // Don't use effects for this!
  })
</script>

<!-- ✅ CORRECT: Derived state -->
<script lang="ts">
  let count = $state(0)
  let doubled = $derived(count * 2)
</script>
```

## Quick Reference Card

```svelte
<script lang="ts">
  // State
  let count = $state(0)
  let items = $state([1, 2, 3])
  let config = $state.raw({ large: 'object' })

  // Derived
  let doubled = $derived(count * 2)
  let total = $derived.by(() => items.reduce((a, b) => a + b, 0))

  // Props
  interface Props { title: string; onUpdate?: () => void }
  let { title, onUpdate }: Props = $props()
  let { value = $bindable() } = $props()

  // Effects
  $effect(() => console.log('Side effect'))
  $effect.pre(() => console.log('Before DOM'))

  // Debug
  $inspect(count, items)
</script>

<!-- Events -->
<button onclick={() => count++}>Count: {count}</button>
<input bind:value />
```

**Remember**: This guide covers ALL Svelte 5 rune patterns from the official documentation. Use it to prevent every possible mistake!