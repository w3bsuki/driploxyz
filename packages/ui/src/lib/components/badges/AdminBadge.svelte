<script lang="ts">
  interface Props {
    size?: 'xs' | 'sm' | 'md' | 'lg';
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
    text?: string;
    class?: string;
  }

  let { 
    size = 'md',
    variant = 'primary',
    text = 'Admin',
    class: className = ''
  }: Props = $props();

  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const variantClasses = {
    primary: 'bg-blue-100 text-[color:var(--status-info-text)] border-blue-200',
    secondary: 'bg-gray-100 text-[color:var(--text-secondary)] border-gray-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    danger: 'bg-red-100 text-red-800 border-red-200'
  };

  const classes = $derived(`inline-flex items-center font-medium rounded-full border ${sizeClasses[size]} ${variantClasses[variant]} ${className}`);
</script>

<span class={classes}>
  {text}
</span>