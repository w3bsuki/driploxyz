<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { Avatar } from '@repo/ui';
  import { createBrowserClient } from '@supabase/ssr';
  import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
  import type { Database } from '@repo/database';
  
  let dismissed = $state(false);
  let currentActivity = $state(0);
  let isVisible = $state(true);
  let activities = $state<any[]>([]);
  
  const supabase = createBrowserClient<Database>(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY
  );
  
  // Function to calculate time ago in Bulgarian
  function getTimeAgo(date: string) {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'сега';
    if (diffMins < 60) return `${diffMins} мин`;
    if (diffHours < 24) return `${diffHours} час${diffHours === 1 ? '' : 'а'}`;
    return `${diffDays} ${diffDays === 1 ? 'ден' : 'дни'}`;
  }
  
  // Fetch real products from Supabase
  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        title,
        created_at,
        seller_id,
        profiles!products_seller_id_fkey (
          username,
          avatar_url
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data && !error) {
      activities = data.map(product => ({
        type: 'listing',
        user: product.profiles?.username || 'Потребител',
        item: product.title,
        productId: product.id,
        time: getTimeAgo(product.created_at),
        avatar: product.profiles?.avatar_url,
        initials: (product.profiles?.username || 'П')[0].toUpperCase()
      }));
    }
  }
  
  // Fetch products and rotate through activities
  onMount(() => {
    if (!browser) return;
    
    // Fetch real products on mount
    fetchProducts();
    
    // Set up rotation interval
    const interval = setInterval(() => {
      if (activities.length > 0) {
        // Fade out
        isVisible = false;
        
        setTimeout(() => {
          currentActivity = (currentActivity + 1) % activities.length;
          // Fade in
          isVisible = true;
        }, 300);
      }
    }, 4000);
    
    // Subscribe to real-time updates for new products
    const subscription = supabase
      .channel('product-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'products'
        },
        async (payload) => {
          // Fetch the new product with profile info
          const { data } = await supabase
            .from('products')
            .select(`
              id,
              title,
              created_at,
              seller_id,
              profiles!products_seller_id_fkey (
                username,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single();
          
          if (data) {
            const newActivity = {
              type: 'listing',
              user: data.profiles?.username || 'Потребител',
              item: data.title,
              productId: data.id,
              time: 'сега',
              avatar: data.profiles?.avatar_url,
              initials: (data.profiles?.username || 'П')[0].toUpperCase()
            };
            
            // Add to beginning of activities
            activities = [newActivity, ...activities.slice(0, 9)];
          }
        }
      )
      .subscribe();
    
    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  });

  function dismiss() {
    dismissed = true;
    if (browser) {
      localStorage.setItem('banner-dismissed', 'true');
      localStorage.setItem('banner-dismissed-time', Date.now().toString());
    }
  }
  
  // Check if banner was dismissed (expires after 7 days)
  onMount(() => {
    if (!browser) return;
    
    const wasDismissed = localStorage.getItem('banner-dismissed');
    const dismissedTime = localStorage.getItem('banner-dismissed-time');
    
    if (wasDismissed && dismissedTime) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        dismissed = true;
      } else {
        localStorage.removeItem('banner-dismissed');
        localStorage.removeItem('banner-dismissed-time');
      }
    }
  });
  
  const activity = $derived(activities.length > 0 ? activities[currentActivity] : null);
</script>

{#if !dismissed}
  <div class="relative bg-gradient-to-r from-black via-gray-900 to-black text-white overflow-hidden">
    <!-- Animated background pattern -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute inset-0" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px)"></div>
    </div>
    
    <div class="relative px-3 py-2.5 sm:px-6 sm:py-3">
      <div class="flex items-center justify-between gap-3">
        <!-- Live activity ticker -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 sm:gap-3">
            
            <!-- Activity text with fade animation -->
            <div class="overflow-hidden flex-1">
              <div class="transition-all duration-300 ease-in-out transform {isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}">
                {#if activity}
                  <div class="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    <!-- User Avatar -->
                    <div class="flex-shrink-0">
                      <Avatar 
                        name={activity.user}
                        src={activity.avatar}
                        size="xs"
                        fallback={activity.initials}
                        class="ring-1 ring-white/20"
                      />
                    </div>
                    <span class="font-medium flex items-center gap-1 truncate">
                      <span class="text-green-400 font-semibold">{activity.user}</span>
                      <span class="text-gray-300">•</span>
                      <span class="text-white">добави</span>
                      <a 
                        href="/product/{activity.productId}"
                        class="text-gray-100 font-normal hover:text-white underline decoration-dotted underline-offset-2 hover:decoration-solid transition-all"
                        onclick={(e) => e.stopPropagation()}
                      >
                        {activity.item}
                      </a>
                    </span>
                    <span class="text-gray-400 text-xs flex-shrink-0 hidden sm:inline">• {activity.time}</span>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        </div>
        
        <!-- CTA section -->
        <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <!-- View all link -->
          <a 
            href="/search"
            class="text-xs sm:text-sm font-medium text-gray-400 hover:text-white transition-colors whitespace-nowrap"
          >
            Виж всички →
          </a>
          
          <!-- Dismiss button -->
          <button 
            onclick={dismiss}
            class="p-1 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
            aria-label="Затвори банера"
          >
            <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: .5;
    }
  }
  
  .animate-ping {
    animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
  }
  
  @keyframes ping {
    75%, 100% {
      transform: scale(2);
      opacity: 0;
    }
  }
</style>