# Driplo - Product Requirements Document

## Executive Summary
Driplo is a consumer-to-consumer clothing marketplace that enables users to buy and sell pre-owned and new clothing items. The platform focuses on a clean, minimal user experience similar to Vinted, with robust search, secure transactions, and community features.

## Target Users

### Primary Users
- **Sellers**: Individuals looking to declutter wardrobes and earn money from unused clothing
- **Buyers**: Fashion-conscious consumers seeking affordable, unique, or designer items

### User Personas
1. **The Conscious Seller** (25-35, female, urban)
   - Environmentally conscious
   - Values decluttering and earning extra income
   - Active on social media

2. **The Bargain Hunter** (18-30, all genders)
   - Budget-conscious
   - Enjoys discovering unique pieces
   - Values authentic vintage/designer items

3. **The Fashion Enthusiast** (20-40, all genders)
   - Follows fashion trends
   - Seeks rare or limited edition items
   - Willing to pay premium for quality

## Core Features

### 1. User Authentication & Profiles
**Priority**: P0 (Must Have)

#### User Stories
- As a new user, I want to sign up quickly with email or social media
- As a user, I want to create a detailed profile with photos and bio
- As a buyer, I want to see seller ratings and verification status
- As a seller, I want to showcase my style and build trust

#### Acceptance Criteria
- Email/password and social login (Google, Facebook)
- Profile photos, bio, location, verification badges
- Seller/buyer ratings and review history
- Account verification through phone/email

#### Frontend Requirements
- Signup/login forms with validation
- Profile creation wizard
- Profile display pages with ratings
- Verification status indicators

### 2. Product Listings & Management
**Priority**: P0 (Must Have)

#### User Stories
- As a seller, I want to list items with multiple photos and detailed descriptions
- As a seller, I want to categorize items by type, brand, size, condition
- As a seller, I want to set prices and manage inventory
- As a buyer, I want to see high-quality photos and accurate descriptions

#### Acceptance Criteria
- Support for 8+ product photos per listing
- Categories: Women's, Men's, Kids', Accessories, Shoes
- Size charts and condition indicators (New, Like New, Good, Fair)
- Brand selection with autocomplete
- Price setting with suggested pricing

#### Frontend Requirements
- Multi-step listing creation form
- Image upload with drag-and-drop
- Category/brand selection components
- Size and condition selectors
- Price input with validation

### 3. Homepage & Product Discovery
**Priority**: P0 (Must Have)

#### User Stories
- As a visitor, I want to see featured and trending items immediately
- As a user, I want to browse products by category
- As a buyer, I want to see personalized recommendations
- As a user, I want to access search quickly from anywhere

#### Acceptance Criteria
- Clean, minimal homepage design
- Horizontal scroll for featured/premium listings
- Product grid with infinite scroll
- Quick category access
- Search bar prominently displayed

#### Frontend Requirements
- Hero section with featured products carousel
- Responsive product grid (3+ columns desktop, 2 mobile)
- Category pills/filters
- Search bar component with autocomplete
- Loading states and skeleton screens

### 4. Search & Filtering
**Priority**: P0 (Must Have)

#### User Stories
- As a buyer, I want to search by keywords, brand, category
- As a buyer, I want to filter by size, price range, condition, location
- As a buyer, I want to save searches and get notifications
- As a buyer, I want to sort results by relevance, price, date

#### Acceptance Criteria
- Full-text search across titles, descriptions, brands
- Advanced filters: price range, size, condition, location radius
- Sort options: newest, price (low/high), relevance, popularity
- Search result count and clear active filters

#### Frontend Requirements
- Search input with suggestions
- Filter sidebar/modal with multi-select options
- Sort dropdown component
- Search results grid with pagination
- Filter tags showing active selections

### 5. Product Detail Pages
**Priority**: P0 (Must Have)

#### User Stories
- As a buyer, I want to see detailed product information and photos
- As a buyer, I want to view seller information and ratings
- As a buyer, I want to contact sellers directly
- As a buyer, I want to save items for later

#### Acceptance Criteria
- Image gallery with zoom functionality
- Complete product details (size, brand, condition, measurements)
- Seller profile card with ratings
- Direct messaging button
- Add to favorites functionality
- Related/similar items suggestions

#### Frontend Requirements
- Image carousel/gallery component
- Product info cards
- Seller profile component
- Message button with modal
- Favorite heart icon with animation
- Related products grid

### 6. Messaging System
**Priority**: P1 (Should Have)

#### User Stories
- As a buyer, I want to ask questions about products
- As participants, I want real-time messaging
- As users, I want to share photos in messages
- As users, I want to see message history organized by conversation

#### Acceptance Criteria
- Real-time messaging between buyers and sellers
- Photo sharing in conversations
- Message status indicators (sent, delivered, read)
- Conversation threads organized by product/user

#### Frontend Requirements
- Chat interface with message bubbles
- Photo upload in messages
- Real-time message updates
- Conversation list with previews
- Notification badges

### 7. User Dashboard
**Priority**: P1 (Should Have)

#### User Stories
- As a seller, I want to manage my listings and sales
- As a buyer, I want to track purchases and messages
- As a user, I want to see my activity and statistics
- As a user, I want to manage account settings

#### Acceptance Criteria
- Separate views for buying and selling activities
- Order/sale status tracking
- Message management center
- Profile and account settings
- Sales/purchase history

#### Frontend Requirements
- Tabbed dashboard interface
- Order status cards
- Settings forms with validation
- Activity timeline component
- Statistics cards/charts

### 8. Reviews & Ratings
**Priority**: P1 (Should Have)

#### User Stories
- As a buyer, I want to rate sellers and products after purchase
- As a seller, I want to rate buyers for smooth transactions
- As users, I want to see authentic reviews before transacting
- As users, I want to respond to reviews

#### Acceptance Criteria
- 5-star rating system for users and products
- Written reviews with photos
- Review verification (only after completed transaction)
- Public review display on profiles and products

#### Frontend Requirements
- Star rating component
- Review form with photo upload
- Review display cards
- Rating summaries and averages
- Response/reply interface

## Technical Specifications

### Frontend Architecture
- **Framework**: Svelte 5 + SvelteKit 2
- **Styling**: TailwindCSS with custom design system
- **State Management**: Svelte stores + runes
- **Routing**: SvelteKit file-based routing
- **Image Optimization**: Supabase Storage + CDN

### Design System
```css
/* Color Palette */
Primary: #1e40af (Blue)
Secondary: #64748b (Slate)
Accent: #f59e0b (Amber)
Success: #10b981 (Emerald)
Error: #ef4444 (Red)
Background: #f8fafc (Slate-50)
```

### Component Library Structure
```
packages/ui/src/
├── components/
│   ├── Button.svelte          # Primary, secondary, ghost variants
│   ├── Card.svelte            # Product cards, info cards
│   ├── Input.svelte           # Form inputs with validation
│   ├── Modal.svelte           # Reusable modal component
│   ├── ImageGallery.svelte    # Product image carousel
│   ├── ProductCard.svelte     # Product listing card
│   ├── SearchBar.svelte       # Search with autocomplete
│   ├── FilterSidebar.svelte   # Advanced filtering
│   ├── UserProfile.svelte     # User profile display
│   └── MessageThread.svelte   # Chat interface
├── icons/                     # SVG icon components
├── types/                     # TypeScript interfaces
└── utils/                     # Shared utilities
```

### Page Structure
```
apps/web/src/routes/
├── +layout.svelte             # Main app layout
├── +page.svelte               # Homepage
├── search/
│   └── +page.svelte           # Search results
├── product/
│   └── [id]/
│       └── +page.svelte       # Product detail
├── profile/
│   └── [username]/
│       └── +page.svelte       # User profile
├── dashboard/
│   ├── +layout.svelte         # Dashboard layout
│   ├── +page.svelte           # Dashboard home
│   ├── selling/
│   │   └── +page.svelte       # Seller dashboard
│   └── buying/
│       └── +page.svelte       # Buyer dashboard
├── messages/
│   ├── +page.svelte           # Message list
│   └── [id]/
│       └── +page.svelte       # Conversation view
└── (auth)/                    # Auth group
    ├── login/
    │   └── +page.svelte       # Login page
    └── signup/
        └── +page.svelte       # Signup page
```

## User Experience Flow

### New User Onboarding
1. Landing page → Sign up → Profile creation → Browse/List first item
2. Email verification → Phone verification (optional) → Complete profile

### Buying Flow
1. Browse/Search → Product detail → Contact seller → Purchase → Review
2. Save favorites → Compare items → Make offer → Complete transaction

### Selling Flow
1. List item → Add photos/details → Set price → Manage messages → Ship item → Get paid
2. Inventory management → Sales analytics → Customer service

## Success Metrics

### User Engagement
- Daily/Monthly active users
- Average session duration
- Product listing completion rate
- Message response rate

### Business Metrics
- Gross Merchandise Value (GMV)
- Take rate (commission percentage)
- Customer acquisition cost
- Seller retention rate

### Technical Metrics
- Page load speeds (<2s)
- Search result relevance
- Image optimization (WebP/AVIF)
- Mobile responsiveness score

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
- [ ] Documentation and setup
- [ ] Basic UI components
- [ ] Homepage layout
- [ ] Product grid
- [ ] Search interface

### Phase 2: Core Features (Weeks 3-4)
- [ ] Product detail pages
- [ ] User profiles
- [ ] Basic messaging
- [ ] Dashboard structure

### Phase 3: Advanced Features (Weeks 5-6)
- [ ] Backend integration
- [ ] Authentication system
- [ ] Real-time messaging
- [ ] Reviews and ratings

### Phase 4: Polish & Testing (Weeks 7-8)
- [ ] Performance optimization
- [ ] E2E testing
- [ ] SEO optimization
- [ ] Mobile responsiveness

## Risk Mitigation

### Technical Risks
- **Complex state management**: Use proven Svelte patterns and stores
- **Image optimization**: Implement progressive loading and WebP support
- **Mobile performance**: Regular testing on real devices

### User Experience Risks
- **Search relevance**: Implement comprehensive filtering and sorting
- **Trust & safety**: Clear verification badges and review system
- **Mobile usability**: Mobile-first design approach

## Future Enhancements

### Version 2.0 Features
- Video product previews
- AI-powered style recommendations
- Social features (follow sellers, style boards)
- Advanced analytics for sellers
- International shipping support
- Mobile app (React Native/Flutter)