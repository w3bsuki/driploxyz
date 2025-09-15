// Premium E-commerce Product Page Demos
// These are showcase implementations of modern mobile-first product pages
// inspired by the best in class marketplace apps

export { default as DemoShowcase } from './DemoShowcase.svelte';

// TODO: Create these demo components
// export { default as DepopStyleProductPage } from './DepopStyleProductPage.svelte';
// export { default as VintedStyleProductPage } from './VintedStyleProductPage.svelte';
// export { default as InstagramStyleProductPage } from './InstagramStyleProductPage.svelte';

// Sample data for testing the demos
export const sampleDepopProduct = {
  id: '1',
  title: 'Vintage Nike Air Jordan 1 High OG Chicago',
  brand: 'Nike',
  price: 450,
  originalPrice: 550,
  condition: 'Excellent',
  size: '10.5',
  seller: {
    username: 'vintagesneaks',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    verified: true,
    rating: 4.9,
    sales: 147
  },
  images: [
    'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=800&fit=crop'
  ],
  description: 'Rare vintage Nike Air Jordan 1 High OG in the iconic Chicago colorway. Excellent condition with minimal wear. Original box included. Perfect for collectors or anyone looking to add a classic to their rotation.',
  tags: ['nike', 'jordan', 'vintage', 'chicago', 'og', 'basketball', 'sneakers'],
  likes: 43,
  views: 234,
  posted: '2 hours ago'
};

export const sampleVintedProduct = {
  id: '2',
  title: 'Vintage Levi\'s 501 Original Fit Jeans',
  brand: 'Levi\'s',
  price: 45.00,
  originalPrice: 89.00,
  condition: 'very_good' as const,
  size: '32/32',
  color: 'Classic Blue',
  material: '100% Cotton',
  category: 'Jeans',
  seller: {
    username: 'denim_hunter',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616c93d4c81?w=100&h=100&fit=crop&crop=face',
    verified: true,
    rating: 4.8,
    responseRate: 95,
    responseTime: '< 1h',
    memberSince: '2019',
    totalItems: 89,
    followers: 234
  },
  images: [
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=800&fit=crop'
  ],
  description: 'Classic Levi\'s 501 Original Fit jeans in excellent condition. These vintage beauties have that perfect worn-in feel without any damage. Perfect for casual everyday wear or dressing up.',
  measurements: {
    chest: '40cm',
    length: '108cm',
    sleeve: 'N/A'
  },
  likes: 67,
  views: 456,
  posted: '1 day ago',
  shipping: {
    cost: 4.50,
    time: '2-4 business days',
    protection: true
  }
};

export const sampleInstagramProduct = {
  id: '3',
  title: 'Handcrafted Leather Crossbody Bag',
  brand: 'Independent Maker',
  price: 125,
  originalPrice: 160,
  currency: '£',
  condition: 'Brand New',
  size: 'Medium',
  seller: {
    username: 'artisan.leather',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    verified: true,
    fullName: 'Sarah Martinez',
    followers: 12500,
    following: 543,
    posts: 287,
    isFollowing: false
  },
  images: [
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop'
  ],
  description: 'Handcrafted from premium Italian leather, this crossbody bag combines timeless style with modern functionality. Perfect for work, travel, or everyday adventures. Each piece is unique and made to last.',
  hashtags: ['handmade', 'leather', 'crossbody', 'italian', 'artisan', 'sustainable', 'fashion'],
  likes: 189,
  comments: 23,
  shares: 12,
  posted: '3 hours ago',
  location: 'London, UK',
  availability: 'available' as const
};

export const sampleComments = [
  {
    id: '1',
    username: 'fashionista_jane',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    text: 'This is absolutely gorgeous! What\'s the interior like?',
    likes: 3,
    time: '2h'
  },
  {
    id: '2',
    username: 'leathergoods_lover',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    text: 'Beautiful craftsmanship! Do you ship internationally?',
    likes: 1,
    time: '1h'
  },
  {
    id: '3',
    username: 'style_maven',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face',
    text: 'Adding this to my wishlist! 😍',
    likes: 5,
    time: '45m'
  }
];