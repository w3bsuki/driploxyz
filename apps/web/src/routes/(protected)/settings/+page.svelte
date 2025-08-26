<script lang="ts">
  import { goto } from '$app/navigation';
  import { Button, toasts } from '@repo/ui';
  import type { PageData } from './$types';
  import * as i18n from '@repo/i18n';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  
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
          badge: data.profile?.subscription_tier === 'premium' ? 'Premium' : null
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
          badge: 'Coming Soon'
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

  function handleToggle(item: any) {
    if (item.title === 'Vacation Mode') {
      toasts.info('Vacation mode feature coming soon!');
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
    <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 text-white">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-lg sm:text-xl font-semibold mb-1">Complete Your Profile</h2>
          <p class="text-blue-100 text-xs sm:text-sm">Add more details to increase your credibility</p>
        </div>
        <div class="flex items-center gap-3 sm:gap-4">
          <div class="text-right">
            <p class="text-2xl sm:text-3xl font-bold">85%</p>
            <p class="text-xs text-blue-100">Complete</p>
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
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              {#if item.toggle}
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
                  >
                    <span class="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
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
                    {#if item.badge}
                      <span class="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full {item.badge === 'Premium' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'}">
                        {item.badge}
                      </span>
                    {/if}
                    {#if item.value}
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

    <!-- Danger Zone -->
    <div class="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 mt-6 sm:mt-8">
      <h3 class="text-base sm:text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
      <p class="text-xs sm:text-sm text-red-700 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
      <Button variant="outline" class="border-red-300 text-red-600 hover:bg-red-100">
        Delete Account
      </Button>
    </div>

    <!-- Footer -->
    <div class="text-center py-8 text-sm text-gray-500">
      <p>Need help? Visit our <a href="/help" class="text-blue-600 hover:underline">Help Center</a> or <a href="/support" class="text-blue-600 hover:underline">Contact Support</a></p>
    </div>
  </div>
</div>