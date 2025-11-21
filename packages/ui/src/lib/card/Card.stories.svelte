<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Card from '../primitives/card/Card.svelte';

  const { Story } = defineMeta({
    title: 'Components/Card',
    component: Card,
    tags: ['autodocs']
  });
</script>

<Story name="Default">
  <Card>
    <h3 style="margin: 0 0 0.5rem 0; font-size: 1.25rem;">Card Title</h3>
    <p style="margin: 0; color: var(--text-secondary);">
      This is a default card with some content inside. It uses semantic tokens for styling.
    </p>
  </Card>
</Story>

<Story name="Luxury">
  <Card variant="luxury">
    <h3 style="margin: 0 0 0.5rem 0; font-size: 1.25rem;">Luxury Card</h3>
    <p style="margin: 0; color: var(--text-secondary);">
      This is a luxury variant with premium styling and subtle animations.
    </p>
  </Card>
</Story>

<Story name="Premium">
  <Card variant="premium">
    <h3 style="margin: 0 0 0.5rem 0; font-size: 1.25rem;">Premium Card</h3>
    <p style="margin: 0; color: var(--text-secondary);">
      This is a premium variant with enhanced visual treatment.
    </p>
  </Card>
</Story>

<Story name="Elevated">
  <Card elevated>
    <h3 style="margin: 0 0 0.5rem 0; font-size: 1.25rem;">Elevated Card</h3>
    <p style="margin: 0; color: var(--text-secondary);">
      This card has an elevated shadow effect.
    </p>
  </Card>
</Story>

<Story name="Interactive">
  <Card interactive>
    <h3 style="margin: 0 0 0.5rem 0; font-size: 1.25rem;">Interactive Card</h3>
    <p style="margin: 0; color: var(--text-secondary);">
      Hover over this card to see the interactive effect.
    </p>
  </Card>
</Story>
