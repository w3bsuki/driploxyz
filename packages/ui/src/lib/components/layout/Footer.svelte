<script lang="ts">
  import * as i18n from '@repo/i18n';
  import type { FooterProps } from '../../types/panels';

  let {
    currentLanguage = 'en',
    onLanguageChange
  }: FooterProps = $props();

  let email = $state('');
  let isSubscribing = $state(false);

  async function handleNewsletterSubmit() {
    if (!email.trim()) return;
    
    isSubscribing = true;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Show success message
      email = '';
      // Could dispatch success event here
    } catch (error) {
      
    } finally {
      isSubscribing = false;
    }
  }
</script>

<footer class="bg-white border-t border-gray-200 mt-auto">
  <!-- Main Footer Content -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      
      <!-- Company -->
      <div class="space-y-4">
        <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider">
          {i18n.footer_company()}
        </h3>
        <ul class="space-y-2">
          <li>
            <a 
              href="/about" 
              class="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              {i18n.footer_about()}
            </a>
          </li>
          <li>
            <a 
              href="/careers" 
              class="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              {i18n.footer_careers()}
            </a>
          </li>
          <li>
            <a 
              href="/press" 
              class="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              {i18n.footer_press()}
            </a>
          </li>
          <li>
            <a 
              href="/blog" 
              class="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              {i18n.footer_blog()}
            </a>
          </li>
        </ul>
      </div>

      <!-- Support -->
      <div class="space-y-4">
        <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider">
          {i18n.footer_support()}
        </h3>
        <ul class="space-y-2">
          <li>
            <a 
              href="/help" 
              class="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              {i18n.footer_help()}
            </a>
          </li>
          <li>
            <a 
              href="/trust-safety" 
              class="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              {i18n.footer_trustSafety()}
            </a>
          </li>
          <li>
            <a 
              href="/returns" 
              class="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              {i18n.footer_returns()}
            </a>
          </li>
        </ul>
      </div>

      <!-- Legal -->
      <div class="space-y-4">
        <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider">
          {i18n.footer_legal()}
        </h3>
        <ul class="space-y-2">
          <li>
            <a 
              href="/privacy" 
              class="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              {i18n.footer_privacy()}
            </a>
          </li>
          <li>
            <a 
              href="/terms" 
              class="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              {i18n.footer_terms()}
            </a>
          </li>
          <li>
            <a 
              href="/privacy/cookies" 
              class="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              {i18n.footer_cookies()}
            </a>
          </li>
        </ul>
      </div>

      <!-- Newsletter & Social -->
      <div class="space-y-4">
        <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider">
          {i18n.footer_newsletter()}
        </h3>
        
        <!-- Newsletter Signup -->
        <form onsubmit={handleNewsletterSubmit} class="space-y-3">
          <div class="flex gap-2">
            <input
              bind:value={email}
              type="email"
              placeholder={i18n.footer_newsletterPlaceholder()}
              class="flex-1 min-h-[36px] px-3 py-2 text-sm border border-gray-200 rounded-lg 
                     focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
              disabled={isSubscribing}
            />
            <button
              type="submit"
              disabled={!email.trim() || isSubscribing}
              class="min-h-[36px] px-4 py-2 bg-black text-white text-sm font-medium rounded-lg
                     hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed 
                     transition-colors flex items-center justify-center"
            >
              {#if isSubscribing}
                <svg class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              {:else}
                {i18n.footer_subscribe()}
              {/if}
            </button>
          </div>
        </form>

        <!-- Social Media -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium text-gray-900">{i18n.footer_followUs()}</h4>
          <div class="flex space-x-3">
            <a 
              href="https://instagram.com/driplo.xyz" 
              class="w-8 h-8 bg-white rounded-lg flex items-center justify-center 
                     hover:bg-white transition-colors group"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <svg class="w-4 h-4 text-gray-500 group-hover:text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C8.396 0 7.929.013 6.71.072 5.493.131 4.73.33 4.058.63c-.692.3-1.281.72-1.866 1.305-.585.585-1.006 1.174-1.305 1.866-.3.672-.499 1.435-.558 2.652C.013 7.929 0 8.396 0 12.017s.013 4.088.072 5.307c.059 1.217.258 1.98.558 2.652.3.692.72 1.281 1.305 1.866.585.585 1.174 1.006 1.866 1.305.672.3 1.435.499 2.652.558 1.219.059 1.686.072 5.307.072s4.088-.013 5.307-.072c1.217-.059 1.98-.258 2.652-.558.692-.3 1.281-.72 1.866-1.305.585-.585 1.006-1.174 1.305-1.866.3-.672.499-1.435.558-2.652.059-1.219.072-1.686.072-5.307s-.013-4.088-.072-5.307c-.059-1.217-.258-1.98-.558-2.652C21.36 2.437 20.94 1.848 20.355 1.263S18.462.632 17.77.33c-.672-.3-1.435-.499-2.652-.558C13.899.013 13.432 0 12.017 0zm0 2.167c3.555 0 3.977.012 5.378.07 1.297.059 2.001.277 2.47.46.62.24 1.062.527 1.527.992.465.465.752.907.992 1.527.183.469.401 1.173.46 2.47.058 1.401.07 1.823.07 5.378s-.012 3.977-.07 5.378c-.059 1.297-.277 2.001-.46 2.47-.24.62-.527 1.062-.992 1.527-.465.465-.907.752-1.527.992-.469.183-1.173.401-2.47.46-1.401.058-1.823.07-5.378.07s-3.977-.012-5.378-.07c-1.297-.059-2.001-.277-2.47-.46-.62-.24-1.062-.527-1.527-.992-.465-.465-.752-.907-.992-1.527-.183-.469-.401-1.173-.46-2.47C2.179 15.994 2.167 15.572 2.167 12.017s.012-3.977.07-5.378c.059-1.297.277-2.001.46-2.47.24-.62.527-1.062.992-1.527.465-.465.907-.752 1.527-.992.469-.183 1.173-.401 2.47-.46 1.401-.058 1.823-.07 5.378-.07z"/>
                <path d="M12.017 5.838a6.179 6.179 0 100 12.358 6.179 6.179 0 000-12.358zm0 10.191a4.012 4.012 0 110-8.024 4.012 4.012 0 010 8.024z"/>
                <circle cx="18.406" cy="5.594" r="1.444"/>
              </svg>
            </a>
            
            <a 
              href="https://twitter.com/driplo_xyz" 
              class="w-8 h-8 bg-white rounded-lg flex items-center justify-center 
                     hover:bg-white transition-colors group"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <svg class="w-4 h-4 text-gray-500 group-hover:text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z"/>
              </svg>
            </a>
            
            <a 
              href="https://facebook.com/driplo.xyz" 
              class="w-8 h-8 bg-white rounded-lg flex items-center justify-center 
                     hover:bg-white transition-colors group"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <svg class="w-4 h-4 text-gray-500 group-hover:text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Bottom Bar -->
  <div class="border-t border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
        
        <!-- Copyright -->
        <div class="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2">
          <div class="flex items-center space-x-2 text-sm text-gray-500">
            <span>© {new Date().getFullYear()} Driplo.</span>
            <span>{i18n.footer_allRightsReserved()}</span>
          </div>
          <div class="flex items-center space-x-1 text-sm text-gray-500">
            <span>{i18n.footer_madeWith()}</span>
            <span class="text-red-500">❤️</span>
            <span>{i18n.footer_in()}</span>
            <span class="font-medium">{i18n.footer_bulgaria()} 🇧🇬</span>
          </div>
        </div>

        <!-- Language Switcher (Mobile Only) -->
        {#if onLanguageChange}
          <div class="sm:hidden">
            <select 
              value={currentLanguage}
              onchange={(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) => onLanguageChange?.(e.currentTarget.value)}
              class="text-sm border border-gray-200 rounded-lg px-3 py-1 bg-white
                     focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="en">🇬🇧 English</option>
              <option value="bg">🇧🇬 Български</option>
            </select>
          </div>
        {/if}
        
        <!-- Logo/Branding -->
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <div class="w-6 h-6 bg-black rounded-md flex items-center justify-center">
              <span class="text-white font-bold text-xs">D</span>
            </div>
            <span class="font-bold text-gray-900 text-sm">Driplo</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</footer>