<script lang="ts">
	import { page } from '$app/state';
	import { SEOMetaTags } from '@repo/ui';
    

	const pageTitle = 'Driplo Blog - Fashion Tips, Sustainability & Community Stories';
	const pageDescription = 'Discover the latest fashion trends, sustainable living tips, and community stories from Driplo. Learn about second-hand fashion and circular economy.';
</script>

<!-- SEO Meta Tags -->
<SEOMetaTags
	title={pageTitle}
	description={pageDescription}
	url={page.url.pathname}
	type="website"
	canonical={`https://driplo.xyz${page.url.pathname}`}
/>

<!-- Hero Section -->
<section class="bg-zinc-50 py-16 px-4">
	<div class="max-w-4xl mx-auto text-center">
		<h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
			The <span class="text-zinc-900">Driplo</span> Blog
		</h1>
		<p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
			Discover fashion insights, sustainable living tips, and stories from our community.
			Your guide to looking good while doing good.
		</p>
		<div class="flex flex-wrap gap-3 justify-center">
			<span class="px-4 py-2 bg-zinc-100 text-zinc-900 rounded-full text-sm font-medium">Sustainable Fashion</span>
			<span class="px-4 py-2 bg-zinc-100 text-zinc-900 rounded-full text-sm font-medium">Style Tips</span>
			<span class="px-4 py-2 bg-[var(--surface-brand-strong)]/10 text-[color-mix(in_oklch,var(--brand-primary-strong)_90%,black_10%)] rounded-full text-sm font-medium">Community</span>
			<span class="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">Circular Economy</span>
		</div>
	</div>
</section>

<!-- Featured Article -->
<section class="py-16 px-4">
	<div class="max-w-6xl mx-auto">
		<h2 class="text-3xl font-bold text-gray-900 mb-8">Featured Story</h2>
		<div class="bg-zinc-100 rounded-2xl overflow-hidden">
			<div class="md:flex">
				<div class="md:w-1/2">
					<div class="h-64 md:h-full bg-zinc-800 flex items-center justify-center">
						<div class="text-white text-center p-8">
							<span class="text-6xl mb-4 block">🌱</span>
							<span class="text-xl font-medium">Featured Article</span>
						</div>
					</div>
				</div>
				<div class="md:w-1/2 p-8">
					<div class="mb-4">
						<span class="px-3 py-1 bg-zinc-900 text-white text-xs font-medium rounded-full">Sustainability</span>
					</div>
					<h3 class="text-2xl font-bold text-gray-900 mb-4">
						The Future of Fashion: Why Second-Hand is the New Luxury
					</h3>
					<p class="text-gray-600 mb-6">
						Discover how the fashion industry is shifting towards sustainability and why pre-loved clothing is becoming the new status symbol for conscious consumers.
					</p>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 bg-zinc-300 rounded-full"></div>
							<div>
								<p class="text-sm font-medium text-gray-900">Driplo Team</p>
								<p class="text-xs text-gray-500">5 min read</p>
							</div>
						</div>
						<a href="/blog/future-of-fashion" class="text-zinc-900 font-medium hover:text-zinc-700">
							Read More →
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Recent Articles Section -->
<section class="py-16 px-4 bg-gray-50">
	<div class="max-w-6xl mx-auto">
		<h2 class="text-3xl font-bold text-gray-900 mb-8">Recent Articles</h2>
		<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
			<article class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
				<div class="h-48 bg-zinc-200 flex items-center justify-center">
					<span class="text-5xl">👗</span>
				</div>
				<div class="p-6">
					<div class="mb-3">
						<span class="px-2 py-1 bg-[var(--surface-brand-strong)]/10 text-[color-mix(in_oklch,var(--brand-primary-strong)_90%,black_10%)] text-xs font-medium rounded">Style Guide</span>
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">
						How to Style Vintage Finds for Modern Looks
					</h3>
					<p class="text-gray-600 text-sm mb-4">
						Learn how to incorporate vintage pieces into your contemporary wardrobe for unique, sustainable style.
					</p>
					<div class="flex items-center justify-between text-xs text-gray-500">
						<span>Driplo Team</span>
						<span>3 min read</span>
					</div>
				</div>
			</article>

			<article class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
				<div class="h-48 bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center">
					<span class="text-5xl">🌍</span>
				</div>
				<div class="p-6">
					<div class="mb-3">
						<span class="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Sustainability</span>
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">
						Circular Fashion: Closing the Loop on Clothing Waste
					</h3>
					<p class="text-gray-600 text-sm mb-4">
						Understanding how circular economy principles are revolutionizing the fashion industry.
					</p>
					<div class="flex items-center justify-between text-xs text-gray-500">
						<span>Driplo Team</span>
						<span>4 min read</span>
					</div>
				</div>
			</article>

			<article class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
				<div class="h-48 bg-zinc-300 flex items-center justify-center">
					<span class="text-5xl">💰</span>
				</div>
				<div class="p-6">
					<div class="mb-3">
						<span class="px-2 py-1 bg-zinc-100 text-zinc-900 text-xs font-medium rounded">Selling Tips</span>
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">
						5 Common Mistakes to Avoid When Selling Clothes Online
					</h3>
					<p class="text-gray-600 text-sm mb-4">
						Maximize your sales potential with these expert tips from our most successful sellers.
					</p>
					<div class="flex items-center justify-between text-xs text-gray-500">
						<span>Driplo Team</span>
						<span>5 min read</span>
					</div>
				</div>
			</article>

			<article class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
				<div class="h-48 bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center">
					<span class="text-5xl">🔥</span>
				</div>
				<div class="p-6">
					<div class="mb-3">
						<span class="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">Trends</span>
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">
						Hottest Second-Hand Trends in Bulgaria & UK
					</h3>
					<p class="text-gray-600 text-sm mb-4">
						Discover what's trending in the pre-loved fashion scene across our markets.
					</p>
					<div class="flex items-center justify-between text-xs text-gray-500">
						<span>Driplo Team</span>
						<span>3 min read</span>
					</div>
				</div>
			</article>

			<article class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
				<div class="h-48 bg-gradient-to-br from-teal-400 to-green-400 flex items-center justify-center">
					<span class="text-5xl">📸</span>
				</div>
				<div class="p-6">
					<div class="mb-3">
						<span class="px-2 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded">Photography</span>
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">
						How to Take Perfect Photos of Your Clothes
					</h3>
					<p class="text-gray-600 text-sm mb-4">
						Professional photography tips that will make your listings stand out and sell faster.
					</p>
					<div class="flex items-center justify-between text-xs text-gray-500">
						<span>Driplo Team</span>
						<span>4 min read</span>
					</div>
				</div>
			</article>

			<article class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
				<div class="h-48 bg-zinc-200 flex items-center justify-center">
					<span class="text-5xl">🏆</span>
				</div>
				<div class="p-6">
					<div class="mb-3">
						<span class="px-2 py-1 bg-zinc-100 text-zinc-700 text-xs font-medium rounded">Success Stories</span>
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">
						Seller Spotlight: How Maria Built a Business on Driplo
					</h3>
					<p class="text-gray-600 text-sm mb-4">
						Meet one of our top sellers and learn her secrets to success in the second-hand market.
					</p>
					<div class="flex items-center justify-between text-xs text-gray-500">
						<span>Driplo Team</span>
						<span>6 min read</span>
					</div>
				</div>
			</article>
		</div>
	</div>
</section>

<!-- Categories Section -->
<section class="py-16 px-4">
	<div class="max-w-6xl mx-auto">
		<h2 class="text-3xl font-bold text-gray-900 mb-8">Explore Topics</h2>
		<div class="grid md:grid-cols-4 gap-6">
			<div class="bg-zinc-50 p-6 rounded-xl text-center">
				<span class="text-4xl mb-3 block">👗</span>
				<h3 class="font-semibold text-gray-900 mb-2">Style & Fashion</h3>
				<p class="text-gray-600 text-sm mb-4">Latest trends, styling tips, and fashion inspiration</p>
				<span class="text-zinc-600 text-sm font-medium">12 articles</span>
			</div>
			<div class="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl text-center">
				<span class="text-4xl mb-3 block">🌱</span>
				<h3 class="font-semibold text-gray-900 mb-2">Sustainability</h3>
				<p class="text-gray-600 text-sm mb-4">Circular fashion and eco-friendly lifestyle tips</p>
				<span class="text-green-600 text-sm font-medium">8 articles</span>
			</div>
			<div class="bg-zinc-50 p-6 rounded-xl text-center">
				<span class="text-4xl mb-3 block">💰</span>
				<h3 class="font-semibold text-gray-900 mb-2">Selling Guide</h3>
				<p class="text-gray-600 text-sm mb-4">Tips and tricks for successful selling on Driplo</p>
				<span class="text-zinc-600 text-sm font-medium">15 articles</span>
			</div>
			<div class="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl text-center">
				<span class="text-4xl mb-3 block">🏆</span>
				<h3 class="font-semibold text-gray-900 mb-2">Community</h3>
				<p class="text-gray-600 text-sm mb-4">Success stories and seller spotlights</p>
				<span class="text-orange-600 text-sm font-medium">6 articles</span>
			</div>
		</div>
	</div>
</section>

<!-- Newsletter Section -->
<section class="py-16 px-4 bg-zinc-900">
	<div class="max-w-4xl mx-auto text-center">
		<h2 class="text-3xl font-bold text-white mb-6">Stay in the Loop</h2>
		<p class="text-xl text-zinc-300 mb-8">
			Get our latest articles, fashion tips, and exclusive insights delivered to your inbox.
		</p>
		<form class="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
			<input
				type="email"
				placeholder="Enter your email"
				class="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
				required
			/>
			<button
				type="submit"
				class="px-6 py-3 bg-white text-zinc-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
			>
				Subscribe
			</button>
		</form>
		<p class="text-zinc-400 text-sm mt-4">
			Join 10,000+ fashion enthusiasts. Unsubscribe anytime.
		</p>
	</div>
</section>