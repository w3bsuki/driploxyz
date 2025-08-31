export { default as Menu } from './Menu.svelte';

export interface MenuItemData {
  id: string;
  label: string;
  disabled?: boolean;
  separator?: boolean;
  onSelect?: () => void;
  icon?: string;
  shortcut?: string;
}