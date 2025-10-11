<script lang="ts">
  import type { BadgeVariant, BadgeSize } from '../../types';

  interface Props {
    variant?: BadgeVariant;
    size?: BadgeSize;
    class?: string;
    children?: import('svelte').Snippet;
    href?: string;
  }

  let {
    variant = 'primary',
    size = 'md',
    class: className = '',
    children,
    href
  }: Props = $props();

  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

  const variantClasses = {
    primary: 'bg-[color:var(--primary)] text-[color:var(--primary-fg)] hover:bg-[color:var(--primary)]/90',
    secondary: 'bg-[color:var(--secondary)] text-[color:var(--secondary-fg)] hover:bg-[color:var(--secondary)]/90',
    error: 'bg-[color:var(--destructive)] text-[color:var(--destructive-fg)] hover:bg-[color:var(--destructive)]/90',
    success: 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200',
    info: 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200',
    outline: 'border border-[color:var(--border)] text-[color:var(--foreground)] hover:bg-[color:var(--accent)] hover:text-[color:var(--accent-fg)]'
  } as const;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  } as const;

  const classes = $derived(`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`);
</script>

<svelte:element
  this={href ? 'a' : 'span'}
  {href}
  class={classes}
>
  {@render children?.()}
</svelte:element>