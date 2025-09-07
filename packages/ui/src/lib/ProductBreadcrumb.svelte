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
    productTitle: string
    onBack?: () => void
  }

  let { category, parentCategory, productTitle, onBack }: Props = $props()

  const truncatedTitle = $derived(productTitle.length > 30 ? productTitle.substring(0, 30) + '...' : productTitle)
</script>

<nav class="bg-surface border-b border-gray-200 px-4 py-3" aria-label="Breadcrumb">
  <div class="flex items-center gap-3">
    {#if onBack}
      <button
        class="btn-icon btn-ghost p-2 -ml-2"
        onclick={onBack}
        type="button"
        aria-label={m.pdp_goBack()}
      >
        <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    {/if}

    <ol class="flex items-center gap-1 text-sm text-gray-600 min-w-0 flex-1">
      <li>
        <a href="/" class="hover:text-gray-900 font-medium transition-colors">
          {m.nav_home()}
        </a>
      </li>

      {#if parentCategory}
        <li class="flex items-center gap-1">
          <svg class="size-4 text-gray-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
          <a href={`/category/${parentCategory.slug}`} class="hover:text-gray-900 font-medium transition-colors whitespace-nowrap">
            {parentCategory.name}
          </a>
        </li>
      {/if}

      {#if category}
        <li class="flex items-center gap-1">
          <svg class="size-4 text-gray-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
          <a href={`/category/${category.slug}`} class="hover:text-gray-900 font-medium transition-colors whitespace-nowrap">
            {category.name}
          </a>
        </li>
      {/if}

      <li class="flex items-center gap-1 min-w-0">
        <svg class="size-4 text-gray-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
        <span class="text-gray-900 font-semibold truncate">
          {truncatedTitle}
        </span>
      </li>
    </ol>
  </div>
</nav>