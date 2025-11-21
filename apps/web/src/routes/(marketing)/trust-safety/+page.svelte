<script lang="ts">
	import { Button } from '@repo/ui';
	import { goto } from '$app/navigation';
</script>

<svelte:head>
	<title>Trust & Safety - Driplo</title>
	<meta name="description" content="Learn how Driplo keeps the marketplace safe and trustworthy for all users." />
</svelte:head>

<div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-4xl mx-auto">
		<h1 class="text-3xl font-bold text-gray-900 mb-8">Trust & Safety</h1>
		
		<div class="bg-white shadow-sm rounded-lg p-6 space-y-8 prose prose-gray max-w-none">
			<div class="bg-[var(--surface-brand-strong)]/5 border border-[var(--surface-brand-strong)]/20 rounded-lg p-4">
				<p class="text-sm text-[color-mix(in_oklch,var(--brand-primary-strong)_90%,black_10%)]">
					<strong>Last updated:</strong> {new Date().toLocaleDateString()}
				</p>
			</div>

			<div class="bg-green-50 border border-green-200 rounded-lg p-4">
				<h2 class="text-lg font-semibold text-green-800 mb-2">🛡️ Our Commitment</h2>
				<p class="text-sm text-green-700">
					Driplo is dedicated to creating a safe, trustworthy marketplace where everyone can buy and sell with confidence. 
					Your safety is our top priority.
				</p>
			</div>

			<section>
				<h2 class="text-2xl font-semibold text-gray-900 mb-6">How We Keep You Safe</h2>
				<div class="grid md:grid-cols-2 gap-6">
					<div class="space-y-4">
						<div class="border border-gray-200 rounded-lg p-4">
							<div class="flex items-center mb-2">
								<svg class="w-6 h-6 text-gray-700 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
								</svg>
								<h3 class="text-base font-semibold text-gray-900">Secure Payments</h3>
							</div>
							<p class="text-gray-600 text-sm">
								All payments processed through Stripe with escrow protection. Your money is held safely until you confirm receipt.
							</p>
						</div>
						
						<div class="border border-gray-200 rounded-lg p-4">
							<div class="flex items-center mb-2">
								<svg class="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
								</svg>
								<h3 class="text-base font-semibold text-gray-900">Identity Verification</h3>
							</div>
							<p class="text-gray-600 text-sm">
								All users verify their email and phone number. Sellers undergo additional verification for higher transaction limits.
							</p>
						</div>
					</div>
					
					<div class="space-y-4">
						<div class="border border-gray-200 rounded-lg p-4">
							<div class="flex items-center mb-2">
								<svg class="w-6 h-6 text-zinc-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
								</svg>
								<h3 class="text-base font-semibold text-gray-900">24/7 Monitoring</h3>
							</div>
							<p class="text-gray-600 text-sm">
								Our team monitors the platform around the clock for suspicious activity, fake listings, and policy violations.
							</p>
						</div>
						
						<div class="border border-gray-200 rounded-lg p-4">
							<div class="flex items-center mb-2">
								<svg class="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
								</svg>
								<h3 class="text-base font-semibold text-gray-900">Quick Response</h3>
							</div>
							<p class="text-gray-600 text-sm">
								Report issues and get help within hours. Our support team is trained to handle disputes fairly and quickly.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section>
				<h2 class="text-2xl font-semibold text-gray-900 mb-6">Community Guidelines</h2>
				<p>
					Our community thrives when everyone follows these essential guidelines:
				</p>
				
				<div class="space-y-6">
					<div>
						<h3 class="text-lg font-semibold text-gray-900 mb-4">✅ What We Encourage</h3>
						<div class="grid md:grid-cols-2 gap-4">
							<ul class="list-disc pl-6 text-gray-600 space-y-2 text-sm">
								<li>Honest, detailed item descriptions</li>
								<li>High-quality, accurate photos</li>
								<li>Respectful communication</li>
								<li>Prompt shipping and responses</li>
								<li>Fair pricing for item condition</li>
								<li>Reporting suspicious activity</li>
							</ul>
							<ul class="list-disc pl-6 text-gray-600 space-y-2 text-sm">
								<li>Constructive feedback and reviews</li>
								<li>Following through on commitments</li>
								<li>Keeping transactions on platform</li>
								<li>Being patient during disputes</li>
								<li>Supporting fellow community members</li>
								<li>Celebrating successful transactions</li>
							</ul>
						</div>
					</div>

					<div>
						<h3 class="text-lg font-semibold text-gray-900 mb-4">🚫 What's Not Allowed</h3>
						<div class="bg-red-50 border border-red-200 rounded-lg p-4">
							<div class="grid md:grid-cols-2 gap-4">
								<ul class="list-disc pl-6 text-red-700 space-y-2 text-sm">
									<li>Counterfeit or replica items</li>
									<li>Stolen goods or illegal items</li>
									<li>Harassment or bullying</li>
									<li>Fake accounts or impersonation</li>
									<li>Price manipulation or fraud</li>
									<li>Spam or excessive messaging</li>
								</ul>
								<ul class="list-disc pl-6 text-red-700 space-y-2 text-sm">
									<li>Off-platform transactions</li>
									<li>Discriminatory behavior</li>
									<li>False or misleading descriptions</li>
									<li>Review manipulation</li>
									<li>Account sharing or selling</li>
									<li>Inappropriate content</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section>
				<h2 class="text-2xl font-semibold text-gray-900 mb-6">Reporting & Support</h2>
				
				<div class="space-y-6">
					<div>
						<h3 class="text-lg font-semibold text-gray-900 mb-3">How to Report Issues</h3>
						<div class="grid md:grid-cols-3 gap-4">
							<div class="border border-gray-200 rounded-lg p-4 text-center">
								<div class="w-12 h-12 bg-[color:var(--status-info-bg)] rounded-full flex items-center justify-center mx-auto mb-3">
									<svg class="w-6 h-6 text-[color:var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
									</svg>
								</div>
								<h4 class="text-sm font-semibold text-gray-900 mb-2">Report a Listing</h4>
								<p class="text-xs text-gray-600">Click "Report" on any suspicious or inappropriate listing</p>
							</div>
							
							<div class="border border-gray-200 rounded-lg p-4 text-center">
								<div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
									<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
								</div>
								<h4 class="text-sm font-semibold text-gray-900 mb-2">Report a User</h4>
								<p class="text-xs text-gray-600">Report harassment, fraud, or policy violations by users</p>
							</div>
							
							<div class="border border-gray-200 rounded-lg p-4 text-center">
								<div class="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-3">
									<svg class="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
									</svg>
								</div>
								<h4 class="text-sm font-semibold text-gray-900 mb-2">Get Help</h4>
								<p class="text-xs text-gray-600">Contact support for any safety concerns or questions</p>
							</div>
						</div>
					</div>

					<div>
						<h3 class="text-lg font-semibold text-gray-900 mb-3">What Happens After You Report</h3>
						<div class="bg-[color:var(--status-info-bg)] rounded-lg p-4">
							<ol class="list-decimal pl-6 text-[color-mix(in_oklch,var(--brand-primary-strong)_90%,black_10%)] space-y-2 text-sm">
								<li><strong>Immediate Review:</strong> Our team reviews all reports within 24 hours</li>
								<li><strong>Investigation:</strong> We gather evidence and may contact involved parties</li>
								<li><strong>Action Taken:</strong> Violations result in warnings, restrictions, or account suspension</li>
								<li><strong>Follow-up:</strong> We keep you informed about the resolution</li>
								<li><strong>Appeal Process:</strong> Users can appeal decisions they believe are unfair</li>
							</ol>
						</div>
					</div>
				</div>
			</section>

			<section>
				<h2 class="text-[length:var(--text-2xl)] font-semibold text-[color:var(--text-primary)] mb-6">Safe Shopping Tips</h2>
				
				<div class="grid md:grid-cols-2 gap-6">
					<div>
						<h3 class="text-[length:var(--text-lg)] font-semibold text-[color:var(--text-primary)] mb-3">🛒 For Buyers</h3>
						<ul class="space-y-3">
							<li class="flex items-start space-x-3">
								<svg class="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								<div>
									<p class="font-medium text-sm text-gray-900">Check seller ratings and reviews</p>
									<p class="text-xs text-gray-600">Look for consistent positive feedback from other buyers</p>
								</div>
							</li>
							<li class="flex items-start space-x-3">
								<svg class="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								<div>
									<p class="font-medium text-sm text-gray-900">Ask questions before buying</p>
									<p class="text-xs text-gray-600">Get clarification on size, condition, or any concerns</p>
								</div>
							</li>
							<li class="flex items-start space-x-3">
								<svg class="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								<div>
									<p class="font-medium text-sm text-gray-900">Use platform messaging only</p>
									<p class="text-xs text-gray-600">Keep all communication on Driplo for your protection</p>
								</div>
							</li>
							<li class="flex items-start space-x-3">
								<svg class="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								<div>
									<p class="font-medium text-sm text-gray-900">Never pay outside the platform</p>
									<p class="text-xs text-gray-600">Our payment system protects your money with escrow</p>
								</div>
							</li>
						</ul>
					</div>
					
					<div>
						<h3 class="text-[length:var(--text-lg)] font-semibold text-[color:var(--text-primary)] mb-3">💼 For Sellers</h3>
						<ul class="space-y-3">
							<li class="flex items-start space-x-3">
								<svg class="w-5 h-5 text-[color:var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								<div>
									<p class="font-medium text-sm text-gray-900">Take clear, honest photos</p>
									<p class="text-xs text-gray-600">Show items from multiple angles, including any flaws</p>
								</div>
							</li>
							<li class="flex items-start space-x-3">
								<svg class="w-5 h-5 text-[color:var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								<div>
									<p class="font-medium text-sm text-gray-900">Describe items accurately</p>
									<p class="text-xs text-gray-600">Include size, condition, brand, and any wear details</p>
								</div>
							</li>
							<li class="flex items-start space-x-3">
								<svg class="w-5 h-5 text-[color:var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								<div>
									<p class="font-medium text-sm text-gray-900">Ship quickly and safely</p>
									<p class="text-xs text-gray-600">Pack well and provide tracking information</p>
								</div>
							</li>
							<li class="flex items-start space-x-3">
								<svg class="w-5 h-5 text-[color:var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								<div>
									<p class="font-medium text-sm text-gray-900">Be responsive and professional</p>
									<p class="text-xs text-gray-600">Answer questions promptly and courteously</p>
								</div>
							</li>
						</ul>
					</div>
				</div>
			</section>

			<section>
				<h2 class="text-[length:var(--text-2xl)] font-semibold text-[color:var(--text-primary)] mb-6">Red Flags to Watch For</h2>
				<div class="bg-red-50 border border-red-200 rounded-lg p-4">
					<h3 class="text-[length:var(--text-lg)] font-semibold text-red-800 mb-3">⚠️ Warning Signs</h3>
					<div class="grid md:grid-cols-2 gap-4">
						<ul class="text-red-700 space-y-2 text-sm">
							<li>• Requests to communicate outside the platform</li>
							<li>• Pressure to pay immediately or "hold" items</li>
							<li>• Prices significantly below market value</li>
							<li>• Poor quality photos or stock images</li>
							<li>• Vague or minimal item descriptions</li>
						</ul>
						<ul class="text-red-700 space-y-2 text-sm">
							<li>• New accounts with no reviews or history</li>
							<li>• Requests for personal information</li>
							<li>• Stories that seem too good to be true</li>
							<li>• Unwillingness to answer specific questions</li>
							<li>• Aggressive or inappropriate language</li>
						</ul>
					</div>
				</div>
			</section>

			<section>
				<h2 class="text-[length:var(--text-2xl)] font-semibold text-[color:var(--text-primary)] mb-6">Get Help</h2>
				<div class="bg-gray-50 rounded-lg p-6">
					<p>
						Our Trust & Safety team is here to help 24/7. Don't hesitate to reach out if you feel unsafe or encounter any issues.
					</p>
					<div class="grid md:grid-cols-2 gap-4">
						<div class="space-y-3">
							<div class="flex items-center space-x-3">
								<svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
								</svg>
								<div>
									<p class="font-medium text-sm">Emergency Issues</p>
									<a href="mailto:urgent@driplo.xyz" class="link text-sm">urgent@driplo.xyz</a>
								</div>
							</div>
							<div class="flex items-center space-x-3">
								<svg class="w-5 h-5 text-[color:var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
								</svg>
								<div>
									<p class="font-medium text-sm">General Support</p>
									<a href="mailto:support@driplo.xyz" class="link text-sm">support@driplo.xyz</a>
								</div>
							</div>
						</div>
						<div class="space-y-3">
							<div class="flex items-center space-x-3">
								<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
								</svg>
								<div>
									<p class="font-medium text-sm">Live Chat</p>
									<p class="text-gray-600 text-sm">Available 9 AM - 6 PM CET</p>
								</div>
							</div>
							<div class="flex items-center space-x-3">
								<svg class="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
								<div>
									<p class="font-medium text-sm">Help Center</p>
									<p class="text-gray-600 text-sm">Browse FAQs and guides</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<div class="pt-6 border-t flex gap-3">
				<Button variant="secondary" onclick={() => goto('/')}>
					Back to Home
				</Button>
				<Button variant="outline" onclick={() => goto('/terms')}>
					Terms & Conditions
				</Button>
			</div>
		</div>
	</div>
</div>