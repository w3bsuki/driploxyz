<script lang="ts">
  import { Button, Input, Avatar, AvatarUploader } from '@repo/ui';
  import { goto } from '$app/navigation';
  import { createBrowserSupabaseClient } from '$lib/supabase/client';
  import { uploadAvatar } from '$lib/supabase/storage';
  import type { PageData } from './$types';
  import * as i18n from '@repo/i18n';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const supabase = createBrowserSupabaseClient();

  let username = $state(data.profile?.username || '');
  let fullName = $state(data.profile?.full_name || '');
  let bio = $state(data.profile?.bio || '');
  let location = $state(data.profile?.location || '');
  let avatarUrl = $state(data.profile?.avatar_url || '');
  let socialLinks = $state(data.profile?.social_links || []);
  let saving = $state(false);

  const avatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=1&backgroundColor=f3f4f6',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=2&backgroundColor=ddd6fe',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=3&backgroundColor=fef3c7',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=4&backgroundColor=fce7f3',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=5&backgroundColor=dcfce7',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=6&backgroundColor=cffafe',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=7&backgroundColor=fef2f2',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=8&backgroundColor=f0f9ff',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=9&backgroundColor=fafaf9',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=10&backgroundColor=f5f3ff',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=11&backgroundColor=fff7ed',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=12&backgroundColor=ecfdf5'
  ];

  function addSocialLink() {
    socialLinks = [...socialLinks, { type: 'instagram', url: '' }];
  }

  function removeSocialLink(index: number) {
    socialLinks = socialLinks.filter((_, i) => i !== index);
  }

  async function handleAvatarUpload(file: File): Promise<string> {
    if (!data.user?.id) {
      throw new Error('User not authenticated');
    }
    return await uploadAvatar(supabase, file, data.user.id);
  }

  async function saveProfile() {
    if (!data.user) return;
    
    saving = true;
    
    const { error } = await supabase
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
      goto(`/profile/${data.profile?.username || data.user.id}`);
    }
    saving = false;
  }
</script>

<svelte:head>
  <title>{i18n.profile_editProfile()} - Driplo</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  
  <div class="max-w-2xl mx-auto p-4">
    <div class="bg-white rounded-lg p-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-bold">{i18n.profile_editProfile()}</h1>
        <a href="/profile/{data.profile?.username || data.user?.id}" class="text-sm text-gray-600 hover:underline">{i18n.profile_cancel()}</a>
      </div>

      <div class="space-y-6">
        <!-- Avatar -->
        <div>
          <div class="block text-sm font-medium mb-2" role="group" aria-labelledby="avatar-label">
            <span id="avatar-label">{i18n.profile_avatar()}</span>
          </div>
          
          <!-- Selected Avatar Preview -->
          {#if avatarUrl}
            <div class="flex justify-center mb-4">
              <div class="relative">
                <Avatar src={avatarUrl} name={i18n.profile_yourAvatar()} size="lg" class="ring-2 ring-black/20" />
                <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-black rounded-full border-2 border-white flex items-center justify-center">
                  <svg class="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
            </div>
          {/if}
          
          <!-- Avatar Horizontal Scroll -->
          <div class="relative mb-4">
            <div class="flex space-x-3 overflow-x-auto scrollbar-hide pb-2">
              {#each avatars as avatar}
                <button
                  type="button"
                  onclick={() => avatarUrl = avatar}
                  class="relative group shrink-0"
                  aria-label="Select avatar option {avatars.indexOf(avatar) + 1}"
                >
                  <div class="relative w-16 h-16 overflow-hidden rounded-xl border-2 transition-colors duration-200 {avatarUrl === avatar ? 'border-black ring-2 ring-black/20' : 'border-gray-200 hover:border-gray-300'}">
                    <img src={avatar} alt="Avatar option" class="w-full h-full object-cover" />
                    
                    <!-- Selection indicator -->
                    {#if avatarUrl === avatar}
                      <div class="absolute top-1 right-1 w-3 h-3 bg-black rounded-full flex items-center justify-center">
                        <svg class="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                    {/if}
                  </div>
                </button>
              {/each}
            </div>
            
            <!-- Scroll hint -->
            <div class="absolute right-0 top-0 bottom-0 w-8 bg-linear-to-l from-white via-white/80 to-transparent pointer-events-none"></div>
          </div>
          
          <!-- Custom Avatar Upload -->
          <div class="mt-6 pt-4 border-t border-gray-100">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-medium text-gray-900">{i18n.profile_customAvatar()}</h4>
              <span class="text-xs text-gray-500">{i18n.profile_uploadYourOwn()}</span>
            </div>
            
            <AvatarUploader 
              uploadFunction={handleAvatarUpload}
              onUpload={(url) => avatarUrl = url}
              onError={(error) => console.error('Avatar upload error:', error)}
              uploadingText={i18n.profile_uploadingAvatar()}
              uploadText={i18n.profile_uploadAvatar()}
              changePhotoText={i18n.profile_changePhoto()}
              dropHereText={i18n.profile_dropHere()}
              selectFileText={i18n.profile_selectPhoto()}
            />
          </div>
        </div>

        <!-- Basic Info -->
        <Input bind:value={username} label={i18n.profile_username()} placeholder={i18n.profile_yourUsername()} />
        <Input bind:value={fullName} label={i18n.profile_fullName()} placeholder={i18n.profile_yourFullName()} />
        <div>
          <label for="bio-textarea" class="block text-sm font-medium mb-1">{i18n.profile_bio()}</label>
          <textarea
            id="bio-textarea"
            bind:value={bio}
            rows="3"
            placeholder={i18n.profile_tellPeopleAboutYourself()}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          ></textarea>
        </div>
        <Input bind:value={location} label={i18n.profile_location()} placeholder={i18n.profile_yourLocation()} />

        <!-- Social Links -->
        <div>
          <div class="block text-sm font-medium mb-2" id="social-links-label">{i18n.profile_socialLinks()}</div>
          {#each socialLinks as link, i}
            <div class="flex gap-2 mb-2">
              <select bind:value={link.type} class="px-3 py-2 border border-gray-300 rounded-lg" aria-label="Social media type for link {i + 1}">
                <option value="instagram">{i18n.profile_instagram()}</option>
                <option value="tiktok">{i18n.profile_tiktok()}</option>
                <option value="website">{i18n.profile_website()}</option>
              </select>
              <Input bind:value={link.url} placeholder={i18n.profile_url()} class="flex-1" />
              <Button onclick={() => removeSocialLink(i)} variant="outline" size="sm" aria-label="Remove social link {i + 1}">×</Button>
            </div>
          {/each}
          <Button onclick={addSocialLink} variant="outline" class="w-full">{i18n.profile_addLink()}</Button>
        </div>

        <div class="flex justify-end space-x-2">
          <Button
            onclick={saveProfile}
            disabled={saving || !username}
          >
            {saving ? i18n.profile_saving() : i18n.profile_saveProfile()}
          </Button>
        </div>
      </div>
    </div>
  </div>
</div>

