import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals: { supabase } }) => {
	try {
		const { email } = await request.json();
		
		if (!email) {
			return json({ error: 'Email is required' }, { status: 400 });
		}
		
		// Resend verification email using Supabase Auth
		const { error } = await supabase.auth.resend({
			type: 'signup',
			email,
			options: {
				emailRedirectTo: `${new URL(request.url).origin}/auth/callback`
			}
		});
		
		if (error) {
			console.error('Error resending verification email:', error);
			return json({ error: error.message }, { status: 400 });
		}
		
		return json({ success: true, message: 'Verification email sent successfully' });
	} catch (error) {
		console.error('Server error:', error);
		return json({ error: 'Failed to resend verification email' }, { status: 500 });
	}
};