import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import * as Sentry from '@sentry/sveltekit';

export const POST: RequestHandler = async ({ request, cookies }) => {
  let body: any = null;
  
  try {
    // Parse request body
    body = await request.json().catch(e => {
      console.error('[API LOGIN] Failed to parse request:', e);
      return null;
    });
    
    if (!body) {
      return json({ 
        success: false, 
        error: 'Invalid request body' 
      }, { status: 400 });
    }
    
    const { email, password } = body;
    
    if (!email || !password) {
      return json({ 
        success: false, 
        error: 'Email and password required' 
      }, { status: 400 });
    }
    
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
    
    // Try to login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      // Map Supabase auth errors to user-friendly messages
      let userError = 'Invalid email or password';
      
      if (error.message.includes('Invalid login credentials')) {
        userError = 'Invalid email or password';
      } else if (error.message.includes('Email not confirmed')) {
        userError = 'Please verify your email address before signing in';
      } else if (error.message.includes('User not found')) {
        userError = 'No account found with this email address';
      } else if (error.message.includes('too many requests')) {
        userError = 'Too many login attempts. Please try again later';
      }
      
      
      return json({ 
        success: false, 
        error: userError
      }, { status: 401 });
    }
    
    return json({ 
      success: true,
      user: data.user,
      message: 'Login successful'
    });
    
  } catch (e: any) {
    // Capture error in Sentry (will be filtered for sensitive data)
    Sentry.captureException(e, {
      tags: { component: 'auth-login' },
      extra: { email: body?.email }
    });
    
    return json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
};