<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Select from './Select.svelte';

  const { Story } = defineMeta({
    title: 'Primitives/Select',
    component: Select,
    tags: ['autodocs']
  });

  const countryOptions = [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
    { value: 'au', label: 'Australia' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
    { value: 'jp', label: 'Japan' }
  ];

  const categoryOptions = [
    { value: 'clothing', label: 'Clothing' },
    { value: 'shoes', label: 'Shoes' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'bags', label: 'Bags' },
    { value: 'jewelry', label: 'Jewelry' }
  ];

  const sizeOptions = [
    { value: 'xs', label: 'Extra Small' },
    { value: 's', label: 'Small' },
    { value: 'm', label: 'Medium' },
    { value: 'l', label: 'Large' },
    { value: 'xl', label: 'Extra Large' },
    { value: 'xxl', label: '2X Large', disabled: true }
  ];
</script>

<Story name="Default">
  <div style="padding: 2rem;">
    <Select options={countryOptions} placeholder="Select a country" />
  </div>
</Story>

<Story name="With Value">
  <div style="padding: 2rem;">
    <Select options={countryOptions} value="us" />
  </div>
</Story>

<Story name="Categories">
  <div style="padding: 2rem;">
    <Select options={categoryOptions} placeholder="Select a category" />
  </div>
</Story>

<Story name="Sizes with Disabled">
  <div style="padding: 2rem;">
    <Select options={sizeOptions} placeholder="Select a size" />
  </div>
</Story>

<Story name="Disabled">
  <div style="padding: 2rem;">
    <Select options={countryOptions} value="uk" disabled />
  </div>
</Story>

<Story name="Required">
  <div style="padding: 2rem;">
    <Select options={categoryOptions} placeholder="Category *" required />
  </div>
</Story>

<Story name="Full Width">
  <div style="padding: 2rem;">
    <Select 
      options={countryOptions} 
      placeholder="Select a country" 
      class="w-full"
    />
  </div>
</Story>

<Story name="Multiple Selects">
  <div style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
    <Select options={categoryOptions} placeholder="Category" />
    <Select options={sizeOptions} placeholder="Size" />
    <Select options={countryOptions} placeholder="Country" />
  </div>
</Story>
