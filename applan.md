# Project Plan: Driplo Mobile App

This document outlines the plan for creating a new mobile application within the Driplo Turborepo.

## 1. Overview

The project is to build a native mobile companion app for the Driplo platform. It will allow existing users to access their data on the go. The application will be built using React Native with Expo, ensuring a modern, cross-platform experience for both iOS and Android. It will be integrated into the existing pnpm workspace and managed by Turborepo.

## 2. Product Requirements Document (PRD)

### Target Audience
Existing users of the Driplo web application who need mobile access to their data.

### Core Features (MVP)
- **User Authentication:** Secure login and logout functionality connecting to the existing Supabase authentication backend. Session persistence will be included.
- **Dashboard View:** A summary screen displaying key metrics and recent activity.
- **Data Listing:** A screen to list the primary data entities from the database (e.g., "Projects", "Items").
- **Data Viewing:** A read-only detail view for a selected data entity.
- **Settings:** A basic settings screen with options to log out and view the app version.

### Out of Scope for MVP
- Data creation, editing, or deletion.
- Push notifications.
- Offline mode or local caching.
- Tablet-specific layouts.
- Onboarding/Sign-up for new users.

## 3. Technical Specification

- **Frontend Framework:** React Native with Expo
- **Language:** TypeScript
- **Backend Integration:** Supabase via the `supabase-js` client library.
- **UI Component Library:** React Native Paper for a consistent Material Design look and feel.
- **Navigation:** React Navigation for all routing and screen transitions.
- **State Management:** React Context API for managing global state like authentication.
- **Monorepo Tooling:**
    - **Package Manager:** pnpm (utilizing the existing workspace)
    - **Build System:** Turborepo
    - **Code Quality:** ESLint and Prettier, inheriting from the root configuration.

## 4. Execution Tasklist

### Phase 1: Scaffolding & Setup
- [ ] Create `apps/mobile` directory.
- [ ] Initialize Expo app using `npx create-expo-app apps/mobile --template` with a TypeScript template.
- [ ] Configure `metro.config.js` and `babel.config.js` for pnpm monorepo support to resolve workspace dependencies.
- [ ] Update root `package.json` workspace configuration if necessary.
- [ ] Update root `turbo.json` to include the new `mobile` app's `dev` and `build` scripts in the pipeline.
- [ ] Add core dependencies: `@supabase/supabase-js`, `@react-navigation/native`, `react-native-screens`, `react-native-safe-area-context`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`, `react-native-paper`.

### Phase 2: Authentication
- [ ] Set up environment variable handling for Supabase URL and anon key (e.g., using `expo-constants`).
- [ ] Create a Supabase client singleton to be used across the app.
- [ ] Create a `useAuth` hook and `AuthProvider` context to manage user session.
- [ ] Implement the main navigator to switch between authentication flow (Login screen) and the main app flow (Tabs).
- [ ] Build the UI for the Login screen.

### Phase 3: Core Features
- [ ] Implement a bottom tab navigator for the main app interface (e.g., Dashboard, Projects, Settings).
- [ ] Build the Dashboard screen UI with static/placeholder components.
- [ ] Build the "Projects" list screen, fetching and displaying read-only data from Supabase.
- [ ] Implement loading and error states for the data fetching process.
- [ ] Build the "Project Detail" screen, passing an ID and fetching detailed data.
- [ ] Build the Settings screen with a "Logout" button and app version display.

### Phase 4: Polish & Verification
- [ ] Apply a consistent theme using `PaperProvider` from React Native Paper.
- [ ] Ensure all screens are responsive and display correctly on different device sizes.
- [ ] Conduct manual testing of the authentication flow and data display.
- [ ] Run `eslint` and `tsc` to ensure code quality and type safety.
- [ ] Document the setup and run instructions in the `apps/mobile/README.md`.
