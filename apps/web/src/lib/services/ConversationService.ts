import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { messagingLogger } from '$lib/utils/log';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  product_id?: string | null;
  order_id?: string | null;
  content: string;
  created_at: string;
  is_read?: boolean;
  delivered_at?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  sender?: any;
  receiver?: any;
  product?: any;
  order?: any;
  message_type?: 'user' | 'system' | 'order_update';
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
  orderId?: string | null;
  orderStatus?: string;
  orderTotal?: number;
  messages: Message[];
  lastMessage?: string;
  lastMessageTime?: string;
  unread: boolean;
  lastActiveAt?: string;
  isProductConversation: boolean;
  isOrderConversation: boolean;
}

/**
 * Simplified ConversationService following Vinted/Messenger pattern:
 * - Server does all the heavy lifting
 * - Client just listens for notifications and refreshes data
 * - Simple polling fallback for reliability
 * - Stateless client approach
 */
export class ConversationService {
  private messageChannel: RealtimeChannel | null = null;
  private callbacks = new Map<string, (data: any) => void>();
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 3;
  private pollingInterval: NodeJS.Timeout | null = null;
  private lastFetch = 0;
  private isOnline = true;

  constructor(
    private supabase: SupabaseClient,
    private userId: string
  ) {
    // Listen for network changes
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.setupRealtimeSubscriptions();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.cleanup();
      });
    }
  }

  /**
   * Set up simple realtime subscription - just listen for "you have a new message" events
   */
  setupRealtimeSubscriptions(): void {
    if (!this.isOnline || this.messageChannel) {
      return;
    }

    this.notify('connection_status', {
      status: 'connecting',
      message: 'Connecting to messaging...',
      canRetry: false
    });

    this.messageChannel = this.supabase
      .channel(`user-notifications-${this.userId}`)
      .on('broadcast', { event: 'message_received' }, (payload) => {
        // Only process if it's for this user
        if (payload.payload.for_user === this.userId) {
          messagingLogger.info('Received message notification', {
            conversationId: payload.payload.conversation_id,
            messageId: payload.payload.message?.id
          });
          
          // Just notify UI to refresh - server has all the data
          this.notify('new_message', {
            conversationId: payload.payload.conversation_id,
            message: payload.payload.message
          });
        }
      })
      .subscribe((status, error) => {
        messagingLogger.info('Realtime subscription status', { status, error: error?.message });
        
        if (error) {
          this.handleConnectionError(error);
        } else if (status === 'SUBSCRIBED') {
          this.reconnectAttempts = 0;
          this.notify('connection_status', {
            status: 'connected',
            message: 'Connected',
            canRetry: false
          });
          this.startPolling(); // Start polling as fallback
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          this.handleConnectionError(new Error(`Connection ${status}`));
        }
      });
  }

  /**
   * Send message using Edge Function (server-side processing)
   */
  async sendMessage(conversationId: string, content: string): Promise<boolean> {
    const [receiverId, productId] = conversationId.split('__');
    
    if (!content.trim() || receiverId === this.userId) {
      return false;
    }

    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (!session) {
        messagingLogger.error('No session for sending message');
        return false;
      }

      const response = await fetch('/functions/v1/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          receiverId,
          productId: productId === 'general' ? null : productId,
          content: content.trim()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        messagingLogger.error('Failed to send message via Edge Function', error);
        return false;
      }

      const result = await response.json();
      messagingLogger.info('Message sent successfully', { 
        conversationId: result.conversation_id,
        messageId: result.message?.id 
      });
      
      return true;
    } catch (error) {
      messagingLogger.error('Error sending message', error);
      return false;
    }
  }

  /**
   * Load conversations from server - always fetch fresh data
   */
  async loadConversations(): Promise<Conversation[]> {
    try {
      // Rate limit: don't fetch more than once per 2 seconds (but allow first call)
      const now = Date.now();
      if (this.lastFetch > 0 && now - this.lastFetch < 2000) {
        messagingLogger.debug('Rate limited conversation fetch', { 
          timeSinceLastFetch: now - this.lastFetch 
        });
        return [];
      }
      this.lastFetch = now;

      const { data, error } = await this.supabase.rpc('get_user_conversations', {
        p_user_id: this.userId,
        p_limit: 50
      });

      if (error) {
        messagingLogger.error('Failed to load conversations', error);
        return [];
      }

      messagingLogger.info('Loaded conversations from server', { 
        conversationCount: data?.length || 0,
        userId: this.userId 
      });

      // Transform to expected format
      const conversations: Conversation[] = (data || []).map((conv: any) => ({
        id: conv.conversation_id,
        userId: conv.other_user_id,
        userName: conv.other_user_name,
        userAvatar: conv.other_user_avatar,
        lastActiveAt: conv.other_user_last_active,
        productId: conv.product_id,
        productTitle: conv.product_title,
        productPrice: conv.product_price,
        productImage: conv.product_image,
        orderId: conv.order_id,
        orderStatus: conv.order_status,
        orderTotal: conv.order_total,
        lastMessage: conv.last_message,
        lastMessageTime: conv.last_message_time,
        unread: (conv.unread_count || 0) > 0,
        isProductConversation: conv.is_product_conversation,
        isOrderConversation: !!conv.order_id,
        messages: [] // Will be loaded on demand
      }));

      return conversations;
    } catch (error) {
      messagingLogger.error('Error loading conversations', error);
      return [];
    }
  }

  /**
   * Load messages for specific conversation
   */
  async loadMessages(conversationId: string, limit = 30): Promise<Message[]> {
    try {
      const [otherUserId, productId] = conversationId.split('__');
      
      const { data, error } = await this.supabase.rpc('get_conversation_messages', {
        p_user_id: this.userId,
        p_other_user_id: otherUserId,
        p_product_id: productId === 'general' ? null : productId,
        p_limit: limit
      });

      if (error) {
        messagingLogger.error('Failed to load messages', error, { conversationId });
        return [];
      }

      // Transform messages to expected format
      const messages = (data || []).reverse().map((msg: any) => ({
        id: msg.id,
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        product_id: msg.product_id,
        order_id: msg.order_id,
        content: msg.content,
        created_at: msg.created_at,
        is_read: msg.is_read,
        status: msg.status,
        delivered_at: msg.delivered_at,
        read_at: msg.read_at,
        message_type: msg.message_type,
        sender: msg.sender_info,
        receiver: msg.receiver_info,
        order: msg.order_info
      }));

      // Mark messages as read (fire and forget)
      void this.markConversationRead(conversationId);

      return messages;
    } catch (error) {
      messagingLogger.error('Error loading messages', error, { conversationId });
      return [];
    }
  }

  /**
   * Load older messages for pagination
   */
  async loadOlderMessages(conversationId: string, beforeTime: string, limit = 20): Promise<Message[]> {
    try {
      const [otherUserId, productId] = conversationId.split('__');
      
      const { data, error } = await this.supabase.rpc('get_conversation_messages', {
        p_user_id: this.userId,
        p_other_user_id: otherUserId,
        p_product_id: productId === 'general' ? null : productId,
        p_before_time: beforeTime,
        p_limit: limit
      });

      if (error || !data?.length) {
        return [];
      }

      return data.reverse().map((msg: any) => ({
        id: msg.id,
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        product_id: msg.product_id,
        order_id: msg.order_id,
        content: msg.content,
        created_at: msg.created_at,
        is_read: msg.is_read,
        status: msg.status,
        delivered_at: msg.delivered_at,
        read_at: msg.read_at,
        message_type: msg.message_type,
        sender: msg.sender_info,
        receiver: msg.receiver_info,
        order: msg.order_info
      }));
    } catch (error) {
      messagingLogger.error('Error loading older messages', error);
      return [];
    }
  }

  /**
   * Mark conversation as read
   */
  private async markConversationRead(conversationId: string): Promise<void> {
    try {
      const [otherUserId, productId] = conversationId.split('__');
      
      await this.supabase.rpc('mark_conversation_read', {
        p_user_id: this.userId,
        p_other_user_id: otherUserId,
        p_product_id: productId === 'general' ? null : productId
      });
    } catch (error) {
      messagingLogger.error('Failed to mark conversation as read', error, { conversationId });
    }
  }

  /**
   * Simple polling fallback - refresh every 30 seconds
   */
  private startPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    this.pollingInterval = setInterval(() => {
      if (this.isOnline) {
        this.notify('poll_refresh', null);
      }
    }, 30000); // 30 seconds
  }

  /**
   * Handle connection errors with simple exponential backoff
   */
  private handleConnectionError(error: Error): void {
    messagingLogger.error('Realtime connection error', error);
    
    this.notify('connection_status', {
      status: 'error',
      message: 'Connection lost. Retrying...',
      canRetry: true
    });

    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
      
      setTimeout(() => {
        this.cleanup();
        this.setupRealtimeSubscriptions();
      }, delay);
    } else {
      this.notify('connection_status', {
        status: 'error',
        message: 'Connection failed. Using polling mode.',
        canRetry: false
      });
      // Continue with polling only
      this.startPolling();
    }
  }

  /**
   * Event system for UI updates
   */
  on(event: string, callback: (data: any) => void): void {
    this.callbacks.set(event, callback);
  }

  private notify(event: string, data: any): void {
    const callback = this.callbacks.get(event);
    if (callback) {
      callback(data);
    }
  }

  /**
   * Cleanup all resources
   */
  async cleanup(): Promise<void> {
    try {
      if (this.messageChannel) {
        await this.supabase.removeChannel(this.messageChannel);
        this.messageChannel = null;
      }
      
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }

      this.callbacks.clear();
      this.reconnectAttempts = 0;
    } catch (error) {
      messagingLogger.error('Error during cleanup', error);
    }
  }
}