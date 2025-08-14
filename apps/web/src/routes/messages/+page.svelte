<script lang="ts">
  import { Avatar, Button, TabGroup } from '@repo/ui';
  import Header from '$lib/components/Header.svelte';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import type { PageData } from './$types';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  // ULTRA SIMPLE conversation logic
  const allConversations = $derived(() => {
    console.log('=== BUILDING CONVERSATIONS ===');
    console.log('data.messages?.length:', data.messages?.length);
    console.log('data.conversationParam:', data.conversationParam);
    
    const convMap = new Map();
    
    // First: process existing messages into conversations (GROUP BY USER ONLY)
    if (data.messages && data.messages.length > 0) {
      data.messages.forEach(msg => {
        const otherUserId = msg.sender_id === data.user?.id ? msg.receiver_id : msg.sender_id;
        const key = otherUserId; // GROUP BY USER ONLY, NOT PRODUCT
        
        if (!convMap.has(key)) {
          const otherUser = msg.sender_id === data.user?.id ? msg.receiver : msg.sender;
          const product = msg.product;
          
          convMap.set(key, {
            id: key,
            userId: otherUserId,
            userName: otherUser?.username || otherUser?.full_name || 'Unknown User',
            userAvatar: otherUser?.avatar_url,
            lastMessage: msg.content,
            lastMessageTime: msg.created_at,
            unread: !msg.is_read && msg.sender_id !== data.user?.id,
            productTitle: product?.title || 'Mixed products',
            productImage: product?.images?.[0]?.image_url || '/placeholder-product.svg',
            productPrice: product?.price || 0,
            messages: [msg],
            lastActiveAt: otherUser?.last_active_at
          });
        } else {
          const conv = convMap.get(key);
          conv.messages.push(msg);
          if (new Date(msg.created_at) > new Date(conv.lastMessageTime)) {
            conv.lastMessage = msg.content;
            conv.lastMessageTime = msg.created_at;
            // Update product info to latest message's product
            const product = msg.product;
            if (product) {
              conv.productTitle = product.title;
              conv.productImage = product.images?.[0]?.image_url || '/placeholder-product.svg';
              conv.productPrice = product.price;
            }
          }
        }
      });
    }
    
    // Second: if we have a conversation param from URL, ensure it exists
    if (data.conversationParam && data.conversationUser) {
      const [sellerId, productId] = data.conversationParam.split('__');
      const key = sellerId; // Use just the user ID
      if (!convMap.has(key)) {
        convMap.set(key, {
          id: key,
          userId: sellerId,
          userName: data.conversationUser.username || data.conversationUser.full_name || 'Unknown User',
          userAvatar: data.conversationUser.avatar_url,
          lastMessage: 'Start a conversation...',
          lastMessageTime: '2024-01-01T00:00:00.000Z',
          unread: false,
          productTitle: data.conversationProduct?.title || 'Product',
          productImage: data.conversationProduct?.images?.[0]?.image_url || '/placeholder-product.svg',
          productPrice: data.conversationProduct?.price || 0,
          messages: [],
          lastActiveAt: data.conversationUser.last_active_at
        });
      }
    }
    
    const result = Array.from(convMap.values()).sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
    
    console.log('Built conversations:');
    result.forEach(conv => console.log(`- ${conv.userName} (${conv.id}): ${conv.messages?.length} messages`));
    
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
          conv.messages.some(msg => msg.sender_id === data.user?.id)
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
  
  let selectedConversation = $state<string | null>(null);
  
  // Auto-select conversation from data
  $effect(() => {
    if (data.conversationParam) {
      const [sellerId, productId] = data.conversationParam.split('__');
      // Find the OTHER user ID (not the current user)
      const otherUserId = sellerId === data.user?.id ? 
        data.conversationUser?.id || sellerId : 
        sellerId;
      selectedConversation = otherUserId;
      console.log('Auto-selected conversation for other user:', otherUserId);
    }
  });
  let messageText = $state('');
  let activeTab = $state<'all' | 'buying' | 'selling' | 'offers' | 'unread'>('all');
  
  const selectedConvMessages = $derived(() => {
    console.log('=== SELECTED CONV MESSAGES ===');
    console.log('selectedConversation:', selectedConversation);
    if (!selectedConversation) {
      console.log('No selected conversation');
      return [];
    }
    const conv = conversations().find(c => c.id === selectedConversation);
    console.log('Found conv:', conv?.userName, 'with', conv?.messages?.length, 'messages');
    const messages = conv?.messages?.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ) || [];
    console.log('Returning', messages.length, 'messages');
    return messages;
  });
  
  const timeAgo = (date: string) => {
    // Use a fixed time to prevent hydration mismatch
    return 'now';
  };
  
  const getActiveStatus = (lastActiveAt: string | null) => {
    // Use fixed status to prevent hydration mismatch
    return 'Active now';
  };
  
  async function sendMessage() {
    console.log('=== SEND MESSAGE DEBUG ===');
    console.log('messageText:', messageText);
    console.log('selectedConversation:', selectedConversation);
    console.log('data.user:', data.user?.id);
    console.log('data.conversationParam:', data.conversationParam);
    
    if (!messageText.trim() || !selectedConversation || !data.user) {
      console.log('Validation failed');
      return;
    }
    
    // selectedConversation is now just the user ID (not user__product)
    const recipientId = selectedConversation;
    const productId = data.conversationParam ? data.conversationParam.split('__')[1] : null;
    
    console.log('recipientId:', recipientId);
    console.log('productId:', productId);
    
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
      
      console.log('Sending message data:', messageData);
      
      const { error } = await data.supabase
        .from('messages')
        .insert(messageData);
      
      console.log('Insert result error:', error);
      
      if (error) {
        throw error;
      }
      
      messageText = '';
      await invalidate('messages:all');
    } catch (err) {
      console.error('Message send error:', err);
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
  {#if !selectedConversation}
    <div class="bg-white border-b sticky top-14 sm:top-16 z-30">
      <div class="max-w-7xl mx-auto">
        <div class="px-4 sm:px-6 lg:px-8 py-3">
          <h1 class="text-lg font-semibold text-gray-900">Inbox</h1>
        </div>
        
        <!-- Mobile Filter Pills (Full Width) -->
        <div class="sm:hidden">
          <div class="grid grid-cols-5 gap-1 px-4 pb-3">
            {#each [
              { id: 'all', label: 'All', count: allConversations().length },
              { id: 'unread', label: 'Unread', count: allConversations().filter(c => c.unread).length },
              { id: 'buying', label: 'Buying' },
              { id: 'selling', label: 'Selling' },
              { id: 'offers', label: 'Offers', count: allConversations().filter(c => c.isOffer).length }
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
              { id: 'all', label: 'All', count: allConversations().length },
              { id: 'unread', label: 'Unread', count: allConversations().filter(c => c.unread).length },
              { id: 'buying', label: 'Buying' },
              { id: 'selling', label: 'Selling' },
              { id: 'offers', label: 'Offers', count: allConversations().filter(c => c.isOffer).length }
            ]}
            {activeTab}
            onTabChange={(tab) => activeTab = tab}
          />
        </div>
        <div class="h-1"></div>
      </div>
    </div>
  {/if}

  <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 {selectedConversation ? '' : 'pb-20 sm:pb-0'}">
    <div class="sm:grid sm:grid-cols-3 lg:grid-cols-4 {selectedConversation ? 'sm:h-[calc(100vh-80px)]' : 'sm:h-[calc(100vh-180px)]'}">
      <!-- Conversations List -->
      <div class="sm:col-span-1 lg:col-span-1 bg-white sm:border-r overflow-y-auto {selectedConversation ? 'hidden sm:block' : ''} {selectedConversation ? '' : 'h-[calc(100vh-160px)] sm:h-auto'}">
        {#each conversations() as conv}
          <button
            onclick={() => selectedConversation = conv.id}
            class="w-full px-4 py-4 hover:bg-gray-50 border-b transition-colors text-left min-h-[68px]
              {selectedConversation === conv.id ? 'bg-gray-50' : ''}"
          >
            <div class="flex items-start space-x-3">
              <div class="relative flex-shrink-0">
                <Avatar src={conv.userAvatar} name={conv.userName} size="md" />
                {#if conv.unread}
                  <span class="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-blue-500 rounded-full border-2 border-white"></span>
                {/if}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start">
                  <h3 class="font-medium text-gray-900 text-sm truncate">{conv.userName}</h3>
                  <span class="text-[11px] text-gray-500 flex-shrink-0 ml-2">{timeAgo(conv.lastMessageTime)}</span>
                </div>
                
                {#if conv.isOffer}
                  <div class="inline-flex items-center space-x-1 mt-1">
                    <span class="bg-blue-100 text-blue-700 text-[10px] font-medium px-1.5 py-0.5 rounded">Offer</span>
                    <span class="text-xs font-semibold text-gray-900">${conv.offerPrice}</span>
                  </div>
                {:else if conv.productTitle}
                  <div class="flex items-center space-x-2 mt-1">
                    <img src={conv.productImage} alt={conv.productTitle} class="w-6 h-6 rounded object-cover" />
                    <span class="text-xs text-gray-600 truncate">{conv.productTitle}</span>
                  </div>
                {/if}
                
                <p class="text-sm text-gray-600 truncate mt-1 {conv.unread ? 'font-semibold text-gray-900' : ''}">
                  {conv.lastMessage}
                </p>
              </div>
            </div>
          </button>
        {/each}
      </div>

      <!-- Chat View -->
      {#if selectedConversation}
        {@const conv = conversations().find(c => c.id === selectedConversation)}
        <div class="sm:col-span-2 lg:col-span-3 bg-white flex flex-col {selectedConversation ? 'fixed sm:relative inset-0 top-14 sm:top-0 z-40 sm:z-auto h-[calc(100vh-56px)] sm:h-full' : 'h-full'}">
          <!-- Chat Header - Sticky -->
          <div class="bg-white border-b px-4 py-3 flex-shrink-0">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <button
                  onclick={() => selectedConversation = null}
                  class="sm:hidden -ml-2"
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
                <button class="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
                <button class="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
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
                    <p class="text-xs font-semibold text-blue-900 uppercase tracking-wide">Bundle Offer</p>
                    <p class="text-[11px] text-blue-700">{conv.bundleItems?.length} items • Save ${(conv.bundleItems?.reduce((sum, item) => sum + item.price, 0) || 0) - conv.offerPrice}</p>
                  </div>
                  <p class="text-lg font-bold text-blue-900">${conv.offerPrice}</p>
                </div>
                {#if conv.offerStatus === 'pending'}
                  <div class="flex space-x-2">
                    <button onclick={() => acceptOffer(conv.id)} class="flex-1 py-1.5 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800">Accept</button>
                    <button onclick={() => declineOffer(conv.id)} class="flex-1 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-lg border border-gray-300 hover:bg-gray-50">Decline</button>
                    <button onclick={() => counterOffer(conv.id)} class="flex-1 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-lg border border-gray-300 hover:bg-gray-50">Counter</button>
                  </div>
                {/if}
              </div>
            {:else if conv?.productTitle}
              <a href="/product/{conv.id}" class="mt-3 flex items-center space-x-3 p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <img src={conv.productImage} alt={conv.productTitle} class="w-10 h-10 rounded-lg object-cover" />
                <div class="flex-1">
                  <p class="text-xs font-medium text-gray-900">{conv.productTitle}</p>
                  <p class="text-sm font-bold">${conv.productPrice}</p>
                </div>
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            {/if}
          </div>

          <!-- Messages - Scrollable Only -->
          <div class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            <!-- Date Separator -->
            <div class="flex items-center justify-center">
              <span class="text-[11px] text-gray-500 bg-white px-3 py-1 rounded-full">Today</span>
            </div>
            
            <!-- Show ALL messages for this conversation, bypassing complex filtering -->
            {#each data.messages.filter(m => (m.sender_id === data.user?.id && m.receiver_id === selectedConversation) || (m.receiver_id === data.user?.id && m.sender_id === selectedConversation)).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) as message}
              <div class="flex {message.sender_id === data.user?.id ? 'justify-end' : 'justify-start'} px-1">
                <div class="max-w-[80%] sm:max-w-[70%]">
                  <div class="{message.sender_id === data.user?.id ? 'bg-black text-white rounded-2xl rounded-br-md' : 'bg-white text-gray-900 rounded-2xl rounded-bl-md shadow-sm border'} px-4 py-3">
                    <p class="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  <p class="text-[11px] text-gray-500 mt-1.5 px-2 {message.sender_id === data.user?.id ? 'text-right' : ''}">
                    {timeAgo(message.created_at)}
                  </p>
                </div>
              </div>
            {/each}
          </div>

          <!-- Message Input - Fixed at Bottom -->
          <div class="bg-white border-t p-4 pb-6 sm:pb-3 flex-shrink-0">
            <!-- Quick Actions -->
            <div class="flex gap-2 mb-2 overflow-x-auto scrollbar-hide">
              <button class="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap">
                <span class="text-lg">💰</span>
                <span class="text-xs font-medium">Make Offer</span>
              </button>
              <button class="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap">
                <span class="text-lg">📦</span>
                <span class="text-xs font-medium">Bundle</span>
              </button>
              <button class="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap">
                <span class="text-lg">📍</span>
                <span class="text-xs font-medium">Location</span>
              </button>
              <button class="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap">
                <span class="text-lg">📸</span>
                <span class="text-xs font-medium">Photo</span>
              </button>
            </div>
            
            <div class="flex items-center space-x-2">
              <div class="flex-1 relative">
                <input
                  type="text"
                  bind:value={messageText}
                  onkeydown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Message..."
                  class="w-full px-4 py-2.5 bg-gray-50 rounded-full text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white"
                />
              </div>
              <button 
                onclick={sendMessage}
                class="p-2.5 bg-black text-white rounded-full hover:bg-gray-800 transition-colors {messageText.trim() ? '' : 'opacity-50 cursor-not-allowed'}"
                disabled={!messageText.trim()}
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
            <h3 class="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
            <p class="text-gray-600">Choose a message from the list to start chatting</p>
          </div>
        </div>
      {/if}
    </div>
  </div>
  
  <!-- Bottom Navigation - Hide in chat -->
  {#if !selectedConversation}
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