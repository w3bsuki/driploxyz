<script lang="ts">
  interface Subcategory {
    id: string;
    name: string;
    slug: string;
  }

  interface Props {
    isOpen?: boolean;
    subcategories?: Subcategory[];
    onClose?: () => void;
    onSubcategorySelect?: (slug: string) => void;
    translateSubcategory?: (name: string) => string;
  }

  let { 
    isOpen = false,
    subcategories = [],
    onClose,
    onSubcategorySelect,
    translateSubcategory = (name: string) => name
  }: Props = $props();

  function handleSubcategoryClick(subcategory: Subcategory) {
    onSubcategorySelect?.(subcategory.slug);
    onClose?.();
  }

  function handleBackdropClick() {
    onClose?.();
  }
</script>

{#if isOpen}
  <!-- Backdrop -->
  <button 
    class="fixed inset-0 bg-black bg-opacity-50 z-40 cursor-default"
    onclick={handleBackdropClick}
    aria-label="Close menu"
    tabindex="-1"
  ></button>

  <!-- Menu -->
  <div class="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-sm md:shadow-lg z-50 mt-2">
    <div class="p-4">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {#each subcategories as subcategory}
          <button
            onclick={() => handleSubcategoryClick(subcategory)}
            class="text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors"
          >
            <span class="text-sm font-medium text-gray-900">
              {translateSubcategory(subcategory.name)}
            </span>
          </button>
        {/each}
      </div>
    </div>
  </div>
{/if}