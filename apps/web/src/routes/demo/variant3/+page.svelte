<script lang="ts">
  const product = {
    title: 'Nike Air Jordan 1 High',
    brand: 'Nike',
    price: 450,
    images: ['https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&h=800&fit=crop'],
    description: 'Classic Nike Air Jordan 1 in excellent condition.',
    seller: { username: 'sneakerhead', rating: 4.9 },
    likes: 43,
    views: 234
  };

  let isLiked = $state(false);
</script>

<div class="variant3">
  <div class="image-section">
    <img src={product.images[0]} alt={product.title} class="product-image" />
    
    <div class="floating-actions">
      <button class="like-btn {isLiked ? 'liked' : ''}" onclick={() => isLiked = !isLiked}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
      
      <button class="share-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <polyline points="16,6 12,2 8,6"/>
          <line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
      </button>
    </div>
  </div>
  
  <div class="info-section">
    <div class="seller-header">
      <span class="seller">@{product.seller.username}</span>
      <span class="rating">⭐ {product.seller.rating}</span>
    </div>
    
    <h1 class="title">{product.title}</h1>
    <p class="brand">{product.brand}</p>
    
    <div class="price-section">
      <span class="price">£{product.price}</span>
    </div>
    
    <p class="description">{product.description}</p>
    
    <div class="stats">
      <span>{product.likes + (isLiked ? 1 : 0)} likes</span>
      <span>{product.views} views</span>
    </div>
  </div>
  
  <div class="bottom-bar">
    <button class="message-btn">Message</button>
    <button class="buy-btn">Buy • £{product.price}</button>
  </div>
</div>

<style>
  .variant3 {
    max-width: 400px;
    margin: 0 auto;
    background: #000;
    color: white;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  .image-section {
    position: relative;
    flex: 1;
  }
  
  .product-image {
    width: 100%;
    height: 60vh;
    object-fit: cover;
  }
  
  .floating-actions {
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .like-btn, .share-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(0,0,0,0.7);
    border: none;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
  }
  
  .like-btn.liked {
    color: #ff3040;
  }
  
  .info-section {
    padding: 1.5rem;
    background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.9));
    margin-top: -100px;
    position: relative;
    z-index: 1;
  }
  
  .seller-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    opacity: 0.8;
  }
  
  .title {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0;
    line-height: 1.2;
  }
  
  .brand {
    color: #ccc;
    margin: 0.25rem 0;
    font-size: 1rem;
  }
  
  .price {
    font-size: 1.5rem;
    font-weight: 800;
    margin: 1rem 0;
    display: block;
  }
  
  .description {
    line-height: 1.4;
    opacity: 0.9;
    margin: 1rem 0;
  }
  
  .stats {
    display: flex;
    gap: 1rem;
    font-size: 0.85rem;
    opacity: 0.7;
  }
  
  .bottom-bar {
    display: flex;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    background: #111;
  }
  
  .message-btn {
    flex: 1;
    padding: 0.75rem;
    background: #333;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
  }
  
  .buy-btn {
    flex: 2;
    padding: 0.75rem;
    background: white;
    color: black;
    border: none;
    border-radius: 0.5rem;
    font-weight: 700;
  }
</style>