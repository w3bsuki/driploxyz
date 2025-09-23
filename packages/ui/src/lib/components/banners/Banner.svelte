<script lang="ts">
  interface Props {
    variant?: 'info' | 'success' | 'warning' | 'danger';
    title?: string;
    class?: string;
    children?: import('svelte').Snippet;
  }
  
  let { 
    variant = 'info',
    title,
    class: className = '',
    children
  }: Props = $props();
  
  const variantClass = variant ? `banner-${variant}` : '';
</script>

<div class="banner {variantClass} {className}">
  <div class="flex-1">
    {#if title}
      <div class="banner-title">{title}</div>
    {/if}
    <div class="banner-body">
      {@render children?.()}
    </div>
  </div>
</div>