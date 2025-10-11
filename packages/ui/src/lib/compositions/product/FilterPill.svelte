<script lang="ts">
  interface Props {
    active?: boolean;
    onClick?: () => void;
    variant?: 'default' | 'category' | 'condition' | 'primary';
    children: any;
    class?: string;
  }

  let {
    active = false,
    onClick,
    variant = 'default',
    children,
    class: className = ''
  }: Props = $props();

  function getVariantClasses(variant: string, active: boolean): string {
    const baseClasses = 'shrink-0 px-3 py-2 min-h-[44px] rounded-full text-sm font-medium transition-all duration-200 cursor-pointer hover:scale-105 flex items-center gap-1.5 touch-manipulation';
    
    switch (variant) {
      case 'primary':
        return active
          ? `${baseClasses} bg-black text-white shadow-md`
          : `${baseClasses} bg-white text-gray-900 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 shadow-sm font-semibold`;
      
      case 'category':
        return active
          ? `${baseClasses} bg-black text-white shadow-sm`
          : `${baseClasses} bg-gray-100 text-gray-700 hover:bg-gray-200`;
      
      case 'condition':
        return active
          ? `${baseClasses} bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md`
          : `${baseClasses} bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50`;
      
      default:
        return active
          ? `${baseClasses} bg-blue-600 text-white shadow-sm`
          : `${baseClasses} bg-gray-100 text-gray-700 hover:bg-gray-200`;
    }
  }
</script>

<button
  onclick={onClick}
  class="{getVariantClasses(variant, active)} {className}"
  type="button"
>
  {@render children()}
</button>