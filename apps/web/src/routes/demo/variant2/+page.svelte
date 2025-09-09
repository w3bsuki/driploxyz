<script lang="ts">
  const product = {
    title: 'Nike Air Jordan 1 High',
    brand: 'Nike',
    price: 450,
    originalPrice: 550,
    condition: 'Excellent',
    size: '10.5',
    images: ['https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&h=800&fit=crop'],
    description: 'Classic Nike Air Jordan 1 in excellent condition. Perfect for collectors.',
    seller: { username: 'sneakerhead', rating: 4.9, sales: 147 }
  };
</script>

<div class="variant2">
  <img src={product.images[0]} alt={product.title} class="hero-image" />
  
  <div class="content">
    <div class="header">
      <h1>{product.title}</h1>
      <div class="prices">
        <span class="price">£{product.price}</span>
        {#if product.originalPrice}
          <span class="original">£{product.originalPrice}</span>
        {/if}
      </div>
    </div>
    
    <div class="details">
      <div class="detail">
        <span>Brand:</span> {product.brand}
      </div>
      <div class="detail">
        <span>Size:</span> {product.size}
      </div>
      <div class="detail">
        <span>Condition:</span> {product.condition}
      </div>
    </div>
    
    <p class="description">{product.description}</p>
    
    <div class="seller-card">
      <h3>Seller</h3>
      <div>@{product.seller.username} • ⭐ {product.seller.rating} • {product.seller.sales} sales</div>
    </div>
    
    <div class="actions">
      <button class="message-btn">Message</button>
      <button class="buy-btn">Buy Now - £{product.price}</button>
    </div>
  </div>
</div>

<style>
  .variant2 {
    max-width: 600px;
    margin: 0 auto;
    background: white;
  }
  
  .hero-image {
    width: 100%;
    height: 400px;
    object-fit: cover;
  }
  
  .content {
    padding: 1.5rem;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
  }
  
  .header h1 {
    font-size: 1.5rem;
    margin: 0;
    flex: 1;
  }
  
  .prices {
    display: flex;
    flex-direction: column;
    align-items: end;
  }
  
  .price {
    font-size: 1.75rem;
    font-weight: bold;
  }
  
  .original {
    text-decoration: line-through;
    color: #999;
    font-size: 1rem;
  }
  
  .details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 0.5rem;
  }
  
  .detail span {
    font-weight: 600;
    color: #666;
  }
  
  .seller-card {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 0.5rem;
    margin: 1.5rem 0;
  }
  
  .seller-card h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
  }
  
  .actions {
    display: flex;
    gap: 0.75rem;
  }
  
  .message-btn {
    flex: 1;
    padding: 0.75rem;
    background: #f1f3f4;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
  }
  
  .buy-btn {
    flex: 2;
    padding: 0.75rem;
    background: #000;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
  }
</style>