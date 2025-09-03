<script lang="ts">
  import { Accordion, type AccordionItem } from './primitives/accordion';
  
  interface ShippingEstimate {
    cost: number
    currency: string
    estimatedDays: string
    method: string
  }

  interface Props {
    description?: string
    location?: string
    brand?: string
    condition?: string
    size?: string
    color?: string
    material?: string
    shippingEstimate?: ShippingEstimate
  }

  let { 
    description,
    location,
    brand,
    condition,
    size,
    color,
    material,
    shippingEstimate
  }: Props = $props()

  const hasDetails = $derived(brand || condition || size || color || material || location)
  
  const detailsContent = $derived(() => {
    const details = [];
    if (brand) details.push(`Brand: ${brand}`);
    if (condition) details.push(`Condition: ${condition}`);
    if (size) details.push(`Size: ${size}`);
    if (color) details.push(`Color: ${color}`);
    if (material) details.push(`Material: ${material}`);
    if (location) details.push(`Ships from: ${location}`);
    return details.join('\n');
  });

  const shippingContent = $derived(() => {
    if (!shippingEstimate?.cost || !shippingEstimate?.currency) return '';
    
    const formatter = new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: shippingEstimate.currency || 'EUR'
    });
    
    const details = [];
    details.push(`Shipping Cost: ${formatter.format(shippingEstimate.cost || 0)}`);
    if (shippingEstimate.estimatedDays) {
      details.push(`Delivery Time: ${shippingEstimate.estimatedDays}`);
    }
    if (shippingEstimate.method) {
      details.push(`Method: ${shippingEstimate.method}`);
    }
    details.push('Items are shipped securely and tracked. Return within 14 days if not as described.');
    return details.join('\n');
  });

  const accordionItems = $derived(() => {
    const items: AccordionItem[] = [];
    
    if (description) {
      items.push({
        id: 'description',
        title: 'Description',
        content: description
      });
    }
    
    if (hasDetails) {
      items.push({
        id: 'details',
        title: 'Details',
        content: detailsContent
      });
    }
    
    if (shippingEstimate?.cost && shippingEstimate?.currency) {
      items.push({
        id: 'shipping',
        title: 'Shipping & Returns',
        content: shippingContent
      });
    }
    
    return items;
  });
</script>

<div class="product-details">
  <Accordion 
    items={accordionItems} 
    multiple={true}
    class="product-accordion" 
  />
</div>

<style>
  .product-details {
    @apply bg-[color:var(--surface-base)];
  }
  
  :global(.product-accordion .accordion-content-inner) {
    @apply whitespace-pre-line;
  }
</style>