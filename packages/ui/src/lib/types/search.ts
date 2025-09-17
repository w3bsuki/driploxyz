/**
 * Search-related Types
 *
 * This file contains types related to search functionality,
 * including search bar modes, empty states, and feedback.
 */

// Search bar mode types
export type SearchBarMode = 'power' | 'compact' | 'full';

// Empty state content structure
export interface EmptyStateContent {
  title: string;
  subtitle: string;
  icon: string;
  showSuggestions: boolean;
  actionText: string;
}

// Search feedback types
export interface FeedbackPrompt {
  question: string;
  context: string;
}

export interface PerformanceIndicator {
  text: string;
  color: string;
  icon: string;
}

// Search suggestion types
export interface SearchSuggestion {
  query: string;
  popularity?: number;
  category?: string;
}

export interface CategorySuggestion {
  slug: string;
  name: string;
  icon: string;
  itemCount?: number;
}

export interface CollectionSuggestion {
  key: string;
  label: string;
  emoji: string;
  description?: string;
}

// Search results and analytics
export interface SearchContext {
  query: string;
  mode: SearchBarMode;
  resultsCount: number;
  loadTime?: number;
  hasFilters?: boolean;
  source?: string; // Where the search was initiated
}

// Search empty state props
export interface SearchEmptyStateProps {
  mode: SearchBarMode;
  searchQuery?: string;
  totalProducts?: number;
  suggestedCategories?: CategorySuggestion[];
  suggestedCollections?: CollectionSuggestion[];
  onCategorySelect?: (categorySlug: string) => void;
  onCollectionSelect?: (collectionKey: string) => void;
  onSearchSuggestion?: (query: string) => void;
}

// Search feedback props
export interface SearchFeedbackProps {
  mode: SearchBarMode;
  searchQuery: string;
  resultsCount: number;
  loadTime?: number;
  hasFilters?: boolean;
  onFeedback?: (helpful: boolean, reason?: string) => void;
}

// Search analytics events
export interface SearchAnalyticsEvent {
  type: 'search_submitted' | 'suggestion_clicked' | 'feedback_given' | 'mode_switched';
  mode: SearchBarMode;
  query?: string;
  metadata?: Record<string, any>;
  timestamp: number;
}

// Search state management
export interface SearchState {
  query: string;
  mode: SearchBarMode;
  isSearching: boolean;
  hasResults: boolean;
  resultsCount: number;
  loadTime?: number;
  error?: string;
}