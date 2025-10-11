<script lang="ts">
  import type { Conversation, Message } from '@repo/domain/conversations';
  import * as i18n from '@repo/i18n';

  interface Props {
    conversation: Conversation & { messages: Message[] };
    currentUserId: string;
    onBackToList: () => void;
    onSendMessage: (content: string) => void;
    onLoadOlder: () => void;
    isLoadingOlder: boolean;
    hasMoreMessages: boolean;
    isSending: boolean;
  }

  let {
    conversation,
    currentUserId,
    onBackToList,
    onSendMessage,
    onLoadOlder,
    isLoadingOlder,
    hasMoreMessages,
    isSending
  }: Props = $props();

  let messageInput = $state('');
  let messagesContainer = $state<HTMLElement>();
  let isScrolledToBottom = $state(true);

  // Auto-scroll to bottom when new messages arrive
  $effect(() => {
    if (messagesContainer && isScrolledToBottom) {
      setTimeout(() => {
        messagesContainer?.scrollTo({
          top: messagesContainer.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  });

  function handleScroll() {
    if (!messagesContainer) return;

    const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50;
    isScrolledToBottom = isAtBottom;
  }

  function handleSendMessage() {
    if (!messageInput.trim() || isSending) return;

    const content = messageInput.trim();
    messageInput = '';
    onSendMessage(content);
    isScrolledToBottom = true;
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }

  function formatMessageTime(timestamp: string) {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function isOwnMessage(message: Message) {
    return message.sender_id === currentUserId;
  }
</script>

<div class="h-full flex flex-col bg-white">
  <!-- Header -->
  <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
    <div class="flex items-center space-x-3">
      <button
        class="sm:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700"
        onclick={onBackToList}
        aria-label="Go back to messages"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div class="flex items-center space-x-3">
        {#if conversation.userAvatar}
          <img
            src={conversation.userAvatar}
            alt={conversation.userName}
            class="w-8 h-8 rounded-full object-cover"
          />
        {:else}
          <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span class="text-sm font-medium text-gray-500">
              {conversation.userName.charAt(0).toUpperCase()}
            </span>
          </div>
        {/if}

        <div>
          <h3 class="text-sm font-medium text-gray-900">{conversation.userName}</h3>
          {#if conversation.productTitle}
            <p class="text-xs text-gray-500">{conversation.productTitle}</p>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Messages -->
  <div
    bind:this={messagesContainer}
    class="flex-1 overflow-y-auto px-4 py-4 space-y-4"
    onscroll={handleScroll}
  >
    <!-- Load Older Messages -->
    {#if hasMoreMessages}
      <div class="text-center">
        <button
          class="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
          onclick={onLoadOlder}
          disabled={isLoadingOlder}
        >
          {isLoadingOlder ? 'Loading...' : 'Load older messages'}
        </button>
      </div>
    {/if}

    <!-- Message List -->
    {#each conversation.messages as message (message.id)}
      <div class="flex {isOwnMessage(message) ? 'justify-end' : 'justify-start'}">
        <div class="max-w-xs lg:max-w-md">
          <div
            class="px-4 py-2 rounded-lg {
              isOwnMessage(message)
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-900'
            }"
          >
            <p class="text-sm">{message.content}</p>
          </div>
          <p class="text-xs text-gray-500 mt-1 {isOwnMessage(message) ? 'text-right' : 'text-left'}">
            {formatMessageTime(message.created_at)}
          </p>
        </div>
      </div>
    {/each}

    <!-- Empty State -->
    {#if conversation.messages.length === 0}
      <div class="text-center py-8">
        <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p class="text-gray-500 text-sm">Start a conversation...</p>
      </div>
    {/if}
  </div>

  <!-- Message Input -->
  <div class="border-t border-gray-200 px-4 py-3">
    <div class="flex space-x-2">
      <input
        bind:value={messageInput}
        type="text"
        placeholder={i18n.messages_typeMessage()}
        class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
        onkeypress={handleKeyPress}
        disabled={isSending}
      />
      <button
        class="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        onclick={handleSendMessage}
        disabled={!messageInput.trim() || isSending}
      >
        {#if isSending}
          <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        {:else}
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        {/if}
      </button>
    </div>
  </div>
</div>