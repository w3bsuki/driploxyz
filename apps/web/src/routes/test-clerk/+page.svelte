<script lang="ts">
  import { onMount } from 'svelte';
  import { useClerkContext } from 'clerk-sveltekit/client';
  import { createSupabaseClientWithClerk } from '$lib/supabase/clerk-client';
  
  const clerk = useClerkContext();
  
  let userInfo = $state<any>(null);
  let supabaseTest = $state<string>('');
  let loading = $state(true);
  
  onMount(async () => {
    // Wait for Clerk to load
    await clerk.load();
    
    if (clerk.user) {
      userInfo = {
        id: clerk.user.id,
        email: clerk.user.primaryEmailAddress?.emailAddress,
        name: clerk.user.fullName
      };
      
      // Test Supabase connection with Clerk token
      try {
        const supabase = createSupabaseClientWithClerk(
          async () => await clerk.session?.getToken() || null
        );
        
        // Try a simple query to test the connection
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(1);
        
        if (error) {
          supabaseTest = `Supabase Error: ${error.message}`;
        } else {
          supabaseTest = 'Supabase connection successful! ✅';
        }
      } catch (err) {
        supabaseTest = `Error: ${err}`;
      }
    }
    
    loading = false;
  });
</script>

<div class="container mx-auto p-8">
  <h1 class="text-3xl font-bold mb-8">Clerk + Supabase Integration Test</h1>
  
  {#if loading}
    <p>Loading...</p>
  {:else if userInfo}
    <div class="space-y-4">
      <div class="bg-green-100 p-4 rounded">
        <h2 class="text-xl font-semibold mb-2">Clerk Authentication ✅</h2>
        <p>User ID: {userInfo.id}</p>
        <p>Email: {userInfo.email}</p>
        <p>Name: {userInfo.name || 'Not set'}</p>
      </div>
      
      <div class="bg-blue-100 p-4 rounded">
        <h2 class="text-xl font-semibold mb-2">Supabase Connection Test</h2>
        <p>{supabaseTest || 'Testing...'}</p>
      </div>
      
      <div class="flex gap-4">
        <a href="/dashboard" class="btn btn-primary">Go to Dashboard</a>
        <button onclick={() => clerk.signOut()} class="btn btn-secondary">
          Sign Out
        </button>
      </div>
    </div>
  {:else}
    <div class="bg-yellow-100 p-4 rounded">
      <p>Not authenticated. Please sign in to test the integration.</p>
      <div class="flex gap-4 mt-4">
        <a href="/sign-in" class="btn btn-primary">Sign In</a>
        <a href="/sign-up" class="btn btn-secondary">Sign Up</a>
      </div>
    </div>
  {/if}
</div>