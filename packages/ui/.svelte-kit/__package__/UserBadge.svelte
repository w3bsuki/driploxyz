<script lang="ts">
  interface Props {
    type: 'new_seller' | 'pro' | 'brand';
    size?: 'xs' | 'sm' | 'md' | 'lg';
    class?: string;
  }

  let { 
    type,
    size = 'md',
    class: className = ''
  }: Props = $props();

  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizeClasses = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  };

  const badgeConfig = {
    new_seller: {
      label: 'NEW',
      bgColor: 'bg-green-500',
      icon: '🌟'
    },
    pro: {
      label: 'PRO',
      bgColor: 'bg-amber-500',
      icon: '⭐'
    },
    brand: {
      label: 'BRAND',
      bgColor: 'bg-black',
      icon: '🏢'
    }
  };

  const config = $derived(badgeConfig[type]);
</script>

<div class="inline-flex items-center {config.bgColor} text-white font-semibold rounded-full shadow-sm {sizeClasses[size]} {className}">
  <span>{config.label}</span>
</div>