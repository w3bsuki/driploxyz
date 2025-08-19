<script lang="ts">
  interface Props {
    class?: string;
    padding?: boolean;
    hover?: boolean;
    onclick?: () => void;
    children?: import('svelte').Snippet;
  }

  let { 
    class: className = '',
    padding = true,
    hover = false,
    onclick,
    children
  }: Props = $props();

  const baseClasses = 'bg-white rounded-lg shadow-sm transition-all duration-300 ease-out';
  const paddingClasses = $derived(padding ? 'p-6' : '');
  const hoverClasses = $derived(hover ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] touch-manipulation will-change-transform' : '');
  const classes = $derived(`${baseClasses} ${paddingClasses} ${hoverClasses} ${className}`);
</script>

<div 
  class={classes} 
  {onclick}
  role={onclick ? "button" : undefined}
  tabindex={onclick ? 0 : undefined}
  onkeydown={(e) => {
    if (onclick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onclick();
    }
  }}
>
  {@render children?.()}
</div>