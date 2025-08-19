import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { RESEND_API_KEY } from '$env/static/private';
import { dev } from '$app/environment';

const DEBUG = dev;

export const POST: RequestHandler = async ({ request, locals: { supabase } }) => {
  if (DEBUG) console.log('[SEND_VERIFICATION] Endpoint called');
  
  try {
    const { email, userId } = await request.json();
    
    if (!email || !userId) {
      return json({ error: 'Missing email or userId' }, { status: 400 });
    }
    
    // Generate a verification token using Supabase Admin API
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError || !user) {
      if (DEBUG) console.log('[SEND_VERIFICATION] User not found:', userError);
      return json({ error: 'User not found' }, { status: 404 });
    }
    
    // Use Supabase's built-in resend confirmation email
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    });
    
    if (error) {
      if (DEBUG) console.log('[SEND_VERIFICATION] Resend error:', error);
      return json({ error: error.message }, { status: 400 });
    }
    
    if (DEBUG) console.log('[SEND_VERIFICATION] Verification email sent to:', email);
    
    return json({ success: true, message: 'Verification email sent' });
    
  } catch (e: any) {
    console.error('[SEND_VERIFICATION] Exception:', e);
    return json({ error: 'Failed to send verification email' }, { status: 500 });
  }
};