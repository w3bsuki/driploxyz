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

  // Auto-scroll to bottom when new messages arrive
  let previousMessageCount = 0;
  $effect(() => {
    if (conversation.messages.length > previousMessageCount) {
      previousMessageCount = conversation.messages.length;
      scrollToBottom();
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
  <!-- Chat Header -->
  <div class="flex-none bg-white border-b border-gray-200 px-4 py-3">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <button
          onclick={onBackToList}
          class="sm:hidden -ml-2 p-2 text-gray-600 hover:text-gray-900"
          aria-label="Back to conversations"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </button>
        <button class="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100" aria-label="Info">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Product/Context Info -->
    {#if conversation.isProductConversation && conversation.productTitle}
      <div class="mt-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200">
        <div class="flex items-center space-x-2 mb-2">
          <span class="text-xs font-semibold text-blue-900 uppercase tracking-wide">Product Conversation</span>
          <span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-sm font-medium">Active</span>
        </div>
        <div class="flex items-center space-x-3 p-2 bg-white rounded-lg">
          {#if conversation.productImage}
            <img src={conversation.productImage} alt={conversation.productTitle} class="w-12 h-12 rounded-lg object-cover shadow-xs" />
          {/if}
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900 truncate">{conversation.productTitle}</p>
            <p class="text-lg font-bold text-gray-900">${conversation.productPrice}</p>
          </div>
        </div>
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

  <!-- Messages Area -->
  <div class="flex-1 overflow-hidden">
    <div 
      bind:this={messagesContainer}
      class="h-full overflow-y-auto p-4 space-y-3 bg-gray-50"
      onscroll={handleScroll}
    >
      <!-- Loading indicator for older messages -->
      {#if isLoadingOlder}
        <div class="flex items-center justify-center py-2">
          <div class="flex items-center space-x-2 text-gray-500">
            <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span class="text-xs">Loading older messages...</span>
          </div>
        </div>
      {:else if !hasMoreMessages && conversation.messages.length > 10}
        <div class="flex items-center justify-center py-2">
          <span class="text-xs text-gray-400">• Start of conversation •</span>
        </div>
      {/if}
      
      <!-- Messages -->
      {#each conversation.messages as message (message.id)}
        <div class="flex {message.sender_id === currentUserId ? 'justify-end' : 'justify-start'} px-1">
          <div class="max-w-[80%] sm:max-w-[70%]">
            <div class="{message.sender_id === currentUserId 
              ? 'bg-black text-white rounded-2xl rounded-br-md' 
              : 'bg-white text-gray-900 rounded-2xl rounded-bl-md shadow-xs border border-gray-200'
            } px-4 py-3">
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
      
    </div>
  </div>

  <!-- Message Input -->
  <div class="flex-none border-t border-gray-200 p-4 bg-white">
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
      <button class="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap">
        <span class="text-lg">📍</span>
        <span class="text-xs font-medium">{i18n.messages_location()}</span>
      </button>
      <button class="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap">
        <span class="text-lg">📸</span>
        <span class="text-xs font-medium">{i18n.messages_photo()}</span>
      </button>
    </div>
    
    <!-- Input Row -->
    <div class="flex items-center space-x-2">
      <div class="flex-1 relative">
        <input
          id="message-input"
          type="text"
          bind:value={messageText}
          onkeydown={handleKeydown}
          placeholder={i18n.messages_messageInput()}
          aria-label="Type a message"
          class="w-full px-4 py-2.5 bg-gray-50 rounded-full text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white"
        />
      </div>
      
      <button 
        onclick={sendMessage}
        class="p-2.5 bg-black text-white rounded-full hover:bg-gray-800 transition-colors
          {messageText.trim() && !isSending ? '' : 'opacity-50 cursor-not-allowed'}"
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

<style>
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
</style>