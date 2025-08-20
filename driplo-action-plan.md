# Driplo Critical Issues & Action Plan

## 🚨 Critical Issues Found

### 1. Authentication Flow Broken
- **Issue**: Email verification redirects directly to app without onboarding
- **Impact**: Users skip critical profile setup, poor UX
- **Current**: Click verify → Auto sign-in → No onboarding
- **Expected**: Click verify → Success message → Sign in → Onboarding

### 2. Form UX Issues
- **No Active States**: Input fields lack focus/active borders
- **No Visual Feedback**: Missing borders on checkboxes, text fields
- **Poor Feedback Location**: Success messages appear inside forms instead of as notifications
- **Confusing State**: Users don't know where they're typing

### 3. Missing Notifications System
- **No success alerts** for critical actions
- **No error handling** for failed operations
- **Inline messages** instead of proper toast/modal notifications
- **Missing page-level** error states

## 📋 Immediate Actions (Priority Order)

### Phase 1: Fix Critical Auth Flow (TODAY)
1. **Email Verification Flow**
   - [ ] Add email verification success page/message
   - [ ] Redirect to sign-in with "Email verified successfully" toast
   - [ ] Force onboarding for new users after first sign-in
   - [ ] Add session flag for `needs_onboarding`

2. **Onboarding Implementation**
   - [ ] Create protected onboarding route
   - [ ] Block app access until onboarding complete
   - [ ] Multi-step form: Profile → Preferences → Welcome
   - [ ] Save onboarding completion to user profile

### Phase 2: Fix Form UX (TODAY)
1. **Input Field States**
   - [ ] Add focus states with brand color borders
   - [ ] Add hover states for all interactive elements
   - [ ] Add error states with red borders
   - [ ] Add success states with green checkmarks

2. **Form Feedback**
   - [ ] Remove ALL inline success messages
   - [ ] Implement toast notification system
   - [ ] Add loading states for form submissions
   - [ ] Add proper error messages below fields

### Phase 3: Global Notification System (TODAY)
1. **Toast Component**
   - [ ] Create reusable toast in @repo/ui
   - [ ] Support success/error/warning/info variants
   - [ ] Auto-dismiss with manual close option
   - [ ] Stack multiple notifications

2. **Integration Points**
   - [ ] Auth actions (login, signup, verify)
   - [ ] Product actions (list, edit, delete)
   - [ ] Purchase actions (buy, offer, message)
   - [ ] Profile actions (update, save)

## 🔧 Technical Implementation

### Auth Flow Fix
```typescript
// 1. Email verification callback
/routes/auth/callback/+page.svelte
- Check for email_verified param
- Show success toast
- Redirect to /auth/signin with message

// 2. Sign-in logic
/routes/auth/signin/+page.svelte
- Check if user.needs_onboarding
- Redirect to /onboarding if true
- Show "Welcome back" if false

// 3. Onboarding route
/routes/onboarding/+page.svelte
- Multi-step form
- Update profile.onboarded = true
- Redirect to dashboard
```

### Input Field Styles
```css
/* Base input styles */
.input {
  @apply border-gray-300 transition-all duration-200;
}

/* Focus state */
.input:focus {
  @apply border-primary-500 ring-2 ring-primary-100 outline-none;
}

/* Error state */
.input.error {
  @apply border-red-500 ring-2 ring-red-100;
}
```

### Toast Implementation
```typescript
// stores/notifications.ts
const notifications = writable([]);

export function showToast(message, type = 'info') {
  notifications.update(n => [...n, { message, type, id: Date.now() }]);
}

// Usage
showToast('Email verified successfully!', 'success');
showToast('Failed to create listing', 'error');
```

## 📊 Success Metrics
- [ ] User can complete full auth flow without confusion
- [ ] All forms have clear visual feedback
- [ ] Every action shows appropriate notification
- [ ] Zero dead-end pages
- [ ] Onboarding completion rate > 90%

## 🚀 Execution Timeline
- **Hour 1-2**: Fix email verification flow
- **Hour 2-3**: Implement onboarding pages
- **Hour 3-4**: Add input field states
- **Hour 4-5**: Create notification system
- **Hour 5-6**: Integration and testing

## 🎯 Definition of Done
- [ ] Can sign up → verify email → see success → sign in → complete onboarding
- [ ] All input fields have focus/hover/error states
- [ ] All actions show toast notifications
- [ ] No inline form success messages
- [ ] Full auth flow tested end-to-end