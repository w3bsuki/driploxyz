import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { Message, Conversation, UserInfo } from '$lib/services/ConversationService';
import type { Database } from '@repo/database';
import type { PostgrestError } from '@supabase/supabase-js';

type ConversationMessageRow = Database['public']['Functions']['get_conversation_messages_secure']['Returns'][number];
type ConversationSummaryRow = Database['public']['Functions']['get_user_conversations_secure']['Returns'][number];

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
  let messagesError: PostgrestError | null = null;
  
  if (conversationParam) {
    // Load specific conversation messages using optimized function
    const parts = conversationParam.split('__');
    const [otherUserId] = parts.length >= 2 ? parts : [parts[0]];
    
    // Validate UUID format for security
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (otherUserId && uuidRegex.test(otherUserId)) {
      const { data, error } = await supabase.rpc('get_conversation_messages_secure', {
        conversation_id: conversationParam,
        other_user_id: otherUserId
      });

      if (!error && isConversationMessageRows(data)) {
        const ordered = [...data].reverse();
        messages = ordered.map(transformMessageRow);
      }

      messagesError = error;
    }
  } else {
    // Load conversation summaries using optimized function
    const { data, error } = await supabase.rpc('get_user_conversations_secure', {
      user_id: user.id,
      conv_limit: 50
    });

    // Transform conversation summaries into expected format for ConversationService
    conversations = isConversationSummaryRows(data)
      ? data.map((conv) => transformConversationRow(conv, user.id))
      : [];

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
        conversation_id: conversationParam,
        user_id: user.id
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

function transformMessageRow(row: ConversationMessageRow): Message {
  const senderProfile = row.sender_profile;
  const sender: UserInfo | undefined = senderProfile
    ? {
        id: senderProfile.id,
        username: senderProfile.username,
        avatar_url: senderProfile.avatar_url ?? undefined
      }
    : undefined;

  return {
    id: row.id,
    sender_id: row.sender_id,
    receiver_id: row.receiver_id,
    product_id: null,
    order_id: null,
    content: row.content,
    created_at: row.created_at,
    is_read: row.read,
    status: row.read ? 'read' : 'sent',
    message_type: 'user',
    sender
  };
}

function transformConversationRow(row: ConversationSummaryRow, currentUserId: string): Conversation {
  const otherParticipant = row.other_participant;
  const otherUserId = row.participant_one_id === currentUserId ? row.participant_two_id : row.participant_one_id;

  return {
    id: row.id,
    userId: otherUserId,
    userName: otherParticipant?.username ?? 'Unknown',
    userAvatar: otherParticipant?.avatar_url ?? null,
    productId: undefined,
    productTitle: undefined,
    productImage: undefined,
    productPrice: undefined,
    orderId: undefined,
    orderStatus: undefined,
    orderTotal: undefined,
    messages: [],
    lastMessage: row.last_message ?? '',
    lastMessageTime: row.last_message_at ?? row.created_at,
    unread: false,
    lastActiveAt: undefined,
    isProductConversation: false,
    isOrderConversation: false
  };
}

function isConversationMessageRows(data: unknown): data is ConversationMessageRow[] {
  return Array.isArray(data);
}

function isConversationSummaryRows(data: unknown): data is ConversationSummaryRow[] {
  return Array.isArray(data);
}
