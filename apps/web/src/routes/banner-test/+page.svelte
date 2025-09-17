<script lang="ts">
  import { SectionBanner } from '@repo/ui';
</script>

<div class="min-h-screen bg-white p-4">
  <h1 class="text-2xl font-bold mb-6">Banner Color Test</h1>

  <!-- Test Charcoal Banner -->
  <SectionBanner
    title="Promoted Listings (Charcoal)"
    subtitle="Testing charcoal color theme"
    variant="promoted"
    density="compact"
    itemCount={8}
    separator={true}
    colorTheme="charcoal"
    class="mb-6"
  />

  <!-- Test Navy Banner -->
  <SectionBanner
    title="Featured Sellers (Navy)"
    subtitle="Testing navy color theme"
    variant="sellers"
    density="compact"
    itemCount={5}
    separator={true}
    colorTheme="navy"
    class="mb-6"
  />

  <!-- Test Graphite Banner -->
  <SectionBanner
    title="Newest Listings (Graphite)"
    subtitle="Testing graphite color theme"
    variant="newest"
    density="compact"
    itemCount={12}
    separator={true}
    colorTheme="graphite"
    class="mb-6"
  />

  <!-- Test default light banner for comparison -->
  <SectionBanner
    title="Light Banner (Default)"
    subtitle="Testing default light theme"
    variant="default"
    density="compact"
    separator={true}
    colorTheme="subtle"
    class="mb-6"
  />
</div>