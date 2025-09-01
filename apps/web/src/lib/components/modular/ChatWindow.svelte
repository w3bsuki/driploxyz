<script lang="ts">
  import { Avatar } from '@repo/ui';
  import * as i18n from '@repo/i18n';
  import type { Conversation, Message } from '$lib/services/ConversationService';

  interface Props {
    conversation: Conversation;
    currentUserId: string;
    onlineUsers?: Set<string>;
    onBackToList: () => void;
    onSendMessage: (content: string) => void;
    onLoadOlder?: () => void;
    isLoadingOlder?: boolean;
    hasMoreMessages?: boolean;
  }

  let { 
    conversation, 
    currentUserId, 
    onlineUsers = new Set(),
    onBackToList, 
    onSendMessage,
    onLoadOlder,
    isLoadingOlder = false,
    hasMoreMessages = true
  }: Props = $props();

  let messageText = $state('');
  let isSending = $state(false);
  let messagesContainer: HTMLDivElement | null = $state(null);
  
  // Pre-DOM measurement state for smooth scrolling
  let previousScrollHeight = $state(0);
  let previousScrollTop = $state(0);
  let wasAtBottom = $state(false);

  // $effect.pre() for DOM measurements before message updates
  $effect.pre(() => {
    // Capture scroll state before any DOM changes from new messages
    if (messagesContainer) {
      previousScrollHeight = messagesContainer.scrollHeight;
      previousScrollTop = messagesContainer.scrollTop;
      
      // Check if user is at the bottom (within 10px threshold)
      const threshold = 10;
      wasAtBottom = (messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight) <= threshold;
    }
  });

  // Auto-scroll to bottom when new messages arrive
  let previousMessageCount = 0;
  $effect(() => {
    if (conversation.messages.length > previousMessageCount) {
      const newMessageAdded = conversation.messages.length > previousMessageCount;
      previousMessageCount = conversation.messages.length;
      
      if (newMessageAdded && messagesContainer) {
        // Use pre-measured state to make intelligent scrolling decisions
        if (wasAtBottom) {
          // User was at bottom, auto-scroll to new bottom
          scrollToBottom();
        } else {
          // User was scrolled up, maintain their position relative to old content
          // This prevents the jarring jump when new messages arrive
          requestAnimationFrame(() => {
            if (messagesContainer && previousScrollHeight > 0) {
              const heightDifference = messagesContainer.scrollHeight - previousScrollHeight;
              if (heightDifference > 0) {
                messagesContainer.scrollTop = previousScrollTop + heightDifference;
              }
            }
          });
        }
      }
    }
  });

  // Scroll to bottom helper
  function scrollToBottom() {
    requestAnimationFrame(() => {
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    });
  }

  // Handle scroll to load older messages
  function handleScroll() {
    if (!messagesContainer || isLoadingOlder || !hasMoreMessages || !onLoadOlder) return;
    
    const { scrollTop } = messagesContainer;
    
    // If scrolled near the top (within 100px), load older messages
    if (scrollTop < 100) {
      onLoadOlder();
    }
  }

  // Send message handler
  async function sendMessage() {
    if (isSending || !messageText.trim()) {
      return;
    }
    
    const text = messageText.trim();
    messageText = '';
    isSending = true;
    
    try {
      await onSendMessage(text);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      isSending = false;
    }
  }

  // Handle key events
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // Get user online status
  const getActiveStatus = (userId: string, lastActiveAt?: string) => {
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

  // Format message timestamp
  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffMinutes < 1) return 'now';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

</script>

<div class="flex flex-col h-full bg-white">
  <!-- Chat Header - Instagram style -->
  <div class="flex-none bg-white border-b border-gray-100 px-4 py-3 shadow-sm">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <button
          onclick={onBackToList}
          class="sm:hidden min-w-[40px] min-h-[40px] -ml-2 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all"
          aria-label="Back to conversations"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <!-- Professional online indicator -->
        <div class="{onlineUsers.has(conversation.userId) ? 'bg-green-500 p-0.5 rounded-full' : ''}">
          <Avatar 
            src={conversation.userAvatar} 
            name={conversation.userName} 
            size="sm" 
            class="{onlineUsers.has(conversation.userId) ? 'border-2 border-white' : ''}"
          />
        </div>
        
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-gray-900 text-base truncate">{conversation.userName}</h3>
          <div class="flex items-center space-x-1">
            {#if onlineUsers.has(conversation.userId)}
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            {/if}
            <p class="text-xs {onlineUsers.has(conversation.userId) ? 'text-green-600 font-medium' : 'text-gray-500'} truncate">
              {getActiveStatus(conversation.userId, conversation.lastActiveAt)}
            </p>
          </div>
        </div>
      </div>
      
      <div class="flex items-center space-x-1">
        <button class="min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all" aria-label="Video call">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button class="min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all" aria-label="Audio call">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Product/Context Info - Professional style -->
    {#if conversation.isProductConversation && conversation.productTitle}
      <div class="mt-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div class="flex items-center space-x-2 mb-3">
          <span class="text-xs font-semibold text-gray-700 bg-gray-200 px-3 py-1 rounded-full">🛍️ Product</span>
        </div>
        <div class="flex items-center space-x-4 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
          {#if conversation.productImage}
            <img src={conversation.productImage} alt={conversation.productTitle} class="w-12 h-12 rounded-lg object-cover" />
          {:else}
            <div class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
              <span class="text-lg">👕</span>
            </div>
          {/if}
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 truncate mb-1">{conversation.productTitle}</p>
            <p class="text-base font-bold text-black">${conversation.productPrice}</p>
          </div>
          <button class="min-h-[36px] px-4 py-2 bg-black text-white font-semibold rounded-lg text-xs hover:bg-gray-800 active:scale-95 transition-all">
            VIEW
          </button>
        </div>
      </div>
    {:else}
      <div class="mt-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div class="flex items-center justify-center space-x-2">
          <span class="text-lg">💬</span>
          <span class="text-sm text-gray-600 font-semibold">General Chat</span>
        </div>
      </div>
    {/if}
  </div>

  <!-- Messages Area - Professional style -->
  <div class="flex-1 overflow-hidden bg-gray-50">
    <div 
      bind:this={messagesContainer}
      class="h-full overflow-y-auto px-4 py-6 space-y-4"
      onscroll={handleScroll}
    >
      <!-- Loading indicator for older messages -->
      {#if isLoadingOlder}
        <div class="flex items-center justify-center py-3">
          <div class="flex items-center space-x-3 text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm border">
            <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span class="text-sm font-semibold">Loading...</span>
          </div>
        </div>
      {:else if !hasMoreMessages && conversation.messages.length > 5}
        <div class="flex items-center justify-center py-3">
          <div class="flex items-center space-x-2 text-gray-400 bg-gray-50 px-4 py-2 rounded-full">
            <span class="text-lg">🎉</span>
            <span class="text-sm font-semibold">This is where it all started</span>
          </div>
        </div>
      {/if}
      
      <!-- Messages - Professional bubble style -->
      {#each conversation.messages as message (message.id)}
        <div class="flex {message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}">
          <div class="max-w-[80%] sm:max-w-[75%]">
            <div class="{message.sender_id === currentUserId 
              ? 'bg-black text-white rounded-2xl rounded-br-md shadow-sm' 
              : 'bg-white text-gray-900 rounded-2xl rounded-bl-md shadow-sm border border-gray-200'
            } px-4 py-3 relative">
              <p class="text-sm leading-relaxed">{message.content}</p>
              
              <!-- Professional message tail -->
              <div class="absolute bottom-0 {message.sender_id === currentUserId 
                ? '-right-1 w-3 h-3 bg-black transform rotate-45' 
                : '-left-1 w-3 h-3 bg-white transform rotate-45 border-l border-b border-gray-200'
              }"></div>
            </div>
            
            <!-- Message metadata -->
            <div class="flex items-center {message.sender_id === currentUserId ? 'justify-end space-x-2 mr-2' : 'ml-2'} mt-1">
              <p class="text-xs text-gray-500 font-medium">
                {timeAgo(message.created_at)}
              </p>
              
              <!-- Instagram-style read status -->
              {#if message.sender_id === currentUserId}
                <div class="flex items-center">
                  {#if message.status === 'sending'}
                    <div class="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  {:else if message.status === 'sent' || (!message.status && !message.delivered_at)}
                    <svg class="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  {:else if message.status === 'delivered' || message.delivered_at}
                    <svg class="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    <svg class="w-3 h-3 text-gray-500 -ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  {:else if message.status === 'read' || message.is_read}
                    <Avatar src={conversation.userAvatar} name={conversation.userName} size="xs" class="w-3 h-3" />
                  {/if}
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Message Input - Instagram style -->
  <div class="flex-none border-t border-gray-100 p-4 bg-white">
    <!-- Quick Actions - Professional style -->
    <div class="flex gap-3 mb-4 overflow-x-auto scrollbar-hide">
      <button class="min-h-[36px] flex items-center space-x-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-all active:scale-95 whitespace-nowrap border border-green-200">
        <span class="text-base">💰</span>
        <span class="text-sm font-semibold">{i18n.messages_makeOffer()}</span>
      </button>
      <button class="min-h-[36px] flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-all active:scale-95 whitespace-nowrap border border-gray-200">
        <span class="text-base">📦</span>
        <span class="text-sm font-semibold">{i18n.messages_bundle()}</span>
      </button>
      <button class="min-h-[36px] flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-all active:scale-95 whitespace-nowrap border border-blue-200">
        <span class="text-base">📍</span>
        <span class="text-sm font-semibold">{i18n.messages_location()}</span>
      </button>
      <button class="min-h-[36px] flex items-center space-x-2 px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg transition-all active:scale-95 whitespace-nowrap border border-orange-200">
        <span class="text-base">📸</span>
        <span class="text-sm font-semibold">{i18n.messages_photo()}</span>
      </button>
    </div>
    
    <!-- Input Row - Professional style -->
    <div class="flex items-end space-x-3">
      <div class="flex-1 relative">
        <input
          id="message-input"
          type="text"
          bind:value={messageText}
          onkeydown={handleKeydown}
          placeholder={i18n.messages_messageInput()}
          aria-label="Type a message"
          class="w-full min-h-[44px] px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent focus:bg-white transition-all"
        />
        
        <!-- Emoji button -->
        <button class="absolute right-3 top-1/2 transform -translate-y-1/2 text-lg hover:scale-110 transition-transform text-gray-500">
          😊
        </button>
      </div>
      
      <button 
        onclick={sendMessage}
        class="min-w-[44px] min-h-[44px] bg-black text-white rounded-lg hover:bg-gray-800 active:scale-95 transition-all flex items-center justify-center shadow-sm
          {messageText.trim() && !isSending ? 'hover:shadow-md' : 'opacity-70 cursor-not-allowed'}"
        disabled={!messageText.trim() || isSending}
        aria-label="Send message"
      >
        {#if isSending}
          <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        {:else}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        {/if}
      </button>
    </div>
  </div>
</div>

