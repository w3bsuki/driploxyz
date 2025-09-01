<script lang="ts">
  import { Avatar } from '@repo/ui';
  import { Tabs } from '@repo/ui';
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
  
  // Prepare tab data for Melt UI Tabs
  const messageTabData = $derived([
    { 
      id: 'all', 
      label: i18n.messages_all(), 
      count: conversations.length,
      icon: '💬'
    },
    { 
      id: 'unread', 
      label: i18n.messages_unread(), 
      count: conversations.filter(c => c.unread).length,
      icon: '🔴'
    },
    { 
      id: 'buying', 
      label: i18n.messages_buying(), 
      count: conversations.filter(c => c.isProductConversation).length,
      icon: '🛍️'
    },
    { 
      id: 'selling', 
      label: i18n.messages_selling(), 
      count: conversations.filter(c => !c.isProductConversation).length,
      icon: '🏪'
    }
  ]);
  
  // Handle tab changes
  function handleTabChange(tabId: string) {
    onTabChange?.(tabId);
  }
</script>

<div class="bg-white border-r border-gray-100 flex flex-col h-full {showOnMobile ? 'block' : 'hidden'} sm:block">
  <!-- Mobile-First Tab Navigation using Melt UI -->
  <div class="flex-none border-b" style="border-color: oklch(0.92 0.01 270);">
    <Tabs
      tabs={messageTabData}
      bind:value={activeTab}
      onTabChange={handleTabChange}
      variant="pills"
      size="lg"
      scrollable={true}
      class="p-2 sm:p-3"
      tabListClass="gap-1 sm:gap-1.5"
      tabClass="min-h-[44px] sm:min-h-[40px] text-sm font-medium transition-all duration-200 touch-manipulation"
    >
      {#snippet tabContent({ tab, isActive })}
        <span class="mr-1 sm:mr-1.5 text-base" role="img" aria-hidden="true">{tab.icon}</span>
        <!-- Mobile: shorter labels for better fit -->
        <span class="text-sm sm:text-sm font-medium">{tab.label}</span>
        {#if tab.count !== undefined && tab.count > 0}
          <span 
            class="ml-1 sm:ml-1.5 px-1.5 py-0.5 text-xs rounded-full font-bold min-w-[18px] text-center
              {isActive 
                ? 'bg-[color:var(--surface-base)]/20 text-current shadow-sm' 
                : tab.id === 'unread' 
                  ? 'bg-[color:var(--status-error)] text-[color:var(--status-error-contrast)] shadow-sm' 
                  : 'bg-[color:var(--surface-muted)] text-[color:var(--text-secondary)]'}"
            aria-label="{tab.count} {tab.label.toLowerCase()}"
          >
            {tab.count}
          </span>
        {/if}
      {/snippet}
    </Tabs>
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

