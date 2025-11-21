<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Tooltip from './Tooltip.svelte';
  import Button from '../button/Button.svelte';

  const { Story } = defineMeta({
    title: 'Primitives/Tooltip',
    component: Tooltip,
    tags: ['autodocs']
  });
</script>

<Story name="Default Top">
  <div style="padding: 4rem; display: flex; justify-content: center;">
    <Tooltip content="This is a helpful tooltip">
      <Button variant="primary">Hover me</Button>
    </Tooltip>
  </div>
</Story>

<Story name="Bottom Position">
  <div style="padding: 4rem; display: flex; justify-content: center;">
    <Tooltip content="Tooltip appears below" positioning={{ side: 'bottom' }}>
      <Button variant="secondary">Hover for bottom tooltip</Button>
    </Tooltip>
  </div>
</Story>

<Story name="Left Position">
  <div style="padding: 4rem; display: flex; justify-content: center;">
    <Tooltip content="Tooltip on the left" positioning={{ side: 'left' }}>
      <Button variant="outline">Hover for left tooltip</Button>
    </Tooltip>
  </div>
</Story>

<Story name="Right Position">
  <div style="padding: 4rem; display: flex; justify-content: center;">
    <Tooltip content="Tooltip on the right" positioning={{ side: 'right' }}>
      <Button variant="ghost">Hover for right tooltip</Button>
    </Tooltip>
  </div>
</Story>

<Story name="Long Content">
  <div style="padding: 4rem; display: flex; justify-content: center;">
    <Tooltip content="This is a longer tooltip with more detailed information that might wrap to multiple lines if needed.">
      <Button variant="primary">Hover for detailed info</Button>
    </Tooltip>
  </div>
</Story>

<Story name="Quick Delay">
  <div style="padding: 4rem; display: flex; justify-content: center;">
    <Tooltip content="Quick appearance" openDelay={200}>
      <Button variant="secondary">Fast tooltip</Button>
    </Tooltip>
  </div>
</Story>

<Story name="Slow Delay">
  <div style="padding: 4rem; display: flex; justify-content: center;">
    <Tooltip content="Delayed appearance" openDelay={1500}>
      <Button variant="outline">Slow tooltip</Button>
    </Tooltip>
  </div>
</Story>

<Story name="Multiple Tooltips">
  <div style="padding: 4rem; display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
    <Tooltip content="Save your changes">
      <Button variant="primary">Save</Button>
    </Tooltip>
    <Tooltip content="Cancel and go back">
      <Button variant="secondary">Cancel</Button>
    </Tooltip>
    <Tooltip content="Delete permanently" positioning={{ side: 'bottom' }}>
      <Button variant="danger">Delete</Button>
    </Tooltip>
    <Tooltip content="Need help?" positioning={{ side: 'bottom' }}>
      <Button variant="ghost">Help</Button>
    </Tooltip>
  </div>
</Story>

<Story name="Icon Button with Tooltip">
  <div style="padding: 4rem; display: flex; gap: 1rem; justify-content: center;">
    <Tooltip content="Add to favorites">
      <button style="padding: 0.5rem; border: 1px solid var(--border); border-radius: 0.5rem; background: white; cursor: pointer;">
        ❤️
      </button>
    </Tooltip>
    <Tooltip content="Share">
      <button style="padding: 0.5rem; border: 1px solid var(--border); border-radius: 0.5rem; background: white; cursor: pointer;">
        📤
      </button>
    </Tooltip>
    <Tooltip content="Settings">
      <button style="padding: 0.5rem; border: 1px solid var(--border); border-radius: 0.5rem; background: white; cursor: pointer;">
        ⚙️
      </button>
    </Tooltip>
  </div>
</Story>

<Story name="Alignment Start">
  <div style="padding: 4rem; display: flex; justify-content: center;">
    <Tooltip content="Aligned to start" positioning={{ side: 'bottom', align: 'start' }}>
      <Button variant="primary">Start aligned tooltip</Button>
    </Tooltip>
  </div>
</Story>

<Story name="Alignment End">
  <div style="padding: 4rem; display: flex; justify-content: center;">
    <Tooltip content="Aligned to end" positioning={{ side: 'bottom', align: 'end' }}>
      <Button variant="primary">End aligned tooltip</Button>
    </Tooltip>
  </div>
</Story>
