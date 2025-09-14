<script lang="ts">
  interface Props {
    size?: 'xs' | 'sm' | 'md' | 'lg';
    class?: string;
    tooltipText?: string;
    position?: 'static' | 'absolute';
  }

  let {
    size = 'sm',
    class: className = '',
    tooltipText = 'Pro Account - Verified seller with premium features',
    position = 'static'
  }: Props = $props();

  // Ultrathink: Perfect sizing system for mobile-first approach
  // xs: 12px icon (tiny badges), sm: 16px icon (product cards), md: 20px (profiles), lg: 24px (headers)
  const sizeClasses = {
    xs: 'w-3 h-3', // 12px - tiny checkmarks for seller cards
    sm: 'w-4 h-4', // 16px - perfect for product card corners
    md: 'w-5 h-5', // 20px - profile cards and larger contexts
    lg: 'w-6 h-6'  // 24px - headers and prominent display
  };

  const containerClasses = {
    xs: 'w-4 h-4', // 16px container for 12px icon (2px padding)
    sm: 'w-6 h-6', // 24px container for 16px icon (4px padding)
    md: 'w-7 h-7', // 28px container for 20px icon
    lg: 'w-8 h-8'  // 32px container for 24px icon
  };

  // Clean, professional pro badge styling
  // Using design system tokens for consistency
  const badgeClass = $derived(`
    ${position === 'absolute' ? 'absolute' : 'relative'}
    ${containerClasses[size]}
    bg-[color:var(--success-solid)]
    rounded-full
    flex items-center justify-center
    border-2 border-white
    shadow-sm
    ${className}
  `.trim().replace(/\s+/g, ' '));
</script>

<!-- Pro Badge with perfect checkmark icon -->
<div
  class={badgeClass}
  role="img"
  aria-label={tooltipText}
  title={tooltipText}
>
  <!-- Perfect checkmark SVG optimized for each size -->
  <svg
    class="{sizeClasses[size]} text-black"
    fill="currentColor"
    viewBox="0 0 20 20"
    aria-hidden="true"
  >
    <!-- Ultrathink: Optimized checkmark path for perfect pixel alignment -->
    <path
      fill-rule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clip-rule="evenodd"
    />
  </svg>
</div>