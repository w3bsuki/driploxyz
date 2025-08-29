<script lang="ts">
  interface Partner {
    id: string;
    name: string;
    logo?: string;
    website?: string;
    instagram?: string;
    category?: string;
    description?: string;
    backgroundColor?: string;
    textColor?: string;
  }

  interface Props {
    partner: Partner;
    size?: 'small' | 'medium' | 'large';
    variant?: 'banner' | 'compact' | 'featured';
    showDescription?: boolean;
  }

  let { 
    partner,
    size = 'medium',
    variant = 'banner',
    showDescription = false
  }: Props = $props();

  function handleClick() {
    // Prioritize Instagram over website
    const url = partner.instagram || partner.website;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  const sizeClasses = {
    small: 'p-3 min-h-[60px]',
    medium: 'p-4 min-h-[80px]', 
    large: 'p-6 min-h-[120px]'
  };

  const logoSizes = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  };
</script>

{#if variant === 'banner'}
  <button
    onclick={handleClick}
    class="w-full bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg 
           hover:border-gray-300 hover:shadow-sm transition-all duration-200 
           focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
           {sizeClasses[size]}"
    style="background-color: {partner.backgroundColor || 'transparent'}; color: {partner.textColor || 'inherit'}"
    title="Visit {partner.name} {partner.instagram ? 'on Instagram' : partner.website ? 'website' : ''}"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3 flex-1">
        <!-- Logo -->
        {#if partner.logo}
          <div class="flex-shrink-0 {logoSizes[size]} rounded-md overflow-hidden bg-white">
            <img 
              src={partner.logo} 
              alt="{partner.name} logo" 
              class="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
        {:else}
          <div class="flex-shrink-0 {logoSizes[size]} bg-gray-300 rounded-full flex items-center justify-center">
            <span class="text-gray-600 font-bold {size === 'large' ? 'text-lg' : 'text-sm'}">
              {partner.name.charAt(0).toUpperCase()}
            </span>
          </div>
        {/if}
        
        <!-- Content -->
        <div class="flex-1 text-left min-w-0">
          <div class="flex items-center space-x-2">
            <span class="text-xs font-medium text-gray-600 uppercase tracking-wider">Partner</span>
            {#if partner.instagram}
              <svg class="w-3 h-3 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C8.396 0 7.929.013 6.71.072 5.493.131 4.73.33 4.058.63c-.692.3-1.281.72-1.866 1.305-.585.585-1.006 1.174-1.305 1.866-.3.672-.499 1.435-.558 2.652C.013 7.929 0 8.396 0 12.017s.013 4.088.072 5.307c.059 1.217.258 1.98.558 2.652.3.692.72 1.281 1.305 1.866.585.585 1.174 1.006 1.866 1.305.672.3 1.435.499 2.652.558 1.219.059 1.686.072 5.307.072s4.088-.013 5.307-.072c1.217-.059 1.98-.258 2.652-.558.692-.3 1.281-.72 1.866-1.305.585-.585 1.006-1.174 1.305-1.866.3-.672.499-1.435.558-2.652.059-1.219.072-1.686.072-5.307s-.013-4.088-.072-5.307c-.059-1.217-.258-1.98-.558-2.652C21.36 2.437 20.94 1.848 20.355 1.263S18.462.632 17.77.33c-.672-.3-1.435-.499-2.652-.558C13.899.013 13.432 0 12.017 0zm0 2.167c3.555 0 3.977.012 5.378.07 1.297.059 2.001.277 2.47.46.62.24 1.062.527 1.527.992.465.465.752.907.992 1.527.183.469.401 1.173.46 2.47.058 1.401.07 1.823.07 5.378s-.012 3.977-.07 5.378c-.059 1.297-.277 2.001-.46 2.47-.24.62-.527 1.062-.992 1.527-.465.465-.907.752-1.527.992-.469.183-1.173.401-2.47.46-1.401.058-1.823.07-5.378.07s-3.977-.012-5.378-.07c-1.297-.059-2.001-.277-2.47-.46-.62-.24-1.062-.527-1.527-.992-.465-.465-.752-.907-.992-1.527-.183-.469-.401-1.173-.46-2.47C2.179 15.994 2.167 15.572 2.167 12.017s.012-3.977.07-5.378c.059-1.297.277-2.001.46-2.47.24-.62.527-1.062.992-1.527.465-.465.907-.752 1.527-.992.469-.183 1.173-.401 2.47-.46 1.401-.058 1.823-.07 5.378-.07z"/>
                <path d="M12.017 5.838a6.179 6.179 0 100 12.358 6.179 6.179 0 000-12.358zm0 10.191a4.012 4.012 0 110-8.024 4.012 4.012 0 010 8.024z"/>
                <circle cx="18.406" cy="5.594" r="1.444"/>
              </svg>
            {/if}
          </div>
          <p class="font-semibold text-gray-900 truncate {size === 'large' ? 'text-lg' : 'text-sm'}">
            {partner.name}
          </p>
          {#if showDescription && partner.description}
            <p class="text-xs text-gray-600 mt-1 line-clamp-2">
              {partner.description}
            </p>
          {/if}
        </div>
      </div>
      
      <!-- Arrow -->
      <div class="flex-shrink-0 ml-3">
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  </button>

{:else if variant === 'compact'}
  <button
    onclick={handleClick}
    class="inline-flex items-center space-x-2 bg-white border border-gray-200 rounded-full px-3 py-2
           hover:border-gray-300 hover:shadow-sm transition-all duration-200
           focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
    title="Visit {partner.name}"
  >
    {#if partner.logo}
      <div class="w-5 h-5 rounded-full overflow-hidden bg-gray-50">
        <img 
          src={partner.logo} 
          alt="{partner.name} logo" 
          class="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
    {/if}
    <span class="text-sm font-medium text-gray-700">{partner.name}</span>
    {#if partner.instagram}
      <svg class="w-3 h-3 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.017 0C8.396 0 7.929.013 6.71.072 5.493.131 4.73.33 4.058.63c-.692.3-1.281.72-1.866 1.305-.585.585-1.006 1.174-1.305 1.866-.3.672-.499 1.435-.558 2.652C.013 7.929 0 8.396 0 12.017s.013 4.088.072 5.307c.059 1.217.258 1.98.558 2.652.3.692.72 1.281 1.305 1.866.585.585 1.174 1.006 1.866 1.305.672.3 1.435.499 2.652.558 1.219.059 1.686.072 5.307.072s4.088-.013 5.307-.072c1.217-.059 1.98-.258 2.652-.558.692-.3 1.281-.72 1.866-1.305.585-.585 1.006-1.174 1.305-1.866.3-.672.499-1.435.558-2.652.059-1.219.072-1.686.072-5.307s-.013-4.088-.072-5.307c-.059-1.217-.258-1.98-.558-2.652C21.36 2.437 20.94 1.848 20.355 1.263S18.462.632 17.77.33c-.672-.3-1.435-.499-2.652-.558C13.899.013 13.432 0 12.017 0zm0 2.167c3.555 0 3.977.012 5.378.07 1.297.059 2.001.277 2.47.46.62.24 1.062.527 1.527.992.465.465.752.907.992 1.527.183.469.401 1.173.46 2.47.058 1.401.07 1.823.07 5.378s-.012 3.977-.07 5.378c-.059 1.297-.277 2.001-.46 2.47-.24.62-.527 1.062-.992 1.527-.465.465-.907.752-1.527.992-.469.183-1.173.401-2.47.46-1.401.058-1.823.07-5.378.07s-3.977-.012-5.378-.07c-1.297-.059-2.001-.277-2.47-.46-.62-.24-1.062-.527-1.527-.992-.465-.465-.752-.907-.992-1.527-.183-.469-.401-1.173-.46-2.47C2.179 15.994 2.167 15.572 2.167 12.017s.012-3.977.07-5.378c.059-1.297.277-2.001.46-2.47.24-.62.527-1.062.992-1.527.465-.465.907-.752 1.527-.992.469-.183 1.173-.401 2.47-.46 1.401-.058 1.823-.07 5.378-.07z"/>
        <path d="M12.017 5.838a6.179 6.179 0 100 12.358 6.179 6.179 0 000-12.358zm0 10.191a4.012 4.012 0 110-8.024 4.012 4.012 0 010 8.024z"/>
        <circle cx="18.406" cy="5.594" r="1.444"/>
      </svg>
    {/if}
  </button>

{:else if variant === 'featured'}
  <div class="bg-gradient-to-r from-black to-gray-800 rounded-xl p-6 text-white relative overflow-hidden">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-10">
      <svg class="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
      </svg>
    </div>
    
    <div class="relative z-10">
      <button
        onclick={handleClick}
        class="group w-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded-lg"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            {#if partner.logo}
              <div class="w-12 h-12 bg-white rounded-lg p-2 flex-shrink-0">
                <img 
                  src={partner.logo} 
                  alt="{partner.name} logo" 
                  class="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
            {/if}
            
            <div class="text-left">
              <div class="flex items-center space-x-2 mb-1">
                <span class="text-xs font-medium text-gray-300 uppercase tracking-wider">Featured Partner</span>
                {#if partner.instagram}
                  <svg class="w-3 h-3 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C8.396 0 7.929.013 6.71.072 5.493.131 4.73.33 4.058.63c-.692.3-1.281.72-1.866 1.305-.585.585-1.006 1.174-1.305 1.866-.3.672-.499 1.435-.558 2.652C.013 7.929 0 8.396 0 12.017s.013 4.088.072 5.307c.059 1.217.258 1.98.558 2.652.3.692.72 1.281 1.305 1.866.585.585 1.174 1.006 1.866 1.305.672.3 1.435.499 2.652.558 1.219.059 1.686.072 5.307.072s4.088-.013 5.307-.072c1.217-.059 1.98-.258 2.652-.558.692-.3 1.281-.72 1.866-1.305.585-.585 1.006-1.174 1.305-1.866.3-.672.499-1.435.558-2.652.059-1.219.072-1.686.072-5.307s-.013-4.088-.072-5.307c-.059-1.217-.258-1.98-.558-2.652C21.36 2.437 20.94 1.848 20.355 1.263S18.462.632 17.77.33c-.672-.3-1.435-.499-2.652-.558C13.899.013 13.432 0 12.017 0zm0 2.167c3.555 0 3.977.012 5.378.07 1.297.059 2.001.277 2.47.46.62.24 1.062.527 1.527.992.465.465.752.907.992 1.527.183.469.401 1.173.46 2.47.058 1.401.07 1.823.07 5.378s-.012 3.977-.07 5.378c-.059 1.297-.277 2.001-.46 2.47-.24.62-.527 1.062-.992 1.527-.465.465-.907.752-1.527.992-.469.183-1.173.401-2.47.46-1.401.058-1.823.07-5.378.07s-3.977-.012-5.378-.07c-1.297-.059-2.001-.277-2.47-.46-.62-.24-1.062-.527-1.527-.992-.465-.465-.752-.907-.992-1.527-.183-.469-.401-1.173-.46-2.47C2.179 15.994 2.167 15.572 2.167 12.017s.012-3.977.07-5.378c.059-1.297.277-2.001.46-2.47.24-.62.527-1.062.992-1.527.465-.465.907-.752 1.527-.992.469-.183 1.173-.401 2.47-.46 1.401-.058 1.823-.07 5.378-.07z"/>
                    <path d="M12.017 5.838a6.179 6.179 0 100 12.358 6.179 6.179 0 000-12.358zm0 10.191a4.012 4.012 0 110-8.024 4.012 4.012 0 010 8.024z"/>
                    <circle cx="18.406" cy="5.594" r="1.444"/>
                  </svg>
                {/if}
              </div>
              <h3 class="text-lg font-bold group-hover:text-gray-200 transition-colors">
                {partner.name}
              </h3>
              {#if partner.description}
                <p class="text-sm text-gray-300 mt-1">
                  {partner.description}
                </p>
              {/if}
            </div>
          </div>
          
          <div class="text-white group-hover:translate-x-1 transition-transform">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        </div>
      </button>
    </div>
  </div>
{/if}

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>