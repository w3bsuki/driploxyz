<script lang="ts">
	import { Button } from '@repo/ui';
	import { goto } from '$app/navigation';
</script>

<svelte:head>
	<title>Privacy Policy - Driplo</title>
	<meta name="description" content="Learn how Driplo protects your privacy and handles your personal data." />
</svelte:head>

<div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-4xl mx-auto">
		<h1 class="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
		
		<div class="bg-white shadow-sm rounded-lg p-6 space-y-6">
			<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
				<p class="text-sm text-blue-800">
					<strong>Last updated:</strong> {new Date().toLocaleDateString()}
				</p>
			</div>

			<section>
				<h2 class="text-2xl font-semibold mb-4">Introduction</h2>
				<p class="text-gray-600 leading-relaxed">
					Welcome to Driplo, a mobile-first C2C clothing marketplace. This Privacy Policy explains how we collect, 
					use, disclose, and safeguard your information when you use our platform. We are committed to protecting 
					your privacy and ensuring transparency in our data practices.
				</p>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">Information We Collect</h2>
				
				<div class="space-y-4">
					<div>
						<h3 class="text-lg font-medium text-gray-900 mb-2">Personal Information</h3>
						<ul class="list-disc pl-6 text-gray-600 space-y-1">
							<li>Name, email address, phone number</li>
							<li>Profile photos and personal descriptions</li>
							<li>Shipping and billing addresses</li>
							<li>Payment information (processed securely by Stripe)</li>
						</ul>
					</div>
					
					<div>
						<h3 class="text-lg font-medium text-gray-900 mb-2">Product Information</h3>
						<ul class="list-disc pl-6 text-gray-600 space-y-1">
							<li>Photos and descriptions of items you sell</li>
							<li>Purchase and sales history</li>
							<li>Messages between buyers and sellers</li>
							<li>Reviews and ratings</li>
						</ul>
					</div>
					
					<div>
						<h3 class="text-lg font-medium text-gray-900 mb-2">Usage Data</h3>
						<ul class="list-disc pl-6 text-gray-600 space-y-1">
							<li>Device information and browser type</li>
							<li>IP address and location data</li>
							<li>Pages visited and time spent on our platform</li>
							<li>Search queries and interaction patterns</li>
						</ul>
					</div>
				</div>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">How We Use Your Information</h2>
				<ul class="list-disc pl-6 text-gray-600 space-y-2">
					<li><strong>Platform Operation:</strong> Process transactions, facilitate communication between users</li>
					<li><strong>Account Management:</strong> Create and maintain your account, verify your identity</li>
					<li><strong>Customer Support:</strong> Respond to inquiries and resolve issues</li>
					<li><strong>Security:</strong> Detect fraud, prevent abuse, and protect user safety</li>
					<li><strong>Personalization:</strong> Customize your experience and show relevant content</li>
					<li><strong>Communications:</strong> Send transactional emails and important updates</li>
					<li><strong>Analytics:</strong> Improve our platform and develop new features</li>
				</ul>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">Information Sharing</h2>
				<p class="text-gray-600 mb-4">
					We do not sell your personal information. We may share your information in these limited circumstances:
				</p>
				<ul class="list-disc pl-6 text-gray-600 space-y-2">
					<li><strong>With Other Users:</strong> Your public profile and listings are visible to other users</li>
					<li><strong>Service Providers:</strong> Trusted partners who help operate our platform (Supabase, Stripe, etc.)</li>
					<li><strong>Legal Requirements:</strong> When required by law or to protect our rights and users</li>
					<li><strong>Business Transfers:</strong> In connection with a merger, sale, or acquisition</li>
					<li><strong>With Your Consent:</strong> Any other sharing with your explicit permission</li>
				</ul>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">Data Security</h2>
				<p class="text-gray-600 mb-4">
					We implement industry-standard security measures to protect your information:
				</p>
				<ul class="list-disc pl-6 text-gray-600 space-y-2">
					<li>SSL encryption for all data transmission</li>
					<li>Secure cloud infrastructure with Supabase</li>
					<li>PCI DSS compliant payment processing through Stripe</li>
					<li>Regular security audits and updates</li>
					<li>Access controls and authentication requirements</li>
				</ul>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">Your Rights</h2>
				<p class="text-gray-600 mb-4">
					You have the following rights regarding your personal information:
				</p>
				<ul class="list-disc pl-6 text-gray-600 space-y-2">
					<li><strong>Access:</strong> Request a copy of your personal data</li>
					<li><strong>Correction:</strong> Update or correct inaccurate information</li>
					<li><strong>Deletion:</strong> Request deletion of your personal data</li>
					<li><strong>Portability:</strong> Export your data in a structured format</li>
					<li><strong>Restriction:</strong> Limit how we process your data</li>
					<li><strong>Objection:</strong> Object to certain types of data processing</li>
				</ul>
				<p class="text-gray-600 mt-4">
					To exercise these rights, contact us at <a href="mailto:privacy@driplo.xyz" class="text-blue-600 hover:underline">privacy@driplo.xyz</a>
				</p>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
				<p class="text-gray-600 mb-4">
					We use cookies and similar technologies to enhance your experience. You can manage your cookie preferences 
					through our <a href="/privacy/cookies" class="text-blue-600 hover:underline font-medium">Cookie Policy</a> 
					and the cookie consent banner.
				</p>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">International Transfers</h2>
				<p class="text-gray-600">
					Your information may be transferred and processed in countries other than your own. We ensure appropriate 
					safeguards are in place to protect your data in accordance with this Privacy Policy and applicable laws, 
					including GDPR for European users.
				</p>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">Children's Privacy</h2>
				<p class="text-gray-600">
					Our platform is not intended for users under 18 years of age. We do not knowingly collect personal 
					information from children under 18. If you believe a child has provided us with personal information, 
					please contact us immediately.
				</p>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">Changes to This Policy</h2>
				<p class="text-gray-600">
					We may update this Privacy Policy from time to time. We will notify you of any material changes by 
					posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued use 
					of our platform after such changes constitutes acceptance of the updated policy.
				</p>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">Contact Us</h2>
				<div class="bg-gray-50 rounded-lg p-4">
					<p class="text-gray-600 mb-2">
						If you have questions about this Privacy Policy, please contact us:
					</p>
					<ul class="text-gray-600 space-y-1">
						<li>Email: <a href="mailto:privacy@driplo.xyz" class="text-blue-600 hover:underline">privacy@driplo.xyz</a></li>
						<li>Support: <a href="mailto:support@driplo.xyz" class="text-blue-600 hover:underline">support@driplo.xyz</a></li>
						<li>Address: Driplo Ltd, Sofia, Bulgaria</li>
					</ul>
				</div>
			</section>

			<div class="pt-6 border-t flex gap-3">
				<Button variant="secondary" onclick={() => goto('/')}>
					Back to Home
				</Button>
				<Button variant="outline" onclick={() => goto('/privacy/cookies')}>
					Cookie Policy
				</Button>
			</div>
		</div>
	</div>
</div>