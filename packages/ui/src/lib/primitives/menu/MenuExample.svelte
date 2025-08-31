<script lang="ts">
  import Menu from './Menu.svelte';
  
  // Example with static items array
  const profileMenuItems = [
    {
      id: 'profile',
      label: 'View Profile',
      icon: '👤',
      onSelect: () => console.log('Profile clicked')
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      shortcut: '⌘,',
      onSelect: () => console.log('Settings clicked')
    },
    {
      id: 'separator-1',
      label: '',
      separator: true
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: '❓',
      shortcut: '⌘?',
      onSelect: () => console.log('Help clicked')
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: '🚪',
      onSelect: () => console.log('Logout clicked')
    }
  ];

  // Example with dynamic items
  const contextMenuItems = [
    {
      id: 'copy',
      label: 'Copy',
      shortcut: '⌘C',
      onSelect: () => console.log('Copy clicked')
    },
    {
      id: 'paste',
      label: 'Paste',
      shortcut: '⌘V',
      disabled: true,
      onSelect: () => console.log('Paste clicked')
    }
  ];

  let isOpen = $state(false);
</script>

<div class="p-8 space-y-6">
  <h2 class="text-xl font-semibold">Menu Component Examples</h2>
  
  <div class="space-y-4">
    <!-- Basic Menu with Items Array -->
    <div>
      <h3 class="text-lg font-medium mb-2">Static Items Menu</h3>
      <Menu items={profileMenuItems}>
        {#snippet trigger()}
          User Menu
          <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        {/snippet}
      </Menu>
    </div>

    <!-- Menu with Custom Trigger and Mixed Content -->
    <div>
      <h3 class="text-lg font-medium mb-2">Mixed Content Menu</h3>
      <Menu items={contextMenuItems}>
        {#snippet trigger()}
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
          </svg>
          Context Menu
        {/snippet}
        
        {#snippet children()}
          <!-- Note: Custom menu items would typically use the items array prop instead -->
          <!-- This snippet approach is for truly custom content -->
          <div class="px-4 py-2 text-sm text-gray-500 italic">
            Custom content can go here
          </div>
        {/snippet}
      </Menu>
    </div>

    <!-- Controlled Menu -->
    <div>
      <h3 class="text-lg font-medium mb-2">Controlled Menu</h3>
      <p class="text-sm text-gray-600 mb-2">Open state: {isOpen}</p>
      
      <Menu 
        bind:open={isOpen}
        positioning="top-start"
        onOpenChange={(open) => console.log('Menu open changed:', open)}
      >
        {#snippet trigger()}
          Controlled Menu (Top)
        {/snippet}
        
        {#snippet children()}
          <div class="px-4 py-2 text-sm text-gray-700">
            Use the items prop for actual menu items
          </div>
        {/snippet}
      </Menu>
      
      <button 
        class="ml-4 btn btn-secondary min-h-[36px] px-4"
        onclick={() => isOpen = !isOpen}
      >
        Toggle Programmatically
      </button>
    </div>

    <!-- Different Positioning -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <h4 class="font-medium mb-2">Bottom Start (Default)</h4>
        <Menu items={[
          { id: '1', label: 'Option 1', onSelect: () => {} },
          { id: '2', label: 'Option 2', onSelect: () => {} }
        ]} positioning="bottom-start">
          {#snippet trigger()}
            Bottom Start
          {/snippet}
        </Menu>
      </div>
      
      <div>
        <h4 class="font-medium mb-2">Bottom End</h4>
        <Menu items={[
          { id: '1', label: 'Option 1', onSelect: () => {} },
          { id: '2', label: 'Option 2', onSelect: () => {} }
        ]} positioning="bottom-end">
          {#snippet trigger()}
            Bottom End
          {/snippet}
        </Menu>
      </div>
    </div>
  </div>
</div>

<style>
  /* Example-specific styles */
  .space-y-6 > * + * {
    margin-top: 1.5rem;
  }
  
  .space-y-4 > * + * {
    margin-top: 1rem;
  }
  
  .grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  .gap-4 {
    gap: 1rem;
  }
</style>