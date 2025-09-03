<script lang="ts">
  interface Props {
    title: string
    price: number
    currency?: string
    brand?: string
    condition?: string
    size?: string
    color?: string
    material?: string
    isSold?: boolean
  }

  let { 
    title, 
    price, 
    currency = 'EUR',
    brand,
    condition,
    size,
    color,
    material,
    isSold = false
  }: Props = $props()

  const conditionClass = $derived(() => {
    switch (condition?.toLowerCase()) {
      case 'new': return 'condition-new'
      case 'like new': return 'condition-like-new'  
      case 'good': return 'condition-good'
      case 'fair': return 'condition-fair'
      default: return 'condition-default'
    }
  })

  const formattedPrice = $derived(
    !price || price <= 0 
      ? '€0' 
      : new Intl.NumberFormat('bg-BG', {
          style: 'currency',
          currency: currency || 'EUR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }).format(price)
  );
</script>

<div class="product-info">
  <!-- Brand -->
  {#if brand}
    <div class="brand">
      {brand}
    </div>
  {/if}

  <!-- Title -->
  <h1 class="title">
    {title}
  </h1>

  <!-- Price -->
  <div class="price-section">
    {#if isSold}
      <div class="price-sold">
        <span class="price-crossed">{formattedPrice}</span>
        <div class="sold-label">
          SOLD OUT
        </div>
      </div>
    {:else}
      <div class="price">{formattedPrice}</div>
    {/if}
  </div>

  <!-- Attributes -->
  <div class="attributes">
    {#if condition}
      <span class="badge {conditionClass}">
        {condition}
      </span>
    {/if}
    
    {#if size}
      <span class="badge">
        Size {size}
      </span>
    {/if}
    
    {#if color}
      <span class="badge">
        {color}
      </span>
    {/if}
    
    {#if material}
      <span class="badge">
        {material}
      </span>
    {/if}
  </div>
</div>

<style>
  .product-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    background-color: var(--surface-base);
    padding: var(--space-6);
  }
  
  .brand {
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: var(--tracking-wider);
  }
  
  .title {
    font-size: var(--text-2xl);
    font-weight: var(--font-bold);
    line-height: var(--leading-tight);
    color: var(--text-primary);
    margin: 0;
  }
  
  .price-section {
    margin-bottom: var(--space-2);
  }

  .price {
    font-size: var(--text-4xl);
    font-weight: var(--font-bold);
    color: var(--text-primary);
  }
  
  .price-sold {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }
  
  .price-crossed {
    font-size: var(--text-3xl);
    font-weight: var(--font-bold);
    color: var(--text-disabled);
    text-decoration: line-through;
  }
  
  .sold-label {
    background-color: var(--status-error-bg);
    color: var(--status-error-text);
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    padding: var(--space-1-5) var(--space-3);
    border-radius: var(--radius-lg);
  }
  
  .attributes {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  
  .badge {
    display: inline-flex;
    align-items: center;
    min-height: var(--touch-compact);
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    border-radius: var(--radius-lg);
    background-color: var(--surface-muted);
    color: var(--text-secondary);
    border: 1px solid var(--border-default);
  }
  
  .condition-new {
    background-color: var(--status-success-bg);
    color: var(--status-success-text);
    border-color: var(--status-success-border);
  }
  
  .condition-like-new {
    background-color: var(--status-info-bg);
    color: var(--status-info-text);
    border-color: var(--status-info-border);
  }
  
  .condition-good {
    background-color: var(--status-warning-bg);
    color: var(--status-warning-text);
    border-color: var(--status-warning-border);
  }
  
  .condition-fair {
    background-color: var(--status-warning-bg);
    color: var(--status-warning-text);
    border-color: var(--status-warning-border);
  }
  
  .condition-default {
    background-color: var(--surface-muted);
    color: var(--text-secondary);
    border-color: var(--border-default);
  }
</style>