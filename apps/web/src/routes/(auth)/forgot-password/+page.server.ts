import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { session } }) => {
  if (session) {
    throw redirect(303, '/');
  }
};

export const actions: Actions = {
  reset: async ({ request, locals: { supabase }, url }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;

    if (!email) {
      return fail(400, {
        error: 'Email is required',
        email
      });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${url.origin}/reset-password`
    });

    if (error) {
      console.error('Password reset error:', error);
      return fail(400, {
        error: error.message,
        email
      });
    }

    return {
      success: true
    };
  }
};