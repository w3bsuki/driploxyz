<script lang="ts">
  import { Avatar } from '@repo/ui';
  import * as i18n from '@repo/i18n';
  import type { Conversation } from '$lib/services/ConversationService';

  interface Props {
    conversations: Conversation[];
    activeConversationId?: string;
    activeTab?: 'all' | 'buying' | 'selling' | 'offers' | 'unread';
    onConversationSelect: (conversationId: string) => void;
    onTabChange?: (tab: string) => void;
    showOnMobile: boolean;
  }

  let { 
    conversations, 
    activeConversationId, 
    activeTab = 'all', 
    onConversationSelect, 
    onTabChange,
    showOnMobile 
  }: Props = $props();

  // Filter conversations based on active tab
  const filteredConversations = $derived(() => {
    switch (activeTab) {
      case 'unread':
        return conversations.filter(conv => conv.unread);
      case 'buying':
        return conversations.filter(conv => 
          conv.messages.some(msg => msg.receiver_id === conv.userId) // We received messages
        );
      case 'selling':
        return conversations.filter(conv => 
          conv.messages.some(msg => msg.sender_id === conv.userId) && 
          conv.isProductConversation
        );
      case 'offers':
        return conversations.filter(conv => conv.isProductConversation);
      case 'all':
      default:
        return conversations;
    }
  });

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffMinutes < 1) return 'now';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h`;
    return `${Math.floor(diffMinutes / 1440)}d`;
  };
</script>

<div class="bg-white border-r border-gray-200 flex flex-col h-full {showOnMobile ? 'block' : 'hidden'} sm:block">
  <!-- Header -->
  <div class="p-4 border-b border-gray-200">
    <h2 class="text-lg font-semibold text-gray-900">{i18n.messages_inbox()}</h2>
  </div>

  <!-- Tab Navigation -->
  <div class="flex-none p-2 border-b border-gray-200">
    <div class="flex space-x-1 overflow-x-auto scrollbar-hide">
      {#each [
        { key: 'all', label: i18n.messages_all() },
        { key: 'unread', label: i18n.messages_unread() },
        { key: 'buying', label: i18n.messages_buying() },
        { key: 'selling', label: i18n.messages_selling() }
      ] as tab}
        <button
          onclick={() => onTabChange?.(tab.key)}
          class="px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors
            {activeTab === tab.key 
              ? 'bg-black text-white' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }"
        >
          {tab.label}
          {#if tab.key === 'unread'}
            {#if conversations.filter(c => c.unread).length > 0}
              <span class="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {conversations.filter(c => c.unread).length}
              </span>
            {/if}
          {/if}
        </button>
      {/each}
    </div>
  </div>

  <!-- Conversations List -->
  <div class="flex-1 overflow-y-auto">
    {#if filteredConversations.length === 0}
      <div class="p-8 text-center">
        <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p class="text-gray-500 text-sm">No conversations yet.</p>
      </div>
    {:else}
      <div class="divide-y divide-gray-100">
        {#each filteredConversations as conversation (conversation.id)}
          <button
            onclick={() => onConversationSelect(conversation.id)}
            class="w-full p-4 hover:bg-gray-50 transition-colors text-left
              {activeConversationId === conversation.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''}"
          >
            <div class="flex items-start space-x-3">
              <div class="relative flex-none">
                <Avatar 
                  src={conversation.userAvatar} 
                  name={conversation.userName} 
                  size="md" 
                />
                {#if conversation.unread}
                  <div class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <div class="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                {/if}
              </div>
              
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <h3 class="text-sm font-medium text-gray-900 truncate">
                    {conversation.userName}
                  </h3>
                  <span class="text-xs text-gray-500 flex-none">
                    {conversation.lastMessageTime ? timeAgo(conversation.lastMessageTime) : ''}
                  </span>
                </div>
                
                {#if conversation.isProductConversation && conversation.productTitle}
                  <p class="text-xs text-blue-600 font-medium mb-1 truncate">
                    📦 {conversation.productTitle} • ${conversation.productPrice}
                  </p>
                {/if}
                
                <p class="text-sm text-gray-600 truncate">
                  {conversation.lastMessage || 'Start a conversation...'}
                </p>
              </div>
            </div>
          </button>
        {/each}
      </div>
    {/if}
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