import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    // First check if we can read the request
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
    
    // Check if supabase is available
    if (!locals.supabase) {
      console.error('[API LOGIN] Supabase client not available');
      return json({ 
        success: false, 
        error: 'Auth service unavailable' 
      }, { status: 503 });
    }
    
    // Try to login
    const { data, error } = await locals.supabase.auth.signInWithPassword({
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