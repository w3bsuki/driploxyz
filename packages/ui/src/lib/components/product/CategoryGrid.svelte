<script lang="ts">
  interface Props {
    onCategoryClick: (category: string) => void;
    compact?: boolean;
    translations?: {
      women?: string;
      men?: string;
      kids?: string;
      pets?: string;
    };
  }

  let { 
    onCategoryClick, 
    compact = false,
    translations = {
      women: '',
      men: '',
      kids: '',
      pets: ''
    }
  }: Props = $props();

  const categories = $derived([
    { key: 'women', label: translations.women, emoji: '👗' },
    { key: 'men', label: translations.men, emoji: '👔' },
    { key: 'kids', label: translations.kids, emoji: '👶' },
    { key: 'pets', label: translations.pets, emoji: '🐕' }
  ]);

  // Professional neutral styling for all categories
  const buttonClasses = 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300';
</script>

<div class="grid grid-cols-4 gap-2">
  {#each categories as category}
    <a
      href="/category/{category.key}"
      class="{buttonClasses} rounded-lg p-2 transition-colors min-h-11 flex flex-col items-center justify-center border"
      onclick={() => onCategoryClick(category.key)}
    >
      <span class="text-lg mb-0.5">{category.emoji}</span>
      <span class="text-xs font-medium text-gray-900">{category.label}</span>
    </a>
  {/each}
</div>