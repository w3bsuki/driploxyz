<script>
  import * as i18n from '@repo/i18n';
  
  // Force a refresh to get server data
  let currentLang = i18n.languageTag();
  
  // Show cookie value from browser
  let cookieValue = '';
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/locale=([^;]+)/);
    cookieValue = match ? match[1] : 'not set';
  }
</script>

<div class="p-8 max-w-md mx-auto bg-white rounded-xl shadow-lg">
  <h1 class="text-2xl font-bold mb-4">Language Test Page</h1>
  
  <div class="space-y-2">
    <p><strong>i18n.languageTag():</strong> {currentLang}</p>
    <p><strong>Cookie value:</strong> {cookieValue}</p>
    <p><strong>Test translation:</strong> {i18n.test ? i18n.test() : 'No test() function'}</p>
    <p><strong>Welcome message:</strong> {i18n.welcome ? i18n.welcome() : 'No welcome() function'}</p>
  </div>
  
  <button 
    onclick={() => window.location.reload()}
    class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  >
    Refresh Page
  </button>
  
  <a href="/" class="block mt-2 text-blue-500 hover:underline">← Back to Home</a>
</div>