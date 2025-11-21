<script lang="ts">
  import { tooltip_brand_account } from '@repo/i18n';

  interface Props {
    size?: 'xs' | 's' | 'sm' | 'md' | 'lg';
    class?: string;
    tooltipText?: string;
    position?: 'static' | 'absolute';
    variant?: 'black' | 'gold';
  }

  let {
    size = 'sm',
    class: className = '',
  tooltipText = tooltip_brand_account(),
    position = 'static',
    variant = 'black'
  }: Props = $props();

  // Ultrathink: Consistent sizing with ProBadge for perfect alignment
  const sizeClasses = {
    xs: 'w-3 h-3', // 12px - tiny stars for seller cards
    s: 'w-3.5 h-3.5', // 14px - perfect middle size for seller cards
    sm: 'w-4 h-4', // 16px - perfect for product card corners
    md: 'w-5 h-5', // 20px - profile cards and larger contexts
    lg: 'w-6 h-6'  // 24px - headers and prominent display
  };

  const containerClasses = {
    xs: 'w-4 h-4', // 16px container for 12px icon (2px padding)
    s: 'w-5 h-5', // 20px container for 14px icon (3px padding)
    sm: 'w-6 h-6', // 24px container for 16px icon (4px padding)
    md: 'w-7 h-7', // 28px container for 20px icon
    lg: 'w-8 h-8'  // 32px container for 24px icon
  };

  // Brand badge variants for different contexts
  const variantClasses = {
    black: 'bg-gray-900 text-[var(--text-inverse)]',
    gold: 'bg-yellow-500 text-gray-900'
  };

  // Clean brand badge styling with variant support
  const badgeClass = $derived(`
    ${position === 'absolute' ? 'absolute' : 'relative'}
    ${containerClasses[size]}
    ${variantClasses[variant]}
    rounded-full
    flex items-center justify-center
    border-2 border-white
    shadow-sm
    ${className}
  `.trim().replace(/\s+/g, ' '));
</script>

<!-- Brand Badge with perfect star icon -->
<div
  class={badgeClass}
  role="img"
  aria-label={tooltipText}
  title={tooltipText}
>
  <!-- Perfect star SVG optimized for each size -->
  <svg
    class="{sizeClasses[size]}"
    fill="currentColor"
    viewBox="0 0 20 20"
    aria-hidden="true"
  >
    <!-- Ultrathink: Optimized 5-point star path for perfect pixel alignment -->
    <path
      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
    />
  </svg>
</div>