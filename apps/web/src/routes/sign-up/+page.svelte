<script lang="ts">
  import { SignUp } from 'clerk-sveltekit/client';
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50">
  <div class="w-full max-w-md">
    <h1 class="mb-8 text-center text-3xl font-bold">Create Your Driplo Account</h1>
    <SignUp routing="path" path="/sign-up" />
  </div>
</div>