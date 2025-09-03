<script lang="ts">
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

<div class="bg-white border-b border-gray-100">
  <div class="flex items-center gap-3 p-4">
    <!-- Back Button (Mobile) -->
    {#if onBack}
      <button
        class="flex-shrink-0 p-2 -ml-2 rounded-lg hover:bg-gray-50 transition-colors"
        onclick={onBack}
        type="button"
        aria-label="Go back"
      >
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    {/if}

    <!-- Breadcrumb Navigation -->
    <nav class="flex items-center text-sm overflow-hidden" aria-label="Breadcrumb">
      <ol class="flex items-center space-x-1">
        <!-- Home -->
        <li>
          <a 
            href="/" 
            class="text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            Home
          </a>
        </li>

        <!-- Parent Category (Men/Women/Kids) -->
        {#if parentCategory}
          <li class="flex items-center space-x-1">
            <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
            <a 
              href={`/category/${parentCategory.slug}`}
              class="text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              {parentCategory.name}
            </a>
          </li>
        {/if}

        <!-- Subcategory -->
        {#if category}
          <li class="flex items-center space-x-1">
            <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
            <a 
              href={`/category/${category.slug}`}
              class="text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              {category.name}
            </a>
          </li>
        {/if}

        <!-- Current Product -->
        <li class="flex items-center space-x-1">
          <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
          <span class="text-gray-900 font-semibold truncate">
            {truncatedTitle}
          </span>
        </li>
      </ol>
    </nav>
  </div>
</div>