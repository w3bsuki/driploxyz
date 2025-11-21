-- Clean up existing categories and create proper 3-tier structure
BEGIN;

-- First, delete all existing categories (cascading will handle products)
DELETE FROM categories;

-- Insert Level 1: Gender/Age categories
INSERT INTO categories (id, name, slug, parent_id, sort_order, is_active) VALUES
  ('c2719147-b47c-4511-909e-0143b43edcac', 'Men', 'men', NULL, 1, true),
  ('062a8869-5250-4981-9ab6-a71db93863a8', 'Women', 'women', NULL, 2, true),
  ('8207de47-1ccd-457c-9cbc-e58e85cb7309', 'Kids', 'kids', NULL, 3, true),
  ('286d045c-b058-4110-a4c7-32fcbbeda643', 'Unisex', 'unisex', NULL, 4, true);

-- Insert Level 2: Type categories under each gender
-- Men categories
INSERT INTO categories (id, name, slug, parent_id, sort_order, is_active) VALUES
  ('e6732a27-e23c-4fcf-ac84-3f087d1259b8', 'Clothing', 'e6732a27-e23c-4fcf-ac84-3f087d1259b8', 'c2719147-b47c-4511-909e-0143b43edcac', 1, true),
  ('47fdbc64-60c7-476e-8ef1-0a52b82a2039', 'Shoes', '47fdbc64-60c7-476e-8ef1-0a52b82a2039', 'c2719147-b47c-4511-909e-0143b43edcac', 2, true),
  ('d15b78c9-827c-4965-a4ce-78d03ea40430', 'Accessories', 'd15b78c9-827c-4965-a4ce-78d03ea40430', 'c2719147-b47c-4511-909e-0143b43edcac', 3, true);

-- Women categories  
INSERT INTO categories (id, name, slug, parent_id, sort_order, is_active) VALUES
  ('962c3cbb-37da-4d72-814b-2920af6c5d8a', 'Clothing', '962c3cbb-37da-4d72-814b-2920af6c5d8a', '062a8869-5250-4981-9ab6-a71db93863a8', 1, true),
  ('c9b837f3-e756-4b3b-b19c-1df4aa4f62d3', 'Shoes', 'c9b837f3-e756-4b3b-b19c-1df4aa4f62d3', '062a8869-5250-4981-9ab6-a71db93863a8', 2, true),
  ('a1f825be-1a00-4939-b44c-2e64b353fd49', 'Accessories', 'a1f825be-1a00-4939-b44c-2e64b353fd49', '062a8869-5250-4981-9ab6-a71db93863a8', 3, true);

-- Kids categories
INSERT INTO categories (id, name, slug, parent_id, sort_order, is_active) VALUES
  ('2c89681a-dd92-4fed-822f-2cf39a338c2d', 'Clothing', '2c89681a-dd92-4fed-822f-2cf39a338c2d', '8207de47-1ccd-457c-9cbc-e58e85cb7309', 1, true),
  ('fa217154-928f-4016-9fc1-a15a809f20f2', 'Shoes', 'fa217154-928f-4016-9fc1-a15a809f20f2', '8207de47-1ccd-457c-9cbc-e58e85cb7309', 2, true),
  ('feae00a9-5962-462a-aa1d-afca2cf270b1', 'Accessories', 'feae00a9-5962-462a-aa1d-afca2cf270b1', '8207de47-1ccd-457c-9cbc-e58e85cb7309', 3, true);

-- Unisex categories
INSERT INTO categories (id, name, slug, parent_id, sort_order, is_active) VALUES
  ('134f2486-c50f-4697-adcd-0829d5cbe3e3', 'Clothing', '134f2486-c50f-4697-adcd-0829d5cbe3e3', '286d045c-b058-4110-a4c7-32fcbbeda643', 1, true),
  ('7cd9d4b1-873e-4fc4-a181-11b498269d6e', 'Shoes', '7cd9d4b1-873e-4fc4-a181-11b498269d6e', '286d045c-b058-4110-a4c7-32fcbbeda643', 2, true),
  ('044b820c-22c6-4323-ab2b-194393a575e3', 'Accessories', '044b820c-22c6-4323-ab2b-194393a575e3', '286d045c-b058-4110-a4c7-32fcbbeda643', 3, true);

-- Insert Level 3: Specific item categories

-- Men's Clothing
INSERT INTO categories (id, name, slug, parent_id, sort_order, is_active) VALUES
  ('8e920f97-65db-4d67-bca1-9aadbb21eec7', 'T-Shirts', '8e920f97-65db-4d67-bca1-9aadbb21eec7', 'e6732a27-e23c-4fcf-ac84-3f087d1259b8', 1, true),
  ('8cf2af9c-7a43-442b-96f3-53df09ff5523', 'Shirts', '8cf2af9c-7a43-442b-96f3-53df09ff5523', 'e6732a27-e23c-4fcf-ac84-3f087d1259b8', 2, true),
  ('d972bf61-8f2f-4665-a17c-3791ccd472d3', 'Hoodies & Sweatshirts', 'd972bf61-8f2f-4665-a17c-3791ccd472d3', 'e6732a27-e23c-4fcf-ac84-3f087d1259b8', 3, true),
  ('db680baf-9727-40ad-86fc-3a18ff8d2830', 'Jackets & Coats', 'db680baf-9727-40ad-86fc-3a18ff8d2830', 'e6732a27-e23c-4fcf-ac84-3f087d1259b8', 4, true),
  ('130c4978-5973-480f-8ec5-d5d4acfcafe4', 'Jeans', '130c4978-5973-480f-8ec5-d5d4acfcafe4', 'e6732a27-e23c-4fcf-ac84-3f087d1259b8', 5, true),
  ('00f9b88b-90c1-4572-9252-51181c2e04f1', 'Pants & Trousers', '00f9b88b-90c1-4572-9252-51181c2e04f1', 'e6732a27-e23c-4fcf-ac84-3f087d1259b8', 6, true),
  ('bb7e1fcd-5c1e-4ba7-984c-ff0083574ad0', 'Shorts', 'bb7e1fcd-5c1e-4ba7-984c-ff0083574ad0', 'e6732a27-e23c-4fcf-ac84-3f087d1259b8', 7, true),
  ('0ea6c92d-6a7f-4d46-9e5e-8ac811472c83', 'Suits & Blazers', '0ea6c92d-6a7f-4d46-9e5e-8ac811472c83', 'e6732a27-e23c-4fcf-ac84-3f087d1259b8', 8, true),
  ('4dce0e7e-ea95-416a-b8ae-ef014e42cefc', 'Activewear', '4dce0e7e-ea95-416a-b8ae-ef014e42cefc', 'e6732a27-e23c-4fcf-ac84-3f087d1259b8', 9, true),
  ('309dc1ae-655e-4e31-8a3f-7d5f5786dacf', 'Underwear', '309dc1ae-655e-4e31-8a3f-7d5f5786dacf', 'e6732a27-e23c-4fcf-ac84-3f087d1259b8', 10, true),
  ('a12eb996-4ec4-480f-9288-0af200153e0d', 'Swimwear', 'a12eb996-4ec4-480f-9288-0af200153e0d', 'e6732a27-e23c-4fcf-ac84-3f087d1259b8', 11, true);

-- Women's Clothing
INSERT INTO categories (id, name, slug, parent_id, sort_order, is_active) VALUES
  ('a9a579aa-aa22-4d01-991c-68fe6365b4d7', 'T-Shirts', 'a9a579aa-aa22-4d01-991c-68fe6365b4d7', '962c3cbb-37da-4d72-814b-2920af6c5d8a', 1, true),
  ('dbdd74f7-299c-45db-836d-43b06151ac74', 'Shirts & Blouses', 'dbdd74f7-299c-45db-836d-43b06151ac74', '962c3cbb-37da-4d72-814b-2920af6c5d8a', 2, true),
  ('64814623-248a-4e77-ac4b-f570ec67bd1a', 'Hoodies & Sweatshirts', '64814623-248a-4e77-ac4b-f570ec67bd1a', '962c3cbb-37da-4d72-814b-2920af6c5d8a', 3, true),
  ('3565c76b-7f97-43b7-9cd9-fd963dd064cd', 'Jackets & Coats', '3565c76b-7f97-43b7-9cd9-fd963dd064cd', '962c3cbb-37da-4d72-814b-2920af6c5d8a', 4, true),
  ('3a6cb356-bad3-4aaf-be90-4d5cea29d5b3', 'Jeans', '3a6cb356-bad3-4aaf-be90-4d5cea29d5b3', '962c3cbb-37da-4d72-814b-2920af6c5d8a', 5, true),
  ('34ab9853-5c1f-4e0d-8d6d-70aa8481cd5d', 'Pants & Trousers', '34ab9853-5c1f-4e0d-8d6d-70aa8481cd5d', '962c3cbb-37da-4d72-814b-2920af6c5d8a', 6, true),
  ('1172097a-a75f-4b68-917d-26a2530e48f0', 'Shorts', '1172097a-a75f-4b68-917d-26a2530e48f0', '962c3cbb-37da-4d72-814b-2920af6c5d8a', 7, true),
  ('0edb4ae4-88cd-4dfa-b21d-574aad5f99cd', 'Dresses', '0edb4ae4-88cd-4dfa-b21d-574aad5f99cd', '962c3cbb-37da-4d72-814b-2920af6c5d8a', 8, true),
  ('d833d816-da7e-46f8-b1a7-cb32673a7d36', 'Skirts', 'd833d816-da7e-46f8-b1a7-cb32673a7d36', '962c3cbb-37da-4d72-814b-2920af6c5d8a', 9, true),
  ('5208cc48-94e7-4205-b277-87f01b1112c2', 'Suits & Blazers', '5208cc48-94e7-4205-b277-87f01b1112c2', '962c3cbb-37da-4d72-814b-2920af6c5d8a', 10, true),
  ('3cae27b7-0643-4a77-8bcc-561b900ea352', 'Activewear', '3cae27b7-0643-4a77-8bcc-561b900ea352', '962c3cbb-37da-4d72-814b-2920af6c5d8a', 11, true),
  ('4b05b59a-ed80-4a7f-849c-b362bda61362', 'Lingerie & Underwear', '4b05b59a-ed80-4a7f-849c-b362bda61362', '962c3cbb-37da-4d72-814b-2920af6c5d8a', 12, true),
  ('fd68d690-1f32-47be-b978-ec9b614c78cf', 'Swimwear', 'fd68d690-1f32-47be-b978-ec9b614c78cf', '962c3cbb-37da-4d72-814b-2920af6c5d8a', 13, true);

-- Kids' Clothing (with age groups)
INSERT INTO categories (id, name, slug, parent_id, sort_order, is_active) VALUES
  ('09fa9954-5dfe-44a5-acf7-f460271d5150', 'Baby (0-24m)', '09fa9954-5dfe-44a5-acf7-f460271d5150', '2c89681a-dd92-4fed-822f-2cf39a338c2d', 1, true),
  ('e0b19bbb-1a53-4305-8578-12fb808398b9', 'Toddler (2-4y)', 'e0b19bbb-1a53-4305-8578-12fb808398b9', '2c89681a-dd92-4fed-822f-2cf39a338c2d', 2, true),
  ('5947b019-49c6-4912-bd98-6595971aa18a', 'Boys (5-14y)', '5947b019-49c6-4912-bd98-6595971aa18a', '2c89681a-dd92-4fed-822f-2cf39a338c2d', 3, true),
  ('a7aa933c-8211-4f2c-a91b-ed32d577193b', 'Girls (5-14y)', 'a7aa933c-8211-4f2c-a91b-ed32d577193b', '2c89681a-dd92-4fed-822f-2cf39a338c2d', 4, true);

-- Men's Shoes
INSERT INTO categories (id, name, slug, parent_id, sort_order, is_active) VALUES
  ('b96945bb-fb0b-4909-9874-d877271c845f', 'Sneakers', 'b96945bb-fb0b-4909-9874-d877271c845f', '47fdbc64-60c7-476e-8ef1-0a52b82a2039', 1, true),
  ('a0aae630-88b2-4a24-a6fd-d105cafbdd9f', 'Boots', 'a0aae630-88b2-4a24-a6fd-d105cafbdd9f', '47fdbc64-60c7-476e-8ef1-0a52b82a2039', 2, true),
  ('52383ba1-a6ff-40bc-8d2b-6bd6c63b0c61', 'Formal & Dress', '52383ba1-a6ff-40bc-8d2b-6bd6c63b0c61', '47fdbc64-60c7-476e-8ef1-0a52b82a2039', 3, true),
  ('a009c358-716f-41c0-a61b-ad44c4d7eb3a', 'Sandals & Slides', 'a009c358-716f-41c0-a61b-ad44c4d7eb3a', '47fdbc64-60c7-476e-8ef1-0a52b82a2039', 4, true),
  ('cfc08608-23a9-4e6c-8b78-2c822f04ff3e', 'Athletic & Sports', 'cfc08608-23a9-4e6c-8b78-2c822f04ff3e', '47fdbc64-60c7-476e-8ef1-0a52b82a2039', 5, true);

-- Women's Shoes
INSERT INTO categories (id, name, slug, parent_id, sort_order, is_active) VALUES
  ('d898298b-a9d2-418f-9833-621344061ecc', 'Sneakers', 'd898298b-a9d2-418f-9833-621344061ecc', 'c9b837f3-e756-4b3b-b19c-1df4aa4f62d3', 1, true),
  ('419e78f2-ad75-4628-9048-6865f73d3b75', 'Boots', '419e78f2-ad75-4628-9048-6865f73d3b75', 'c9b837f3-e756-4b3b-b19c-1df4aa4f62d3', 2, true),
  ('fa6bcd61-3523-4e04-8d7d-46ada7e4e475', 'Heels', 'fa6bcd61-3523-4e04-8d7d-46ada7e4e475', 'c9b837f3-e756-4b3b-b19c-1df4aa4f62d3', 3, true),
  ('ef3cec63-30a0-436c-8508-bfff75e0709f', 'Flats', 'ef3cec63-30a0-436c-8508-bfff75e0709f', 'c9b837f3-e756-4b3b-b19c-1df4aa4f62d3', 4, true),
  ('a9e48e65-37a0-4215-bf11-6dc7b07f3419', 'Sandals', 'a9e48e65-37a0-4215-bf11-6dc7b07f3419', 'c9b837f3-e756-4b3b-b19c-1df4aa4f62d3', 5, true),
  ('edc39817-5631-41f7-9e12-5e9055cf4a37', 'Athletic & Sports', 'edc39817-5631-41f7-9e12-5e9055cf4a37', 'c9b837f3-e756-4b3b-b19c-1df4aa4f62d3', 6, true);

-- Kids' Shoes
INSERT INTO categories (id, name, slug, parent_id, sort_order, is_active) VALUES
  ('302022cf-f371-491d-a70f-9d8684f74a16', 'Sneakers', '302022cf-f371-491d-a70f-9d8684f74a16', 'fa217154-928f-4016-9fc1-a15a809f20f2', 1, true),
  ('43703039-9d39-43b8-9c49-97b9ed6449d5', 'Boots', '43703039-9d39-43b8-9c49-97b9ed6449d5', 'fa217154-928f-4016-9fc1-a15a809f20f2', 2, true),
  ('510ccf02-b6b2-413f-8960-02424b1b9c4b', 'Sandals', '510ccf02-b6b2-413f-8960-02424b1b9c4b', 'fa217154-928f-4016-9fc1-a15a809f20f2', 3, true),
  ('7df792f3-9453-4d38-a029-09b0f472581d', 'School Shoes', '7df792f3-9453-4d38-a029-09b0f472581d', 'fa217154-928f-4016-9fc1-a15a809f20f2', 4, true);

-- Men's Accessories
INSERT INTO categories (id, name, slug, parent_id, sort_order, is_active) VALUES
  ('cf6bbfad-50a7-4f03-8d23-33697934a90c', 'Bags & Backpacks', 'cf6bbfad-50a7-4f03-8d23-33697934a90c', 'd15b78c9-827c-4965-a4ce-78d03ea40430', 1, true),
  ('855439dd-140b-4dd2-ab91-73f488449eaa', 'Hats & Caps', '855439dd-140b-4dd2-ab91-73f488449eaa', 'd15b78c9-827c-4965-a4ce-78d03ea40430', 2, true),
  ('e3499c67-0835-4be4-970f-252826af9a10', 'Belts', 'e3499c67-0835-4be4-970f-252826af9a10', 'd15b78c9-827c-4965-a4ce-78d03ea40430', 3, true),
  ('36f13ce7-09ec-4b94-ba4a-e9bbcda4862f', 'Watches', '36f13ce7-09ec-4b94-ba4a-e9bbcda4862f', 'd15b78c9-827c-4965-a4ce-78d03ea40430', 4, true),
  ('b007ff95-dd34-4b6c-9c7b-562e939e6c5b', 'Sunglasses', 'b007ff95-dd34-4b6c-9c7b-562e939e6c5b', 'd15b78c9-827c-4965-a4ce-78d03ea40430', 5, true),
  ('88f8ed3e-75f6-4553-9afc-34f27def8ae8', 'Wallets', '88f8ed3e-75f6-4553-9afc-34f27def8ae8', 'd15b78c9-827c-4965-a4ce-78d03ea40430', 6, true),
  ('58cb3822-7086-448f-93c5-666b22848e4b', 'Jewelry', '58cb3822-7086-448f-93c5-666b22848e4b', 'd15b78c9-827c-4965-a4ce-78d03ea40430', 7, true);

-- Women's Accessories  
INSERT INTO categories (id, name, slug, parent_id, sort_order, is_active) VALUES
  ('3b7f54d8-bd25-4a36-b08a-007d7916790c', 'Bags & Purses', '3b7f54d8-bd25-4a36-b08a-007d7916790c', 'a1f825be-1a00-4939-b44c-2e64b353fd49', 1, true),
  ('f101a0b1-3288-4514-8e04-e2b1c7cdeb20', 'Hats', 'f101a0b1-3288-4514-8e04-e2b1c7cdeb20', 'a1f825be-1a00-4939-b44c-2e64b353fd49', 2, true),
  ('08520e56-1aea-480d-aab7-f44de38fe363', 'Belts', '08520e56-1aea-480d-aab7-f44de38fe363', 'a1f825be-1a00-4939-b44c-2e64b353fd49', 3, true),
  ('7293bd97-ed64-47fb-90c1-62c34fa4020d', 'Jewelry', '7293bd97-ed64-47fb-90c1-62c34fa4020d', 'a1f825be-1a00-4939-b44c-2e64b353fd49', 4, true),
  ('098808fe-a1e2-4f7d-ab1b-887155e39b66', 'Watches', '098808fe-a1e2-4f7d-ab1b-887155e39b66', 'a1f825be-1a00-4939-b44c-2e64b353fd49', 5, true),
  ('81c36521-a257-4cb5-920c-ced75c75979e', 'Sunglasses', '81c36521-a257-4cb5-920c-ced75c75979e', 'a1f825be-1a00-4939-b44c-2e64b353fd49', 6, true),
  ('0d0cea45-7c18-46ed-9d63-26d42112334c', 'Scarves & Wraps', '0d0cea45-7c18-46ed-9d63-26d42112334c', 'a1f825be-1a00-4939-b44c-2e64b353fd49', 7, true),
  ('058b8e5a-cb92-41ba-8f9b-aca88bd6c374', 'Wallets', '058b8e5a-cb92-41ba-8f9b-aca88bd6c374', 'a1f825be-1a00-4939-b44c-2e64b353fd49', 8, true);

-- Kids' Accessories
INSERT INTO categories (id, name, slug, parent_id, sort_order, is_active) VALUES
  ('b0a9ab24-9f36-41cb-9117-7587f900ae2a', 'Bags & Backpacks', 'b0a9ab24-9f36-41cb-9117-7587f900ae2a', 'feae00a9-5962-462a-aa1d-afca2cf270b1', 1, true),
  ('f7e5a4bb-8970-458b-803f-2793ccb4f9c4', 'Hats & Caps', 'f7e5a4bb-8970-458b-803f-2793ccb4f9c4', 'feae00a9-5962-462a-aa1d-afca2cf270b1', 2, true),
  ('07312883-b6ce-4c3d-8102-49cc87130ae1', 'Other Accessories', '07312883-b6ce-4c3d-8102-49cc87130ae1', 'feae00a9-5962-462a-aa1d-afca2cf270b1', 3, true);

-- Unisex items (minimal - can be expanded)
INSERT INTO categories (id, name, slug, parent_id, sort_order, is_active) VALUES
  ('f10acb0b-2293-4e87-9ae3-ca2bf5c73971', 'T-Shirts', 'f10acb0b-2293-4e87-9ae3-ca2bf5c73971', '134f2486-c50f-4697-adcd-0829d5cbe3e3', 1, true),
  ('2652366a-53bd-42e9-8d29-8be4e791dda8', 'Hoodies', '2652366a-53bd-42e9-8d29-8be4e791dda8', '134f2486-c50f-4697-adcd-0829d5cbe3e3', 2, true),
  ('cd0b6036-3f2e-4713-8e24-72dc98335698', 'Sneakers', 'cd0b6036-3f2e-4713-8e24-72dc98335698', '7cd9d4b1-873e-4fc4-a181-11b498269d6e', 1, true),
  ('a62b761b-1c31-4c7a-a19c-402672f4b016', 'Bags', 'a62b761b-1c31-4c7a-a19c-402672f4b016', '044b820c-22c6-4323-ab2b-194393a575e3', 1, true),
  ('4600992a-84e0-49fa-a6d1-b41821d71909', 'Hats', '4600992a-84e0-49fa-a6d1-b41821d71909', '044b820c-22c6-4323-ab2b-194393a575e3', 2, true);

COMMIT;