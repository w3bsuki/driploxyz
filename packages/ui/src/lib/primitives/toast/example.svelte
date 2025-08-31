<!--
  Toast System Usage Example
  Demonstrates modern Svelte 5 toast patterns
-->
<script lang="ts">
  import { modernToasts, toastPatterns, toastHelpers } from './index';
  import type { ToastType } from './types';
  
  // Basic toast demonstrations
  function showBasicToast(type: ToastType) {
    const messages = {
      success: 'Operation completed successfully!',
      error: 'Something went wrong. Please try again.',
      warning: 'Please review your input before continuing.',
      info: 'You have a new notification.'
    };
    
    modernToasts[type](messages[type]);
  }
  
  // Advanced patterns
  function showPatternToasts() {
    // Form feedback
    toastPatterns.formSuccess('Profile updated successfully');
    
    // Network error with retry
    toastPatterns.networkError('save your changes');
    
    // Copy feedback
    toastPatterns.copied('Link');
    
    // Authentication feedback
    toastPatterns.loginSuccess('John');
  }
  
  // Toast with action
  function showToastWithAction() {
    modernToasts.error('Failed to upload image', {
      action: {
        label: 'Retry',
        onclick: () => {
          console.log('Retrying upload...');
          modernToasts.info('Retrying upload...');
        },
        variant: 'secondary'
      }
    });
  }
  
  // Promise-based toast
  async function showPromiseToast() {
    const fakeApiCall = new Promise<{ data: string }>((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.5 
          ? resolve({ data: 'Success data' })
          : reject(new Error('Network error'));
      }, 2000);
    });
    
    await toastHelpers.promise(fakeApiCall, {
      loading: 'Fetching data...',
      success: (data) => `Loaded: ${data.data}`,
      error: (error) => `Failed: ${error.message}`
    });
  }
  
  // Persistent toast
  function showPersistentToast() {
    modernToasts.warning('This toast will stay until manually dismissed', {
      persistent: true
    });
  }
  
  // Custom duration
  function showCustomDuration() {
    modernToasts.success('This toast lasts 10 seconds', {
      duration: 10000
    });
  }
</script>

<div class="p-6 max-w-2xl mx-auto space-y-6">
  <h1 class="text-2xl font-bold text-[color:var(--fg)]">Toast System Demo</h1>
  
  <!-- Basic Toasts -->
  <section class="space-y-4">
    <h2 class="text-lg font-semibold text-[color:var(--fg)]">Basic Toasts</h2>
    <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <button 
        onclick={() => showBasicToast('success')}
        class="btn btn-primary btn-sm"
      >
        Success
      </button>
      <button 
        onclick={() => showBasicToast('error')}
        class="btn btn-primary btn-sm"
      >
        Error
      </button>
      <button 
        onclick={() => showBasicToast('warning')}
        class="btn btn-primary btn-sm"
      >
        Warning
      </button>
      <button 
        onclick={() => showBasicToast('info')}
        class="btn btn-primary btn-sm"
      >
        Info
      </button>
    </div>
  </section>
  
  <!-- Pattern Toasts -->
  <section class="space-y-4">
    <h2 class="text-lg font-semibold text-[color:var(--fg)]">Pattern Toasts</h2>
    <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <button 
        onclick={showPatternToasts}
        class="btn btn-secondary btn-sm"
      >
        Show Patterns
      </button>
      <button 
        onclick={showToastWithAction}
        class="btn btn-secondary btn-sm"
      >
        With Action
      </button>
    </div>
  </section>
  
  <!-- Advanced Features -->
  <section class="space-y-4">
    <h2 class="text-lg font-semibold text-[color:var(--fg)]">Advanced Features</h2>
    <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
      <button 
        onclick={showPromiseToast}
        class="btn btn-ghost btn-sm"
      >
        Promise Toast
      </button>
      <button 
        onclick={showPersistentToast}
        class="btn btn-ghost btn-sm"
      >
        Persistent
      </button>
      <button 
        onclick={showCustomDuration}
        class="btn btn-ghost btn-sm"
      >
        Custom Duration
      </button>
    </div>
  </section>
  
  <!-- Clear All -->
  <section class="space-y-4">
    <h2 class="text-lg font-semibold text-[color:var(--fg)]">Toast Management</h2>
    <button 
      onclick={() => modernToasts.dismissAll()}
      class="btn btn-ghost btn-sm"
    >
      Dismiss All Toasts
    </button>
  </section>
  
  <!-- Migration Examples -->
  <section class="space-y-4">
    <h2 class="text-lg font-semibold text-[color:var(--fg)]">Migration Examples</h2>
    <div class="space-y-2 text-sm">
      <div class="p-3 bg-[color:var(--gray-50)] rounded-lg">
        <p class="text-[color:var(--fg-muted)]">Legacy:</p>
        <code>toasts.success('Message');</code>
      </div>
      <div class="p-3 bg-[color:var(--gray-50)] rounded-lg">
        <p class="text-[color:var(--fg-muted)]">Modern:</p>
        <code>modernToasts.success('Message');</code>
      </div>
    </div>
  </section>
</div>

<style>
  /* Demo-specific styles */
  .btn {
    transition: all 0.15s ease;
  }
  
  .btn:hover {
    transform: translateY(-1px);
  }
  
  .btn:active {
    transform: translateY(0);
  }
  
  code {
    @apply bg-[color:var(--gray-100)] px-2 py-1 rounded text-sm font-mono;
  }
</style>