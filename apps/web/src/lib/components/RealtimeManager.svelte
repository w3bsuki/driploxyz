<script lang="ts">
  // Lifecycle methods removed - using $effect instead
  import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
  import type { Tables } from '@repo/database';
  // import { dev } from '$app/environment'; // Unused - commented out with logDebug

  type Message = Tables<'messages'>;
  type Profile = Tables<'profiles'>;

  interface TypingUser {
    username: string;
    conversationId: string;
  }
  
  interface Props {
    supabase: SupabaseClient;
    user: Profile;
    messages: Message[];
    onMessageChange: (messages: Message[]) => void;
    onConnectionStatusChange: (status: 'connected' | 'connecting' | 'disconnected') => void;
    onOnlineUsersChange: (users: Set<string>) => void;
    onTypingUsersChange?: (users: Map<string, TypingUser>) => void;
  }
  
  let { supabase, user, messages, onMessageChange, onConnectionStatusChange, onOnlineUsersChange, onTypingUsersChange }: Props = $props();
  
  // Single subscription channels - prevent duplicates
  let messageChannel: RealtimeChannel | null = null;
  let presenceChannel: RealtimeChannel | null = null;
  let reconnectAttempts = 0;
  const MAX_RECONNECT_ATTEMPTS = 5;
  let isCleanupMode = false;
  
  // Development-only logging with stricter controls - currently unused
  // function logDebug(message: string, data?: unknown) {
  //   if (dev && typeof window !== 'undefined' && localStorage.getItem('debug_messages') === '1') {
  //     // Development debug logging placeholder - logging logic removed
  //   }
  // }
  
  // Enhanced error handling
  import { createLogger } from '$lib/utils/log';
  import { parseError, createNetworkMonitor } from '$lib/utils/error-handling';
  import { toast } from '$lib/stores/toast.svelte';

  const log = createLogger('realtime-manager');
  const network = createNetworkMonitor();

  let connectionStatus = $state<'connected' | 'connecting' | 'disconnected' | 'error'>('disconnected');
  let isReconnecting = $state(false);

  // Production-safe error logging
  function logError(message: string, error?: unknown) {
    const errorDetails = parseError(error, {
      component: 'RealtimeManager',
      userId: user?.id,
      connectionStatus
    });

    log.error(message, errorDetails);

    // Show toast for critical errors
    if (errorDetails.severity === 'HIGH' || errorDetails.severity === 'CRITICAL') {
      toast.error(errorDetails.userMessage, {
        action: {
          label: 'Retry',
          onClick: () => handleReconnect()
        }
      });
    }
  }

  // Enhanced reconnection logic
  async function handleReconnect() {
    if (isReconnecting || !network.isOnline) return;

    isReconnecting = true;
    connectionStatus = 'connecting';

    try {
      // Cleanup existing connections
      await cleanup();

      // Wait before reconnecting
      await new Promise(resolve => setTimeout(resolve, Math.min(1000 * reconnectAttempts, 10000)));

      // Restart connections
      await setupRealtimeSubscriptions();

      reconnectAttempts = 0;
      toast.success('Real-time connection restored');

    } catch (error) {
      reconnectAttempts++;
      logError('Reconnection failed', error);

      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        connectionStatus = 'error';
        toast.error('Unable to restore real-time connection. Please refresh the page.', {
          persistent: true
        });
      }
    } finally {
      isReconnecting = false;
    }
  }
  
  // Optimized message handler - no expensive database queries
  function handleMessageChange(payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new?: Message;
    old?: Message;
  }) {
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
        const typingUsers = new Map<string, TypingUser>();
        
        // Efficient presence processing
        for (const [, presences] of Object.entries(state)) {
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
      .on('presence', { event: 'join' }, () => {
        // User joined - parameters not needed for current implementation
      })
      .on('presence', { event: 'leave' }, () => {
        // User left - parameters not needed for current implementation
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

  // Main setup function for all realtime subscriptions
  async function setupRealtimeSubscriptions() {
    if (!user || !supabase || isCleanupMode) return;

    try {
      connectionStatus = 'connecting';
      onConnectionStatusChange('connecting');

      // Setup both subscriptions
      await Promise.all([
        setupMessageSubscription(),
        setupPresenceSubscription()
      ]);

      connectionStatus = 'connected';
      onConnectionStatusChange('connected');

    } catch (error) {
      connectionStatus = 'error';
      onConnectionStatusChange('disconnected');
      logError('Failed to setup realtime subscriptions', error);

      // Auto-retry with exponential backoff
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS && network.isOnline) {
        setTimeout(() => handleReconnect(), Math.min(1000 * Math.pow(2, reconnectAttempts), 10000));
      }
    }
  }

  // Auto-cleanup function
  async function cleanup() {
    await cleanupSubscriptions();
  }

  // Initialize subscriptions and setup cleanup with $effect
  $effect(() => {
    if (user && supabase) {
      setupRealtimeSubscriptions();

      // Return cleanup function
      return () => {
        cleanup();
      };
    }
  });

  // Monitor network changes and reconnect when back online
  $effect(() => {
    if (network.isOnline && connectionStatus === 'error' && !isReconnecting) {
      handleReconnect();
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
  
  // No longer needed - cleanup handled by $effect
</script>

<!-- This component has no UI, it just manages realtime connections -->