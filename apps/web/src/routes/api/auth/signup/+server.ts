import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createServerClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';
import { dev } from '$app/environment';

const DEBUG = dev;

export const POST: RequestHandler = async ({ request, cookies }) => {
  if (DEBUG) console.log('[API SIGNUP] Signup endpoint called');
  
  try {
    const { email, password, fullName } = await request.json();
    
    if (DEBUG) console.log('[API SIGNUP] Attempting signup');
    
    // Create Supabase client directly
    const supabase = createServerClient(
      env.PUBLIC_SUPABASE_URL,
      env.PUBLIC_SUPABASE_ANON_KEY,
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
      // Map Supabase signup errors to user-friendly messages
      let userError = 'Failed to create account';
      
      if (error.message.includes('User already registered')) {
        userError = 'An account with this email already exists';
      } else if (error.message.includes('Password should be at least')) {
        userError = 'Password must be at least 6 characters long';
      } else if (error.message.includes('Invalid email')) {
        userError = 'Please enter a valid email address';
      } else if (error.message.includes('too many requests')) {
        userError = 'Too many signup attempts. Please try again later';
      }
      
      
      return json({ 
        success: false, 
        error: userError 
      }, { status: 400 });
    }
    
    if (!data.user) {
      if (DEBUG) console.log('[API SIGNUP] No user in response');
      return json({ 
        success: false, 
        error: 'Failed to create account' 
      }, { status: 400 });
    }
    
    if (DEBUG) console.log('[API SIGNUP] Signup successful for user:', data.user.id);
    
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
      if (DEBUG) console.log('[API SIGNUP] Profile creation failed (non-fatal):', profileErr);
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