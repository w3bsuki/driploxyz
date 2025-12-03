import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id?: string;
  content: string;
  created_at: string;
  updated_at?: string;
  is_read?: boolean;
  status?: string;
  message_type?: string;
  sender?: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  productId?: string | null;
  productTitle?: string | null;
  productImage?: string | null;
  productPrice?: number;
  messages: Message[];
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  lastActiveAt?: string;
  isProductConversation: boolean;
  isOrderConversation: boolean;
  isBuying?: boolean;
  isSelling?: boolean;
  isOffer?: boolean;
}

type ConnectionStatus = 'connected' | 'connecting' | 'error' | 'disconnected';

interface ConnectionStatusEvent {
  status: ConnectionStatus;
  message: string;
  canRetry: boolean;
}

interface NewMessageEvent {
  conversationId: string;
  message?: Message;
}

type EventCallback<T> = (data: T) => void;

interface EventListeners {
  connection_status: EventCallback<ConnectionStatusEvent>[];
  new_message: EventCallback<NewMessageEvent>[];
  poll_refresh: EventCallback<void>[];
}

/**
 * ConversationService - Full implementation with Supabase Realtime
 * 
 * Features:
 * - Real-time message subscriptions via Supabase broadcast channels
 * - Event emitter pattern for UI updates
 * - Message loading with pagination
 * - Send messages via Edge Function for rate limiting
 * - Connection status management with retry capability
 */
export class ConversationService {
  private eventListeners: EventListeners = {
    connection_status: [],
    new_message: [],
    poll_refresh: []
  };
  
  private notificationChannel: RealtimeChannel | null = null;
  private connectionStatus: ConnectionStatus = 'disconnected';
  private pollingInterval: ReturnType<typeof setInterval> | null = null;
  private readonly POLLING_INTERVAL_MS = 30000; // 30 second fallback polling
  
  constructor(
    private supabase: SupabaseClient,
    private userId: string
  ) {}

  /**
   * Register an event listener
   */
  on<K extends keyof EventListeners>(
    event: K,
    callback: EventListeners[K][number]
  ): void {
    this.eventListeners[event].push(callback as any);
  }

  /**
   * Remove an event listener
   */
  off<K extends keyof EventListeners>(
    event: K,
    callback: EventListeners[K][number]
  ): void {
    const listeners = this.eventListeners[event];
    const index = listeners.indexOf(callback as any);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Emit an event to all listeners
   */
  private emit<K extends keyof EventListeners>(
    event: K,
    data: Parameters<EventListeners[K][number]>[0]
  ): void {
    const listeners = this.eventListeners[event];
    for (const callback of listeners) {
      try {
        (callback as any)(data);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    }
  }

  /**
   * Update connection status and notify listeners
   */
  private updateConnectionStatus(
    status: ConnectionStatus,
    message: string,
    canRetry: boolean = false
  ): void {
    this.connectionStatus = status;
    this.emit('connection_status', { status, message, canRetry });
  }

  /**
   * Set up real-time subscriptions for incoming messages
   */
  setupRealtimeSubscriptions(): void {
    this.updateConnectionStatus('connecting', 'Connecting to realtime...');
    
    // Clean up existing subscription if any
    if (this.notificationChannel) {
      this.supabase.removeChannel(this.notificationChannel);
    }

    // Subscribe to user's notification channel for incoming messages
    // This channel receives broadcasts from the send-message Edge Function
    this.notificationChannel = this.supabase
      .channel(`user-notifications-${this.userId}`)
      .on('broadcast', { event: 'message_received' }, (payload) => {
        const { conversation_id, message } = payload.payload as {
          conversation_id: string;
          message: Message;
          for_user: string;
        };
        
        console.log('[ConversationService] Received message broadcast:', {
          conversationId: conversation_id,
          messageId: message?.id
        });
        
        this.emit('new_message', {
          conversationId: conversation_id,
          message
        });
      })
      .subscribe((status) => {
        console.log('[ConversationService] Channel status:', status);
        
        switch (status) {
          case 'SUBSCRIBED':
            this.updateConnectionStatus('connected', 'Connected to realtime');
            // Clear polling when connected
            this.stopPolling();
            break;
          case 'CHANNEL_ERROR':
            this.updateConnectionStatus('error', 'Connection error', true);
            // Start polling as fallback
            this.startPolling();
            break;
          case 'TIMED_OUT':
            this.updateConnectionStatus('error', 'Connection timed out', true);
            this.startPolling();
            break;
          case 'CLOSED':
            this.updateConnectionStatus('disconnected', 'Disconnected');
            this.startPolling();
            break;
        }
      });
  }

  /**
   * Start fallback polling for when realtime connection fails
   */
  private startPolling(): void {
    if (this.pollingInterval) return;
    
    console.log('[ConversationService] Starting fallback polling');
    this.pollingInterval = setInterval(() => {
      this.emit('poll_refresh', undefined as any);
    }, this.POLLING_INTERVAL_MS);
  }

  /**
   * Stop fallback polling
   */
  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('[ConversationService] Stopped fallback polling');
    }
  }

  /**
   * Load all conversations for the current user
   */
  async loadConversations(): Promise<Conversation[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_user_conversations_secure', {
        conv_limit: 50
      });

      if (error) {
        console.error('[ConversationService] Error loading conversations:', error);
        return [];
      }

      if (!data || !Array.isArray(data)) {
        return [];
      }

      // Transform database records to Conversation interface
      return data.map((conv: any) => {
        const otherParticipant = conv.other_participant as any;
        const isParticipantOne = conv.participant_one_id === this.userId;
        const otherUserId = isParticipantOne ? conv.participant_two_id : conv.participant_one_id;

        return {
          id: conv.id,
          userId: otherUserId,
          userName: otherParticipant?.username || otherParticipant?.full_name || 'Unknown',
          userAvatar: otherParticipant?.avatar_url || undefined,
          lastActiveAt: otherParticipant?.last_active_at || undefined,
          productId: conv.product_id || null,
          productTitle: conv.product?.title || null,
          productImage: conv.product?.product_images?.[0]?.image_url || null,
          productPrice: conv.product?.price || undefined,
          messages: [],
          lastMessage: conv.last_message_content || '',
          lastMessageTime: conv.last_message_at || conv.created_at,
          unread: conv.unread_count > 0,
          isProductConversation: !!conv.product_id,
          isOrderConversation: !!conv.order_id,
          isBuying: false, // Would need to check buyer_id
          isSelling: false, // Would need to check seller_id
          isOffer: false
        };
      });
    } catch (error) {
      console.error('[ConversationService] Exception loading conversations:', error);
      return [];
    }
  }

  /**
   * Load messages for a specific conversation
   */
  async loadMessages(conversationId: string): Promise<Message[]> {
    try {
      // Parse conversation ID to get the other user ID
      // Format: "other_user_id__product_id" or "other_user_id__general"
      const parts = conversationId.split('__');
      const otherUserId = parts[0];

      if (!otherUserId) {
        console.error('[ConversationService] Invalid conversation ID:', conversationId);
        return [];
      }

      const { data, error } = await this.supabase.rpc('get_conversation_messages_secure', {
        other_user_id: otherUserId,
        limit_count: 50
      });

      if (error) {
        console.error('[ConversationService] Error loading messages:', error);
        return [];
      }

      if (!data || !Array.isArray(data)) {
        return [];
      }

      // Transform and reverse to get chronological order (oldest first)
      return data.reverse().map((msg: any) => ({
        id: msg.id,
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        content: msg.content,
        created_at: msg.created_at,
        is_read: msg.read || false,
        status: 'sent',
        message_type: 'user',
        sender: msg.sender_profile ? {
          id: (msg.sender_profile as any)?.id || msg.sender_id,
          username: (msg.sender_profile as any)?.username,
          full_name: (msg.sender_profile as any)?.full_name,
          avatar_url: (msg.sender_profile as any)?.avatar_url
        } : undefined
      }));
    } catch (error) {
      console.error('[ConversationService] Exception loading messages:', error);
      return [];
    }
  }

  /**
   * Load older messages for pagination
   */
  async loadOlderMessages(conversationId: string, before: string): Promise<Message[]> {
    try {
      const parts = conversationId.split('__');
      const otherUserId = parts[0];

      if (!otherUserId) {
        return [];
      }

      // Use direct query for pagination since RPC may not support 'before' parameter
      const { data, error } = await this.supabase
        .from('messages')
        .select(`
          id,
          sender_id,
          receiver_id,
          content,
          created_at,
          is_read,
          status,
          message_type,
          sender:profiles!sender_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .or(`and(sender_id.eq.${this.userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${this.userId})`)
        .lt('created_at', before)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('[ConversationService] Error loading older messages:', error);
        return [];
      }

      if (!data || !Array.isArray(data)) {
        return [];
      }

      // Reverse to get chronological order
      return data.reverse().map((msg: any) => ({
        id: msg.id,
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        content: msg.content,
        created_at: msg.created_at,
        is_read: msg.is_read || false,
        status: msg.status || 'sent',
        message_type: msg.message_type || 'user',
        sender: msg.sender ? {
          id: msg.sender.id,
          username: msg.sender.username,
          full_name: msg.sender.full_name,
          avatar_url: msg.sender.avatar_url
        } : undefined
      }));
    } catch (error) {
      console.error('[ConversationService] Exception loading older messages:', error);
      return [];
    }
  }

  /**
   * Send a message via Edge Function
   * The Edge Function handles rate limiting and realtime broadcast
   */
  async sendMessage(conversationId: string, content: string): Promise<boolean> {
    try {
      // Parse conversation ID
      const parts = conversationId.split('__');
      const receiverId = parts[0];
      const productId = parts[1] !== 'general' ? parts[1] : undefined;

      if (!receiverId || !content.trim()) {
        console.error('[ConversationService] Invalid send parameters');
        return false;
      }

      // Get auth session for the Edge Function
      const { data: { session } } = await this.supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.error('[ConversationService] No auth session for sending message');
        return false;
      }

      // Call the send-message Edge Function
      const response = await fetch(
        `${(this.supabase as any).supabaseUrl}/functions/v1/send-message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            receiverId,
            productId,
            content: content.trim()
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[ConversationService] Edge function error:', {
          status: response.status,
          error: errorData
        });
        return false;
      }

      const result = await response.json();
      console.log('[ConversationService] Message sent successfully:', result);
      return result.success === true;
    } catch (error) {
      console.error('[ConversationService] Exception sending message:', error);
      return false;
    }
  }

  /**
   * Clean up subscriptions and polling
   */
  cleanup(): void {
    console.log('[ConversationService] Cleaning up...');
    
    // Remove realtime subscription
    if (this.notificationChannel) {
      this.supabase.removeChannel(this.notificationChannel);
      this.notificationChannel = null;
    }
    
    // Stop polling
    this.stopPolling();
    
    // Clear event listeners
    this.eventListeners = {
      connection_status: [],
      new_message: [],
      poll_refresh: []
    };
    
    this.updateConnectionStatus('disconnected', 'Cleaned up');
  }
}