<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
  import { dev } from '$app/environment';
  
  interface Props {
    supabase: SupabaseClient;
    user: any;
    messages: any[];
    onMessageChange: (messages: any[]) => void;
    onConnectionStatusChange: (status: 'connected' | 'connecting' | 'disconnected') => void;
    onOnlineUsersChange: (users: Set<string>) => void;
    onTypingUsersChange?: (users: Map<string, any>) => void;
  }
  
  let { supabase, user, messages, onMessageChange, onConnectionStatusChange, onOnlineUsersChange, onTypingUsersChange }: Props = $props();
  
  // Single subscription channels - prevent duplicates
  let messageChannel: RealtimeChannel | null = null;
  let presenceChannel: RealtimeChannel | null = null;
  let reconnectAttempts = 0;
  const MAX_RECONNECT_ATTEMPTS = 5;
  let isCleanupMode = false;
  
  // Development-only logging
  function logDebug(message: string, data?: any) {
    if (dev) {
      console.log(message, data);
    }
  }
  
  // Production-safe error logging
  function logError(message: string, error?: any) {
    console.error(message, error);
  }
  
  // Optimized message handler - reduced database calls
  async function handleMessageChange(payload: any) {
    if (isCleanupMode) return; // Ignore events during cleanup
    
    logDebug('📨 Real-time event:', { 
      type: payload.eventType, 
      messageId: payload.new?.id || payload.old?.id,
      sender: payload.new?.sender_id,
      receiver: payload.new?.receiver_id
    });
    
    try {
      if (payload.eventType === 'INSERT') {
        const newMessage = payload.new;
        if (!newMessage) return;
        
        // Quick user relevance check - avoid unnecessary processing
        if (newMessage.sender_id !== user.id && newMessage.receiver_id !== user.id) {
          logDebug('Message not for current user, ignoring');
          return;
        }
        
        // Don't skip real database inserts - they will have created_at
        // Only skip if it's clearly an optimistic message without proper timestamp
        if (!newMessage.created_at) {
          logDebug('Skipping message without timestamp:', newMessage.id);
          return;
        }
        
        // Check for duplicates before expensive database query
        const messageExists = messages.some(m => m.id === newMessage.id);
        if (messageExists) {
          logDebug('Duplicate message prevented:', newMessage.id);
          return;
        }
        
        logDebug('📩 Processing new real-time message:', newMessage.id);
        
        // Fetch full message details - single query
        const { data: fullMessage, error } = await supabase
          .from('messages_with_details')
          .select('*')
          .eq('id', newMessage.id)
          .single();
        
        if (error) {
          logError('Error fetching message details:', error);
          
          // Fallback with basic info to prevent message loss
          const fallbackMessage = {
            ...newMessage,
            sender: null,
            receiver: null,
            product: null
          };
          
          const updatedMessages = [...messages, fallbackMessage];
          onMessageChange(updatedMessages);
          return;
        }
        
        if (fullMessage) {
          logDebug('📬 Adding real-time message:', fullMessage.id);
          const updatedMessages = [...messages, fullMessage];
          onMessageChange(updatedMessages);
          
          // Mark as delivered asynchronously - don't block UI
          if (newMessage.receiver_id === user.id && newMessage.sender_id !== user.id) {
            supabase.rpc('mark_message_delivered', {
              p_message_id: newMessage.id
            }).catch(() => {
              logDebug('Message delivery marking failed - function may not exist');
            });
          }
        }
      } 
      else if (payload.eventType === 'UPDATE') {
        const updatedMessage = payload.new;
        if (!updatedMessage) return;
        
        // Find and update the message in place - avoid database query if possible
        const messageIndex = messages.findIndex(m => m.id === updatedMessage.id);
        if (messageIndex >= 0) {
          // For simple updates like read status, use payload data
          if (updatedMessage.is_read !== undefined) {
            const updatedMessages = [...messages];
            updatedMessages[messageIndex] = { ...updatedMessages[messageIndex], ...updatedMessage };
            onMessageChange(updatedMessages);
            logDebug('📝 Updated message in-place:', updatedMessage.id);
            return;
          }
        }
        
        // For complex updates, fetch full details
        const { data: fullMessage, error } = await supabase
          .from('messages_with_details')
          .select('*')
          .eq('id', updatedMessage.id)
          .single();
        
        if (!error && fullMessage) {
          const updatedMessages = messages.map(msg => 
            msg.id === fullMessage.id ? fullMessage : msg
          );
          onMessageChange(updatedMessages);
          logDebug('📝 Updated message from DB:', fullMessage.id);
        }
      } 
      else if (payload.eventType === 'DELETE') {
        const deletedMessage = payload.old;
        if (deletedMessage) {
          const updatedMessages = messages.filter(msg => msg.id !== deletedMessage.id);
          onMessageChange(updatedMessages);
          logDebug('🗑️ Removed message:', deletedMessage.id);
        }
      }
    } catch (error) {
      logError('Error in message handler:', error);
    }
  }
  
  // Optimized subscription setup with connection management
  async function setupMessageSubscription() {
    if (!user || !supabase || isCleanupMode) return;
    
    logDebug('🔄 Setting up message subscription:', user.id);
    
    // Prevent duplicate subscriptions
    if (messageChannel) {
      await supabase.removeChannel(messageChannel);
      messageChannel = null;
    }
    
    // Single channel for all message events
    messageChannel = supabase
      .channel(`user-messages-${user.id}`, {
        config: {
          broadcast: { self: false }, // Don't broadcast to self
          presence: { key: user.id }  // Use user ID as presence key
        }
      })
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events
          schema: 'public',
          table: 'messages'
        },
        handleMessageChange
      )
      .subscribe((status, err) => {
        const connectionStatus = status === 'SUBSCRIBED' ? 'connected' : 
                                status === 'CHANNEL_ERROR' ? 'disconnected' : 
                                status === 'CLOSED' ? 'disconnected' : 'connecting';
        
        onConnectionStatusChange(connectionStatus);
        
        if (err) {
          logError('Message channel error:', err);
          
          // Exponential backoff reconnection
          if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS && !isCleanupMode) {
            reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000); // Max 10s
            logDebug(`🔄 Reconnecting in ${delay}ms (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
            setTimeout(() => setupMessageSubscription(), delay);
          }
        } else if (status === 'SUBSCRIBED') {
          logDebug('✅ Message channel connected');
          reconnectAttempts = 0;
        }
      });
  }
  
  // Optimized presence handling
  async function setupPresenceSubscription() {
    if (!user || !supabase || isCleanupMode) return;
    
    logDebug('🔄 Setting up presence channel');
    
    // Cleanup existing presence
    if (presenceChannel) {
      await presenceChannel.untrack();
      await supabase.removeChannel(presenceChannel);
      presenceChannel = null;
    }
    
    presenceChannel = supabase
      .channel('app-presence', {
        config: {
          presence: { key: user.id }
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel?.presenceState();
        if (!state) return;
        
        const onlineUserIds = new Set<string>();
        const typingUsers = new Map<string, any>();
        
        // Efficient presence processing
        for (const [key, presences] of Object.entries(state)) {
          const presence = Array.isArray(presences) ? presences[0] : presences;
          if (presence && presence.user_id) {
            onlineUserIds.add(presence.user_id);
            
            if (presence.typing_in) {
              typingUsers.set(presence.user_id, {
                username: presence.username || 'User',
                conversationId: presence.typing_in
              });
            }
          }
        }
        
        onOnlineUsersChange(onlineUserIds);
        if (onTypingUsersChange) {
          onTypingUsersChange(typingUsers);
        }
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        logDebug('👤 User joined:', key);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        logDebug('👋 User left:', key);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const trackData = {
            user_id: user.id,
            username: user.username || user.email?.split('@')[0] || 'User',
            online_at: new Date().toISOString()
          };
          
          await presenceChannel?.track(trackData);
          logDebug('✅ Presence active:', user.id);
        }
      });
  }
  
  // Initialize on mount
  onMount(() => {
    if (user && supabase) {
      setupMessageSubscription();
      setupPresenceSubscription();
    }
  });
  
  // Optimized cleanup with proper async handling
  async function cleanupSubscriptions() {
    if (isCleanupMode) return; // Prevent multiple cleanup calls
    isCleanupMode = true;
    
    logDebug('🧹 Cleaning up subscriptions');
    
    const cleanupPromises = [];
    
    if (messageChannel) {
      const channelToCleanup = messageChannel;
      messageChannel = null; // Clear reference before cleanup
      
      cleanupPromises.push(
        supabase.removeChannel(channelToCleanup).catch((error) => {
          logError('Message channel cleanup error:', error);
        })
      );
    }
    
    if (presenceChannel) {
      const channelToCleanup = presenceChannel;
      presenceChannel = null; // Clear reference before cleanup
      
      cleanupPromises.push(
        channelToCleanup.untrack().then(() => 
          supabase.removeChannel(channelToCleanup)
        ).catch((error) => {
          logError('Presence channel cleanup error:', error);
        })
      );
    }
    
    try {
      await Promise.all(cleanupPromises);
      logDebug('✅ Cleanup completed');
    } catch (error) {
      logError('Cleanup error (non-critical):', error);
    }
  }
  
  // Effect-based cleanup
  $effect(() => {
    return () => {
      cleanupSubscriptions();
    };
  });
  
  // Fallback cleanup on destroy
  onDestroy(() => {
    cleanupSubscriptions();
  });
</script>

<!-- This component has no UI, it just manages realtime connections -->