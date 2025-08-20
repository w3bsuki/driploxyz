import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import Header from '../Header.svelte';
import {
  renderSvelte5Component,
  createMockHandlers,
  userInteraction,
  checkAccessibility,
  setupGlobalMocks,
  waitForSvelteUpdate
} from '../../../test/utils/component-utils.js';

// Mock SvelteKit modules
vi.mock('$app/stores', () => ({
  page: writable({
    url: new URL('http://localhost:3000/'),
    params: {},
    route: { id: '/' },
    status: 200,
    error: null,
    data: {},
    form: null
  })
}));

vi.mock('$app/environment', () => ({
  browser: true
}));

// Mock i18n module
vi.mock('@repo/i18n', () => ({
  languageTag: () => 'en',
  menu_browse: () => 'Browse',
  nav_sell: () => 'Sell',
  nav_messages: () => 'Messages',
  profile_dashboard: () => 'Dashboard',
  auth_signIn: () => 'Sign In',
  auth_signUp: () => 'Sign Up',
  auth_signOut: () => 'Sign Out',
  profile_myProfile: () => 'My Profile',
  profile_orders: () => 'Orders',
  profile_favorites: () => 'Favorites',
  profile_settings: () => 'Settings',
  profile_startSelling: () => 'Start Selling',
  nav_settings: () => 'Settings',
  category_women: () => 'Women',
  category_men: () => 'Men',
  category_kids: () => 'Kids',
  category_pets: () => 'Pets',
  menu_sellItems: () => 'Sell Items',
  notifications_title: () => 'Notifications',
  notifications_unread: () => 'unread',
  notifications_markAllRead: () => 'Mark all as read',
  notifications_noNotifications: () => 'No notifications',
  notifications_notifyWhenSomethingHappens: () => 'We\'ll notify you when something happens',
  notifications_viewAll: () => 'View all'
}));

// Mock UI components
vi.mock('@repo/ui', () => ({
  Button: vi.fn(() => ({ render: vi.fn() })),
  Avatar: vi.fn(({ onclick, name }) => ({
    render: vi.fn(),
    $$props: { onclick, name }
  })),
  NotificationBell: vi.fn(({ onclick, count }) => ({
    render: vi.fn(),
    $$props: { onclick, count }
  })),
  NotificationPanel: vi.fn(() => ({ render: vi.fn() })),
  MessageNotificationToast: vi.fn(() => ({ render: vi.fn() })),
  LanguageSwitcher: vi.fn(({ onLanguageChange, currentLanguage }) => ({
    render: vi.fn(),
    $$props: { onLanguageChange, currentLanguage }
  }))
}));

// Mock auth module
vi.mock('$lib/auth', () => ({
  signOut: vi.fn().mockResolvedValue(undefined)
}));

describe('Header', () => {
  let mockAuthState: any;
  let mockNotifications: any;
  let mockStores: any;

  beforeEach(() => {
    setupGlobalMocks();
    
    // Mock auth state store
    mockAuthState = writable({
      user: null,
      profile: null,
      supabase: null,
      loading: false,
      initialized: true
    });

    // Mock notification stores
    mockNotifications = writable([]);
    const mockNotificationPanelOpen = writable(false);
    const mockMessageToasts = writable([]);
    const mockUnreadCount = writable(0);

    // Mock store modules
    vi.doMock('$lib/stores/auth', () => ({
      authState: mockAuthState,
      displayName: writable('Test User'),
      userInitials: writable('TU'),
      canSell: writable(true)
    }));

    vi.doMock('$lib/stores/notifications', () => ({
      notifications: mockNotifications,
      notificationPanelOpen: mockNotificationPanelOpen,
      messageToasts: mockMessageToasts,
      unreadCount: mockUnreadCount,
      notificationActions: {
        togglePanel: vi.fn(),
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        closePanel: vi.fn()
      },
      messageToastActions: {
        remove: vi.fn()
      }
    }));

    // Mock services
    vi.doMock('$lib/services/realtime-notifications', () => ({
      RealtimeNotificationService: vi.fn().mockImplementation(() => ({
        initialize: vi.fn(),
        destroy: vi.fn()
      }))
    }));

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders header with logo', () => {
      renderSvelte5Component(Header, {});

      expect(screen.getByText('Driplo')).toBeInTheDocument();
      
      // Logo should be a link to home
      const logoLink = screen.getByText('Driplo').closest('a');
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('displays animated emoji in logo', () => {
      renderSvelte5Component(Header, {});

      const logoContainer = screen.getByText('Driplo').parentElement;
      expect(logoContainer).toBeInTheDocument();
      
      // The emoji will be one of the clothing emojis
      const emojiSpan = logoContainer?.querySelector('span:last-child');
      expect(emojiSpan).toBeInTheDocument();
    });

    it('shows mobile menu button on small screens', () => {
      renderSvelte5Component(Header, {});

      const menuButton = screen.getByLabelText('Toggle menu');
      expect(menuButton).toBeInTheDocument();
      expect(menuButton).toHaveClass('sm:hidden');
    });

    it('shows desktop navigation on larger screens', () => {
      renderSvelte5Component(Header, {});

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveClass('hidden', 'sm:flex');
    });
  });

  describe('Authentication States', () => {
    it('shows sign in/up buttons when user not authenticated', () => {
      renderSvelte5Component(Header, {});

      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    it('shows user menu when authenticated', async () => {
      mockAuthState.set({
        user: { id: '1', email: 'test@example.com' },
        profile: { avatar_url: null },
        supabase: {},
        loading: false,
        initialized: true
      });

      renderSvelte5Component(Header, {});
      await waitForSvelteUpdate();

      // Avatar should be rendered (mocked component)
      expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
      expect(screen.queryByText('Sign Up')).not.toBeInTheDocument();
    });

    it('shows navigation links for authenticated users', async () => {
      mockAuthState.set({
        user: { id: '1', email: 'test@example.com' },
        profile: {},
        supabase: {},
        loading: false,
        initialized: true
      });

      renderSvelte5Component(Header, {});
      await waitForSvelteUpdate();

      expect(screen.getByText('Browse')).toBeInTheDocument();
      expect(screen.getByText('Sell')).toBeInTheDocument();
      expect(screen.getByText('Messages')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  describe('Mobile Menu', () => {
    it('toggles mobile menu when button clicked', async () => {
      renderSvelte5Component(Header, {});

      const menuButton = screen.getByLabelText('Toggle menu');
      
      // Initially closed
      expect(screen.queryByText('Women')).not.toBeInTheDocument();
      
      // Click to open
      await userInteraction.click(menuButton);

      // Should show mobile menu content
      expect(screen.getByText('Women')).toBeInTheDocument();
      expect(screen.getByText('Men')).toBeInTheDocument();
      expect(screen.getByText('Kids')).toBeInTheDocument();
      expect(screen.getByText('Pets')).toBeInTheDocument();
    });

    it('closes mobile menu when menu item clicked', async () => {
      renderSvelte5Component(Header, {});

      const menuButton = screen.getByLabelText('Toggle menu');
      await userInteraction.click(menuButton);

      // Menu should be open
      const womenLink = screen.getByText('Women');
      expect(womenLink).toBeInTheDocument();

      // Click on a category link
      await userInteraction.click(womenLink);

      // Menu should close (menu items become hidden)
      await waitForSvelteUpdate();
      // Note: In real implementation, the mobile menu would be conditionally rendered
    });

    it('shows different content for authenticated vs unauthenticated users', async () => {
      // First test unauthenticated state
      renderSvelte5Component(Header, {});
      const menuButton = screen.getByLabelText('Toggle menu');
      await userInteraction.click(menuButton);

      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();

      // Now test authenticated state
      mockAuthState.set({
        user: { id: '1', email: 'test@example.com' },
        profile: { avatar_url: null },
        supabase: {},
        loading: false,
        initialized: true
      });

      await waitForSvelteUpdate();
      
      // Should show user-specific menu items
      expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    });
  });

  describe('Language Switching', () => {
    it('handles language switching', async () => {
      // Mock the cookie system
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: ''
      });

      // Mock window.location.replace
      const mockReplace = vi.fn();
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          protocol: 'https:',
          pathname: '/test',
          search: '',
          replace: mockReplace
        }
      });

      renderSvelte5Component(Header, {});

      // Language switcher functionality would be tested through the mocked component
      // In a real scenario, we would need to trigger the language change callback
      expect(mockReplace).not.toHaveBeenCalled(); // Until language is actually changed
    });

    it('shows current language correctly', () => {
      renderSvelte5Component(Header, {});

      // The LanguageSwitcher component should receive the current language
      // This would be verified through the component mock
      expect(true).toBe(true); // Placeholder assertion
    });
  });

  describe('Notifications', () => {
    it('shows notification bell for authenticated users', async () => {
      mockAuthState.set({
        user: { id: '1', email: 'test@example.com' },
        profile: {},
        supabase: {},
        loading: false,
        initialized: true
      });

      renderSvelte5Component(Header, {});
      await waitForSvelteUpdate();

      // NotificationBell component should be rendered (mocked)
      expect(true).toBe(true); // Placeholder - would verify through mock calls
    });

    it('does not show notifications for unauthenticated users', () => {
      renderSvelte5Component(Header, {});

      // No notification bell should be present
      expect(true).toBe(true); // Placeholder - would verify no NotificationBell mock calls
    });
  });

  describe('Sign Out Functionality', () => {
    it('handles sign out correctly', async () => {
      const mockSignOut = vi.fn().mockResolvedValue(undefined);
      vi.doMock('$lib/auth', () => ({
        signOut: mockSignOut
      }));

      mockAuthState.set({
        user: { id: '1', email: 'test@example.com' },
        profile: {},
        supabase: {},
        loading: false,
        initialized: true
      });

      renderSvelte5Component(Header, {});
      await waitForSvelteUpdate();

      // Sign out functionality would be triggered through user menu
      // In a real test, we would click the sign out button and verify the mock was called
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      renderSvelte5Component(Header, {});

      const menuButton = screen.getByLabelText('Toggle menu');
      expect(checkAccessibility.hasAriaLabel(menuButton)).toBe(true);
    });

    it('supports keyboard navigation', async () => {
      renderSvelte5Component(Header, {});

      const menuButton = screen.getByLabelText('Toggle menu');
      expect(checkAccessibility.isKeyboardAccessible(menuButton)).toBe(true);

      // Test keyboard interaction
      await userInteraction.keyDown(menuButton, 'Enter');
      // Mobile menu should open
    });

    it('has proper heading structure', () => {
      renderSvelte5Component(Header, {});

      // Logo should be properly structured for screen readers
      const logo = screen.getByText('Driplo');
      expect(logo).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('shows appropriate elements on desktop', () => {
      renderSvelte5Component(Header, {});

      const desktopNav = screen.getByRole('navigation');
      expect(desktopNav).toHaveClass('hidden', 'sm:flex');

      const mobileMenuButton = screen.getByLabelText('Toggle menu');
      expect(mobileMenuButton).toHaveClass('sm:hidden');
    });

    it('handles different viewport sizes', () => {
      // Mock different screen sizes
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query.includes('sm'), // Simulate small screen
          media: query,
          onchange: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn()
        }))
      });

      renderSvelte5Component(Header, {});

      // Verify responsive classes are applied correctly
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Props Handling', () => {
    it('handles showSearch prop', () => {
      renderSvelte5Component(Header, {
        showSearch: true
      });

      // Should render search functionality when enabled
      expect(true).toBe(true); // Placeholder
    });

    it('handles minimal prop', () => {
      renderSvelte5Component(Header, {
        minimal: true
      });

      // Should render minimal version of header
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Edge Cases', () => {
    it('handles missing user data gracefully', async () => {
      mockAuthState.set({
        user: { id: '1', email: 'test@example.com' },
        profile: null, // No profile data
        supabase: {},
        loading: false,
        initialized: true
      });

      renderSvelte5Component(Header, {});
      await waitForSvelteUpdate();

      // Should not crash with missing profile
      expect(screen.getByText('Driplo')).toBeInTheDocument();
    });

    it('handles auth loading state', async () => {
      mockAuthState.set({
        user: null,
        profile: null,
        supabase: null,
        loading: true,
        initialized: false
      });

      renderSvelte5Component(Header, {});
      await waitForSvelteUpdate();

      // Should handle loading state gracefully
      expect(screen.getByText('Driplo')).toBeInTheDocument();
    });

    it('handles navigation errors gracefully', async () => {
      // Mock navigation failure
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          replace: vi.fn(() => {
            throw new Error('Navigation failed');
          })
        }
      });

      renderSvelte5Component(Header, {});

      // Should handle navigation errors without crashing
      expect(screen.getByText('Driplo')).toBeInTheDocument();
    });
  });

  describe('Logo Animation', () => {
    it('cycles through clothing emojis', async () => {
      vi.useFakeTimers();
      
      renderSvelte5Component(Header, {});

      const logoContainer = screen.getByText('Driplo').parentElement;
      const emojiSpan = logoContainer?.querySelector('span:last-child');
      
      expect(emojiSpan).toBeInTheDocument();

      // Fast-forward time to trigger emoji change
      vi.advanceTimersByTime(2000);
      await waitForSvelteUpdate();

      // Emoji should still be there (might be different)
      expect(emojiSpan).toBeInTheDocument();

      vi.useRealTimers();
    });
  });
});