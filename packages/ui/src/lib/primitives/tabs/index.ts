export { default as Tabs } from './Tabs.svelte';

export interface TabData {
  id: string;
  label: string;
  count?: number;
  disabled?: boolean;
  badge?: string;
  icon?: string;
}

export interface TabsProps {
  /** Array of tab data to render */
  tabs: TabData[];
  /** Currently active tab ID (bindable for two-way binding) */
  value?: string;
  /** Callback when tab changes (uncontrolled mode) */
  onTabChange?: (tabId: string) => void;
  /** Whether tabs should be scrollable on mobile */
  scrollable?: boolean;
  /** Loop keyboard navigation */
  loop?: boolean;
  /** Additional CSS classes for the tabs container */
  class?: string;
  /** Additional CSS classes for the tab list */
  tabListClass?: string;
  /** Additional CSS classes for individual tabs */
  tabClass?: string;
  /** Additional CSS classes for tab panels */
  panelClass?: string;
  /** Orientation of tabs */
  orientation?: 'horizontal' | 'vertical';
  /** Variant style */
  variant?: 'default' | 'pills' | 'underline';
  /** Size of tabs for touch targets */
  size?: 'sm' | 'md' | 'lg';
}

export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsVariant = 'default' | 'pills' | 'underline';
export type TabsSize = 'sm' | 'md' | 'lg';