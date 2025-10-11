<script lang="ts">
  import * as i18n from '@repo/i18n';
  const m: any = i18n;
  
  interface Category {
    id: string
    name: string
    slug: string
    parent_id?: string | null
  }

  interface Props {
    category?: Category | null
    parentCategory?: Category | null
    topLevelCategory?: Category | null
    productTitle: string
    seller?: {
      username: string | null;
      full_name?: string | null;
    } | null
    onBack?: () => void
    translations?: {
      categoryTranslation?: (category: string, slug?: string | null) => string;
    }
    currentUrl?: string
    variant?: 'default' | 'solid'
  }

  let { 
    category, 
    parentCategory, 
    topLevelCategory,
    productTitle, 
    seller, 
    onBack, 
    translations,
    currentUrl = '',
    variant = 'default'
  }: Props = $props();

  // Get current locale for proper URL generation
  const currentLocale = i18n.getLocale();
  
  const sellerName = seller?.full_name || seller?.username || null;
  
  // Generate locale-aware URLs
  const generateLocaleUrl = (path: string) => {
    // For Bulgarian (default), no prefix
    if (currentLocale === 'bg') {
      return path;
    }
    // For English, use /uk prefix
    if (currentLocale === 'en') {
      return `/uk${path}`;
    }
    return path;
  };
  
  const sellerHref = seller?.username ? generateLocaleUrl(`/profile/${seller.username}`) : '';

  // Build breadcrumb items
  const breadcrumbItems = $derived(() => {
    const items: Array<{ name: string; href?: string; current?: boolean; isHome?: boolean }> = [];
    
    // Home
    items.push({ 
      name: m.nav_home(), 
      href: generateLocaleUrl('/'),
      isHome: true
    });
    
    // Category hierarchy
    if (topLevelCategory?.slug) {
      items.push({ 
        name: translations?.categoryTranslation 
          ? translations.categoryTranslation(topLevelCategory.name, topLevelCategory.slug) 
          : topLevelCategory.name, 
        href: generateLocaleUrl(`/category/${topLevelCategory.slug}`) 
      });
    }
    
    if (parentCategory?.slug && parentCategory.slug !== topLevelCategory?.slug) {
      items.push({ 
        name: translations?.categoryTranslation 
          ? translations.categoryTranslation(parentCategory.name, parentCategory.slug) 
          : parentCategory.name, 
        href: generateLocaleUrl(`/category/${parentCategory.slug}`) 
      });
    }
    
    if (category?.slug && category.slug !== parentCategory?.slug && category.slug !== topLevelCategory?.slug) {
      items.push({ 
        name: translations?.categoryTranslation 
          ? translations.categoryTranslation(category.name, category.slug) 
          : category.name, 
        href: generateLocaleUrl(`/category/${category.slug}`) 
      });
    }
    
    // Current Product (truncate on mobile)
    items.push({ 
      name: productTitle, 
      current: true 
    });
    
    return items;
  });

  // Build SEO BreadcrumbList (JSON-LD)
  const breadcrumbLd = $derived(() => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems().map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      ...(item.href ? { item: item.href } : {})
    }))
  }));
</script>

<!-- Mobile-First Professional Breadcrumb -->
<nav 
  class="w-full {variant === 'solid' ? 'bg-[color:var(--gray-50)] border-b border-[color:var(--gray-200)]' : ''}"
  aria-label="Breadcrumb"
>
  <div class="flex items-center px-3 py-2 max-w-screen-xl mx-auto sm:px-4 sm:py-3">
    <!-- Optional Back Button -->
    {#if onBack}
      <button
        class="flex items-center justify-center w-9 h-9 mr-2 rounded-lg hover:bg-[color:var(--gray-100)] transition-colors sm:hidden"
        onclick={onBack}
        type="button"
        aria-label="Go back"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
    {/if}

    <!-- Breadcrumb List -->
    <ol class="flex items-center flex-1 min-w-0 space-x-1 text-sm overflow-x-auto scrollbarhide">
      {#each breadcrumbItems() as item, index}
        {@const isLast = index === breadcrumbItems().length - 1}
        <li class="flex items-center">
          {#if item.current}
            <!-- Current Page (non-clickable) -->
            <span 
              class="px-2 py-1.5 font-medium text-[color:var(--gray-900)] truncate max-w-[140px] sm:max-w-none"
              aria-current="page"
            >
              {item.name}
            </span>
          {:else}
            <!-- Clickable Link -->
            <a 
              href={item.href}
              class="flex items-center px-2 py-1.5 text-[color:var(--gray-600)] hover:text-[color:var(--gray-900)] transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)] focus:ring-offset-1"
            >
              {#if item.isHome}
                <!-- Home Icon -->
                <svg class="w-4 h-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                </svg>
                <span class="truncate max-w-[100px] sm:max-w-[150px] md:max-w-none">{m.nav_home()}</span>
              {:else}
                <span class="truncate max-w-[100px] sm:max-w-[150px] md:max-w-none">
                  {item.name}
                </span>
              {/if}
            </a>
          {/if}
          
          <!-- Separator -->
          {#if !isLast}
            <svg class="w-4 h-4 mx-1 text-[color:var(--gray-400)] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
            </svg>
          {/if}
        </li>
      {/each}
    </ol>
  </div>
</nav>

<!-- SEO JSON-LD -->
<svelte:head>
  {@html `<script type="application/ld+json">${JSON.stringify(breadcrumbLd())}</script>`}
</svelte:head>

