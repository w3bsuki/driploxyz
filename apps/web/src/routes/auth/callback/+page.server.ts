import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
	const code = url.searchParams.get('code');
	const next = url.searchParams.get('next') ?? '/';

	if (code) {
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		if (!error) {
			// Get the user to check if they've completed onboarding
			const { data: { user } } = await supabase.auth.getUser();
			
			if (user) {
				// Check if user has completed onboarding
				const { data: profile } = await supabase
					.from('profiles')
					.select('onboarding_completed, username')
					.eq('id', user.id)
					.single();
				
				// If they haven't completed onboarding, send them there
				if (profile && !profile.onboarding_completed) {
					throw redirect(303, '/onboarding');
				}
				
				// Otherwise go to the intended destination
				throw redirect(303, next);
			}
		}
	}

	// If there's an error or no code, redirect to home
	throw redirect(303, '/');
};