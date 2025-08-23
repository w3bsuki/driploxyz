<script lang="ts">
  import { onMount } from 'svelte';

  interface SearchSuggestion {
    id: string;
    text: string;
    type: 'product' | 'category' | 'brand' | 'user';
    url?: string;
  }

  interface Props {
    value?: string;
    placeholder?: string;
    class?: string;
    debounceMs?: number;
    minLength?: number;
    suggestions?: SearchSuggestion[];
    loading?: boolean;
    onSearch?: (query: string) => Promise<void> | void;
    onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
    onClear?: () => void;
    showSuggestions?: boolean;
    maxSuggestions?: number;
  }

  let {
    value = $bindable(''),
    placeholder = 'Search products, brands, categories...',
    class: className = '',
    debounceMs = 150,
    minLength = 2,
    suggestions = [],
    loading = false,
    onSearch,
    onSuggestionSelect,
    onClear,
    showSuggestions = true,
    maxSuggestions = 5
  }: Props = $props();

  let inputElement: HTMLInputElement;
  let suggestionsList: HTMLUListElement;
  let isSearching = $state(false);
  let showSuggestionsDropdown = $state(false);
  let selectedSuggestionIndex = $state(-1);
  let debounceTimer: number | undefined;
  let abortController: AbortController | undefined;

  // Filter and limit suggestions
  const filteredSuggestions = $derived(() => {
    if (!value || value.length < minLength) return [];
    
    const filtered = suggestions
      .filter(suggestion => 
        suggestion.text.toLowerCase().includes(value.toLowerCase())
      )
      .slice(0, maxSuggestions);
    
    return filtered;
  });

  // Debounced search function
  function debouncedSearch(query: string) {
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Cancel any ongoing request
    if (abortController) {
      abortController.abort();
    }

    if (query.length < minLength) {
      isSearching = false;
      showSuggestionsDropdown = false;
      return;
    }

    debounceTimer = setTimeout(async () => {
      if (!onSearch) return;

      isSearching = true;
      abortController = new AbortController();

      try {
        await onSearch(query);
        if (showSuggestions && filteredSuggestions.length > 0) {
          showSuggestionsDropdown = true;
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Search error:', error);
        }
      } finally {
        isSearching = false;
      }
    }, debounceMs);
  }

  // Handle input changes
  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    value = target.value;
    selectedSuggestionIndex = -1;
    debouncedSearch(value);
  }

  // Handle suggestion selection
  function selectSuggestion(suggestion: SearchSuggestion) {
    value = suggestion.text;
    showSuggestionsDropdown = false;
    selectedSuggestionIndex = -1;
    onSuggestionSelect?.(suggestion);
  }

  // Handle keyboard navigation
  function handleKeydown(event: KeyboardEvent) {
    if (!showSuggestionsDropdown || filteredSuggestions.length === 0) {
      if (event.key === 'Enter') {
        event.preventDefault();
        debouncedSearch(value);
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        selectedSuggestionIndex = Math.min(
          selectedSuggestionIndex + 1,
          filteredSuggestions.length - 1
        );
        break;
      
      case 'ArrowUp':
        event.preventDefault();
        selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
        break;
      
      case 'Enter':
        event.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          selectSuggestion(filteredSuggestions[selectedSuggestionIndex]);
        } else {
          showSuggestionsDropdown = false;
          debouncedSearch(value);
        }
        break;
      
      case 'Escape':
        showSuggestionsDropdown = false;
        selectedSuggestionIndex = -1;
        inputElement.blur();
        break;
    }
  }

  // Handle clear button
  function handleClear() {
    value = '';
    showSuggestionsDropdown = false;
    selectedSuggestionIndex = -1;
    isSearching = false;
    
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    if (abortController) {
      abortController.abort();
    }
    
    onClear?.();
    inputElement.focus();
  }

  // Handle focus/blur for suggestions dropdown
  function handleFocus() {
    if (value.length >= minLength && filteredSuggestions.length > 0) {
      showSuggestionsDropdown = true;
    }
  }

  function handleBlur() {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      showSuggestionsDropdown = false;
      selectedSuggestionIndex = -1;
    }, 200);
  }

  // Cleanup on destroy
  onMount(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      if (abortController) {
        abortController.abort();
      }
    };
  });

  // Get suggestion type icon
  function getSuggestionIcon(type: SearchSuggestion['type']) {
    switch (type) {
      case 'product':
        return '🔍';
      case 'category':
        return '📂';
      case 'brand':
        return '🏷️';
      case 'user':
        return '👤';
      default:
        return '🔍';
    }
  }
</script>

<div class="search-debounced relative {className}">
  <!-- Search Input -->
  <div class="relative">
    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
      </svg>
    </div>
    
    <input
      bind:this={inputElement}
      type="text"
      {value}
      {placeholder}
      class="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
      oninput={handleInput}
      onkeydown={handleKeydown}
      onfocus={handleFocus}
      onblur={handleBlur}
      autocomplete="off"
      spellcheck="false"
      role="combobox"
      aria-expanded={showSuggestionsDropdown}
      aria-haspopup="listbox"
      aria-controls="search-suggestions"
      aria-describedby="search-description"
    />

    <!-- Loading indicator -->
    {#if isSearching || loading}
      <div class="absolute inset-y-0 right-12 flex items-center">
        <div class="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    {/if}

    <!-- Clear button -->
    {#if value}
      <button
        type="button"
        class="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
        onclick={handleClear}
        aria-label="Clear search"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    {/if}
  </div>

  <!-- Search Suggestions Dropdown -->
  {#if showSuggestionsDropdown && filteredSuggestions.length > 0}
    <ul
      bind:this={suggestionsList}
      class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
      role="listbox"
      id="search-suggestions"
    >
      {#each filteredSuggestions as suggestion, index}
        <li
          class="px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0
            {index === selectedSuggestionIndex ? 'bg-blue-50 text-blue-900' : 'hover:bg-gray-50'}"
          onclick={() => selectSuggestion(suggestion)}
          onkeydown={(e) => e.key === 'Enter' && selectSuggestion(suggestion)}
          role="option"
          aria-selected={index === selectedSuggestionIndex}
          tabindex="0"
        >
          <div class="flex items-center space-x-3">
            <span class="text-lg">{getSuggestionIcon(suggestion.type)}</span>
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-900">
                {suggestion.text}
              </div>
              <div class="text-xs text-gray-500 capitalize">
                {suggestion.type}
              </div>
            </div>
          </div>
        </li>
      {/each}
    </ul>
  {/if}

  <!-- Screen reader description -->
  <div id="search-description" class="sr-only">
    Search for products, brands, and categories. Use arrow keys to navigate suggestions.
  </div>
</div>

<style>
  .search-debounced {
    contain: layout style;
  }

  /* Custom scrollbar for suggestions */
  ul {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e0 #f7fafc;
  }

  ul::-webkit-scrollbar {
    width: 6px;
  }

  ul::-webkit-scrollbar-track {
    background: #f7fafc;
  }

  ul::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 3px;
  }

  ul::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
  }

  /* Accessibility improvements */
  @media (prefers-reduced-motion: reduce) {
    * {
      transition: none !important;
      animation: none !important;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    input {
      border-width: 2px;
    }
    
    ul {
      border-width: 2px;
    }
  }
</style>