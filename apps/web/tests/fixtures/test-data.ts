/**
 * Test data fixtures for Driplo marketplace tests
 */

export const testUsers = {
  buyer: {
    email: 'buyer@test.driplo.com',
    password: 'TestBuyer123!',
    profile: {
      firstName: 'John',
      lastName: 'Buyer',
      username: 'johnbuyer',
      bio: 'Test buyer account for automation'
    }
  },
  seller: {
    email: 'seller@test.driplo.com',
    password: 'TestSeller123!',
    profile: {
      firstName: 'Jane',
      lastName: 'Seller',
      username: 'janeseller',
      bio: 'Test seller account for automation'
    }
  },
  admin: {
    email: 'admin@test.driplo.com',
    password: 'TestAdmin123!',
    profile: {
      firstName: 'Admin',
      lastName: 'User',
      username: 'admintest',
      bio: 'Test admin account for automation'
    }
  }
};

export const testProducts = [
  {
    title: 'Test Designer Handbag',
    description: 'Beautiful test handbag in excellent condition',
    price: 150,
    brand: 'Gucci',
    category: 'bags',
    size: 'One Size',
    condition: 'like_new',
    tags: ['designer', 'luxury', 'handbag']
  },
  {
    title: 'Test Vintage Jacket',
    description: 'Classic vintage leather jacket',
    price: 80,
    brand: 'Vintage',
    category: 'clothing',
    size: 'M',
    condition: 'good',
    tags: ['vintage', 'leather', 'jacket']
  },
  {
    title: 'Test Sneakers',
    description: 'Limited edition test sneakers',
    price: 200,
    brand: 'Nike',
    category: 'shoes',
    size: '42',
    condition: 'excellent',
    tags: ['sneakers', 'limited', 'nike']
  }
];

export const testMessages = [
  {
    content: 'Hi, is this item still available?',
    type: 'inquiry'
  },
  {
    content: 'Would you accept €100 for this?',
    type: 'offer'
  },
  {
    content: 'Thank you for the quick shipping!',
    type: 'feedback'
  }
];

export const testAddresses = {
  default: {
    firstName: 'John',
    lastName: 'Doe',
    street: 'Test Street 123',
    city: 'Sofia',
    postalCode: '1000',
    country: 'Bulgaria',
    phone: '+359888123456'
  },
  international: {
    firstName: 'Jane',
    lastName: 'Smith',
    street: 'Test Avenue 456',
    city: 'London',
    postalCode: 'SW1A 1AA',
    country: 'United Kingdom',
    phone: '+44 20 7946 0958'
  }
};

export const testFilters = {
  category: ['bags', 'clothing', 'shoes'],
  brand: ['Gucci', 'Nike', 'Zara', 'H&M'],
  size: ['XS', 'S', 'M', 'L', 'XL', 'One Size'],
  condition: ['new', 'like_new', 'excellent', 'good', 'fair'],
  priceRange: {
    min: 10,
    max: 500
  }
};

export const searchQueries = [
  'designer handbag',
  'vintage jacket',
  'nike sneakers',
  'summer dress',
  'leather boots',
  'designer shoes',
  'luxury watch',
  'vintage tshirt'
];