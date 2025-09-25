<script lang="ts">
  interface Partner {
    id: string;
    name: string;
    logo: string;
    website?: string;
    instagram?: string;
    category?: string;
    description?: string;
  }

  interface Props {
    partners: Partner[];
    title?: string;
    variant?: 'horizontal' | 'marquee' | 'grid';
    showTitle?: boolean;
    autoScroll?: boolean;
    scrollSpeed?: number;
  }

  let { 
    partners = [],
    title = 'Our Partners',
    variant = 'horizontal',
    showTitle = true,
    autoScroll = false,
    scrollSpeed = 30000
  }: Props = $props();

  let scrollContainer = $state<HTMLDivElement>();
  let isScrolling = $state(false);

  function handlePartnerClick(partner: Partner) {
    // Prioritize Instagram over website
    const url = partner.instagram || partner.website;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  // Auto-scroll functionality for marquee variant
  $effect(() => {
    if (variant === 'marquee' && autoScroll && scrollContainer && !isScrolling) {
      const scroll = () => {
        if (!scrollContainer) return;
        
        scrollContainer.scrollLeft += 1;
        
        // Reset scroll position when reached end
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
          scrollContainer.scrollLeft = 0;
        }
      };

      const intervalId = setInterval(scroll, scrollSpeed / 1000);
      
      return () => clearInterval(intervalId);
    }
  });
</script>

{#if partners.length > 0}
  <div class="partner-showcase">
    {#if showTitle}
      <h3 class="text-lg font-semibold text-gray-900 mb-4 px-4 sm:px-0">{title}</h3>
    {/if}

    {#if variant === 'horizontal' || variant === 'marquee'}
      <div
        bind:this={scrollContainer}
        role="region"
        aria-label="Partner showcase"
        class="flex overflow-x-auto scrollbarhide gap-4 px-4 sm:px-0 pb-2
               {variant === 'marquee' ? 'scroll-smooth' : ''}"
        onmouseenter={() => { if (variant === 'marquee') isScrolling = true; }}
        onmouseleave={() => { if (variant === 'marquee') isScrolling = false; }}
      >
        {#each partners as partner}
          <button
            onclick={() => handlePartnerClick(partner)}
            class="flex-shrink-0 group relative bg-white border border-gray-200 rounded-lg p-4 
                   hover:border-gray-300 hover:shadow-sm transition-all duration-200
                   focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
                   min-w-[120px] max-w-[160px]"
            title="{partner.name}{partner.description ? ` - ${partner.description}` : ''}"
          >
            <!-- Logo -->
            <div class="aspect-square w-12 h-12 mx-auto mb-2 overflow-hidden rounded-md bg-gray-50 flex items-center justify-center">
              {#if partner.logo}
                <img 
                  src={partner.logo} 
                  alt="{partner.name} logo" 
                  class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />
              {:else}
                <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span class="text-gray-500 text-xs font-bold">
                    {partner.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              {/if}
            </div>
            
            <!-- Partner Name -->
            <p class="text-sm font-medium text-gray-900 text-center truncate group-hover:text-black transition-colors">
              {partner.name}
            </p>
            
            <!-- Link Icon -->
            {#if partner.instagram || partner.website}
              <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg class="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            {/if}
          </button>
        {/each}
      </div>

    {:else if variant === 'grid'}
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 px-4 sm:px-0">
        {#each partners as partner}
          <button
            onclick={() => handlePartnerClick(partner)}
            class="group relative bg-white border border-gray-200 rounded-lg p-4 
                   hover:border-gray-300 hover:shadow-md transition-all duration-200
                   focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
                   aspect-square"
            title="{partner.name}{partner.description ? ` - ${partner.description}` : ''}"
          >
            <!-- Logo -->
            <div class="w-full h-full flex items-center justify-center">
              {#if partner.logo}
                <img 
                  src={partner.logo} 
                  alt="{partner.name} logo" 
                  class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />
              {:else}
                <div class="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                  <span class="text-gray-500 text-lg font-bold">
                    {partner.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              {/if}
            </div>
            
            <!-- Partner Name Overlay -->
            <div class="absolute inset-x-0 bottom-0 bg-black bg-opacity-75 text-white p-2 rounded-b-lg 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <p class="text-xs font-medium text-center truncate">
                {partner.name}
              </p>
            </div>
            
            <!-- Link Icon -->
            {#if partner.instagram || partner.website}
              <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg class="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            {/if}
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  /* Respect prefers-reduced-motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    .group img,
    .group button,
    .group div {
      transition: none !important;
      transform: none !important;
    }
    
    /* Remove smooth scrolling for reduced motion users */
    :global(.scroll-smooth) {
      scroll-behavior: auto !important;
    }
  }
</style>

