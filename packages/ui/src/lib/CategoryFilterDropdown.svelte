<script lang="ts">
  import { createSelect } from '@melt-ui/svelte';
  import type { Snippet } from 'svelte';
  import { tick } from 'svelte';
  import * as i18n from '@repo/i18n';
  
  // Enhanced category translation with fallback system
  function translateCategoryName(categoryName: string | undefined | null, categoryId?: string): string {
    if (!categoryName) return '';
    
    // Try i18n key first
    const messageKey = 'category_' + categoryName
      .replace(/[&+]/g, '') // Remove & and + symbols
      .replace(/[^a-zA-Z0-9]/g, ' ') // Replace special chars with spaces
      .trim()
      .split(/\s+/)
      .map((word, index) => index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
    
    try {
      if (messageKey in i18n) {
        const translationFunction = (i18n as any)[messageKey];
        if (typeof translationFunction === 'function') {
          return translationFunction();
        }
      }
    } catch (error) {
      // i18n key doesn't exist or function call failed
    }
    
    // Fallback to cleaned category name
    return categoryName
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add spaces between camelCase
      .replace(/[_-]/g, ' ') // Replace underscores/hyphens with spaces
      .replace(/\s+/g, ' ') // Normalize multiple spaces
      .trim();
  }

  interface CategoryOption {
    key: string;
    name: string;
    icon: string;
    id: string;
    hasChildren?: boolean;
  }

  interface CategoryHierarchy {
    categories: CategoryOption[];
    subcategories: Record<string, CategoryOption[]>;
    specifics: Record<string, CategoryOption[]>;
  }

  interface Props {
    categoryHierarchy: CategoryHierarchy;
    selectedCategory?: string | null;
    selectedSubcategory?: string | null;
    selectedSpecific?: string | null;
    placeholder?: string;
    disabled?: boolean;
    class?: string;
    onCategorySelect?: (category: string | null, subcategory: string | null, specific: string | null) => void;
    trigger?: Snippet<[{ selectedText: string; isOpen: boolean }]>;
    categoryItem?: Snippet<[CategoryOption, { level: number; isSelected: boolean }]>;
    /** Announce category changes to screen readers */
    announceChanges?: boolean;
  }

  let {
    categoryHierarchy,
    selectedCategory = $bindable(null),
    selectedSubcategory = $bindable(null),
    selectedSpecific = $bindable(null),
    placeholder = i18n.category_dropdown_allCategories(),
    disabled = false,
    class: className = '',
    onCategorySelect,
    trigger,
    categoryItem,
    announceChanges = true
  }: Props = $props();

  // Navigation state
  let currentLevel = $state(1); // 1=gender, 2=type, 3=specific
  let isOpen = $state(false);
  let focusedIndex = $state(-1);
  let dropdownRef = $state<HTMLDivElement>();
  let triggerRef = $state<HTMLButtonElement>();
  let announcement = $state('');
  
  // Track the original focus for restoration
  let originalFocus: HTMLElement | null = null;

  // Computed display text
  const selectedText = $derived(() => {
    if (selectedSpecific) {
      const specificKey = `${selectedCategory}-${selectedSubcategory}`;
      const specificItem = categoryHierarchy.specifics[specificKey]?.find(cat => cat.key === selectedSpecific);
      return specificItem?.name || placeholder;
    }
    if (selectedSubcategory) {
      const subcategoryItem = categoryHierarchy.subcategories[selectedCategory || '']?.find(cat => cat.key === selectedSubcategory);
      return subcategoryItem?.name || placeholder;
    }
    if (selectedCategory) {
      const categoryItem = categoryHierarchy.categories.find(cat => cat.key === selectedCategory);
      return categoryItem?.name || placeholder;
    }
    return placeholder;
  });

  // Get current category icon
  const selectedIcon = $derived(() => {
    if (selectedCategory) {
      return categoryHierarchy.categories.find(cat => cat.key === selectedCategory)?.icon || '📁';
    }
    return '📁';
  });

  // Handle category selection
  function handleCategorySelect(category: string | null) {
    const categoryItem = category ? categoryHierarchy.categories.find(cat => cat.key === category) : null;
    
    selectedCategory = category;
    selectedSubcategory = null;
    selectedSpecific = null;
    
    if (category && categoryHierarchy.subcategories[category]?.length > 0) {
      currentLevel = 2;
      focusedIndex = -1;
    } else {
      isOpen = false;
      currentLevel = 1;
      // Restore focus to trigger
      triggerRef?.focus();
    }
    
    // Announce selection
    if (announceChanges) {
      if (category && categoryItem) {
        announcement = i18n.category_dropdown_selectedCategory({ name: categoryItem.name });
      } else {
        announcement = i18n.category_dropdown_allCategoriesSelected();
      }
    }
    
    onCategorySelect?.(category, null, null);
  }

  // Handle subcategory selection
  function handleSubcategorySelect(subcategory: string | null) {
    const subcategoryItem = subcategory && selectedCategory 
      ? categoryHierarchy.subcategories[selectedCategory]?.find(cat => cat.key === subcategory)
      : null;
    
    selectedSubcategory = subcategory;
    selectedSpecific = null;
    
    if (subcategory && selectedCategory) {
      const specificKey = `${selectedCategory}-${subcategory}`;
      if (categoryHierarchy.specifics[specificKey]?.length > 0) {
        currentLevel = 3;
        focusedIndex = -1;
      } else {
        isOpen = false;
        currentLevel = 1;
        triggerRef?.focus();
      }
    } else {
      isOpen = false;
      currentLevel = 1;
      triggerRef?.focus();
    }
    
    // Announce selection
    if (announceChanges) {
      if (subcategory && subcategoryItem) {
        announcement = i18n.category_dropdown_selectedSubcategory({ name: subcategoryItem.name });
      } else {
        const categoryName = selectedCategory 
          ? categoryHierarchy.categories.find(cat => cat.key === selectedCategory)?.name 
          : 'category';
        announcement = i18n.category_dropdown_allSubcategorySelected({ category: categoryName });
      }
    }
    
    onCategorySelect?.(selectedCategory, subcategory, null);
  }

  // Handle specific selection
  function handleSpecificSelect(specific: string | null) {
    const specificItem = specific && selectedCategory && selectedSubcategory
      ? categoryHierarchy.specifics[`${selectedCategory}-${selectedSubcategory}`]?.find(cat => cat.key === specific)
      : null;
      
    selectedSpecific = specific;
    isOpen = false;
    currentLevel = 1;
    
    // Restore focus to trigger
    triggerRef?.focus();
    
    // Announce selection
    if (announceChanges) {
      if (specific && specificItem) {
        announcement = i18n.category_dropdown_selectedSpecific({ name: specificItem.name });
      } else {
        const subcategoryName = selectedSubcategory && selectedCategory
          ? categoryHierarchy.subcategories[selectedCategory]?.find(cat => cat.key === selectedSubcategory)?.name
          : 'items';
        announcement = i18n.category_dropdown_allSpecificSelected({ subcategory: subcategoryName });
      }
    }
    
    onCategorySelect?.(selectedCategory, selectedSubcategory, specific);
  }

  // Navigate back in hierarchy
  function navigateBack() {
    if (currentLevel === 3) {
      currentLevel = 2;
      focusedIndex = -1;
    } else if (currentLevel === 2) {
      currentLevel = 1;
      focusedIndex = -1;
    }
    
    // Announce navigation
    if (announceChanges) {
      if (currentLevel === 1) {
        announcement = 'Navigated back to main categories';
      } else if (currentLevel === 2) {
        const categoryName = selectedCategory 
          ? categoryHierarchy.categories.find(cat => cat.key === selectedCategory)?.name
          : 'category';
        announcement = `Navigated back to ${categoryName} subcategories`;
      }
    }
  }

  // Clear all selections
  function clearSelection() {
    selectedCategory = null;
    selectedSubcategory = null;
    selectedSpecific = null;
    isOpen = false;
    currentLevel = 1;
    focusedIndex = -1;
    
    // Announce clearing
    if (announceChanges) {
      announcement = i18n.category_dropdown_allFiltersCleared();
    }
    
    onCategorySelect?.(null, null, null);
  }

  // Handle click outside to close
  function handleClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('.category-dropdown')) {
      closeDropdown();
    }
  }
  
  // Close dropdown and restore focus
  function closeDropdown() {
    isOpen = false;
    currentLevel = 1;
    focusedIndex = -1;
    triggerRef?.focus();
  }
  
  // Enhanced keyboard navigation
  function handleDropdownKeydown(event: KeyboardEvent) {
    const { key } = event;
    
    // Get current options based on level
    const getCurrentOptions = () => {
      if (currentLevel === 1) {
        return [{ key: 'all', name: 'All Categories' }, ...categoryHierarchy.categories];
      } else if (currentLevel === 2 && selectedCategory) {
        const baseOption = { 
          key: 'all-sub', 
          name: `All ${categoryHierarchy.categories.find(cat => cat.key === selectedCategory)?.name || 'Items'}` 
        };
        return [baseOption, ...(categoryHierarchy.subcategories[selectedCategory] || [])];
      } else if (currentLevel === 3 && selectedCategory && selectedSubcategory) {
        const specificKey = `${selectedCategory}-${selectedSubcategory}`;
        const baseOption = { 
          key: 'all-spec', 
          name: `All ${categoryHierarchy.subcategories[selectedCategory]?.find(cat => cat.key === selectedSubcategory)?.name || 'Items'}` 
        };
        return [baseOption, ...(categoryHierarchy.specifics[specificKey] || [])];
      }
      return [];
    };
    
    const options = getCurrentOptions();
    
    switch (key) {
      case 'Escape':
        event.preventDefault();
        closeDropdown();
        break;
        
      case 'ArrowDown':
        event.preventDefault();
        focusedIndex = focusedIndex < options.length - 1 ? focusedIndex + 1 : 0;
        scrollToFocusedItem();
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        focusedIndex = focusedIndex > 0 ? focusedIndex - 1 : options.length - 1;
        scrollToFocusedItem();
        break;
        
      case 'Home':
        event.preventDefault();
        focusedIndex = 0;
        scrollToFocusedItem();
        break;
        
      case 'End':
        event.preventDefault();
        focusedIndex = options.length - 1;
        scrollToFocusedItem();
        break;
        
      case 'Enter':
      case ' ':
        if (focusedIndex >= 0 && focusedIndex < options.length) {
          event.preventDefault();
          const selectedOption = options[focusedIndex];
          
          if (currentLevel === 1) {
            if (selectedOption.key === 'all') {
              clearSelection();
            } else {
              handleCategorySelect(selectedOption.key);
            }
          } else if (currentLevel === 2) {
            if (selectedOption.key === 'all-sub') {
              handleSubcategorySelect(null);
            } else {
              handleSubcategorySelect(selectedOption.key);
            }
          } else if (currentLevel === 3) {
            if (selectedOption.key === 'all-spec') {
              handleSpecificSelect(null);
            } else {
              handleSpecificSelect(selectedOption.key);
            }
          }
        }
        break;
        
      case 'ArrowLeft':
      case 'Backspace':
        if (currentLevel > 1) {
          event.preventDefault();
          navigateBack();
        }
        break;
    }
  }
  
  // Scroll to focused item
  async function scrollToFocusedItem() {
    await tick();
    if (dropdownRef && focusedIndex >= 0) {
      const buttons = dropdownRef.querySelectorAll('[role="option"]');
      const focusedButton = buttons[focusedIndex] as HTMLElement;
      if (focusedButton) {
        focusedButton.scrollIntoView({ block: 'nearest' });
      }
    }
  }
  
  // Handle trigger click
  function handleTriggerClick() {
    if (isOpen) {
      closeDropdown();
    } else {
      originalFocus = document.activeElement as HTMLElement;
      isOpen = true;
      currentLevel = 1;
      focusedIndex = 0; // Start with first item focused
    }
  }
  
  // Clear announcement after it's been read
  $effect(() => {
    if (announcement) {
      const timer = setTimeout(() => {
        announcement = '';
      }, 1000);
      return () => clearTimeout(timer);
    }
  });
</script>

<svelte:window onclick={handleClickOutside} />

<div class="category-dropdown relative {className}">
  <!-- Trigger Button -->
  <button
    bind:this={triggerRef}
    onclick={handleTriggerClick}
    onkeydown={(e) => {
      if (e.key === 'ArrowDown' && !isOpen) {
        e.preventDefault();
        handleTriggerClick();
      }
    }}
    {disabled}
    class="flex items-center gap-2.5 h-12 px-3 sm:px-4 bg-[color:var(--surface-muted)] hover:bg-[color:var(--surface-emphasis)] 
           rounded-l-xl text-sm font-medium transition-colors duration-[var(--duration-base)] 
           border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)] 
           disabled:opacity-50 disabled:cursor-not-allowed
           min-w-0 flex-shrink-0"
    aria-expanded={isOpen}
    aria-haspopup="listbox"
    aria-label={i18n.category_dropdown_ariaLabel({ selectedText })}
  >
    {#if trigger}
      {@render trigger({ selectedText, isOpen })}
    {:else}
      <span class="text-base flex-shrink-0" aria-hidden="true">{selectedIcon}</span>
      
      <!-- Mobile: Just arrow -->
      <span class="sm:hidden">
        <svg 
          class="w-4 h-4 transition-transform duration-[var(--duration-base)] {isOpen ? 'rotate-180' : ''}" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </span>
      
      <!-- Desktop: Full text -->
      <span class="hidden sm:block text-left flex-1 min-w-0 truncate">
        {selectedText}
      </span>
      <svg 
        class="hidden sm:block w-4 h-4 transition-transform duration-[var(--duration-base)] {isOpen ? 'rotate-180' : ''} flex-shrink-0" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    {/if}
  </button>

  <!-- Dropdown Menu -->
  {#if isOpen}
    <div 
      bind:this={dropdownRef}
      class="absolute top-full left-0 mt-1 w-72 sm:w-80 bg-[color:var(--surface-base)] 
             rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] border border-[color:var(--border-subtle)] 
             z-40 max-h-[360px] overflow-hidden"
      role="listbox"
      aria-label={i18n.category_dropdown_listboxAriaLabel()}
      onkeydown={handleDropdownKeydown}
      tabindex="-1"
    >
      
      <!-- Level 1: Main Categories -->
      {#if currentLevel === 1}
        <div class="p-2">
          <div class="text-xs font-semibold text-[color:var(--text-tertiary)] uppercase tracking-wide px-3 py-2 border-b border-[color:var(--border-subtle)] mb-1">
            {i18n.category_dropdown_categories()}
          </div>
          <div class="space-y-0.5 overflow-y-auto max-h-72">
            <button
              onclick={clearSelection}
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] 
                     hover:bg-[color:var(--surface-subtle)] text-left transition-colors duration-[var(--duration-base)]
                     min-h-[var(--touch-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)]
                     {focusedIndex === 0 ? 'bg-[color:var(--surface-emphasis)]' : ''}
                     {!selectedCategory ? 'bg-[color:var(--surface-emphasis)]' : ''}"
              role="option"
              aria-selected={!selectedCategory}
              tabindex="-1"
            >
              <span class="text-base" aria-hidden="true">🌍</span>
              <span class="text-sm font-medium text-[color:var(--text-primary)]">{i18n.category_dropdown_allCategories()}</span>
            </button>
            
            {#each categoryHierarchy.categories as category, index (category.key)}
              {@const isSelected = selectedCategory === category.key}
              {@const hasSubcategories = categoryHierarchy.subcategories[category.key]?.length > 0}
              {@const isFocused = focusedIndex === index + 1}
              
              <button
                onclick={() => handleCategorySelect(category.key)}
                class="w-full flex items-center justify-between px-3 py-2 rounded-[var(--radius-md)] 
                       hover:bg-[color:var(--surface-subtle)] text-left transition-colors duration-[var(--duration-base)] group
                       min-h-[var(--touch-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)]
                       {isFocused ? 'bg-[color:var(--surface-emphasis)]' : ''}
                       {isSelected ? 'bg-[color:var(--primary-50)] text-[color:var(--primary-700)]' : ''}"
                role="option"
                aria-selected={isSelected}
                tabindex="-1"
              >
                {#if categoryItem}
                  {@render categoryItem(category, { level: 1, isSelected })}
                {:else}
                  <div class="flex items-center gap-2.5">
                    <span class="text-base" aria-hidden="true">{category.icon}</span>
                    <span class="text-sm font-medium {isSelected ? 'text-[color:var(--primary-700)]' : 'text-[color:var(--text-primary)]'}">{category.name}</span>
                  </div>
                  
                  {#if hasSubcategories}
                    <svg 
                      class="w-3.5 h-3.5 text-[color:var(--text-tertiary)] group-hover:text-[color:var(--text-secondary)] transition-colors duration-[var(--duration-base)]" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  {/if}
                {/if}
              </button>
            {/each}
          </div>
        </div>
      {/if}
      
      <!-- Level 2: Subcategories -->
      {#if currentLevel === 2 && selectedCategory && categoryHierarchy.subcategories[selectedCategory]}
        <div class="p-2">
          <button
            onclick={navigateBack}
            class="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[color:var(--text-secondary)] 
                   hover:text-[color:var(--text-primary)] hover:bg-[color:var(--surface-subtle)] 
                   rounded-[var(--radius-md)] transition-colors duration-[var(--duration-base)] mb-1
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)]"
            tabindex="-1"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
{i18n.category_dropdown_backToCategories()}
          </button>
          
          <div class="text-xs font-semibold text-[color:var(--text-tertiary)] uppercase tracking-wide px-3 py-2 border-b border-[color:var(--border-subtle)] mb-1">
            {categoryHierarchy.categories.find(cat => cat.key === selectedCategory)?.name}
          </div>
          
          <div class="space-y-0.5 overflow-y-auto max-h-72">
            <button
              onclick={() => handleSubcategorySelect(null)}
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] 
                     hover:bg-[color:var(--surface-subtle)] text-left transition-colors duration-[var(--duration-base)]
                     min-h-[var(--touch-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)]
                     {focusedIndex === 0 ? 'bg-[color:var(--surface-emphasis)]' : ''}
                     {!selectedSubcategory ? 'bg-[color:var(--surface-emphasis)]' : ''}"
              role="option"
              aria-selected={!selectedSubcategory}
              tabindex="-1"
            >
              <span class="text-base" aria-hidden="true">📦</span>
              <span class="text-sm font-medium text-[color:var(--text-primary)]">
                All {categoryHierarchy.categories.find(cat => cat.key === selectedCategory)?.name}
              </span>
            </button>
            
            {#each categoryHierarchy.subcategories[selectedCategory] as subcategory, index (subcategory.key)}
              {@const isSelected = selectedSubcategory === subcategory.key}
              {@const hasSpecifics = categoryHierarchy.specifics[`${selectedCategory}-${subcategory.key}`]?.length > 0}
              {@const isFocused = focusedIndex === index + 1}
              
              <button
                onclick={() => handleSubcategorySelect(subcategory.key)}
                class="w-full flex items-center justify-between px-3 py-2 rounded-[var(--radius-md)] 
                       hover:bg-[color:var(--surface-subtle)] text-left transition-colors duration-[var(--duration-base)] group
                       min-h-[var(--touch-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)]
                       {isFocused ? 'bg-[color:var(--surface-emphasis)]' : ''}
                       {isSelected ? 'bg-[color:var(--primary-50)] text-[color:var(--primary-700)]' : ''}"
                role="option"
                aria-selected={isSelected}
                tabindex="-1"
              >
                {#if categoryItem}
                  {@render categoryItem(subcategory, { level: 2, isSelected })}
                {:else}
                  <div class="flex items-center gap-2.5">
                    <span class="text-base" aria-hidden="true">{subcategory.icon}</span>
                    <span class="text-sm font-medium {isSelected ? 'text-[color:var(--primary-700)]' : 'text-[color:var(--text-primary)]'}">{subcategory.name}</span>
                  </div>
                  
                  {#if hasSpecifics}
                    <svg 
                      class="w-3.5 h-3.5 text-[color:var(--text-tertiary)] group-hover:text-[color:var(--text-secondary)] transition-colors duration-[var(--duration-base)]" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  {/if}
                {/if}
              </button>
            {/each}
          </div>
        </div>
      {/if}
      
      <!-- Level 3: Specific Items -->
      {#if currentLevel === 3 && selectedCategory && selectedSubcategory && categoryHierarchy.specifics[`${selectedCategory}-${selectedSubcategory}`]}
        <div class="p-2">
          <button
            onclick={navigateBack}
            class="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[color:var(--text-secondary)] 
                   hover:text-[color:var(--text-primary)] hover:bg-[color:var(--surface-subtle)] 
                   rounded-[var(--radius-md)] transition-colors duration-[var(--duration-base)] mb-1
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)]"
            tabindex="-1"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to {categoryHierarchy.subcategories[selectedCategory]?.find(cat => cat.key === selectedSubcategory)?.name}
          </button>
          
          <div class="text-xs font-semibold text-[color:var(--text-tertiary)] uppercase tracking-wide px-3 py-2 border-b border-[color:var(--border-subtle)] mb-1">
            {categoryHierarchy.subcategories[selectedCategory]?.find(cat => cat.key === selectedSubcategory)?.name}
          </div>
          
          <div class="space-y-0.5 overflow-y-auto max-h-72">
            <button
              onclick={() => handleSpecificSelect(null)}
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] 
                     hover:bg-[color:var(--surface-subtle)] text-left transition-colors duration-[var(--duration-base)]
                     min-h-[var(--touch-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)]
                     {focusedIndex === 0 ? 'bg-[color:var(--surface-emphasis)]' : ''}
                     {!selectedSpecific ? 'bg-[color:var(--surface-emphasis)]' : ''}"
              role="option"
              aria-selected={!selectedSpecific}
              tabindex="-1"
            >
              <span class="text-base" aria-hidden="true">📄</span>
              <span class="text-sm font-medium text-[color:var(--text-primary)]">
                All {categoryHierarchy.subcategories[selectedCategory]?.find(cat => cat.key === selectedSubcategory)?.name}
              </span>
            </button>
            
            {#each categoryHierarchy.specifics[`${selectedCategory}-${selectedSubcategory}`] as specific, index (specific.key)}
              {@const isSelected = selectedSpecific === specific.key}
              {@const isFocused = focusedIndex === index + 1}
              
              <button
                onclick={() => handleSpecificSelect(specific.key)}
                class="w-full flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] 
                       hover:bg-[color:var(--surface-subtle)] text-left transition-colors duration-[var(--duration-base)] group
                       min-h-[var(--touch-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)]
                       {isFocused ? 'bg-[color:var(--surface-emphasis)]' : ''}
                       {isSelected ? 'bg-[color:var(--primary-50)] text-[color:var(--primary-700)]' : ''}"
                role="option"
                aria-selected={isSelected}
                tabindex="-1"
              >
                {#if categoryItem}
                  {@render categoryItem(specific, { level: 3, isSelected })}
                {:else}
                  <span class="text-base" aria-hidden="true">{specific.icon}</span>
                  <span class="text-sm font-medium {isSelected ? 'text-[color:var(--primary-700)]' : 'text-[color:var(--text-primary)]'}">{specific.name}</span>
                {/if}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<!-- Live region for announcements -->
{#if announcement}
  <div 
    role="status" 
    aria-live="polite" 
    aria-atomic="true"
    class="sr-only"
  >
    {announcement}
  </div>
{/if}

<style>
  /* Screen reader only text */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  
  /* Ensure smooth animations and proper z-indexing */
  .category-dropdown {
    position: relative;
  }
  
  /* Enhanced mobile touch targets */
  @media (hover: none) and (pointer: coarse) {
    button:active {
      transform: scale(0.98);
    }
  }
  
  /* Improve scrolling on mobile */
  .overflow-y-auto {
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }
  
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    button:focus-visible {
      outline: 3px solid currentColor;
      outline-offset: 2px;
    }
    
    [aria-selected="true"] {
      outline: 2px solid currentColor;
    }
  }
  
  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    button {
      transition: none;
    }
    
    button:active {
      transform: none;
    }
    
    .overflow-y-auto {
      scroll-behavior: auto;
    }
  }
</style>