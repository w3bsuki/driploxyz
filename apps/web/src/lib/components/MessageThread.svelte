<script lang="ts">
  import { Avatar, TypingIndicator } from '@repo/ui';
  import * as i18n from '@repo/i18n';
  
  interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
    status?: 'sending' | 'sent' | 'delivered' | 'read';
    is_read?: boolean;
    delivered_at?: string;
  }
  
  interface Conversation {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    productTitle?: string;
    productImage?: string;
    productPrice?: number;
    productId?: string;
    isProductConversation?: boolean;
    isOffer?: boolean;
    offerPrice?: number;
    bundleItems?: any[];
    offerStatus?: string;
    lastActiveAt?: string;
  }
  
  interface Props {
    messages: Message[];
    conversation: Conversation | null;
    currentUserId: string;
    onlineUsers: Set<string>;
    typingUsers: Map<string, any>;
    onBackToList: () => void;
    messagesContainer?: HTMLDivElement | null;
  }
  
  let { messages, conversation, currentUserId, onlineUsers, typingUsers, onBackToList, messagesContainer = $bindable() }: Props = $props();
  
  const timeAgo = (date: string) => {
    return i18n.messages_now();
  };
  
  const getActiveStatus = (userId: string | null, lastActiveAt: string | null) => {
    if (!userId) return '';
    
    if (onlineUsers.has(userId)) {
      return i18n.messages_activeNow();
    }
    
    if (!lastActiveAt) return 'Offline';
    
    const lastActive = new Date(lastActiveAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastActive.getTime()) / 60000);
    
    if (diffMinutes < 5) return 'Active recently';
    if (diffMinutes < 60) return `Active ${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `Active ${Math.floor(diffMinutes / 60)}h ago`;
    return 'Offline';
  };
  
  // Fixed: $derived doesn't take a function, just the expression
  const sortedMessages = $derived(
    messages ? [...messages].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ) : []
  );
  
  // Fixed: $derived doesn't take a function
  const typingUser = $derived(
    Array.from(typingUsers.values()).find(u => 
      u.conversationId === conversation?.id
    )
  );
</script>

{#if conversation}
<div class="flex flex-col flex-1">
  <!-- Chat Header - Fixed -->
  <div class="bg-white border-b border-gray-200 px-4 py-3 shrink-0">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <button
          onclick={onBackToList}
          class="sm:hidden -ml-2"
          aria-label="Back to conversations"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <Avatar src={conversation.userAvatar} name={conversation.userName} size="sm" />
        <div>
          <h3 class="font-medium text-gray-900 text-sm">{conversation.userName}</h3>
          <p class="text-xs text-gray-500">{getActiveStatus(conversation.userId, conversation.lastActiveAt)}</p>
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
    {#if conversation.isOffer}
      <div class="mt-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200">
        <div class="flex justify-between items-start mb-2">
          <div>
            <p class="text-xs font-semibold text-blue-900 uppercase tracking-wide">{i18n.messages_bundleOffer()}</p>
            <p class="text-xs text-blue-700">{conversation.bundleItems?.length} items • Save ${(conversation.bundleItems?.reduce((sum, item) => sum + item.price, 0) || 0) - conversation.offerPrice}</p>
          </div>
          <p class="text-lg font-bold text-blue-900">${conversation.offerPrice}</p>
        </div>
      </div>
    {:else if conversation.isProductConversation && conversation.productTitle}
      <div class="mt-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200">
        <div class="flex items-center space-x-2 mb-2">
          <span class="text-xs font-semibold text-blue-900 uppercase tracking-wide">Product Conversation</span>
          <span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-sm font-medium">Active</span>
        </div>
        <a href="/product/{conversation.productId}" class="flex items-center space-x-3 p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors">
          <img src={conversation.productImage} alt={conversation.productTitle} class="w-12 h-12 rounded-lg object-cover shadow-xs" />
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900 truncate">{conversation.productTitle}</p>
            <p class="text-lg font-bold text-gray-900">${conversation.productPrice}</p>
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
  <div bind:this={messagesContainer} class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
    <!-- Date Separator -->
    <div class="flex items-center justify-center">
      <span class="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">{i18n.messages_today()}</span>
    </div>
    
    <!-- Messages -->
    {#each sortedMessages as message (message.id)}
      <div class="flex {message.sender_id === currentUserId ? 'justify-end' : 'justify-start'} px-1">
        <div class="max-w-[80%] sm:max-w-[70%]">
          <div class="{message.sender_id === currentUserId ? 'bg-black text-white rounded-2xl rounded-br-md' : 'bg-white text-gray-900 rounded-2xl rounded-bl-md shadow-xs border border-gray-200'} px-4 py-3">
            <p class="text-sm leading-relaxed">{message.content}</p>
          </div>
          <div class="flex items-center justify-between mt-1.5 px-2">
            <p class="text-xs text-gray-500 {message.sender_id === currentUserId ? 'order-2' : ''}">
              {timeAgo(message.created_at)}
            </p>
            
            <!-- Message Status for sent messages -->
            {#if message.sender_id === currentUserId}
              <div class="flex items-center space-x-1 text-xs text-gray-400">
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
    {#if typingUser}
      <TypingIndicator 
        show={true}
        username={typingUser.username}
      />
    {/if}
  </div>
</div>
{/if}