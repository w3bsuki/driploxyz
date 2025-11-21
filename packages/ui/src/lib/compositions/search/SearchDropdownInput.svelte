<script lang="ts">
  /**
   * SearchDropdownInput - A modern search input with dropdown suggestions
   * Follows Svelte 5 and Tailwind CSS v4 best practices
   */
  interface Props {
    searchValue: string;
    onSearch?: (query: string) => void;
    onInput?: (query: string) => void;
    placeholder?: string;
    searchId?: string;
    suggestions?: string[];
    suggestionLimit?: number;
    loading?: boolean;
    noResultsLabel?: string;
  }

  let {
    searchValue = $bindable(''),
    onSearch,
    onInput,
    placeholder = 'Search...',
    searchId = 'search-dropdown-input',
    suggestions: externalSuggestions = [],
    suggestionLimit = 6,
    loading = false,
    noResultsLabel = 'No matching suggestions'
  }: Props = $props();

  let inputElement = $state<HTMLInputElement | null>(null);
  let dropdownElement = $state<HTMLDivElement | null>(null);
  let containerElement = $state<HTMLDivElement | null>(null);
  let focused = $state(false);
  let selectedIndex = $state(-1);
  let dropdownPosition = $state({ top: 0, left: 0, width: 0, maxHeight: 320 });

  // Show dropdown when focused and has content
  let dropdownVisible = $derived(focused && searchValue.trim().length > 0);

  // Portal action keeps the flyout above stacking context issues
  function portal(node: HTMLElement) {
    if (typeof document === 'undefined') return {} as any;

    const placeholder = document.createComment('search-dropdown-portal');
    node.parentNode?.insertBefore(placeholder, node);
    document.body.appendChild(node);

    return {
      destroy() {
        try {
          placeholder.parentNode?.insertBefore(node, placeholder);
          placeholder.remove();
        } catch {}
      }
    };
  }

  function updateDropdownPosition() {
    if (typeof window === 'undefined' || !containerElement) return;
    const rect = containerElement.getBoundingClientRect();
    const left = rect.left + window.scrollX;
    const top = rect.bottom + window.scrollY;
    const width = rect.width;
    let maxHeight = Math.min(window.innerHeight - rect.bottom - 16, 360);

    if (maxHeight < 200) {
      maxHeight = Math.min(window.innerHeight - 96, 420);
    }

    dropdownPosition = { left, top, width, maxHeight };
  }

  // Mock suggestions - in real app, fetch from API or pass as prop
  const fallbackSuggestions = [
    'Nike Air Max',
    'Adidas Sneakers',
    'Zara Jacket',
    'H&M T-Shirt',
    'Levis Jeans',
    'North Face Coat'
  ];

  let visibleSuggestions = $derived.by(() => {
    if (!searchValue.trim()) return [];
    if (externalSuggestions.length > 0) {
      return externalSuggestions.slice(0, suggestionLimit);
    }
    const query = searchValue.toLowerCase();
    return fallbackSuggestions
      .filter((item) => item.toLowerCase().includes(query))
      .slice(0, suggestionLimit);
  });

  const listboxId = `${searchId}-listbox`;
  const optionIdPrefix = `${searchId}-option`;

  function handleInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    searchValue = value;
    onInput?.(value);
    selectedIndex = -1;
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (searchValue.trim() && onSearch) {
      onSearch(searchValue.trim());
      inputElement?.blur();
      focused = false;
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!dropdownVisible) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, visibleSuggestions.length - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < visibleSuggestions.length) {
          const suggestion = visibleSuggestions[selectedIndex];
          searchValue = suggestion;
          onInput?.(suggestion);
          onSearch?.(suggestion);
          inputElement?.blur();
          focused = false;
        } else if (searchValue.trim() && onSearch) {
          onSearch(searchValue.trim());
          inputElement?.blur();
          focused = false;
        }
        break;
      case 'Escape':
        focused = false;
        inputElement?.blur();
        break;
    }
  }

  function handleFocus() {
    focused = true;
  }

  function handleBlur() {
    // Delay to allow dropdown clicks to register
    setTimeout(() => {
      focused = false;
    }, 200);
  }

  function handleSuggestionClick(suggestion: string) {
    searchValue = suggestion;
    onInput?.(suggestion);
    onSearch?.(suggestion);
    focused = false;
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (inputElement && !inputElement.contains(target) && dropdownElement && !dropdownElement.contains(target)) {
      focused = false;
    }
  }

  // Click outside handler
  $effect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('click', handleClickOutside);
      return () => {
        window.removeEventListener('click', handleClickOutside);
      };
    }
  });

  // Realign dropdown while open
  $effect(() => {
    if (typeof window === 'undefined' || !dropdownVisible) return;
    updateDropdownPosition();

    const updateAll = () => updateDropdownPosition();
    window.addEventListener('resize', updateAll);
    window.addEventListener('scroll', updateAll, true);

    return () => {
      window.removeEventListener('resize', updateAll);
      window.removeEventListener('scroll', updateAll, true);
    };
  });

  $effect(() => {
    if (selectedIndex >= visibleSuggestions.length) {
      selectedIndex = visibleSuggestions.length - 1;
    }
  });
</script>

<div class="relative w-full" bind:this={containerElement} data-expanded={dropdownVisible}>
  <form onsubmit={handleSubmit} class="w-full">
    <div
      class="flex items-center gap-2 px-3 sm:px-4 h-11 rounded-[var(--radius-lg)] border border-border-subtle bg-surface-base transition-[box-shadow,_border-color] duration-200 ease-out focus-within:border-border-emphasis focus-within:ring-1 focus-within:ring-[color:var(--state-focus)]"
      class:rounded-b-none={dropdownVisible}
      class:shadow-[var(--shadow-md)]={dropdownVisible}
    >
      <!-- Search icon -->
      <svg class="w-5 h-5 text-text-tertiary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>

      <!-- Input -->
      <input
        bind:this={inputElement}
        id={searchId}
        type="search"
        value={searchValue}
        oninput={handleInput}
        onkeydown={handleKeyDown}
        onfocus={handleFocus}
        onblur={handleBlur}
        {placeholder}
        class="flex-1 bg-transparent border-0 text-base text-text-primary placeholder:text-text-muted focus:ring-0 focus:outline-none"
        autocomplete="off"
        spellcheck="false"
        role="combobox"
        aria-expanded={dropdownVisible}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-label={placeholder}
        aria-controls={dropdownVisible ? listboxId : undefined}
        aria-activedescendant={selectedIndex >= 0 ? `${optionIdPrefix}-${selectedIndex}` : undefined}
      />

      <!-- Clear button -->
      {#if searchValue}
        <button
          type="button"
          onclick={() => {
            searchValue = '';
            onInput?.('');
            queueMicrotask(() => inputElement?.focus());
          }}
          class="inline-flex items-center justify-center h-8 w-8 shrink-0 rounded-[var(--radius-sm)] hover:bg-surface-muted active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)]"
          aria-label="Clear search"
        >
          <svg class="w-5 h-5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      {/if}
    </div>
  </form>

  <!-- Dropdown -->
  {#if dropdownVisible}
    <div
      use:portal
      bind:this={dropdownElement}
      id={listboxId}
      role="listbox"
      style:top={`${dropdownPosition.top}px`}
      style:left={`${dropdownPosition.left}px`}
      style:width={`${dropdownPosition.width}px`}
      style:max-height={`${dropdownPosition.maxHeight}px`}
      class="fixed z-[var(--z-popover,1200)] bg-surface-base border border-border-emphasis rounded-b-[var(--radius-lg)] shadow-[var(--shadow-xl)] overflow-y-auto overscroll-contain backdrop-blur-sm"
    >
      {#if loading}
        <div class="flex items-center gap-2 px-4 py-3 text-sm text-text-muted">
          <svg class="h-4 w-4 animate-spin text-text-muted" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-60" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span>Loading suggestions…</span>
        </div>
      {/if}

      {#each visibleSuggestions as suggestion, index (suggestion)}
        <button
          type="button"
          role="option"
          id={`${optionIdPrefix}-${index}`}
          aria-selected={index === selectedIndex}
          onclick={() => handleSuggestionClick(suggestion)}
          onmouseenter={() => selectedIndex = index}
          class="w-full px-4 py-3 flex items-center gap-3 text-left transition-colors duration-150 border-b border-border-subtle last:border-0 hover:bg-[color:var(--state-hover)] focus:bg-[color:var(--state-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)]"
          class:bg-[color:var(--state-hover)]={index === selectedIndex}
        >
          <svg class="w-4 h-4 text-text-tertiary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span class="text-text-primary text-sm font-medium">{suggestion}</span>
        </button>
      {/each}

      {#if !loading && visibleSuggestions.length === 0}
        <div class="px-4 py-3 text-sm text-text-muted">{noResultsLabel}</div>
      {/if}
    </div>
  {/if}
</div>
