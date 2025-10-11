<script lang="ts">
import type { SearchBarMode } from './types.js';
import { useAnalytics } from '../../hooks/analytics.js';
import Button from '../../primitives/button/Button.svelte';

interface Props {
  mode: SearchBarMode;
  searchQuery?: string;
  totalProducts?: number;
  suggestedCategories?: Array<{ slug: string; name: string; icon: string }>;
  suggestedCollections?: Array<{ key: string; label: string; emoji: string }>;
  onCategorySelect?: (categorySlug: string) => void;
  onCollectionSelect?: (collectionKey: string) => void;
  onSearchSuggestion?: (query: string) => void;
  class?: string;
}

let {
  mode,
  searchQuery = '',
  totalProducts = 0,
  suggestedCategories = [],
  suggestedCollections = [],
  onCategorySelect,
  onCollectionSelect,
  onSearchSuggestion,
  class: className = ''
}: Props = $props();

// Analytics hooks
const { trackEmptyStateAction } = useAnalytics();

// Suggested search terms based on mode
const searchSuggestions = $derived(() => {
  const suggestions = [
    'vintage leather jacket',
    'nike sneakers',
    'designer handbag',
    'denim jeans',
    'summer dress'
  ];

  if (mode === 'power') {
    return suggestions.slice(0, 3);
  } else if (mode === 'compact') {
    return suggestions.slice(0, 2);
  }
  return suggestions;
});

// Handle suggestion clicks
function handleSuggestionClick(suggestion: string) {
  trackEmptyStateAction('search_suggestion_clicked', mode, suggestion);
  onSearchSuggestion?.(suggestion);
}

function handleCategoryClick(categorySlug: string, categoryName: string) {
  trackEmptyStateAction('category_suggestion_clicked', mode, categoryName);
  onCategorySelect?.(categorySlug);
}

function handleCollectionClick(collectionKey: string, collectionLabel: string) {
  trackEmptyStateAction('collection_suggestion_clicked', mode, collectionLabel);
  onCollectionSelect?.(collectionKey);
}

// Get appropriate empty state content based on mode and context
const emptyStateContent = $derived(() => {
  if (searchQuery.trim()) {
    // Search performed but no results
    return {
      title: 'No results found',
      subtitle: `We couldn't find anything matching "${searchQuery}"`,
      icon: '🔍',
      showSuggestions: true,
      actionText: 'Try these popular searches instead:'
    };
  } else {
    // No search performed yet
    switch (mode) {
      case 'power':
        return {
          title: 'Find exactly what you\'re looking for',
          subtitle: `Browse ${totalProducts.toLocaleString()} unique items from verified sellers`,
          icon: '⚡',
          showSuggestions: true,
          actionText: 'Popular searches:'
        };
      case 'compact':
        return {
          title: 'Start your search',
          subtitle: 'Discover unique items',
          icon: '👀',
          showSuggestions: true,
          actionText: 'Try:'
        };
      default: // full
        return {
          title: 'Welcome to the marketplace',
          subtitle: `Discover ${totalProducts.toLocaleString()} unique items from trusted sellers worldwide`,
          icon: '🌟',
          showSuggestions: true,
          actionText: 'Popular searches:'
        };
    }
  }
});
</script>

<div class="search-empty-state {className}" role="status" aria-label="Search suggestions">
  <div class="text-center py-12 px-4">
    <!-- Icon and primary content -->
    <div class="mb-6">
      <div class="text-4xl mb-4" role="img" aria-label="Search icon">
        {emptyStateContent().icon}
      </div>
      <h3 class="text-[length:var(--text-xl)] font-semibold text-[color:var(--text-primary)] mb-2">
        {emptyStateContent().title}
      </h3>
      <p class="text-[length:var(--text-base)] text-[color:var(--text-secondary)] max-w-md mx-auto">
        {emptyStateContent().subtitle}
      </p>
    </div>

    {#if emptyStateContent().showSuggestions}
      <!-- Search suggestions -->
      {#if searchSuggestions.length > 0}
        <div class="mb-8">
          <h4 class="text-[length:var(--text-sm)] font-medium text-[color:var(--text-secondary)] mb-3">
            {emptyStateContent().actionText}
          </h4>
          <div class="flex flex-wrap justify-center gap-2">
            {#each searchSuggestions() as suggestion}
              <button
                onclick={() => handleSuggestionClick(suggestion)}
                class="px-4 py-2 h-10 min-h-10 bg-[color:var(--surface-subtle)] hover:bg-[color:var(--surface-emphasis)] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] rounded-full text-[length:var(--text-sm)] font-medium transition-all duration-200 border border-[color:var(--border-subtle)] hover:border-[color:var(--border-default)]"
                aria-label="Search for {suggestion}"
              >
                {suggestion}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Category suggestions -->
      {#if suggestedCategories.length > 0}
        <div class="mb-8">
          <h4 class="text-[length:var(--text-sm)] font-medium text-[color:var(--text-secondary)] mb-3">
            Browse by category:
          </h4>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {#each suggestedCategories as category}
              <button
                onclick={() => handleCategoryClick(category.slug, category.name)}
                class="flex flex-col items-center p-4 h-20 min-h-20 bg-[color:var(--surface-base)] hover:bg-[color:var(--surface-subtle)] border border-[color:var(--border-subtle)] hover:border-[color:var(--border-default)] rounded-lg transition-all duration-200 group"
                aria-label="Browse {category.name} category"
              >
                <div class="text-lg mb-1 group-hover:scale-110 transition-transform duration-200">
                  {category.icon}
                </div>
                <span class="text-[length:var(--text-xs)] font-medium text-[color:var(--text-secondary)] group-hover:text-[color:var(--text-primary)] text-center">
                  {category.name}
                </span>
              </button>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Collection suggestions -->
      {#if suggestedCollections.length > 0}
        <div>
          <h4 class="text-[length:var(--text-sm)] font-medium text-[color:var(--text-secondary)] mb-3">
            Quick collections:
          </h4>
          <div class="flex flex-wrap justify-center gap-2">
            {#each suggestedCollections as collection}
              <button
                onclick={() => handleCollectionClick(collection.key, collection.label)}
                class="flex items-center gap-2 px-3 py-2 h-10 min-h-10 bg-[color:var(--surface-base)] hover:bg-[color:var(--surface-subtle)] border border-[color:var(--border-subtle)] hover:border-[color:var(--border-default)] rounded-lg transition-all duration-200 group"
                aria-label="Browse {collection.label} collection"
              >
                <span class="text-sm group-hover:scale-110 transition-transform duration-200">
                  {collection.emoji}
                </span>
                <span class="text-[length:var(--text-sm)] font-medium text-[color:var(--text-secondary)] group-hover:text-[color:var(--text-primary)]">
                  {collection.label}
                </span>
              </button>
            {/each}
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .search-empty-state {
    position: relative;
  }

  /* Gentle animation for the icon */
  .search-empty-state [role="img"] {
    animation: gentle-pulse 3s ease-in-out infinite;
  }

  @keyframes gentle-pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    .search-empty-state [role="img"] {
      animation: none;
    }
  }
</style>