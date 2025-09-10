import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory rate limiting (for production, use Redis or KV store)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const RATE_LIMIT_MAX_MESSAGES = 60; // 60 messages per hour per user

function checkRateLimit(userId: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    // Reset or initialize rate limit
    rateLimitStore.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX_MESSAGES) {
    return { allowed: false, resetTime: userLimit.resetTime };
  }
  
  // Increment count
  userLimit.count++;
  return { allowed: true };
}

// Cleanup old entries periodically (simple memory management)
setInterval(() => {
  const now = Date.now();
  for (const [userId, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(userId);
    }
  }
}, 5 * 60 * 1000); // Cleanup every 5 minutes

interface SendMessageRequest {
  receiverId: string;
  productId?: string;
  orderId?: string;
  content: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role key for server-side operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create client with user's JWT for auth verification
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } }
      }
    );

    // Verify user authentication
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check rate limit for this user
    const rateLimitResult = checkRateLimit(user.id);
    if (!rateLimitResult.allowed) {
      const resetTime = new Date(rateLimitResult.resetTime!);
      console.warn('Rate limit exceeded for user:', {
        userId: user.id,
        resetTime: resetTime.toISOString()
      });
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Too many messages sent.',
          retryAfter: Math.ceil((rateLimitResult.resetTime! - Date.now()) / 1000)
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((rateLimitResult.resetTime! - Date.now()) / 1000).toString()
          } 
        }
      );
    }

    // Parse request body
    const { receiverId, productId, orderId, content }: SendMessageRequest = await req.json();

    // Validate input
    if (!receiverId || !content?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: receiverId and content' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prevent sending to self
    if (user.id === receiverId) {
      return new Response(
        JSON.stringify({ error: 'Cannot send message to yourself' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert message using service role (bypasses RLS for reliable insertion)
    const { data: message, error: insertError } = await supabaseAdmin
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        product_id: productId || null,
        order_id: orderId || null,
        content: content.trim(),
        message_type: 'user',
        status: 'sent'
      })
      .select(`
        id,
        sender_id,
        receiver_id,
        product_id,
        order_id,
        content,
        created_at,
        message_type,
        status,
        sender:profiles!sender_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (insertError) {
      console.error('Failed to insert message:', {
        error: insertError.message,
        code: insertError.code,
        userId: user.id,
        receiverId,
        productId,
        timestamp: new Date().toISOString()
      });
      return new Response(
        JSON.stringify({ error: 'Failed to send message' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send real-time notification via broadcast (ConversationService listens to this)
    const conversationId = productId ? `${receiverId}__${productId}` : `${receiverId}__general`;
    
    // Broadcast to receiver's notification channel
    await supabaseAdmin
      .channel(`user-notifications-${receiverId}`)
      .send({
        type: 'broadcast',
        event: 'message_received',
        payload: { 
          conversation_id: conversationId, 
          message: message,
          for_user: receiverId 
        }
      });

    // Update sender's last active time
    await supabaseAdmin
      .from('profiles')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', user.id);

    // Log successful message creation
    console.log('Message sent successfully:', {
      messageId: message.id,
      userId: user.id,
      receiverId,
      productId,
      conversationId,
      contentLength: content.length,
      timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: message,
        conversation_id: conversationId 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Send message error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});