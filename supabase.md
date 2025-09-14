# Driplo Supabase Database Audit

**Generated:** 2025-01-15
**Purpose:** Comprehensive audit of all database entities, collections, categories, conditions, badges, account types, and configurations.

---

## 📊 Database Overview

**Total Tables:** 34 (public schema)
**RLS Enabled:** All tables
**Primary Database:** PostgreSQL with Supabase

### Core Table Categories
- **User Management:** profiles, brands, badges, followers
- **Product System:** products, product_images, categories, brand_collections
- **Commerce:** orders, order_items, transactions, reviews
- **Communication:** messages, notifications, admin_notifications
- **Subscriptions:** subscription_plans, user_subscriptions, discount_codes
- **Financial:** seller_balances, payout_requests, balance_history
- **System:** country_config, system_logs, admin_actions

---

## 🏷️ Categories System

**Total Categories:** 143
**Hierarchy Levels:** 3
**Structure:** Hierarchical parent-child relationships

### Level 1 - Main Categories (6)
| Name | Slug | Sort Order | Status |
|------|------|------------|--------|
| Men | `men` | 1 | Active |
| Women | `women` | 2 | Active |
| Kids | `kids` | 3 | Active |
| Unisex | `unisex` | 4 | Active |
| Drip | `drip` | 5 | Active |
| Designer | `designer` | 6 | Active |

### Level 2 - Subcategories
**Men's Categories:**
- Clothing (`men-clothing`)
- Shoes (`men-shoes`)
- Accessories (`men-accessories`)
- Bags (`men-bags`)

**Women's Categories:**
- Clothing (`women-clothing`)
- Shoes (`women-shoes`)
- Accessories (`women-accessories`)
- Bags (`women-bags`)

**Kids' Categories:**
- Clothing (`kids-clothing`)
- Shoes (`kids-shoes`)
- Accessories (`kids-accessories`)
- Bags (`kids-bags`)

**Unisex Categories:**
- Clothing (`unisex-clothing`)
- Shoes (`unisex-shoes`)
- Accessories (`unisex-accessories`)
- Bags (`unisex-bags`)

**Designer Categories:**
- Designer Handbags (`designer-handbags`)
- Designer Shoes (`designer-shoes`)
- Designer Clothing (`designer-clothing`)
- Luxury Jewelry (`luxury-jewelry`)
- Premium Watches (`premium-watches`)

**Drip Categories:**
- High-End Streetwear (`high-end-streetwear`)

### Level 3 - Specific Items
**Examples of Level 3 Categories:**
- T-Shirts (`men-t-shirts`, `unisex-t-shirts`)
- Sneakers (`men-sneakers`, `women-sneakers`, `kids-sneakers`, `unisex-sneakers`)
- Dresses (`women-dresses`)
- Hats & Caps (`men-hats-caps`, `women-hats-caps`, `kids-hats-caps`, `unisex-hats-caps`)
- Jewelry (`women-jewelry`, `unisex-jewelry`)
- Backpacks (`men-backpacks`, `kids-backpacks`, `unisex-backpacks`)
- School Bags (`kids-school-bags`)
- Handbags (`women-handbags`)
- Bags & Purses (`women-bags-purses`)

---

## 🎨 Brand Collections

**Total Collections:** 17
**Collection Types:** 2 (Designer, Drip)

### Designer Collections (7)
| Brand | Slug | Featured | Product Count | Status |
|-------|------|----------|---------------|--------|
| Celine | `celine` | ✅ | 0 | Active |
| Chanel | `chanel` | ✅ | 1 | Active |
| Dior | `dior` | ✅ | 0 | Active |
| Gucci | `gucci` | ✅ | 0 | Active |
| Luxury | `luxury` | ✅ | 3 | Active |
| Versace | `versace` | ✅ | 0 | Active |
| YSL | `ysl` | ✅ | 0 | Active |

### Drip Collections (10)
| Brand | Slug | Featured | Product Count | Status |
|-------|------|----------|---------------|--------|
| BAPE | `bape` | ✅ | 0 | Active |
| Corteiz | `corteiz` | ✅ | 0 | Active |
| Fear of God Essentials | `fear-of-god-essentials` | ✅ | 0 | Active |
| Nike | `nike` | ✅ | 13 | Active |
| Off-White | `off-white` | ✅ | 0 | Active |
| Outdoor | `outdoor` | ✅ | 0 | Active |
| Sport | `sport` | ✅ | 0 | Active |
| Stone Island | `stone-island` | ✅ | 1 | Active |
| Streetwear | `streetwear` | ✅ | 5 | Active |
| Vintage | `vintage` | ✅ | 0 | Active |

---

## 🏷️ Product Conditions & Statuses

### Product Conditions (Enum: product_condition)
1. **brand_new_with_tags** - Brand new with original tags
2. **new_without_tags** - New condition but no tags
3. **like_new** - Excellent condition, barely used
4. **good** - Good condition with minor signs of wear
5. **worn** - Shows signs of regular wear
6. **fair** - Significant wear but still functional

### Product Statuses
- **active** - Live and available for purchase
- **sold** - Successfully sold
- **archived** - Hidden but not deleted
- **deleted** - Removed from platform
- **pending** - Awaiting approval/review

### Drip Nomination System
**Drip Status Values:**
- **not_nominated** - Default state
- **nominated** - Submitted for drip consideration
- **approved** - Approved for drip collection
- **rejected** - Rejected from drip collection
- **pending_review** - Under admin review

### Boost System
**Boost Types:**
- **standard** - Regular boost (24-48 hours)
- **premium** - Premium boost (longer duration, higher priority)

---

## 👤 User System

### User Roles (Enum: user_role)
- **buyer** - Standard buyer account
- **seller** - Can sell products
- **admin** - Administrative privileges

### Account Types
Available account types in profiles:
- **personal** - Individual user account
- **brand** - Brand/business account
- **admin** - Administrative account
- **pro** - Pro seller account
- **premium** - Premium seller account

### Verification System
**Verification Status:**
- **unverified** - Default state
- **pending** - Verification in progress
- **verified** - Successfully verified
- **rejected** - Verification rejected

### Subscription Tiers
- **free** - Free tier
- **basic** - Basic paid plan
- **pro** - Professional plan
- **brand** - Brand account plan

---

## 💎 Subscription Plans & Pricing

**Total Plans:** 5
**Currency:** BGN (Bulgarian Lev)

### Plan Details

#### 1. Free Plan
- **Slug:** `free`
- **Monthly:** 0.00 BGN
- **Yearly:** 0.00 BGN
- **Max Listings:** 1
- **Max Photos:** 3 per listing
- **Features:** Basic features only

#### 2. Basic Plan
- **Slug:** `basic`
- **Monthly:** 0.00 BGN
- **Yearly:** 0.00 BGN
- **Max Listings:** 5
- **Max Photos:** 5 per listing
- **Features:** Up to 5 active listings, basic features, community support

#### 3. Pro Plan
- **Slug:** `pro`
- **Monthly:** 25.00 BGN
- **Yearly:** 250.00 BGN
- **Max Listings:** 20
- **Max Photos:** 8 per listing
- **Features:** Premium badge, analytics dashboard, email support
- **Analytics:** ✅

#### 4. Brand Plan
- **Slug:** `brand`
- **Monthly:** 50.00 BGN
- **Yearly:** 500.00 BGN
- **Max Listings:** Unlimited (-1)
- **Max Photos:** 10 per listing
- **Features:** Unlimited listings, priority placement, brand verification badge, advanced analytics, priority support
- **Priority Support:** ✅
- **Analytics:** ✅

#### 5. Brand Pro Plan
- **Slug:** `brand-pro`
- **Monthly:** 50.00 BGN
- **Yearly:** 500.00 BGN
- **Max Listings:** Unlimited (-1)
- **Max Photos:** 10 per listing
- **Features:** Same as Brand plan
- **Priority Support:** ✅
- **Analytics:** ✅

---

## 🏆 Badge System

**Current Badges:** 1 (Extensible system)

### Available Badges
| Type | Name | Description | Icon | Status |
|------|------|-------------|------|--------|
| `new_seller` | New Seller | Welcome to Driplo! Start your selling journey | 🌟 | Active |

### Badge System Features
- **Profile Association:** Badges linked to user profiles
- **Expiration Support:** Optional expiry dates
- **Metadata:** JSON metadata for additional badge properties
- **Icon Support:** Emoji or image icons

---

## 🌍 Geographic Support

**Supported Countries:** 5
**Default Country:** Bulgaria (BG)

### Country Configuration
| Code | Country | Currency | Locale | Tax Rate | Commission | Status |
|------|---------|----------|--------|----------|------------|--------|
| BG | Bulgaria | BGN | bg | 0% | 10% | Active |
| GB | United Kingdom | GBP | en | 0% | 10% | Active |
| US | United States | USD | en | 0% | 10% | Active |
| RU | Russia | RUB | ru | 0% | 10% | Active |
| UA | Ukraine | UAH | ua | 0% | 10% | Active |

### Regional Settings
**Supported Regions:**
- **BG** - Bulgaria (Default)
- **UK** - United Kingdom

**Supported Currencies:**
- **BGN** - Bulgarian Lev (Default)
- **GBP** - British Pound
- **EUR** - Euro
- **USD** - US Dollar

---

## 📋 All Enums & Status Values

### Message System
**Message Status (Enum: message_status):**
- `sent` - Message sent
- `delivered` - Message delivered
- `read` - Message read by recipient

**Message Types:**
- `user` - User-generated message
- `system` - System message
- `order_update` - Order status update

### Order System
**Order Status (Enum: order_status):**
- `pending` - Order placed, awaiting payment
- `paid` - Payment confirmed
- `shipped` - Order shipped
- `delivered` - Order delivered
- `cancelled` - Order cancelled
- `disputed` - Order in dispute
- `failed` - Payment/order failed
- `completed` - Order completed successfully

### Notification System
**Notification Categories:**
- `general` - General notifications
- `sales` - Sales-related
- `purchases` - Purchase-related
- `payments` - Payment notifications
- `subscriptions` - Subscription updates
- `system` - System notifications
- `reviews` - Review notifications

**Priority Levels:**
- `low` - Low priority
- `normal` - Normal priority (default)
- `high` - High priority
- `urgent` - Urgent priority

**Admin Notification Types:**
- `payout_request` - Payout request submitted
- `user_signup` - New user registration
- `high_value_sale` - High-value transaction
- `suspicious_activity` - Suspicious activity detected
- `system_alert` - System alerts
- `payment_failed` - Payment failures

### Financial System
**Transaction Status:**
- `pending` - Transaction pending
- `completed` - Transaction completed
- `failed` - Transaction failed
- `refunded` - Transaction refunded

**Payout Status:**
- `pending` - Payout pending
- `approved` - Payout approved
- `processing` - Payout processing
- `completed` - Payout completed
- `rejected` - Payout rejected
- `cancelled` - Payout cancelled

---

## 💰 Financial & Payment System

### Commission Structure
**Default Commission:** 10% across all countries
**Platform Fee:** Configurable per order
**Currency Support:** Multi-currency (BGN, GBP, USD, EUR)

### Seller Balance System
- **Available Balance:** Ready for withdrawal
- **Pending Balance:** Pending clearance
- **Total Earned:** Lifetime earnings
- **Total Withdrawn:** Total withdrawals

### Boost Credits System
- **Monthly Credits:** Reset monthly
- **Premium Boosts:** Enhanced visibility
- **Credit Tracking:** Usage history maintained

---

## 🛠️ System Tables & Configurations

### Administrative Tables
- **admin_actions** - Admin activity logging
- **admin_notifications** - Admin-specific notifications
- **system_logs** - System-wide logging
- **manual_config_tasks** - Manual configuration tracking
- **auth_config_tasks** - Authentication configuration tasks

### Processing Queues
- **slug_processing_queue** - Product slug generation queue
- **product_slug_history** - Slug change history
- **username_history** - Username change history

### Analytics & Tracking
- **product_views** - Product view tracking
- **presence** - User online presence
- **boost_history** - Product boost history

### Content Moderation
- **drip_nominations** - Drip collection nominations
- **reviews** - User reviews and ratings

---

## 🔗 Key Relationships

### User Relationships
- **profiles** ↔ **followers** (many-to-many)
- **profiles** ↔ **badges** (one-to-many)
- **profiles** ↔ **brands** (one-to-one)

### Product Relationships
- **products** ↔ **categories** (many-to-one)
- **products** ↔ **brand_collections** (many-to-one)
- **products** ↔ **product_images** (one-to-many)

### Commerce Relationships
- **orders** ↔ **order_items** (one-to-many)
- **orders** ↔ **transactions** (one-to-many)
- **orders** ↔ **reviews** (one-to-many)

### Communication
- **messages** ↔ **products** (many-to-one)
- **messages** ↔ **orders** (many-to-one)

---

## 📈 Current Data Summary

### Live Counts (as of audit)
- **Categories:** 143 active
- **Products:** 42 listed
- **Orders:** 1 recorded
- **Messages:** 7 exchanges
- **Favorites:** 36 saved
- **Profiles:** 6 registered
- **Brand Collections:** 17 available
- **Subscription Plans:** 5 tiers
- **Country Configs:** 5 supported
- **Badges:** 1 type available

### Growth Areas
- **Categories:** Well-established hierarchy
- **Brand Collections:** Strong designer and streetwear coverage
- **User Base:** Early stage with growth potential
- **Product Inventory:** Building phase
- **Geographic Reach:** Multi-country foundation established

---

## 🔄 Recommended Next Steps

1. **Badge System Expansion:** Add more badge types for seller achievements
2. **Category Optimization:** Monitor category usage and optimize hierarchy
3. **Brand Collection Growth:** Add more popular brands based on demand
4. **Geographic Expansion:** Consider additional European markets
5. **Subscription Features:** Enhance pro/brand tier benefits
6. **Analytics Enhancement:** Implement detailed seller analytics
7. **Moderation Tools:** Expand content moderation capabilities

---

*This audit provides a complete snapshot of the Driplo database structure for iteration and review purposes.*