<script lang="ts">
	import { page } from '$app/state';
	import * as i18n from '@repo/i18n';
	import { SEOMetaTags } from '@repo/ui';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const pageTitle = 'Careers at Driplo - Join Our Team';
	const pageDescription = 'Explore career opportunities at Driplo. Join our mission to make sustainable fashion accessible across Bulgaria and the UK.';
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
<section class="bg-gradient-to-br from-purple-50 via-white to-blue-50 py-16 px-4">
	<div class="max-w-4xl mx-auto text-center">
		<h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
			Join <span class="text-purple-600">Driplo</span>
		</h1>
		<p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
			Help us build the future of sustainable fashion in Bulgaria and the UK.
			We're looking for passionate people who want to make a difference.
		</p>
		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<a href="#open-positions" class="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors">
				View Open Positions
			</a>
			<a href="#culture" class="inline-flex items-center justify-center px-6 py-3 bg-white text-purple-600 font-medium rounded-lg border border-purple-600 hover:bg-purple-50 transition-colors">
				Our Culture
			</a>
		</div>
	</div>
</section>

<!-- Why Join Section -->
<section class="py-16 px-4">
	<div class="max-w-6xl mx-auto">
		<h2 class="text-3xl font-bold text-center text-gray-900 mb-12">Why Work at Driplo?</h2>
		<div class="grid md:grid-cols-3 gap-8">
			<div class="text-center">
				<div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<span class="text-3xl">🌱</span>
				</div>
				<h3 class="text-xl font-semibold text-gray-900 mb-3">Make an Impact</h3>
				<p class="text-gray-600">
					Join a mission-driven company making fashion more sustainable and accessible to everyone.
				</p>
			</div>
			<div class="text-center">
				<div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<span class="text-3xl">🚀</span>
				</div>
				<h3 class="text-xl font-semibold text-gray-900 mb-3">Grow With Us</h3>
				<p class="text-gray-600">
					Learn from experienced mentors, take on new challenges, and develop your skills in a fast-growing startup.
				</p>
			</div>
			<div class="text-center">
				<div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<span class="text-3xl">🌍</span>
				</div>
				<h3 class="text-xl font-semibold text-gray-900 mb-3">Remote-First</h3>
				<p class="text-gray-600">
					Work from anywhere in Bulgaria or the UK. We believe in flexibility and work-life balance.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- Culture Section -->
<section id="culture" class="py-16 px-4 bg-gray-50">
	<div class="max-w-6xl mx-auto">
		<h2 class="text-3xl font-bold text-center text-gray-900 mb-12">Our Culture</h2>
		<div class="grid md:grid-cols-2 gap-12">
			<div>
				<h3 class="text-2xl font-semibold text-gray-900 mb-6">What We Value</h3>
				<div class="space-y-6">
					<div class="flex gap-4">
						<div class="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
							<span class="text-xl">🤝</span>
						</div>
						<div>
							<h4 class="font-semibold text-gray-900 mb-2">Collaboration</h4>
							<p class="text-gray-600">We work together, share knowledge, and support each other to achieve our goals.</p>
						</div>
					</div>
					<div class="flex gap-4">
						<div class="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
							<span class="text-xl">💡</span>
						</div>
						<div>
							<h4 class="font-semibold text-gray-900 mb-2">Innovation</h4>
							<p class="text-gray-600">We encourage new ideas, experiment boldly, and learn from our mistakes.</p>
						</div>
					</div>
					<div class="flex gap-4">
						<div class="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
							<span class="text-xl">🎯</span>
						</div>
						<div>
							<h4 class="font-semibold text-gray-900 mb-2">Ownership</h4>
							<p class="text-gray-600">We take responsibility for our work and are accountable for the results.</p>
						</div>
					</div>
					<div class="flex gap-4">
						<div class="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
							<span class="text-xl">❤️</span>
						</div>
						<div>
							<h4 class="font-semibold text-gray-900 mb-2">Customer Focus</h4>
							<p class="text-gray-600">Our users are at the center of everything we do. We listen, learn, and improve.</p>
						</div>
					</div>
				</div>
			</div>
			<div>
				<h3 class="text-2xl font-semibold text-gray-900 mb-6">Benefits & Perks</h3>
				<div class="bg-white p-6 rounded-xl shadow-sm space-y-4">
					<div class="flex items-center gap-3">
						<span class="text-green-600 text-xl">✓</span>
						<span class="text-gray-700">Competitive salary and equity</span>
					</div>
					<div class="flex items-center gap-3">
						<span class="text-green-600 text-xl">✓</span>
						<span class="text-gray-700">Flexible work hours</span>
					</div>
					<div class="flex items-center gap-3">
						<span class="text-green-600 text-xl">✓</span>
						<span class="text-gray-700">Remote work options</span>
					</div>
					<div class="flex items-center gap-3">
						<span class="text-green-600 text-xl">✓</span>
						<span class="text-gray-700">Health and wellness benefits</span>
					</div>
					<div class="flex items-center gap-3">
						<span class="text-green-600 text-xl">✓</span>
						<span class="text-gray-700">Professional development budget</span>
					</div>
					<div class="flex items-center gap-3">
						<span class="text-green-600 text-xl">✓</span>
						<span class="text-gray-700">Generous time off</span>
					</div>
					<div class="flex items-center gap-3">
						<span class="text-green-600 text-xl">✓</span>
						<span class="text-gray-700">Team events and meetups</span>
					</div>
					<div class="flex items-center gap-3">
						<span class="text-green-600 text-xl">✓</span>
						<span class="text-gray-700">Latest equipment and tools</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Open Positions Section -->
<section id="open-positions" class="py-16 px-4">
	<div class="max-w-4xl mx-auto">
		<h2 class="text-3xl font-bold text-center text-gray-900 mb-12">Open Positions</h2>

		<div class="space-y-6">
			<div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
				<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<div>
						<h3 class="text-xl font-semibold text-gray-900 mb-2">Senior Frontend Developer</h3>
						<div class="flex flex-wrap gap-3 text-sm text-gray-600">
							<span class="flex items-center gap-1">
								<span class="text-gray-400">📍</span>
								Remote (Bulgaria/UK)
							</span>
							<span class="flex items-center gap-1">
								<span class="text-gray-400">💼</span>
								Full-time
							</span>
							<span class="flex items-center gap-1">
								<span class="text-gray-400">📊</span>
								Senior level
							</span>
						</div>
						<p class="text-gray-600 mt-3">
							We're looking for an experienced frontend developer to help build amazing user experiences using SvelteKit, TypeScript, and modern web technologies.
						</p>
					</div>
					<a href="/careers/senior-frontend-developer" class="inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors">
						Apply Now
					</a>
				</div>
			</div>

			<div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
				<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<div>
						<h3 class="text-xl font-semibold text-gray-900 mb-2">Community Manager</h3>
						<div class="flex flex-wrap gap-3 text-sm text-gray-600">
							<span class="flex items-center gap-1">
								<span class="text-gray-400">📍</span>
								Remote (Bulgaria/UK)
							</span>
							<span class="flex items-center gap-1">
								<span class="text-gray-400">💼</span>
								Full-time
							</span>
							<span class="flex items-center gap-1">
								<span class="text-gray-400">📊</span>
								Mid level
							</span>
						</div>
						<p class="text-gray-600 mt-3">
							Help us build and engage our community of fashion lovers across Bulgaria and the UK. Perfect for someone passionate about sustainable fashion.
						</p>
					</div>
					<a href="/careers/community-manager" class="inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors">
						Apply Now
					</a>
				</div>
			</div>

			<div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
				<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<div>
						<h3 class="text-xl font-semibold text-gray-900 mb-2">Customer Support Specialist</h3>
						<div class="flex flex-wrap gap-3 text-sm text-gray-600">
							<span class="flex items-center gap-1">
								<span class="text-gray-400">📍</span>
								Remote (Bulgaria/UK)
							</span>
							<span class="flex items-center gap-1">
								<span class="text-gray-400">💼</span>
								Full-time
							</span>
							<span class="flex items-center gap-1">
								<span class="text-gray-400">📊</span>
								Entry level
							</span>
						</div>
						<p class="text-gray-600 mt-3">
							Be the face of Driplo and help our users have amazing experiences. Great communication skills and empathy required.
						</p>
					</div>
					<a href="/careers/customer-support" class="inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors">
						Apply Now
					</a>
				</div>
			</div>
		</div>

		<div class="mt-12 bg-purple-50 p-8 rounded-xl text-center">
			<h3 class="text-2xl font-semibold text-gray-900 mb-4">Don't See Your Dream Role?</h3>
			<p class="text-gray-600 mb-6">
				We're always looking for talented people to join our team. Send us your resume and tell us why you'd be a great fit.
			</p>
			<a href="mailto:careers@driplo.xyz" class="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors">
				Send Your Resume
			</a>
		</div>
	</div>
</section>

<!-- Hiring Process Section -->
<section class="py-16 px-4 bg-gray-50">
	<div class="max-w-4xl mx-auto">
		<h2 class="text-3xl font-bold text-center text-gray-900 mb-12">Our Hiring Process</h2>
		<div class="grid md:grid-cols-4 gap-6">
			<div class="text-center">
				<div class="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
					1
				</div>
				<h3 class="font-semibold text-gray-900 mb-2">Application</h3>
				<p class="text-gray-600 text-sm">Submit your resume and cover letter</p>
			</div>
			<div class="text-center">
				<div class="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
					2
				</div>
				<h3 class="font-semibold text-gray-900 mb-2">Screening Call</h3>
				<p class="text-gray-600 text-sm">30-minute video call with our team</p>
			</div>
			<div class="text-center">
				<div class="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
					3
				</div>
				<h3 class="font-semibold text-gray-900 mb-2">Technical Interview</h3>
				<p class="text-gray-600 text-sm">Role-specific assessment or case study</p>
			</div>
			<div class="text-center">
				<div class="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
					4
				</div>
				<h3 class="font-semibold text-gray-900 mb-2">Final Interview</h3>
				<p class="text-gray-600 text-sm">Meet the team and culture fit discussion</p>
			</div>
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="py-16 px-4 bg-gradient-to-r from-purple-600 to-blue-600">
	<div class="max-w-4xl mx-auto text-center">
		<h2 class="text-3xl font-bold text-white mb-6">Ready to Join Our Team?</h2>
		<p class="text-xl text-purple-100 mb-8">
			Help us build the future of sustainable fashion. We can't wait to hear from you.
		</p>
		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<a href="#open-positions" class="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
				Browse Open Positions
			</a>
			<a href="mailto:careers@driplo.xyz" class="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-semibold rounded-lg border-2 border-white hover:bg-white hover:text-purple-600 transition-colors">
				Contact Recruiting
			</a>
		</div>
	</div>
</section>