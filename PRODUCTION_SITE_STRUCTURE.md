# Driplo Production Site Structure

## 1. Top Banner
- **Purpose**: Promotional/notification banner
- **Components**:
  - "Виж всички →" (View all) link - redirects to /search
  - Close button (X icon)
- **Behavior**: Dismissible banner at the very top

## 2. Header/Navigation Bar
- **Logo**: "Driplo 👗" (links to home /)
- **Main Navigation**:
  - "Разгледай" (Browse) - links to /search
  - "Съобщения" (Messages) - links to /messages (auth only)
  - "Акаунт" (Account) - links to /dashboard (auth only)
- **Right Section**:
  - Language selector: "🇧🇬 Български" (dropdown)
  - Notifications bell icon (auth only)
  - User menu/avatar (auth only)
  - Login/Register buttons (non-auth only)

## 3. Hero Search Section
- **Search Bar**:
  - Search icon
  - Input field: "Търсете артикули, марки..." (Search items, brands...)
  - Categories button with icon (dropdown/modal trigger)
- **Category Pills** (below search):
  - "Всички" (All)
  - "Мъже" (Men)
  - "Жени" (Women)
  - "Деца" (Kids)

## 4. Promoted Products Carousel
- **Header**:
  - Label: "Промотирани" (Promoted)
  - Title: "Препоръчани продукти" (Recommended products)
  - Scroll indicator: "Скролвай" with arrow icon
- **Product Cards** (horizontal scroll):
  - Product image
  - Size badge (e.g., "T", "S", "M")
  - Price badge (e.g., "лв5.00")
  - Product title (below image)
- **Behavior**: Horizontal scrollable carousel

## 5. Main Product Grid
- **Product Cards** (grid layout):
  - **Image Section**:
    - Product image
    - Condition badge: "Нов" (New) or "Добър" (Good)
    - Favorite button (heart icon)
  - **Details Section**:
    - Gender category: "Мъже"/"Жени"/"Деца"
    - Product title (H3)
    - Meta info (separated by bullets):
      - Category (e.g., "Тениски", "Топове")
      - Brand (e.g., "Nike", "H&M")
      - Size (e.g., "Размер S")
    - Price (e.g., "лв5.00")
- **Load More**: "Разгледай всички артикули" button at bottom

## Key Observations

### Mobile/Responsive
- Site appears to be mobile-first or highly responsive
- Clean, minimal interface optimized for touch

### Authentication States
- **Logged Out**: Shows Login/Register buttons
- **Logged In**: Shows Messages, Account, Notifications, User menu

### Visual Hierarchy
1. Search is the primary action
2. Category filtering is secondary
3. Promoted products get special treatment
4. Main grid is the core content area

### Interaction Patterns
- Click on product cards to view details
- Favorite items directly from grid
- Quick category filtering via pills
- Horizontal scroll for promoted items

## Current Production Issues Found

### 1. Authentication Issues
- **Logout endpoint (`/logout`)**: Returns 303 redirect error and "FUNCTION_INVOCATION_FAILED"
- **Login functionality**: After submitting login form, returns 404 error page
- **Session detection**: Site appears to auto-login users (shows auth state without actual login)

### 2. Working Features
- **Promo banner**: "Виж всички →" link works correctly (redirects to /search)
- **Search page**: Loads properly with sidebar categories and product grid
- **Navigation**: Basic navigation between pages works

### 3. Non-functional Features
- **Google/GitHub OAuth**: Buttons are disabled
- **Login form submission**: Returns 404 error instead of processing login
- **Logout**: Endpoint fails with server error

## Technical Notes

### Routes Structure
```
/                   - Homepage (working)
/search             - Browse/search page (working)
/login              - Login page (UI works, form submission broken)
/logout             - Logout endpoint (broken - returns 303 error)
/signup             - Sign up page (exists)
/forgot-password    - Password reset (exists)
/messages           - Messages (auth required)
/dashboard          - User account (auth required)
/product/[id]       - Product detail page (assumed)
```

### Component Breakdown
1. **TopBanner** - Dismissible promotional banner
2. **Header** - Main navigation with auth state handling
3. **HeroSearch** - Search bar with category dropdown
4. **CategoryPills** - Quick filter buttons
5. **PromotedCarousel** - Horizontal scroll of featured items
6. **ProductCard** - Reusable card component
7. **ProductGrid** - Main grid container with load more

### State Management Needs
- Auth state (user logged in/out)
- Search/filter state
- Favorites state
- Language preference
- Banner dismissed state

### API Endpoints Needed
- GET /api/products - Main product listing
- GET /api/products/promoted - Featured products
- GET /api/categories - Category list
- POST /api/favorites - Toggle favorite
- GET /api/user - User data