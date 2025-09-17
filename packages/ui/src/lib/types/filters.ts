/**
 * Filter System Types
 *
 * Centralized type definitions for filter components across the UI system.
 * Provides shared interfaces for filter options, sections, and component props
 * following the established Supabase + UI extension pattern.
 */

import type { Snippet } from 'svelte';

// === Core Filter Types ===

/**
 * Basic filter option used across filter components
 * Supports visual customization with icons, colors, and gradients
 */
export interface FilterOption {
  value: string;
  label: string;
  key?: string;
  icon?: string;
  shortLabel?: string;
  color?: string;
  bgGradient?: string;
}

/**
 * Filter section configuration for modal-based filters
 * Supports different input types: pills, ranges, and custom components
 */
export interface FilterSection {
  key: string;
  label: string;
  type: 'pills' | 'range' | 'custom';
  options?: FilterOption[];
  value?: string | null;
  minValue?: string;
  maxValue?: string;
  placeholder?: { min?: string; max?: string };
}

/**
 * Category option for hierarchical category selection
 * Used in category dropdown components
 */
export interface CategoryOption {
  key: string;
  name: string;
  icon: string;
  id: string;
  hasChildren?: boolean;
}

/**
 * Hierarchical category structure
 * Organizes categories into three levels: main -> subcategories -> specifics
 */
export interface CategoryHierarchy {
  categories: CategoryOption[];
  subcategories: Record<string, CategoryOption[]>;
  specifics: Record<string, CategoryOption[]>;
}

// === Filter Component Props ===

/**
 * Props for CategoryFilterDropdown component
 * Manages hierarchical category selection with accessibility features
 */
export interface CategoryFilterDropdownProps {
  categoryHierarchy: CategoryHierarchy;
  selectedCategory?: string | null;
  selectedSubcategory?: string | null;
  selectedSpecific?: string | null;
  placeholder?: string;
  disabled?: boolean;
  class?: string;
  onCategorySelect?: (category: string | null, subcategory: string | null, specific: string | null) => void;
  trigger?: Snippet<[{ selectedText: string; isOpen: boolean }]>;
  categoryItem?: Snippet<[CategoryOption, { level: number; isSelected: boolean }]>;
  /** Announce category changes to screen readers */
  announceChanges?: boolean;
}

/**
 * Props for FilterModal component
 * Provides modal-based filtering with multiple section types
 */
export interface FilterModalProps {
  open?: boolean;
  sections: FilterSection[];
  activeFilterCount?: number;
  class?: string;
  title?: string;
  applyLabel?: string;
  clearLabel?: string;
  closeLabel?: string;
  minPriceLabel?: string;
  maxPriceLabel?: string;
  onApply?: (filters: Record<string, FilterValue>) => void;
  onClear?: () => void;
  onFilterChange?: (key: string, value: FilterValue) => void;
  trigger?: Snippet;
  customSection?: Snippet<[FilterSection]>;
  /** Announce filter changes to screen readers */
  announceChanges?: boolean;
  /** Custom announcement template for filter changes */
  announcementTemplate?: (filterKey: string, filterValue: FilterValue, sectionLabel: string) => string;
}

/**
 * Props for FilterPillGroup component
 * Provides horizontal scrollable filter pill selection
 */
export interface FilterPillGroupProps {
  value?: string | null;
  options: FilterOption[];
  multiple?: boolean;
  disabled?: boolean;
  label?: string;
  class?: string;
  pillClass?: string;
  activePillClass?: string;
  onValueChange?: (value: string | null) => void;
  children?: Snippet<[FilterOption]>;
  /** Announce changes to screen readers */
  announceChanges?: boolean;
  /** Custom announcement text template */
  announcementTemplate?: (option: FilterOption, isActive: boolean) => string;
}

// === Filter Value Types ===

/**
 * Union type for all possible filter values
 * Used in filter change handlers and state management
 */
export type FilterValue = string | number | boolean | null | undefined;

/**
 * Filter state object for managing active filters
 * Keys correspond to filter section keys, values to selected filter values
 */
export type FilterState = Record<string, FilterValue>;

// === Type Guards ===

/**
 * Type guard to check if a value is a valid FilterOption
 */
export function isFilterOption(value: unknown): value is FilterOption {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as FilterOption).value === 'string' &&
    typeof (value as FilterOption).label === 'string'
  );
}

/**
 * Type guard to check if a value is a valid CategoryOption
 */
export function isCategoryOption(value: unknown): value is CategoryOption {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as CategoryOption).key === 'string' &&
    typeof (value as CategoryOption).name === 'string' &&
    typeof (value as CategoryOption).icon === 'string' &&
    typeof (value as CategoryOption).id === 'string'
  );
}

/**
 * Type guard to check if a filter section has options
 */
export function hasFilterOptions(section: FilterSection): section is FilterSection & { options: FilterOption[] } {
  return Array.isArray(section.options) && section.options.length > 0;
}

// === Utility Functions ===

/**
 * Creates a default FilterOption with required fields
 */
export function createFilterOption(value: string, label: string, options?: Partial<FilterOption>): FilterOption {
  return {
    value,
    label,
    ...options
  };
}

/**
 * Creates a pills-type FilterSection with options
 */
export function createPillsFilterSection(
  key: string,
  label: string,
  options: FilterOption[],
  value?: string | null
): FilterSection {
  return {
    key,
    label,
    type: 'pills',
    options,
    value
  };
}

/**
 * Creates a range-type FilterSection for numeric inputs
 */
export function createRangeFilterSection(
  key: string,
  label: string,
  minValue?: string,
  maxValue?: string,
  placeholder?: { min?: string; max?: string }
): FilterSection {
  return {
    key,
    label,
    type: 'range',
    minValue,
    maxValue,
    placeholder
  };
}

/**
 * Extracts active filters from a FilterState, excluding empty/default values
 */
export function getActiveFilters(filterState: FilterState): FilterState {
  const active: FilterState = {};

  Object.entries(filterState).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '' && value !== 'all') {
      active[key] = value;
    }
  });

  return active;
}

/**
 * Counts the number of active filters in a FilterState
 */
export function getActiveFilterCount(filterState: FilterState): number {
  return Object.keys(getActiveFilters(filterState)).length;
}
