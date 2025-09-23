<script lang="ts">
  import type { Product } from '../../types/product';
  import SoldNotificationToast from '../notifications/SoldNotificationToast.svelte';

  interface Props {
    products: Product[];
    onProductSold?: (productId: string, buyerId: string) => void;
    onViewOrder?: (productId: string) => void;
  }

  let { 
    products,
    onProductSold,
    onViewOrder 
  }: Props = $props();

  // Simplified product interface for notifications
  interface NotificationProduct {
    id: string;
    title: string;
    image: string;
    price: number;
  }

  let soldNotifications = $state<Array<{
    id: string;
    product: NotificationProduct;
    buyer?: {
      id: string;
      username: string;
      avatar_url?: string;
    };
    timestamp: number;
  }>>([]);

  // Watch for newly sold products
  let previousProducts = $state<Product[]>([]);
  
  $effect(() => {
    if (previousProducts.length > 0) {
      const newlySold = products.filter(product => {
        const wasNotSold = !previousProducts.find(p => p.id === product.id)?.is_sold;
        return product.is_sold && wasNotSold;
      });

      newlySold.forEach(product => {
        addSoldNotification(product);
      });
    }
    
    previousProducts = [...products];
  });

  function addSoldNotification(product: Product, buyer?: { id: string; username: string; avatar_url?: string }) {
    const notification = {
      id: `${product.id}-${Date.now()}`,
      product: {
        id: product.id,
        title: product.title,
        image: product.images[0] || '/placeholder-product.svg',
        price: product.price
      },
      buyer,
      timestamp: Date.now()
    };

    soldNotifications = [...soldNotifications, notification];

    // Trigger callback
    onProductSold?.(product.id, buyer?.id || '');

    // Auto-remove after duration
    setTimeout(() => {
      removeSoldNotification(notification.id);
    }, 8000);
  }

  function removeSoldNotification(notificationId: string) {
    soldNotifications = soldNotifications.filter(n => n.id !== notificationId);
  }

  function handleViewOrder(productId: string) {
    onViewOrder?.(productId);
    
    // Remove the notification after viewing order
    const notification = soldNotifications.find(n => n.product.id === productId);
    if (notification) {
      removeSoldNotification(notification.id);
    }
  }

  // Public method to manually trigger sold notification
  export function markProductAsSold(productId: string, buyer?: { id: string; username: string; avatar_url?: string }) {
    const product = products.find(p => p.id === productId);
    if (product) {
      addSoldNotification(product, buyer);
    }
  }
</script>

<!-- Render all sold notifications -->
{#each soldNotifications as notification (notification.id)}
  <SoldNotificationToast
    show={true}
    product={notification.product}
    buyer={notification.buyer}
    onViewOrder={() => handleViewOrder(notification.product.id)}
    onDismiss={() => removeSoldNotification(notification.id)}
  />
{/each}