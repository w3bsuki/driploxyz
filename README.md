# Driplo - C2C Clothing Marketplace - Deploy Test

A modern consumer-to-consumer clothing marketplace built with Svelte 5 and SvelteKit 2. Driplo enables users to buy and sell pre-owned and new clothing items in a clean, minimal interface similar to Vinted.

## Features

- 🛍️ **Buy & Sell Clothing** - Easy listing creation and purchasing
- 🔍 **Advanced Search** - Filter by brand, size, price, condition, location
- 💬 **Real-time Messaging** - Direct communication between buyers and sellers
- ⭐ **Reviews & Ratings** - Build trust through user feedback
- 📱 **Mobile-First Design** - Optimized for all devices
- 🔒 **Secure Transactions** - Safe payment processing
- 🖼️ **Image Optimization** - Fast loading, high-quality product photos

## Tech Stack

### Frontend
- **Svelte 5** - Modern reactive framework with runes
- **SvelteKit 2** - Full-stack framework with SSR/SSG
- **TypeScript** - Type safety throughout
- **TailwindCSS** - Utility-first styling
- **Vite** - Fast development and building

### Backend
- **Supabase** - PostgreSQL database and authentication
- **Supabase Storage** - Image storage and optimization
- **Stripe** - Payment processing
- **Edge Functions** - Serverless API endpoints

### Monorepo Structure
- `apps/web` - Main marketplace application
- `apps/docs` - Admin dashboard and seller tools
- `packages/ui` - Shared component library
- `packages/database` - Supabase types and utilities

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd driplo-turbo

# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

### Environment Setup

Create `.env.local` files in the app directories:

```bash
# apps/web/.env.local
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

## Development

### Available Scripts

```bash
# Development
pnpm dev              # Start all development servers
pnpm dev --filter web # Start only web app

# Building
pnpm build            # Build all packages and apps
pnpm build --filter ui # Build only UI package

# Testing
pnpm test             # Run all tests
pnpm test:unit        # Run unit tests
pnpm test:integration # Run integration tests

# Code Quality
pnpm lint             # Lint all code
pnpm check-types      # Type check all code
pnpm format           # Format code with Prettier
```

### Project Structure

```
driplo-turbo/
├── apps/
│   ├── web/                 # Main marketplace app
│   │   ├── src/
│   │   │   ├── routes/      # SvelteKit pages
│   │   │   ├── lib/         # Utilities and stores
│   │   │   └── app.html     # App template
│   │   └── static/          # Static assets
│   └── docs/                # Admin dashboard
├── packages/
│   ├── ui/                  # Shared components
│   │   ├── src/
│   │   │   ├── components/  # Reusable components
│   │   │   ├── types/       # TypeScript types
│   │   │   └── utils/       # Shared utilities
│   ├── eslint-config/       # ESLint configuration
│   └── typescript-config/   # TypeScript configuration
└── docs/
    ├── CLAUDE.md           # Development guidelines
    └── PRD.md              # Product requirements
```

## Key Features Implementation

### User Authentication
- Email/password and social login
- Profile creation with verification
- Seller/buyer rating system

### Product Listings
- Multi-photo upload with optimization
- Category and brand selection
- Size charts and condition indicators
- Pricing suggestions

### Search & Discovery
- Full-text search with autocomplete
- Advanced filtering (price, size, condition, location)
- Personalized recommendations
- Featured product carousel

### Messaging System
- Real-time chat between users
- Photo sharing in conversations
- Message history and notifications

### Reviews & Ratings
- Post-transaction review system
- Photo reviews for products
- Seller verification badges

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Documentation

- [Development Guidelines](./CLAUDE.md) - Complete development setup and patterns
- [Product Requirements](./PRD.md) - Detailed feature specifications
- [Component Library](./packages/ui/README.md) - UI component documentation

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
