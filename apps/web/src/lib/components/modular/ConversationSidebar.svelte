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
  let filteredConversations = $derived(() => {
    if (!conversations) return [];
    
    switch (activeTab) {
      case 'unread':
        return conversations.filter(c => c.unread);
      case 'buying':
        return conversations.filter(c => c.isProductConversation);
      case 'selling':
        return conversations.filter(c => !c.isProductConversation);
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

<div class="bg-white border-r border-gray-100 flex flex-col h-full {showOnMobile ? 'block' : 'hidden'} sm:block">
  <!-- Header -->
  <div class="px-4 py-3 border-b border-gray-100">
    <h1 class="text-xl font-bold text-gray-900">{i18n.messages_inbox()}</h1>
  </div>

  <!-- Tab Navigation - Instagram style -->
  <div class="flex-none px-2 py-3 border-b border-gray-100">
    <div class="flex space-x-2 overflow-x-auto scrollbar-hide">
      {#each [
        { key: 'all', label: i18n.messages_all(), icon: '💬' },
        { key: 'unread', label: i18n.messages_unread(), icon: '🔴' },
        { key: 'buying', label: i18n.messages_buying(), icon: '🛍️' },
        { key: 'selling', label: i18n.messages_selling(), icon: '🏪' }
      ] as tab}
        <button
          onclick={() => onTabChange?.(tab.key)}
          class="min-h-[36px] px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-all duration-200
            {activeTab === tab.key 
              ? 'bg-black text-white shadow-lg' 
              : 'text-gray-700 hover:text-black hover:bg-gray-100 active:bg-gray-200'
            }"
        >
          <span class="mr-1.5">{tab.icon}</span>
          {tab.label}
          {#if tab.key === 'unread'}
            {#if conversations.filter(c => c.unread).length > 0}
              <span class="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full font-bold">
                {conversations.filter(c => c.unread).length}
              </span>
            {/if}
          {/if}
        </button>
      {/each}
    </div>
  </div>

  <!-- Conversations List - Instagram style -->
  <div class="flex-1 overflow-y-auto bg-white">
    {#if filteredConversations.length === 0}
      <div class="p-8 text-center">
        <div class="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <span class="text-3xl">💬</span>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
        <p class="text-gray-500 text-sm">Start a conversation with someone!</p>
      </div>
    {:else}
      <div class="">
        {#each filteredConversations as conversation (conversation.id)}
          <button
            onclick={() => onConversationSelect(conversation.id)}
            class="w-full min-h-[72px] px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-all duration-150 text-left border-b border-gray-50 last:border-b-0
              {activeConversationId === conversation.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''}"
          >
            <div class="flex items-center space-x-3">
              <div class="relative flex-none">
                <!-- Professional unread indicator -->
                <div class="{conversation.unread ? 'bg-black p-0.5 rounded-full' : ''}">
                  <Avatar 
                    src={conversation.userAvatar} 
                    name={conversation.userName} 
                    size="md" 
                    class="{conversation.unread ? 'border-2 border-white' : ''}"
                  />
                </div>
                {#if conversation.unread}
                  <div class="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                    <div class="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                {/if}
              </div>
              
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <h3 class="text-sm {conversation.unread ? 'font-bold' : 'font-semibold'} text-gray-900 truncate">
                    {conversation.userName}
                  </h3>
                  <span class="text-xs {conversation.unread ? 'text-black font-semibold' : 'text-gray-500'} flex-none">
                    {conversation.lastMessageTime ? timeAgo(conversation.lastMessageTime) : ''}
                  </span>
                </div>
                
                {#if conversation.isProductConversation && conversation.productTitle}
                  <div class="flex items-center space-x-1 mb-1">
                    <span class="text-xs">📦</span>
                    <p class="text-xs text-gray-700 font-medium truncate">
                      {conversation.productTitle} • ${conversation.productPrice}
                    </p>
                  </div>
                {/if}
                
                <p class="text-sm {conversation.unread ? 'text-gray-900 font-medium' : 'text-gray-600'} truncate">
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