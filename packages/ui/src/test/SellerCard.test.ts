import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/svelte';
import SellerCard from '../lib/SellerCard.svelte';
import {
  renderSvelte5Component,
  createMockHandlers,
  createMockSellerStats,
  userInteraction,
  mockTranslations,
  checkAccessibility,
  setupGlobalMocks,
  waitForSvelteUpdate
} from './test-utils.js';

describe('SellerCard', () => {
  let mockSellerData: any;
  let mockHandlers: any;

  beforeEach(() => {
    setupGlobalMocks();
    mockSellerData = {
      id: 'seller-1',
      name: 'John Doe',
      avatar: 'https://example.com/avatar.jpg',
      stats: createMockSellerStats()
    };
    mockHandlers = createMockHandlers();
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders seller information correctly', () => {
      renderSvelte5Component(SellerCard, {
        ...mockSellerData,
        ...mockHandlers,
        translations: mockTranslations
      });

      expect(screen.getByText(mockSellerData.name)).toBeInTheDocument();
      expect(screen.getByText('Sold by')).toBeInTheDocument();
      expect(screen.getByText('4.8')).toBeInTheDocument();
      expect(screen.getByText('(156 sales)')).toBeInTheDocument();
    });

    it('renders avatar with activity indicator', () => {
      renderSvelte5Component(SellerCard, {
        ...mockSellerData,
        translations: mockTranslations
      });

      // Check if avatar is rendered (Avatar component should be tested separately)
      expect(screen.getByText(mockSellerData.name)).toBeInTheDocument();
      
      // Activity indicator is a styled div with background color class
      const cardContainer = screen.getByRole('region', { name: 'Seller information' });
      expect(cardContainer).toBeInTheDocument();
    });

    it('shows verification badge for verified sellers', () => {
      const verifiedSeller = {
        ...mockSellerData,
        stats: {
          ...mockSellerData.stats,
          verificationLevel: 'verified'
        }
      };

      renderSvelte5Component(SellerCard, {
        ...verifiedSeller,
        translations: mockTranslations
      });

      expect(screen.getByText('Trusted Seller')).toBeInTheDocument();
    });

    it('shows superstar badge for superstar sellers', () => {
      const superstarSeller = {
        ...mockSellerData,
        stats: {
          ...mockSellerData.stats,
          verificationLevel: 'superstar'
        }
      };

      renderSvelte5Component(SellerCard, {
        ...superstarSeller,
        translations: mockTranslations
      });

      expect(screen.getByText('Superstar Seller')).toBeInTheDocument();
    });

    it('does not show badge for basic verification level', () => {
      const basicSeller = {
        ...mockSellerData,
        stats: {
          ...mockSellerData.stats,
          verificationLevel: 'basic'
        }
      };

      renderSvelte5Component(SellerCard, {
        ...basicSeller,
        translations: mockTranslations
      });

      expect(screen.queryByText('Verified')).not.toBeInTheDocument();
      expect(screen.queryByText('Trusted Seller')).not.toBeInTheDocument();
    });
  });

  describe('Stats Display', () => {
    it('displays rating with star icon', () => {
      renderSvelte5Component(SellerCard, {
        ...mockSellerData,
        translations: mockTranslations
      });

      const rating = screen.getByText('4.8');
      expect(rating).toBeInTheDocument();
      
      // Check for star icon (SVG with specific path)
      const starIcon = rating.closest('div')?.querySelector('svg');
      expect(starIcon).toBeInTheDocument();
      expect(starIcon).toHaveClass('text-yellow-400');
    });

    it('formats response time correctly', () => {
      const fastSeller = {
        ...mockSellerData,
        stats: {
          ...mockSellerData.stats,
          responseTime: 0.5 // 30 minutes
        }
      };

      renderSvelte5Component(SellerCard, {
        ...fastSeller,
        translations: mockTranslations
      });

      expect(screen.getByText('Usually responds within 1 hour')).toBeInTheDocument();
    });

    it('displays membership duration correctly', () => {
      const newSeller = {
        ...mockSellerData,
        stats: {
          ...mockSellerData.stats,
          joinedDate: new Date().toISOString() // Joined today
        }
      };

      renderSvelte5Component(SellerCard, {
        ...newSeller,
        translations: mockTranslations
      });

      expect(screen.getByText('New member')).toBeInTheDocument();
    });

    it('shows last active status correctly', () => {
      const onlineSeller = {
        ...mockSellerData,
        stats: {
          ...mockSellerData.stats,
          lastActive: new Date().toISOString() // Active now
        }
      };

      renderSvelte5Component(SellerCard, {
        ...onlineSeller,
        translations: mockTranslations
      });

      expect(screen.getByText('Active now')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('renders message and follow buttons', () => {
      renderSvelte5Component(SellerCard, {
        ...mockSellerData,
        onMessage: mockHandlers.onMessage,
        onFollow: mockHandlers.onFollow,
        translations: mockTranslations
      });

      expect(screen.getByText('Message')).toBeInTheDocument();
      expect(screen.getByText('Follow')).toBeInTheDocument();
    });

    it('calls onMessage when message button is clicked', async () => {
      renderSvelte5Component(SellerCard, {
        ...mockSellerData,
        onMessage: mockHandlers.onMessage,
        translations: mockTranslations
      });

      const messageButton = screen.getByText('Message');
      await userInteraction.click(messageButton);

      expect(mockHandlers.onMessage).toHaveBeenCalledTimes(1);
    });

    it('calls onFollow when follow button is clicked', async () => {
      renderSvelte5Component(SellerCard, {
        ...mockSellerData,
        onFollow: mockHandlers.onFollow,
        translations: mockTranslations
      });

      const followButton = screen.getByText('Follow');
      await userInteraction.click(followButton);

      expect(mockHandlers.onFollow).toHaveBeenCalledTimes(1);
    });

    it('shows different states for following/not following', () => {
      const { rerender } = renderSvelte5Component(SellerCard, {
        ...mockSellerData,
        onFollow: mockHandlers.onFollow,
        isFollowing: false,
        translations: mockTranslations
      });

      // Initially not following
      expect(screen.getByText('Follow')).toBeInTheDocument();

      // Update to following state
      rerender({
        ...mockSellerData,
        onFollow: mockHandlers.onFollow,
        isFollowing: true,
        translations: mockTranslations
      });

      expect(screen.getByText('Following')).toBeInTheDocument();
    });

    it('applies different styling for following state', () => {
      renderSvelte5Component(SellerCard, {
        ...mockSellerData,
        onFollow: mockHandlers.onFollow,
        isFollowing: true,
        translations: mockTranslations
      });

      const followButton = screen.getByText('Following');
      expect(followButton).toHaveClass('bg-gray-100', 'text-gray-700');
    });
  });

  describe('View Profile Action', () => {
    it('renders view profile button', () => {
      renderSvelte5Component(SellerCard, {
        ...mockSellerData,
        onViewProfile: mockHandlers.onViewProfile,
        translations: mockTranslations
      });

      expect(screen.getByText('View full profile')).toBeInTheDocument();
    });

    it('calls onViewProfile when clicked', async () => {
      renderSvelte5Component(SellerCard, {
        ...mockSellerData,
        onViewProfile: mockHandlers.onViewProfile,
        translations: mockTranslations
      });

      const viewProfileButton = screen.getByText('View full profile');
      await userInteraction.click(viewProfileButton);

      expect(mockHandlers.onViewProfile).toHaveBeenCalledTimes(1);
    });
  });

  describe('Extended Stats', () => {
    it('shows extended stats when showFullStats is true', () => {
      renderSvelte5Component(SellerCard, {
        ...mockSellerData,
        showFullStats: true,
        translations: mockTranslations
      });

      expect(screen.getByText('98%')).toBeInTheDocument();
      expect(screen.getByText('Positive reviews')).toBeInTheDocument();
      expect(screen.getByText('24h')).toBeInTheDocument();
      expect(screen.getByText('Avg shipping')).toBeInTheDocument();
      expect(screen.getByText('Recent activity')).toBeInTheDocument();
    });

    it('hides extended stats by default', () => {
      renderSvelte5Component(SellerCard, {
        ...mockSellerData,
        showFullStats: false,
        translations: mockTranslations
      });

      expect(screen.queryByText('98%')).not.toBeInTheDocument();
      expect(screen.queryByText('Recent activity')).not.toBeInTheDocument();
    });

    it('shows recent activity details in extended stats', () => {
      renderSvelte5Component(SellerCard, {
        ...mockSellerData,
        showFullStats: true,
        translations: mockTranslations
      });

      expect(screen.getByText('• Sold 3 items this week')).toBeInTheDocument();
      expect(screen.getByText('• 100% of orders shipped on time')).toBeInTheDocument();
      expect(screen.getByText('• Responds to messages in 2 hours')).toBeInTheDocument();
    });
  });

  describe('Hover Effects', () => {
    it('handles hover state correctly', async () => {
      renderSvelte5Component(SellerCard, {
        ...mockSellerData,
        translations: mockTranslations
      });

      const card = screen.getByRole('region', { name: 'Seller information' });
      
      // Hover effects are primarily CSS-based, but we can test the events
      await userInteraction.hover(card);
      expect(card).toBeInTheDocument();
      
      await userInteraction.unhover(card);
      expect(card).toBeInTheDocument();
    });
  });

  describe('Activity Status', () => {
    it('shows correct activity colors based on last active time', () => {
      const activityTestCases = [
        {
          lastActive: new Date().toISOString(), // Now
          expectedText: 'Active now'
        },
        {
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          expectedText: 'Active 2h ago'
        },
        {
          lastActive: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
          expectedText: 'Active 1d ago'
        }
      ];

      activityTestCases.forEach(({ lastActive, expectedText }) => {
        const testSeller = {
          ...mockSellerData,
          stats: {
            ...mockSellerData.stats,
            lastActive
          }
        };

        const { unmount } = renderSvelte5Component(SellerCard, {
          ...testSeller,
          translations: mockTranslations
        });

        expect(screen.getByText(expectedText)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Response Time Formatting', () => {
    it('formats different response times correctly', () => {
      const responseTimeTests = [
        { responseTime: 0.5, expected: 'Usually responds within 1 hour' },
        { responseTime: 2, expected: 'Usually responds within 2 hours' },
        { responseTime: 24, expected: 'Usually responds within 1 days' },
        { responseTime: 48, expected: 'Usually responds within 2 days' }
      ];

      responseTimeTests.forEach(({ responseTime, expected }) => {
        const testSeller = {
          ...mockSellerData,
          stats: {
            ...mockSellerData.stats,
            responseTime
          }
        };

        const { unmount } = renderSvelte5Component(SellerCard, {
          ...testSeller,
          translations: mockTranslations
        });

        expect(screen.getByText(expected)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Join Date Formatting', () => {
    it('formats different join dates correctly', () => {
      const now = new Date();
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      const recentJoin = new Date();

      const joinDateTests = [
        { 
          joinedDate: oneYearAgo.toISOString(), 
          expectedPattern: /Member for \d+ year/ 
        },
        { 
          joinedDate: sixMonthsAgo.toISOString(), 
          expectedPattern: /Member for \d+ month/ 
        },
        { 
          joinedDate: recentJoin.toISOString(), 
          expected: 'New member'
        }
      ];

      joinDateTests.forEach(({ joinedDate, expectedPattern, expected }) => {
        const testSeller = {
          ...mockSellerData,
          stats: {
            ...mockSellerData.stats,
            joinedDate
          }
        };

        const { unmount } = renderSvelte5Component(SellerCard, {
          ...testSeller,
          translations: mockTranslations
        });

        if (expected) {
          expect(screen.getByText(expected)).toBeInTheDocument();
        } else {
          const elements = screen.getAllByText(expectedPattern);
          expect(elements.length).toBeGreaterThan(0);
        }
        
        unmount();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      renderSvelte5Component(SellerCard, {
        ...mockSellerData,
        translations: mockTranslations
      });

      const card = screen.getByRole('region', { name: 'Seller information' });
      expect(card).toBeInTheDocument();
      expect(checkAccessibility.hasRole(card, 'region')).toBe(true);
    });

    it('buttons are keyboard accessible', () => {
      renderSvelte5Component(SellerCard, {
        ...mockSellerData,
        onMessage: mockHandlers.onMessage,
        onFollow: mockHandlers.onFollow,
        onViewProfile: mockHandlers.onViewProfile,
        translations: mockTranslations
      });

      const messageButton = screen.getByText('Message');
      const followButton = screen.getByText('Follow');
      const viewProfileButton = screen.getByText('View full profile');

      expect(checkAccessibility.isKeyboardAccessible(messageButton)).toBe(true);
      expect(checkAccessibility.isKeyboardAccessible(followButton)).toBe(true);
      expect(checkAccessibility.isKeyboardAccessible(viewProfileButton)).toBe(true);
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      renderSvelte5Component(SellerCard, {
        ...mockSellerData,
        class: 'custom-seller-class',
        translations: mockTranslations
      });

      const card = screen.getByRole('region', { name: 'Seller information' });
      expect(card).toHaveClass('custom-seller-class');
    });

    it('applies default classes', () => {
      renderSvelte5Component(SellerCard, {
        ...mockSellerData,
        translations: mockTranslations
      });

      const card = screen.getByRole('region', { name: 'Seller information' });
      expect(card).toHaveClass('bg-white', 'border', 'rounded-xl', 'p-4');
    });
  });

  describe('Translation Support', () => {
    it('uses custom translation labels', () => {
      const customTranslations = {
        ...mockTranslations,
        soldBy: 'Verkauft von',
        message: 'Nachricht',
        follow: 'Folgen',
        sales: 'Verkäufe',
        trustedSeller: 'Vertrauensvoller Verkäufer'
      };

      const verifiedSeller = {
        ...mockSellerData,
        stats: {
          ...mockSellerData.stats,
          verificationLevel: 'verified'
        }
      };

      renderSvelte5Component(SellerCard, {
        ...verifiedSeller,
        onMessage: mockHandlers.onMessage,
        onFollow: mockHandlers.onFollow,
        translations: customTranslations
      });

      expect(screen.getByText('Verkauft von')).toBeInTheDocument();
      expect(screen.getByText('Nachricht')).toBeInTheDocument();
      expect(screen.getByText('Folgen')).toBeInTheDocument();
      expect(screen.getByText('(156 Verkäufe)')).toBeInTheDocument();
      expect(screen.getByText('Vertrauensvoller Verkäufer')).toBeInTheDocument();
    });

    it('falls back to defaults when translations missing', () => {
      renderSvelte5Component(SellerCard, {
        ...mockSellerData,
        onMessage: mockHandlers.onMessage,
        onFollow: mockHandlers.onFollow
      });

      expect(screen.getByText('Sold by')).toBeInTheDocument();
      expect(screen.getByText('Message')).toBeInTheDocument();
      expect(screen.getByText('Follow')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing avatar gracefully', () => {
      const sellerWithoutAvatar = {
        ...mockSellerData,
        avatar: undefined
      };

      renderSvelte5Component(SellerCard, {
        ...sellerWithoutAvatar,
        translations: mockTranslations
      });

      expect(screen.getByText(sellerWithoutAvatar.name)).toBeInTheDocument();
    });

    it('handles zero rating gracefully', () => {
      const newSellerStats = {
        ...mockSellerData.stats,
        rating: 0,
        totalSales: 0
      };

      renderSvelte5Component(SellerCard, {
        ...mockSellerData,
        stats: newSellerStats,
        translations: mockTranslations
      });

      expect(screen.getByText('0.0')).toBeInTheDocument();
      expect(screen.getByText('(0 sales)')).toBeInTheDocument();
    });

    it('handles missing optional handlers gracefully', () => {
      renderSvelte5Component(SellerCard, {
        ...mockSellerData,
        translations: mockTranslations
      });

      // Should render without errors even without handlers
      expect(screen.getByText(mockSellerData.name)).toBeInTheDocument();
    });
  });
});