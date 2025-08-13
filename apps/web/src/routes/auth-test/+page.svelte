<script lang="ts">
  import { Button } from '@repo/ui';
  import type { PageData } from './$types';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
</script>

<div class="min-h-screen bg-gray-50 p-8">
  <div class="max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Authentication Status Test</h1>
    
    <div class="bg-white rounded-lg shadow p-6 mb-4">
      <h2 class="font-semibold mb-2">Session Status:</h2>
      {#if data.session}
        <div class="space-y-2">
          <p class="text-green-600 font-semibold">✅ Authenticated</p>
          <p class="text-sm">User ID: {data.session.user.id}</p>
          <p class="text-sm">Email: {data.session.user.email}</p>
          <p class="text-sm">Session expires: {new Date(data.session.expires_at || '').toLocaleString()}</p>
        </div>
      {:else}
        <p class="text-red-600 font-semibold">❌ Not authenticated</p>
      {/if}
    </div>
    
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="font-semibold mb-4">Test Actions:</h2>
      <div class="space-x-3">
        {#if data.session}
          <form method="POST" action="/logout" style="display: inline;">
            <Button type="submit">Sign Out</Button>
          </form>
          <a href="/sell">
            <Button variant="outline">Test Protected Route (Sell)</Button>
          </a>
        {:else}
          <a href="/login">
            <Button>Login</Button>
          </a>
          <a href="/signup">
            <Button variant="outline">Sign Up</Button>
          </a>
        {/if}
      </div>
    </div>
  </div>
</div>