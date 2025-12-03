<script lang="ts">
  import { goto } from '$app/navigation';
  import { Button, toasts } from '@repo/ui';
  import type { PageData } from './$types';
  import { badge_premium, badge_coming_soon, settings_vacation_mode_coming_soon } from '@repo/i18n';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  
  // GDPR state
  let isExporting = $state(false);
  let isDeleting = $state(false);
  let showDeleteConfirmation = $state(false);
  let deletionError = $state('');
  
  // GDPR handlers
  async function handleDataExport() {
    isExporting = true;
    try {
      const response = await fetch('/api/gdpr/export');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to export data');
      }
      
      // Trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `driplo-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toasts.success('Your data has been exported successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export data';
      toasts.error(message);
    } finally {
      isExporting = false;
    }
  }
  
  async function handleAccountDeletion() {
    isDeleting = true;
    deletionError = '';
    
    try {
      // First check eligibility
      const checkResponse = await fetch('/api/gdpr/delete');
      if (!checkResponse.ok) {
        throw new Error('Failed to check deletion eligibility');
      }
      
      const checkData = await checkResponse.json();
      if (!checkData.eligible) {
        deletionError = checkData.issues.join('. ');
        return;
      }
      
      // Proceed with deletion
      const response = await fetch('/api/gdpr/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmation: 'DELETE_MY_ACCOUNT',
          reason: 'User requested deletion via settings page'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete account');
      }
      
      toasts.success('Your account has been deleted. Redirecting...');
      
      // Redirect to homepage after a short delay
      setTimeout(() => {
        goto('/');
      }, 2000);
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete account';
      deletionError = message;
      toasts.error(message);
    } finally {
      isDeleting = false;
    }
  }
  
  // Settings categories with icons and descriptions
  const settingsCategories = [
    {
      title: 'Account',
      icon: 'user',
      items: [
        {
          title: 'Edit Profile',
          description: 'Update your personal information and bio',
          href: '/profile/edit',
          icon: 'edit'
        },
        {
          title: 'Username & Email',
          description: 'Manage your login credentials',
          href: '/settings/account',
          icon: 'at'
        },
        {
          title: 'Subscription',
          description: 'View and manage your subscription plan',
          href: '/dashboard/upgrade',
          icon: 'star',
          badge: data.profile?.subscription_tier === 'premium' ? badge_premium() : null
        }
      ]
    },
    {
      title: 'Selling',
      icon: 'tag',
      items: [
        {
          title: 'Payout Methods',
          description: 'Add or edit your payment methods',
          href: '/settings/payouts',
          icon: 'credit-card'
        },
        {
          title: 'Shipping Settings',
          description: 'Set your default shipping preferences',
          href: '/settings/shipping',
          icon: 'truck'
        },
        {
          title: 'Vacation Mode',
          description: 'Temporarily pause your shop',
          href: '/settings/vacation',
          icon: 'pause',
          toggle: true,
          enabled: false
        }
      ]
    },
    {
      title: 'Privacy & Security',
      icon: 'shield',
      items: [
        {
          title: 'Privacy Settings',
          description: 'Control who can see your information',
          href: '/settings/privacy',
          icon: 'lock'
        },
        {
          title: 'Security',
          description: 'Password and two-factor authentication',
          href: '/settings/security',
          icon: 'key'
        },
        {
          title: 'Blocked Users',
          description: 'Manage your blocked users list',
          href: '/settings/blocked',
          icon: 'ban'
        }
      ]
    },
    {
      title: 'Notifications',
      icon: 'bell',
      items: [
        {
          title: 'Email Notifications',
          description: 'Choose which emails you want to receive',
          href: '/settings/notifications/email',
          icon: 'mail'
        },
        {
          title: 'Push Notifications',
          description: 'Manage push notification preferences',
          href: '/settings/notifications/push',
          icon: 'smartphone'
        },
        {
          title: 'SMS Alerts',
          description: 'Get text alerts for important updates',
          href: '/settings/notifications/sms',
          icon: 'message',
          badge: badge_coming_soon()
        }
      ]
    },
    {
      title: 'Preferences',
      icon: 'settings',
      items: [
        {
          title: 'Language',
          description: 'Choose your preferred language',
          href: '/settings/language',
          icon: 'globe',
          value: 'English (US)'
        },
        {
          title: 'Currency',
          description: 'Set your default currency',
          href: '/settings/currency',
          icon: 'dollar',
          value: 'USD ($)'
        },
        {
          title: 'Time Zone',
          description: 'Set your local time zone',
          href: '/settings/timezone',
          icon: 'clock',
          value: 'UTC-5 (EST)'
        }
      ]
    },
    {
      title: 'Support',
      icon: 'help',
      items: [
        {
          title: 'Help Center',
          description: 'Browse help articles and FAQs',
          href: '/help',
          icon: 'help-circle',
          external: true
        },
        {
          title: 'Contact Support',
          description: 'Get help from our support team',
          href: '/support',
          icon: 'headphones'
        },
        {
          title: 'Report a Problem',
          description: 'Let us know about any issues',
          href: '/report',
          icon: 'alert'
        }
      ]
    }
  ];

  type SettingsItem = {
    title: string;
    description: string;
    href: string;
    icon: string;
    toggle?: boolean;
    enabled?: boolean;
    badge?: string | null;
    external?: boolean;
    value?: string;
  };

  function handleToggle(item: SettingsItem) {
    if (item.title === 'Vacation Mode') {
  toasts.info(settings_vacation_mode_coming_soon());
    }
  }
</script>

<svelte:head>
  <title>Settings - Driplo</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Header -->
    <div class="mb-8">
      <nav class="flex items-center text-sm text-gray-500 mb-3">
        <a href="/dashboard" class="hover:text-gray-700 hover:underline">Dashboard</a>
        <svg class="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span class="text-gray-900">Settings</span>
      </nav>
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
      <p class="text-gray-600 text-sm sm:text-base mt-1">Manage your account settings and preferences</p>
    </div>

    <!-- Quick Actions -->
    <div class="bg-zinc-900 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 text-white">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-lg sm:text-xl font-semibold mb-1">Complete Your Profile</h2>
          <p class="text-[color-mix(in_oklch,var(--brand-primary-strong)_85%,white_15%)] text-xs sm:text-sm">Add more details to increase your credibility</p>
        </div>
        <div class="flex items-center gap-3 sm:gap-4">
          <div class="text-right">
            <p class="text-2xl sm:text-3xl font-bold">85%</p>
            <p class="text-xs text-[color-mix(in_oklch,var(--brand-primary-strong)_85%,white_15%)]">Complete</p>
          </div>
          <Button href="/profile/edit" variant="secondary" size="sm" class="text-xs sm:text-sm">
            Complete Profile
          </Button>
        </div>
      </div>
    </div>

    <!-- Settings Categories -->
    <div class="space-y-4 sm:space-y-6">
      {#each settingsCategories as category}
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
          <!-- Category Header -->
          <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
            <div class="flex items-center gap-3">
              {#if category.icon === 'user'}
                <div class="w-10 h-10 bg-[var(--surface-brand-strong)]/10 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-[var(--brand-primary-strong)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              {:else if category.icon === 'tag'}
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              {:else if category.icon === 'shield'}
                <div class="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              {:else if category.icon === 'bell'}
                <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
              {:else if category.icon === 'settings'}
                <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              {:else}
                <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              {/if}
              <h2 class="text-base sm:text-lg font-semibold text-gray-900">{category.title}</h2>
            </div>
          </div>

          <!-- Category Items -->
          <div class="divide-y divide-gray-100">
            {#each category.items as item}
              {#if 'toggle' in item && item.toggle}
                <div class="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div class="flex items-center gap-3 sm:gap-4">
                    <div class="text-gray-400 hidden sm:block">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div class="flex-1">
                      <p class="font-medium text-sm sm:text-base text-gray-900">{item.title}</p>
                      <p class="text-xs sm:text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                  <button
                    onclick={() => handleToggle(item)}
                    class="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors"
                    aria-label="Toggle {item.title}"
                  >
                    <span class="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition-transform"></span>
                  </button>
                </div>
              {:else}
                <a href={item.href} class="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                  <div class="flex items-center gap-3 sm:gap-4">
                    <div class="text-gray-400 group-hover:text-gray-600 transition-colors hidden sm:block">
                      {#if item.icon === 'edit'}
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      {:else if item.icon === 'at'}
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      {:else if item.icon === 'star'}
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      {:else}
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      {/if}
                    </div>
                    <div class="flex-1">
                      <p class="font-medium text-sm sm:text-base text-gray-900 group-hover:text-black transition-colors">{item.title}</p>
                      <p class="text-xs sm:text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-1 sm:gap-2">
                    {#if 'badge' in item && item.badge}
                      <span class="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full {item.badge === 'Premium' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'}">
                        {item.badge}
                      </span>
                    {/if}
                    {#if 'value' in item && item.value}
                      <span class="text-xs sm:text-sm text-gray-400 hidden sm:inline">{item.value}</span>
                    {/if}
                    <svg class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
              {/if}
            {/each}
          </div>
        </div>
      {/each}
    </div>

    <!-- GDPR Data Management -->
    <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6 mt-6 sm:mt-8">
      <div class="flex items-start gap-4">
        <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div class="flex-1">
          <h3 class="text-base sm:text-lg font-semibold text-blue-900 mb-1">Your Data Rights (GDPR)</h3>
          <p class="text-xs sm:text-sm text-blue-700 mb-4">Export all your personal data or request account deletion in compliance with GDPR.</p>
          <div class="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              size="sm"
              class="border-blue-300 text-blue-600 hover:bg-blue-100"
              onclick={handleDataExport}
              disabled={isExporting}
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {isExporting ? 'Exporting...' : 'Download My Data'}
            </Button>
            <a href="/privacy" class="text-sm text-blue-600 hover:underline flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 mt-6 sm:mt-8">
      <h3 class="text-base sm:text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
      <p class="text-xs sm:text-sm text-red-700 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
      
      {#if !showDeleteConfirmation}
        <Button 
          variant="outline" 
          class="border-red-300 text-red-600 hover:bg-red-100"
          onclick={() => showDeleteConfirmation = true}
        >
          Delete Account
        </Button>
      {:else}
        <div class="bg-white rounded-lg p-4 border border-red-200">
          <p class="text-sm text-red-800 font-medium mb-3">Are you absolutely sure?</p>
          <p class="text-xs text-red-600 mb-4">This will permanently delete your account, listings, messages, and all associated data. This action cannot be undone.</p>
          
          {#if deletionError}
            <div class="bg-red-100 border border-red-300 rounded p-3 mb-4">
              <p class="text-sm text-red-800">{deletionError}</p>
            </div>
          {/if}
          
          <div class="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline"
              size="sm"
              class="border-red-500 bg-red-600 text-white hover:bg-red-700"
              onclick={handleAccountDeletion}
              disabled={isDeleting}
            >
              {isDeleting ? 'Processing...' : 'Yes, Delete My Account'}
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onclick={() => { showDeleteConfirmation = false; deletionError = ''; }}
            >
              Cancel
            </Button>
          </div>
        </div>
      {/if}
    </div>

    <!-- Footer -->
    <div class="text-center py-8 text-sm text-gray-500">
      <p>Need help? Visit our <a href="/help" class="text-[var(--brand-primary-strong)] hover:underline">Help Center</a> or <a href="/support" class="text-[var(--brand-primary-strong)] hover:underline">Contact Support</a></p>
    </div>
  </div>
</div>