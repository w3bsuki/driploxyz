<script lang="ts">
  const product = {
    title: 'Nike Air Jordan 1 High',
    brand: 'Nike',
    price: 450,
    images: [
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=600&h=800&fit=crop'
    ],
    description: 'Classic Nike Air Jordan 1 in excellent condition.',
    seller: { username: 'sneakerhead', rating: 4.9 }
  };

  let currentImage = $state(0);
</script>

<div class="variant1">
  <div class="image-gallery">
    <img src={product.images[currentImage]} alt={product.title} class="main-image" />
    <div class="thumbnails">
      {#each product.images as image, i}
        <button onclick={() => currentImage = i} class="thumb {i === currentImage ? 'active' : ''}">
          <img src={image} alt="" />
        </button>
      {/each}
    </div>
  </div>
  
  <div class="product-info">
    <h1>{product.title}</h1>
    <p class="brand">{product.brand}</p>
    <p class="price">£{product.price}</p>
    <p class="description">{product.description}</p>
    
    <div class="seller">
      <span>Sold by @{product.seller.username}</span>
      <span>⭐ {product.seller.rating}</span>
    </div>
    
    <button class="buy-btn">Buy Now</button>
  </div>
</div>

<style>
  .variant1 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .main-image {
    width: 100%;
    aspect-ratio: 4/5;
    object-fit: cover;
    border-radius: 0.5rem;
  }
  
  .thumbnails {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }
  
  .thumb {
    border: none;
    padding: 0;
    width: 60px;
    height: 60px;
    border-radius: 0.25rem;
    overflow: hidden;
    opacity: 0.6;
  }
  
  .thumb.active { opacity: 1; }
  .thumb img { width: 100%; height: 100%; object-fit: cover; }
  
  .product-info h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  
  .brand {
    color: #666;
    font-weight: 600;
  }
  
  .price {
    font-size: 1.5rem;
    font-weight: bold;
    margin: 1rem 0;
  }
  
  .seller {
    display: flex;
    justify-content: space-between;
    margin: 1rem 0;
    font-size: 0.9rem;
    color: #666;
  }
  
  .buy-btn {
    width: 100%;
    padding: 1rem;
    background: #000;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    margin-top: 1rem;
  }
</style>