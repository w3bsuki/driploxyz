-- Driplo Marketplace - Initial Seed Data
-- Migration: 005_seed_initial_data
-- Description: Populate database with initial categories and sample data

-- Insert main categories
INSERT INTO public.categories (id, name, slug, description, sort_order, is_active) VALUES
    (gen_random_uuid(), 'Women''s Clothing', 'women', 'Women''s fashion and clothing items', 1, true),
    (gen_random_uuid(), 'Men''s Clothing', 'men', 'Men''s fashion and clothing items', 2, true),
    (gen_random_uuid(), 'Kids & Baby', 'kids', 'Children''s and baby clothing', 3, true),
    (gen_random_uuid(), 'Shoes', 'shoes', 'Footwear for all ages', 4, true),
    (gen_random_uuid(), 'Accessories', 'accessories', 'Fashion accessories and jewelry', 5, true),
    (gen_random_uuid(), 'Bags', 'bags', 'Handbags, backpacks, and luggage', 6, true),
    (gen_random_uuid(), 'Sportswear', 'sportswear', 'Athletic and sports clothing', 7, true),
    (gen_random_uuid(), 'Vintage', 'vintage', 'Vintage and retro fashion', 8, true),
    (gen_random_uuid(), 'Plus Size', 'plus-size', 'Plus size clothing', 9, true),
    (gen_random_uuid(), 'Pets', 'pets', 'Pet clothing and accessories', 10, true);

-- Insert women's subcategories
INSERT INTO public.categories (name, slug, description, parent_id, sort_order, is_active)
SELECT 
    subcategory.name,
    subcategory.slug,
    subcategory.description,
    women_cat.id,
    subcategory.sort_order,
    true
FROM (VALUES
    ('Tops & T-Shirts', 'women-tops', 'Blouses, shirts, and t-shirts', 1),
    ('Dresses', 'women-dresses', 'Casual and formal dresses', 2),
    ('Jeans & Trousers', 'women-jeans', 'Jeans, pants, and trousers', 3),
    ('Skirts', 'women-skirts', 'Mini, midi, and maxi skirts', 4),
    ('Jackets & Coats', 'women-jackets', 'Outerwear and jackets', 5),
    ('Knitwear', 'women-knitwear', 'Sweaters and cardigans', 6),
    ('Activewear', 'women-activewear', 'Sportswear and gym clothes', 7),
    ('Underwear', 'women-underwear', 'Lingerie and undergarments', 8),
    ('Swimwear', 'women-swimwear', 'Bikinis and swimsuits', 9),
    ('Maternity', 'women-maternity', 'Maternity clothing', 10)
) AS subcategory(name, slug, description, sort_order)
CROSS JOIN (
    SELECT id FROM public.categories WHERE slug = 'women'
) AS women_cat;

-- Insert men's subcategories
INSERT INTO public.categories (name, slug, description, parent_id, sort_order, is_active)
SELECT 
    subcategory.name,
    subcategory.slug,
    subcategory.description,
    men_cat.id,
    subcategory.sort_order,
    true
FROM (VALUES
    ('T-Shirts & Polo', 'men-tshirts', 'T-shirts and polo shirts', 1),
    ('Shirts', 'men-shirts', 'Dress and casual shirts', 2),
    ('Jeans & Trousers', 'men-jeans', 'Jeans, chinos, and trousers', 3),
    ('Shorts', 'men-shorts', 'Casual and dress shorts', 4),
    ('Jackets & Coats', 'men-jackets', 'Outerwear and blazers', 5),
    ('Knitwear', 'men-knitwear', 'Sweaters and hoodies', 6),
    ('Activewear', 'men-activewear', 'Sportswear and gym clothes', 7),
    ('Underwear', 'men-underwear', 'Boxers and undergarments', 8),
    ('Swimwear', 'men-swimwear', 'Swim shorts and trunks', 9),
    ('Suits', 'men-suits', 'Formal suits and dress wear', 10)
) AS subcategory(name, slug, description, sort_order)
CROSS JOIN (
    SELECT id FROM public.categories WHERE slug = 'men'
) AS men_cat;

-- Insert kids subcategories
INSERT INTO public.categories (name, slug, description, parent_id, sort_order, is_active)
SELECT 
    subcategory.name,
    subcategory.slug,
    subcategory.description,
    kids_cat.id,
    subcategory.sort_order,
    true
FROM (VALUES
    ('Baby (0-2 years)', 'baby', 'Baby clothing and accessories', 1),
    ('Girls (2-16 years)', 'girls', 'Girls clothing and accessories', 2),
    ('Boys (2-16 years)', 'boys', 'Boys clothing and accessories', 3),
    ('School Uniforms', 'school-uniforms', 'School uniform items', 4),
    ('Party & Occasion', 'kids-party', 'Special occasion wear', 5)
) AS subcategory(name, slug, description, sort_order)
CROSS JOIN (
    SELECT id FROM public.categories WHERE slug = 'kids'
) AS kids_cat;

-- Insert shoe subcategories
INSERT INTO public.categories (name, slug, description, parent_id, sort_order, is_active)
SELECT 
    subcategory.name,
    subcategory.slug,
    subcategory.description,
    shoes_cat.id,
    subcategory.sort_order,
    true
FROM (VALUES
    ('Trainers & Sneakers', 'sneakers', 'Athletic and casual sneakers', 1),
    ('Boots', 'boots', 'Ankle boots, knee boots, and winter boots', 2),
    ('Heels', 'heels', 'High heels and dress shoes', 3),
    ('Flats', 'flats', 'Ballet flats and comfortable shoes', 4),
    ('Sandals', 'sandals', 'Summer sandals and flip-flops', 5),
    ('Men''s Dress Shoes', 'mens-dress', 'Formal men''s footwear', 6),
    ('Kids Shoes', 'kids-shoes', 'Children''s footwear', 7)
) AS subcategory(name, slug, description, sort_order)
CROSS JOIN (
    SELECT id FROM public.categories WHERE slug = 'shoes'
) AS shoes_cat;

-- Insert accessories subcategories
INSERT INTO public.categories (name, slug, description, parent_id, sort_order, is_active)
SELECT 
    subcategory.name,
    subcategory.slug,
    subcategory.description,
    acc_cat.id,
    subcategory.sort_order,
    true
FROM (VALUES
    ('Jewelry', 'jewelry', 'Necklaces, rings, and earrings', 1),
    ('Watches', 'watches', 'Wrist watches and smartwatches', 2),
    ('Scarves & Wraps', 'scarves', 'Scarves, shawls, and wraps', 3),
    ('Hats & Caps', 'hats', 'Hats, caps, and headwear', 4),
    ('Belts', 'belts', 'Leather and fabric belts', 5),
    ('Sunglasses', 'sunglasses', 'Designer and casual sunglasses', 6),
    ('Hair Accessories', 'hair-accessories', 'Hair clips, bands, and accessories', 7)
) AS subcategory(name, slug, description, sort_order)
CROSS JOIN (
    SELECT id FROM public.categories WHERE slug = 'accessories'
) AS acc_cat;

-- Insert bag subcategories
INSERT INTO public.categories (name, slug, description, parent_id, sort_order, is_active)
SELECT 
    subcategory.name,
    subcategory.slug,
    subcategory.description,
    bags_cat.id,
    subcategory.sort_order,
    true
FROM (VALUES
    ('Handbags', 'handbags', 'Purses and handbags', 1),
    ('Backpacks', 'backpacks', 'School and travel backpacks', 2),
    ('Shoulder Bags', 'shoulder-bags', 'Shoulder and crossbody bags', 3),
    ('Clutches', 'clutches', 'Evening bags and clutches', 4),
    ('Travel Bags', 'travel-bags', 'Luggage and travel bags', 5),
    ('Laptop Bags', 'laptop-bags', 'Business and laptop bags', 6)
) AS subcategory(name, slug, description, sort_order)
CROSS JOIN (
    SELECT id FROM public.categories WHERE slug = 'bags'
) AS bags_cat;

-- Common clothing brands
CREATE TABLE IF NOT EXISTS temp_brands AS
SELECT unnest(ARRAY[
    'Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Gap', 'Levi''s', 'Calvin Klein',
    'Tommy Hilfiger', 'Ralph Lauren', 'Gucci', 'Prada', 'Louis Vuitton', 'Chanel',
    'Dior', 'Versace', 'Armani', 'Hugo Boss', 'Burberry', 'Coach', 'Michael Kors',
    'Kate Spade', 'Tory Burch', 'Marc Jacobs', 'Balenciaga', 'Saint Laurent',
    'Givenchy', 'Fendi', 'Celine', 'Hermès', 'Bottega Veneta', 'Valentino',
    'Dolce & Gabbana', 'Moncler', 'Stone Island', 'Off-White', 'Supreme',
    'Palace', 'A Bathing Ape', 'Comme des Garçons', 'Issey Miyake', 'Yamamoto',
    'Rick Owens', 'Acne Studios', 'Ganni', 'Stüssy', 'Carhartt', 'Dickies',
    'Dr. Martens', 'Converse', 'Vans', 'New Balance', 'ASICS', 'Puma',
    'Under Armour', 'Patagonia', 'The North Face', 'Columbia', 'Lululemon',
    'Athleta', 'Alo Yoga', 'Gymshark', 'Fabletics', 'Sweaty Betty'
]) AS brand_name;

-- Common sizes
CREATE TABLE IF NOT EXISTS temp_sizes AS
SELECT unnest(ARRAY[
    'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL',
    '6', '8', '10', '12', '14', '16', '18', '20', '22', '24',
    'UK 6', 'UK 8', 'UK 10', 'UK 12', 'UK 14', 'UK 16', 'UK 18',
    'US 2', 'US 4', 'US 6', 'US 8', 'US 10', 'US 12', 'US 14',
    'EU 34', 'EU 36', 'EU 38', 'EU 40', 'EU 42', 'EU 44', 'EU 46',
    '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '36', '38',
    'One Size', 'Free Size', 'Adjustable'
]) AS size_name;

-- Clean up temporary tables
DROP TABLE IF EXISTS temp_brands;
DROP TABLE IF EXISTS temp_sizes;