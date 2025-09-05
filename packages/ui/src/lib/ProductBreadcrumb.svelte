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

<div class="breadcrumb-container">
  <div class="breadcrumb-content">
    <!-- Back Button (Mobile) -->
    {#if onBack}
      <button
        class="back-button"
        onclick={onBack}
        type="button"
        aria-label="Go back"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    {/if}

    <!-- Breadcrumb Navigation -->
    <nav class="breadcrumb-nav" aria-label="Breadcrumb">
      <ol class="breadcrumb-list">
        <!-- Home -->
        <li>
          <a href="/" class="breadcrumb-link">
            Home
          </a>
        </li>

        <!-- Parent Category (Men/Women/Kids) -->
        {#if parentCategory}
          <li class="breadcrumb-item">
            <svg class="breadcrumb-separator" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
            <a href={`/category/${parentCategory.slug}`} class="breadcrumb-link">
              {parentCategory.name}
            </a>
          </li>
        {/if}

        <!-- Subcategory -->
        {#if category}
          <li class="breadcrumb-item">
            <svg class="breadcrumb-separator" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
            <a href={`/category/${category.slug}`} class="breadcrumb-link">
              {category.name}
            </a>
          </li>
        {/if}

        <!-- Current Product -->
        <li class="breadcrumb-item">
          <svg class="breadcrumb-separator" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
          <span class="breadcrumb-current">
            {truncatedTitle}
          </span>
        </li>
      </ol>
    </nav>
  </div>
</div>

<style>
  .breadcrumb-container {
    background: var(--surface-base);
    border-bottom: 1px solid var(--border-subtle);
  }

  .breadcrumb-content {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4);
  }

  .back-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-2);
    margin-left: calc(-1 * var(--space-2));
    border: none;
    background: transparent;
    color: var(--text-secondary);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .back-button:hover {
    background: var(--surface-subtle);
    color: var(--text-primary);
  }

  .back-button:focus-visible {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
  }

  .breadcrumb-nav {
    display: flex;
    align-items: center;
    font-size: var(--text-sm);
    overflow: hidden;
    flex: 1;
  }

  .breadcrumb-list {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    margin: 0;
    padding: 0;
    list-style: none;
    min-width: 0;
  }

  .breadcrumb-item {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    min-width: 0;
  }

  .breadcrumb-link {
    color: var(--text-secondary);
    text-decoration: none;
    font-weight: var(--font-medium);
    transition: color 0.2s ease;
    white-space: nowrap;
  }

  .breadcrumb-link:hover {
    color: var(--text-primary);
  }

  .breadcrumb-link:focus-visible {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }

  .breadcrumb-separator {
    width: 16px;
    height: 16px;
    color: var(--text-tertiary);
    flex-shrink: 0;
  }

  .breadcrumb-current {
    color: var(--text-primary);
    font-weight: var(--font-semibold);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  /* Responsive adjustments */
  @media (max-width: 640px) {
    .breadcrumb-content {
      padding: var(--space-3) var(--space-4);
    }

    .breadcrumb-nav {
      font-size: var(--text-xs);
    }

    .breadcrumb-separator {
      width: 14px;
      height: 14px;
    }
  }
</style>