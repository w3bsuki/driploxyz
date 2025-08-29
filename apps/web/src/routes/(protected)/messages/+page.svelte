<script lang="ts">
  import { BottomNav } from '@repo/ui';
  import { messageNotificationActions, unreadMessageCount } from '$lib/stores/messageNotifications';
  import ConversationList from '$lib/components/ConversationList.svelte';
  import MessageThread from '$lib/components/MessageThread.svelte';
  import MessageInput from '$lib/components/MessageInput.svelte';
  import RealtimeManager from '$lib/components/RealtimeManager.svelte';
  import { createBrowserSupabaseClient } from '$lib/supabase/client';
  import type { PageData } from './$types';
  import * as i18n from '@repo/i18n';
  import { page, navigating } from '$app/stores';
  import { goto } from '$app/navigation';
  import { dev } from '$app/environment';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  const supabase = createBrowserSupabaseClient();
  
  // Core state management
  let messageText = $state('');
  let activeTab = $state<'all' | 'buying' | 'selling' | 'offers' | 'unread'>('all');
  let messagesContainer = $state<HTMLDivElement | null>(null);
  let connectionStatus = $state<'connected' | 'connecting' | 'disconnected'>('connecting');
  let onlineUsers = $state<Set<string>>(new Set());
  let typingUsers = $state<Map<string, { username: string; conversationId: string }>>(new Map());
  let isSending = $state(false);
  let isTyping = $state(false);
  let typingTimeout: NodeJS.Timeout | null = null;
  
  // Optimized message state - single source of truth
  let conversations = $state<Map<string, any>>(new Map());
  let conversationVersion = $state(0); // Force reactivity trigger
  
  // Development-only logging
  function logDebug(message: string, data?: any) {
    if (dev) {
      console.log(message, data);
    }
  }
  
  // Initialize conversations from server data - run only once
  let isInitialized = $state(false);
  $effect(() => {
    if (!isInitialized && data.messages && data.messages.length > 0) {
      initializeConversations(data.messages);
      isInitialized = true;
    }
    
    // Set unread count
    if (data.unreadCount !== undefined) {
      messageNotificationActions.setUnreadCount(data.unreadCount);
    }
  });
  
  // Initialize conversations from messages - OPTIMIZED VERSION
  function initializeConversations(messages: any[]) {
    const convMap = new Map();
    
    messages.forEach(msg => {
      const otherUserId = msg.sender_id === data.user?.id ? msg.receiver_id : msg.sender_id;
      const productId = msg.product_id;
      const key = `${otherUserId}__${productId || 'general'}`;
      
      if (!convMap.has(key)) {
        const otherUser = msg.sender_id === data.user?.id ? msg.receiver : msg.sender;
        const product = msg.product;
        
        convMap.set(key, {
          id: key,
          userId: otherUserId,
          productId: productId,
          userName: otherUser?.username || otherUser?.full_name || 'Unknown User',
          userAvatar: otherUser?.avatar_url,
          lastMessage: msg.content,
          lastMessageTime: msg.created_at,
          unread: !msg.is_read && msg.sender_id !== data.user?.id,
          productTitle: product?.title || null,
          productImage: product?.images?.[0]?.image_url || null,
          productPrice: product?.price || 0,
          messages: [msg],
          lastActiveAt: otherUser?.last_active_at,
          isProductConversation: !!productId
        });
      } else {
        const conv = convMap.get(key);
        conv.messages.push(msg);
        
        // Update conversation metadata if this is a newer message
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
    
    // Add URL conversation if it doesn't exist
    if (data.conversationParam && data.conversationUser) {
      const parts = data.conversationParam.split('__');
      const sellerId = parts[0];
      const productId = parts[1] === 'general' ? null : parts[1];
      const key = `${sellerId}__${productId || 'general'}`;
      
      if (!convMap.has(key)) {
        convMap.set(key, {
          id: key,
          userId: sellerId,
          productId: productId,
          userName: data.conversationUser.username || data.conversationUser.full_name || 'Unknown User',
          userAvatar: data.conversationUser.avatar_url,
          lastMessage: 'Start a conversation...',
          lastMessageTime: new Date().toISOString(),
          unread: false,
          productTitle: data.conversationProduct?.title || null,
          productImage: data.conversationProduct?.images?.[0]?.image_url || null,
          productPrice: data.conversationProduct?.price || 0,
          messages: [],
          lastActiveAt: data.conversationUser.last_active_at,
          isProductConversation: !!productId
        });
      }
    }
    
    // IMPORTANT: Force reactivity by creating a new Map
    conversations = new Map(convMap);
    conversationVersion++; // Increment version to force all derived values to recalculate
    logDebug('🏗️ Conversations initialized:', convMap.size, 'version:', conversationVersion);
    
    // Force scroll to bottom after state update
    setTimeout(() => scrollToBottom(), 100);
  }
  
  // Helper functions
  function parseConversationId(convId: string): { userId: string; productId: string | null } {
    if (convId.includes('__')) {
      const [userId, productId] = convId.split('__');
      return { userId, productId: productId === 'general' ? null : productId };
    }
    if (convId.includes('_product_')) {
      const [userId, , productId] = convId.split('_');
      return { userId, productId };
    }
    const [userId] = convId.split('_');
    return { userId, productId: null };
  }
  
  // Get selected conversation from URL
  const selectedConversation = $derived(() => {
    const convParam = $page.url.searchParams.get('conversation');
    return convParam || data.conversationParam || null;
  });
  
  // Filtered conversations based on active tab
  const filteredConversations = $derived.by(() => {
    const allConvs = Array.from(conversations.values()).sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
    
    switch (activeTab) {
      case 'unread':
        return allConvs.filter(conv => conv.unread);
      case 'buying':
        return allConvs.filter(conv => 
          conv.messages.some((msg: any) => msg.receiver_id === data.user?.id)
        );
      case 'selling':
        return allConvs.filter(conv => 
          conv.messages.some((msg: any) => msg.sender_id === data.user?.id) &&
          conv.isProductConversation
        );
      case 'offers':
        return allConvs.filter(conv => conv.isOffer);
      case 'all':
      default:
        return allConvs;
    }
  });
  
  // Selected conversation messages - force reactivity with version
  const selectedMessages = $derived.by(() => {
    const selected = selectedConversation();
    const version = conversationVersion; // Access version to create dependency
    if (selected && conversations.has(selected)) {
      const conv = conversations.get(selected);
      if (conv?.messages) {
        logDebug('📬 Updating selected messages, version:', version, 'count:', conv.messages.length);
        return [...conv.messages].sort((a: any, b: any) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      }
    }
    return [];
  });
  
  // Auto-scroll only when new messages are added
  let previousMessageCount = 0;
  $effect(() => {
    if (selectedMessages.length > previousMessageCount) {
      previousMessageCount = selectedMessages.length;
      requestAnimationFrame(() => scrollToBottom());
    }
  });
  
  const currentConversation = $derived(() => {
    const selected = selectedConversation();
    return selected ? conversations.get(selected) : null;
  });
  
  // Scroll management
  function scrollToBottom() {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
  
  // Real-time message handling - SIMPLE AND WORKING
  function handleMessagesChange(newMessages: any[]) {
    logDebug('📨 Real-time messages received:', newMessages.length);
    
    // Just reinitialize conversations - don't update data.messages to avoid loops
    initializeConversations(newMessages);
  }
  
  function handleConnectionStatusChange(status: 'connected' | 'connecting' | 'disconnected') {
    connectionStatus = status;
  }
  
  function handleOnlineUsersChange(users: Set<string>) {
    onlineUsers = users;
  }
  
  function handleTypingUsersChange(users: Map<string, any>) {
    typingUsers = users;
  }
  
  // Event handlers
  function handleTabChange(tab: string) {
    activeTab = tab as 'all' | 'buying' | 'selling' | 'offers' | 'unread';
  }
  
  function handleConversationSelect(conversationId: string) {
    goto(`/messages?conversation=${conversationId}`);
  }
  
  function handleBackToList() {
    goto('/messages');
  }
  
  function handleUpdateText(text: string) {
    messageText = text;
  }
  
  // Typing indicator with debouncing
  async function handleTyping() {
    if (!selectedConversation() || !data.user || !supabase) return;
    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    if (!isTyping) {
      isTyping = true;
      try {
        await supabase.rpc('update_user_presence', {
          p_status: 'online',
          p_typing_in: selectedConversation()
        });
      } catch (e) {
        logDebug('Could not update typing status:', e);
      }
    }
    
    typingTimeout = setTimeout(async () => {
      isTyping = false;
      if (supabase) {
        try {
          await supabase.rpc('update_user_presence', {
            p_status: 'online',
            p_typing_in: null
          });
        } catch (e) {
          logDebug('Could not clear typing status:', e);
        }
      }
    }, 3000);
  }

  // Optimized message sending with proper state management
  async function sendMessage() {
    if (isSending || !messageText.trim() || !selectedConversation()) return;
    
    const text = messageText.trim();
    const { userId: recipientId, productId } = parseConversationId(selectedConversation()!);
    
    // Create optimistic message
    const optimisticMessage = {
      id: crypto.randomUUID(),
      sender_id: data.user?.id,
      receiver_id: recipientId,
      product_id: productId === 'general' ? null : productId,
      content: text,
      created_at: new Date().toISOString(),
      is_read: false,
      status: 'sending',
      sender: data.user,
      receiver: null,
      product: null
    };
    
    // Clear input and set sending state
    messageText = '';
    isSending = true;
    
    // Add optimistic message to conversation - ensure it shows in long chats
    const convKey = selectedConversation()!;
    const conv = conversations.get(convKey);
    if (conv) {
      // Create a completely new conversation object to ensure reactivity
      const updatedConv = {
        ...conv,
        messages: [...conv.messages, optimisticMessage],
        lastMessage: text,
        lastMessageTime: optimisticMessage.created_at
      };
      
      // Create new Map to trigger all reactive dependencies
      const newConversations = new Map(conversations);
      newConversations.set(convKey, updatedConv);
      conversations = newConversations;
      
      logDebug('💬 Added optimistic message to conversation with', conv.messages.length, 'existing messages');
    }
    
    logDebug('📝 Optimistic message added:', optimisticMessage.id);
    
    // Scroll to bottom
    requestAnimationFrame(() => scrollToBottom());
    
    const formData = new FormData();
    formData.append('content', text);
    formData.append('receiver_id', recipientId);
    formData.append('product_id', productId || 'general');
    
    try {
      const response = await fetch('/messages?/sendMessage', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        logDebug('✅ Message sent successfully');
        
        // Mark optimistic message as sent, real-time will replace it
        const conv = conversations.get(convKey);
        if (conv) {
          conv.messages = conv.messages.map((msg: any) => 
            msg.id === optimisticMessage.id ? { ...msg, status: 'sent' } : msg
          );
          conversations.set(convKey, { ...conv });
          conversations = new Map(conversations);
        }
        
        // The real message will come through real-time subscription
        // and replace this optimistic message
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      logDebug('❌ Error sending message:', error);
      
      // Remove optimistic message on error
      const conv = conversations.get(convKey);
      if (conv) {
        conv.messages = conv.messages.filter((msg: any) => msg.id !== optimisticMessage.id);
        conversations.set(convKey, { ...conv });
        conversations = new Map(conversations);
      }
      
      messageText = text; // Restore message text
      alert('Failed to send message. Please try again.');
    } finally {
      isSending = false;
    }
  }
  
</script>

<svelte:head>
  <title>Messages - Driplo</title>
</svelte:head>

<!-- RealtimeManager handles all real-time subscriptions -->
<RealtimeManager 
  supabase={supabase}
  user={data.user}
  messages={data.messages || []}
  onMessageChange={handleMessagesChange}
  onConnectionStatusChange={handleConnectionStatusChange}
  onOnlineUsersChange={handleOnlineUsersChange}
  onTypingUsersChange={handleTypingUsersChange}
/>

<div class="h-screen bg-gray-50 flex flex-col overflow-hidden">
  <!-- Page Header - Hidden on mobile when in conversation -->
  {#if !selectedConversation()}
    <div class="bg-white border-b border-gray-200 shrink-0">
      <div class="max-w-7xl mx-auto">
        <div class="px-4 sm:px-6 lg:px-8 py-3">
          <h1 class="text-lg font-semibold text-gray-900">{i18n.messages_inbox()}</h1>
        </div>
      </div>
    </div>
  {/if}

  <div class="flex-1 max-w-7xl mx-auto sm:px-6 lg:px-8 overflow-hidden flex flex-col w-full">
    <div class="flex-1 sm:grid sm:grid-cols-3 lg:grid-cols-4 overflow-hidden h-full">
      <!-- Conversations List -->
      <ConversationList
        conversations={filteredConversations}
        allConversations={Array.from(conversations.values())}
        {activeTab}
        selectedConversationId={selectedConversation()}
        onTabChange={handleTabChange}
        onConversationSelect={handleConversationSelect}
      />

      <!-- Chat Thread or Empty State -->
      {#if selectedConversation()}
        <div class="sm:col-span-2 lg:col-span-3 bg-white flex flex-col h-full overflow-hidden">
          <MessageThread
            messages={selectedMessages}
            conversation={currentConversation()}
            currentUserId={data.user?.id || ''}
            {onlineUsers}
            {typingUsers}
            onBackToList={handleBackToList}
            bind:messagesContainer
          />
          
          <!-- Message Input for selected conversation -->
          <MessageInput
            {messageText}
            {isSending}
            onSendMessage={sendMessage}
            onTyping={handleTyping}
            onUpdateText={handleUpdateText}
          />
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