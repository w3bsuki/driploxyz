<script lang="ts">
  import * as i18n from '@repo/i18n';
  
  interface Props {
    messageText: string;
    isSending: boolean;
    onSendMessage: () => void;
    onTyping: () => void;
    onUpdateText: (text: string) => void;
  }
  
  let { messageText, isSending, onSendMessage, onTyping, onUpdateText }: Props = $props();
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    } else {
      onTyping();
    }
  }
  
  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    onUpdateText(target.value);
    onTyping();
  }
</script>

<div class="border-t border-gray-200 p-4 bg-white">
  <!-- Quick Actions -->
  <div class="flex gap-2 mb-2 overflow-x-auto scrollbarhide">
    <button class="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap">
      <span class="text-lg">💰</span>
      <span class="text-xs font-medium">{i18n.messages_makeOffer()}</span>
    </button>
    <button class="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap">
      <span class="text-lg">📦</span>
      <span class="text-xs font-medium">{i18n.messages_bundle()}</span>
    </button>
    <button class="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap" aria-label="Share location">
      <span class="text-lg">📍</span>
      <span class="text-xs font-medium">{i18n.messages_location()}</span>
    </button>
    <button class="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap" aria-label="Upload photo">
      <span class="text-lg">📸</span>
      <span class="text-xs font-medium">{i18n.messages_photo()}</span>
    </button>
  </div>
  
  <div class="flex items-center space-x-2">
    <div class="flex-1 relative">
      <input
        id="message-input"
        type="text"
        value={messageText}
        onkeydown={handleKeydown}
        oninput={handleInput}
        placeholder={i18n.messages_messageInput()}
        aria-label="Type a message"
        class="w-full px-4 py-2.5 bg-gray-50 rounded-full text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white"
      />
    </div>
    <button 
      onclick={onSendMessage}
      class="p-2.5 bg-black text-white rounded-full hover:bg-gray-800 transition-colors {messageText.trim() && !isSending ? '' : 'opacity-50 cursor-not-allowed'}"
      disabled={!messageText.trim() || isSending}
      aria-label="Send message"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    </button>
  </div>
</div>

