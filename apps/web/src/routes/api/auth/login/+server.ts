import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals: { supabase } }) => {
  console.log('[API LOGIN] Login endpoint called');
  
  try {
    const { email, password } = await request.json();
    
    console.log('[API LOGIN] Attempting login for:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.log('[API LOGIN] Auth error:', error.message);
      return json({ 
        success: false, 
        error: error.message 
      }, { status: 400 });
    }
    
    if (!data.user || !data.session) {
      console.log('[API LOGIN] No user or session in response');
      return json({ 
        success: false, 
        error: 'Authentication failed' 
      }, { status: 400 });
    }
    
    console.log('[API LOGIN] Login successful for user:', data.user.id);
    
    // Check onboarding status
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', data.user.id)
      .single();
    
    return json({ 
      success: true,
      user: data.user,
      needsOnboarding: !profile?.onboarding_completed
    });
    
  } catch (e: any) {
    console.error('[API LOGIN] Exception:', e);
    return json({ 
      success: false, 
      error: 'Server error' 
    }, { status: 500 });
  }
};