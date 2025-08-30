import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase }, url, parent, depends }) => {
  depends('messages:conversations');
  depends('messages:specific');
  
  const { user } = await parent();

  if (!user) {
    throw redirect(303, '/login');
  }

  // Get conversation params from URL
  const searchParams = url.searchParams;
  const conversationParam = searchParams.get('conversation');
  
  let messages: any[] = [];
  let conversations: any[] = [];
  let messagesError = null;
  
  if (conversationParam) {
    // Load specific conversation messages using optimized function
    const parts = conversationParam.split('__');
    const [otherUserId, productId] = parts.length >= 2 ? parts : [parts[0], 'general'];
    
    // Validate UUID format for security
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (otherUserId && uuidRegex.test(otherUserId)) {
      const { data, error } = await supabase.rpc('get_conversation_messages' as any, {
        p_user_id: user.id,
        p_other_user_id: otherUserId,
        p_product_id: productId === 'general' ? null : productId,
        p_limit: 30
      });
      
      // Transform the function result to match expected format
      messages = data && Array.isArray(data) ? data.reverse().map((msg: any) => ({
        id: msg.id,
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        product_id: msg.product_id,
        content: msg.content,
        created_at: msg.created_at,
        is_read: msg.is_read,
        status: msg.status,
        delivered_at: msg.delivered_at,
        read_at: msg.read_at,
        sender: msg.sender_info,
        receiver: msg.receiver_info
      })) : [];
      
      messagesError = error;
    }
  } else {
    // Load conversation summaries using optimized function
    const { data, error } = await supabase.rpc('get_user_conversations' as any, {
      p_user_id: user.id,
      p_limit: 50
    });
    
    // Transform conversation summaries into expected format for ConversationService
    conversations = data && Array.isArray(data) ? data.map((conv: any) => ({
      id: conv.conversation_id,
      userId: conv.other_user_id,
      userName: conv.other_user_name,
      userAvatar: conv.other_user_avatar,
      lastActiveAt: conv.other_user_last_active,
      productId: conv.product_id,
      productTitle: conv.product_title,
      productPrice: conv.product_price,
      productImage: conv.product_image,
      lastMessage: conv.last_message,
      lastMessageTime: conv.last_message_time,
      unreadCount: conv.unread_count,
      isProductConversation: conv.is_product_conversation
    })) : [];
    
    messagesError = error;
  }
  
  if (messagesError) {
    console.error('Error fetching data:', messagesError);
  }

  // Fetch conversation context info if viewing specific conversation
  let conversationUser = null;
  let conversationProduct = null;
  
  if (conversationParam) {
    const parts = conversationParam.split('__');
    const [otherUserId, productId] = parts.length >= 2 ? parts : [parts[0], 'general'];
    
    // Validate UUID format for security
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (otherUserId && uuidRegex.test(otherUserId)) {
      // Fetch other user info
      const { data: userData } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, last_active_at')
        .eq('id', otherUserId)
        .single();
      
      conversationUser = userData;
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

  // Update user's last active time (non-blocking)
  supabase
    .from('profiles')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', user.id)
    .then(() => undefined).catch(() => undefined); // Fire and forget

  // Mark conversation as read if viewing specific conversation
  if (conversationParam && messages.length > 0) {
    const parts = conversationParam.split('__');
    const [otherUserId, productId] = parts.length >= 2 ? parts : [parts[0], 'general'];
    
    // Use optimized function to mark conversation as read (non-blocking)
    supabase.rpc('mark_conversation_read' as any, {
      p_user_id: user.id,
      p_other_user_id: otherUserId,
      p_product_id: productId === 'general' ? null : productId
    }).then(() => {}).catch(() => {}); // Fire and forget
  }

  // Get total unread count efficiently
  const { count: unreadCount } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', user.id)
    .eq('is_read', false);

  return {
    messages,
    conversations,
    conversationUser,
    conversationProduct,
    conversationParam,
    unreadCount: unreadCount || 0,
    hasSpecificConversation: !!conversationParam,
    loadTime: Date.now(),
    user: {
      id: user.id,
      username: user.user_metadata?.username,
      email: user.email
    }
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