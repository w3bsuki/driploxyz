<script lang="ts">
  import { Avatar } from '@repo/ui';
  // import { Tabs } from '@repo/ui'; // Not used in current implementation
  import * as i18n from '@repo/i18n';
  import type { Conversation } from '@repo/domain/conversations';

  interface Props {
    conversations: Conversation[];
    activeConversationId?: string;
    activeTab?: 'all' | 'buying' | 'selling' | 'offers' | 'unread';
    onConversationSelect: (conversationId: string) => void;
  onTabChange?: (tab: 'all' | 'buying' | 'selling' | 'offers' | 'unread') => void;
    showOnMobile: boolean;
  }

  let { 
    conversations, 
    activeConversationId, 
    activeTab = $bindable('all'), 
    onConversationSelect, 
    onTabChange,
    showOnMobile 
  }: Props = $props();
  

  // Fixed: Use derived instead of effect to avoid infinite loops
  let filteredConversations = $derived.by(() => {
    if (!conversations || conversations.length === 0) {
      return [];
    }
    
    switch (activeTab) {
      case 'unread':
        return conversations.filter(c => c.unread);
      case 'buying':  
        return conversations.filter(c => c.isProductConversation);
      case 'selling':
        return conversations.filter(c => !c.isProductConversation);
      case 'all':
      default:
        return [...conversations];
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
  
  // Prepare tab data for clean Instagram/Messenger style
  const messageTabData = $derived([
    { 
      id: 'all', 
      label: i18n.messages_all(), 
      count: conversations.length
    },
    { 
      id: 'unread', 
      label: i18n.messages_unread(), 
      count: conversations.filter(c => c.unread).length
    },
    { 
      id: 'buying', 
      label: i18n.messages_buying(), 
      count: conversations.filter(c => c.isProductConversation).length
    },
    { 
      id: 'selling', 
      label: i18n.messages_selling(), 
      count: conversations.filter(c => !c.isProductConversation).length
    }
  ]);
  
  // Handle tab changes
  function handleTabChange(tabId: 'all' | 'buying' | 'selling' | 'offers' | 'unread') {
    activeTab = tabId;
    onTabChange?.(tabId);
  }
</script>

<div class="bg-white border-r border-gray-100 flex flex-col h-full {showOnMobile ? 'block' : 'hidden'} sm:block">
  <!-- Tab Navigation - Messenger Style Pills -->
  <div class="flex-none p-4 bg-white">
    <div class="flex gap-2 overflow-x-auto scrollbarhide">
      {#each messageTabData as tab (tab.id)}
        <button
          onclick={() => handleTabChange(tab.id as 'all' | 'buying' | 'selling' | 'offers' | 'unread')}
          class="flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap
            {activeTab === tab.id 
              ? 'bg-black text-white shadow-sm transform scale-[0.98]' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-black active:scale-95'}"
        >
          <span>{tab.label}</span>
          {#if tab.count !== undefined && tab.count > 0}
            <span 
              class="px-2 py-0.5 text-xs rounded-full font-bold min-w-[18px] text-center
                {activeTab === tab.id
                  ? 'bg-white/20 text-white' 
                  : tab.id === 'unread' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-300 text-gray-600'}"
            >
              {tab.count}
            </span>
          {/if}
        </button>
      {/each}
    </div>
  </div>

  <!-- Conversations List -->
  <div class="flex-1 overflow-y-auto bg-gray-50/30">
    {#if filteredConversations.length === 0}
      <div class="p-8 text-center">
        <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
        <p class="text-gray-500 text-sm max-w-[200px] mx-auto">Start a conversation by messaging someone about their products!</p>
      </div>
    {:else}
      <div class="px-2 py-1">
        {#each filteredConversations as conversation (conversation.id)}
          <button
            onclick={() => onConversationSelect(conversation.id)}
            class="w-full p-3 mb-1 hover:bg-white/80 active:bg-white active:scale-[0.99] transition-all duration-150 text-left rounded-xl group
              {activeConversationId === conversation.id ? 'bg-white shadow-sm ring-1 ring-black/5' : 'bg-transparent'}"
          >
            <div class="flex items-start space-x-3">
              <div class="relative flex-none">
                <Avatar 
                  src={conversation.userAvatar} 
                  name={conversation.userName} 
                  size="md" 
                  class="ring-2 ring-white shadow-sm"
                />
                {#if conversation.unread}
                  <div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                {/if}
              </div>
              
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1.5">
                  <h3 class="text-[15px] {conversation.unread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'} truncate">
                    {conversation.userName}
                  </h3>
                  <span class="text-xs {conversation.unread ? 'text-gray-900 font-bold' : 'text-gray-500 font-medium'} flex-none">
                    {conversation.lastMessageTime ? timeAgo(conversation.lastMessageTime) : ''}
                  </span>
                </div>
                
                {#if conversation.isProductConversation && conversation.productTitle}
                  <div class="flex items-center space-x-1.5 mb-2">
                    <svg class="w-3 h-3 text-[var(--brand-primary-strong)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p class="text-[13px] text-[color-mix(in_oklch,var(--brand-primary-strong)_90%,black_10%)] truncate bg-[var(--surface-brand-strong)]/5 px-2 py-0.5 rounded-full">
                      {conversation.productTitle} • €{conversation.productPrice}
                    </p>
                  </div>
                {/if}
                
                <div class="flex items-center justify-between">
                  <p class="text-[14px] {conversation.unread ? 'text-gray-800 font-semibold' : 'text-gray-600 font-medium'} truncate pr-2">
                    {conversation.lastMessage || 'Start a conversation...'}
                  </p>
                  {#if conversation.unread}
                    <div class="flex-none w-2 h-2 bg-[var(--surface-brand-strong)]/50 rounded-full"></div>
                  {/if}
                </div>
              </div>
            </div>
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>

