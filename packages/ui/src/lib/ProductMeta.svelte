<script lang="ts">
  interface Props {
    mainCategoryName?: string;
    categoryName?: string;
    subcategoryName?: string;
    size?: string;
    brand?: string;
    sizeText?: string;
    categoryTranslation?: (category: string) => string;
  }

  let { 
    mainCategoryName,
    categoryName,
    subcategoryName,
    size,
    brand,
    sizeText = 'Size',
    categoryTranslation
  }: Props = $props();

  const displayCategory = $derived(
    mainCategoryName || categoryName
  );
  
  const translatedCategory = $derived(
    displayCategory && categoryTranslation ? categoryTranslation(displayCategory) : displayCategory
  );
</script>

{#if translatedCategory}
  <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">
    {translatedCategory}
  </p>
{/if}

<p class="text-xs text-gray-500">
  {#if subcategoryName}
    <span class="font-medium text-gray-500">{subcategoryName}</span>
  {/if}
  {#if subcategoryName && size} / {/if}
  {#if size}{sizeText} {size}{/if}
  {#if (subcategoryName || size) && brand} / {/if}
  {#if brand}
    <span class="text-gray-500">{brand}</span>
  {/if}
</p>