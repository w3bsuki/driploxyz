<script lang="ts">
  import { Avatar } from '@repo/ui';
  import * as i18n from '@repo/i18n';
  import type { Conversation, Message } from '$lib/services/ConversationService';

  interface Props {
    conversation: Conversation;
    currentUserId: string;
    onBackToList: () => void;
    onSendMessage: (content: string) => void;
    onLoadOlder?: () => void;
    isLoadingOlder?: boolean;
    hasMoreMessages?: boolean;
    isSending?: boolean;
  }

  let { 
    conversation, 
    currentUserId, 
    onBackToList, 
    onSendMessage,
    onLoadOlder,
    isLoadingOlder = false,
    hasMoreMessages = true,
    isSending = false
  }: Props = $props();

  let messageText = $state('');
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

  // Mark messages as read when chat opens or becomes visible
  $effect(() => {
    if (conversation?.id) {
      // Small delay to ensure messages are loaded
      setTimeout(() => {
        // Mark conversation as read - this will update unread status
        void markAsRead();
      }, 500);
    }
  });

  async function markAsRead() {
    // This would typically call the ConversationService to mark as read
    // The ConversationService already handles this in loadMessages
  }

  // Scroll to bottom helper
  function scrollToBottom() {
    requestAnimationFrame(() => {
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    });
  }

  // Enhanced scroll handling for progressive message loading
  let loadMoreThreshold = 50; // pixels from top
  let scrollDebounceTimer: number | null = null;
  
  function handleScroll() {
    if (!messagesContainer || isLoadingOlder || !hasMoreMessages || !onLoadOlder) return;
    
    // Debounce scroll events for better performance
    if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer);
    
    scrollDebounceTimer = setTimeout(() => {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
      
      // Load older messages when scrolled near the top (like Messenger/WhatsApp)
      if (scrollTop < loadMoreThreshold) {
        onLoadOlder();
      }
      
      // Update threshold based on scroll behavior for better UX
      if (scrollTop < 20) {
        loadMoreThreshold = 80; // Increase threshold if user is actively scrolling up
      } else {
        loadMoreThreshold = 50; // Reset to default
      }
    }, 100); // 100ms debounce
  }

  // Send message handler
  async function sendMessage() {
    if (isSending || !messageText.trim()) {
      return;
    }
    
    const text = messageText.trim();
    messageText = '';
    
    try {
      await onSendMessage(text);
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message text on error
      messageText = text;
    }
  }

  // Handle key events
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // Quick action handlers
  function handleMakeOffer() {
    if (conversation.isProductConversation && conversation.productPrice) {
      const offerMessage = `💰 I'd like to make an offer of €${Math.floor(conversation.productPrice * 0.8)} for "${conversation.productTitle}". Let me know what you think!`;
      messageText = offerMessage;
      // Focus the input for user to modify if needed
      const input = document.getElementById('message-input') as HTMLInputElement;
      if (input) {
        input.focus();
        input.setSelectionRange(offerMessage.length, offerMessage.length);
      }
    } else {
      messageText = "💰 I'm interested in making an offer. What's your asking price?";
    }
  }

  function handleBundle() {
    messageText = "📦 Would you be interested in bundling this with other items for a better deal?";
  }

  function handleLocation() {
    messageText = "📍 Where would you like to meet for pickup/delivery?";
  }

  function handlePhoto() {
    // For now, suggest uploading photos
    messageText = "📸 Could you share more photos of the item?";
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
          <span class="text-xs font-semibold text-gray-700 bg-gray-200 px-3 py-1 rounded-full">Product</span>
        </div>
        <div class="flex items-center space-x-4 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
          {#if conversation.productImage}
            <img src={conversation.productImage} alt={conversation.productTitle} class="w-12 h-12 rounded-lg object-cover" />
          {:else}
            <div class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
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
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
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
      <!-- Modern loading indicator for older messages -->
      {#if isLoadingOlder}
        <div class="flex items-center justify-center py-4">
          <div class="flex items-center space-x-2 text-gray-600 bg-gray-100 px-4 py-2 rounded-full text-sm">
            <div class="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
            <span>Loading messages...</span>
          </div>
        </div>
      {:else if !hasMoreMessages && conversation.messages.length > 10}
        <div class="flex items-center justify-center py-4">
          <div class="flex items-center space-x-2 text-gray-500 bg-gray-100 px-4 py-2 rounded-full text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4" />
            </svg>
            <span>This is where your conversation began</span>
          </div>
        </div>
      {:else if hasMoreMessages && conversation.messages.length > 0}
        <div class="flex items-center justify-center py-2">
          <div class="text-xs text-gray-400 font-semibold bg-gray-100/50 px-3 py-1 rounded-full">
            Scroll up to load more messages
          </div>
        </div>
      {/if}
      
      <!-- Messages - Clean Messenger Style -->
      {#each conversation.messages as message (message.id)}
        <div class="flex {message.sender_id === currentUserId ? 'justify-end' : 'justify-start'} group">
          <div class="max-w-[85%] sm:max-w-[70%]">
            <!-- Message bubble - Modern, clean design -->
            <div class="relative {message.sender_id === currentUserId ? 'ml-8' : 'mr-8'}">
              <div class="{message.sender_id === currentUserId 
                ? 'bg-blue-500 text-white rounded-[18px] rounded-br-md shadow-sm' 
                : 'bg-gray-100 text-gray-900 rounded-[18px] rounded-bl-md shadow-sm'
              } px-4 py-3 relative transition-all">
                <p class="text-[15px] leading-[1.4] break-words">{message.content}</p>
              </div>
            </div>
            
            <!-- Message metadata -->
            <div class="flex items-center {message.sender_id === currentUserId ? 'justify-end space-x-2 mr-1 mt-1' : 'ml-1 mt-1'} opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <p class="text-[11px] text-gray-400 font-semibold">
                {timeAgo(message.created_at)}
              </p>
              
              <!-- Clean read status indicators -->
              {#if message.sender_id === currentUserId}
                <div class="flex items-center">
                  {#if message.status === 'sending'}
                    <div class="w-3 h-3 border-2 border-blue-300 border-t-blue-500 rounded-full animate-spin"></div>
                  {:else if message.is_read}
                    <!-- Read: Show recipient's avatar -->
                    <div class="w-3 h-3 rounded-full overflow-hidden ring-1 ring-blue-500">
                      <Avatar src={conversation.userAvatar} name={conversation.userName} size="xs" class="w-full h-full" />
                    </div>
                  {:else}
                    <!-- Sent but not read: Single checkmark -->
                    <div class="w-3 h-3 rounded-full bg-gray-400 flex items-center justify-center">
                      <svg class="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Message Input - Modern Messenger Style -->
  <div class="flex-none bg-white border-t border-gray-100 p-4">
    <!-- Quick Actions - Clean pill style -->
    <div class="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
      <button 
        onclick={handleMakeOffer}
        class="flex items-center space-x-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-full transition-all active:scale-95 whitespace-nowrap text-sm border border-green-200"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
        <span>{i18n.messages_makeOffer()}</span>
      </button>
      <button 
        onclick={handleBundle}
        class="flex items-center space-x-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full transition-all active:scale-95 whitespace-nowrap text-sm border border-purple-200"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <span>{i18n.messages_bundle()}</span>
      </button>
      <button 
        onclick={handleLocation}
        class="flex items-center space-x-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full transition-all active:scale-95 whitespace-nowrap text-sm border border-blue-200"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>{i18n.messages_location()}</span>
      </button>
      <button 
        onclick={handlePhoto}
        class="flex items-center space-x-2 px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-full transition-all active:scale-95 whitespace-nowrap text-sm border border-orange-200"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>{i18n.messages_photo()}</span>
      </button>
    </div>
    
    <!-- Input Row - Clean Messenger Style -->
    <div class="flex items-end space-x-3">
      <div class="flex-1 relative">
        <div class="relative bg-gray-50 rounded-full border border-gray-200 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all">
          <input
            id="message-input"
            type="text"
            bind:value={messageText}
            onkeydown={handleKeydown}
            placeholder={i18n.messages_messageInput()}
            aria-label="Type a message"
            class="w-full px-4 py-3 bg-transparent text-[15px] placeholder-gray-500 focus:outline-none focus:ring-0 border-0 pr-12"
          />
          
          <!-- Emoji button -->
          <button 
            class="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200"
            aria-label="Add emoji"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
      
      <button 
        onclick={sendMessage}
        class="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center shadow-lg transition-all duration-200 transform
          {messageText.trim() && !isSending 
            ? 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105 active:scale-95 shadow-blue-200' 
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'}"
        disabled={!messageText.trim() || isSending}
        aria-label={isSending ? 'Sending...' : 'Send message'}
      >
        {#if isSending}
          <div class="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
        {:else if messageText.trim()}
          <svg class="w-5 h-5 transform translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        {:else}
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        {/if}
      </button>
    </div>
  </div>
</div>

