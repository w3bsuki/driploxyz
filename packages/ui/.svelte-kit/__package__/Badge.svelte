<script lang="ts">
  import type { BadgeVariant, BadgeSize } from '../types.js';

  interface Props {
    variant?: BadgeVariant;
    size?: BadgeSize;
    class?: string;
    children?: import('svelte').Snippet;
  }

  let { 
    variant = 'primary', 
    size = 'md',
    class: className = '',
    children
  }: Props = $props();

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full border';

  const variantClasses = {
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    secondary: 'bg-gray-50 text-gray-700 border-gray-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  const classes = $derived(`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`);
</script>

<span class={classes}>
  {@render children?.()}
</span>