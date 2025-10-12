<script lang="ts">
	import { Button } from '@repo/ui';
	
	let count = $state(0);
</script>

<h1>Docs</h1>
<p>This is the documentation app for the Driplo UI components.</p>

<div class="my-4">
	<Button onclick={() => count++}>
		Clicked {count} times
	</Button>
</div>

<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the SvelteKit documentation</p>
