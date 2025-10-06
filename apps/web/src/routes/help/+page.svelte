<script lang="ts">
	import { page } from '$app/state';
	import * as i18n from '@repo/i18n';
	import { SEOMetaTags } from '@repo/ui';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const pageTitle = 'Help Center - Driplo Support';
	const pageDescription = 'Get help with buying, selling, and using Driplo. Find answers to common questions, contact support, and learn how to make the most of your experience.';
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
<section class="bg-gradient-to-br from-green-50 via-white to-blue-50 py-16 px-4">
	<div class="max-w-4xl mx-auto text-center">
		<h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
			Help Center
		</h1>
		<p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
			Everything you need to know about buying, selling, and navigating Driplo.
			We're here to help you succeed.
		</p>
		<div class="relative max-w-xl mx-auto">
			<input
				type="search"
				placeholder="Search for help..."
				class="w-full px-6 py-4 text-lg border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
			/>
		</div>
	</div>
</section>

<!-- Quick Links Section -->
<section class="py-12 px-4">
	<div class="max-w-6xl mx-auto">
		<h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">Quick Help</h2>
		<div class="grid md:grid-cols-3 gap-6">
			<a href="/help#buying" class="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
				<div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
					<span class="text-2xl">🛍️</span>
				</div>
				<h3 class="text-lg font-semibold text-gray-900 mb-2">Buying on Driplo</h3>
				<p class="text-gray-600 text-sm">Learn how to browse, purchase, and track your orders</p>
			</a>
			<a href="/help#selling" class="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
				<div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
					<span class="text-2xl">💰</span>
				</div>
				<h3 class="text-lg font-semibold text-gray-900 mb-2">Selling on Driplo</h3>
				<p class="text-gray-600 text-sm">List items, manage sales, and grow your business</p>
			</a>
			<a href="/help#account" class="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
				<div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
					<span class="text-2xl">👤</span>
				</div>
				<h3 class="text-lg font-semibold text-gray-900 mb-2">Account & Settings</h3>
				<p class="text-gray-600 text-sm">Manage your profile, preferences, and security</p>
			</a>
		</div>
	</div>
</section>

<!-- Buying Section -->
<section id="buying" class="py-16 px-4 bg-gray-50">
	<div class="max-w-4xl mx-auto">
		<h2 class="text-3xl font-bold text-gray-900 mb-8">Buying on Driplo</h2>
		<div class="space-y-8">
			<div class="bg-white p-6 rounded-xl shadow-sm">
				<h3 class="text-xl font-semibold text-gray-900 mb-4">How to Buy</h3>
				<ol class="space-y-3">
					<li class="flex gap-3">
						<span class="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</span>
						<div>
							<p class="font-medium text-gray-900">Browse and Find Items</p>
							<p class="text-gray-600 text-sm">Use search, categories, and filters to discover items you love</p>
						</div>
					</li>
					<li class="flex gap-3">
						<span class="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</span>
						<div>
							<p class="font-medium text-gray-900">Check Item Details</p>
							<p class="text-gray-600 text-sm">Review photos, descriptions, condition, and seller information</p>
						</div>
					</li>
					<li class="flex gap-3">
						<span class="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">3</span>
						<div>
							<p class="font-medium text-gray-900">Purchase Securely</p>
							<p class="text-gray-600 text-sm">Use our secure checkout with buyer protection</p>
						</div>
					</li>
					<li class="flex gap-3">
						<span class="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">4</span>
						<div>
							<p class="font-medium text-gray-900">Track Your Order</p>
							<p class="text-gray-600 text-sm">Monitor shipping and confirm receipt when your item arrives</p>
						</div>
					</li>
				</ol>
			</div>

			<div class="bg-white p-6 rounded-xl shadow-sm">
				<h3 class="text-xl font-semibold text-gray-900 mb-4">Payment & Security</h3>
				<div class="space-y-4">
					<div class="flex gap-3">
						<span class="text-green-600 text-xl">✓</span>
						<div>
							<p class="font-medium text-gray-900">Buyer Protection</p>
							<p class="text-gray-600 text-sm">All purchases are protected until you receive your items</p>
						</div>
					</div>
					<div class="flex gap-3">
						<span class="text-green-600 text-xl">✓</span>
						<div>
							<p class="font-medium text-gray-900">Secure Payments</p>
							<p class="text-gray-600 text-sm">We use industry-standard encryption for all transactions</p>
						</div>
					</div>
					<div class="flex gap-3">
						<span class="text-green-600 text-xl">✓</span>
						<div>
							<p class="font-medium text-gray-900">Multiple Payment Options</p>
							<p class="text-gray-600 text-sm">Credit cards, debit cards, and other secure payment methods</p>
						</div>
					</div>
				</div>
			</div>

			<div class="bg-white p-6 rounded-xl shadow-sm">
				<h3 class="text-xl font-semibold text-gray-900 mb-4">Returns & Refunds</h3>
				<p class="text-gray-600 mb-4">
					We want you to love your purchases. If an item doesn't match its description or arrives damaged,
					you're protected under our buyer protection policy.
				</p>
				<ul class="space-y-2 text-gray-600">
					<li>• Items not as described: Full refund</li>
					<li>• Damaged items: Full refund or replacement</li>
					<li>• Lost in transit: Full refund</li>
					<li>• Change of mind: Check individual seller policies</li>
				</ul>
			</div>
		</div>
	</div>
</section>

<!-- Selling Section -->
<section id="selling" class="py-16 px-4">
	<div class="max-w-4xl mx-auto">
		<h2 class="text-3xl font-bold text-gray-900 mb-8">Selling on Driplo</h2>
		<div class="space-y-8">
			<div class="bg-white p-6 rounded-xl shadow-sm">
				<h3 class="text-xl font-semibold text-gray-900 mb-4">Getting Started</h3>
				<ol class="space-y-3">
					<li class="flex gap-3">
						<span class="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</span>
						<div>
							<p class="font-medium text-gray-900">Create Your Account</p>
							<p class="text-gray-600 text-sm">Sign up and verify your email to start selling</p>
						</div>
					</li>
					<li class="flex gap-3">
						<span class="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</span>
						<div>
							<p class="font-medium text-gray-900">List Your Items</p>
							<p class="text-gray-600 text-sm">Take clear photos and write detailed descriptions</p>
						</div>
					</li>
					<li class="flex gap-3">
						<span class="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">3</span>
						<div>
							<p class="font-medium text-gray-900">Set Your Price</p>
							<p class="text-gray-600 text-sm">Research similar items to price competitively</p>
						</div>
					</li>
					<li class="flex gap-3">
						<span class="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">4</span>
						<div>
							<p class="font-medium text-gray-900">Manage Sales</p>
							<p class="text-gray-600 text-sm">Communicate with buyers and ship promptly</p>
						</div>
					</li>
				</ol>
			</div>

			<div class="bg-white p-6 rounded-xl shadow-sm">
				<h3 class="text-xl font-semibold text-gray-900 mb-4">Tips for Successful Selling</h3>
				<div class="grid md:grid-cols-2 gap-6">
					<div>
						<h4 class="font-medium text-gray-900 mb-3">Photos</h4>
						<ul class="text-gray-600 text-sm space-y-1">
							<li>• Use natural lighting</li>
							<li>• Show multiple angles</li>
							<li>• Include close-ups of details</li>
							<li>• Display item on a clean background</li>
						</ul>
					</div>
					<div>
						<h4 class="font-medium text-gray-900 mb-3">Descriptions</h4>
						<ul class="text-gray-600 text-sm space-y-1">
							<li>• Be honest about condition</li>
							<li>• Include brand, size, and material</li>
							<li>• Mention any flaws or wear</li>
							<li>• Provide measurements when relevant</li>
						</ul>
					</div>
				</div>
			</div>

			<div class="bg-white p-6 rounded-xl shadow-sm">
				<h3 class="text-xl font-semibold text-gray-900 mb-4">Shipping & Delivery</h3>
				<p class="text-gray-600 mb-4">
					We make shipping easy with integrated tracking and multiple delivery options.
				</p>
				<div class="space-y-3">
					<div class="flex gap-3">
						<span class="text-blue-600 text-xl">📦</span>
						<div>
							<p class="font-medium text-gray-900">Easy Shipping</p>
							<p class="text-gray-600 text-sm">Print shipping labels directly from your dashboard</p>
						</div>
					</div>
					<div class="flex gap-3">
						<span class="text-blue-600 text-xl">🚚</span>
						<div>
							<p class="font-medium text-gray-900">Multiple Options</p>
							<p class="text-gray-600 text-sm">Choose from standard, express, or local pickup</p>
						</div>
					</div>
					<div class="flex gap-3">
						<span class="text-blue-600 text-xl">📍</span>
						<div>
							<p class="font-medium text-gray-900">Tracking Included</p>
							<p class="text-gray-600 text-sm">Both you and the buyer can track the shipment</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Account Section -->
<section id="account" class="py-16 px-4 bg-gray-50">
	<div class="max-w-4xl mx-auto">
		<h2 class="text-3xl font-bold text-gray-900 mb-8">Account & Settings</h2>
		<div class="space-y-8">
			<div class="bg-white p-6 rounded-xl shadow-sm">
				<h3 class="text-xl font-semibold text-gray-900 mb-4">Managing Your Profile</h3>
				<div class="space-y-4">
					<div>
						<h4 class="font-medium text-gray-900 mb-2">Profile Information</h4>
						<p class="text-gray-600 text-sm">
							Add a profile photo, bio, and links to your social media to build trust with buyers and sellers.
						</p>
					</div>
					<div>
						<h4 class="font-medium text-gray-900 mb-2">Verification</h4>
						<p class="text-gray-600 text-sm">
							Get verified to increase visibility and build credibility. Verified sellers sell items 3x faster on average.
						</p>
					</div>
					<div>
						<h4 class="font-medium text-gray-900 mb-2">Reviews</h4>
						<p class="text-gray-600 text-sm">
							Leave reviews for transactions to help build community trust. Your feedback helps others make informed decisions.
						</p>
					</div>
				</div>
			</div>

			<div class="bg-white p-6 rounded-xl shadow-sm">
				<h3 class="text-xl font-semibold text-gray-900 mb-4">Privacy & Security</h3>
				<div class="space-y-4">
					<div class="flex gap-3">
						<span class="text-green-600 text-xl">🔒</span>
						<div>
							<p class="font-medium text-gray-900">Data Protection</p>
							<p class="text-gray-600 text-sm">Your personal information is encrypted and never shared without consent</p>
						</div>
					</div>
					<div class="flex gap-3">
						<span class="text-green-600 text-xl">🛡️</span>
						<div>
							<p class="font-medium text-gray-900">Two-Factor Authentication</p>
							<p class="text-gray-600 text-sm">Add an extra layer of security to your account with 2FA</p>
						</div>
					</div>
					<div class="flex gap-3">
						<span class="text-green-600 text-xl">📱</span>
						<div>
							<p class="font-medium text-gray-900">Secure Messaging</p>
							<p class="text-gray-600 text-sm">All communications are encrypted and monitored for safety</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Contact Support Section -->
<section class="py-16 px-4">
	<div class="max-w-4xl mx-auto text-center">
		<h2 class="text-3xl font-bold text-gray-900 mb-6">Still Need Help?</h2>
		<p class="text-lg text-gray-600 mb-8">
			Our support team is here to help you with any questions or issues.
		</p>
		<div class="grid md:grid-cols-3 gap-6 mb-12">
			<div class="bg-white p-6 rounded-xl shadow-sm">
				<div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<span class="text-2xl">💬</span>
				</div>
				<h3 class="font-semibold text-gray-900 mb-2">Live Chat</h3>
				<p class="text-gray-600 text-sm mb-4">Chat with our support team in real-time</p>
				<button class="text-blue-600 font-medium text-sm hover:text-blue-700">Start Chat →</button>
			</div>
			<div class="bg-white p-6 rounded-xl shadow-sm">
				<div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<span class="text-2xl">✉️</span>
				</div>
				<h3 class="font-semibold text-gray-900 mb-2">Email Support</h3>
				<p class="text-gray-600 text-sm mb-4">Get help via email within 24 hours</p>
				<a href="mailto:support@driplo.xyz" class="text-blue-600 font-medium text-sm hover:text-blue-700">Email Us →</a>
			</div>
			<div class="bg-white p-6 rounded-xl shadow-sm">
				<div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<span class="text-2xl">📚</span>
				</div>
				<h3 class="font-semibold text-gray-900 mb-2">Help Articles</h3>
				<p class="text-gray-600 text-sm mb-4">Browse our comprehensive help articles</p>
				<a href="/help/articles" class="text-blue-600 font-medium text-sm hover:text-blue-700">Browse Articles →</a>
			</div>
		</div>
	</div>
</section>