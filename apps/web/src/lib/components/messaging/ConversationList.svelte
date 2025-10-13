<script lang="ts">
  import { Avatar, TabGroup } from '@repo/ui';
  import * as i18n from '@repo/i18n';
  
  interface Conversation {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    lastMessage: string;
    lastMessageTime: string;
    unread: boolean;
    isProductConversation?: boolean;
    productTitle?: string;
    productImage?: string;
    isOffer?: boolean;
    offerPrice?: number;
  }
  
  interface Props {
    conversations: Conversation[];
    allConversations: Conversation[];
    activeTab: 'all' | 'buying' | 'selling' | 'offers' | 'unread';
    selectedConversationId: string | null;
    onTabChange: (tab: string) => void;
    onConversationSelect: (conversationId: string) => void;
  }
  
  let { conversations, allConversations, activeTab, selectedConversationId, onTabChange, onConversationSelect }: Props = $props();
  
  const timeAgo = () => {
    return i18n.messages_now();
  };
  
  const tabs = [
    { id: 'all', label: i18n.messages_all(), count: allConversations.length },
    { id: 'unread', label: i18n.messages_unread(), count: allConversations.filter(c => c.unread).length },
    { id: 'buying', label: i18n.messages_buying() },
    { id: 'selling', label: i18n.messages_selling() },
    { id: 'offers', label: i18n.messages_offers(), count: allConversations.filter(c => c.isOffer).length }
  ];
</script>

<div class="sm:col-span-1 lg:col-span-1 bg-white sm:border-r sm:border-gray-200 overflow-y-auto {selectedConversationId ? 'hidden sm:block' : ''} h-full">
  <!-- Mobile Filter Pills (Full Width) -->
  <div class="sm:hidden">
    <div class="grid grid-cols-5 gap-1 px-4 pb-3">
      {#each tabs as tab (tab.id)}
        <button
          onclick={() => onTabChange(tab.id)}
          class="px-2 py-1.5 rounded-full text-xs font-medium transition-colors
            {activeTab === tab.id 
              ? 'bg-black text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
        >
          <div class="truncate">
            {tab.label}
            {#if tab.count !== undefined && tab.count > 0}
              <span class="ml-1 text-xs">({tab.count})</span>
            {/if}
          </div>
        </button>
      {/each}
    </div>
  </div>
  
  <!-- Desktop Tabs -->
  <div class="hidden sm:block px-4 sm:px-6 lg:px-8">
    <TabGroup
      tabs={tabs}
      {activeTab}
      onTabChange={onTabChange}
    />
  </div>
  
  <!-- Conversations -->
  {#if conversations.length === 0}
    <div class="p-4 text-center text-gray-500">
      No conversations yet.
    </div>
  {/if}
  
  {#each conversations as conv (conv.id)}
    <button
      type="button"
      class="w-full px-4 py-4 hover:bg-gray-50 border-b border-gray-200 transition-colors text-left min-h-[68px] cursor-pointer
        {selectedConversationId === conv.id ? 'bg-gray-50' : ''}"
      onclick={() => {
        onConversationSelect(conv.id);
      }}
    >
      <div class="flex items-start space-x-3">
        <div class="relative shrink-0">
          <Avatar src={conv.userAvatar} name={conv.userName} size="md" />
          {#if conv.unread}
            <span class="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-blue-500 rounded-full border-2 border-white"></span>
          {/if}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start">
            <h3 class="font-medium text-gray-900 text-sm truncate">{conv.userName}</h3>
            <span class="text-xs text-gray-500 shrink-0 ml-2">{timeAgo(conv.lastMessageTime)}</span>
          </div>
          
          {#if conv.isOffer}
            <div class="inline-flex items-center space-x-1 mt-1">
              <span class="bg-blue-100 text-blue-700 text-xs font-medium px-1.5 py-0.5 rounded-sm">Offer</span>
              <span class="text-xs font-semibold text-gray-900">${conv.offerPrice}</span>
            </div>
          {:else}
            <div class="flex items-center space-x-2 mt-1">
              {#if conv.isProductConversation && conv.productTitle}
                <div class="flex items-center space-x-2">
                  <img src={conv.productImage} alt={conv.productTitle} class="w-6 h-6 rounded-sm object-cover" />
                  <span class="text-xs text-gray-600 truncate">{conv.productTitle}</span>
                  <span class="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-sm font-medium">Product</span>
                </div>
              {:else}
                <div class="flex items-center space-x-2">
                  <span class="text-xs text-gray-500 italic">{i18n.messages_noProducts()}</span>
                  <span class="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-sm font-medium">General</span>
                </div>
              {/if}
            </div>
          {/if}
          
          <p class="text-sm text-gray-600 truncate mt-1 {conv.unread ? 'font-semibold text-gray-900' : ''}">
            {conv.lastMessage}
          </p>
        </div>
      </div>
    </button>
  {/each}
</div>