import { redirect, fail } from '@sveltejs/kit';
import { CSRFProtection } from '$lib/server/csrf';
import type { Actions, PageServerLoad } from './$types';

export const load = (async (event) => {
  const { session } = await event.locals.safeGetSession();
  
  if (session) {
    throw redirect(303, '/');
  }
  
  // Generate CSRF token for the form
  const csrfToken = await CSRFProtection.getToken(event);
  
  return { csrfToken };
}) satisfies PageServerLoad;

export const actions = {
  reset: async (event) => {
    // CSRF Protection - must be first
    const isValidCSRF = await CSRFProtection.check(event);
    if (!isValidCSRF) {
      return fail(403, { 
        error: 'Security validation failed. Please refresh the page and try again.'
      });
    }

    const { request, locals: { supabase }, url } = event;
    

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
      
      return fail(400, {
        error: error.message,
        email
      });
    }

    return {
      success: true
    };
  }
} satisfies Actions;