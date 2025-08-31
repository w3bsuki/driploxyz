export { default as Select } from './Select.svelte';

// TypeScript interfaces for the Select component
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | null;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  onValueChange?: (value: string | null) => void;
  positioning?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'bottom' | 'top';
  loop?: boolean;
  closeOnEscape?: boolean;
  preventScroll?: boolean;
  portal?: string | HTMLElement | null;
  class?: string;
  triggerClass?: string;
  menuClass?: string;
  optionClass?: string;
}