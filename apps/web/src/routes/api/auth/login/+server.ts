import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    // Parse request body
    const body = await request.json().catch(e => {
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
      return json({ 
        success: false, 
        error: error.message 
      }, { status: 401 });
    }
    
    return json({ 
      success: true,
      user: data.user,
      message: 'Login successful'
    });
    
  } catch (e: any) {
    console.error('[API LOGIN] Unexpected error:', e);
    return json({ 
      success: false, 
      error: e.message || 'Internal server error' 
    }, { status: 500 });
  }
};