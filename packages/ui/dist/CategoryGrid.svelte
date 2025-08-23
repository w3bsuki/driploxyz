<script lang="ts">
  interface Props {
    onCategoryClick: (category: string) => void;
    compact?: boolean;
  }

  let { onCategoryClick, compact = false }: Props = $props();

  const categories = [
    { key: 'women', label: 'Women', emoji: '👗', color: 'pink' },
    { key: 'men', label: 'Men', emoji: '👔', color: 'blue' },
    { key: 'kids', label: 'Kids', emoji: '👶', color: 'yellow' },
    { key: 'pets', label: 'Pets', emoji: '🐕', color: 'green' }
  ];

  const colorClasses = {
    pink: 'bg-pink-50 hover:bg-pink-100 border-pink-200/50',
    blue: 'bg-blue-50 hover:bg-blue-100 border-blue-200/50',
    yellow: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200/50',
    green: 'bg-green-50 hover:bg-green-100 border-green-200/50'
  };
</script>

<div class="grid grid-cols-4 gap-2">
  {#each categories as category}
    <a
      href="/category/{category.key}"
      class="{colorClasses[category.color]} rounded-lg p-2 transition-colors min-h-[44px] flex flex-col items-center justify-center border"
      onclick={() => onCategoryClick(category.key)}
    >
      <span class="text-lg mb-0.5">{category.emoji}</span>
      <span class="text-xs font-medium text-gray-700">{category.label}</span>
    </a>
  {/each}
</div>