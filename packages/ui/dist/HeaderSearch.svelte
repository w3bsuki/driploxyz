<script lang="ts">
  interface Props {
    placeholder?: string;
    onSearch?: (query: string) => void;
    class?: string;
  }

  let { 
    placeholder = 'Search...',
    onSearch,
    class: className = ''
  }: Props = $props();

  function handleSearch(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      const query = (e.target as HTMLInputElement).value.trim();
      if (query) {
        if (onSearch) {
          onSearch(query);
        } else {
          window.location.href = `/search?q=${encodeURIComponent(query)}`;
        }
      }
    }
  }
</script>

<div class="hidden sm:flex flex-1 max-w-lg mx-8 {className}">
  <div class="relative flex-1">
    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <input
      type="text"
      class="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
      {placeholder}
      onkeydown={handleSearch}
    />
  </div>
</div>