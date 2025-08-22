<script lang="ts">
  interface Props {
    value?: string;
    placeholder?: string;
    onSearch?: (query: string) => void;
    onFilter?: () => void;
    showCategoriesButton?: boolean;
    categoriesText?: string;
    class?: string;
  }

  let { 
    value = $bindable(''),
    placeholder = 'Search...',
    onSearch,
    onFilter,
    showCategoriesButton = true,
    categoriesText = 'Categories',
    class: className = ''
  }: Props = $props();

  function handleSubmit(e: KeyboardEvent) {
    if (e.key === 'Enter' && value.trim()) {
      onSearch?.(value.trim());
    }
  }
</script>

<div class="bg-white rounded-full border border-gray-200 p-1 shadow-sm hover:shadow-md focus-within:border-gray-400 transition-all {className}">
  <div class="bg-gray-50 relative rounded-full overflow-hidden min-h-[48px]">
    <div class="relative flex items-center min-h-[48px]">
      <div class="absolute left-3 flex items-center justify-center pointer-events-none">
        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      <input
        bind:value
        {placeholder}
        type="text"
        class="flex-1 bg-transparent text-base placeholder-gray-500 focus:outline-none border-0 focus:ring-0 min-w-0 pl-10 pr-2 py-3"
        onkeydown={handleSubmit}
      />
      
      <div class="flex items-center pr-2 gap-1">
        {#if value}
          <button
            type="button"
            onclick={() => value = ''}
            class="p-1.5 hover:bg-gray-200 rounded-full transition-colors mr-1"
            aria-label="Clear search"
          >
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        {/if}
        
        {#if showCategoriesButton}
          <button
            type="button"
            onclick={onFilter}
            class="px-3 py-1.5 bg-white rounded-full hover:bg-gray-50 transition-colors flex items-center gap-1 ring-1 ring-gray-200 whitespace-nowrap"
          >
            <svg class="w-4 h-4 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
            <span class="text-xs font-medium text-gray-600 hidden sm:inline">{categoriesText}</span>
          </button>
        {/if}
      </div>
    </div>
  </div>
</div>