<script lang="ts">
  import { Avatar, Button } from '@repo/ui';
  import Header from '$lib/components/Header.svelte';
  import BottomNav from '$lib/components/BottomNav.svelte';
  
  // Mock conversations
  const conversations = [
    {
      id: 'conv-1',
      userId: 'user-1',
      userName: 'Emma Wilson',
      userAvatar: '/placeholder-product.svg',
      lastMessage: 'Is this still available?',
      lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      unread: true,
      isOffer: false,
      productTitle: 'Vintage Levi\'s Jacket',
      productImage: '/placeholder-product.svg',
      productPrice: 89
    },
    {
      id: 'conv-2',
      userId: 'user-2',
      userName: 'John Smith',
      userAvatar: '/placeholder-product.svg',
      lastMessage: 'Bundle offer: 3 items for $150',
      lastMessageTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      unread: true,
      isOffer: true,
      offerStatus: 'pending',
      bundleItems: [
        { title: 'Nike Hoodie', price: 65 },
        { title: 'Adidas Sneakers', price: 80 },
        { title: 'Vintage Cap', price: 25 }
      ],
      offerPrice: 150
    },
    {
      id: 'conv-3',
      userId: 'user-3',
      userName: 'Sarah Johnson',
      userAvatar: '/placeholder-product.svg',
      lastMessage: 'Thanks for the quick shipping!',
      lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      unread: false,
      isOffer: false,
      productTitle: 'Zara Dress',
      productImage: '/placeholder-product.svg',
      productPrice: 45
    },
    {
      id: 'conv-4',
      userId: 'user-4',
      userName: 'Mike Chen',
      userAvatar: '/placeholder-product.svg',
      lastMessage: 'Can you do $40?',
      lastMessageTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      unread: false,
      isOffer: false,
      productTitle: 'H&M Shirt',
      productImage: '/placeholder-product.svg',
      productPrice: 35
    }
  ];
  
  let selectedConversation = $state<string | null>(null);
  let messageText = $state('');
  let activeTab = $state<'all' | 'buying' | 'selling' | 'offers'>('all');
  
  // Mock messages for selected conversation
  const messages = [
    {
      id: 'msg-1',
      senderId: 'user-1',
      text: 'Hi, is this still available?',
      time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      isMe: false
    },
    {
      id: 'msg-2',
      senderId: 'me',
      text: 'Yes, it\'s still available!',
      time: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
      isMe: true
    },
    {
      id: 'msg-3',
      senderId: 'user-1',
      text: 'Great! What\'s the condition like?',
      time: new Date(Date.now() - 2.2 * 60 * 60 * 1000).toISOString(),
      isMe: false
    },
    {
      id: 'msg-4',
      senderId: 'me',
      text: 'It\'s in excellent condition, only worn twice. No stains or damage.',
      time: new Date(Date.now() - 2.1 * 60 * 60 * 1000).toISOString(),
      isMe: true
    },
    {
      id: 'msg-5',
      senderId: 'user-1',
      text: 'Is this still available?',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isMe: false
    }
  ];
  
  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    const weeks = Math.floor(days / 7);
    return `${weeks}w`;
  };
  
  function sendMessage() {
    if (messageText.trim()) {
      console.log('Sending:', messageText);
      messageText = '';
    }
  }
  
  function acceptOffer(convId: string) {
    console.log('Accept offer:', convId);
  }
  
  function declineOffer(convId: string) {
    console.log('Decline offer:', convId);
  }
  
  function counterOffer(convId: string) {
    console.log('Counter offer:', convId);
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
        
        <!-- Tabs -->
        <div class="px-4 sm:px-6 lg:px-8 flex space-x-2 overflow-x-auto scrollbar-hide pb-2">
          <button
            onclick={() => activeTab = 'all'}
            class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
              {activeTab === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
          >
            All
          </button>
          <button
            onclick={() => activeTab = 'buying'}
            class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
              {activeTab === 'buying' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
          >
            Buying
          </button>
          <button
            onclick={() => activeTab = 'selling'}
            class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
              {activeTab === 'selling' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
          >
            Selling
          </button>
          <button
            onclick={() => activeTab = 'offers'}
            class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors relative
              {activeTab === 'offers' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
          >
            Offers
            {#if activeTab !== 'offers'}
              <span class="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                2
              </span>
            {/if}
          </button>
        </div>
        <div class="h-1"></div>
      </div>
    </div>
  {/if}

  <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 {selectedConversation ? '' : 'pb-20 sm:pb-0'}">
    <div class="sm:grid sm:grid-cols-3 lg:grid-cols-4 {selectedConversation ? 'sm:h-[calc(100vh-80px)]' : 'sm:h-[calc(100vh-180px)]'}">
      <!-- Conversations List -->
      <div class="sm:col-span-1 lg:col-span-1 bg-white sm:border-r overflow-y-auto {selectedConversation ? 'hidden sm:block' : ''} {selectedConversation ? '' : 'h-[calc(100vh-160px)] sm:h-auto'}">
        {#each conversations as conv}
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
        {@const conv = conversations.find(c => c.id === selectedConversation)}
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
                  <p class="text-xs text-gray-500">Active 2h ago</p>
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
            
            {#each messages as message}
              <div class="flex {message.isMe ? 'justify-end' : 'justify-start'} px-1">
                <div class="max-w-[80%] sm:max-w-[70%]">
                  <div class="{message.isMe ? 'bg-black text-white rounded-2xl rounded-br-md' : 'bg-white text-gray-900 rounded-2xl rounded-bl-md shadow-sm border'} px-4 py-3">
                    <p class="text-sm leading-relaxed">{message.text}</p>
                  </div>
                  <p class="text-[11px] text-gray-500 mt-1.5 px-2 {message.isMe ? 'text-right' : ''}">
                    {timeAgo(message.time)}
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