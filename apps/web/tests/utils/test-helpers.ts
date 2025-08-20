import { Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Test environment configuration
const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-key';

// Initialize Supabase client for test data management
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Generate a unique test email
 */
export function generateTestEmail(prefix = 'test'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${prefix}-${timestamp}-${random}@test.com`;
}

/**
 * Create a test user in the database
 */
export async function createTestUser(email: string, password: string) {
  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (authError) throw authError;

  // Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      email,
      username: email.split('@')[0],
      full_name: 'Test User',
      onboarding_completed: true
    });

  if (profileError) throw profileError;

  return authData.user.id;
}

/**
 * Delete a test user and related data
 */
export async function deleteTestUser(email: string) {
  // Get user ID
  const { data: userData } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (!userData) return;

  // Delete user data in correct order (respecting foreign keys)
  await supabase.from('favorites').delete().eq('user_id', userData.id);
  await supabase.from('messages').delete().or(`sender_id.eq.${userData.id},recipient_id.eq.${userData.id}`);
  await supabase.from('orders').delete().or(`buyer_id.eq.${userData.id},seller_id.eq.${userData.id}`);
  await supabase.from('products').delete().eq('seller_id', userData.id);
  await supabase.from('profiles').delete().eq('id', userData.id);
  
  // Delete auth user
  await supabase.auth.admin.deleteUser(userData.id);
}

/**
 * Login a user in Playwright
 */
export async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  
  // Wait for redirect after successful login
  await page.waitForURL(/\/(dashboard|onboarding)/);
}

/**
 * Create a test product
 */
export async function createTestProduct(options: {
  sellerId: string;
  title: string;
  price: number;
  category?: string;
  condition?: string;
}) {
  const { data, error } = await supabase
    .from('products')
    .insert({
      seller_id: options.sellerId,
      title: options.title,
      description: `Test description for ${options.title}`,
      price: options.price,
      category: options.category || 'Clothing',
      subcategory: 'Other',
      condition: options.condition || 'used',
      size: 'M',
      brand: 'Test Brand',
      images: ['/test-image-1.jpg', '/test-image-2.jpg'],
      status: 'active'
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

/**
 * Delete a test product
 */
export async function deleteTestProduct(productId: string) {
  await supabase.from('favorites').delete().eq('product_id', productId);
  await supabase.from('order_items').delete().eq('product_id', productId);
  await supabase.from('products').delete().eq('id', productId);
}

/**
 * Seed database with test products for browsing tests
 */
export async function seedTestProducts() {
  const categories = ['Women', 'Men', 'Kids', 'Shoes', 'Accessories'];
  const conditions = ['new', 'likenew', 'used', 'fair'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const brands = ['Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Designer Brand'];

  // Create a test seller if not exists
  const sellerEmail = 'test-seller@test.com';
  let sellerId: string;
  
  try {
    sellerId = await createTestUser(sellerEmail, 'TestPassword123!');
  } catch (error) {
    // User might already exist
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', sellerEmail)
      .single();
    sellerId = data?.id || '';
  }

  // Create 50 test products
  const products = [];
  for (let i = 0; i < 50; i++) {
    products.push({
      seller_id: sellerId,
      title: generateProductTitle(i),
      description: generateProductDescription(i),
      price: Math.floor(Math.random() * 200) + 10,
      category: categories[Math.floor(Math.random() * categories.length)],
      subcategory: 'Other',
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      size: sizes[Math.floor(Math.random() * sizes.length)],
      brand: brands[Math.floor(Math.random() * brands.length)],
      images: ['/placeholder-1.jpg', '/placeholder-2.jpg'],
      status: 'active',
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  await supabase.from('products').insert(products);
}

/**
 * Generate realistic product titles
 */
function generateProductTitle(index: number): string {
  const titles = [
    'Vintage Denim Jacket',
    'Designer Leather Handbag',
    'Classic White Sneakers',
    'Wool Winter Coat',
    'Silk Evening Dress',
    'Cotton T-Shirt',
    'Running Shoes',
    'Crossbody Bag',
    'Casual Blazer',
    'Summer Maxi Dress'
  ];
  
  const adjectives = ['Beautiful', 'Stylish', 'Modern', 'Classic', 'Trendy', 'Elegant'];
  const adjective = adjectives[index % adjectives.length];
  const title = titles[index % titles.length];
  
  return `${adjective} ${title}`;
}

/**
 * Generate realistic product descriptions
 */
function generateProductDescription(index: number): string {
  const descriptions = [
    'Excellent condition, barely worn. From a smoke-free home.',
    'Brand new with tags. Perfect for any occasion.',
    'Gently used, well-maintained. A timeless piece for your wardrobe.',
    'Vintage item in great condition. Unique and stylish.',
    'Like new, worn only once. High-quality materials.',
    'Pre-loved item in good condition. Still has lots of life left.',
    'Designer piece, authentic with proof of purchase.',
    'Comfortable and versatile. Goes with everything.',
    'Limited edition, hard to find. Collector\'s item.',
    'Sustainable fashion choice. Eco-friendly and stylish.'
  ];
  
  return descriptions[index % descriptions.length];
}

/**
 * Create test fixtures for visual regression testing
 */
export async function createVisualTestFixtures() {
  // Create consistent test data for visual regression tests
  const fixtures = {
    users: [
      { email: 'visual-test-user-1@test.com', username: 'visualuser1' },
      { email: 'visual-test-user-2@test.com', username: 'visualuser2' }
    ],
    products: [
      {
        title: 'Visual Test Product 1',
        price: 49.99,
        images: ['/fixtures/product-1.jpg']
      },
      {
        title: 'Visual Test Product 2',
        price: 89.99,
        images: ['/fixtures/product-2.jpg']
      }
    ]
  };

  return fixtures;
}

/**
 * Wait for network idle (useful for SPA navigation)
 */
export async function waitForNetworkIdle(page: Page) {
  await page.waitForLoadState('networkidle');
}

/**
 * Mock Stripe payment in tests
 */
export async function mockStripePayment(page: Page, success = true) {
  await page.route('**/stripe.com/**', async route => {
    if (success) {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ 
          payment_intent: { 
            status: 'succeeded',
            id: 'pi_test_' + Date.now()
          } 
        })
      });
    } else {
      await route.fulfill({
        status: 400,
        body: JSON.stringify({ 
          error: { 
            message: 'Your card was declined',
            code: 'card_declined'
          } 
        })
      });
    }
  });
}

/**
 * Take a screenshot with consistent naming
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ 
    path: `tests/screenshots/${name}-${Date.now()}.png`,
    fullPage: true 
  });
}

/**
 * Check accessibility of current page
 */
export async function checkAccessibility(page: Page) {
  // This would integrate with axe-core or similar
  // For now, basic checks
  const violations = await page.evaluate(() => {
    const issues = [];
    
    // Check for alt text on images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.alt) {
        issues.push(`Image missing alt text: ${img.src}`);
      }
    });
    
    // Check for proper heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;
    headings.forEach(heading => {
      const level = parseInt(heading.tagName[1]);
      if (level - lastLevel > 1) {
        issues.push(`Heading hierarchy skip: ${heading.tagName} after H${lastLevel}`);
      }
      lastLevel = level;
    });
    
    // Check for form labels
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const id = input.id;
      if (id && !document.querySelector(`label[for="${id}"]`)) {
        issues.push(`Input missing label: ${id}`);
      }
    });
    
    return issues;
  });
  
  return violations;
}