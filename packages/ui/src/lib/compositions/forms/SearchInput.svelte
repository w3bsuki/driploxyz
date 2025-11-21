<script lang="ts">
import type { Database } from '@repo/database';
import type { Snippet } from 'svelte';
import { fly, scale } from 'svelte/transition';
import { quintOut, expoOut } from 'svelte/easing';
import SearchDropdown from '../../compositions/navigation/SearchDropdown.svelte';
import type { ProductWithImages, SearchFunction } from '../../compositions/navigation/search/types';

interface Props {
  searchValue?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  onProductSelect?: (product: ProductWithImages) => void;
  searchFunction?: SearchFunction;
  leftSection?: Snippet;
  rightSection?: Snippet;
  class?: string;
  searchId?: string;
  showDropdown?: boolean;
  maxResults?: number;
  mode?: 'power' | 'compact' | 'full';
  customDropdownOpen?: boolean;
  filterType?: 'products' | 'brands' | 'sellers';
}

let {
  searchValue = $bindable(''),
  placeholder = 'Search...',
  onSearch,
  onProductSelect,
  searchFunction,
  leftSection,
  rightSection,
  class: className = '',
  searchId = 'search-input',
  showDropdown = true,
  maxResults = 5,
  mode = 'full',
  customDropdownOpen = false,
  filterType = 'products'
}: Props = $props();

let inputElement: HTMLInputElement | undefined = $state();
let dropdownElement = $state<HTMLDivElement | undefined>();
let dropdownOpen = $state(false);
let blurTimeoutId: ReturnType<typeof setTimeout> | undefined;
// Filter scope is now controlled by parent via `filterType` prop

// Dropdown visible when: has search text AND dropdown is open
let dropdownVisible = $derived.by(() => {
	const hasSearchText = searchValue.trim().length > 0;
	return hasSearchText && dropdownOpen && showDropdown;
});

const listboxId = $derived(`${searchId}-listbox`);

function handleSubmit(event: Event) {
  event.preventDefault();
  if (searchValue.trim()) {
    onSearch?.(searchValue.trim());
    dropdownOpen = false;
    inputElement?.blur();
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    handleSubmit(event);
  } else if (event.key === 'Escape') {
    dropdownOpen = false;
    inputElement?.blur();
  }
}

function handleProductSelect(product: ProductWithImages) {
  onProductSelect?.(product);
  dropdownOpen = false;
}

function handleFocus() {
  if (blurTimeoutId) {
    clearTimeout(blurTimeoutId);
    blurTimeoutId = undefined;
  }
  // Open dropdown when typing
  if (searchValue.trim().length > 0) {
    dropdownOpen = true;
  }
}

function handleBlur(event: FocusEvent) {
  const relatedTarget = event.relatedTarget as HTMLElement | null;
  
  // If clicking within dropdown, keep it open
  if (relatedTarget && dropdownElement?.contains(relatedTarget)) {
    return;
  }
  
  // Delay close to allow dropdown clicks to register
  blurTimeoutId = setTimeout(() => {
    dropdownOpen = false;
    blurTimeoutId = undefined;
  }, 200);
}

function handleInput() {
  // Open dropdown when user types
  if (searchValue.trim().length > 0) {
    dropdownOpen = true;
  } else {
    dropdownOpen = false;
  }
}

function handleDropdownMouseDown() {
  // Prevent input blur when clicking dropdown
  if (blurTimeoutId) {
    clearTimeout(blurTimeoutId);
    blurTimeoutId = undefined;
  }
}

function handleDropdownClose() {
  if (blurTimeoutId) {
    clearTimeout(blurTimeoutId);
    blurTimeoutId = undefined;
  }
  dropdownOpen = false;
}
</script>


<div class="search-input-container {className}">
  <form
    onsubmit={handleSubmit}
    class="search-form"
    class:dropdown-open={dropdownVisible}
  >
    {#if leftSection}
      <div class="left-section">
        {@render leftSection()}
      </div>
    {/if}

    <div class="search-input-wrapper">
      <input
        bind:this={inputElement}
        bind:value={searchValue}
        oninput={handleInput}
        onkeydown={handleKeydown}
        onfocus={handleFocus}
        onblur={handleBlur}
        type="search"
        id={searchId}
        {placeholder}
        class="search-input"
        class:has-right-section={!!rightSection}
        autocomplete="off"
        spellcheck="false"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={dropdownVisible}
        aria-controls={listboxId}
        aria-label={placeholder}
      />
    </div>

    {#if rightSection}
      <div class="right-section">
        {@render rightSection()}
      </div>
    {/if}
  </form>

  {#if dropdownVisible && searchFunction}
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div 
      bind:this={dropdownElement}
      class="search-dropdown-wrapper"
      onmousedown={handleDropdownMouseDown}
      role="region"
      aria-label="Search results"
      in:fly={{ y: -10, duration: 200, easing: quintOut }}
      out:scale={{ start: 0.95, duration: 150, easing: expoOut, opacity: 0 }}
    >
      <SearchDropdown
        query={searchValue}
        onSearch={searchFunction}
        {maxResults}
        visible={dropdownVisible}
        listboxId={listboxId}
        onSelect={handleProductSelect}
        onClose={handleDropdownClose}
        filterType={filterType}
      />
    </div>
  {/if}
</div>

<style>
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     SEARCH INPUT - Token-Driven Styles
     100% Tailwind v4 compliant - Zero hardcoding
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  .search-input-container {
    position: relative;
    width: 100%;
  }
  
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     SEARCH FORM - ZERO LAYOUT SHIFT
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  .search-form {
    background-color: var(--search-bar-bg);
    display: flex;
    align-items: center;
    position: relative;
    border: 1px solid var(--search-bar-border);
    border-radius: var(--search-bar-radius);
    box-shadow: var(--search-bar-shadow);
    transition: background-color var(--duration-fast) var(--ease-out),
                border-color var(--duration-fast) var(--ease-out),
                box-shadow var(--duration-fast) var(--ease-out);
    height: var(--search-bar-height);
    --search-bar-separator-color: var(--search-bar-border);
    contain: layout;
    backface-visibility: hidden;
    -webkit-font-smoothing: antialiased;
  }
  
  .search-form:hover {
    background-color: var(--search-bar-bg-hover);
    border-color: var(--search-bar-border-hover);
    box-shadow: var(--search-bar-shadow-hover);
    --search-bar-separator-color: var(--search-bar-border-hover);
  }
  
  .search-form:focus-within {
    background-color: var(--search-bar-bg-active);
    border-color: var(--search-bar-border-focus);
    box-shadow: var(--search-bar-shadow-focus);
    --search-bar-separator-color: var(--search-bar-border-focus);
  }
  
  .search-form.dropdown-open {
    background-color: var(--search-bar-bg-active);
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-bottom-color: transparent;
    box-shadow: var(--search-bar-dropdown-shadow);
    --search-bar-separator-color: var(--search-bar-border-focus);
  }
  
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     LEFT & RIGHT SECTIONS
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  .left-section,
  .right-section {
    position: relative;
    flex-shrink: 0;
    display: flex;
    align-items: stretch;
    height: 100%;
  }

  .left-section > :global(*),
  .right-section > :global(*) {
    display: flex;
    align-items: center;
    height: 100%;
  }

  .left-section::after,
  .right-section::before {
    content: '';
    position: absolute;
    top: var(--space-1);
    bottom: var(--space-1);
    width: 1px;
    background-color: var(--search-bar-separator-color);
    transition: background-color var(--duration-fast) var(--ease-out);
    pointer-events: none;
  }

  .left-section::after {
    right: 0;
  }

  .right-section::before {
    left: 0;
  }

  .left-section :global(.search-input__leading-action),
  .right-section :global(.search-input__trailing-action) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding-inline: var(--space-3);
    height: 100%;
    border: none;
    background: transparent;
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    line-height: 1;
    cursor: pointer;
    transition: background-color var(--duration-fast) var(--ease-out),
                color var(--duration-fast) var(--ease-out);
  }

  .left-section :global(.search-input__leading-action:hover),
  .right-section :global(.search-input__trailing-action:hover) {
    background-color: var(--search-bar-bg-hover);
    color: var(--color-text-primary);
  }

  .left-section :global(.search-input__leading-action:focus-visible),
  .right-section :global(.search-input__trailing-action:focus-visible) {
    outline: none;
    background-color: var(--search-bar-bg-active);
    color: var(--color-text-primary);
  }

  .left-section :global(.search-input__leading-action svg),
  .right-section :global(.search-input__trailing-action svg) {
    width: var(--space-3);
    height: var(--space-3);
    color: var(--color-text-muted);
    transition: transform var(--duration-fast) var(--ease-out),
                color var(--duration-fast) var(--ease-out);
  }

  .left-section :global(.search-input__leading-action:hover svg),
  .left-section :global(.search-input__leading-action:focus-visible svg),
  .right-section :global(.search-input__trailing-action:hover svg),
  .right-section :global(.search-input__trailing-action:focus-visible svg) {
    color: var(--color-text-secondary);
  }

  :global(.rotate-180) {
    transform: rotate(180deg);
  }
  
  
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     SEARCH INPUT
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  .search-input-wrapper {
    flex: 1;
    position: relative;
  }
  
  .search-input {
    width: 100%;
    height: 100%;
    padding-left: var(--search-bar-padding-x);
    padding-right: var(--search-bar-padding-x);
    background-color: transparent;
    border: none;
    outline: none;
    box-shadow: none;
    font-size: var(--text-base);
    color: var(--search-bar-input-color);
  }
  
  .search-input.has-right-section {
    padding-right: var(--space-16);
  }
  
  .search-input::placeholder {
    color: var(--search-bar-placeholder);
  }
  
  .search-input:focus {
    outline: none;
    box-shadow: none;
  }
  
  /* Remove browser default search input styling */
  .search-input::-webkit-search-decoration,
  .search-input::-webkit-search-cancel-button,
  .search-input::-webkit-search-results-button,
  .search-input::-webkit-search-results-decoration {
    display: none;
  }
  
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     SEARCH DROPDOWN WRAPPER
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  .search-dropdown-wrapper {
    position: absolute;
    top: calc(100% - 1px);
    left: 0;
    right: 0;
    z-index: var(--z-dropdown);
  }
  
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ACCESSIBILITY & REDUCED MOTION
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  @media (prefers-reduced-motion: reduce) {
    .filter-toggle,
    .filter-option,
    .filter-chevron,
    .search-form {
      transition: none;
    }
  }
</style>
