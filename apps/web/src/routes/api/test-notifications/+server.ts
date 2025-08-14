import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const { type, data } = await request.json();

  // This is a development endpoint for testing notifications
  // In production, notifications would be triggered by real events
  
  if (type === 'message') {
    // Simulate a message notification
    return json({
      success: true,
      notification: {
        type: 'message',
        senderId: data.senderId,
        senderName: data.senderName,
        senderAvatar: data.senderAvatar,
        message: data.message,
        productId: data.productId,
        productTitle: data.productTitle,
        productImage: data.productImage,
        productPrice: data.productPrice,
        isProductMessage: !!data.productId
      }
    });
  }

  if (type === 'follow') {
    // Simulate a follow notification
    return json({
      success: true,
      notification: {
        type: 'follow',
        followerId: data.followerId,
        followerName: data.followerName,
        followerUsername: data.followerUsername,
        followerAvatar: data.followerAvatar
      }
    });
  }

  return json({ success: false, error: 'Unknown notification type' });
};