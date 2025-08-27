<script lang="ts">
  import { Avatar, Button, TabGroup, TypingIndicator, BottomNav } from '@repo/ui';
  import { messageNotificationActions, unreadMessageCount } from '$lib/stores/messageNotifications';
  import type { PageData } from './$types';
  import * as i18n from '@repo/i18n';
  import { onDestroy } from 'svelte';
  import type { RealtimeChannel } from '@supabase/supabase-js';
  import { page, navigating } from '$app/stores';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  // State variables (must be defined before use)
  let messageText = $state('');
  let activeTab = $state<'all' | 'buying' | 'selling' | 'offers' | 'unread'>('all');
  let isTyping = $state(false);
  let typingTimeout: NodeJS.Timeout | null = null;
  let typingUsers = $state<Map<string, { username: string; conversationId: string }>>(new Map());
  
  // Channel references
  let messageChannel: RealtimeChannel | null = null;
  let presenceChannel: RealtimeChannel | null = null;
  let presenceSubscription: RealtimeChannel | null = null;
  let messagesContainer: HTMLDivElement | null = null;
  
  // UI state
  let isKeyboardOpen = $state(false);
  let connectionStatus = $state<'connected' | 'connecting' | 'disconnected'>('connecting');
  let onlineUsers = $state<Set<string>>(new Set());
  let isSending = $state(false);

  // Set initial unread count from server data
  $effect(() => {
    if (data.unreadCount !== undefined) {
      messageNotificationActions.setUnreadCount(data.unreadCount);
    }
  });
  
  // Message change handler function
  async function handleMessageChange(payload) {
    console.log('📨 Real-time message event:', {
      type: payload.eventType,
      table: payload.table,
      messageId: payload.new?.id,
      senderId: payload.new?.sender_id,
      receiverId: payload.new?.receiver_id,
      content: payload.new?.content?.substring(0, 50) + '...',
      timestamp: new Date().toISOString()
    });
    
    if (payload.eventType === 'INSERT') {
      // Fetch full message details from the view
      const newMessage = payload.new;
      if (newMessage) {
        const { data: fullMessage, error } = await data.supabase
          .from('messages_with_details' as any)
          .select('*')
          .eq('id', newMessage.id)
          .single() as any;
        
        if (fullMessage && !error) {
          // Update local messages array
          data.messages = [...(data.messages || []), fullMessage];
          
          // Mark as delivered if we're the receiver
          if (newMessage.receiver_id === data.user.id && newMessage.sender_id !== data.user.id) {
            try {
              await data.supabase.rpc('mark_message_delivered', {
                p_message_id: newMessage.id
              });
            } catch (e) {
              console.log('Could not mark as delivered:', e);
            }
          }
          
          // Auto-scroll to bottom
          requestAnimationFrame(() => scrollToBottom());
          
          // Update unread count if we're the receiver
          if (newMessage.receiver_id === data.user.id && !newMessage.is_read) {
            messageNotificationActions.incrementUnread();
          }
        } else if (error) {
          console.error('Error fetching full message:', error);
        }
      }
    } else if (payload.eventType === 'UPDATE') {
      // Update message status (delivered/read)
      const updatedMessage = payload.new;
      if (updatedMessage && data.messages) {
        // Fetch the updated message with full details
        const { data: fullMessage, error } = await data.supabase
          .from('messages_with_details' as any)
          .select('*')
          .eq('id', updatedMessage.id)
          .single() as any;
          
        if (fullMessage && !error) {
          data.messages = data.messages.map(msg => 
            msg.id === fullMessage.id ? fullMessage : msg
          );
        }
        
        // Update unread count if message was marked as read
        if (updatedMessage.is_read && !data.messages.find(m => m.id === updatedMessage.id)?.is_read) {
          messageNotificationActions.decrementUnread();
        }
      }
    }
  }

  // Set up real-time subscription for messages with proper error handling
  $effect(() => {
    if (!data.user || !data.supabase) return;
    
    // Set up message subscription for messages where user is sender OR receiver
    messageChannel = data.supabase
      .channel(`messages_${data.user.id}`, {
        config: {
          broadcast: { self: false },
          presence: { key: data.user.id }
        }
      })
      // Listen to messages where user is the sender
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${data.user.id}`
        },
        handleMessageChange
      )
      // Listen to messages where user is the receiver
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${data.user.id}`
        },
        handleMessageChange
      )
      .subscribe((status, err) => {
        const prevStatus = connectionStatus;
        connectionStatus = status === 'SUBSCRIBED' ? 'connected' : 
                          status === 'CHANNEL_ERROR' ? 'disconnected' : 'connecting';
        
        console.log('📡 Real-time connection status changed:', {
          from: prevStatus,
          to: connectionStatus,
          status,
          error: err,
          userId: data.user?.id,
          timestamp: new Date().toISOString()
        });
        
        if (err) {
          console.error('❌ Real-time subscription error:', err);
        }
        
        // Test connection by sending a simple query when connected
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time connected! Testing database access...');
          data.supabase
            .from('messages')
            .select('count')
            .eq('sender_id', data.user.id)
            .limit(1)
            .then(({ data: testData, error: testError }) => {
              if (testError) {
                console.error('❌ Database access test failed:', testError);
              } else {
                console.log('✅ Database access test passed');
              }
            });
        }
      });
    
    // Set up presence channel for online status and typing
    presenceChannel = data.supabase
      .channel('presence_global')
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel?.presenceState();
        if (state) {
          onlineUsers = new Set(Object.keys(state));
        }
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        onlineUsers.add(key);
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        onlineUsers.delete(key);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track our presence
          await presenceChannel?.track({
            user_id: data.user.id,
            online_at: new Date().toISOString()
          });
          
          // Update database presence
          try {
            await data.supabase.rpc('update_user_presence', {
              p_status: 'online'
            });
          } catch (e) {
            console.log('Presence function not available:', e.message);
          }
        }
      });
    
    // Note: Typing indicators disabled until presence table is created
    // This would subscribe to typing indicators from presence table if it exists
    
    // Detect keyboard open/close on mobile
    if (typeof window !== 'undefined' && window.visualViewport) {
      const handleViewportChange = () => {
        const hasKeyboard = window.visualViewport.height < window.innerHeight - 100;
        isKeyboardOpen = hasKeyboard;
      };
      
      window.visualViewport.addEventListener('resize', handleViewportChange);
      
      // Cleanup function for effect
      return () => {
        window.visualViewport?.removeEventListener('resize', handleViewportChange);
      };
    }
  });
  
  onDestroy(async () => {
    // Clean up subscriptions
    if (messageChannel) {
      await data.supabase?.removeChannel(messageChannel);
    }
    if (presenceChannel) {
      await presenceChannel?.untrack();
      await data.supabase?.removeChannel(presenceChannel);
    }
    
    if (presenceSubscription) {
      await data.supabase?.removeChannel(presenceSubscription);
    }
    
    // Update presence to offline
    if (data.user && data.supabase) {
      try {
        await data.supabase.rpc('update_user_presence', {
          p_status: 'offline'
        });
      } catch (e) {
        console.log('Could not update offline status:', e);
      }
    }
  });
  
  // Simple scroll to bottom
  function scrollToBottom() {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
  
  // Scroll when conversation changes
  $effect(() => {
    if (selectedConversation() && messagesContainer) {
      requestAnimationFrame(() => scrollToBottom());
    }
  });
  
  // Auto-reconnect on disconnect with improved logic
  $effect(() => {
    if (connectionStatus === 'disconnected' && data.supabase && data.user) {
      const reconnectTimer = setTimeout(async () => {
        console.log('🔄 Attempting to reconnect real-time...');
        
        try {
          // Clean up existing channel
          if (messageChannel) {
            await data.supabase.removeChannel(messageChannel);
            messageChannel = null;
          }
          
          // Re-establish message subscription
          messageChannel = data.supabase
            .channel(`messages_${data.user.id}_reconnect`, {
              config: {
                broadcast: { self: false },
                presence: { key: data.user.id }
              }
            })
            .on('postgres_changes', {
              event: '*',
              schema: 'public',
              table: 'messages',
              filter: `sender_id=eq.${data.user.id}`
            }, handleMessageChange)
            .on('postgres_changes', {
              event: '*',
              schema: 'public',
              table: 'messages',
              filter: `receiver_id=eq.${data.user.id}`
            }, handleMessageChange)
            .subscribe((status, err) => {
              connectionStatus = status === 'SUBSCRIBED' ? 'connected' : 
                                status === 'CHANNEL_ERROR' ? 'disconnected' : 'connecting';
              console.log('🔄 Reconnected real-time status:', {
                status,
                error: err,
                timestamp: new Date().toISOString()
              });
              
              if (err) {
                console.error('❌ Reconnection error:', err);
              }
            });
          
        } catch (error) {
          console.error('Error reconnecting:', error);
        }
      }, 5000);
      
      return () => clearTimeout(reconnectTimer);
    }
  });
  
  // CONVERSATION LOGIC WITH PRODUCT CONTEXT
  const allConversations = $derived(() => {
    
    const convMap = new Map();
    
    // First: process existing messages into conversations (GROUP BY USER + PRODUCT)
    if (data.messages && data.messages.length > 0) {
      data.messages.forEach(msg => {
        const otherUserId = msg.sender_id === data.user?.id ? msg.receiver_id : msg.sender_id;
        const productId = msg.product_id || 'general';
        const key = `${otherUserId}__${productId}`; // GROUP BY USER + PRODUCT
        
        if (!convMap.has(key)) {
          const otherUser = msg.sender_id === data.user?.id ? msg.receiver : msg.sender;
          const product = msg.product;
          
          convMap.set(key, {
            id: key,
            userId: otherUserId,
            productId: productId === 'general' ? null : productId,
            userName: otherUser?.username || otherUser?.full_name || 'Unknown User',
            userAvatar: otherUser?.avatar_url,
            lastMessage: msg.content,
            lastMessageTime: msg.created_at,
            unread: !msg.is_read && msg.sender_id !== data.user?.id,
            productTitle: product?.title || null,
            productImage: product?.images?.[0]?.image_url || '/placeholder-product.svg',
            productPrice: product?.price || 0,
            messages: [msg],
            lastActiveAt: otherUser?.last_active_at,
            isProductConversation: productId !== 'general'
          });
        } else {
          const conv = convMap.get(key);
          conv.messages.push(msg);
          if (new Date(msg.created_at) > new Date(conv.lastMessageTime)) {
            conv.lastMessage = msg.content;
            conv.lastMessageTime = msg.created_at;
          }
          // Update unread status
          if (!msg.is_read && msg.sender_id !== data.user?.id) {
            conv.unread = true;
          }
        }
      });
    }
    
    // Second: if we have a conversation param from URL, ensure it exists
    if (data.conversationParam && data.conversationUser) {
      const [sellerId, productId] = data.conversationParam.split('__');
      const key = data.conversationParam; // Use the full conversation parameter
      if (!convMap.has(key)) {
        convMap.set(key, {
          id: key,
          userId: sellerId,
          productId: productId === 'general' ? null : productId,
          userName: data.conversationUser.username || data.conversationUser.full_name || 'Unknown User',
          userAvatar: data.conversationUser.avatar_url,
          lastMessage: 'Start a conversation...',
          lastMessageTime: '2024-01-01T00:00:00.000Z',
          unread: false,
          productTitle: data.conversationProduct?.title || null,
          productImage: data.conversationProduct?.images?.[0]?.image_url || '/placeholder-product.svg',
          productPrice: data.conversationProduct?.price || 0,
          messages: [],
          lastActiveAt: data.conversationUser.last_active_at,
          isProductConversation: productId !== 'general'
        });
      }
    }
    
    const result = Array.from(convMap.values()).sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
    
    
    return result;
  });

  // Filtered conversations based on active tab
  const conversations = $derived(() => {
    const all = allConversations();
    
    switch (activeTab) {
      case 'unread':
        return all.filter(conv => conv.unread);
      case 'buying':
        // Messages where current user is the buyer (received messages about their inquiries)
        return all.filter(conv => 
          conv.messages.some(msg => msg.receiver_id === data.user?.id)
        );
      case 'selling':
        // Messages where current user is the seller (received messages about their products)
        return all.filter(conv => 
          conv.messages.some(msg => msg.sender_id === data.user?.id) &&
          conv.isProductConversation
        );
      case 'offers':
        return all.filter(conv => conv.isOffer);
      case 'all':
      default:
        return all;
    }
  });
  
  // Additional imports (page and navigating already imported at top)
  import { goto, invalidate } from '$app/navigation';
  import { browser } from '$app/environment';
  
  // Get selected conversation from URL
  const selectedConversation = $derived(() => {
    const convParam = $page.url.searchParams.get('conversation');
    if (convParam) {
      return convParam;
    }
    // Legacy support for conversationParam from server
    if (data.conversationParam) {
      const [sellerId, productId] = data.conversationParam.split('__');
      const otherUserId = sellerId === data.user?.id ? 
        data.conversationUser?.id || sellerId : 
        sellerId;
      return `${otherUserId}__${productId || 'general'}`;
    }
    return null;
  });
  
  const selectedConvMessages = $derived(() => {
    if (!selectedConversation()) {
      return [];
    }
    const convs = conversations();
    const conv = convs.find(c => c.id === selectedConversation());
    const messages = conv?.messages?.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ) || [];
    return messages;
  });
  
  const timeAgo = (date: string) => {
    // Use a fixed time to prevent hydration mismatch
    return i18n.messages_now();
  };
  
  const getActiveStatus = (userId: string | null, lastActiveAt: string | null) => {
    if (!userId) return '';
    
    // Check if user is online
    if (onlineUsers.has(userId)) {
      return i18n.messages_activeNow();
    }
    
    // Otherwise show last active time
    if (!lastActiveAt) return 'Offline';
    
    const lastActive = new Date(lastActiveAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastActive.getTime()) / 60000);
    
    if (diffMinutes < 5) return 'Active recently';
    if (diffMinutes < 60) return `Active ${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `Active ${Math.floor(diffMinutes / 60)}h ago`;
    return 'Offline';
  };
  
  // Handle typing indicator with presence
  async function handleTyping() {
    if (!selectedConversation() || !data.user || !data.supabase) return;
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set typing state
    if (!isTyping) {
      isTyping = true;
      
      // Update presence with typing status
      try {
        await data.supabase.rpc('update_user_presence', {
          p_status: 'online',
          p_typing_in: selectedConversation()
        });
      } catch (e) {
        console.log('Could not update typing status:', e);
      }
    }
    
    // Clear typing after 3 seconds of inactivity
    typingTimeout = setTimeout(async () => {
      isTyping = false;
      
      // Clear typing status in presence
      if (data.supabase) {
        try {
          await data.supabase.rpc('update_user_presence', {
            p_status: 'online',
            p_typing_in: null
          });
        } catch (e) {
          console.log('Could not clear typing status:', e);
        }
      }
    }, 3000);
  }

  async function sendMessage() {
    // Prevent multiple submissions
    if (isSending) {
      console.log('⚠️ Already sending message, ignoring duplicate call');
      return;
    }
    
    console.log('🚀 sendMessage called', { 
      messageText: messageText.trim(),
      selectedConversation: selectedConversation(),
      connectionStatus,
      isSending
    });
    
    // Validation
    if (!messageText.trim()) {
      console.error('❌ No message text');
      return;
    }
    
    if (!selectedConversation()) {
      console.error('❌ No selected conversation');
      return;
    }
    
    if (!data.user?.id) {
      console.error('❌ No user data');
      alert('Please log in to send messages.');
      return;
    }
    
    if (!data.supabase) {
      console.error('❌ No supabase client');
      alert('Connection error. Please refresh the page.');
      return;
    }
    
    // Set loading state
    isSending = true;
    console.log('✅ Validation passed, sending message...');
    
    // Clear typing indicator (non-blocking)
    isTyping = false;
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      // Don't await this - it can fail and shouldn't block message sending
      data.supabase.rpc('update_user_presence', {
        p_status: 'online',
        p_typing_in: null
      }).catch(e => console.log('Could not clear typing:', e));
    }
    
    try {
      // Extract and validate conversation details
      const conversationId = selectedConversation();
      if (!conversationId?.includes('__')) {
        throw new Error('Invalid conversation format');
      }
      
      const [recipientId, productId] = conversationId.split('__');
      console.log('📝 Sending to:', { recipientId, productId });
      
      // Validate UUIDs
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(recipientId)) {
        throw new Error('Invalid recipient ID');
      }
      
      if (productId && productId !== 'general' && !uuidRegex.test(productId)) {
        throw new Error('Invalid product ID');
      }
      
      // Store message content and clear input
      const messageContent = messageText.trim();
      messageText = '';
      
      // Create optimistic message
      const tempMessage = {
        id: 'temp_' + Date.now(),
        sender_id: data.user.id,
        receiver_id: recipientId,
        product_id: productId === 'general' ? null : productId,
        content: messageContent,
        status: 'sending',
        created_at: new Date().toISOString(),
        is_read: false,
        sender: {
          id: data.user.id,
          username: data.user.user_metadata?.username || data.user.email,
          avatar_url: data.user.user_metadata?.avatar_url
        },
        receiver: { id: recipientId }
      };
      
      // Add optimistic message to UI
      data.messages = [...(data.messages || []), tempMessage];
      requestAnimationFrame(() => scrollToBottom());
      
      console.log('💾 Inserting message into database...');
      
      // Insert message into database with timeout
      const insertPromise = data.supabase
        .from('messages')
        .insert({
          sender_id: data.user.id,
          receiver_id: recipientId,
          product_id: productId === 'general' ? null : productId,
          content: messageContent
        })
        .select('*')
        .single();
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Message send timeout')), 10000)
      );
      
      const { data: newMessage, error } = await Promise.race([
        insertPromise,
        timeoutPromise
      ]) as any;
      
      if (error) {
        throw error;
      }
      
      console.log('✅ Message inserted successfully:', newMessage.id);
      
      // Update optimistic message with real data
      data.messages = data.messages.map(m => 
        m.id === tempMessage.id 
          ? { ...tempMessage, ...newMessage, status: 'sent' } 
          : m
      );
      
      // Fetch full message details (non-blocking)
      data.supabase
        .from('messages_with_details' as any)
        .select('*')
        .eq('id', newMessage.id)
        .single()
        .then(({ data: fullMessage }) => {
          if (fullMessage) {
            data.messages = data.messages.map(m => 
              m.id === tempMessage.id ? fullMessage : m
            );
          }
        })
        .catch(e => console.log('Could not fetch full message details:', e));
      
    } catch (error) {
      console.error('❌ Send message failed:', error);
      
      // Remove optimistic message
      data.messages = data.messages.filter(m => !m.id.toString().startsWith('temp_'));
      
      // Restore message text
      if (!messageText) {
        messageText = error.message?.includes('timeout') 
          ? messageText 
          : messageText || '';
      }
      
      // Show user-friendly error
      const errorMessage = error.message?.includes('timeout') 
        ? 'Message send timeout. Please try again.'
        : error.message?.includes('Invalid') 
          ? 'Invalid conversation. Please refresh the page.'
          : 'Failed to send message. Please try again.';
          
      alert(errorMessage);
      
    } finally {
      isSending = false;
      console.log('📤 Send message completed');
    }
  }
  
  function acceptOffer(convId: string) {
    // Handle offer acceptance
  }
  
  function declineOffer(convId: string) {
    // Handle offer decline
  }
  
  function counterOffer(convId: string) {
    // Handle counter offer
  }
</script>

<svelte:head>
  <title>Messages - Driplo</title>
</svelte:head>

<div class="h-screen bg-gray-50 flex flex-col overflow-hidden">
  <!-- Page Header - COMPLETELY HIDDEN on mobile when in conversation -->
  {#if !selectedConversation()}
  <div class="bg-white border-b border-gray-200 shrink-0">
    <div class="max-w-7xl mx-auto">
      <div class="px-4 sm:px-6 lg:px-8 py-3">
        <h1 class="text-lg font-semibold text-gray-900">{i18n.messages_inbox()}</h1>
      </div>
        
        <!-- Mobile Filter Pills (Full Width) -->
        <div class="sm:hidden">
          <div class="grid grid-cols-5 gap-1 px-4 pb-3">
            {#each [
              { id: 'all', label: i18n.messages_all(), count: allConversations().length },
              { id: 'unread', label: i18n.messages_unread(), count: allConversations().filter(c => c.unread).length },
              { id: 'buying', label: i18n.messages_buying() },
              { id: 'selling', label: i18n.messages_selling() },
              { id: 'offers', label: i18n.messages_offers(), count: allConversations().filter(c => c.isOffer).length }
            ] as tab}
              <button
                onclick={() => activeTab = tab.id}
                class="px-2 py-1.5 rounded-full text-xs font-medium transition-colors
                  {activeTab === tab.id 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
              >
                <div class="truncate">
                  {tab.label}
                  {#if tab.count !== undefined && tab.count > 0}
                    <span class="ml-1 text-[10px]">({tab.count})</span>
                  {/if}
                </div>
              </button>
            {/each}
          </div>
        </div>
        
        <!-- Desktop Tabs -->
        <div class="hidden sm:block px-4 sm:px-6 lg:px-8">
          <TabGroup
            tabs={[
              { id: 'all', label: i18n.messages_all(), count: allConversations().length },
              { id: 'unread', label: i18n.messages_unread(), count: allConversations().filter(c => c.unread).length },
              { id: 'buying', label: i18n.messages_buying() },
              { id: 'selling', label: i18n.messages_selling() },
              { id: 'offers', label: i18n.messages_offers(), count: allConversations().filter(c => c.isOffer).length }
            ]}
            {activeTab}
            onTabChange={(tab) => activeTab = tab}
          />
        </div>
      <div class="h-1"></div>
    </div>
  </div>
  {/if}

  <div class="flex-1 max-w-7xl mx-auto sm:px-6 lg:px-8 overflow-hidden flex flex-col w-full">
    <div class="flex-1 sm:grid sm:grid-cols-3 lg:grid-cols-4 overflow-hidden">
      <!-- Conversations List -->
      <div class="sm:col-span-1 lg:col-span-1 bg-white sm:border-r sm:border-gray-200 overflow-y-auto {selectedConversation() ? 'hidden sm:block' : ''} h-full">
        {#if conversations().length === 0}
          <div class="p-4 text-center text-gray-500">
            No conversations yet.
          </div>
        {/if}
        {#each conversations() as conv}
          <div
            class="w-full px-4 py-4 hover:bg-gray-50 border-b border-gray-200 transition-colors text-left min-h-[68px] cursor-pointer
              {selectedConversation() === conv.id ? 'bg-gray-50' : ''}"
            onclick={() => goto(`/messages?conversation=${conv.id}`)}
            role="button"
            tabindex="0"
            onkeydown={(e) => e.key === 'Enter' && goto(`/messages?conversation=${conv.id}`)}
          >
            <div class="flex items-start space-x-3">
              <div class="relative shrink-0">
                <Avatar src={conv.userAvatar} name={conv.userName} size="md" />
                {#if conv.unread}
                  <span class="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-blue-500 rounded-full border-2 border-white"></span>
                {/if}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start">
                  <h3 class="font-medium text-gray-900 text-sm truncate">{conv.userName}</h3>
                  <span class="text-[11px] text-gray-500 shrink-0 ml-2">{timeAgo(conv.lastMessageTime)}</span>
                </div>
                
                {#if conv.isOffer}
                  <div class="inline-flex items-center space-x-1 mt-1">
                    <span class="bg-blue-100 text-blue-700 text-[10px] font-medium px-1.5 py-0.5 rounded-sm">Offer</span>
                    <span class="text-xs font-semibold text-gray-900">${conv.offerPrice}</span>
                  </div>
                {:else}
                  <div class="flex items-center space-x-2 mt-1">
                    {#if conv.isProductConversation && conv.productTitle}
                      <div class="flex items-center space-x-2">
                        <img src={conv.productImage} alt={conv.productTitle} class="w-6 h-6 rounded-sm object-cover" />
                        <span class="text-xs text-gray-600 truncate">{conv.productTitle}</span>
                        <span class="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-sm font-medium">Product</span>
                      </div>
                    {:else}
                      <div class="flex items-center space-x-2">
                        <span class="text-xs text-gray-500 italic">{i18n.messages_noProducts()}</span>
                        <span class="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-sm font-medium">General</span>
                      </div>
                    {/if}
                  </div>
                {/if}
                
                <p class="text-sm text-gray-600 truncate mt-1 {conv.unread ? 'font-semibold text-gray-900' : ''}">
                  {conv.lastMessage}
                </p>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <!-- Chat View -->
      {#if selectedConversation()}
        {@const conv = conversations().find(c => c.id === selectedConversation())}
        <div class="sm:col-span-2 lg:col-span-3 bg-white flex flex-col h-full {selectedConversation() ? 'absolute inset-0 z-10 sm:relative' : 'hidden sm:flex'} sm:relative">
          <!-- Chat Header - Fixed -->
          <div class="bg-white border-b border-gray-200 px-4 py-3 shrink-0">
            <!-- Connection Status Bar -->
            {#if connectionStatus !== 'connected'}
              <div class="absolute top-0 left-0 right-0 h-1 {connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'} transition-colors" title={connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}></div>
            {:else}
              <!-- Show briefly when connected -->
              <div class="absolute top-0 left-0 right-0 h-1 bg-green-400 transition-all duration-1000 opacity-0"></div>
            {/if}
            
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <button
                  onclick={() => goto('/messages')}
                  class="sm:hidden -ml-2"
                  aria-label="Back to conversations"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <Avatar src={conv?.userAvatar} name={conv?.userName} size="sm" />
                <div>
                  <h3 class="font-medium text-gray-900 text-sm">{conv?.userName}</h3>
                  <p class="text-xs text-gray-500">{getActiveStatus(conv?.userId, conv?.lastActiveAt)}</p>
                </div>
              </div>
              <div class="flex items-center space-x-1">
                <button class="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100" aria-label="Call">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
                <button class="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100" aria-label="Info">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Product/Offer Info -->
            {#if conv?.isOffer}
              <div class="mt-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <p class="text-xs font-semibold text-blue-900 uppercase tracking-wide">{i18n.messages_bundleOffer()}</p>
                    <p class="text-[11px] text-blue-700">{conv.bundleItems?.length} items • Save ${(conv.bundleItems?.reduce((sum, item) => sum + item.price, 0) || 0) - conv.offerPrice}</p>
                  </div>
                  <p class="text-lg font-bold text-blue-900">${conv.offerPrice}</p>
                </div>
                {#if conv.offerStatus === 'pending'}
                  <div class="flex space-x-2">
                    <button onclick={(e) => { e.stopPropagation(); acceptOffer(conv.id); }} class="flex-1 py-1.5 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800">{i18n.messages_acceptOffer()}</button>
                    <button onclick={(e) => { e.stopPropagation(); declineOffer(conv.id); }} class="flex-1 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-lg border border-gray-300 hover:bg-gray-50">{i18n.messages_declineOffer()}</button>
                    <button onclick={(e) => { e.stopPropagation(); counterOffer(conv.id); }} class="flex-1 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-lg border border-gray-300 hover:bg-gray-50">{i18n.messages_counterOffer()}</button>
                  </div>
                {/if}
              </div>
            {:else if conv?.isProductConversation && conv?.productTitle}
              <div class="mt-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200">
                <div class="flex items-center space-x-2 mb-2">
                  <span class="text-xs font-semibold text-blue-900 uppercase tracking-wide">Product Conversation</span>
                  <span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-sm font-medium">Active</span>
                </div>
                <a href="/product/{conv.productId}" class="flex items-center space-x-3 p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                  <img src={conv.productImage} alt={conv.productTitle} class="w-12 h-12 rounded-lg object-cover shadow-xs" />
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900 truncate">{conv.productTitle}</p>
                    <p class="text-lg font-bold text-gray-900">${conv.productPrice}</p>
                  </div>
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            {:else}
              <div class="mt-3 bg-gray-50 rounded-xl p-3 border border-gray-200">
                <div class="flex items-center justify-center space-x-2">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span class="text-xs text-gray-500 font-medium">General Conversation</span>
                </div>
              </div>
            {/if}
          </div>

          <!-- Messages - Scrollable Only -->
          <div bind:this={messagesContainer} class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 messages-container" style="padding-bottom: 100px;">
            <!-- Date Separator -->
            <div class="flex items-center justify-center">
              <span class="text-[11px] text-gray-500 bg-white px-3 py-1 rounded-full">{i18n.messages_today()}</span>
            </div>
            
            <!-- Show messages for the selected conversation -->
            {#each selectedConvMessages() as message}
              <div class="flex {message.sender_id === data.user?.id ? 'justify-end' : 'justify-start'} px-1">
                <div class="max-w-[80%] sm:max-w-[70%]">
                  <div class="{message.sender_id === data.user?.id ? 'bg-black text-white rounded-2xl rounded-br-md' : 'bg-white text-gray-900 rounded-2xl rounded-bl-md shadow-xs border border-gray-200'} px-4 py-3">
                    <p class="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  <div class="flex items-center justify-between mt-1.5 px-2">
                    <p class="text-[11px] text-gray-500 {message.sender_id === data.user?.id ? 'order-2' : ''}">
                      {timeAgo(message.created_at)}
                    </p>
                    
                    <!-- Message Status for sent messages -->
                    {#if message.sender_id === data.user?.id}
                      <div class="flex items-center space-x-1 text-[10px] text-gray-400">
                        {#if message.status === 'sending'}
                          <svg class="w-3 h-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke-width="2" />
                          </svg>
                          <span>Sending...</span>
                        {:else if message.status === 'sent' || (!message.status && !message.delivered_at)}
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Sent</span>
                        {:else if message.status === 'delivered' || message.delivered_at}
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Delivered</span>
                        {:else if message.status === 'read' || message.is_read}
                          <svg class="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                          </svg>
                          <span class="text-blue-500">Read</span>
                        {/if}
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            {/each}
            
            <!-- Typing Indicator -->
            {#if selectedConversation()}
              {@const conv = conversations().find(c => c.id === selectedConversation())}
              {@const otherUserId = conv?.userId}
              {@const typingUser = Array.from(typingUsers.values()).find(u => 
                u.conversationId === selectedConversation()
              )}
              {#if typingUser}
                <TypingIndicator 
                  show={true}
                  username={typingUser.username}
                />
              {/if}
            {/if}
          </div>

          <!-- Message Input - Fixed at Bottom -->
          <div class="chat-input-fixed sm:relative sm:position-static border-t border-gray-200 p-4 bg-white">
            <!-- Quick Actions -->
            <div class="flex gap-2 mb-2 overflow-x-auto scrollbar-hide">
              <button class="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap">
                <span class="text-lg">💰</span>
                <span class="text-xs font-medium">{i18n.messages_makeOffer()}</span>
              </button>
              <button class="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap">
                <span class="text-lg">📦</span>
                <span class="text-xs font-medium">{i18n.messages_bundle()}</span>
              </button>
              <button class="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap" aria-label="Share location">
                <span class="text-lg">📍</span>
                <span class="text-xs font-medium">{i18n.messages_location()}</span>
              </button>
              <button class="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap" aria-label="Upload photo">
                <span class="text-lg">📸</span>
                <span class="text-xs font-medium">{i18n.messages_photo()}</span>
              </button>
            </div>
            
            <div class="flex items-center space-x-2">
              <div class="flex-1 relative">
                <input
                  id="message-input"
                  type="text"
                  bind:value={messageText}
                  onkeydown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      sendMessage();
                    } else {
                      handleTyping();
                    }
                  }}
                  oninput={handleTyping}
                  placeholder={i18n.messages_messageInput()}
                  aria-label="Type a message"
                  class="w-full px-4 py-2.5 bg-gray-50 rounded-full text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white"
                />
              </div>
              <button 
                onclick={sendMessage}
                class="p-2.5 bg-black text-white rounded-full hover:bg-gray-800 transition-colors {messageText.trim() && !isSending ? '' : 'opacity-50 cursor-not-allowed'}"
                disabled={!messageText.trim() || isSending}
                aria-label="Send message"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      {:else}
        <!-- No Conversation Selected (Desktop) -->
        <div class="hidden sm:flex sm:col-span-2 lg:col-span-3 bg-white items-center justify-center">
          <div class="text-center">
            <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">{i18n.messages_selectConversation()}</h3>
            <p class="text-gray-600">{i18n.messages_chooseMessage()}</p>
          </div>
        </div>
      {/if}
    </div>
  </div>
  
  <!-- Bottom Navigation - Hide in chat -->
  {#if !selectedConversation()}
    <div class="shrink-0">
      <BottomNav 
        currentPath={$page.url.pathname}
        isNavigating={!!$navigating}
        navigatingTo={$navigating?.to?.url.pathname}
        unreadMessageCount={$unreadMessageCount}
        labels={{
          home: i18n.nav_home(),
          search: i18n.nav_search(),
          sell: i18n.nav_sell(),
          messages: i18n.nav_messages(),
          profile: i18n.nav_profile()
        }}
      />
    </div>
  {/if}
</div>

<style>
  /* Hide scrollbar for horizontal scroll */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
</style>