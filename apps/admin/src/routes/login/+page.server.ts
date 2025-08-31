import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ url, locals }) => {
	const { user } = await locals.safeGetSession();
	
	// If already logged in and admin, redirect to dashboard
	if (user && locals.isAdmin) {
		throw redirect(303, '/');
	}

	return {
		expired: url.searchParams.get('expired') === 'true',
		ip: locals.ipAddress
	};
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email || !password) {
			return fail(400, {
				error: 'Email and password are required',
				ip: locals.ipAddress
			});
		}

		// Attempt to sign in
		const { error } = await locals.supabase.auth.signInWithPassword({
			email: email.toLowerCase().trim(),
			password
		});

		if (error) {
			console.error(`Failed login attempt for ${email} from IP ${locals.ipAddress}`);
			return fail(400, {
				error: 'Invalid email or password',
				ip: locals.ipAddress
			});
		}

		// The hooks.server.ts will handle admin verification
		// If user is not admin, they'll be signed out and get an error there
		throw redirect(303, '/');
	}
} satisfies Actions;