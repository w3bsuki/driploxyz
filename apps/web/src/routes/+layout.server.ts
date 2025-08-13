import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession, supabase }, url }) => {
  const { session, user } = await safeGetSession();

  let profile = null;
  if (user && supabase) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data;
    
    // Redirect to onboarding if profile incomplete (but not if already on onboarding)
    if (profile && !profile.onboarding_completed && !url.pathname.startsWith('/onboarding')) {
      throw redirect(303, '/onboarding');
    }
  }

  return {
    session,
    user,
    profile,
    supabase: null, // We'll create browser client in +layout.ts
  };
};