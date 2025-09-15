<script lang="ts">
  import {
    sampleDepopProduct,
    sampleVintedProduct,
    sampleInstagramProduct,
    sampleComments
  } from './index.js';

  type DemoStyle = 'depop' | 'vinted' | 'instagram';

  let activeDemo = $state<DemoStyle>('depop');
  let showMobileFrame = $state(true);

  function setActiveDemo(demo: DemoStyle) {
    activeDemo = demo;
  }
</script>

<div class="demo-showcase">
  <!-- Demo Controls -->
  <div class="demo-controls">
    <div class="demo-header">
      <h1>Premium Product Page Demos</h1>
      <p>Three world-class mobile-first product page designs</p>
    </div>

    <div class="demo-selector">
      <button 
        class="demo-btn {activeDemo === 'depop' ? 'active' : ''}"
        onclick={() => setActiveDemo('depop')}
      >
        <div class="demo-icon depop-icon">📱</div>
        <div class="demo-info">
          <div class="demo-title">Depop Style</div>
          <div class="demo-subtitle">Dark, bold, social-first</div>
        </div>
      </button>

      <button 
        class="demo-btn {activeDemo === 'vinted' ? 'active' : ''}"
        onclick={() => setActiveDemo('vinted')}
      >
        <div class="demo-icon vinted-icon">🛍️</div>
        <div class="demo-info">
          <div class="demo-title">Vinted Style</div>
          <div class="demo-subtitle">Clean, detailed, marketplace</div>
        </div>
      </button>

      <button 
        class="demo-btn {activeDemo === 'instagram' ? 'active' : ''}"
        onclick={() => setActiveDemo('instagram')}
      >
        <div class="demo-icon instagram-icon">📸</div>
        <div class="demo-info">
          <div class="demo-title">Instagram Style</div>
          <div class="demo-subtitle">Story-driven, immersive</div>
        </div>
      </button>
    </div>

    <div class="view-controls">
      <label class="frame-toggle">
        <input 
          type="checkbox" 
          bind:checked={showMobileFrame}
        >
        <span>Show mobile frame</span>
      </label>
    </div>
  </div>

  <!-- Demo Display -->
  <div class="demo-display">
    <div class="demo-container {showMobileFrame ? 'mobile-frame' : 'full-width'}">
      <div class="demo-placeholder">
        <div class="placeholder-content">
          <div class="placeholder-icon">🚧</div>
          <h3>{activeDemo.charAt(0).toUpperCase() + activeDemo.slice(1)} Style Demo</h3>
          <p>Demo component coming soon!</p>
          <div class="demo-preview">
            {#if activeDemo === 'depop'}
              <div class="preview-dark">
                <div class="mock-header">@{sampleDepopProduct.seller.username}</div>
                <div class="mock-image"></div>
                <div class="mock-details">
                  <div class="mock-title">{sampleDepopProduct.title}</div>
                  <div class="mock-price">£{sampleDepopProduct.price}</div>
                </div>
              </div>
            {:else if activeDemo === 'vinted'}
              <div class="preview-light">
                <div class="mock-header">Vinted Style</div>
                <div class="mock-image"></div>
                <div class="mock-details">
                  <div class="mock-title">{sampleVintedProduct.title}</div>
                  <div class="mock-price">€{sampleVintedProduct.price}</div>
                </div>
              </div>
            {:else if activeDemo === 'instagram'}
              <div class="preview-social">
                <div class="mock-header">@{sampleInstagramProduct.seller.username}</div>
                <div class="mock-image"></div>
                <div class="mock-details">
                  <div class="mock-title">{sampleInstagramProduct.title}</div>
                  <div class="mock-price">{sampleInstagramProduct.currency}{sampleInstagramProduct.price}</div>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Demo Features -->
  <div class="demo-features">
    <div class="features-grid">
      {#if activeDemo === 'depop'}
        <div class="feature-card">
          <h3>🎨 Dark Theme Design</h3>
          <p>Bold black background with vibrant accents, perfect for gen-z marketplace</p>
        </div>
        <div class="feature-card">
          <h3>📱 Story-Style Navigation</h3>
          <p>Instagram-inspired image progress bars with auto-advance and tap navigation</p>
        </div>
        <div class="feature-card">
          <h3>💝 Social Features</h3>
          <p>Like counts, follow buttons, and social proof elements throughout</p>
        </div>
        <div class="feature-card">
          <h3>🏷️ Tag System</h3>
          <p>Hashtag-style product tags for discoverability and style</p>
        </div>
      {:else if activeDemo === 'vinted'}
        <div class="feature-card">
          <h3>🛡️ Trust & Safety</h3>
          <p>Buyer protection badges, seller verification, and detailed stats</p>
        </div>
        <div class="feature-card">
          <h3>📏 Detailed Info</h3>
          <p>Comprehensive product details, measurements, and shipping information</p>
        </div>
        <div class="feature-card">
          <h3>👤 Rich Seller Profiles</h3>
          <p>Complete seller stats, response times, and member history</p>
        </div>
        <div class="feature-card">
          <h3>📑 Tabbed Content</h3>
          <p>Organized information with tabs for description, measurements, and shipping</p>
        </div>
      {:else if activeDemo === 'instagram'}
        <div class="feature-card">
          <h3>📺 Immersive Experience</h3>
          <p>Full-screen media with story-like interactions and auto-advancing content</p>
        </div>
        <div class="feature-card">
          <h3>💬 Social Commerce</h3>
          <p>Comments, likes, shares, and direct messaging integration</p>
        </div>
        <div class="feature-card">
          <h3>👥 Profile Integration</h3>
          <p>Rich user profiles with follower counts, posts, and social proof</p>
        </div>
        <div class="feature-card">
          <h3>🎯 Engagement Focus</h3>
          <p>Built for discovery, engagement, and viral sharing</p>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .demo-showcase {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    flex-direction: column;
  }

  /* Demo Controls */
  .demo-controls {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    padding: 32px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .demo-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .demo-header h1 {
    font-size: 32px;
    font-weight: 800;
    margin: 0 0 8px 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .demo-header p {
    font-size: 16px;
    color: #666;
    margin: 0;
  }

  .demo-selector {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .demo-btn {
    background: #fff;
    border: 2px solid #e5e7eb;
    border-radius: 16px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 16px;
    text-align: left;
  }

  .demo-btn:hover {
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
  }

  .demo-btn.active {
    border-color: #667eea;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }

  .demo-icon {
    font-size: 32px;
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f3f4f6;
    flex-shrink: 0;
  }

  .demo-btn.active .demo-icon {
    background: rgba(255, 255, 255, 0.2);
  }

  .demo-info {
    flex: 1;
  }

  .demo-title {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .demo-subtitle {
    font-size: 14px;
    opacity: 0.7;
  }

  .view-controls {
    display: flex;
    justify-content: center;
  }

  .frame-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  }

  .frame-toggle input {
    width: 16px;
    height: 16px;
  }

  /* Demo Display */
  .demo-display {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 32px;
    min-height: 600px;
  }

  .demo-container {
    transition: all 0.3s ease;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .demo-container.mobile-frame {
    width: 375px;
    height: 812px;
    border: 8px solid #1f2937;
    border-radius: 36px;
    position: relative;
  }

  .demo-container.mobile-frame::before {
    content: '';
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 134px;
    height: 4px;
    background: #1f2937;
    border-radius: 0 0 4px 4px;
    z-index: 10;
  }

  .demo-container.full-width {
    width: 100%;
    max-width: 600px;
    height: 800px;
  }

  /* Demo Features */
  .demo-features {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    padding: 32px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .feature-card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px;
    transition: all 0.3s ease;
  }

  .feature-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: #667eea;
  }

  .feature-card h3 {
    font-size: 16px;
    font-weight: 700;
    margin: 0 0 8px 0;
    color: #1f2937;
  }

  .feature-card p {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
    line-height: 1.5;
  }

  /* Demo Placeholder Styles */
  .demo-placeholder {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f9fafb;
    padding: 40px 20px;
  }

  .placeholder-content {
    text-align: center;
    max-width: 300px;
  }

  .placeholder-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .placeholder-content h3 {
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 8px 0;
    color: #1f2937;
  }

  .placeholder-content p {
    font-size: 14px;
    color: #6b7280;
    margin: 0 0 24px 0;
  }

  .demo-preview {
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
    background: #fff;
  }

  .preview-dark {
    background: #000;
    color: #fff;
    padding: 16px;
  }

  .preview-light {
    background: #fff;
    color: #000;
    padding: 16px;
    border: 1px solid #e5e7eb;
  }

  .preview-social {
    background: linear-gradient(45deg, #405de6, #5851db, #833ab4, #c13584, #e1306c, #fd1d1d);
    color: #fff;
    padding: 16px;
  }

  .mock-header {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 12px;
    opacity: 0.9;
  }

  .mock-image {
    width: 100%;
    height: 120px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    margin-bottom: 12px;
  }

  .preview-light .mock-image {
    background: #f3f4f6;
  }

  .mock-details {
    text-align: left;
  }

  .mock-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
    opacity: 0.9;
  }

  .mock-price {
    font-size: 16px;
    font-weight: 700;
  }

  /* Mobile Responsiveness */
  @media (max-width: 768px) {
    .demo-controls {
      padding: 20px;
    }

    .demo-header h1 {
      font-size: 24px;
    }

    .demo-selector {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .demo-btn {
      padding: 16px;
    }

    .demo-icon {
      width: 48px;
      height: 48px;
      font-size: 24px;
    }

    .demo-display {
      padding: 16px;
    }

    .demo-container.mobile-frame {
      width: 320px;
      height: 568px;
      border-width: 6px;
      border-radius: 28px;
    }

    .demo-container.full-width {
      height: 600px;
    }

    .demo-features {
      padding: 20px;
    }

    .features-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }

  /* Very small screens */
  @media (max-width: 480px) {
    .demo-container.mobile-frame {
      width: 280px;
      height: 500px;
    }
  }
</style>