import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { messagingLogger } from '$lib/utils/log';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  product_id?: string | null;
  content: string;
  created_at: string;
  is_read?: boolean;
  delivered_at?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  sender?: any;
  receiver?: any;
  product?: any;
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
  lastMessage?: string;
  lastMessageTime?: string;
  unread: boolean;
  lastActiveAt?: string;
  isProductConversation: boolean;
  messageCache: Set<string>;
}

export class ConversationService {
  private conversations = new Map<string, Conversation>();
  private messageChannel: RealtimeChannel | null = null;
  private callbacks = new Map<string, (data: any) => void>();
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private updateQueue = new Map<string, any>();
  private __lastUpdateTime = 0; // Future use for performance tracking

  constructor(
    private supabase: SupabaseClient,
    private userId: string
  ) {}

  // Initialize conversations from server data (messages or conversation summaries)
  initializeConversations(data: Message[] | any[], dataType: 'messages' | 'conversations' = 'messages'): void {
    const convMap = new Map<string, Conversation>();
    
    if (dataType === 'conversations') {
      // Initialize from pre-processed conversation summaries (much faster)
      data.forEach((conv: any) => {
        convMap.set(conv.id, {
          id: conv.id,
          userId: conv.userId,
          userName: conv.userName,
          userAvatar: conv.userAvatar,
          productId: conv.productId,
          productTitle: conv.productTitle,
          productImage: conv.productImage,
          productPrice: conv.productPrice || 0,
          messages: [], // Will be loaded on demand
          lastMessage: conv.lastMessage || 'Start a conversation...',
          lastMessageTime: conv.lastMessageTime,
          unread: (conv.unreadCount || 0) > 0,
          lastActiveAt: conv.lastActiveAt,
          isProductConversation: conv.isProductConversation || false,
          messageCache: new Set()
        });
      });
    } else {
      // Legacy message-based initialization (for specific conversation view)
      const messages = data as Message[];
      messages.forEach(msg => {
        const otherUserId = msg.sender_id === this.userId ? msg.receiver_id : msg.sender_id;
        const productId = msg.product_id;
        const key = `${otherUserId}__${productId || 'general'}`;
        
        if (!convMap.has(key)) {
          const otherUser = msg.sender_id === this.userId ? msg.receiver : msg.sender;
          const product = msg.product;
          
          convMap.set(key, {
            id: key,
            userId: otherUserId,
            userName: otherUser?.username || otherUser?.full_name || 'Unknown User',
            userAvatar: otherUser?.avatar_url,
            productId: productId,
            productTitle: product?.title || null,
            productImage: product?.images?.[0]?.image_url || null,
            productPrice: product?.price || 0,
            messages: [msg],
            lastMessage: msg.content,
            lastMessageTime: msg.created_at,
            unread: !msg.is_read && msg.sender_id !== this.userId,
            lastActiveAt: otherUser?.last_active_at,
            isProductConversation: !!productId,
            messageCache: new Set([msg.id])
          });
        } else {
          const conv = convMap.get(key)!;
          if (!conv.messageCache.has(msg.id)) {
            conv.messages.push(msg);
            conv.messageCache.add(msg.id);
            
            // Update with latest message
            if (new Date(msg.created_at) > new Date(conv.lastMessageTime || 0)) {
              conv.lastMessage = msg.content;
              conv.lastMessageTime = msg.created_at;
            }
            
            if (!msg.is_read && msg.sender_id !== this.userId) {
              conv.unread = true;
            }
          }
        }
      });
      
      // Sort messages chronologically within each conversation
      convMap.forEach(conv => {
        conv.messages.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      });
    }
    
    this.conversations = convMap;
    this.notify('conversations_updated', Array.from(this.conversations.values()));
  }

  // Get all conversations sorted by most recent
  getConversations(): Conversation[] {
    return Array.from(this.conversations.values())
      .sort((a, b) => 
        new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime()
      );
  }

  // Get specific conversation
  getConversation(conversationId: string): Conversation | null {
    return this.conversations.get(conversationId) || null;
  }

  // Add message to conversation (simplified - no debouncing for better UX)
  addMessage(conversationId: string, message: Message): void {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      // Create new conversation if it doesn't exist
      const otherUserId = message.sender_id === this.userId ? message.receiver_id : message.sender_id;
      const otherUser = message.sender_id === this.userId ? message.receiver : message.sender;
      
      const newConversation: Conversation = {
        id: conversationId,
        userId: otherUserId,
        userName: otherUser?.username || otherUser?.full_name || 'Unknown User',
        userAvatar: otherUser?.avatar_url,
        productId: message.product_id,
        productTitle: message.product?.title || null,
        productImage: message.product?.images?.[0]?.image_url || null,
        productPrice: message.product?.price || 0,
        messages: [message],
        lastMessage: message.content,
        lastMessageTime: message.created_at,
        unread: !message.is_read && message.sender_id !== this.userId,
        lastActiveAt: otherUser?.last_active_at,
        isProductConversation: !!message.product_id,
        messageCache: new Set([message.id])
      };
      
      this.conversations.set(conversationId, newConversation);
      this.notify('conversations_updated', this.getConversations());
      return;
    }
    
    // Add to existing conversation
    if (!conversation.messageCache.has(message.id)) {
      conversation.messages.push(message);
      conversation.messageCache.add(message.id);
      conversation.lastMessage = message.content;
      conversation.lastMessageTime = message.created_at;
      
      // Update unread status
      if (!message.is_read && message.sender_id !== this.userId) {
        conversation.unread = true;
      }
      
      // Immediate update for better UX
      this.notify('conversation_updated', conversation);
      this.notify('conversations_updated', this.getConversations());
    }
  }

  // Send message optimistically
  async sendMessage(conversationId: string, content: string): Promise<boolean> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return false;

    // Create optimistic message
    const optimisticMessage: Message = {
      id: crypto.randomUUID(),
      sender_id: this.userId,
      receiver_id: conversation.userId,
      product_id: conversation.productId === 'general' ? null : conversation.productId,
      content: content.trim(),
      created_at: new Date().toISOString(),
      status: 'sending'
    };

    // Add optimistically
    this.addMessage(conversationId, optimisticMessage);

    try {
      // Send to database
      const { error } = await this.supabase
        .from('messages')
        .insert({
          sender_id: this.userId,
          receiver_id: conversation.userId,
          product_id: conversation.productId === 'general' ? null : conversation.productId,
          content: content.trim()
        });

      if (error) throw error;
      
      // Update status
      const msg = conversation.messages.find(m => m.id === optimisticMessage.id);
      if (msg) {
        msg.status = 'sent';
        this.notify('conversation_updated', conversation);
      }
      
      return true;
    } catch (error) {
      // Remove optimistic message on error
      conversation.messages = conversation.messages.filter(m => m.id !== optimisticMessage.id);
      conversation.messageCache.delete(optimisticMessage.id);
      this.notify('conversation_updated', conversation);
      return false;
    }
  }

  // Load older messages for conversation
  async loadOlderMessages(conversationId: string, beforeTime: string): Promise<boolean> {
    const [otherUserId, productId] = conversationId.split('__');
    
    let query = this.supabase
      .from('messages_with_details' as any)
      .select('*')
      .or(`and(sender_id.eq.${this.userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${this.userId})`)
      .lt('created_at', beforeTime)
      .order('created_at', { ascending: false })
      .limit(20) as any;
    
    if (productId === 'general') {
      query = query.is('product_id', null);
    } else {
      query = query.eq('product_id', productId);
    }
    
    const { data: olderMessages, error } = await query;
    
    if (error || !olderMessages || olderMessages.length === 0) {
      return false;
    }
    
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      // Add older messages to beginning
      const newMessages = olderMessages.reverse().filter((msg: Message) => !conversation.messageCache.has(msg.id));
      newMessages.forEach((msg: Message) => conversation.messageCache.add(msg.id));
      
      conversation.messages = [...newMessages, ...conversation.messages];
      this.notify('conversation_updated', conversation);
    }
    
    return olderMessages.length === 20; // Has more if we got full batch
  }

  // Setup real-time subscriptions with better error handling
  setupRealtimeSubscriptions(): void {
    if (this.messageChannel) {
      this.cleanup();
    }

    // Notify connecting status
    this.notify('connection_status', {
      status: 'connecting',
      message: 'Connecting...',
      canRetry: false
    });

    this.messageChannel = this.supabase
      .channel(`user-messages-${this.userId}`, {
        config: {
          presence: {
            key: this.userId
          }
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${this.userId}`
      }, this.handleRealtimeMessage.bind(this))
      .on('postgres_changes', {
        event: 'INSERT', 
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${this.userId}`
      }, this.handleRealtimeMessage.bind(this))
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${this.userId}`
      }, this.handleMessageUpdate.bind(this))
      .subscribe((status, error) => {
        messagingLogger.info('Realtime subscription status', { status, error: error?.message || String(error), userId: this.userId });
        
        if (error) {
          messagingLogger.error('Realtime subscription error', error, {
            userId: this.userId,
            reconnectAttempts: this.reconnectAttempts
          });
          this.notify('connection_error', {
            message: 'Connection lost. Retrying...',
            canRetry: true
          });
          this.handleReconnection();
        } else if (status === 'SUBSCRIBED') {
          this.reconnectAttempts = 0;
          messagingLogger.info('Successfully subscribed to realtime messages', { userId: this.userId });
          // Notify successful connection
          this.notify('connection_status', {
            status: 'connected',
            message: 'Connected',
            canRetry: false
          });
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          this.notify('connection_status', {
            status: 'error',
            message: 'Connection failed. Retrying...',
            canRetry: true
          });
          this.handleReconnection();
        }
      });
  }

  private async handleRealtimeMessage(payload: any): Promise<void> {
    try {
      if (payload.eventType === 'INSERT') {
        const newMessage = payload.new;
        if (!newMessage || !newMessage.created_at) return;

        // Enrich message with user data if needed (lightweight lookup)
        if (!newMessage.sender && !newMessage.receiver) {
          // Fetch minimal user data for the message
          const { data: profiles } = await this.supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url, last_active_at')
            .in('id', [newMessage.sender_id, newMessage.receiver_id]);
          
          if (profiles) {
            newMessage.sender = profiles.find(p => p.id === newMessage.sender_id);
            newMessage.receiver = profiles.find(p => p.id === newMessage.receiver_id);
          }
        }

        const conversationId = this.getConversationId(newMessage);
        
        // Add message to conversation (will create if doesn't exist)
        this.addMessage(conversationId, newMessage);
        
        // Mark as delivered if we received it (non-blocking)
        if (newMessage.receiver_id === this.userId && newMessage.sender_id !== this.userId) {
          // Fire and forget - no await needed
          void this.supabase.rpc('mark_message_delivered' as any, {
            p_message_id: newMessage.id
          });
        }
      }
    } catch (error) {
      messagingLogger.error('Error handling realtime message', error, {
        userId: this.userId,
        messageId: payload?.new?.id
      });
    }
  }
  
  // Handle message updates (read status changes, etc.)
  private handleMessageUpdate(payload: any): void {
    try {
      if (payload.eventType === 'UPDATE') {
        const updatedMessage = payload.new;
        const conversationId = this.getConversationId(updatedMessage);
        const conversation = this.conversations.get(conversationId);
        
        if (conversation) {
          const messageIndex = conversation.messages.findIndex(m => m.id === updatedMessage.id);
          if (messageIndex >= 0) {
            // Update the message in place
            conversation.messages[messageIndex] = { ...conversation.messages[messageIndex], ...updatedMessage };
            this.notify('conversation_updated', conversation);
          }
        }
      }
    } catch (error) {
      messagingLogger.error('Error handling message update', error, {
        userId: this.userId,
        messageId: payload?.new?.id
      });
    }
  }

  private getConversationId(message: Message): string {
    const otherUserId = message.sender_id === this.userId 
      ? message.receiver_id 
      : message.sender_id;
    return `${otherUserId}__${message.product_id || 'general'}`;
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
      
      messagingLogger.info(`Attempting to reconnect realtime (attempt ${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})`, {
        userId: this.userId,
        delay
      });
      
      setTimeout(() => this.setupRealtimeSubscriptions(), delay);
    } else {
      messagingLogger.error('Max reconnection attempts reached', {
        userId: this.userId,
        maxAttempts: this.MAX_RECONNECT_ATTEMPTS
      });
      
      // Notify UI of connection issues
      this.notify('connection_error', {
        message: 'Connection lost. Please refresh to reconnect.',
        canRetry: false
      });
    }
  }

  // Event system for UI updates
  on(event: string, callback: (data: any) => void): void {
    this.callbacks.set(event, callback);
  }

  private notify(event: string, data: any): void {
    const callback = this.callbacks.get(event);
    if (callback) {
      callback(data);
    }
  }

  // Cleanup
  async cleanup(): Promise<void> {
    try {
      if (this.messageChannel) {
        await this.supabase.removeChannel(this.messageChannel);
        this.messageChannel = null;
      }
      
      // Clear all state
      this.conversations.clear();
      this.callbacks.clear();
      this.updateQueue.clear();
      this.reconnectAttempts = 0;
      this._lastUpdateTime = 0;
    } catch (error) {
      messagingLogger.error('Error during cleanup', error, {
        userId: this.userId
      });
    }
  }
}