<script lang="ts">
  import { Star, MapPin } from 'lucide-svelte';
  import Button from '../../primitives/button/Button.svelte';

  interface Props {
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

  let { 
    title, 
    subtitle, 
    price, 
    image, 
    rating, 
    isSuperHost,
    onPrimaryClick,
    onSecondaryClick,
    primaryLabel = 'Shop now',
    secondaryLabel = 'Details'
  }: Props = $props();
</script>

<div class="relative w-full h-[200px] sm:h-60 rounded-lg overflow-hidden shadow-sm group shrink-0 snap-center">
  <!-- Background Image -->
  <img 
    src={image} 
    alt={title} 
    class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
  />
  
  <!-- Gradient Overlay -->
  <div class="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent"></div>

  <!-- Content -->
  <div class="absolute inset-0 p-4 flex flex-col justify-between">
    <!-- Top Badges -->
    <div class="flex gap-2">
      <div class="bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-bold border border-white/10 shadow-sm uppercase tracking-wider">
        Promoted
      </div>
      {#if rating}
        <div class="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] font-bold text-gray-900 shadow-sm">
          <Star size={10} class="fill-yellow-400 text-yellow-400" />
          {rating}
        </div>
      {/if}
      {#if isSuperHost}
        <div class="bg-black/80 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-bold border border-white/10 shadow-sm">
          Top Seller
        </div>
      {/if}
    </div>

    <!-- Bottom Info -->
    <div class="flex flex-col gap-2">
      <div class="flex items-end justify-between">
        <div class="text-white">
          <h3 class="text-lg sm:text-xl font-bold leading-tight mb-0.5 line-clamp-1">{title}</h3>
          {#if subtitle}
            <div class="flex items-center gap-1 text-gray-300 text-xs">
              <MapPin size={12} />
              <span class="font-medium">{subtitle}</span>
            </div>
          {/if}
        </div>

        {#if price}
           <div class="text-white text-right mb-0.5">
             <span class="text-[10px] opacity-80 mr-1">from</span>
             <span class="text-lg font-bold">{price}</span>
           </div>
        {/if}
      </div>
      
      <div class="flex gap-2 w-full">
        {#if onPrimaryClick}
          <Button variant="default" class="flex-1 bg-white text-black hover:bg-gray-100 border-none h-8 text-xs font-bold" onclick={onPrimaryClick}>
            {primaryLabel}
          </Button>
        {/if}
        {#if onSecondaryClick}
           <Button variant="outline" class="flex-1 border-white/30 text-white hover:bg-white/10 hover:text-white h-8 text-xs font-bold" onclick={onSecondaryClick}>
             {secondaryLabel}
           </Button>
        {/if}
      </div>
    </div>
  </div>
</div>
