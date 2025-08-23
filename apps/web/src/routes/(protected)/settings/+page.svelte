<script lang="ts">
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-2xl font-bold mb-6">Settings</h1>
  
  <div class="space-y-6">
    <div class="border rounded-lg p-4">
      <h2 class="text-xl font-semibold mb-4">Account Settings</h2>
      <div class="space-y-4">
        <button 
          onclick={() => goto('/profile/edit')}
          class="w-full text-left px-4 py-2 hover:bg-gray-50 rounded"
        >
          Edit Profile
        </button>
        <button 
          onclick={() => goto('/dashboard/upgrade')}
          class="w-full text-left px-4 py-2 hover:bg-gray-50 rounded"
        >
          Subscription
        </button>
      </div>
    </div>
    
    <div class="border rounded-lg p-4">
      <h2 class="text-xl font-semibold mb-4">Privacy & Security</h2>
      <div class="space-y-4">
        <button class="w-full text-left px-4 py-2 hover:bg-gray-50 rounded">
          Privacy Settings
        </button>
        <button class="w-full text-left px-4 py-2 hover:bg-gray-50 rounded">
          Security
        </button>
      </div>
    </div>
  </div>
</div>