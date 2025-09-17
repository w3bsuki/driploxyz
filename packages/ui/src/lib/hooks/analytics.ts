import type { SearchBarMode } from '../types/search.js';

interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: number;
}

export interface SearchAnalytics {
  query: string;
  mode: SearchBarMode;
  filters?: Record<string, any>;
  results_count?: number;
  user_id?: string;
  session_id: string;
}

export interface SearchModeAnalytics {
  from_mode: SearchBarMode;
  to_mode: SearchBarMode;
  user_id?: string;
  session_id: string;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private sessionId: string = '';

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private track(event: string, properties: Record<string, any>): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        session_id: this.sessionId,
        timestamp: Date.now(),
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'unknown'
      },
      timestamp: Date.now()
    };

    this.events.push(analyticsEvent);

    // Send to analytics pipeline (Supabase/PostHog/etc)
    this.sendToAnalytics(analyticsEvent);
  }

  private async sendToAnalytics(event: AnalyticsEvent): Promise<void> {
    try {
      // TODO: Replace with actual analytics endpoint
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event)
      // });

      // For now, log to console in development
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.log('[Analytics]', event);
      }
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  // Search event tracking
  trackSearch(analytics: SearchAnalytics): void {
    this.track('search_query_submitted', {
      query: analytics.query,
      mode: analytics.mode,
      filters: analytics.filters,
      results_count: analytics.results_count,
      user_id: analytics.user_id,
      query_length: analytics.query.length,
      has_filters: Boolean(analytics.filters && Object.keys(analytics.filters).length > 0)
    });
  }

  // Search mode switch tracking
  trackModeSwitch(analytics: SearchModeAnalytics): void {
    this.track('search_mode_switched', {
      from_mode: analytics.from_mode,
      to_mode: analytics.to_mode,
      user_id: analytics.user_id,
      mode_progression: `${analytics.from_mode}_to_${analytics.to_mode}`
    });
  }

  // Filter usage tracking
  trackFilterUsage(filterType: string, filterValue: any, searchQuery: string): void {
    this.track('search_filter_applied', {
      filter_type: filterType,
      filter_value: filterValue,
      search_query: searchQuery,
      query_length: searchQuery.length
    });
  }

  // Empty state interaction tracking
  trackEmptyStateAction(action: string, mode: SearchBarMode, suggestion?: string): void {
    this.track('empty_state_action', {
      action,
      mode,
      suggestion,
      has_suggestion: Boolean(suggestion)
    });
  }

  // Mega menu interaction tracking
  trackMegaMenuNavigation(level: number, category: string, subcategory?: string): void {
    this.track('mega_menu_navigation', {
      level,
      category,
      subcategory,
      navigation_path: subcategory ? `${category}/${subcategory}` : category
    });
  }

  // Performance tracking
  trackSearchPerformance(query: string, loadTime: number, resultsCount: number): void {
    this.track('search_performance', {
      query,
      load_time_ms: loadTime,
      results_count: resultsCount,
      query_length: query.length,
      performance_tier: loadTime < 500 ? 'fast' : loadTime < 1000 ? 'medium' : 'slow'
    });
  }

  // Get session analytics for debugging
  getSessionEvents(): AnalyticsEvent[] {
    return this.events;
  }

  // Clear session data
  clearSession(): void {
    this.events = [];
    this.sessionId = this.generateSessionId();
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Utility hook for Svelte components
export function useAnalytics() {
  return {
    trackSearch: analytics.trackSearch.bind(analytics),
    trackModeSwitch: analytics.trackModeSwitch.bind(analytics),
    trackFilterUsage: analytics.trackFilterUsage.bind(analytics),
    trackEmptyStateAction: analytics.trackEmptyStateAction.bind(analytics),
    trackMegaMenuNavigation: analytics.trackMegaMenuNavigation.bind(analytics),
    trackSearchPerformance: analytics.trackSearchPerformance.bind(analytics)
  };
}