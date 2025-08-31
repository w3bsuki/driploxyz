# Select Component Example

## Basic Usage

```svelte
<script>
  import { Select } from '@repo/ui/primitives';

  let selectedValue = $state(null);
  
  const options = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'orange', label: 'Orange' },
    { value: 'grape', label: 'Grape', disabled: true }
  ];
</script>

<Select
  {options}
  bind:value={selectedValue}
  placeholder="Choose a fruit"
  onValueChange={(value) => console.log('Selected:', value)}
/>
```

## With Form Integration

```svelte
<script>
  import { Select } from '@repo/ui/primitives';

  let formData = $state({
    category: null,
    size: 'M'
  });
  
  const categories = [
    { value: 'men', label: 'Men' },
    { value: 'women', label: 'Women' },
    { value: 'kids', label: 'Kids' }
  ];
  
  const sizes = [
    { value: 'XS', label: 'Extra Small' },
    { value: 'S', label: 'Small' },
    { value: 'M', label: 'Medium' },
    { value: 'L', label: 'Large' },
    { value: 'XL', label: 'Extra Large' }
  ];
</script>

<form>
  <div class="space-y-4">
    <div>
      <label for="category" class="block text-sm font-medium mb-2">
        Category *
      </label>
      <Select
        id="category"
        name="category"
        options={categories}
        bind:value={formData.category}
        placeholder="Select category"
        required
      />
    </div>
    
    <div>
      <label for="size" class="block text-sm font-medium mb-2">
        Size
      </label>
      <Select
        id="size"
        name="size"
        options={sizes}
        bind:value={formData.size}
        placeholder="Select size"
      />
    </div>
  </div>
</form>
```

## Custom Styling

```svelte
<Select
  options={options}
  bind:value={selectedValue}
  class="w-full"
  triggerClass="border-blue-500 focus:ring-blue-500"
  menuClass="border-blue-300"
  optionClass="hover:bg-blue-50"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `SelectOption[]` | `[]` | Array of option objects |
| `value` | `string \| null` | `null` | Selected value (bindable) |
| `placeholder` | `string` | `'Select an option'` | Placeholder text |
| `disabled` | `boolean` | `false` | Disable the select |
| `required` | `boolean` | `false` | Mark as required for forms |
| `name` | `string` | `undefined` | Form field name |
| `id` | `string` | `undefined` | Element ID |
| `onValueChange` | `function` | `undefined` | Value change callback |
| `positioning` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | Dropdown position |
| `portal` | `string \| HTMLElement \| null` | `'body'` | Portal container |
| `class` | `string` | `''` | Additional CSS classes |
| `triggerClass` | `string` | `''` | Trigger button classes |
| `menuClass` | `string` | `''` | Menu container classes |
| `optionClass` | `string` | `''` | Option item classes |
| `children` | `Snippet` | `undefined` | Custom content snippet |

## SelectOption Interface

```typescript
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
```

## Features

- **Mobile-first design** with 44px touch targets
- **Keyboard navigation** with arrow keys and Enter/Space
- **TypeScript support** with full type safety
- **Accessibility** with ARIA attributes and screen reader support  
- **Form integration** with hidden input for form submissions
- **Customizable styling** via CSS classes and design tokens
- **Portal support** for dropdown positioning
- **Disabled options** support
- **Custom content** via snippets