import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

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

  constructor(
    private supabase: SupabaseClient,
    private userId: string
  ) {}

  // Initialize conversations from server data
  initializeConversations(messages: Message[]): void {
    const convMap = new Map<string, Conversation>();
    
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

  // Add message to conversation with debouncing
  private lastUpdateTime = 0;
  private updateQueue = new Set<string>();
  
  addMessage(conversationId: string, message: Message): void {
    const conversation = this.conversations.get(conversationId);
    if (conversation && !conversation.messageCache.has(message.id)) {
      conversation.messages.push(message);
      conversation.messageCache.add(message.id);
      conversation.lastMessage = message.content;
      conversation.lastMessageTime = message.created_at;
      
      // Debounced updates to prevent excessive re-renders
      this.updateQueue.add(conversationId);
      this.debouncedUpdate();
    }
  }

  private debouncedUpdate(): void {
    const now = Date.now();
    if (now - this.lastUpdateTime < 100) { // 100ms debounce
      return;
    }
    
    this.lastUpdateTime = now;
    setTimeout(() => {
      if (this.updateQueue.size > 0) {
        this.notify('conversations_updated', this.getConversations());
        this.updateQueue.clear();
      }
    }, 50);
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

  // Setup real-time subscriptions
  setupRealtimeSubscriptions(): void {
    if (this.messageChannel) {
      this.cleanup();
    }

    this.messageChannel = this.supabase
      .channel(`user-messages-${this.userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${this.userId}`
      }, this.handleRealtimeMessage.bind(this))
      .on('postgres_changes', {
        event: '*', 
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${this.userId}`
      }, this.handleRealtimeMessage.bind(this))
      .subscribe((status, error) => {
        if (error) {
          console.error('Realtime subscription error:', error);
          this.handleReconnection();
        } else if (status === 'SUBSCRIBED') {
          this.reconnectAttempts = 0;
        }
      });
  }

  private async handleRealtimeMessage(payload: any): Promise<void> {
    try {
      if (payload.eventType === 'INSERT') {
        const newMessage = payload.new;
        if (!newMessage || !newMessage.created_at) return;

        // Use payload data directly (already has all needed info from realtime)
        const conversationId = this.getConversationId(newMessage);
        
        // Only process if we don't already have this message
        const conversation = this.conversations.get(conversationId);
        if (conversation && !conversation.messageCache.has(newMessage.id)) {
          this.addMessage(conversationId, newMessage);
          
          // Mark as delivered if we received it (non-blocking)
          if (newMessage.receiver_id === this.userId && newMessage.sender_id !== this.userId) {
            setTimeout(async () => {
              try {
                await this.supabase.rpc('mark_message_delivered', {
                  p_message_id: newMessage.id
                });
              } catch (error) {
                // Non-critical - fail silently
              }
            }, 100);
          }
        }
      }
    } catch (error) {
      console.error('Error handling realtime message:', error);
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
      setTimeout(() => this.setupRealtimeSubscriptions(), delay);
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
      this.lastUpdateTime = 0;
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}