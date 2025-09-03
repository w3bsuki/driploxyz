<script lang="ts">
	import { Button } from '@repo/ui';
	import { goto } from '$app/navigation';
</script>

<svelte:head>
	<title>Terms & Conditions - Driplo</title>
	<meta name="description" content="Terms and conditions for using Driplo, the mobile-first clothing marketplace." />
</svelte:head>

<div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-4xl mx-auto">
		<h1 class="text-3xl font-bold text-gray-900 mb-8">Terms & Conditions</h1>
		
		<div class="bg-white shadow-sm rounded-lg p-6 prose prose-gray max-w-none">
			<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
				<p class="text-sm text-blue-800">
					<strong>Last updated:</strong> {new Date().toLocaleDateString()}
				</p>
			</div>

			<section>
				<h2>Agreement to Terms</h2>
				<p>
					Welcome to Driplo! These Terms & Conditions ("Terms") govern your use of our mobile-first C2C clothing 
					marketplace platform. By accessing or using Driplo, you agree to be bound by these Terms. If you 
					disagree with any part of these Terms, you may not access the platform.
				</p>
			</section>

			<section>
				<h2>Platform Overview</h2>
				<p>
					Driplo is a consumer-to-consumer (C2C) online marketplace where users can buy and sell pre-owned 
					and new clothing items. We provide the platform and tools, but we are not a party to the transactions 
					between buyers and sellers.
				</p>
				<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
					<p class="text-sm text-yellow-800">
						<strong>Important:</strong> Driplo facilitates transactions but is not responsible for the quality, 
						safety, or legality of items listed by users.
					</p>
				</div>
			</section>

			<section>
				<h2>User Accounts</h2>
				<div>
					<div>
						<h3>Account Requirements</h3>
						<ul>
							<li>You must be at least 18 years old to create an account</li>
							<li>You must provide accurate and complete information</li>
							<li>You are responsible for maintaining account security</li>
							<li>One account per person - multiple accounts are prohibited</li>
						</ul>
					</div>
					
					<div>
						<h3>Account Responsibilities</h3>
						<ul>
							<li>Keep your login credentials secure and confidential</li>
							<li>Notify us immediately of any unauthorized account access</li>
							<li>You are liable for all activities under your account</li>
							<li>Update your information to keep it current and accurate</li>
						</ul>
					</div>
				</div>
			</section>

			<section>
				<h2>Buying & Selling Rules</h2>
				
				<div>
					<div>
						<h3>For Sellers</h3>
						<ul>
							<li><strong>Item Authenticity:</strong> You must only sell authentic items and accurately describe their condition</li>
							<li><strong>Legal Ownership:</strong> You must own or have permission to sell all listed items</li>
							<li><strong>Accurate Descriptions:</strong> Provide honest, detailed descriptions and clear photos</li>
							<li><strong>Prohibited Items:</strong> No counterfeit goods, hazardous materials, or illegal items</li>
							<li><strong>Pricing:</strong> Set fair, reasonable prices for your items</li>
							<li><strong>Communication:</strong> Respond promptly to buyer inquiries</li>
							<li><strong>Shipping:</strong> Ship items within 3 business days of payment</li>
						</ul>
					</div>
					
					<div>
						<h3>For Buyers</h3>
						<ul>
							<li><strong>Payment Obligation:</strong> Complete payment for items you purchase</li>
							<li><strong>Communication:</strong> Communicate respectfully with sellers</li>
							<li><strong>Inspection Period:</strong> Inspect items upon delivery and report issues promptly</li>
							<li><strong>Return Policy:</strong> Follow our return procedures if items don't match descriptions</li>
							<li><strong>No Harassment:</strong> Respect seller decisions and platform policies</li>
						</ul>
					</div>
				</div>
			</section>

			<section>
				<h2>Prohibited Activities</h2>
				<p>
					The following activities are strictly prohibited on Driplo:
				</p>
				<ul>
					<li>Selling counterfeit, replica, or unauthorized goods</li>
					<li>Listing stolen or illegally obtained items</li>
					<li>Price manipulation or fraudulent pricing practices</li>
					<li>Creating fake accounts or impersonating others</li>
					<li>Harassment, bullying, or abusive behavior</li>
					<li>Attempting to complete transactions outside the platform</li>
					<li>Spam, unsolicited messages, or excessive communications</li>
					<li>Violating intellectual property rights</li>
					<li>Money laundering or other illegal financial activities</li>
				</ul>
			</section>

			<section>
				<h2>Payment & Fees</h2>
				<div>
					<div>
						<h3>Payment Processing</h3>
						<ul>
							<li>All payments are processed securely through Stripe</li>
							<li>We hold payments in escrow until the buyer confirms receipt</li>
							<li>Funds are released to sellers after successful delivery</li>
							<li>We support major credit cards and digital payment methods</li>
						</ul>
					</div>
					
					<div>
						<h3>Platform Fees</h3>
						<div class="bg-blue-50 rounded-lg p-4">
							<p class="text-blue-800 font-medium mb-2">Standard Commission Structure:</p>
							<ul class="text-blue-700 space-y-1">
								<li>• 5% commission on successful sales</li>
								<li>• No listing fees or hidden charges</li>
								<li>• Payment processing fees as per Stripe rates</li>
								<li>• Optional premium seller features available</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			<section>
				<h2>Dispute Resolution</h2>
				<div>
					<div>
						<h3>Our Resolution Process</h3>
						<ol>
							<li>Contact our support team within 48 hours of any issue</li>
							<li>Provide evidence including photos, messages, and documentation</li>
							<li>We'll investigate and mediate between parties</li>
							<li>Our decision is final and binding for platform-related disputes</li>
						</ol>
					</div>
					
					<div>
						<h3>Refund Policy</h3>
						<p>
							Refunds may be issued if items are significantly not as described, damaged in shipping, 
							or never delivered. Buyers must provide evidence and follow our return procedures.
						</p>
					</div>
				</div>
			</section>

			<section>
				<h2>Intellectual Property</h2>
				<p>
					All content on Driplo, including but not limited to text, graphics, logos, and software, 
					is the property of Driplo or its licensors and is protected by copyright and trademark laws.
				</p>
				<ul>
					<li>You may not copy, modify, or distribute our content without permission</li>
					<li>User-generated content remains owned by the user</li>
					<li>By posting content, you grant us a license to display and distribute it on our platform</li>
					<li>Respect the intellectual property rights of others</li>
				</ul>
			</section>

			<section>
				<h2>Platform Modifications</h2>
				<p>
					We reserve the right to modify, suspend, or discontinue any part of our platform at any time 
					without prior notice. We may also update these Terms periodically. Continued use of the platform 
					after changes constitutes acceptance of new Terms.
				</p>
			</section>

			<section>
				<h2>Limitation of Liability</h2>
				<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
					<p class="text-red-800 font-medium">
						Important Legal Notice:
					</p>
				</div>
				<p>
					Driplo provides the platform "as is" without warranties of any kind. We are not liable for:
				</p>
				<ul>
					<li>Quality, safety, or authenticity of items sold by users</li>
					<li>Actions or omissions of buyers and sellers</li>
					<li>Technical issues or platform downtime</li>
					<li>Indirect, incidental, or consequential damages</li>
					<li>Loss of profits, data, or business opportunities</li>
				</ul>
			</section>

			<section>
				<h2>Termination</h2>
				<p>
					We may terminate or suspend your account immediately for:
				</p>
				<ul>
					<li>Violation of these Terms or our policies</li>
					<li>Fraudulent, illegal, or harmful activities</li>
					<li>Multiple complaints or negative feedback</li>
					<li>Failure to pay fees or charges</li>
					<li>Inactivity for extended periods</li>
				</ul>
			</section>

			<section>
				<h2>Governing Law</h2>
				<p>
					These Terms are governed by the laws of Bulgaria. Any disputes will be resolved in the courts 
					of Sofia, Bulgaria. For EU residents, you may also have rights under your local consumer 
					protection laws.
				</p>
			</section>

			<section>
				<h2>Contact Information</h2>
				<div class="bg-gray-50 rounded-lg p-4">
					<p>
						Questions about these Terms? Contact us:
					</p>
					<ul>
						<li>Email: <a href="mailto:legal@driplo.xyz">legal@driplo.xyz</a></li>
						<li>Support: <a href="mailto:support@driplo.xyz">support@driplo.xyz</a></li>
						<li>Address: Driplo Ltd, Sofia, Bulgaria</li>
					</ul>
				</div>
			</section>

			<div class="pt-6 border-t flex gap-3">
				<Button variant="secondary" onclick={() => goto('/')}>
					Back to Home
				</Button>
				<Button variant="outline" onclick={() => goto('/privacy')}>
					Privacy Policy
				</Button>
			</div>
		</div>
	</div>
</div>