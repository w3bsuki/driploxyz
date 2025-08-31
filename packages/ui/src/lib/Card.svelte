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

  const baseClasses = 'bg-[var(--card-bg)] rounded-[var(--card-radius)] shadow-[var(--card-shadow)] border border-[var(--card-border)]';
  const paddingClasses = $derived(padding ? 'p-[var(--card-padding-md)]' : '');
  const hoverClasses = $derived(hover ? 'cursor-pointer hover:shadow-[var(--shadow-md)] transition-shadow duration-[var(--duration-base)]' : '');
  const classes = $derived(`${baseClasses} ${paddingClasses} ${hoverClasses} ${className}`);
</script>

<div 
  class={classes} 
  {onclick}
  role={onclick ? "button" : undefined}
  tabindex={onclick ? 0 : undefined}
  onkeydown={(e: KeyboardEvent) => {
    if (onclick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onclick();
    }
  }}
>
  {@render children?.()}
</div>