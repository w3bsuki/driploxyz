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
  messageCache: Set<string>;
}

export class ConversationService {
  private conversations = new Map<string, Conversation>();
  private messageChannel: RealtimeChannel | null = null;
  private callbacks = new Map<string, (data: any) => void>();
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private updateQueue = new Map<string, any>();
  private connectionTimeout: NodeJS.Timeout | null = null;

  constructor(
    private supabase: SupabaseClient,
    private userId: string
  ) {}

  // Add a single conversation to the service
  addConversation(conversation: Conversation): void {
    this.conversations.set(conversation.id, conversation);
    messagingLogger.info('Added conversation to service', { 
      conversationId: conversation.id,
      userId: conversation.userId
    });
  }

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
          orderId: conv.orderId,
          orderStatus: conv.orderStatus,
          orderTotal: conv.orderTotal,
          messages: [], // Will be loaded on demand
          lastMessage: conv.lastMessage || 'Start a conversation...',
          lastMessageTime: conv.lastMessageTime,
          unread: (conv.unreadCount || 0) > 0,
          lastActiveAt: conv.lastActiveAt,
          isProductConversation: conv.isProductConversation || false,
          isOrderConversation: !!conv.orderId,
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
            orderId: msg.order_id,
            orderStatus: msg.order?.status,
            orderTotal: msg.order?.total_amount,
            messages: [msg],
            lastMessage: msg.content,
            lastMessageTime: msg.created_at,
            unread: !msg.is_read && msg.sender_id !== this.userId,
            lastActiveAt: otherUser?.last_active_at,
            isProductConversation: !!productId,
            isOrderConversation: !!msg.order_id,
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
        orderId: message.order_id,
        orderStatus: message.order?.status,
        orderTotal: message.order?.total_amount,
        messages: [message],
        lastMessage: message.content,
        lastMessageTime: message.created_at,
        unread: !message.is_read && message.sender_id !== this.userId,
        lastActiveAt: otherUser?.last_active_at,
        isProductConversation: !!message.product_id,
        isOrderConversation: !!message.order_id,
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
    if (!conversation) {
      messagingLogger.error('Conversation not found', { conversationId });
      return false;
    }

    const trimmedContent = content.trim();
    if (!trimmedContent || trimmedContent.length === 0) {
      messagingLogger.error('Empty message content', { conversationId, content });
      return false;
    }

    // Validate user IDs
    if (this.userId === conversation.userId) {
      messagingLogger.error('Cannot send message to self', { 
        senderId: this.userId, 
        receiverId: conversation.userId,
        conversationId 
      });
      return false;
    }

    // Create optimistic message
    const optimisticMessage: Message = {
      id: crypto.randomUUID(),
      sender_id: this.userId,
      receiver_id: conversation.userId,
      product_id: conversation.productId === 'general' ? null : conversation.productId,
      order_id: conversation.orderId,
      content: trimmedContent,
      created_at: new Date().toISOString(),
      status: 'sending'
    };

    // Add optimistically
    this.addMessage(conversationId, optimisticMessage);

    try {
      // Send to database
      const insertData = {
        sender_id: this.userId,
        receiver_id: conversation.userId,
        product_id: conversation.productId === 'general' ? null : conversation.productId,
        order_id: conversation.orderId,
        content: trimmedContent
      };

      messagingLogger.info('Attempting to send message', { 
        conversationId,
        receiverId: conversation.userId,
        productId: conversation.productId || undefined
      });

      const { error, data } = await this.supabase
        .from('messages')
        .insert([insertData])
        .select();

      if (error) {
        messagingLogger.error('Database insert failed', error, { 
          conversationId,
          receiverId: conversation.userId,
          productId: conversation.productId || undefined
        });
        throw error;
      }
      
      messagingLogger.info('Message sent successfully', { 
        conversationId,
        messageCount: data?.length || 0
      });

      // Replace optimistic message with real message to prevent duplicates
      if (data && data.length > 0) {
        const realMessage = data[0];
        // Remove optimistic message
        conversation.messages = conversation.messages.filter(m => m.id !== optimisticMessage.id);
        conversation.messageCache.delete(optimisticMessage.id);
        
        // Add real message if not already there (from real-time)
        if (!conversation.messageCache.has(realMessage.id)) {
          const processedMessage: Message = {
            ...realMessage,
            status: 'sent'
          };
          conversation.messages.push(processedMessage);
          conversation.messageCache.add(realMessage.id);
          conversation.lastMessage = realMessage.content;
          conversation.lastMessageTime = realMessage.created_at;
        }
        
        this.notify('conversation_updated', conversation);
      }
      
      return true;
    } catch (error) {
      messagingLogger.error('Failed to send message', { 
        error: error instanceof Error ? error.message : error,
        conversationId,
        senderId: this.userId,
        receiverId: conversation.userId
      });
      
      // Remove optimistic message on error
      conversation.messages = conversation.messages.filter(m => m.id !== optimisticMessage.id);
      conversation.messageCache.delete(optimisticMessage.id);
      this.notify('conversation_updated', conversation);
      return false;
    }
  }

  // Load older messages for conversation - progressive loading
  async loadOlderMessages(conversationId: string, beforeTime: string): Promise<boolean> {
    const [otherUserId, productId] = conversationId.split('__');
    
    // Use the same RPC function for consistency and better performance
    const { data: olderMessages, error } = await this.supabase.rpc('get_conversation_messages' as any, {
      p_user_id: this.userId,
      p_other_user_id: otherUserId,
      p_product_id: productId === 'general' ? null : productId,
      p_before_time: beforeTime,
      p_limit: 10  // Load 10 messages at a time for smooth scrolling
    });
    
    if (error || !olderMessages || olderMessages.length === 0) {
      messagingLogger.info('No more older messages to load', { 
        conversationId, 
        beforeTime, 
        error: error?.message 
      });
      return false;
    }
    
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      // Transform messages to match expected format (same as in page.server.ts)
      const processedMessages = olderMessages.reverse().map((msg: any) => ({
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
      
      // Add older messages to beginning, filtering out duplicates
      const newMessages = processedMessages.filter((msg: Message) => !conversation.messageCache.has(msg.id));
      newMessages.forEach((msg: Message) => conversation.messageCache.add(msg.id));
      
      conversation.messages = [...newMessages, ...conversation.messages];
      
      messagingLogger.info('Loaded older messages', { 
        conversationId, 
        newCount: newMessages.length,
        totalCount: conversation.messages.length
      });
      
      this.notify('conversation_updated', conversation);
    }
    
    return olderMessages.length === 10; // Has more if we got full batch
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

    // Add timeout for connection attempt
    this.connectionTimeout = setTimeout(() => {
      if (this.messageChannel && this.messageChannel.state !== 'joined') {
        messagingLogger.error('Realtime connection timed out', {
          userId: this.userId,
          channelState: this.messageChannel?.state
        });
        this.notify('connection_status', {
          status: 'error',
          message: 'Connection timeout. Retrying...',
          canRetry: true
        });
        this.handleReconnection();
      }
    }, 10000); // 10 second timeout

    this.messageChannel = this.supabase
      .channel(`user-messages-${this.userId}`)
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
        
        // Clear timeout on any status update
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        
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
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          this.notify('connection_status', {
            status: 'error',
            message: 'Connection failed. Retrying...',
            canRetry: true
          });
          this.handleReconnection();
        } else if (status === 'JOINING') {
          // Still connecting, update status
          this.notify('connection_status', {
            status: 'connecting',
            message: 'Connecting...',
            canRetry: false
          });
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

  // Create order-related conversation
  async createOrderConversation(params: {
    orderId: string;
    buyerId: string;
    sellerId: string;
    productId: string;
    initialMessage: string;
  }): Promise<boolean> {
    try {
      const { orderId, buyerId, sellerId, productId, initialMessage } = params;
      
      // Insert initial system message
      const { error } = await this.supabase
        .from('messages')
        .insert({
          sender_id: sellerId, // System message from seller perspective
          receiver_id: buyerId,
          product_id: productId,
          order_id: orderId,
          content: initialMessage,
          message_type: 'system'
        });

      if (error) {
        messagingLogger.error('Error creating order conversation', error, { orderId, buyerId, sellerId });
        return false;
      }

      messagingLogger.info('Order conversation created successfully', { orderId, buyerId, sellerId });
      return true;
    } catch (error) {
      messagingLogger.error('Error creating order conversation', error);
      return false;
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
      // Clear any pending timeout
      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
        this.connectionTimeout = null;
      }
      
      if (this.messageChannel) {
        await this.supabase.removeChannel(this.messageChannel);
        this.messageChannel = null;
      }
      
      // Clear all state
      this.conversations.clear();
      this.callbacks.clear();
      this.updateQueue.clear();
      this.reconnectAttempts = 0;
    } catch (error) {
      messagingLogger.error('Error during cleanup', error, {
        userId: this.userId
      });
    }
  }
}