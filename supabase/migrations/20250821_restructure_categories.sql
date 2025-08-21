-- Clean up existing categories and create proper 3-tier structure
BEGIN;

-- First, delete all existing categories (cascading will handle products)
DELETE FROM categories;

-- Insert Level 1: Gender/Age categories
INSERT INTO categories (id, name, slug, parent_id, sort_order, is_active) VALUES
  ('men-main', 'Men', 'men', NULL, 1, true),
  ('women-main', 'Women', 'women', NULL, 2, true),
  ('kids-main', 'Kids', 'kids', NULL, 3, true),
  ('unisex-main', 'Unisex', 'unisex', NULL, 4, true);

-- Insert Level 2: Type categories under each gender
-- Men categories
INSERT INTO categories (id, name, slug, parent_id, sort_order, is_active) VALUES
  ('men-clothing', 'Clothing', 'men-clothing', 'men-main', 1, true),
  ('men-shoes', 'Shoes', 'men-shoes', 'men-main', 2, true),
  ('men-accessories', 'Accessories', 'men-accessories', 'men-main', 3, true);

-- Women categories  
INSERT INTO categories (id, name, slug, parent_id, sort_order, is_active) VALUES
  ('women-clothing', 'Clothing', 'women-clothing', 'women-main', 1, true),
  ('women-shoes', 'Shoes', 'women-shoes', 'women-main', 2, true),
  ('women-accessories', 'Accessories', 'women-accessories', 'women-main', 3, true);

-- Kids categories
INSERT INTO categories (id, name, slug, parent_id, sort_order, is_active) VALUES
  ('kids-clothing', 'Clothing', 'kids-clothing', 'kids-main', 1, true),
  ('kids-shoes', 'Shoes', 'kids-shoes', 'kids-main', 2, true),
  ('kids-accessories', 'Accessories', 'kids-accessories', 'kids-main', 3, true);

-- Unisex categories
INSERT INTO categories (id, name, slug, parent_id, sort_order, is_active) VALUES
  ('unisex-clothing', 'Clothing', 'unisex-clothing', 'unisex-main', 1, true),
  ('unisex-shoes', 'Shoes', 'unisex-shoes', 'unisex-main', 2, true),
  ('unisex-accessories', 'Accessories', 'unisex-accessories', 'unisex-main', 3, true);

-- Insert Level 3: Specific item categories

-- Men's Clothing
INSERT INTO categories (id, name, slug, parent_id, sort_order, is_active) VALUES
  ('men-tshirts', 'T-Shirts', 'men-tshirts', 'men-clothing', 1, true),
  ('men-shirts', 'Shirts', 'men-shirts', 'men-clothing', 2, true),
  ('men-hoodies', 'Hoodies & Sweatshirts', 'men-hoodies', 'men-clothing', 3, true),
  ('men-jackets', 'Jackets & Coats', 'men-jackets', 'men-clothing', 4, true),
  ('men-jeans', 'Jeans', 'men-jeans', 'men-clothing', 5, true),
  ('men-pants', 'Pants & Trousers', 'men-pants', 'men-clothing', 6, true),
  ('men-shorts', 'Shorts', 'men-shorts', 'men-clothing', 7, true),
  ('men-suits', 'Suits & Blazers', 'men-suits', 'men-clothing', 8, true),
  ('men-activewear', 'Activewear', 'men-activewear', 'men-clothing', 9, true),
  ('men-underwear', 'Underwear', 'men-underwear', 'men-clothing', 10, true),
  ('men-swimwear', 'Swimwear', 'men-swimwear', 'men-clothing', 11, true);

-- Women's Clothing
INSERT INTO categories (id, name, slug, parent_id, sort_order, is_active) VALUES
  ('women-tshirts', 'T-Shirts', 'women-tshirts', 'women-clothing', 1, true),
  ('women-shirts', 'Shirts & Blouses', 'women-shirts', 'women-clothing', 2, true),
  ('women-hoodies', 'Hoodies & Sweatshirts', 'women-hoodies', 'women-clothing', 3, true),
  ('women-jackets', 'Jackets & Coats', 'women-jackets', 'women-clothing', 4, true),
  ('women-jeans', 'Jeans', 'women-jeans', 'women-clothing', 5, true),
  ('women-pants', 'Pants & Trousers', 'women-pants', 'women-clothing', 6, true),
  ('women-shorts', 'Shorts', 'women-shorts', 'women-clothing', 7, true),
  ('women-dresses', 'Dresses', 'women-dresses', 'women-clothing', 8, true),
  ('women-skirts', 'Skirts', 'women-skirts', 'women-clothing', 9, true),
  ('women-suits', 'Suits & Blazers', 'women-suits', 'women-clothing', 10, true),
  ('women-activewear', 'Activewear', 'women-activewear', 'women-clothing', 11, true),
  ('women-lingerie', 'Lingerie & Underwear', 'women-lingerie', 'women-clothing', 12, true),
  ('women-swimwear', 'Swimwear', 'women-swimwear', 'women-clothing', 13, true);

-- Kids' Clothing (with age groups)
INSERT INTO categories (id, name, slug, parent_id, sort_order, is_active) VALUES
  ('kids-baby-clothing', 'Baby (0-24m)', 'kids-baby-clothing', 'kids-clothing', 1, true),
  ('kids-toddler-clothing', 'Toddler (2-4y)', 'kids-toddler-clothing', 'kids-clothing', 2, true),
  ('kids-boys-clothing', 'Boys (5-14y)', 'kids-boys-clothing', 'kids-clothing', 3, true),
  ('kids-girls-clothing', 'Girls (5-14y)', 'kids-girls-clothing', 'kids-clothing', 4, true);

-- Men's Shoes
INSERT INTO categories (id, name, slug, parent_id, sort_order, is_active) VALUES
  ('men-sneakers', 'Sneakers', 'men-sneakers', 'men-shoes', 1, true),
  ('men-boots', 'Boots', 'men-boots', 'men-shoes', 2, true),
  ('men-formal-shoes', 'Formal & Dress', 'men-formal-shoes', 'men-shoes', 3, true),
  ('men-sandals', 'Sandals & Slides', 'men-sandals', 'men-shoes', 4, true),
  ('men-athletic-shoes', 'Athletic & Sports', 'men-athletic-shoes', 'men-shoes', 5, true);

-- Women's Shoes
INSERT INTO categories (id, name, slug, parent_id, sort_order, is_active) VALUES
  ('women-sneakers', 'Sneakers', 'women-sneakers', 'women-shoes', 1, true),
  ('women-boots', 'Boots', 'women-boots', 'women-shoes', 2, true),
  ('women-heels', 'Heels', 'women-heels', 'women-shoes', 3, true),
  ('women-flats', 'Flats', 'women-flats', 'women-shoes', 4, true),
  ('women-sandals', 'Sandals', 'women-sandals', 'women-shoes', 5, true),
  ('women-athletic-shoes', 'Athletic & Sports', 'women-athletic-shoes', 'women-shoes', 6, true);

-- Kids' Shoes
INSERT INTO categories (id, name, slug, parent_id, sort_order, is_active) VALUES
  ('kids-sneakers', 'Sneakers', 'kids-sneakers', 'kids-shoes', 1, true),
  ('kids-boots', 'Boots', 'kids-boots', 'kids-shoes', 2, true),
  ('kids-sandals', 'Sandals', 'kids-sandals', 'kids-shoes', 3, true),
  ('kids-school-shoes', 'School Shoes', 'kids-school-shoes', 'kids-shoes', 4, true);

-- Men's Accessories
INSERT INTO categories (id, name, slug, parent_id, sort_order, is_active) VALUES
  ('men-bags', 'Bags & Backpacks', 'men-bags', 'men-accessories', 1, true),
  ('men-hats', 'Hats & Caps', 'men-hats', 'men-accessories', 2, true),
  ('men-belts', 'Belts', 'men-belts', 'men-accessories', 3, true),
  ('men-watches', 'Watches', 'men-watches', 'men-accessories', 4, true),
  ('men-sunglasses', 'Sunglasses', 'men-sunglasses', 'men-accessories', 5, true),
  ('men-wallets', 'Wallets', 'men-wallets', 'men-accessories', 6, true),
  ('men-jewelry', 'Jewelry', 'men-jewelry', 'men-accessories', 7, true);

-- Women's Accessories  
INSERT INTO categories (id, name, slug, parent_id, sort_order, is_active) VALUES
  ('women-bags', 'Bags & Purses', 'women-bags', 'women-accessories', 1, true),
  ('women-hats', 'Hats', 'women-hats', 'women-accessories', 2, true),
  ('women-belts', 'Belts', 'women-belts', 'women-accessories', 3, true),
  ('women-jewelry', 'Jewelry', 'women-jewelry', 'women-accessories', 4, true),
  ('women-watches', 'Watches', 'women-watches', 'women-accessories', 5, true),
  ('women-sunglasses', 'Sunglasses', 'women-sunglasses', 'women-accessories', 6, true),
  ('women-scarves', 'Scarves & Wraps', 'women-scarves', 'women-accessories', 7, true),
  ('women-wallets', 'Wallets', 'women-wallets', 'women-accessories', 8, true);

-- Kids' Accessories
INSERT INTO categories (id, name, slug, parent_id, sort_order, is_active) VALUES
  ('kids-bags', 'Bags & Backpacks', 'kids-bags', 'kids-accessories', 1, true),
  ('kids-hats', 'Hats & Caps', 'kids-hats', 'kids-accessories', 2, true),
  ('kids-accessories-other', 'Other Accessories', 'kids-accessories-other', 'kids-accessories', 3, true);

-- Unisex items (minimal - can be expanded)
INSERT INTO categories (id, name, slug, parent_id, sort_order, is_active) VALUES
  ('unisex-tshirts', 'T-Shirts', 'unisex-tshirts', 'unisex-clothing', 1, true),
  ('unisex-hoodies', 'Hoodies', 'unisex-hoodies', 'unisex-clothing', 2, true),
  ('unisex-sneakers', 'Sneakers', 'unisex-sneakers', 'unisex-shoes', 1, true),
  ('unisex-bags', 'Bags', 'unisex-bags', 'unisex-accessories', 1, true),
  ('unisex-hats', 'Hats', 'unisex-hats', 'unisex-accessories', 2, true);

COMMIT;