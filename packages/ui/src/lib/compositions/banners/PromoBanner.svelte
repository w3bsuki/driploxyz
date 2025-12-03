<script lang="ts">
  interface Props {
    title: string;
    subtitle: string;
    discount?: string;
    imageUrl: string;
    ctaText?: string;
    onCtaClick?: () => void;
  }
  
  let { 
    title,
    subtitle,
    discount = '',
    imageUrl,
    ctaText = 'Shop Now',
    onCtaClick
  }: Props = $props();
</script>

<div class="promo-banner">
  <div class="promo-banner__content">
    <div class="promo-banner__text">
      {#if discount}
        <span class="promo-banner__badge">{discount}</span>
      {/if}
      <h2 class="promo-banner__title">{title}</h2>
      <p class="promo-banner__subtitle">{subtitle}</p>
      <button class="promo-banner__cta" onclick={onCtaClick}>
        {ctaText}
      </button>
    </div>
    <div class="promo-banner__image">
      <img src={imageUrl} alt={title} />
    </div>
  </div>
  
  <!-- Carousel Dots (Visual only for now as per plan) -->
  <div class="promo-banner__dots">
    <span class="promo-banner__dot promo-banner__dot--active"></span>
    <span class="promo-banner__dot"></span>
    <span class="promo-banner__dot"></span>
  </div>
</div>

<style>
  .promo-banner {
    background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
    border-radius: var(--radius-2xl, 12px);
    padding: 24px;
    margin: 16px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 10px 20px -5px rgba(102, 126, 234, 0.4);
  }
  
  .promo-banner__content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  
  .promo-banner__text {
    flex: 1;
    color: white;
    z-index: 1;
  }
  
  .promo-banner__badge {
    display: inline-block;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    padding: 4px 12px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 700;
    margin-bottom: 12px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  
  .promo-banner__title {
    font-size: 28px;
    font-weight: 800;
    margin: 0 0 8px 0;
    line-height: 1.1;
    letter-spacing: -0.5px;
  }
  
  .promo-banner__subtitle {
    font-size: 15px;
    opacity: 0.9;
    margin: 0 0 20px 0;
    line-height: 1.4;
    font-weight: 500;
  }
  
  .promo-banner__cta {
    background: white;
    color: #667EEA;
    border: none;
    padding: 12px 24px;
    border-radius: 9999px;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .promo-banner__cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }
  
  .promo-banner__cta:active {
    transform: translateY(0);
  }
  
  .promo-banner__image {
    width: 120px;
    height: 120px;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }
  
  .promo-banner__image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
    transform: rotate(3deg);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.2);
  }
  
  .promo-banner__dots {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-top: 20px;
  }
  
  .promo-banner__dot {
    width: 6px;
    height: 6px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
    transition: all 0.3s ease;
  }
  
  .promo-banner__dot--active {
    width: 24px;
    background: white;
  }

  /* Decorative background circles */
  .promo-banner::before {
    content: '';
    position: absolute;
    top: -50px;
    right: -50px;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
    border-radius: 50%;
  }

  .promo-banner::after {
    content: '';
    position: absolute;
    bottom: -30px;
    left: -30px;
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
    border-radius: 50%;
  }
</style>
