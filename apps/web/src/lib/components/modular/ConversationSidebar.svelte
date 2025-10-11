<script lang="ts">
  import type { Conversation } from '@repo/domain/conversations';
  import * as i18n from '@repo/i18n';

  interface Props {
    conversations: Conversation[];
    activeConversationId?: string;
    activeTab: 'all' | 'buying' | 'selling' | 'offers' | 'unread';
    showOnMobile: boolean;
    onConversationSelect: (id: string) => void;
    onTabChange: (tab: string) => void;
  }

  let {
    conversations,
    activeConversationId,
    activeTab,
    showOnMobile,
    onConversationSelect,
    onTabChange
  }: Props = $props();

  // Filter conversations based on active tab
  let filteredConversations = $derived.by(() => {
    switch (activeTab) {
      case 'unread':
        return conversations.filter(c => c.unread);
      case 'buying':
        return conversations.filter(c => c.isBuying);
      case 'selling':
        return conversations.filter(c => c.isSelling);
      case 'offers':
        return conversations.filter(c => c.isOffer);
      default:
        return conversations;
    }
  });

  function handleTabClick(tab: string) {
    onTabChange(tab);
  }

  function handleConversationClick(conversationId: string) {
    onConversationSelect(conversationId);
  }

  // Tab label mappings (following Paraglide best practices)
  const tabLabels: Record<string, () => string> = {
    all: () => i18n.conversation_allMessages?.() || 'All',
    unread: () => i18n.conversation_unread?.() || 'Unread',
    buying: () => i18n.conversation_buying?.() || 'Buying',
    selling: () => i18n.conversation_selling?.() || 'Selling',
    offers: () => i18n.conversation_offers?.() || 'Offers'
  };
</script>

<div class="h-full flex flex-col bg-white border-r border-gray-200">
  <!-- Tabs -->
  <div class="flex border-b border-gray-200">
    {#each ['all', 'unread', 'buying', 'selling', 'offers'] as tab (tab)}
      <button
        class="flex-1 px-3 py-2 text-xs font-medium border-b-2 transition-colors {
          activeTab === tab
            ? 'border-black text-black'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        }"
        onclick={() => handleTabClick(tab)}
      >
        {tabLabels[tab]()}
      </button>
    {/each}
  </div>

  <!-- Conversation List -->
  <div class="flex-1 overflow-y-auto">
    {#if filteredConversations().length === 0}
      <div class="p-4 text-center text-gray-500">
        <p class="text-sm">{i18n.messages_noConversations()}</p>
      </div>
    {:else}
      <div class="divide-y divide-gray-100">
        {#each filteredConversations() as conversation (conversation.id)}
          <button
            class="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors {
              activeConversationId === conversation.id ? 'bg-gray-50' : ''
            }"
            onclick={() => handleConversationClick(conversation.id)}
          >
            <div class="flex items-start space-x-3">
              <!-- Avatar -->
              <div class="flex-shrink-0">
                {#if conversation.userAvatar}
                  <img
                    src={conversation.userAvatar}
                    alt={conversation.userName}
                    class="w-10 h-10 rounded-full object-cover"
                  />
                {:else}
                  <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span class="text-sm font-medium text-gray-500">
                      {conversation.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                {/if}
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {conversation.userName}
                  </p>
                  <span class="text-xs text-gray-500">
                    {new Date(conversation.lastActiveAt || conversation.lastMessageTime).toLocaleDateString()}
                  </span>
                </div>

                {#if conversation.productTitle}
                  <p class="text-xs text-gray-500 truncate mb-1">
                    {conversation.productTitle}
                  </p>
                {/if}

                <p class="text-sm text-gray-600 truncate">
                  {conversation.lastMessage}
                </p>

                {#if conversation.unread}
                  <div class="mt-1">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-black text-white">
                      {i18n.messages_new()}
                    </span>
                  </div>
                {/if}
              </div>
            </div>
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>