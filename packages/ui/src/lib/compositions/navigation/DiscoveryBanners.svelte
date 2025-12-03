<script lang="ts">
  import { TrendingUp, Clock, Tag } from 'lucide-svelte';

  interface Props {
    onNavigate: (type: 'trending' | 'newest' | 'deals') => void;
  }

  let { onNavigate }: Props = $props();

  const banners = [
    { 
      id: 'trending', 
      title: 'Trending', 
      subtitle: 'Hot right now', 
      icon: TrendingUp, 
      gradient: 'bg-linear-to-br from-orange-500 to-red-500'
    },
    { 
      id: 'newest', 
      title: 'New Arrivals', 
      subtitle: 'Fresh drops', 
      icon: Clock, 
      gradient: 'bg-linear-to-br from-blue-500 to-indigo-500'
    },
    { 
      id: 'deals', 
      title: 'Best Deals', 
      subtitle: 'Under $50', 
      icon: Tag, 
      gradient: 'bg-linear-to-br from-green-500 to-emerald-500'
    }
  ];

  const classes = {
    container: `
      grid grid-cols-1 sm:grid-cols-3 gap-(--space-3)
    `.replace(/\s+/g, ' ').trim(),
    cardWrapper: `
      w-full
    `.replace(/\s+/g, ' ').trim(),
    card: `
      relative overflow-hidden rounded-[var(--radius-md)] w-full
      aspect-[3/1] sm:aspect-[2/1] group text-left
      shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all
      isolate
    `.replace(/\s+/g, ' ').trim(),
    background: `
      absolute inset-0 opacity-90 transition-opacity group-hover:opacity-100
    `.replace(/\s+/g, ' ').trim(),
    decorative: `
      absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl 
      group-hover:scale-150 transition-transform duration-500
    `.replace(/\s+/g, ' ').trim(),
    content: `
      absolute inset-0 p-[var(--space-4)]
      flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-end
    `.replace(/\s+/g, ' ').trim(),
    iconWrapper: `
      bg-white/20 w-[var(--space-10)] h-[var(--space-10)]
      rounded-full flex items-center justify-center backdrop-blur-sm
      mb-0 sm:mb-[var(--space-3)] order-last sm:order-first
    `.replace(/\s+/g, ' ').trim(),
    textStack: `
      flex flex-col gap-[0.125rem]
    `.replace(/\s+/g, ' ').trim(),
    title: `
      text-white font-[var(--font-bold)] text-[length:var(--text-lg)]
      leading-[var(--leading-tight)]
    `.replace(/\s+/g, ' ').trim(),
    subtitle: `
      text-white/80 text-[length:var(--text-sm)] font-[var(--font-medium)]
    `.replace(/\s+/g, ' ').trim()
  } as const;
</script>

<div class={classes.container}>
  {#each banners as banner}
    <div class={classes.cardWrapper}>
      <button
        onclick={() => onNavigate(banner.id as any)}
        class={classes.card}
      >
        <!-- Background -->
        <div class={`${classes.background} ${banner.gradient}`}></div>
        
        <!-- Decorative Circle -->
        <div class={classes.decorative}></div>

        <!-- Content -->
        <div class={classes.content}>
          <div class={classes.iconWrapper}>
            <banner.icon size={20} class="text-white" />
          </div>
          
          <div class={classes.textStack}>
            <h3 class={classes.title}>{banner.title}</h3>
            <p class={classes.subtitle}>{banner.subtitle}</p>
          </div>
        </div>
      </button>
    </div>
  {/each}
</div>

<style>
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
