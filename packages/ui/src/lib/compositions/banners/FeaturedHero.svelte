<script lang="ts">
  import FeaturedHeroSlide from './FeaturedHeroSlide.svelte';

  interface HeroItem {
    id: string;
    title: string;
    subtitle?: string;
    price?: string;
    image: string;
    rating?: number;
    isSuperHost?: boolean;
    onPrimaryClick?: () => void;
    onSecondaryClick?: () => void;
    primaryLabel?: string;
    secondaryLabel?: string;
  }

  interface Props {
    items: HeroItem[];
    class?: string;
  }

  let { items, class: className = '' }: Props = $props();
</script>

<div class={`relative w-full ${className}`}>
  <div class="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 no-scrollbar">
    {#each items as item (item.id)}
       <div class="w-[85%] sm:w-full shrink-0 snap-center first:pl-0 last:pr-4 sm:last:pr-0">
          <FeaturedHeroSlide {...item} />
       </div>
    {/each}
  </div>
</div>

<style>
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
