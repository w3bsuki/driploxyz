<script lang="ts">
  import '../app.css';
  import '$lib/styles/cyrillic-typography.css';
  import { invalidate } from '$app/navigation';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { user, session, profile, authLoading, setSupabaseClient } from '$lib/stores/auth';
  import { activeNotification, handleNotificationClick } from '$lib/stores/messageNotifications';
  import { activeFollowNotification, handleFollowNotificationClick } from '$lib/stores/followNotifications';
  import { MessageNotificationToast, FollowNotificationToast } from '@repo/ui';
  import CookieConsentPro from '$lib/components/CookieConsentPro.svelte';
  import { page } from '$app/stores';
  import EarlyBirdBanner from '$lib/components/EarlyBirdBanner.svelte';
  import LocaleDetector from '$lib/components/LocaleDetector.svelte';
  import { initializeLanguage } from '$lib/utils/language';
  import * as i18n from '@repo/i18n';
  import type { LayoutData } from './$types';
  import type { Snippet } from 'svelte';

  // Initialize language immediately when browser is available
  if (browser) {
    initializeLanguage();
    // Set the lang attribute on the html element
    document.documentElement.lang = i18n.languageTag();
  }

  let { data, children }: { data: LayoutData; children?: Snippet } = $props();

  // Use $derived for reactive destructuring in Svelte 5
  const supabase = $derived(data?.supabase);
  const isAuthPage = $derived($page.route.id?.includes('(auth)'));

  // Initialize auth stores with timeout protection
  $effect(() => {
    // Set a timeout to prevent infinite loading state
    const loadingTimeout = setTimeout(() => {
      if ($authLoading) {
        console.warn('[AUTH] Loading timeout - forcing auth state resolution');
        authLoading.set(false);
      }
    }, 5000); // 5 second timeout
    
    try {
      if (data?.user !== undefined) {
        user.set(data.user);
      }
      if (data?.session !== undefined) {
        session.set(data.session);
      }
      if (data?.profile !== undefined) {
        profile.set(data.profile);
      }
      if (data?.supabase) {
        setSupabaseClient(data.supabase);
      }
      authLoading.set(false);
    } catch (error) {
      console.error('[AUTH_INIT_ERROR]', error);
      authLoading.set(false);
    }
    
    // Clear timeout if auth loads successfully
    return () => clearTimeout(loadingTimeout);
  });

  onMount(async () => {
    
    if (!supabase) {
      console.error('[LAYOUT] No Supabase client available');
      authLoading.set(false); // Ensure we don't stay in loading state
      return;
    }
    
    try {
      // If we have a user but no profile, fetch the profile immediately
      if (data?.user && !data?.profile) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) {
          console.error('[PROFILE_FETCH_ERROR]', profileError);
        } else if (profileData) {
          profile.set(profileData);
        }
      }
      
      const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
        console.log('[AUTH_STATE_CHANGE]', event, newSession?.user?.id?.substring(0, 8));
        
        const currentSession = session.subscribe ? undefined : data?.session;
        if (newSession?.expires_at !== currentSession?.expires_at) {
          invalidate('supabase:auth');
        }
        
        // Handle specific auth events
        if (event === 'SIGNED_IN') {
          console.log('[AUTH] User signed in');
          authLoading.set(false);
        } else if (event === 'SIGNED_OUT') {
          console.log('[AUTH] User signed out');
          authLoading.set(false);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('[AUTH] Token refreshed');
        } else if (event === 'USER_UPDATED') {
          console.log('[AUTH] User updated');
        }
      });

      return () => authListener.subscription.unsubscribe();
    } catch (error) {
      console.error('[LAYOUT_MOUNT_ERROR]', error);
      authLoading.set(false); // Ensure we don't stay in loading state
    }
  });
</script>

{#if !isAuthPage}
  <EarlyBirdBanner />
{/if}
{@render children?.()}

<!-- Locale Detection -->
<LocaleDetector />

<!-- Professional Cookie Consent with Locale Detection -->
<CookieConsentPro 
  onLocaleChange={(locale) => {
    if (browser) {
      i18n.setLanguageTag(locale);
      document.documentElement.lang = locale;
      // Store locale preference
      localStorage.setItem('preferred-locale', locale);
      // Reload page to apply new locale
      window.location.reload();
    }
  }}
/>

<!-- Global Message Notification Toast -->
{#if $activeNotification}
  <MessageNotificationToast
    show={true}
    sender={{
      id: $activeNotification.senderId,
      username: $activeNotification.senderName,
      avatar_url: $activeNotification.senderAvatar
    }}
    message={$activeNotification.message}
    product={$activeNotification.isProductMessage ? {
      id: $activeNotification.productId || '',
      title: $activeNotification.productTitle || '',
      image: $activeNotification.productImage || ''
    } : undefined}
    onReply={() => handleNotificationClick($activeNotification)}
    onDismiss={() => activeNotification.set(null)}
  />
{/if}

<!-- Global Follow Notification Toast -->
{#if $activeFollowNotification}
  <FollowNotificationToast
    show={true}
    followerName={$activeFollowNotification.followerName}
    followerUsername={$activeFollowNotification.followerUsername}
    followerAvatar={$activeFollowNotification.followerAvatar}
    onViewProfile={() => handleFollowNotificationClick($activeFollowNotification)}
    onDismiss={() => activeFollowNotification.set(null)}
  />
{/if}