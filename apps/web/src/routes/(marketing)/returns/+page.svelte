<script lang="ts">
	import { Button } from '@repo/ui';
	import { goto } from '$app/navigation';
</script>

<svelte:head>
	<title>Return Policy - Driplo</title>
	<meta name="description" content="Learn about Driplo's return and refund policy for marketplace transactions." />
</svelte:head>

<div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-4xl mx-auto">
		<h1 class="text-3xl font-bold text-gray-900 mb-8">Return Policy</h1>
		
		<div class="bg-white shadow-sm rounded-lg p-6 space-y-8">
			<div class="bg-[var(--surface-brand-strong)]/5 border border-[var(--surface-brand-strong)]/20 rounded-lg p-4">
				<p class="text-sm text-[color-mix(in_oklch,var(--brand-primary-strong)_80%,black_20%)]">
					<strong>Last updated:</strong> {new Date().toLocaleDateString()}
				</p>
			</div>

			<div class="bg-green-50 border border-green-200 rounded-lg p-4">
				<h3 class="font-semibold text-green-800 mb-2">💡 Quick Summary</h3>
				<p class="text-sm text-green-700">
					You have <strong>48 hours</strong> after delivery to report issues with your order. 
					Items must be significantly not as described to qualify for returns.
				</p>
			</div>

			<section>
				<h2 class="text-2xl font-semibold mb-4">Return Eligibility</h2>
				<p class="text-gray-600 mb-4">
					As a C2C marketplace, Driplo facilitates returns when items are significantly different from 
					their description. Returns are handled on a case-by-case basis to protect both buyers and sellers.
				</p>
				
				<div class="grid md:grid-cols-2 gap-6">
					<div class="bg-green-50 border border-green-200 rounded-lg p-4">
						<h3 class="font-semibold text-green-800 mb-3">✅ Valid Return Reasons</h3>
						<ul class="text-green-700 space-y-2 text-sm">
							<li>• Item significantly different from description</li>
							<li>• Wrong item sent by seller</li>
							<li>• Item damaged during shipping</li>
							<li>• Item is counterfeit or not authentic</li>
							<li>• Major undisclosed defects or stains</li>
							<li>• Wrong size sent (if size was specified)</li>
						</ul>
					</div>
					
					<div class="bg-red-50 border border-red-200 rounded-lg p-4">
						<h3 class="font-semibold text-red-800 mb-3">❌ Non-Returnable Cases</h3>
						<ul class="text-red-700 space-y-2 text-sm">
							<li>• Changed your mind about the purchase</li>
							<li>• Item doesn't fit as expected</li>
							<li>• Minor wear described in listing</li>
							<li>• Color appears different on your screen</li>
							<li>• Request made after 48 hours</li>
							<li>• Item used or worn after delivery</li>
						</ul>
					</div>
				</div>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">Return Process</h2>
				<div class="space-y-6">
					<div class="flex items-start space-x-4">
						<div class="flex-shrink-0 w-8 h-8 bg-[var(--brand-primary-strong)] text-white rounded-full flex items-center justify-center font-bold">1</div>
						<div>
							<h3 class="font-semibold text-gray-900 mb-2">Report the Issue (Within 48 Hours)</h3>
							<p class="text-gray-600 text-sm mb-3">
								Contact our support team immediately after receiving your item if there's an issue.
							</p>
							<ul class="text-gray-600 text-sm space-y-1">
								<li>• Go to your Orders page</li>
								<li>• Click "Report an Issue" on the relevant order</li>
								<li>• Or email support@driplo.xyz with your order number</li>
							</ul>
						</div>
					</div>

					<div class="flex items-start space-x-4">
						<div class="flex-shrink-0 w-8 h-8 bg-[var(--brand-primary-strong)] text-white rounded-full flex items-center justify-center font-bold">2</div>
						<div>
							<h3 class="font-semibold text-gray-900 mb-2">Provide Evidence</h3>
							<p class="text-gray-600 text-sm mb-3">
								Help us understand the issue by providing clear documentation.
							</p>
							<ul class="text-gray-600 text-sm space-y-1">
								<li>• High-quality photos of the item and any issues</li>
								<li>• Screenshots of the original listing</li>
								<li>• Detailed description of the problem</li>
								<li>• Any relevant communication with the seller</li>
							</ul>
						</div>
					</div>

					<div class="flex items-start space-x-4">
						<div class="flex-shrink-0 w-8 h-8 bg-[var(--brand-primary-strong)] text-white rounded-full flex items-center justify-center font-bold">3</div>
						<div>
							<h3 class="font-semibold text-gray-900 mb-2">Investigation & Mediation</h3>
							<p class="text-gray-600 text-sm mb-3">
								Our team will review the evidence and work with both parties to reach a fair resolution.
							</p>
							<ul class="text-gray-600 text-sm space-y-1">
								<li>• We'll contact the seller for their perspective</li>
								<li>• Review the original listing and photos</li>
								<li>• Compare evidence to determine if return is warranted</li>
								<li>• Response within 24-48 hours</li>
							</ul>
						</div>
					</div>

					<div class="flex items-start space-x-4">
						<div class="flex-shrink-0 w-8 h-8 bg-[var(--brand-primary-strong)] text-white rounded-full flex items-center justify-center font-bold">4</div>
						<div>
							<h3 class="font-semibold text-gray-900 mb-2">Resolution</h3>
							<p class="text-gray-600 text-sm mb-3">
								If your return is approved, we'll guide you through the next steps.
							</p>
							<ul class="text-gray-600 text-sm space-y-1">
								<li>• Full refund: Payment returned to your original method</li>
								<li>• Partial refund: If item has some value as described</li>
								<li>• Return shipping: Provided for eligible returns</li>
								<li>• Processing time: 3-5 business days after return received</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">Refund Information</h2>
				<div class="space-y-4">
					<div class="bg-[var(--surface-brand-strong)]/5 rounded-lg p-4">
						<h3 class="font-semibold text-[color-mix(in_oklch,var(--brand-primary-strong)_80%,black_20%)] mb-2">Refund Timeline</h3>
						<ul class="text-[color-mix(in_oklch,var(--brand-primary-strong)_90%,black_10%)] space-y-1 text-sm">
							<li>• Credit cards: 5-10 business days</li>
							<li>• PayPal: 1-3 business days</li>
							<li>• Bank transfers: 3-7 business days</li>
							<li>• Digital wallets: 1-2 business days</li>
						</ul>
					</div>
					
					<div>
						<h3 class="font-semibold text-gray-900 mb-2">What's Included in Refunds</h3>
						<ul class="list-disc pl-6 text-gray-600 space-y-1">
							<li>Item price paid by buyer</li>
							<li>Original shipping costs (if item not as described)</li>
							<li>Return shipping label (for eligible returns)</li>
							<li>Platform fees (when applicable)</li>
						</ul>
					</div>
				</div>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">Seller Responsibilities</h2>
				<p class="text-gray-600 mb-4">
					Sellers play a crucial role in preventing returns by providing accurate descriptions and quality service.
				</p>
				<ul class="list-disc pl-6 text-gray-600 space-y-2">
					<li><strong>Accurate Descriptions:</strong> Describe items honestly, including any flaws or wear</li>
					<li><strong>Quality Photos:</strong> Provide clear, well-lit photos from multiple angles</li>
					<li><strong>Size Information:</strong> Include accurate measurements when possible</li>
					<li><strong>Quick Communication:</strong> Respond promptly to buyer questions</li>
					<li><strong>Secure Packaging:</strong> Pack items safely to prevent shipping damage</li>
					<li><strong>Timely Shipping:</strong> Ship within 3 business days as promised</li>
				</ul>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">Buyer Responsibilities</h2>
				<p class="text-gray-600 mb-4">
					Buyers also have responsibilities to ensure smooth transactions and valid return claims.
				</p>
				<ul class="list-disc pl-6 text-gray-600 space-y-2">
					<li><strong>Read Descriptions:</strong> Carefully review item descriptions and photos before buying</li>
					<li><strong>Ask Questions:</strong> Contact sellers if you need clarification on anything</li>
					<li><strong>Inspect Promptly:</strong> Check items immediately upon delivery</li>
					<li><strong>Report Quickly:</strong> Contact support within 48 hours of any issues</li>
					<li><strong>Provide Evidence:</strong> Take clear photos and provide detailed explanations</li>
					<li><strong>Handle with Care:</strong> Don't use or modify items before resolving disputes</li>
				</ul>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">Special Circumstances</h2>
				<div class="space-y-4">
					<div>
						<h3 class="font-semibold text-gray-900 mb-2">Lost or Stolen Packages</h3>
						<p class="text-gray-600 text-sm">
							If your package is marked as delivered but you didn't receive it, contact us immediately. 
							We'll work with the shipping carrier and seller to resolve the issue.
						</p>
					</div>
					
					<div>
						<h3 class="font-semibold text-gray-900 mb-2">Damaged in Transit</h3>
						<p class="text-gray-600 text-sm">
							Items damaged during shipping are eligible for full refunds. Take photos of the packaging 
							and damaged item, then contact support immediately.
						</p>
					</div>
					
					<div>
						<h3 class="font-semibold text-gray-900 mb-2">Holiday Returns</h3>
						<p class="text-gray-600 text-sm">
							During holiday periods, return windows may be extended. Check your order confirmation 
							email for specific return deadlines during these times.
						</p>
					</div>
				</div>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">Prevention Tips</h2>
				<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
					<h3 class="font-semibold text-yellow-800 mb-3">🎯 Avoid Returns with Smart Shopping</h3>
					<ul class="text-yellow-700 space-y-1 text-sm">
						<li>• Read seller reviews and ratings</li>
						<li>• Ask for additional photos or measurements</li>
						<li>• Check the seller's return policy in their profile</li>
						<li>• Use the messaging system for all communication</li>
						<li>• Consider the item's age and expected wear</li>
					</ul>
				</div>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">Contact Support</h2>
				<div class="bg-gray-50 rounded-lg p-4">
					<p class="text-gray-600 mb-3">
						Need help with a return or have questions about this policy?
					</p>
					<div class="space-y-2">
						<div class="flex items-center space-x-3">
							<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
							</svg>
							<a href="mailto:support@driplo.xyz" class="text-[var(--brand-primary-strong)] hover:underline">support@driplo.xyz</a>
						</div>
						<div class="flex items-center space-x-3">
							<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
							</svg>
							<span class="text-gray-600">Live chat available 9 AM - 6 PM CET</span>
						</div>
					</div>
				</div>
			</section>

			<div class="pt-6 border-t flex gap-3">
				<Button variant="secondary" onclick={() => goto('/')}>
					Back to Home
				</Button>
				<Button variant="outline" onclick={() => goto('/orders')}>
					My Orders
				</Button>
			</div>
		</div>
	</div>
</div>