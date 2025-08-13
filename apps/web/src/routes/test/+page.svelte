<script lang="ts">
  import { Button } from '@repo/ui';
  import { createClient } from '$lib/supabase/client';
  const supabase = createClient();
  
  let status = $state('Click a button to test');
  let categories = $state<any[]>([]);
  
  async function testConnection() {
    status = 'Testing connection...';
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .limit(5);
    
    if (error) {
      status = `Error: ${error.message}`;
    } else {
      categories = data || [];
      status = `Success! Found ${data?.length} categories`;
    }
  }
  
  async function testSignup() {
    status = 'Testing signup...';
    const email = `test${Date.now()}@example.com`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password: 'TestPassword123!',
      options: {
        data: {
          username: `testuser${Date.now()}`,
          full_name: 'Test User'
        }
      }
    });
    
    if (error) {
      status = `Signup error: ${error.message}`;
    } else {
      status = `Signup success! User ID: ${data.user?.id}`;
    }
  }
</script>

<div class="min-h-screen bg-gray-50 p-8">
  <div class="max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Supabase Connection Test</h1>
    
    <div class="bg-white rounded-lg shadow p-6 mb-4">
      <div class="mb-4">
        <p class="text-sm text-gray-600">Status:</p>
        <p class="font-mono text-sm">{status}</p>
      </div>
      
      <div class="space-x-3">
        <Button onclick={testConnection}>Test Database Connection</Button>
        <Button onclick={testSignup} variant="outline">Test Signup</Button>
      </div>
    </div>
    
    {#if categories.length > 0}
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="font-semibold mb-2">Categories Found:</h2>
        <ul class="list-disc list-inside">
          {#each categories as cat}
            <li>{cat.name} (ID: {cat.id})</li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>
</div>