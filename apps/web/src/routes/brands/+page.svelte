<script lang="ts">
	import { Card } from '@repo/ui';
	import type { PageData } from './$types';

	export let data: PageData;
	
	let { brands = [] } = data;

	// Popular brand logos/colors (would be from DB in production)
	const brandStyles: Record<string, { color: string; emoji: string }> = {
		'Nike': { color: 'bg-black', emoji: '✔️' },
		'Adidas': { color: 'bg-gray-900', emoji: '⚡' },
		'Zara': { color: 'bg-gray-800', emoji: '👗' },
		'H&M': { color: 'bg-red-600', emoji: '🛍️' },
		'Uniqlo': { color: 'bg-red-500', emoji: '🎌' },
		'Gap': { color: 'bg-blue-800', emoji: '👕' },
		'Levi\'s': { color: 'bg-red-700', emoji: '👖' },
		'Puma': { color: 'bg-black', emoji: '🐾' },
		'Gucci': { color: 'bg-green-800', emoji: '💎' },
		'Balenciaga': { color: 'bg-black', emoji: '🖤' }
	};
</script>

<div class="min-h-screen bg-gray-50">
	<div class="container mx-auto px-4 py-8">
		<div class="mb-8">
			<h1 class="text-3xl font-bold mb-2">Popular Brands 🏷️</h1>
			<p class="text-gray-600">
				Explore clothing from your favorite brands
			</p>
		</div>

		{#if brands.length > 0}
			<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{#each brands as brand}
					{@const style = brandStyles[brand.name] || { color: 'bg-gray-600', emoji: '👔' }}
					<a href={`/search?brand=${encodeURIComponent(brand.name)}`} class="block">
						<Card>
							<div class="p-6 hover:bg-gray-50 transition">
								<div class={`w-16 h-16 ${style.color} rounded-lg flex items-center justify-center text-white text-2xl mb-4`}>
									{style.emoji}
								</div>
								<h3 class="font-semibold text-lg mb-1">{brand.name}</h3>
								<p class="text-sm text-gray-600">
									{brand.count || brand.products?.count || 0} items available
								</p>
							</div>
						</Card>
					</a>
				{/each}
			</div>

			{#if brands.length === 0}
				<div class="mt-8">
					<h2 class="text-xl font-semibold mb-4">All Brands</h2>
					<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						{#each Object.entries(brandStyles) as [name, style]}
							<a href={`/search?brand=${encodeURIComponent(name)}`} class="block">
								<Card>
									<div class="p-6 hover:bg-gray-50 transition">
										<div class={`w-16 h-16 ${style.color} rounded-lg flex items-center justify-center text-white text-2xl mb-4`}>
											{style.emoji}
										</div>
										<h3 class="font-semibold text-lg mb-1">{name}</h3>
										<p class="text-sm text-gray-600">
											Explore collection
										</p>
									</div>
								</Card>
							</a>
						{/each}
					</div>
				</div>
			{/if}
		{:else}
			<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{#each Object.entries(brandStyles) as [name, style]}
					<a href={`/search?brand=${encodeURIComponent(name)}`} class="block">
						<Card>
							<div class="p-6 hover:bg-gray-50 transition">
								<div class={`w-16 h-16 ${style.color} rounded-lg flex items-center justify-center text-white text-2xl mb-4`}>
									{style.emoji}
								</div>
								<h3 class="font-semibold text-lg mb-1">{name}</h3>
								<p class="text-sm text-gray-600">
									Explore collection
								</p>
							</div>
						</Card>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>