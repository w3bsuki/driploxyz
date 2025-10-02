<script lang="ts">
  import { toasts, toastHelpers, toastsStore } from './store';
  import { onMount } from 'svelte';

  let toastCount = 0;
  let unsubscribe: () => void;

  onMount(() => {
    // Subscribe to the reactive toasts store
    unsubscribe = toastsStore.subscribe((toasts) => {
      toastCount = toasts.length;
      console.log('Active toasts:', toasts);
    });

    return () => {
      unsubscribe();
    };
  });

  function showSuccess() {
    toasts.success('Operation completed successfully!');
  }

  function showError() {
    toasts.error('Something went wrong. Please try again.');
  }

  function showWarning() {
    toasts.warning('Please review your input before proceeding.');
  }

  function showInfo() {
    toasts.info('Here is some useful information for you.');
  }

  function showLoading() {
    toastHelpers.loading('Processing your request...');
  }

  function showActionToast() {
    toastHelpers.withAction(
      'Do you want to save your changes?',
      'warning',
      'Save',
      () => console.log('Changes saved!'),
      { duration: 10000 }
    );
  }

  async function showPromiseToast() {
    try {
      await toastHelpers.promise(
        new Promise(resolve => setTimeout(() => resolve('Data loaded'), 2000)),
        {
          loading: 'Loading data...',
          success: (data) => `Success! ${data}`,
          error: 'Failed to load data'
        }
      );
    } catch (error) {
      console.error('Promise failed:', error);
    }
  }

  function dismissAll() {
    toasts.dismissAll();
  }
</script>

<div class="p-6 max-w-md mx-auto">
  <h1 class="text-2xl font-bold mb-4">Toast Store Demo</h1>

  <div class="mb-4 p-4 bg-gray-100 rounded">
    <p class="text-sm">Active toasts: <span class="font-bold">{toastCount}</span></p>
  </div>

  <div class="grid grid-cols-2 gap-3">
    <button
      onclick={showSuccess}
      class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
    >
      Success
    </button>

    <button
      onclick={showError}
      class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
    >
      Error
    </button>

    <button
      onclick={showWarning}
      class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
    >
      Warning
    </button>

    <button
      onclick={showInfo}
      class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Info
    </button>

    <button
      onclick={showLoading}
      class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
    >
      Loading
    </button>

    <button
      onclick={showActionToast}
      class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
    >
      With Action
    </button>

    <button
      onclick={showPromiseToast}
      class="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 col-span-2"
    >
      Promise Toast
    </button>

    <button
      onclick={dismissAll}
      class="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 col-span-2"
    >
      Dismiss All
    </button>
  </div>
</div>