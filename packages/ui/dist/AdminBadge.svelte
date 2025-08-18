<script lang="ts">
  interface Props {
    size?: 'xs' | 'sm' | 'md' | 'lg';
    class?: string;
  }

  let { 
    size = 'sm',
    class: className = ''
  }: Props = $props();

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };
</script>

<span class="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold {sizeClasses[size]} {className}">
  <span>👑</span>
  <span>Admin</span>
</span>