<script lang="ts">
	import { page } from '$app/state';
	import { SEOMetaTags } from '@repo/ui';
    
	const pageTitle = 'Help Center - Driplo Support';
	const pageDescription = 'Get help with buying, selling, and using Driplo. Find answers to common questions, contact support, and learn how to make the most of your experience.';

	// Search state
	let searchQuery = $state('');
	let searchResults = $state<typeof faqData>([]);
	
	// Live chat state
	let showLiveChat = $state(false);
	let chatMessages = $state<Array<{id: number; sender: 'user' | 'support'; text: string; time: Date}>>([
		{ id: 1, sender: 'support', text: 'Hi! Welcome to Driplo support. How can I help you today?', time: new Date() }
	]);
	let chatInput = $state('');
	let isChatTyping = $state(false);

	// FAQ accordion state
	let openFAQs = $state<Set<string>>(new Set());

	function toggleFAQ(id: string) {
		if (openFAQs.has(id)) {
			openFAQs.delete(id);
		} else {
			openFAQs.add(id);
		}
		openFAQs = new Set(openFAQs); // Trigger reactivity
	}

	// FAQ data
	const faqData = [
		{
			id: 'buy-1',
			category: 'buying',
			question: 'How do I purchase an item?',
			answer: 'Browse items using search or categories, click on an item to view details, then click "Buy Now" to proceed to checkout. You\'ll need to be logged in to complete your purchase.'
		},
		{
			id: 'buy-2',
			category: 'buying',
			question: 'Is my payment secure?',
			answer: 'Yes! We use industry-standard SSL encryption and partner with trusted payment processors. Your payment information is never stored on our servers.'
		},
		{
			id: 'buy-3',
			category: 'buying',
			question: 'What if my item doesn\'t arrive?',
			answer: 'All purchases are covered by our Buyer Protection. If your item doesn\'t arrive or doesn\'t match the description, you\'re eligible for a full refund.'
		},
		{
			id: 'buy-4',
			category: 'buying',
			question: 'Can I return an item?',
			answer: 'Return policies vary by seller. Check the individual listing for return details. If an item is significantly not as described, you can open a dispute within 48 hours of delivery.'
		},
		{
			id: 'sell-1',
			category: 'selling',
			question: 'How do I list an item for sale?',
			answer: 'Click the "Sell" button, upload clear photos of your item, fill in the details (title, description, price, condition), select a category, and publish your listing.'
		},
		{
			id: 'sell-2',
			category: 'selling',
			question: 'What are the selling fees?',
			answer: 'We charge a small commission on successful sales to keep the platform running. Basic listings are free, and you only pay when you make a sale.'
		},
		{
			id: 'sell-3',
			category: 'selling',
			question: 'How do I get paid?',
			answer: 'Payments are released to your account after the buyer confirms receipt. You can withdraw your balance to your bank account or connected payment method.'
		},
		{
			id: 'sell-4',
			category: 'selling',
			question: 'How should I ship my items?',
			answer: 'After a sale, you can print a shipping label from your dashboard. Pack items securely, ship within 5 business days, and update tracking information.'
		},
		{
			id: 'acc-1',
			category: 'account',
			question: 'How do I reset my password?',
			answer: 'Click "Forgot Password" on the login page, enter your email, and follow the link sent to your inbox to create a new password.'
		},
		{
			id: 'acc-2',
			category: 'account',
			question: 'How do I delete my account?',
			answer: 'Go to Settings > Account > Delete Account. Please note that account deletion is permanent and you\'ll lose access to your purchase history and messages.'
		},
		{
			id: 'acc-3',
			category: 'account',
			question: 'How do I get verified?',
			answer: 'Complete your profile, verify your email and phone number, and maintain a good selling record. Verified badges are awarded to trusted sellers.'
		}
	];

	// Search functionality
	function handleSearch() {
		if (!searchQuery.trim()) {
			searchResults = [];
			return;
		}
		const query = searchQuery.toLowerCase();
		searchResults = faqData.filter(
			faq => faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query)
		);
	}

	// Live chat functions
	function openLiveChat() {
		showLiveChat = true;
	}

	function closeLiveChat() {
		showLiveChat = false;
	}

	async function sendChatMessage() {
		if (!chatInput.trim()) return;
		
		const userMessage = {
			id: chatMessages.length + 1,
			sender: 'user' as const,
			text: chatInput,
			time: new Date()
		};
		chatMessages = [...chatMessages, userMessage];
		chatInput = '';
		
		// Simulate support response
		isChatTyping = true;
		await new Promise(resolve => setTimeout(resolve, 1500));
		
		const responses = [
			'Thanks for your message! Our support team will get back to you shortly.',
			'I understand. Let me connect you with a specialist who can help.',
			'Great question! You can find more details in our FAQ section above.',
			'I\'ve noted your concern. A team member will follow up via email within 24 hours.'
		];
		
		const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
		const supportMessage = {
			id: chatMessages.length + 2,
			sender: 'support' as const,
			text: selectedResponse ?? 'Thanks for reaching out!',
			time: new Date()
		};
		
		isChatTyping = false;
		chatMessages = [...chatMessages, supportMessage];
	}

	function formatTime(date: Date) {
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}
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
				bind:value={searchQuery}
				oninput={handleSearch}
				class="w-full px-6 py-4 text-lg border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--state-focus)] focus:border-transparent"
			/>
			<svg class="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
		</div>
		
		<!-- Search Results -->
		{#if searchResults.length > 0}
			<div class="mt-4 bg-white rounded-xl shadow-lg border border-gray-200 max-w-xl mx-auto text-left overflow-hidden">
				<div class="p-3 border-b border-gray-100 bg-gray-50">
					<span class="text-sm text-gray-600">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found</span>
				</div>
				<ul class="divide-y divide-gray-100 max-h-80 overflow-y-auto">
					{#each searchResults as result}
						<li class="p-4 hover:bg-gray-50">
							<button 
								onclick={() => { toggleFAQ(result.id); searchQuery = ''; searchResults = []; }}
								class="text-left w-full"
							>
								<p class="font-medium text-gray-900">{result.question}</p>
								<p class="text-sm text-gray-500 mt-1 line-clamp-2">{result.answer}</p>
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{:else if searchQuery.trim()}
			<div class="mt-4 bg-white rounded-xl shadow-lg border border-gray-200 max-w-xl mx-auto p-6 text-center">
				<p class="text-gray-600">No results found for "{searchQuery}"</p>
				<p class="text-sm text-gray-500 mt-2">Try searching with different keywords or browse the sections below</p>
			</div>
		{/if}
	</div>
</section>

<!-- Quick Links Section -->
<section class="py-12 px-4">
	<div class="max-w-6xl mx-auto">
		<h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">Quick Help</h2>
		<div class="grid md:grid-cols-3 gap-6">
			<a href="/help#buying" class="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
				<div class="w-12 h-12 bg-[var(--surface-brand-strong)]/10 rounded-lg flex items-center justify-center mb-4">
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
				<div class="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center mb-4">
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
						<span class="flex-shrink-0 w-6 h-6 bg-[var(--brand-primary-strong)] text-white rounded-full flex items-center justify-center text-sm font-semibold">1</span>
						<div>
							<p class="font-medium text-gray-900">Browse and Find Items</p>
							<p class="text-gray-600 text-sm">Use search, categories, and filters to discover items you love</p>
						</div>
					</li>
					<li class="flex gap-3">
						<span class="flex-shrink-0 w-6 h-6 bg-[var(--brand-primary-strong)] text-white rounded-full flex items-center justify-center text-sm font-semibold">2</span>
						<div>
							<p class="font-medium text-gray-900">Check Item Details</p>
							<p class="text-gray-600 text-sm">Review photos, descriptions, condition, and seller information</p>
						</div>
					</li>
					<li class="flex gap-3">
						<span class="flex-shrink-0 w-6 h-6 bg-[var(--brand-primary-strong)] text-white rounded-full flex items-center justify-center text-sm font-semibold">3</span>
						<div>
							<p class="font-medium text-gray-900">Purchase Securely</p>
							<p class="text-gray-600 text-sm">Use our secure checkout with buyer protection</p>
						</div>
					</li>
					<li class="flex gap-3">
						<span class="flex-shrink-0 w-6 h-6 bg-[var(--brand-primary-strong)] text-white rounded-full flex items-center justify-center text-sm font-semibold">4</span>
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
						<span class="text-[var(--brand-primary-strong)] text-xl">📦</span>
						<div>
							<p class="font-medium text-gray-900">Easy Shipping</p>
							<p class="text-gray-600 text-sm">Print shipping labels directly from your dashboard</p>
						</div>
					</div>
					<div class="flex gap-3">
						<span class="text-[var(--brand-primary-strong)] text-xl">🚚</span>
						<div>
							<p class="font-medium text-gray-900">Multiple Options</p>
							<p class="text-gray-600 text-sm">Choose from standard, express, or local pickup</p>
						</div>
					</div>
					<div class="flex gap-3">
						<span class="text-[var(--brand-primary-strong)] text-xl">📍</span>
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
				<div class="w-12 h-12 bg-[var(--surface-brand-strong)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
					<span class="text-2xl">💬</span>
				</div>
				<h3 class="font-semibold text-gray-900 mb-2">Live Chat</h3>
				<p class="text-gray-600 text-sm mb-4">Chat with our support team in real-time</p>
				<button 
					onclick={openLiveChat}
					class="text-[var(--brand-primary-strong)] font-medium text-sm hover:text-[color-mix(in_oklch,var(--brand-primary-strong)_90%,black_10%)]" 
					aria-label="Start live chat with support team"
				>Start Chat →</button>
			</div>
			<div class="bg-white p-6 rounded-xl shadow-sm">
				<div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<span class="text-2xl">✉️</span>
				</div>
				<h3 class="font-semibold text-gray-900 mb-2">Email Support</h3>
				<p class="text-gray-600 text-sm mb-4">Get help via email within 24 hours</p>
				<a href="mailto:support@driplo.xyz" class="text-[var(--brand-primary-strong)] font-medium text-sm hover:text-[color-mix(in_oklch,var(--brand-primary-strong)_90%,black_10%)]">Email Us →</a>
			</div>
			<div class="bg-white p-6 rounded-xl shadow-sm">
				<div class="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<span class="text-2xl">📚</span>
				</div>
				<h3 class="font-semibold text-gray-900 mb-2">Help Articles</h3>
				<p class="text-gray-600 text-sm mb-4">Browse our comprehensive help articles</p>
				<a href="/help/articles" class="text-[var(--brand-primary-strong)] font-medium text-sm hover:text-[color-mix(in_oklch,var(--brand-primary-strong)_90%,black_10%)]">Browse Articles →</a>
			</div>
		</div>
	</div>
</section>

<!-- FAQ Accordion Section -->
<section id="faq" class="py-16 px-4 bg-gray-50">
	<div class="max-w-4xl mx-auto">
		<h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
		
		<!-- FAQ Categories -->
		<div class="space-y-8">
			<!-- Buying FAQs -->
			<div>
				<h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
					<span class="text-2xl">🛍️</span> Buying
				</h3>
				<div class="space-y-2">
					{#each faqData.filter(f => f.category === 'buying') as faq}
						<div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
							<button 
								onclick={() => toggleFAQ(faq.id)}
								class="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
								aria-expanded={openFAQs.has(faq.id)}
							>
								<span class="font-medium text-gray-900">{faq.question}</span>
								<svg 
									class="w-5 h-5 text-gray-500 transition-transform duration-200 {openFAQs.has(faq.id) ? 'rotate-180' : ''}" 
									fill="none" 
									stroke="currentColor" 
									viewBox="0 0 24 24"
								>
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
								</svg>
							</button>
							{#if openFAQs.has(faq.id)}
								<div class="px-6 pb-4 text-gray-600 animate-in slide-in-from-top-2 duration-200">
									{faq.answer}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<!-- Selling FAQs -->
			<div>
				<h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
					<span class="text-2xl">💰</span> Selling
				</h3>
				<div class="space-y-2">
					{#each faqData.filter(f => f.category === 'selling') as faq}
						<div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
							<button 
								onclick={() => toggleFAQ(faq.id)}
								class="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
								aria-expanded={openFAQs.has(faq.id)}
							>
								<span class="font-medium text-gray-900">{faq.question}</span>
								<svg 
									class="w-5 h-5 text-gray-500 transition-transform duration-200 {openFAQs.has(faq.id) ? 'rotate-180' : ''}" 
									fill="none" 
									stroke="currentColor" 
									viewBox="0 0 24 24"
								>
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
								</svg>
							</button>
							{#if openFAQs.has(faq.id)}
								<div class="px-6 pb-4 text-gray-600 animate-in slide-in-from-top-2 duration-200">
									{faq.answer}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<!-- Account FAQs -->
			<div>
				<h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
					<span class="text-2xl">👤</span> Account
				</h3>
				<div class="space-y-2">
					{#each faqData.filter(f => f.category === 'account') as faq}
						<div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
							<button 
								onclick={() => toggleFAQ(faq.id)}
								class="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
								aria-expanded={openFAQs.has(faq.id)}
							>
								<span class="font-medium text-gray-900">{faq.question}</span>
								<svg 
									class="w-5 h-5 text-gray-500 transition-transform duration-200 {openFAQs.has(faq.id) ? 'rotate-180' : ''}" 
									fill="none" 
									stroke="currentColor" 
									viewBox="0 0 24 24"
								>
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
								</svg>
							</button>
							{#if openFAQs.has(faq.id)}
								<div class="px-6 pb-4 text-gray-600 animate-in slide-in-from-top-2 duration-200">
									{faq.answer}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Live Chat Widget -->
{#if showLiveChat}
	<div class="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
		<!-- Chat Header -->
		<div class="bg-[var(--brand-primary-strong)] text-white p-4 flex items-center justify-between">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
					<span class="text-xl">💬</span>
				</div>
				<div>
					<h3 class="font-semibold">Driplo Support</h3>
					<p class="text-xs text-white/80">We typically reply in a few minutes</p>
				</div>
			</div>
			<button 
				onclick={closeLiveChat}
				class="p-2 hover:bg-white/10 rounded-full transition-colors"
				aria-label="Close chat"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Chat Messages -->
		<div class="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
			{#each chatMessages as message}
				<div class="flex {message.sender === 'user' ? 'justify-end' : 'justify-start'}">
					<div class="max-w-[80%] {message.sender === 'user' ? 'bg-[var(--brand-primary-strong)] text-white' : 'bg-white border border-gray-200'} rounded-2xl px-4 py-3 shadow-sm">
						<p class="text-sm">{message.text}</p>
						<p class="text-xs {message.sender === 'user' ? 'text-white/70' : 'text-gray-400'} mt-1">{formatTime(message.time)}</p>
					</div>
				</div>
			{/each}
			{#if isChatTyping}
				<div class="flex justify-start">
					<div class="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
						<div class="flex gap-1">
							<span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
							<span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
							<span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Chat Input -->
		<div class="p-4 border-t border-gray-200 bg-white">
			<form onsubmit={(e) => { e.preventDefault(); sendChatMessage(); }} class="flex gap-2">
				<input
					type="text"
					bind:value={chatInput}
					placeholder="Type your message..."
					class="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary-strong)] focus:border-transparent"
				/>
				<button 
					type="submit"
					disabled={!chatInput.trim()}
					class="px-4 py-2 bg-[var(--brand-primary-strong)] text-white rounded-full hover:bg-[color-mix(in_oklch,var(--brand-primary-strong)_90%,black_10%)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					aria-label="Send message"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
					</svg>
				</button>
			</form>
		</div>
	</div>
{:else}
	<!-- Floating Chat Button -->
	<button
		onclick={openLiveChat}
		class="fixed bottom-4 right-4 z-50 w-14 h-14 bg-[var(--brand-primary-strong)] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
		aria-label="Open live chat"
	>
		<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
		</svg>
	</button>
{/if}