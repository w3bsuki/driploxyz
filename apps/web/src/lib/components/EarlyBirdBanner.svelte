<script lang="ts">
  import { Button } from '@repo/ui';
  import * as i18n from '@repo/i18n';

  let showBanner = $state(true);
  let dismissed = $state(false);

  function dismiss() {
    dismissed = true;
    showBanner = false;
  }
</script>

{#if showBanner && !dismissed}
  <div class="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
    <div class="px-3 py-2 sm:px-6 sm:py-3">
      <div class="flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:gap-4">
        <!-- Mobile Layout -->
        <div class="flex items-center gap-2 sm:hidden">
          <span class="text-lg">🚀</span>
          <span class="text-sm font-bold">{i18n.t('banner_welcomeToDriplo')}</span>
        </div>
        <div class="text-xs sm:hidden">{i18n.t('banner_sellBuySecond')}</div>
        
        <!-- Desktop Layout -->
        <div class="hidden sm:flex sm:items-center sm:gap-3">
          <span class="text-xl">🚀</span>
          <span class="text-base font-bold">{i18n.t('banner_welcomeToDriplo')}</span>
          <span class="text-sm opacity-90">{i18n.t('banner_sellBuySecond')}</span>
        </div>
        
        <!-- CTA Button -->
        <div class="flex items-center gap-2">
          <Button 
            href="/sell"
            size="sm"
            class="!bg-white !text-indigo-600 hover:!bg-gray-100 !font-bold !px-4 !py-2 !text-sm sm:!px-6"
          >
            {i18n.t('banner_register')}
          </Button>
          
          <button 
            onclick={dismiss}
            class="p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close banner"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}