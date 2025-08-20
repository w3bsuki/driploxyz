<script lang="ts">
  import { Avatar, Button, TabGroup, TypingIndicator } from '@repo/ui';
  import Header from '$lib/components/Header.svelte';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import { messageNotificationActions } from '$lib/stores/messageNotifications';
  import type { PageData } from './$types';
  import * as i18n from '@repo/i18n';
  import { onMount, onDestroy } from 'svelte';
  import type { RealtimeChannel } from '@supabase/supabase-js';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  let messageChannel: RealtimeChannel | null = null;

  // Set initial unread count from server data
  $effect(() => {
    if (data.unreadCount !== undefined) {
      messageNotificationActions.setUnreadCount(data.unreadCount);
    }
  });
  
  // Set up real-time subscription for messages
  onMount(() => {
    if (!data.user || !data.supabase) return;
    
    // Subscribe to new messages - only for received messages
    messageChannel = data.supabase
      .channel(`messages_${data.user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${data.user.id}`
        },
        async (payload) => {
          // Force reload the page data
          await invalidate('messages:all');
        }
      )
      .subscribe();
  });
  
  onDestroy(() => {
    if (messageChannel) {
      data.supabase?.removeChannel(messageChannel);
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
  
  // Import needed modules
  import { page } from '$app/stores';
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
  let messageText = $state('');
  let activeTab = $state<'all' | 'buying' | 'selling' | 'offers' | 'unread'>('all');
  let isTyping = $state(false);
  let typingTimeout: NodeJS.Timeout | null = null;
  let typingUsers = $state<Record<string, string>>({});
  
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
  
  const getActiveStatus = (lastActiveAt: string | null) => {
    // Use fixed status to prevent hydration mismatch
    return i18n.messages_activeNow();
  };
  
  // Handle typing indicator
  function handleTyping() {
    if (!selectedConversation() || !data.user) return;
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set typing state
    if (!isTyping) {
      isTyping = true;
      // Send typing indicator to other user via Supabase channel
      // This would be implemented with presence features
    }
    
    // Clear typing after 3 seconds of inactivity
    typingTimeout = setTimeout(() => {
      isTyping = false;
    }, 3000);
  }

  async function sendMessage() {
    
    if (!messageText.trim() || !selectedConversation() || !data.user) {
      return;
    }
    
    // Clear typing indicator
    isTyping = false;
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Extract user ID and product ID from conversation key
    const [recipientId, productId] = selectedConversation().split('__');
    
    if (recipientId === data.user.id) {
      alert('Cannot send message to yourself!');
      return;
    }
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(recipientId)) {
      return;
    }
    
    if (productId && productId !== 'general' && !uuidRegex.test(productId)) {
      return;
    }
    
    try {
      const messageData = {
        sender_id: data.user.id,
        receiver_id: recipientId,
        product_id: productId && productId !== 'general' ? productId : null,
        content: messageText.trim()
      };
      
      const { error } = await data.supabase
        .from('messages')
        .insert(messageData);
      
      if (error) {
        throw error;
      }
      
      messageText = '';
      // Force refresh messages
      await invalidate('messages:all');
    } catch (err) {
      alert('Failed to send message: ' + (err?.message || 'Unknown error'));
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

<div class="min-h-screen bg-gray-50">
  <Header />
  
  <!-- Page Header - Only show when no conversation selected -->
  {#if !selectedConversation()}
    <div class="bg-white border-b border-gray-200 sticky top-14 sm:top-16 z-30">
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

  <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 {selectedConversation() ? '' : 'pb-20 sm:pb-0'}">
    <div class="sm:grid sm:grid-cols-3 lg:grid-cols-4 {selectedConversation() ? 'sm:h-[calc(100vh-80px)]' : 'sm:h-[calc(100vh-180px)]'}">
      <!-- Conversations List -->
      <div class="sm:col-span-1 lg:col-span-1 bg-white sm:border-r sm:border-gray-200 overflow-y-auto {selectedConversation() ? 'hidden sm:block' : ''} {selectedConversation() ? '' : 'h-[calc(100vh-160px)] sm:h-auto'}">
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
        <div class="sm:col-span-2 lg:col-span-3 bg-white flex flex-col {selectedConversation() ? 'fixed sm:relative inset-0 top-14 sm:top-0 z-40 sm:z-auto h-[calc(100vh-56px)] sm:h-full' : 'h-full'}">
          <!-- Chat Header - Sticky -->
          <div class="bg-white border-b border-gray-200 px-4 py-3 shrink-0">
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
                  <p class="text-xs text-gray-500">{getActiveStatus(conv?.lastActiveAt)}</p>
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
          <div class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
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
                    
                    <!-- Read Receipt for sent messages -->
                    {#if message.sender_id === data.user?.id}
                      <div class="flex items-center space-x-1 text-[10px] text-gray-400">
                        {#if message.is_read}
                          <svg class="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                          </svg>
                          <span class="text-blue-500">{i18n.messages_read()}</span>
                        {:else}
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{i18n.messages_sent()}</span>
                        {/if}
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            {/each}
            
            <!-- Typing Indicator -->
            {#if selectedConversation() && typingUsers[selectedConversation()]}
              <TypingIndicator 
                show={true}
                username={typingUsers[selectedConversation()]}
              />
            {/if}
          </div>

          <!-- Message Input - Fixed at Bottom -->
          <div class="bg-white border-t border-gray-200 p-4 pb-6 sm:pb-3 shrink-0">
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
                class="p-2.5 bg-black text-white rounded-full hover:bg-gray-800 transition-colors {messageText.trim() ? '' : 'opacity-50 cursor-not-allowed'}"
                disabled={!messageText.trim()}
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
    <BottomNav />
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