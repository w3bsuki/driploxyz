<script lang="ts">
  import { Avatar, Button } from '@repo/ui';
  import Header from '$lib/components/Header.svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { PageData } from './$types';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  let messageText = $state('');
  let sending = $state(false);
  
  const searchParams = $derived(() => $page.url.searchParams);
  const recipientId = $derived(() => searchParams.get('to'));
  const productId = $derived(() => searchParams.get('product'));
  
  const recipient = $derived(() => data.recipient);
  const product = $derived(() => data.product);
  
  async function sendMessage() {
    if (!messageText.trim() || !data.user || !recipientId) return;
    
    sending = true;
    
    try {
      const { error } = await data.supabase
        .from('messages')
        .insert({
          sender_id: data.user.id,
          receiver_id: recipientId,
          product_id: productId,
          content: messageText.trim()
        });
      
      if (error) throw error;
      
      // Navigate to messages page with conversation context
      const conversationParam = productId ? `${recipientId}__${productId}` : `${recipientId}__general`;
      goto(`/messages?conversation=${conversationParam}`);
    } catch (err) {
      console.error('Error sending message:', err);
      sending = false;
    }
  }
</script>

<svelte:head>
  <title>New Message - Driplo</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <Header />
  
  <div class="max-w-2xl mx-auto px-4 sm:px-6 py-6">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center space-x-3 mb-4">
        <button onclick={() => history.back()} class="p-2 hover:bg-gray-100 rounded-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-xl font-bold text-gray-900">New Message</h1>
      </div>
      
      {#if recipient}
        <div class="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-xs">
          <Avatar 
            src={recipient.avatar_url} 
            name={recipient.full_name || recipient.username} 
            size="md" 
          />
          <div>
            <p class="font-medium text-gray-900">{recipient.full_name || recipient.username}</p>
            <p class="text-sm text-gray-500">@{recipient.username}</p>
          </div>
        </div>
      {/if}
      
      {#if product}
        <div class="mt-4 p-4 bg-white rounded-lg shadow-xs">
          <div class="flex items-center space-x-3">
            <img 
              src={product.images?.[0]?.image_url || '/placeholder-product.svg'} 
              alt={product.title}
              class="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <p class="font-medium text-gray-900">{product.title}</p>
              <p class="text-lg font-bold text-gray-900">${product.price}</p>
            </div>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Message Form -->
    <div class="bg-white rounded-lg shadow-xs p-4">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
          <textarea
            bind:value={messageText}
            rows="6"
            placeholder="Hi! I'm interested in this item..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          ></textarea>
        </div>
        
        <div class="flex space-x-3">
          <Button 
            onclick={() => history.back()}
            variant="outline" 
            class="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onclick={sendMessage}
            disabled={!messageText.trim() || sending}
            class="flex-1"
          >
            {#if sending}
              Sending...
            {:else}
              Send Message
            {/if}
          </Button>
        </div>
      </div>
    </div>
  </div>
</div>