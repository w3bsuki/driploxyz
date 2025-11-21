<script lang="ts">
  interface Props {
    type?: 'network' | 'notFound' | 'server' | 'permission' | 'generic';
    title?: string;
    message?: string;
    action?: {
      label: string;
      handler: () => void;
    };
    icon?: string;
    class?: string;
  }

  let {
    type = 'generic',
    title,
    message,
    action,
    icon,
    class: className = ''
  }: Props = $props();

  const defaultContent = {
    network: {
      title: 'Connection Error',
      message: 'Please check your internet connection and try again.',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
    },
    notFound: {
      title: 'Page Not Found',
      message: 'The page you\'re looking for doesn\'t exist or has been moved.',
      icon: 'M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.5a3 3 0 11-6 0 3 3 0 016 0z'
    },
    server: {
      title: 'Server Error',
      message: 'Something went wrong on our end. Please try again later.',
      icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    permission: {
      title: 'Access Denied',
      message: 'You don\'t have permission to access this resource.',
      icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
    },
    generic: {
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred. Please try again.',
      icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    }
  };

  const content = defaultContent[type] || defaultContent.generic;
  const displayTitle = title || content.title;
  const displayMessage = message || content.message;
  const displayIcon = icon || content.icon;
</script>

<div class="flex flex-col items-center justify-center text-center py-12 px-4 {className}">
  <div class="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-50 text-red-600">
    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{displayIcon}" />
    </svg>
  </div>
  
  <h2 class="text-xl font-semibold text-gray-900 mb-2">{displayTitle}</h2>
  <p class="text-gray-600 mb-6 max-w-md">{displayMessage}</p>
  
  {#if action}
    <button
      onclick={action.handler}
      class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-[var(--btn-primary-text)] bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--state-focus)] transition-colors"
    >
      {action.label}
    </button>
  {/if}
</div>

<style>
  /* Ensure proper contrast and accessibility */
  .bg-red-50 {
    background-color: oklch(0.97 0.02 0);
  }
  
  .text-red-600 {
    color: oklch(0.58 0.14 0);
  }
  
  .text-gray-900 {
    color: oklch(0.15 0.015 270);
  }
  
  .text-gray-600 {
    color: oklch(0.5 0.025 270);
  }
  
  :global(.bg-\[var\(--brand-primary-strong\)\]) {
    background-color: oklch(0.52 0.15 240);
  }
  
  :global(.bg-\[var\(--brand-primary-strong\)\]:hover) {
    background-color: oklch(0.42 0.18 240);
  }
  
  :global(.focus\:ring-\[var\(--state-focus\)\]:focus) {
    --tw-ring-color: oklch(0.62 0.12 240);
  }
</style>