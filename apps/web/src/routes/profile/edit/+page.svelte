<script lang="ts">
  import { Button, Input, Avatar } from '@repo/ui';
  import { goto } from '$app/navigation';
  import Header from '$lib/components/Header.svelte';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let username = $state(data.profile?.username || '');
  let fullName = $state(data.profile?.full_name || '');
  let bio = $state(data.profile?.bio || '');
  let location = $state(data.profile?.location || '');
  let avatarUrl = $state(data.profile?.avatar_url || '');
  let socialLinks = $state(data.profile?.social_links || []);
  let saving = $state(false);

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

  async function saveProfile() {
    if (!data.user) return;
    
    saving = true;
    
    const { error } = await data.supabase
      .from('profiles')
      .update({
        username,
        full_name: fullName,
        bio,
        location,
        avatar_url: avatarUrl,
        social_links: socialLinks.filter(link => link.url.trim())
      })
      .eq('id', data.user.id);

    if (!error) {
      goto(`/profile/${data.user.id}`);
    }
    saving = false;
  }
</script>

<svelte:head>
  <title>Edit Profile - Driplo</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <Header />
  
  <div class="max-w-2xl mx-auto p-4">
    <div class="bg-white rounded-lg p-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-bold">Edit Profile</h1>
        <a href="/profile/{data.user?.id}" class="text-sm text-gray-600 hover:underline">Cancel</a>
      </div>

      <div class="space-y-6">
        <!-- Avatar -->
        <div>
          <label class="block text-sm font-medium mb-2">Avatar</label>
          <div class="grid grid-cols-8 gap-2 mb-4">
            {#each avatars as avatar}
              <button
                onclick={() => avatarUrl = avatar}
                class="p-1 border rounded-lg {avatarUrl === avatar ? 'border-black' : 'border-gray-200'}"
              >
                <Avatar src={avatar} name="Avatar" size="sm" />
              </button>
            {/each}
          </div>
        </div>

        <!-- Basic Info -->
        <Input bind:value={username} label="Username" placeholder="Your username" />
        <Input bind:value={fullName} label="Full Name" placeholder="Your full name" />
        <div>
          <label class="block text-sm font-medium mb-1">Bio</label>
          <textarea
            bind:value={bio}
            rows="3"
            placeholder="Tell people about yourself..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          ></textarea>
        </div>
        <Input bind:value={location} label="Location" placeholder="Your location" />

        <!-- Social Links -->
        <div>
          <label class="block text-sm font-medium mb-2">Social Links</label>
          {#each socialLinks as link, i}
            <div class="flex gap-2 mb-2">
              <select bind:value={link.type} class="px-3 py-2 border border-gray-300 rounded-lg">
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

        <div class="flex justify-end space-x-2">
          <Button
            onclick={saveProfile}
            disabled={saving || !username}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </div>
    </div>
  </div>
</div>