import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/';
  
  if (!code) {
    throw error(400, 'No verification code provided');
  }

  try {
    const { error: authError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (authError) {
      console.error('Auth callback error:', authError);
      throw redirect(303, `/login?error=${encodeURIComponent(authError.message)}`);
    }

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw redirect(303, '/login?error=Unable to verify user');
    }

    // Check if user has completed onboarding
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single();

    // Redirect based on onboarding status
    if (!profile || !profile.onboarding_completed) {
      throw redirect(303, '/onboarding');
    }

    // Successfully verified - redirect to dashboard or next page
    throw redirect(303, next === '/' ? '/dashboard' : next);
  } catch (err) {
    console.error('Unexpected error in auth callback:', err);
    throw redirect(303, '/login?error=Verification failed');
  }
};