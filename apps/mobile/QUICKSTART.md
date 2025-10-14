# Quick Start Guide - Driplo Mobile App

## 🚀 Getting Started

### Prerequisites
- Node.js 20.19.x
- pnpm 9.x
- iOS Simulator (Mac) or Android Emulator
- Expo Go app (optional, for testing)

### Step 1: Install Dependencies

```bash
# From repository root
cd K:\driplo-turbo-1

# Install all dependencies
pnpm install

# If you encounter errors, you may need to delete node_modules first:
# Remove-Item -Recurse -Force node_modules, apps\mobile\node_modules
# Then run pnpm install again
```

### Step 2: Configure Environment

```bash
# Navigate to mobile app
cd apps\mobile

# Copy environment template
copy .env.example .env

# Edit .env and add your Supabase credentials:
# EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Step 3: Start Development

```powershell
# Start Expo dev server
cd apps\mobile
pnpm start

# In a new terminal, you can run:
pnpm ios      # Launch iOS simulator
pnpm android  # Launch Android emulator
pnpm web      # Open in browser (limited functionality)
```

## 📱 Testing the App

### Authentication Flow
1. App opens → Login screen
2. Click "Sign Up" → Signup screen
3. Enter credentials and create account
4. Verify email (check Supabase dashboard)
5. Login with credentials

### Current Features ✅
- Login screen with email/password
- Signup screen with validation
- OAuth buttons (Apple, Google) - needs configuration
- Form validation
- Loading states
- Navigation between auth screens

## 🔧 Troubleshooting

### Module Resolution Errors
If you see "Cannot find module '@supabase/supabase-js'":
```bash
cd apps\mobile
pnpm install
```

### Metro Bundler Errors
```bash
# Clear cache
pnpm start --clear

# Reset project
npx expo start --clear
```

### TypeScript Errors
```bash
# Generate route types
npx expo customize tsconfig.json

# Run type check
pnpm type-check
```

## 📚 Project Structure

```
apps/mobile/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Auth screens (login, signup)
│   ├── (tabs)/            # Main app tabs
│   └── _layout.tsx        # Root layout with providers
├── lib/                   # Utilities (Supabase client)
├── contexts/              # React contexts
└── components/            # UI components

packages/mobile-shared/
└── src/
    ├── components/        # Shared Button, Input components
    ├── providers/         # AuthProvider
    ├── lib/              # Supabase client
    └── hooks/            # Custom React hooks
```

## 🎯 Next Steps

1. **Complete Auth**: Add forgot password screen
2. **Protected Routes**: Add auth guards
3. **Product Listing**: Create home feed
4. **Product Detail**: View product page
5. **Create Listing**: Upload photos, form
6. **Chat**: Real-time messaging
7. **Profile**: User profile & settings

## 🔐 Supabase Setup

### Required Tables
The app expects these tables in your Supabase database:
- `profiles` - User profiles
- `products` - Product listings
- `product_images` - Product photos
- `favorites` - User favorites
- `conversations` - Chat conversations
- `messages` - Chat messages
- `orders` - Purchase orders

### Required Storage Buckets
- `avatars` - User profile pictures
- `product-images` - Product photos

### Row Level Security (RLS)
Make sure RLS policies are enabled on all tables!

## 📞 Support

See `MOBILE_IMPLEMENTATION_STATUS.md` for detailed progress and architecture.

---

**Happy Coding! 🎉**
