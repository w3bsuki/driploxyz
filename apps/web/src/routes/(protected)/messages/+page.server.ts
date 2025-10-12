import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { Message, Conversation, UserInfo } from '@repo/domain/conversations';
import type { Database } from '@repo/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

// These interfaces are no longer needed as we use 'any' type for RPC results

export const load = (async ({ locals: { supabase }, url, parent, depends }) => {
  depends('messages:conversations');
  depends('messages:specific');
  
  const { user } = await parent();

  if (!user) {
    redirect(303, '/login');
  }

  // Get conversation params from URL
  const searchParams = url.searchParams;
  const conversationParam = searchParams.get('conversation');
  
  let messages: Message[] = [];
  let conversations: Conversation[] = [];
  let messagesError = null;
  
  if (conversationParam) {
    // Load specific conversation messages using optimized function
    const parts = conversationParam.split('__');
    const [otherUserId] = parts.length >= 2 ? parts : [parts[0]];
    
    // Validate UUID format for security
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (otherUserId && uuidRegex.test(otherUserId)) {
      const { data, error } = await supabase.rpc('get_conversation_messages_secure', {
        other_user_id: otherUserId,
        limit_count: 50
      });
      
      // Transform the function result to match expected format
      messages = data && Array.isArray(data) ? data.reverse().map((msg) => ({
        id: msg.id,
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        product_id: null, // Not available in this RPC
        order_id: null, // Not available in this RPC
        content: msg.content,
        created_at: msg.created_at,
        is_read: msg.read || false,
        status: 'sent', // Default since not available in RPC
        delivered_at: undefined, // Not available in this RPC
        read_at: undefined, // Not available in this RPC
        message_type: 'user', // Default since not available in RPC
        sender: msg.sender_profile && typeof msg.sender_profile === 'object' ? { ...(msg.sender_profile as Record<string, unknown>), id: (msg.sender_profile as Record<string, unknown>)?.id as string || user.id } as UserInfo : undefined,
        receiver: undefined, // receiver_profile not available in this RPC
        order: undefined // order_details not available in this RPC
      })) : [];
      
      messagesError = error;
    }
  } else {
    // Load conversation summaries using optimized function
    const { data, error } = await supabase.rpc('get_user_conversations_secure', {
      conv_limit: 50
    });
    
    // Transform conversation summaries into expected format for ConversationService
    conversations = data && Array.isArray(data) ? data.map((conv) => ({
      id: conv.id,
      userId: conv.participant_one_id === user.id ? conv.participant_two_id : conv.participant_one_id,
      userName: conv.other_participant ? (conv.other_participant as Profile)?.username || 'Unknown' : 'Unknown',
      userAvatar: conv.other_participant ? (conv.other_participant as Profile)?.avatar_url || null : null,
      lastActiveAt: conv.other_participant ? (conv.other_participant as Profile)?.last_active_at || null : null,
      productId: undefined,
      productTitle: undefined,
      productPrice: undefined,
      productImage: undefined,
      orderId: undefined,
      orderStatus: undefined,
      orderTotal: undefined,
      lastMessage: conv.last_message_content || '',
      lastMessageTime: conv.last_message_at || conv.created_at,
      messages: [], // Messages loaded separately
      unread: false, // Unread counts not available in this RPC response
      isProductConversation: false,
      isOrderConversation: false
    })) as Conversation[] : [];
    
    messagesError = error;
  }
  
  if (messagesError) {
    console.error('Failed to load conversations:', messagesError);
  }

  // Fetch conversation context info if viewing specific conversation
  let conversationUser = null;
  const conversationProduct = null;
  
  if (conversationParam) {
    const parts = conversationParam.split('__');
    const [otherUserId] = parts.length >= 2 ? parts : [parts[0]];
    
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
    
    // Product information is no longer fetched in this simplified implementation
  }

  // Update user's last active time (non-blocking)
  void supabase
    .from('profiles')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', user.id); // Fire and forget

  // Mark conversation as read if viewing specific conversation
  if (conversationParam && messages.length > 0) {
    const parts = conversationParam.split('__');
    const [otherUserId] = parts.length >= 2 ? parts : [parts[0]];
    
    // Use optimized function to mark conversation as read (non-blocking)
    if (otherUserId) {
      void supabase.rpc('mark_conversation_read_secure', {
        other_user_id: otherUserId
      }); // Fire and forget
    }
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
}) satisfies PageServerLoad;

export const actions = {
  // Removed sendMessage action - all message sending now goes through Edge Function
  // for consistency, rate limiting, and proper real-time notifications
  // Use ConversationService.sendMessage() instead
} satisfies Actions;