import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const POST: RequestHandler = async ({ request, cookies }) => {
  console.log('[API SIGNUP] Signup endpoint called');
  
  try {
    const { email, password, fullName } = await request.json();
    
    console.log('[API SIGNUP] Attempting signup for:', email);
    
    // Create Supabase client directly
    const supabase = createServerClient(
      PUBLIC_SUPABASE_URL,
      PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookies.set(name, value, { ...options, path: '/' });
            });
          },
        },
      }
    );
    
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