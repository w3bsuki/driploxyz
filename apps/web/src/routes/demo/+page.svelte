<script lang="ts">
  // import { ProductPage } from '@repo/ui';
  
  const mockProduct = {
    id: '1',
    title: 'Nike Air Jordan 1 High',
    brand: 'Nike',
    price: 450,
    originalPrice: 550,
    condition: 'Excellent',
    size: '10.5',
    seller: {
      username: 'sneakerhead',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      verified: true,
      rating: 4.9,
      sales: 147
    },
    images: [
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=600&h=800&fit=crop'
    ],
    description: 'Classic Nike Air Jordan 1 in excellent condition.',
    tags: ['nike', 'jordan', 'sneakers'],
    likes: 43,
    views: 234
  };
</script>

<div class="demo-container">
  <div class="hero-section">
    <h1 class="main-title">Product Page Showcase</h1>
    <p class="subtitle">World-class marketplace designs built with Svelte 5 + Tailwind v4</p>
  </div>
  
  <!-- Premium Demos Section -->
  <section class="premium-section">
    <h2 class="section-title">🔥 Premium Designs</h2>
    <p class="section-desc">Custom-built pages that surpass top marketplaces like Grailed, Vinted, and Depop</p>
    
    <div class="premium-grid">
      <a href="/demo/premium" class="premium-card gradient-1">
        <div class="card-header">
          <h3>Premium</h3>
          <span class="badge">New</span>
        </div>
        <p>World-class design with advanced features, touch gestures, and premium animations</p>
        <div class="features">
          <span>• Image zoom & swipe</span>
          <span>• Live stats & activity</span>
          <span>• Enhanced seller info</span>
        </div>
      </a>
      
      <a href="/demo/ultra-premium" class="premium-card gradient-2">
        <div class="card-header">
          <h3>Ultra Premium</h3>
          <span class="badge gold">Ultra</span>
        </div>
        <p>Next-generation features including AR try-on, price history, and real-time notifications</p>
        <div class="features">
          <span>• AR Try-On simulation</span>
          <span>• Price history & analytics</span>
          <span>• Real-time notifications</span>
        </div>
      </a>
    </div>
  </section>

  <!-- Logo Variants Section -->
  <section class="variants-section">
    <h2 class="section-title">🎨 Logo & Branding</h2>
    <p class="section-desc">Explore different typography and branding approaches</p>

    <div class="demo-links">
      <a href="/demo/logos" class="demo-link classic featured">Logo Variants & Typography</a>
    </div>
  </section>

  <!-- Original Variants Section -->
  <section class="variants-section">
    <h2 class="section-title">Component Library Variants</h2>
    <p class="section-desc">Using existing @repo/ui components</p>

    <div class="demo-links">
      <a href="/demo/variant1" class="demo-link classic">Variant 1 - Clean</a>
      <a href="/demo/variant2" class="demo-link classic">Variant 2 - Detailed</a>
      <a href="/demo/variant3" class="demo-link classic">Variant 3 - Modern</a>
    </div>
  </section>

  <div class="preview">
    <h2>Default Component Preview</h2>
    <div class="component-wrapper">
      <!-- <ProductPage product={mockProduct} /> -->
    </div>
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
  
  .premium-section, .variants-section {
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
  
  .premium-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
  }
  
  .premium-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 1.5rem;
    padding: 2rem;
    text-decoration: none;
    color: #333;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    position: relative;
    overflow: hidden;
  }
  
  .premium-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--gradient);
  }
  
  .premium-card.gradient-1 {
    --gradient: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  }
  
  .premium-card.gradient-2 {
    --gradient: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
  }
  
  .premium-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    background: rgba(255, 255, 255, 1);
  }
  
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }
  
  .card-header h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #333;
    margin: 0;
  }
  
  .badge {
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
  }
  
  .badge.gold {
    background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
  }
  
  .premium-card p {
    color: #666;
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }
  
  .features {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .features span {
    color: #555;
    font-size: 0.9rem;
    font-weight: 500;
  }
  
  .demo-links {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
    margin: 2rem 0;
  }
  
  .demo-link.classic {
    padding: 0.75rem 1.5rem;
    background: rgba(255, 255, 255, 0.9);
    color: #333;
    text-decoration: none;
    border-radius: 2rem;
    font-weight: 600;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
  }
  
  .demo-link.classic:hover {
    background: rgba(255, 255, 255, 1);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }

  .demo-link.classic.featured {
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: 1px solid transparent;
  }

  .demo-link.classic.featured:hover {
    background: linear-gradient(90deg, #5a6fd8 0%, #6a4190 100%);
    color: white;
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  }
  
  .preview {
    margin-top: 4rem;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 1.5rem;
    padding: 2rem;
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .preview h2 {
    text-align: center;
    margin-bottom: 2rem;
    color: #333;
    font-weight: 700;
  }
  
  .component-wrapper {
    background: white;
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    .demo-container {
      padding: 1rem;
    }
    
    .main-title {
      font-size: 2.5rem;
    }
    
    .premium-grid {
      grid-template-columns: 1fr;
    }
    
    .demo-links {
      flex-direction: column;
      align-items: center;
    }
  }
</style>