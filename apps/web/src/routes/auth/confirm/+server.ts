import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const token_hash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');
  const next = url.searchParams.get('next') ?? '/onboarding';
  
  console.log('[AUTH CONFIRM] Processing email verification');
  console.log('[AUTH CONFIRM] Token hash:', token_hash ? 'present' : 'missing');
  console.log('[AUTH CONFIRM] Type:', type);

  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });
    
    console.log('[AUTH CONFIRM] Verification result:', {
      success: !error,
      error: error?.message,
      user: data?.user?.email
    });

    if (!error && data.user) {
      // Force refresh session
      await supabase.auth.refreshSession();
      
      // Check or create profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', data.user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username: `user_${data.user.id.substring(0, 8)}`,
            full_name: data.user.user_metadata?.full_name || '',
            onboarding_completed: false
          });
        
        // New user - redirect to onboarding
        throw redirect(303, '/onboarding?verified=true&welcome=true');
      }

      // Check if onboarding is needed
      if (!profile || profile.onboarding_completed !== true) {
        throw redirect(303, '/onboarding?verified=true');
      }

      // Verification successful, user already onboarded
      throw redirect(303, '/dashboard?verified=true');
    }
    
    // Verification failed
    console.error('[AUTH CONFIRM] Verification failed:', error);
    throw redirect(303, '/login?error=verification_failed');
  }

  // Missing parameters
  console.error('[AUTH CONFIRM] Missing token_hash or type');
  throw redirect(303, '/login?error=invalid_verification_link');
};