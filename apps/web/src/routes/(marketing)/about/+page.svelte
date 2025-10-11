<script lang="ts">
	import { page } from '$app/state';
	import * as i18n from '@repo/i18n';
	import { SEOMetaTags } from '@repo/ui';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const pageTitle = 'About Driplo - Bulgaria & UK\'s Premier Fashion Marketplace';
	const pageDescription = 'Discover Driplo, the trusted marketplace for second-hand fashion across Bulgaria and the UK. Buy and sell unique clothing, shoes, and accessories with confidence.';
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
<section class="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 px-4">
	<div class="max-w-4xl mx-auto text-center">
		<h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
			About <span class="text-blue-600">Driplo</span>
		</h1>
		<p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
			Bulgaria and the UK\'s trusted marketplace for pre-loved fashion.
			Connecting style-conscious buyers and sellers since 2024.
		</p>
		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<a href="/sell" class="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
				Start Selling
			</a>
			<a href="/search" class="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors">
				Browse Fashion
			</a>
		</div>
	</div>
</section>

<!-- Mission Section -->
<section class="py-16 px-4">
	<div class="max-w-6xl mx-auto">
		<div class="grid md:grid-cols-2 gap-12 items-center">
			<div>
				<h2 class="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
				<p class="text-lg text-gray-600 mb-6">
					We're making sustainable fashion accessible to everyone in Bulgaria and the UK.
					By creating a trusted marketplace for second-hand clothing, we help you find unique
					pieces while reducing fashion waste.
				</p>
				<p class="text-lg text-gray-600 mb-8">
					Every item on Driplo tells a story. Whether you're buying or selling, you're part
					of a community that values quality, sustainability, and individual style.
				</p>
				<div class="grid grid-cols-2 gap-6">
					<div class="text-center p-4 bg-blue-50 rounded-lg">
						<div class="text-2xl font-bold text-blue-600 mb-2">50K+</div>
						<div class="text-sm text-gray-600">Active Items</div>
					</div>
					<div class="text-center p-4 bg-green-50 rounded-lg">
						<div class="text-2xl font-bold text-green-600 mb-2">10K+</div>
						<div class="text-sm text-gray-600">Happy Users</div>
					</div>
				</div>
			</div>
			<div class="bg-gradient-to-br from-purple-100 to-blue-100 p-8 rounded-2xl">
				<div class="space-y-6">
					<div class="flex items-start gap-4">
						<div class="flex-shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center">
							<span class="text-2xl">🌍</span>
						</div>
						<div>
							<h3 class="font-semibold text-gray-900 mb-2">Sustainable Fashion</h3>
							<p class="text-gray-600">Extend the life of quality clothing and reduce environmental impact</p>
						</div>
					</div>
					<div class="flex items-start gap-4">
						<div class="flex-shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center">
							<span class="text-2xl">🛡️</span>
						</div>
						<div>
							<h3 class="font-semibold text-gray-900 mb-2">Safe & Secure</h3>
							<p class="text-gray-600">Protected payments and verified sellers ensure worry-free shopping</p>
						</div>
					</div>
					<div class="flex items-start gap-4">
						<div class="flex-shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center">
							<span class="text-2xl">💎</span>
						</div>
						<div>
							<h3 class="font-semibold text-gray-900 mb-2">Quality Curated</h3>
							<p class="text-gray-600">Every item is reviewed to ensure it meets our quality standards</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- How It Works Section -->
<section class="py-16 px-4 bg-gray-50">
	<div class="max-w-6xl mx-auto">
		<h2 class="text-3xl font-bold text-center text-gray-900 mb-12">How Driplo Works</h2>
		<div class="grid md:grid-cols-3 gap-8">
			<div class="text-center">
				<div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<span class="text-2xl font-bold text-blue-600">1</span>
				</div>
				<h3 class="text-xl font-semibold text-gray-900 mb-3">Browse & Discover</h3>
				<p class="text-gray-600">
					Explore thousands of unique fashion items from sellers across Bulgaria and the UK.
					Use filters to find exactly what you're looking for.
				</p>
			</div>
			<div class="text-center">
				<div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<span class="text-2xl font-bold text-blue-600">2</span>
				</div>
				<h3 class="text-xl font-semibold text-gray-900 mb-3">Buy & Sell Safely</h3>
				<p class="text-gray-600">
					Purchase securely with buyer protection. List your items in minutes with our
					simple selling process and reach thousands of potential buyers.
				</p>
			</div>
			<div class="text-center">
				<div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<span class="text-2xl font-bold text-blue-600">3</span>
				</div>
				<h3 class="text-xl font-semibold text-gray-900 mb-3">Connect & Style</h3>
				<p class="text-gray-600">
					Join a community of fashion lovers. Follow favorite sellers, leave reviews,
					and discover your next favorite piece.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- Values Section -->
<section class="py-16 px-4">
	<div class="max-w-6xl mx-auto">
		<h2 class="text-3xl font-bold text-center text-gray-900 mb-12">Our Values</h2>
		<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
			<div class="text-center">
				<div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<span class="text-3xl">♻️</span>
				</div>
				<h3 class="font-semibold text-gray-900 mb-2">Sustainability</h3>
				<p class="text-gray-600 text-sm">Promoting circular fashion and reducing waste</p>
			</div>
			<div class="text-center">
				<div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<span class="text-3xl">🤝</span>
				</div>
				<h3 class="font-semibold text-gray-900 mb-2">Trust</h3>
				<p class="text-gray-600 text-sm">Building a safe, reliable marketplace</p>
			</div>
			<div class="text-center">
				<div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<span class="text-3xl">🎨</span>
				</div>
				<h3 class="font-semibold text-gray-900 mb-2">Individuality</h3>
				<p class="text-gray-600 text-sm">Celebrating unique style and self-expression</p>
			</div>
			<div class="text-center">
				<div class="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<span class="text-3xl">🌟</span>
				</div>
				<h3 class="font-semibold text-gray-900 mb-2">Quality</h3>
				<p class="text-gray-600 text-sm">Ensuring every item meets high standards</p>
			</div>
		</div>
	</div>
</section>

<!-- Team Section -->
<section class="py-16 px-4 bg-gray-50">
	<div class="max-w-4xl mx-auto text-center">
		<h2 class="text-3xl font-bold text-gray-900 mb-6">Meet the Team</h2>
		<p class="text-lg text-gray-600 mb-12">
			Founded by fashion enthusiasts who believe in sustainable style and community building.
		</p>
		<div class="grid md:grid-cols-3 gap-8">
			<div class="bg-white p-6 rounded-xl shadow-sm">
				<div class="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full mx-auto mb-4"></div>
				<h3 class="font-semibold text-gray-900 mb-1">Team Driplo</h3>
				<p class="text-gray-600 text-sm">Fashion & Tech Enthusiasts</p>
				<p class="text-gray-500 text-sm mt-2">Passionate about making sustainable fashion accessible to everyone</p>
			</div>
			<div class="bg-white p-6 rounded-xl shadow-sm">
				<div class="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-400 rounded-full mx-auto mb-4"></div>
				<h3 class="font-semibold text-gray-900 mb-1">Community First</h3>
				<p class="text-gray-600 text-sm">Built for Users</p>
				<p class="text-gray-500 text-sm mt-2">Every feature designed with our community in mind</p>
			</div>
			<div class="bg-white p-6 rounded-xl shadow-sm">
				<div class="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mx-auto mb-4"></div>
				<h3 class="font-semibold text-gray-900 mb-1">Local Focus</h3>
				<p class="text-gray-600 text-sm">Bulgaria & UK Markets</p>
				<p class="text-gray-500 text-sm mt-2">Serving local communities with global standards</p>
			</div>
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
	<div class="max-w-4xl mx-auto text-center">
		<h2 class="text-3xl font-bold text-white mb-6">Join the Driplo Community</h2>
		<p class="text-xl text-blue-100 mb-8">
			Start buying and selling unique fashion pieces today. Be part of the sustainable fashion revolution.
		</p>
		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<a href="/signup" class="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
				Sign Up Free
			</a>
			<a href="/sell" class="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-semibold rounded-lg border-2 border-white hover:bg-white hover:text-blue-600 transition-colors">
				List Your First Item
			</a>
		</div>
	</div>
</section>