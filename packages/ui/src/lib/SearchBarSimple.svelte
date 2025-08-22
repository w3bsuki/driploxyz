<script lang="ts">
  interface Props {
    value?: string;
    placeholder?: string;
    onSearch?: (query: string) => void;
    class?: string;
  }

  let { 
    value = $bindable(''),
    placeholder = 'Search...',
    onSearch,
    class: className = ''
  }: Props = $props();

  function handleSubmit(e: KeyboardEvent) {
    if (e.key === 'Enter' && value.trim()) {
      onSearch?.(value.trim());
    }
  }
</script>

<div class="relative {className}">
  <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
  
  <input
    bind:value
    {placeholder}
    type="search"
    class="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-full text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black"
    onkeydown={handleSubmit}
  />
  
  {#if value}
    <button
      onclick={() => value = ''}
      class="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full"
      aria-label="Clear"
    >
      <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  {/if}
</div>