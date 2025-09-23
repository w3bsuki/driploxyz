<script lang="ts">
  import { Button } from '@repo/ui';
  import { goto } from '$app/navigation';

  let countdown = $state(3);

  // Auto-redirect after 3 seconds
  $effect(() => {
    const timer = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(timer);
        goto('/onboarding');
      }
    }, 1000);

    return () => clearInterval(timer);
  });
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
  <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
    <!-- Success Icon -->
    <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
    </div>
    
    <h1 class="text-2xl font-bold text-gray-900 mb-2">
      Email Verified Successfully!
    </h1>
    
    <p class="text-gray-600 mb-6">
      Your email has been verified. Let's set up your profile.
    </p>
    
    <div class="space-y-4">
      <Button
        onclick={() => goto('/onboarding')}
        class="w-full bg-black text-white hover:bg-gray-800"
      >
        Continue to Profile Setup
      </Button>
      
      <p class="text-sm text-gray-500">
        Redirecting in {countdown} seconds...
      </p>
    </div>
  </div>
</div>