<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    searchValue?: string;
    placeholder?: string;
    onSearch?: (query: string) => void;
    onInput?: (query: string) => void;
    leftSection?: Snippet;
    rightSection?: Snippet;
    class?: string;
    searchId?: string;
  }

  let {
    searchValue = $bindable(''),
    placeholder = 'Search...',
    onSearch,
    onInput,
    leftSection,
    rightSection,
    class: className = '',
    searchId = 'integrated-search-input'
  }: Props = $props();

  function handleInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    searchValue = value;
    onInput?.(value);
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (searchValue.trim()) {
      onSearch?.(searchValue.trim());
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && searchValue.trim()) {
      onSearch?.(searchValue.trim());
    }
  }
</script>

<form onsubmit={handleSubmit} class="w-full {className}">
  <div class="bg-gray-50 rounded-xl flex items-center relative">
    <!-- Left Section (Category Dropdown/Filter) -->
    {#if leftSection}
      <div class="shrink-0">
        {@render leftSection()}
      </div>

      <!-- Vertical Separator -->
      <div class="w-px h-6 bg-gray-300"></div>
    {/if}
    
    <!-- Search Input -->
    <div class="flex-1 relative">
      <input
        id={searchId}
        type="search"
        value={searchValue}
        oninput={handleInput}
        onkeydown={handleKeyDown}
        {placeholder}
        class="w-full h-12 pl-10 {rightSection ? 'pr-16' : 'pr-4'} bg-transparent border-0 text-base placeholder-gray-500 focus:ring-0 focus:outline-none"
        autocomplete="off"
        spellcheck="false"
        aria-label={placeholder}
      />
      <svg class="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>

    <!-- Right Section (Dropdown/Actions) -->
    {#if rightSection}
      <!-- Vertical Separator -->
      <div class="w-px h-6 bg-gray-300"></div>
      
      <div class="shrink-0">
        {@render rightSection()}
      </div>
    {/if}
  </div>
</form>