<script lang="ts">
  import { Button } from '@repo/ui';

  interface Collection {
    id: string;
    name: string;
    slug: string;
    description: string;
    collection_type: 'drip' | 'designer';
    is_featured: boolean;
  }

  interface Props {
    collections: Collection[];
    selectedCollectionId?: string;
    onCollectionChange: (collectionId: string | null) => void;
    error?: string;
    class?: string;
  }

  let {
    collections = [],
    selectedCollectionId = undefined,
    onCollectionChange,
    error = undefined,
    class: className = ''
  }: Props = $props();

  // Group collections by type
  const dripCollections = $derived(collections.filter(c => c.collection_type === 'drip'));
  const designerCollections = $derived(collections.filter(c => c.collection_type === 'designer'));

  // Collection emojis for visual appeal
  const collectionEmojis: Record<string, string> = {
    'drip': '💧',
    'designer': '👑',
    'vintage': '✨',
    'sport': '⚡',
    'outdoor': '🏔️',
    'streetwear': '🔥',
    'luxury': '💎',
    'corteiz': '🎯',
    'nike': '✓',
    'fear-of-god-essentials': '🤍',
    'off-white': '⚡',
    'stone-island': '🧭',
    'bape': '🐒',
    'chanel': '👑',
    'gucci': '🐝',
    'dior': '🌹',
    'ysl': '💋',
    'versace': '⚡',
    'celine': '🤎'
  };

  function getCollectionEmoji(slug: string): string {
    return collectionEmojis[slug] || '📦';
  }
</script>

<div class="space-y-4 {className}">
  <!-- Section Header -->
  <div>
    <h3 class="text-lg font-semibold text-gray-900 mb-1">Collection</h3>
    <p class="text-sm text-gray-600">Choose a collection that best describes your item's style</p>
  </div>

  <!-- DRIP Collections -->
  {#if dripCollections.length > 0}
    <div class="space-y-3">
      <div class="flex items-center gap-2">
        <span class="text-lg">💧</span>
        <h4 class="font-medium text-gray-900">DRIP Collections</h4>
        <span class="text-xs bg-[var(--surface-brand-strong)]/10 text-[color-mix(in_oklch,var(--brand-primary-strong)_90%,black_10%)] px-2 py-0.5 rounded-full">Trendy</span>
      </div>

      <div class="grid grid-cols-1 gap-2">
        {#each dripCollections as collection}
          <button
            type="button"
            onclick={() => onCollectionChange(selectedCollectionId === collection.id ? null : collection.id)}
            class="text-left p-3 rounded-lg border-2 transition-all duration-200 {
              selectedCollectionId === collection.id
                ? 'border-blue-500 bg-[var(--surface-brand-strong)]/5 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }"
          >
            <div class="flex items-start gap-3">
              <span class="text-xl flex-shrink-0 mt-0.5">{getCollectionEmoji(collection.slug)}</span>
              <div class="flex-1 min-w-0">
                <div class="font-medium text-gray-900">{collection.name}</div>
                <div class="text-sm text-gray-600 line-clamp-2">{collection.description}</div>
              </div>
              {#if selectedCollectionId === collection.id}
                <div class="flex-shrink-0">
                  <svg class="w-5 h-5 text-[var(--brand-primary-strong)]" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
              {/if}
            </div>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Designer Collections -->
  {#if designerCollections.length > 0}
    <div class="space-y-3">
      <div class="flex items-center gap-2">
        <span class="text-lg">👑</span>
        <h4 class="font-medium text-gray-900">Designer Collections</h4>
        <span class="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Luxury</span>
      </div>

      <div class="grid grid-cols-2 gap-2">
        {#each designerCollections as collection}
          <button
            type="button"
            onclick={() => onCollectionChange(selectedCollectionId === collection.id ? null : collection.id)}
            class="text-left p-3 rounded-lg border-2 transition-all duration-200 {
              selectedCollectionId === collection.id
                ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }"
          >
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <span class="text-lg">{getCollectionEmoji(collection.slug)}</span>
                {#if selectedCollectionId === collection.id}
                  <svg class="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                {/if}
              </div>
              <div>
                <div class="font-medium text-gray-900 text-sm">{collection.name}</div>
              </div>
            </div>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Skip Option -->
  <div class="pt-2 border-t border-gray-100">
    <button
      type="button"
      onclick={() => onCollectionChange(null)}
      class="text-left w-full p-3 rounded-lg border-2 transition-all duration-200 {
        selectedCollectionId === null || selectedCollectionId === undefined
          ? 'border-gray-500 bg-gray-50 ring-2 ring-gray-200'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }"
    >
      <div class="flex items-center gap-3">
        <span class="text-xl">📦</span>
        <div class="flex-1">
          <div class="font-medium text-gray-900">General Collection</div>
          <div class="text-sm text-gray-600">No specific collection - just regular marketplace listing</div>
        </div>
        {#if selectedCollectionId === null || selectedCollectionId === undefined}
          <svg class="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        {/if}
      </div>
    </button>
  </div>

  <!-- Error Display -->
  {#if error}
    <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-sm text-red-600">{error}</p>
    </div>
  {/if}
</div>

<style>
  .line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }
</style>