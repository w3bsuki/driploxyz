# Driplo Mobile App �

A C2C (consumer-to-consumer) marketplace mobile app built with React Native and Expo, powered by Supabase.

## 🚀 Quick Start

### Prerequisites
- Node.js 20.19.x
- pnpm 9.x
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# From repository root
cd K:\driplo-turbo-1
pnpm install

# Configure environment
cd apps\mobile
copy .env.example .env
# Edit .env with your Supabase credentials
```

### Development

```bash
# Start development server
pnpm start

# Run on specific platform
pnpm ios      # iOS simulator
pnpm android  # Android emulator
pnpm web      # Web browser (limited)
```

See [QUICKSTART.md](./QUICKSTART.md) for detailed setup instructions.

## 📋 Project Status

**Foundation Complete** ✅
- Supabase integration with AsyncStorage
- Authentication system (login, signup)
- UI components (Button, Input)
- Navigation structure
- State management (TanStack Query, Zustand)

**In Progress** 🚧
- Protected routes
- Product listings
- Messaging
- Profile management

See [MOBILE_APP_BUILD_SUMMARY.md](../../MOBILE_APP_BUILD_SUMMARY.md) for full status.

## 🏗️ Tech Stack

- **Framework**: React Native 0.82 (New Architecture)
- **Platform**: Expo SDK 54
- **Backend**: Supabase (Auth, Database, Storage, Realtime)
- **State Management**: TanStack Query v5, Zustand v5
- **Forms**: React Hook Form + Zod
- **Navigation**: Expo Router v6 (file-based)
- **Styling**: NativeWind v4 (Tailwind for RN)
- **Language**: TypeScript 5.x

## 📁 Structure

```
app/
├── (auth)/          # Authentication screens
│   ├── login.tsx
│   ├── signup.tsx
│   └── forgot-password.tsx
├── (tabs)/          # Main app tabs
│   ├── index.tsx    # Home/Feed
│   ├── search.tsx
│   ├── create.tsx
│   ├── messages.tsx
│   └── profile.tsx
└── _layout.tsx      # Root layout with providers
```

## 🎯 Features

### Current Features ✅
- User authentication (email/password)
- OAuth setup (Google, Apple)
- Form validation
- Responsive design
- Dark mode ready

### Planned Features 📋
- Product listings and search
- Real-time chat
- Image uploads
- Push notifications
- Payment integration
- User profiles

## 🔐 Environment Variables

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 📱 Supported Platforms

- ✅ iOS 13.4+
- ✅ Android 6.0+
- ⚠️ Web (limited React Native Web support)

## 🧪 Development Commands

```bash
pnpm start           # Start dev server
pnpm ios            # Run iOS simulator
pnpm android        # Run Android emulator
pnpm lint           # Lint code
pnpm type-check     # TypeScript check
pnpm build          # Build for production
```

## 📚 Documentation

- [Quick Start Guide](./QUICKSTART.md)
- [Build Summary](../../MOBILE_APP_BUILD_SUMMARY.md)
- [Implementation Status](../../MOBILE_IMPLEMENTATION_STATUS.md)
- [Architecture Plan](../../MOBILE_APP_ARCHITECTURE_PLAN.md)
- [App Requirements](../../app.md)

## 🔗 Related Packages

- `@repo/mobile-shared` - Shared mobile components and utilities
- `@repo/database` - Supabase type definitions
- `@repo/i18n` - Internationalization

## 🐛 Known Issues

1. Some TypeScript prop types need refinement
2. OAuth callbacks need deep linking setup
3. Protected routes not yet implemented

See issues in [MOBILE_APP_BUILD_SUMMARY.md](../../MOBILE_APP_BUILD_SUMMARY.md)

## 🤝 Contributing

This is part of the Driplo monorepo. See the main [CONTRIBUTING.md](../../docs/CONTRIBUTING.md) for guidelines.

## 📄 License

See repository root for license information.

---

**Built with React Native 0.82 + Expo SDK 54 + Supabase**