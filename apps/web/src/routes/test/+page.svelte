<script lang="ts">
  interface Props {
    data: {
      message: string;
      timestamp: string;
      error?: string;
    };
  }
  
  let { data }: Props = $props();
</script>

<div class="p-8">
  <h1 class="text-2xl">Test Page</h1>
  <p>Message: {data.message}</p>
  <p>Time: {data.timestamp}</p>
  {#if data.error}
    <p class="text-red-500">Error: {data.error}</p>
  {/if}
</div>