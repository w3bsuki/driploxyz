export { default as Accordion } from './Accordion.svelte';

export interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

export interface AccordionProps {
  items: AccordionItem[];
  multiple?: boolean;
  disabled?: boolean;
  class?: string;
}