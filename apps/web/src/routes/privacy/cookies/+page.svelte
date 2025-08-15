<script lang="ts">
	import { Button } from '@repo/ui';
	import { goto } from '$app/navigation';
</script>

<div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-3xl mx-auto">
		<h1 class="text-3xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
		
		<div class="bg-white shadow rounded-lg p-6 space-y-6">
			<section>
				<h2 class="text-xl font-semibold mb-3">What are cookies?</h2>
				<p class="text-gray-600">
					Cookies are small text files that are placed on your device when you visit our website. 
					They help us provide you with a better experience by remembering your preferences and 
					understanding how you use our platform.
				</p>
			</section>

			<section>
				<h2 class="text-xl font-semibold mb-3">Types of cookies we use</h2>
				
				<div class="space-y-4">
					<div>
						<h3 class="font-medium text-gray-900">Necessary Cookies</h3>
						<p class="text-gray-600 text-sm mt-1">
							Essential for the website to function properly. These include authentication cookies 
							and security features.
						</p>
					</div>
					
					<div>
						<h3 class="font-medium text-gray-900">Functional Cookies</h3>
						<p class="text-gray-600 text-sm mt-1">
							Enable enhanced functionality like remembering your language preferences and 
							personalizing your experience.
						</p>
					</div>
					
					<div>
						<h3 class="font-medium text-gray-900">Analytics Cookies</h3>
						<p class="text-gray-600 text-sm mt-1">
							Help us understand how visitors interact with our website, allowing us to improve 
							our services.
						</p>
					</div>
					
					<div>
						<h3 class="font-medium text-gray-900">Marketing Cookies</h3>
						<p class="text-gray-600 text-sm mt-1">
							Used to track visitors across websites to display relevant advertisements.
						</p>
					</div>
				</div>
			</section>

			<section>
				<h2 class="text-xl font-semibold mb-3">Managing cookies</h2>
				<p class="text-gray-600">
					You can manage your cookie preferences at any time through our cookie consent banner, 
					which appears when you first visit our site. You can also manage cookies through your 
					browser settings, though this may affect your experience on our platform.
				</p>
			</section>

			<section>
				<h2 class="text-xl font-semibold mb-3">Third-party cookies</h2>
				<p class="text-gray-600">
					We use services from third parties like Stripe for payments and Supabase for authentication. 
					These services may set their own cookies. Please refer to their respective privacy policies 
					for more information.
				</p>
			</section>

			<section>
				<h2 class="text-xl font-semibold mb-3">Updates to this policy</h2>
				<p class="text-gray-600">
					We may update this Cookie Policy from time to time. The latest version will always be 
					available on this page. Last updated: {new Date().toLocaleDateString()}.
				</p>
			</section>

			<div class="pt-6 border-t">
				<Button variant="secondary" onclick={() => goto('/')}>
					Back to Home
				</Button>
			</div>
		</div>
	</div>
</div>