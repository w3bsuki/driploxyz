<!--
  Enhanced Accordion Component - Uses Melt UI Primitives
  Provides a simple interface for creating accordions with multiple items
  Based on the existing primitive in primitives/accordion/
-->
<script lang="ts">
  import MeltAccordion from '../../primitives/accordion/Accordion.svelte';
  
  interface Props {
    items: Array<{
      title: string;
      content?: string;
      contentSnippet?: () => unknown;
      id?: string;
    }>;
    allowMultiple?: boolean;
    class?: string;
    variant?: 'default' | 'outline' | 'ghost';
  }

  let {
    items = [],
    allowMultiple = false,
    class: className = '',
    variant = 'default'
  }: Props = $props();

  // Transform items to match the primitive's expected format
  const accordionItems = $derived(items.map((item, index) => ({
    id: item.id || `item-${index}`,
    title: item.title,
    content: item.content,
    contentSnippet: item.contentSnippet
  })));

  function getVariantClasses(variant: string) {
    switch (variant) {
      case 'outline':
        return 'border-2 border-[color:var(--border-emphasis)] bg-transparent';
      case 'ghost':
        return 'border-0 bg-transparent shadow-none';
      default:
        return '';
    }
  }
</script>

<MeltAccordion
  items={accordionItems}
  multiple={allowMultiple}
  class="{getVariantClasses(variant)} {className}"
/>