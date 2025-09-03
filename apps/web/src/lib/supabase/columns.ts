/**
 * Column selection helpers to prevent overfetching
 * Use these instead of select('*') to reduce egress!
 */

// For product listings (cards, search results)
export const PRODUCT_LIST_COLUMNS = `
  id,
  title,
  price,
  condition,
  size,
  brand,
  location,
  is_boosted,
  is_sold,
  created_at,
  seller_id,
  category_id
`;

// For product detail pages
export const PRODUCT_DETAIL_COLUMNS = `
  id,
  title,
  description,
  price,
  condition,
  size,
  brand,
  material,
  color,
  location,
  shipping_cost,
  is_sold,
  is_active,
  is_featured,
  is_boosted,
  view_count,
  favorite_count,
  created_at,
  updated_at,
  seller_id,
  category_id
`;

// For public profile display
export const PROFILE_PUBLIC_COLUMNS = `
  id,
  username,
  full_name,
  avatar_url,
  bio,
  location,
  rating,
  review_count,
  sales_count,
  followers_count,
  following_count,
  created_at,
  verified,
  account_type
`;

// For minimal profile info (in product cards)
export const PROFILE_MINIMAL_COLUMNS = `
  id,
  username,
  avatar_url,
  rating
`;

// For category listings
export const CATEGORY_COLUMNS = `
  id,
  name,
  slug,
  parent_id,
  sort_order,
  is_active
`;

// For order listings
export const ORDER_LIST_COLUMNS = `
  id,
  status,
  total_amount,
  created_at,
  buyer_id,
  seller_id,
  product_id
`;

// For product images
export const PRODUCT_IMAGE_COLUMNS = `
  id,
  image_url,
  sort_order
`;

// Helper function to build select with joins
export function buildProductListSelect(includeImages = true, includeSeller = true) {
  let select = PRODUCT_LIST_COLUMNS;
  
  if (includeImages) {
    select += `,
    product_images (
      id,
      image_url,
      sort_order
    )`;
  }
  
  if (includeSeller) {
    select += `,
    profiles!products_seller_id_fkey (
      username,
      avatar_url,
      rating
    )`;
  }
  
  return select;
}

// Helper for counting without fetching data
export function buildCountQuery() {
  return `id`; // Only select id for counting
}