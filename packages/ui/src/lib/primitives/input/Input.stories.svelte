<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Input from './Input.svelte';

  const { Story } = defineMeta({
    title: 'Primitives/Input',
    component: Input,
    tags: ['autodocs']
  });
</script>

<Story name="Default">
  <Input label="Username" placeholder="Enter your username" />
</Story>

<Story name="Email">
  <Input label="Email" type="email" placeholder="your.email@example.com" />
</Story>

<Story name="With Error">
  <Input 
    label="Email" 
    type="email" 
    value="invalid-email" 
    error="Please enter a valid email address" 
  />
</Story>

<Story name="Required">
  <Input label="Password" type="password" required placeholder="Required field" />
</Story>

<Story name="Disabled">
  <Input label="Readonly Field" value="This field is disabled" disabled />
</Story>

<Story name="With Helper Text">
  <Input 
    label="Username" 
    placeholder="Choose a unique username" 
    helperText="Must be 3-20 characters long" 
  />
</Story>
