<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { BottomNav } from '@repo/ui';
  import * as i18n from '@repo/i18n';
  import { messageNotificationActions, unreadMessageCount } from '$lib/stores/messageNotifications';
  import { ConversationService, type Conversation } from '$lib/services/ConversationService';
  import ConversationSidebar from '$lib/components/modular/ConversationSidebar.svelte';
  import ChatWindow from '$lib/components/modular/ChatWindow.svelte';
  import ConnectionStatus from '$lib/components/modular/ConnectionStatus.svelte';
  import { createBrowserSupabaseClient } from '$lib/supabase/client';
  import type { PageData } from './$types';
  import { messagingLogger } from '$lib/utils/log';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  // State management
  let conversationService: ConversationService;
  let conversations = $state<Conversation[]>([]);
  let activeConversation = $state<Conversation | null>(null);
  let activeTab = $state<'all' | 'buying' | 'selling' | 'offers' | 'unread'>('all');
  let showSidebarOnMobile = $state(true);
  let isLoadingOlder = $state(false);
  let hasMoreMessages = $state(true);
  let isInitializing = $state(true);
  let isLoadingConversation = $state(false);
  let connectionStatus = $state<'connected' | 'connecting' | 'error' | 'disconnected'>('disconnected');
  let connectionMessage = $state('');
  let canRetryConnection = $state(false);

  const supabase = createBrowserSupabaseClient();

  // Initialize conversation service
  onMount(async () => {
    if (!data.user) {
      isInitializing = false;
      return;
    }
    
    try {
      conversationService = new ConversationService(supabase, data.user.id);
      
      // Set up event listeners FIRST
      conversationService.on('conversations_updated', (updatedConversations: Conversation[]) => {
        conversations = updatedConversations;
        messageNotificationActions.setUnreadCount(
          updatedConversations.filter(c => c.unread).length
        );
        isInitializing = false;
      });
      
      conversationService.on('conversation_updated', (updatedConversation: Conversation) => {
        // Update the conversation in the list
        const index = conversations.findIndex(c => c.id === updatedConversation.id);
        if (index >= 0) {
          conversations[index] = updatedConversation;
          conversations = [...conversations]; // Trigger reactivity
        }
        
        // Update active conversation if it matches
        if (activeConversation?.id === updatedConversation.id) {
          activeConversation = updatedConversation;
        }
      });
      
      // Handle connection status changes
      conversationService.on('connection_status', (status: any) => {
        connectionStatus = status.status;
        connectionMessage = status.message;
        canRetryConnection = status.canRetry;
      });
      
      // Handle connection errors
      conversationService.on('connection_error', (error: any) => {
        messagingLogger.error('Realtime connection error', error);
        connectionStatus = 'error';
        connectionMessage = error.message || 'Connection failed';
        canRetryConnection = true;
      });
      
      // Handle message errors
      conversationService.on('message_error', (errorData: any) => {
        messagingLogger.error('Message error', errorData.error);
        // Could show a toast notification here
      });

      // Initialize with optimized server data
      if (data.conversations && data.conversations.length > 0) {
        // Use conversation summaries (much faster)
        conversationService.initializeConversations(data.conversations, 'conversations');
      } else if (data.messages && data.messages.length > 0) {
        // Fallback to message-based initialization for specific conversation
        conversationService.initializeConversations(data.messages, 'messages');
      } else {
        // No data - empty state
        conversations = [];
        isInitializing = false;
      }
      
      // Setup real-time subscriptions immediately (no delay)
      conversationService.setupRealtimeSubscriptions();
      
      // Set initial unread count
      if (data.unreadCount !== undefined) {
        messageNotificationActions.setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      messagingLogger.error('Error initializing conversations', error, {
        userId: data.user?.id
      });
      isInitializing = false;
    }
  });

  // Handle URL conversation parameter with better loading states
  $effect(() => {
    const conversationParam = $page.url.searchParams.get('conversation');
    
    if (conversationParam && !isInitializing) {
      // Find and set active conversation
      const conversation = conversations.find(c => c.id === conversationParam);
      if (conversation) {
        // Load messages if not already loaded
        if (conversation.messages.length === 0 && data.messages && data.messages.length > 0) {
          conversation.messages = data.messages;
          conversation.messageCache = new Set(data.messages.map(m => m.id));
        }
        activeConversation = conversation;
        showSidebarOnMobile = false; // Show chat on mobile
      } else {
        // Create new conversation from server data (for starting new conversations)
        const [otherUserId, productId] = conversationParam.split('__');
        
        const newConversation: Conversation = {
          id: conversationParam,
          userId: otherUserId,
          userName: data.conversationUser?.username || data.conversationUser?.full_name || 'User',
          userAvatar: data.conversationUser?.avatar_url,
          productId: productId === 'general' ? null : productId,
          productTitle: data.conversationProduct?.title || null,
          productImage: data.conversationProduct?.images?.[0]?.image_url || null,
          productPrice: data.conversationProduct?.price || 0,
          messages: data.messages || [],
          lastMessage: data.messages?.length ? data.messages[data.messages.length - 1].content : 'Start a conversation...',
          lastMessageTime: data.messages?.length ? data.messages[data.messages.length - 1].created_at : new Date().toISOString(),
          unread: false,
          lastActiveAt: data.conversationUser?.last_active_at,
          isProductConversation: productId !== 'general',
          messageCache: new Set((data.messages || []).map(m => m.id))
        };
        
        activeConversation = newConversation;
        // Add to conversations list if not already there
        if (!conversations.find(c => c.id === conversationParam)) {
          conversations = [newConversation, ...conversations];
        }
        showSidebarOnMobile = false;
      }
    } else if (!conversationParam) {
      activeConversation = null;
      showSidebarOnMobile = true;
    }
  });

  // Event handlers
  function handleConversationSelect(conversationId: string) {
    isLoadingConversation = true;
    goto(`/messages?conversation=${conversationId}`);
    // Reset loading state after navigation
    setTimeout(() => {
      isLoadingConversation = false;
    }, 500);
  }

  function handleBackToList() {
    goto('/messages');
  }

  function handleTabChange(tab: string) {
    activeTab = tab as typeof activeTab;
  }

  async function handleSendMessage(content: string) {
    if (!activeConversation || !conversationService) {
      messagingLogger.error('Cannot send message: missing dependencies', {
        hasActiveConversation: !!activeConversation,
        hasConversationService: !!conversationService,
        userId: data.user?.id
      });
      return;
    }
    
    const success = await conversationService.sendMessage(activeConversation.id, content);
    if (!success) {
      messagingLogger.error('Failed to send message', {
        conversationId: activeConversation.id,
        userId: data.user?.id
      });
      alert('Failed to send message. Please try again.');
    }
  }

  async function handleLoadOlder() {
    if (!activeConversation || !conversationService || isLoadingOlder || !hasMoreMessages) return;
    
    const oldestMessage = activeConversation.messages[0];
    if (!oldestMessage) return;
    
    isLoadingOlder = true;
    
    try {
      const hasMore = await conversationService.loadOlderMessages(
        activeConversation.id, 
        oldestMessage.created_at
      );
      hasMoreMessages = hasMore;
      
      // Update the active conversation with new messages
      const updatedConversation = conversationService.getConversation(activeConversation.id);
      if (updatedConversation) {
        activeConversation = updatedConversation;
      }
    } catch (error) {
      messagingLogger.error('Failed to load older messages', error, {
        conversationId: activeConversation.id,
        userId: data.user?.id
      });
    } finally {
      isLoadingOlder = false;
    }
  }

  // Retry connection handler
  function handleRetryConnection() {
    if (conversationService) {
      connectionStatus = 'connecting';
      connectionMessage = 'Reconnecting...';
      conversationService.setupRealtimeSubscriptions();
    }
  }
  
  // Cleanup
  onDestroy(() => {
    conversationService?.cleanup();
  });
</script>

<svelte:head>
  <title>Messages - Driplo</title>
</svelte:head>

<div class="h-screen bg-gray-50 flex flex-col overflow-hidden">
  <!-- Connection Status -->
  <ConnectionStatus 
    status={connectionStatus}
    message={connectionMessage}
    canRetry={canRetryConnection}
    onRetry={handleRetryConnection}
  />

  <!-- Main Content -->
  <div class="flex-1 overflow-hidden">
    {#if isInitializing}
      <!-- Loading State -->
      <div class="h-full flex items-center justify-center bg-gray-50">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-black mx-auto mb-4"></div>
          <p class="text-gray-600">Loading messages...</p>
        </div>
      </div>
    {:else}
      <div class="h-full max-w-7xl mx-auto sm:px-6 lg:px-8 flex">
        <div class="flex-1 sm:grid sm:grid-cols-3 lg:grid-cols-4 overflow-hidden h-full bg-white sm:rounded-lg sm:shadow-sm">
          
          <!-- Conversations Sidebar -->
          <div class="sm:col-span-1 {activeConversation ? 'hidden sm:block' : ''}">
            <ConversationSidebar
              {conversations}
              activeConversationId={activeConversation?.id}
              {activeTab}
              showOnMobile={!activeConversation}
              onConversationSelect={handleConversationSelect}
              onTabChange={handleTabChange}
            />
          </div>

        <!-- Chat Window -->
        <div class="sm:col-span-2 lg:col-span-3 h-full {!activeConversation ? 'hidden sm:block' : ''}">
          {#if activeConversation}
            <ChatWindow
              conversation={activeConversation}
              currentUserId={data.user?.id || ''}
              onBackToList={handleBackToList}
              onSendMessage={handleSendMessage}
              onLoadOlder={handleLoadOlder}
              {isLoadingOlder}
              {hasMoreMessages}
            />
          {:else}
            <!-- No Conversation Selected (Desktop) -->
            <div class="hidden sm:flex items-center justify-center h-full">
              <div class="text-center">
                <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 class="text-lg font-medium text-gray-900 mb-2">{i18n.messages_selectConversation()}</h3>
                <p class="text-gray-600">{i18n.messages_chooseMessage()}</p>
              </div>
            </div>
          {/if}
        </div>
        
      </div>
    </div>
    {/if}
  </div>

  <!-- Bottom Navigation - Hide when in active conversation to show message input -->
  {#if !activeConversation}
    <div class="shrink-0 sm:hidden">
      <BottomNav 
        currentPath={$page.url.pathname}
        unreadMessageCount={$unreadMessageCount}
        labels={{
          home: i18n.nav_home(),
          search: i18n.nav_search(),
          sell: i18n.nav_sell(),
          profile: i18n.nav_profile(),
          wishlist: i18n.nav_wishlist()
        }}
      />
    </div>
  {/if}
</div>