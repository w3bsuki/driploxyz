import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals: { supabase }, cookies }) => {
  console.log('[API SIGNUP] Signup endpoint called');
  
  try {
    const { email, password, fullName } = await request.json();
    
    console.log('[API SIGNUP] Attempting signup for:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
    
    if (error) {
      console.log('[API SIGNUP] Auth error:', error.message);
      return json({ 
        success: false, 
        error: error.message 
      }, { status: 400 });
    }
    
    if (!data.user) {
      console.log('[API SIGNUP] No user in response');
      return json({ 
        success: false, 
        error: 'Failed to create account' 
      }, { status: 400 });
    }
    
    console.log('[API SIGNUP] Signup successful for user:', data.user.id);
    
    // Create profile
    try {
      const username = `user_${data.user.id.substring(0, 8)}`;
      await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          username,
          full_name: fullName,
          locale: 'en',
          onboarding_completed: false
        });
    } catch (profileErr) {
      console.log('[API SIGNUP] Profile creation failed (non-fatal):', profileErr);
    }
    
    return json({ 
      success: true,
      user: data.user,
      requiresVerification: true
    });
    
  } catch (e: any) {
    console.error('[API SIGNUP] Exception:', e);
    return json({ 
      success: false, 
      error: 'Server error' 
    }, { status: 500 });
  }
};