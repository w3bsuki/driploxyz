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
  
  // Development-only logging with stricter controls
  function logDebug(message: string, data?: any) {
    if (dev && typeof window !== 'undefined' && localStorage.getItem('debug_messages') === '1') {
      console.log(message, data);
    }
  }
  
  // Production-safe error logging
  function logError(message: string, error?: any) {
    console.error(message, error);
  }
  
  // Optimized message handler - no expensive database queries
  function handleMessageChange(payload: any) {
    if (isCleanupMode) return; // Ignore events during cleanup
    
    try {
      if (payload.eventType === 'INSERT') {
        const newMessage = payload.new;
        if (!newMessage || !newMessage.created_at) return;
        
        // Check for duplicates
        const messageExists = messages.some(m => m.id === newMessage.id);
        if (messageExists) return;
        
        // Use the message data directly from realtime payload
        // The database view will provide all necessary details
        const updatedMessages = [...messages, newMessage];
        onMessageChange(updatedMessages);
        
        // Mark as delivered asynchronously - don't block UI
        if (newMessage.receiver_id === user.id && newMessage.sender_id !== user.id) {
          supabase.rpc('mark_message_delivered', {
            p_message_id: newMessage.id
          }).catch(() => {
            // Message delivery marking failed (non-critical)
          });
        }
      } 
      else if (payload.eventType === 'UPDATE') {
        const updatedMessage = payload.new;
        if (!updatedMessage) return;
        
        // Update message in place using payload data
        const updatedMessages = messages.map(msg => 
          msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
        );
        onMessageChange(updatedMessages);
      } 
      else if (payload.eventType === 'DELETE') {
        const deletedMessage = payload.old;
        if (deletedMessage) {
          const updatedMessages = messages.filter(msg => msg.id !== deletedMessage.id);
          onMessageChange(updatedMessages);
        }
      }
    } catch (error) {
      logError('Error in message handler:', error);
    }
  }
  
  // Optimized subscription setup with user-specific filters
  async function setupMessageSubscription() {
    if (!user || !supabase || isCleanupMode) return;
    
    // Setting up message subscription with user filters
    
    // Prevent duplicate subscriptions
    if (messageChannel) {
      await supabase.removeChannel(messageChannel);
      messageChannel = null;
    }
    
    // Single channel with filtered subscriptions for performance
    messageChannel = supabase
      .channel(`user-messages-${user.id}`, {
        config: {
          broadcast: { self: false },
          presence: { key: user.id }
        }
      })
      // Listen to messages where user is the receiver
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public', 
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        },
        handleMessageChange
      )
      // Listen to messages where user is the sender
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages', 
          filter: `sender_id=eq.${user.id}`
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
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
            setTimeout(() => setupMessageSubscription(), delay);
          }
        } else if (status === 'SUBSCRIBED') {
          reconnectAttempts = 0;
        }
      });
  }
  
  // Optimized presence handling
  async function setupPresenceSubscription() {
    if (!user || !supabase || isCleanupMode) return;
    
    // Setting up presence channel
    
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
        // User joined
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        // User left
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const trackData = {
            user_id: user.id,
            username: user.username || user.email?.split('@')[0] || 'User',
            online_at: new Date().toISOString()
          };
          
          await presenceChannel?.track(trackData);
          // Presence active
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
    
    // Cleaning up subscriptions
    
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
      // Cleanup completed
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