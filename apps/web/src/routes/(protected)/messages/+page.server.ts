import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase }, url, parent, depends }) => {
  depends('messages:all');
  depends('messages:pagination');
  
  const { user } = await parent();

  if (!user) {
    throw redirect(303, '/login');
  }

  // Get conversation params from URL
  const searchParams = url.searchParams;
  const conversationParam = searchParams.get('conversation');
  
  
  // Implement pagination for better performance
  let messages;
  let messagesError;
  
  if (conversationParam) {
    // If viewing a specific conversation, load only the most recent messages
    const parts = conversationParam.split('__');
    const [otherUserId, productId] = parts.length >= 2 ? parts : [parts[0], 'general'];
    
    // Fix the product_id filter - PostgreSQL doesn't accept string 'null' as UUID null
    let query = supabase
      .from('messages_with_details' as any)
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: false })
      .limit(20) as any;
    
    // Apply product_id filter correctly
    if (productId === 'general') {
      query = query.is('product_id', null);
    } else {
      query = query.eq('product_id', productId);
    }
    
    const { data, error } = await query;
      
    // Reverse messages so oldest is first (for chronological display in chat)
    messages = data ? data.reverse() : [];
    messagesError = error;
  } else {
    // For conversation list, only load recent messages for preview building
    const { data, error } = await supabase
      .from('messages_with_details' as any)
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(50) as any; // Reduced from 100 to 50 for better performance
      
    messages = data; // Keep in descending order for conversation list building
    messagesError = error;
  }
  
  if (messagesError) {
    console.error('Error fetching messages:', messagesError);
  }

  // ALWAYS fetch conversation user/product info if we have a conversation param
  let conversationUser = null;
  let conversationProduct = null;
  
  if (conversationParam) {
    const parts = conversationParam.split('__');
    const [sellerId, productId] = parts.length >= 2 ? parts : [parts[0], 'general'];
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (sellerId && uuidRegex.test(sellerId)) {
      // Fetch seller info
      const { data: sellerData } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, last_active_at')
        .eq('id', sellerId)
        .single();
      
      conversationUser = sellerData;
    }
    
    // Fetch product info if provided and not general
    if (productId && productId !== 'general' && uuidRegex.test(productId)) {
      const { data: productData } = await supabase
        .from('products')
        .select(`
          id,
          title,
          price,
          images:product_images (
            image_url,
            display_order
          )
        `)
        .eq('id', productId)
        .single();
      
      conversationProduct = productData;
    }
  }

  // Update user's last active time
  await supabase
    .from('profiles')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', user.id);

  // Mark messages as read using the optimized function
  if (conversationParam && messages) {
    const parts = conversationParam.split('__');
    const [otherUserId, productId] = parts.length >= 2 ? parts : [parts[0], 'general'];
    
    // Use the database function to mark messages as read - fix UUID handling
    try {
      await supabase.rpc('mark_messages_as_read' as any, {
        p_sender_id: otherUserId,
        p_product_id: productId === 'general' ? null : productId
      });
    } catch (error: any) {
      // Mark as read failed (non-critical) - fail silently
    }
  }

  // Count unread messages for the user
  const { count: unreadCount } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', user.id)
    .eq('is_read', false);

  return {
    messages: messages || [],
    conversationUser,
    conversationProduct,
    conversationParam,
    unreadCount: unreadCount || 0,
    isPaginated: true,
    hasSpecificConversation: !!conversationParam,
    messageLimit: conversationParam ? 20 : 50, // Track pagination limit for client-side loading
    loadTime: Date.now() // Performance tracking
  };
};

export const actions: Actions = {
  sendMessage: async ({ request, locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    const user = session?.user;
    
    if (!user) {
      return fail(401, { error: 'Unauthorized' });
    }

    const formData = await request.formData();
    const message = formData.get('message') as string;
    const receiverId = formData.get('receiverId') as string;
    const productId = formData.get('productId') as string;

    if (!message?.trim()) {
      return fail(400, { error: 'Message cannot be empty' });
    }

    if (!receiverId) {
      return fail(400, { error: 'Receiver ID is required' });
    }

    // Insert the message
    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        content: message.trim(),
        product_id: productId || null
      });

    if (error) {
      console.error('Error sending message:', error);
      return fail(500, { error: 'Failed to send message' });
    }

    return { success: true };
  }
};