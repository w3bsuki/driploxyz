<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Button from './Button.svelte';

  const { Story } = defineMeta({
    title: 'Primitives/Button',
    component: Button,
    tags: ['autodocs']
  });
</script>

<Story name="Primary">
  <Button variant="primary">Primary Button</Button>
</Story>

<Story name="Secondary">
  <Button variant="secondary">Secondary Button</Button>
</Story>

<Story name="Outline">
  <Button variant="outline">Outline Button</Button>
</Story>

<Story name="Ghost">
  <Button variant="ghost">Ghost Button</Button>
</Story>

<Story name="Danger">
  <Button variant="danger">Danger Button</Button>
</Story>

<Story name="Loading">
  <Button variant="primary" loading>Loading...</Button>
</Story>

<Story name="Disabled">
  <Button variant="primary" disabled>Disabled Button</Button>
</Story>

<Story name="Sizes">
  <div style="display: flex; gap: 1rem; align-items: center;">
    <Button size="sm">Small</Button>
    <Button size="md">Medium</Button>
    <Button size="lg">Large</Button>
  </div>
</Story>

<Story name="Full Width">
  <Button variant="primary" fullWidth>Full Width Button</Button>
</Story>
