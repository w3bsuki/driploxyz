<script lang="ts">
  interface Props {
    price: number;
    currency?: string;
    formatPrice?: (price: number) => string;
    class?: string;
  }

  let { 
    price,
    currency = '$',
    formatPrice,
    class: className = 'text-sm text-gray-900'
  }: Props = $props();

  const formattedPrice = $derived(
    formatPrice ? formatPrice(price) : `${currency}${price}`
  );
</script>

<p class={className}>
  {formattedPrice}
</p>