<script lang="ts">
  import BaseBadge from './components/ui/badge/badge.svelte';
  import type { BadgeVariant, BadgeSize } from '../types';

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

  // Map legacy @repo/ui Badge variants to tv-based badge variants
  const tvVariant = $derived(() => {
    switch (variant) {
      case 'primary':
        return 'default';
      case 'secondary':
        return 'secondary';
      case 'error':
        return 'destructive';
      // Variants without direct tv equivalents fall back to outline
      case 'success':
      case 'warning':
      case 'info':
      default:
        return 'outline';
    }
  });

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  } as const;

  // Provide color overrides for variants not covered by tv
  const colorOverrides = $derived(() => {
    switch (variant) {
      case 'success':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'info':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return '';
    }
  });

  const classes = $derived(`${sizeClasses[size]} ${colorOverrides} ${className}`);
</script>

<BaseBadge variant={tvVariant} class={classes} href={href}>
  {@render children?.()}
</BaseBadge>