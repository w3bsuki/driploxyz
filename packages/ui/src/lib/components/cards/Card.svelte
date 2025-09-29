<script lang="ts">
  type CardVariant = 'default' | 'elevated' | 'outlined' | 'ghost';
  type CardPadding = 'none' | 'sm' | 'md' | 'lg';

  interface Props {
    class?: string;
    variant?: CardVariant;
    padding?: CardPadding;
    interactive?: boolean;
    role?: string;
    onclick?: () => void;
    children?: import('svelte').Snippet;
  }

  let {
    class: className = '',
    variant: variantProp = 'default',
    padding = 'md',
    interactive = false,
    role,
    onclick,
    children
  }: Props = $props();

  const variantClasses: Record<CardVariant, string> = {
    default:
      'bg-[color:var(--card-bg)] border border-[color:var(--card-border)] shadow-[var(--card-shadow)]',
    elevated:
      'bg-[color:var(--card-bg)] border border-transparent shadow-[var(--shadow-lg)]',
    outlined:
      'bg-[color:var(--surface-base)] border border-[color:var(--border-default)] shadow-none',
    ghost:
      'bg-transparent border border-transparent shadow-none'
  };

  const paddingScale: Record<CardPadding, string> = {
    none: 'p-0',
    sm: 'p-[length:var(--card-padding-sm)]',
    md: 'p-[length:var(--card-padding-md)]',
    lg: 'p-[length:var(--card-padding-lg)]'
  };

  const interactiveClasses = $derived(
    interactive
      ? 'transition-shadow duration-[var(--duration-base)] hover:shadow-[var(--shadow-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface-base)] cursor-pointer'
      : ''
  );

  const paddingClasses = $derived(paddingScale[padding]);
  const classes = $derived(
    `rounded-[length:var(--card-radius)] ${variantClasses[variantProp]} ${paddingClasses} ${interactiveClasses} ${className}`.trim()
  );

  const computedRole = $derived(role ?? (interactive && !onclick ? 'button' : undefined));

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      (event.currentTarget as HTMLElement).click();
    }
  }
</script>

<svelte:element
  this={onclick ? 'button' : 'div'}
  type={onclick ? 'button' : undefined}
  class={classes}
  {onclick}
  role={onclick ? undefined : computedRole}
  tabindex={computedRole === 'button' && !onclick ? 0 : undefined}
  onkeydown={computedRole === 'button' ? handleKeydown : undefined}
>
  {@render children?.()}
</svelte:element>