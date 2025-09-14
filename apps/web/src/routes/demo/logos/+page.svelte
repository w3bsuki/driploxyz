<script lang="ts">
  import { HeaderLogo } from '@repo/ui';

  // Different logo variants for testing
  const logoVariants = [
    {
      id: 'current',
      name: 'Current (Tech Startup)',
      description: 'Clean tech startup style - "driplo." - Now larger and more prominent!',
      component: HeaderLogo,
      props: { size: 'md' }
    },
    {
      id: 'with-subtitle',
      name: 'With Subtitle',
      description: 'Tech startup style with beta/tagline',
      component: HeaderLogo,
      props: { size: 'md', subtitle: 'Beta' }
    }
  ];

  const typographyVariants = [
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Clean, minimal typography',
      classes: 'text-2xl font-light tracking-widest text-[color:var(--text-primary)]',
      text: 'driplo'
    },
    {
      id: 'modern',
      name: 'Modern Bold',
      description: 'Strong, contemporary feel',
      classes: 'text-3xl font-black tracking-tight text-[color:var(--text-primary)] uppercase',
      text: 'Driplo'
    },
    {
      id: 'elegant',
      name: 'Elegant',
      description: 'Sophisticated serif approach',
      classes: 'text-3xl font-medium tracking-wide text-[color:var(--text-primary)]',
      text: 'Driplo',
      style: 'font-family: Georgia, serif;'
    },
    {
      id: 'tech',
      name: 'Tech/Startup ✓ CHOSEN',
      description: 'Modern tech company vibe - now the default!',
      classes: 'text-2xl font-semibold tracking-tight text-[color:var(--text-primary)]',
      text: 'driplo.'
    },
    {
      id: 'fashion',
      name: 'Fashion Forward',
      description: 'High-end fashion aesthetic',
      classes: 'text-4xl font-thin tracking-[0.2em] text-[color:var(--text-primary)] uppercase',
      text: 'Driplo'
    },
    {
      id: 'playful',
      name: 'Playful',
      description: 'Fun, approachable feel',
      classes: 'text-3xl font-bold tracking-normal text-[color:var(--text-primary)]',
      text: 'Driplo',
      emoji: '💧'
    },
    {
      id: 'luxury',
      name: 'Luxury',
      description: 'Premium, expensive feel',
      classes: 'text-3xl font-light tracking-[0.15em] text-[color:var(--text-primary)]',
      text: 'DRIPLO',
      style: 'font-family: "Times New Roman", serif;'
    },
    {
      id: 'street',
      name: 'Streetwear',
      description: 'Urban, street culture vibe',
      classes: 'text-3xl font-black tracking-tighter text-[color:var(--text-primary)] uppercase',
      text: 'DRIP',
      extra: true
    }
  ];

  const brandingIdeas = [
    {
      id: 'drip-only',
      name: 'Just "Drip"',
      description: 'Shorter, punchier name',
      classes: 'text-3xl font-bold tracking-tight text-[color:var(--text-primary)]',
      text: 'Drip'
    },
    {
      id: 'the-drip',
      name: 'The Drip',
      description: 'Article adds sophistication',
      classes: 'text-2xl font-medium tracking-normal text-[color:var(--text-primary)]',
      text: 'The Drip'
    },
    {
      id: 'drip-dot',
      name: 'Drip.',
      description: 'Tech startup style',
      classes: 'text-3xl font-semibold tracking-tight text-[color:var(--text-primary)]',
      text: 'Drip.'
    },
    {
      id: 'styled',
      name: 'Stylized Driplo',
      description: 'Creative typography treatment',
      classes: 'text-3xl font-bold tracking-tight text-[color:var(--text-primary)]',
      html: '<span class="text-[color:var(--blue-500)]">Drip</span><span class="font-light">lo</span>'
    }
  ];
</script>

<div class="demo-container">
  <div class="hero-section">
    <h1 class="main-title">Logo Variants</h1>
    <p class="subtitle">Explore different typography and branding approaches for Driplo</p>
  </div>

  <!-- Current Logo Variants -->
  <section class="variants-section">
    <h2 class="section-title">Current HeaderLogo Component</h2>
    <p class="section-desc">Your existing logo component with new features</p>

    <div class="logo-grid">
      {#each logoVariants as variant}
        <div class="logo-card">
          <div class="logo-preview">
            <svelte:component this={variant.component} {...variant.props} />
          </div>
          <div class="logo-info">
            <h3>{variant.name}</h3>
            <p>{variant.description}</p>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- Typography Variants -->
  <section class="variants-section">
    <h2 class="section-title">Typography Variants</h2>
    <p class="section-desc">Different typographic approaches for "Driplo"</p>

    <div class="logo-grid">
      {#each typographyVariants as variant}
        <div class="logo-card">
          <div class="logo-preview">
            <a href="/" class="flex items-center no-underline hover:no-underline">
              {#if variant.emoji}
                <span class="text-2xl mr-2">{variant.emoji}</span>
              {/if}
              <span class={variant.classes} style={variant.style || ''}>
                {variant.text}
              </span>
            </a>
          </div>
          <div class="logo-info">
            <h3>{variant.name}</h3>
            <p>{variant.description}</p>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- Branding Ideas -->
  <section class="variants-section">
    <h2 class="section-title">Alternative Branding</h2>
    <p class="section-desc">Different name/branding approaches</p>

    <div class="logo-grid">
      {#each brandingIdeas as variant}
        <div class="logo-card">
          <div class="logo-preview">
            <a href="/" class="flex items-center no-underline hover:no-underline">
              {#if variant.html}
                {@html variant.html}
              {:else}
                <span class={variant.classes}>{variant.text}</span>
              {/if}
            </a>
          </div>
          <div class="logo-info">
            <h3>{variant.name}</h3>
            <p>{variant.description}</p>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- Size Demonstrations -->
  <section class="variants-section">
    <h2 class="section-title">Size Variants</h2>
    <p class="section-desc">How the current logo scales</p>

    <div class="size-demo">
      <div class="size-card">
        <HeaderLogo size="sm" />
        <span class="size-label">Small</span>
      </div>
      <div class="size-card">
        <HeaderLogo size="md" />
        <span class="size-label">Medium (Default)</span>
      </div>
      <div class="size-card">
        <HeaderLogo size="lg" />
        <span class="size-label">Large</span>
      </div>
    </div>
  </section>

  <div class="cta-section">
    <h2>Ready to Choose?</h2>
    <p>Let me know which variant you prefer and I'll implement it!</p>
    <a href="/demo" class="cta-button">← Back to Demo Hub</a>
  </div>
</div>

<style>
  .demo-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
  }

  .hero-section {
    text-align: center;
    margin-bottom: 4rem;
    padding: 3rem 0;
  }

  .main-title {
    font-size: 3.5rem;
    font-weight: 900;
    color: white;
    margin-bottom: 1rem;
    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  .subtitle {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 300;
    max-width: 600px;
    margin: 0 auto;
  }

  .variants-section {
    margin-bottom: 4rem;
  }

  .section-title {
    font-size: 2rem;
    font-weight: 700;
    color: white;
    margin-bottom: 0.5rem;
    text-align: center;
  }

  .section-desc {
    color: rgba(255, 255, 255, 0.8);
    text-align: center;
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }

  .logo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
  }

  .logo-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 1rem;
    overflow: hidden;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  .logo-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    background: rgba(255, 255, 255, 1);
  }

  .logo-preview {
    padding: 3rem 2rem;
    text-align: center;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 120px;
  }

  .logo-info {
    padding: 1.5rem 2rem;
    background: rgba(255, 255, 255, 0.9);
  }

  .logo-info h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 0.5rem 0;
  }

  .logo-info p {
    color: #666;
    margin: 0;
    font-size: 0.9rem;
  }

  .size-demo {
    display: flex;
    justify-content: center;
    gap: 3rem;
    flex-wrap: wrap;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 1rem;
    padding: 3rem 2rem;
    backdrop-filter: blur(20px);
  }

  .size-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .size-label {
    font-size: 0.875rem;
    color: #666;
    font-weight: 500;
  }

  .cta-section {
    text-align: center;
    margin-top: 4rem;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 1.5rem;
    padding: 3rem;
    backdrop-filter: blur(20px);
  }

  .cta-section h2 {
    font-size: 2rem;
    color: #333;
    margin-bottom: 1rem;
  }

  .cta-section p {
    color: #666;
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }

  .cta-button {
    display: inline-block;
    padding: 1rem 2rem;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    color: white;
    text-decoration: none;
    border-radius: 2rem;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  }

  @media (max-width: 768px) {
    .demo-container {
      padding: 1rem;
    }

    .main-title {
      font-size: 2.5rem;
    }

    .logo-grid {
      grid-template-columns: 1fr;
    }

    .size-demo {
      flex-direction: column;
      gap: 2rem;
    }
  }
</style>