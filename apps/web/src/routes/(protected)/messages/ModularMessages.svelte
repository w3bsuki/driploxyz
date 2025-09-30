<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { BottomNav } from '@repo/ui';
  import * as i18n from '@repo/i18n';
  import { messageNotificationActions, unreadMessageCount } from '$lib/stores/messageNotifications.svelte';
  import { ConversationService, type Conversation, type Message } from '$lib/services/ConversationService';
  // eslint-disable-next-line no-restricted-imports -- App-specific messaging component
  import ConversationSidebar from '$lib/components/modular/ConversationSidebar.svelte';
  // eslint-disable-next-line no-restricted-imports -- App-specific messaging component
  import ChatWindow from '$lib/components/modular/ChatWindow.svelte';
  // eslint-disable-next-line no-restricted-imports -- App-specific messaging component
  import ConnectionStatus from '$lib/components/modular/ConnectionStatus.svelte';
  import { createBrowserSupabaseClient } from '$lib/supabase/client';
  import type { PageData } from './$types';
  import { messagingLogger } from '$lib/utils/log';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  // Optimized state management with $state.raw for performance on large arrays
  let conversationService: ConversationService;
  let conversations = $state.raw<Conversation[]>([]); // Use $state.raw for better performance on arrays
  let activeConversation = $state<Conversation | null>(null);
  let activeConversationMessages = $state.raw<Message[]>([]); // Use $state.raw for message arrays
  let activeTab = $state<'all' | 'buying' | 'selling' | 'offers' | 'unread'>('all');
  let isLoadingOlder = $state(false);
   
  let _showSidebarOnMobile = $state(false);
   
  let _isLoadingConversation = $state(false);
  let hasMoreMessages = $state(true);
  let isInitializing = $state(true);
  let isSendingMessage = $state(false);
  let connectionStatus = $state<'connected' | 'connecting' | 'error' | 'disconnected'>('disconnected');
  let connectionMessage = $state('');
  let canRetryConnection = $state(false);

  const supabase = createBrowserSupabaseClient();

  // Initialize simplified conversation service
  $effect(async () => {
    if (!data.user) {
      isInitializing = false;
      return;
    }

    try {
      conversationService = new ConversationService(supabase, data.user.id);

      // Set up event listeners for the simplified service
      conversationService.on('connection_status', (status: { status: string; message: string; canRetry: boolean }) => {
        connectionStatus = status.status;
        connectionMessage = status.message;
        canRetryConnection = status.canRetry;
      });

      // Handle new message notifications - just refresh the conversation
      conversationService.on('new_message', async (data: { conversationId: string }) => {
        messagingLogger.info('New message notification received', data);

        // If it's for the active conversation, reload messages
        if (activeConversation && data.conversationId === activeConversation.id) {
          await loadConversationMessages(activeConversation.id);
        }

        // Always reload conversations to update unread counts and last messages
        await loadConversations();
      });

      // Handle polling refresh
      conversationService.on('poll_refresh', async () => {
        if (activeConversation) {
          await loadConversationMessages(activeConversation.id);
        }
        await loadConversations();
      });

      // Load initial data from server
      await loadConversations();

      // Fallback: if no conversations loaded but we have server data, use it
      if (conversations.length === 0 && data.conversations && data.conversations.length > 0) {
        messagingLogger.info('Using server data as fallback for conversations');
        conversations = data.conversations;
      }

      // If we have a specific conversation from URL, load its messages
      if (data.messages && data.messages.length > 0) {
        activeConversationMessages = data.messages;
      }

      // Setup real-time subscriptions
      conversationService.setupRealtimeSubscriptions();

      isInitializing = false;

      // Return cleanup function
      return () => {
        conversationService?.cleanup();
      };
    } catch (error) {
      messagingLogger.error('Error initializing conversations', error, {
        userId: data.user?.id
      });
      isInitializing = false;
    }
  });

  // Load conversations from server
  async function loadConversations() {
    try {
      const freshConversations = await conversationService.loadConversations();
      messagingLogger.info('Setting conversations in UI', { 
        conversationCount: freshConversations.length,
        conversations: freshConversations 
      });
      
      conversations = freshConversations;
      
      
      // Update unread count
      const unreadCount = freshConversations.filter(c => c.unread).length;
      messageNotificationActions.setUnreadCount(unreadCount);
    } catch (error) {
      messagingLogger.error('Failed to load conversations', error);
    }
  }

  // Load messages for a specific conversation
  async function loadConversationMessages(conversationId: string) {
    try {
      const messages = await conversationService.loadMessages(conversationId);
      activeConversationMessages = messages;
      hasMoreMessages = messages.length >= 30; // Assume more if we got a full batch
    } catch (error) {
      messagingLogger.error('Failed to load conversation messages', error);
    }
  }

  // Handle URL conversation parameter with simplified loading
  $effect(async () => {
    const conversationParam = page.url.searchParams.get('conversation');
    
    if (conversationParam && !isInitializing) {
      // Find conversation in current list
      const conversation = conversations.find(c => c.id === conversationParam);
      if (conversation) {
        activeConversation = conversation;
        await loadConversationMessages(conversationParam);
        _showSidebarOnMobile = false;
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
          messages: [],
          lastMessage: 'Start a conversation...',
          lastMessageTime: new Date().toISOString(),
          unread: false,
          lastActiveAt: data.conversationUser?.last_active_at,
          isProductConversation: productId !== 'general',
          isOrderConversation: false
        };
        
        activeConversation = newConversation;
        
        // Load messages from server or use existing data
        if (data.messages && data.messages.length > 0) {
          activeConversationMessages = data.messages;
        } else {
          await loadConversationMessages(conversationParam);
        }
        
        // Add to conversations list if not already there
        if (!conversations.find(c => c.id === conversationParam)) {
          conversations = [newConversation, ...conversations];
        }
        _showSidebarOnMobile = false;
      }
    } else if (!conversationParam) {
      activeConversation = null;
      activeConversationMessages = [];
      _showSidebarOnMobile = true;
    }
  });

  // Event handlers
  function handleConversationSelect(conversationId: string) {
    _isLoadingConversation = true;
    goto(`/messages?conversation=${conversationId}`);
    // Reset loading state after navigation
    setTimeout(() => {
      _isLoadingConversation = false;
    }, 500);
  }

  function handleBackToList() {
    goto('/messages');
  }

  function handleTabChange(tab: string) {
    activeTab = tab as typeof activeTab;
  }

  async function handleSendMessage(content: string) {
    if (!activeConversation || !conversationService || isSendingMessage) {
      return;
    }
    
    isSendingMessage = true;
    
    try {
      const success = await conversationService.sendMessage(activeConversation.id, content);
      
      if (success) {
        // Reload messages to get the fresh message with server data
        await loadConversationMessages(activeConversation.id);
        // Reload conversations to update last message
        await loadConversations();
      } else {
        messagingLogger.error('Failed to send message', {
          conversationId: activeConversation.id,
          userId: data.user?.id
        });
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      messagingLogger.error('Error sending message', error);
      alert('Failed to send message. Please try again.');
    } finally {
      isSendingMessage = false;
    }
  }

  async function handleLoadOlder() {
    if (!activeConversation || !conversationService || isLoadingOlder || !hasMoreMessages) return;
    
    const oldestMessage = activeConversationMessages[0];
    if (!oldestMessage) return;
    
    isLoadingOlder = true;
    
    try {
      const olderMessages = await conversationService.loadOlderMessages(
        activeConversation.id, 
        oldestMessage.created_at
      );
      
      if (olderMessages.length > 0) {
        // Prepend older messages
        activeConversationMessages = [...olderMessages, ...activeConversationMessages];
        hasMoreMessages = olderMessages.length >= 20; // Assume more if we got a full batch
      } else {
        hasMoreMessages = false;
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
  
</script>

<svelte:head>
  <title>Messages - Driplo</title>
</svelte:head>

<div class="h-screen bg-white flex flex-col overflow-hidden">
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
      <div class="h-full flex items-center justify-center bg-white">
        <div class="text-center">
          <div class="animate-spin rounded-full h-10 w-10 border-3 border-gray-100 border-t-black mx-auto mb-4"></div>
          <p class="text-gray-800 font-medium">Loading messages...</p>
        </div>
      </div>
    {:else}
      <div class="h-full max-w-7xl mx-auto sm:px-4 lg:px-6 flex">
        <div class="flex-1 sm:grid sm:grid-cols-3 lg:grid-cols-4 overflow-hidden h-full bg-white sm:rounded-xl sm:shadow-xl sm:border sm:border-gray-200/50">
          
          <!-- Conversations Sidebar -->
          <div class="sm:col-span-1 {activeConversation ? 'hidden sm:block' : ''}">
            {#if conversations}
              <ConversationSidebar
                {conversations}
                activeConversationId={activeConversation?.id}
                bind:activeTab
                showOnMobile={!activeConversation}
                onConversationSelect={handleConversationSelect}
                onTabChange={handleTabChange}
              />
            {:else}
              <div>No conversations prop</div>
            {/if}
          </div>

        <!-- Chat Window -->
        <div class="sm:col-span-2 lg:col-span-3 h-full {!activeConversation ? 'hidden sm:block' : ''}">
          {#if activeConversation}
            <ChatWindow
              conversation={{...activeConversation, messages: activeConversationMessages}}
              currentUserId={data.user?.id || ''}
              onBackToList={handleBackToList}
              onSendMessage={handleSendMessage}
              onLoadOlder={handleLoadOlder}
              {isLoadingOlder}
              {hasMoreMessages}
              isSending={isSendingMessage}
            />
          {:else}
            <!-- No Conversation Selected (Desktop) -->
            <div class="hidden sm:flex items-center justify-center h-full bg-gray-50/30 border-l border-gray-200/50">
              <div class="text-center">
                <div class="w-20 h-20 mx-auto mb-6 bg-black/5 rounded-full flex items-center justify-center">
                  <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 class="text-lg font-bold text-black mb-2">{i18n.messages_selectConversation()}</h3>
                <p class="text-gray-500 text-sm">{i18n.messages_chooseMessage()}</p>
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
        currentPath={page.url.pathname}
        unreadMessageCount={unreadMessageCount()}
        profileHref={data.profile?.username ? `/profile/${data.profile.username}` : '/account'}
        labels={{
          home: i18n.nav_home(),
          search: i18n.nav_search(),
          sell: i18n.nav_sell(),
          profile: i18n.nav_profile(),
          messages: i18n.nav_messages()
        }}
      />
    </div>
  {/if}
</div>
