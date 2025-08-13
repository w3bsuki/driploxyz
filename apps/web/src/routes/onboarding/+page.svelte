<script lang="ts">
  import { Button, Input, Avatar } from '@repo/ui';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let step = $state(1);
  let accountType = $state<'personal' | 'brand'>('personal');
  let username = $state('');
  let avatarUrl = $state('');
  let payoutMethod = $state<'revolut' | 'paypal' | 'card'>('revolut');
  let payoutDetails = $state('');
  let socialLinks = $state<Array<{ type: string; url: string }>>([]);
  let submitting = $state(false);

  const avatars = [
    '/avatars/1.png', '/avatars/2.png', '/avatars/3.png', '/avatars/4.png',
    '/avatars/5.png', '/avatars/6.png', '/avatars/7.png', '/avatars/8.png'
  ];

  function addSocialLink() {
    socialLinks = [...socialLinks, { type: 'instagram', url: '' }];
  }

  function removeSocialLink(index: number) {
    socialLinks = socialLinks.filter((_, i) => i !== index);
  }

  async function completeOnboarding() {
    if (!data.user) return;
    
    submitting = true;
    
    const { error } = await data.supabase
      .from('profiles')
      .update({
        account_type: accountType,
        username,
        avatar_url: avatarUrl,
        payout_method: { type: payoutMethod, details: payoutDetails },
        social_links: socialLinks,
        onboarding_completed: true
      })
      .eq('id', data.user.id);

    if (!error) {
      goto('/dashboard');
    }
    submitting = false;
  }
</script>

<svelte:head>
  <title>Complete Your Profile - Driplo</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
  <div class="w-full max-w-md bg-white rounded-lg shadow-sm p-6">
    <div class="text-center mb-6">
      <h1 class="text-2xl font-bold">Welcome to Driplo</h1>
      <p class="text-gray-600 text-sm">Let's set up your profile</p>
    </div>

    <!-- Progress -->
    <div class="mb-6">
      <div class="flex justify-between mb-2">
        {#each Array(4) as _, i}
          <div class="w-2 h-2 rounded-full {step > i ? 'bg-black' : 'bg-gray-300'}"></div>
        {/each}
      </div>
    </div>

    {#if step === 1}
      <div class="space-y-4">
        <h2 class="text-lg font-semibold">Account Type</h2>
        <div class="space-y-2">
          <button
            onclick={() => accountType = 'personal'}
            class="w-full p-4 border rounded-lg text-left {accountType === 'personal' ? 'border-black bg-gray-50' : 'border-gray-200'}"
          >
            <div class="font-medium">Personal Account</div>
            <div class="text-sm text-gray-600">Free - Perfect for individuals</div>
          </button>
          <button
            onclick={() => accountType = 'brand'}
            class="w-full p-4 border rounded-lg text-left {accountType === 'brand' ? 'border-black bg-gray-50' : 'border-gray-200'}"
          >
            <div class="font-medium">Brand Account</div>
            <div class="text-sm text-gray-600">50 BGN/month - For businesses</div>
          </button>
        </div>
      </div>

    {:else if step === 2}
      <div class="space-y-4">
        <h2 class="text-lg font-semibold">Profile Setup</h2>
        <Input
          bind:value={username}
          placeholder="Choose username"
          label="Username"
        />
        <div>
          <label class="block text-sm font-medium mb-2">Avatar</label>
          <div class="grid grid-cols-4 gap-2">
            {#each avatars as avatar}
              <button
                onclick={() => avatarUrl = avatar}
                class="p-1 border rounded-lg {avatarUrl === avatar ? 'border-black' : 'border-gray-200'}"
              >
                <Avatar src={avatar} name="Avatar" size="md" />
              </button>
            {/each}
          </div>
        </div>
      </div>

    {:else if step === 3}
      <div class="space-y-4">
        <h2 class="text-lg font-semibold">Payout Method</h2>
        <div class="space-y-2">
          {#each [['revolut', 'Revolut Tag'], ['paypal', 'PayPal Email'], ['card', 'Card Details']] as [method, label]}
            <button
              onclick={() => payoutMethod = method}
              class="w-full p-3 border rounded-lg text-left {payoutMethod === method ? 'border-black bg-gray-50' : 'border-gray-200'}"
            >
              {label}
            </button>
          {/each}
        </div>
        <Input
          bind:value={payoutDetails}
          placeholder={payoutMethod === 'revolut' ? 'Your Revolut tag' : payoutMethod === 'paypal' ? 'Your PayPal email' : 'Card information'}
        />
      </div>

    {:else if step === 4}
      <div class="space-y-4">
        <h2 class="text-lg font-semibold">Social Links (Optional)</h2>
        {#each socialLinks as link, i}
          <div class="flex gap-2">
            <select bind:value={link.type} class="px-3 py-2 border rounded-lg">
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="website">Website</option>
            </select>
            <Input bind:value={link.url} placeholder="URL" class="flex-1" />
            <Button onclick={() => removeSocialLink(i)} variant="outline" size="sm">×</Button>
          </div>
        {/each}
        <Button onclick={addSocialLink} variant="outline" class="w-full">Add Link</Button>
      </div>
    {/if}

    <div class="flex justify-between mt-6">
      <Button
        onclick={() => step--}
        variant="outline"
        disabled={step === 1}
      >
        Back
      </Button>
      
      {#if step < 4}
        <Button onclick={() => step++}>Next</Button>
      {:else}
        <Button
          onclick={completeOnboarding}
          disabled={submitting || !username}
        >
          {submitting ? 'Setting up...' : 'Complete'}
        </Button>
      {/if}
    </div>
  </div>
</div>