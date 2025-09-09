<script lang="ts">
  import type { ProductData } from '../../types/product';

  interface Props {
    product: ProductData;
    isVisible: boolean;
    isLiked: boolean;
    likeCount: number;
    onFavorite: () => void;
    translations: {
      size: () => string;
      addFavorite: () => string;
      removeFavorite: () => string;
    };
    translateCondition: (condition: string) => string;
  }

  let { 
    product, 
    isVisible, 
    isLiked, 
    likeCount, 
    onFavorite, 
    translations,
    translateCondition
  }: Props = $props();
</script>

<header 
  class="sticky-header {isVisible ? 'visible' : ''}" 
  aria-hidden={!isVisible}
>
  <div class="header-content container">
    <div class="header-left">
      <h1 class="header-title">{product?.title || ''}</h1>
      <div class="header-meta">
        {#if product?.brand}
          <span class="meta-item">{product.brand}</span>
        {/if}
        {#if product?.size}
          <span class="meta-item">{translations.size()}: {product.size}</span>
        {/if}
        {#if product?.condition}
          <span class="meta-item">{translateCondition(product.condition)}</span>
        {/if}
      </div>
    </div>
    <div class="header-right">
      <button 
        class="header-fav" 
        type="button" 
        onclick={onFavorite} 
        aria-label={isLiked ? translations.removeFavorite() : translations.addFavorite()}
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill={isLiked ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          stroke-width="1.5" 
          aria-hidden="true"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <span>{likeCount}</span>
      </button>
    </div>
  </div>
</header>

<style>
  .sticky-header { 
    position: fixed; 
    top: 0; 
    left: 0; 
    right: 0; 
    z-index: 50; 
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid transparent; 
    transform: translateY(-100%); 
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    padding-top: max(0px, env(safe-area-inset-top));
  }
  
  .sticky-header.visible { 
    transform: translateY(0); 
    border-bottom-color: var(--border-subtle); 
    box-shadow: 0 4px 16px rgba(0,0,0,0.08); 
  }
  
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--space-4);
  }
  
  .header-content { 
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
    padding: var(--space-2) 0;
    min-height: var(--touch-compact);
  }
  
  .header-left {
    flex: 1;
    min-width: 0;
  }
  
  .header-title { 
    font-size: var(--text-base); 
    font-weight: var(--font-semibold);
    line-height: 1.2;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-primary);
  }
  
  .header-meta { 
    display: flex; 
    gap: var(--space-2); 
    color: var(--text-tertiary); 
    font-size: var(--text-xs);
    margin-top: var(--space-1);
  }

  /* Compact header for small screens */
  @media (max-width: 480px) {
    .header-title { 
      font-size: var(--text-sm); 
    }
    .header-content { 
      padding: var(--space-1) 0; 
    }
    .header-meta { 
      display: none; 
    }
  }
  
  .meta-item { 
    display: inline-flex; 
    align-items: center; 
    gap: 0.25rem;
    white-space: nowrap;
  }
  
  .header-fav { 
    display: flex; 
    gap: var(--space-1); 
    align-items: center; 
    border: none; 
    background: none; 
    color: var(--text-tertiary);
    padding: var(--space-2);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: var(--touch-compact);
    min-height: var(--touch-compact);
    justify-content: center;
  }
  
  .header-fav:hover {
    background: var(--surface-subtle);
    color: var(--text-secondary);
  }
  
  .header-fav:focus-visible {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
  }

  /* Touch device optimizations */
  @media (hover: none) and (pointer: coarse) {
    .header-fav:hover {
      background: none;
    }
  }
  
  /* Accessibility enhancements */
  @media (prefers-reduced-motion: reduce) {
    .sticky-header,
    .header-fav {
      transition: none;
    }
  }
  
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .sticky-header {
      background: var(--surface-base);
      backdrop-filter: none;
    }
  }
</style>