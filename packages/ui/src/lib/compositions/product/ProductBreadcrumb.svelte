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
  
  // Generate locale-aware URLs
  const generateLocaleUrl = (path: string) => {
    if (currentLocale === 'bg') return path;
    if (currentLocale === 'en') return `/uk${path}`;
    return path;
  };
  
  // Build breadcrumb items
  const items = $derived.by(() => {
    const arr: Array<{ name: string; href?: string; current?: boolean; isHome?: boolean }> = [];
    
    // Home
    arr.push({ 
      name: m.nav_home(), 
      href: generateLocaleUrl('/'),
      isHome: true
    });
    
    // Category hierarchy
    if (topLevelCategory?.slug) {
      arr.push({ 
        name: translations?.categoryTranslation 
          ? translations.categoryTranslation(topLevelCategory.name, topLevelCategory.slug) 
          : topLevelCategory.name, 
        href: generateLocaleUrl(`/category/${topLevelCategory.slug}`) 
      });
    }
    
    if (parentCategory?.slug && parentCategory.slug !== topLevelCategory?.slug) {
      arr.push({ 
        name: translations?.categoryTranslation 
          ? translations.categoryTranslation(parentCategory.name, parentCategory.slug) 
          : parentCategory.name, 
        href: generateLocaleUrl(`/category/${parentCategory.slug}`) 
      });
    }
    
    if (category?.slug && category.slug !== parentCategory?.slug && category.slug !== topLevelCategory?.slug) {
      arr.push({ 
        name: translations?.categoryTranslation 
          ? translations.categoryTranslation(category.name, category.slug) 
          : category.name, 
        href: generateLocaleUrl(`/category/${category.slug}`) 
      });
    }
    
    // Current Product
    arr.push({ 
      name: productTitle, 
      current: true 
    });
    
    return arr;
  });

  // Build SEO BreadcrumbList (JSON-LD)
  const breadcrumbLd = $derived.by(() => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      ...(item.href ? { item: item.href } : {})
    }))
  }));
</script>

<nav 
  class={`w-full ${variant === 'solid' ? 'bg-(--gray-50) border-b border-(--gray-200)' : ''}`}
  aria-label="Breadcrumb"
>
  <div class="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
    <ol class="flex items-center whitespace-nowrap overflow-x-auto no-scrollbar py-3 -mx-4 px-4 md:mx-0 md:px-0">
      {#each items as item, index (index)}
        <li class="inline-flex items-center min-w-0">
          {#if index > 0}
            <svg 
              class="mx-2 h-4 w-4 text-gray-400 shrink-0" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          {/if}

          {#if item.current}
            <span 
              class="text-sm font-medium text-gray-900 truncate max-w-[150px] sm:max-w-xs" 
              aria-current="page"
              title={item.name}
            >
              {item.name}
            </span>
          {:else}
            <a 
              href={item.href} 
              class="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center"
            >
              {#if item.isHome}
                <svg class="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clip-rule="evenodd" />
                </svg>
                <span class="sr-only sm:not-sr-only sm:ml-2">{item.name}</span>
              {:else}
                {item.name}
              {/if}
            </a>
          {/if}
        </li>
      {/each}
    </ol>
  </div>
</nav>

<style>
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>

<!-- SEO JSON-LD -->
<svelte:head>
  <script type="application/ld+json">
    {JSON.stringify(breadcrumbLd)}
  </script>
</svelte:head>

