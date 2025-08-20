<script lang="ts">
	import { Button, Card } from '@repo/ui';
	
	const faqs = [
		{
			question: 'How do I create an account?',
			answer: 'Click the Sign Up button in the top navigation and follow the registration process. You\'ll need to provide an email address and create a password.'
		},
		{
			question: 'How do I list an item for sale?',
			answer: 'After logging in, click the "Sell" button, upload photos of your item, add a description and price, then publish your listing.'
		},
		{
			question: 'What payment methods are accepted?',
			answer: 'We accept all major credit cards, debit cards, and PayPal. Payments are processed securely through Stripe.'
		},
		{
			question: 'How long does shipping take?',
			answer: 'Shipping times depend on the seller\'s location and chosen shipping method. Most items arrive within 3-7 business days.'
		},
		{
			question: 'What if I receive an item that\'s not as described?',
			answer: 'Open a dispute through your purchase history within 3 days of receiving the item. We\'ll review the case and provide a resolution.'
		},
		{
			question: 'How do I delete my account?',
			answer: 'Go to your profile settings and scroll to the bottom to find the "Delete Account" option. Note that this action is permanent.'
		}
	];
</script>

<div class="min-h-screen bg-gray-50 py-12">
	<div class="container mx-auto px-4 max-w-4xl">
		<div class="bg-white rounded-lg shadow-sm p-8">
			<h1 class="text-3xl font-bold mb-6">Support Center</h1>
			<p class="text-gray-600 mb-8">
				Find answers to common questions or contact our support team for assistance.
			</p>

			<div class="grid gap-6 md:grid-cols-2 mb-8">
				<Card>
					<div class="p-6">
						<div class="flex items-center mb-4">
							<svg class="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
							</svg>
							<h2 class="text-xl font-semibold">Email Support</h2>
						</div>
						<p class="text-gray-600 mb-4">
							Get help via email. We typically respond within 24 hours.
						</p>
						<Button href="mailto:support@driplo.xyz" variant="primary">
							Email Us
						</Button>
					</div>
				</Card>

				<Card>
					<div class="p-6">
						<div class="flex items-center mb-4">
							<svg class="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
							</svg>
							<h2 class="text-xl font-semibold">Live Chat</h2>
						</div>
						<p class="text-gray-600 mb-4">
							Chat with our support team in real-time during business hours.
						</p>
						<Button variant="primary" disabled>
							Chat Coming Soon
						</Button>
					</div>
				</Card>
			</div>

			<section class="mb-8">
				<h2 class="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
				<div class="space-y-4">
					{#each faqs as faq}
						<Card>
							<div class="p-6">
								<h3 class="font-semibold text-lg mb-2">{faq.question}</h3>
								<p class="text-gray-600">{faq.answer}</p>
							</div>
						</Card>
					{/each}
				</div>
			</section>

			<section class="border-t pt-8">
				<h2 class="text-2xl font-semibold mb-4">Still Need Help?</h2>
				<div class="bg-blue-50 rounded-lg p-6">
					<h3 class="font-semibold mb-2">Contact Information</h3>
					<div class="space-y-2 text-gray-700">
						<p>
							<strong>Email:</strong>{' '}
							<a href="mailto:support@driplo.xyz" class="text-blue-600 hover:underline">
								support@driplo.xyz
							</a>
						</p>
						<p>
							<strong>Response Time:</strong> 24-48 hours
						</p>
						<p>
							<strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM EST
						</p>
					</div>
				</div>
			</section>

			<section class="mt-8">
				<h2 class="text-2xl font-semibold mb-4">Helpful Resources</h2>
				<div class="grid gap-4 md:grid-cols-3">
					<a href="/terms" class="block p-4 border rounded-lg hover:bg-gray-50 transition">
						<h3 class="font-semibold mb-1">Terms of Service</h3>
						<p class="text-sm text-gray-600">Read our terms and conditions</p>
					</a>
					<a href="/privacy" class="block p-4 border rounded-lg hover:bg-gray-50 transition">
						<h3 class="font-semibold mb-1">Privacy Policy</h3>
						<p class="text-sm text-gray-600">Learn how we protect your data</p>
					</a>
					<a href="/dashboard" class="block p-4 border rounded-lg hover:bg-gray-50 transition">
						<h3 class="font-semibold mb-1">Seller Guide</h3>
						<p class="text-sm text-gray-600">Tips for successful selling</p>
					</a>
				</div>
			</section>

			<div class="mt-8 pt-6 border-t">
				<Button href="/" variant="secondary">Back to Home</Button>
			</div>
		</div>
	</div>
</div>