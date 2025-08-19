<script lang="ts">
  import { SignIn } from 'clerk-sveltekit/client';
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50">
  <div class="w-full max-w-md">
    <h1 class="mb-8 text-center text-3xl font-bold">Sign In to Driplo</h1>
    <SignIn routing="path" path="/sign-in" />
  </div>
</div>