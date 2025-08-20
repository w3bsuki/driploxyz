interface AccordionItem {
    title: string;
    content: string;
    icon?: string;
}
interface Props {
    items: AccordionItem[];
    class?: string;
}
declare const Accordion: import("svelte").Component<Props, {}, "">;
type Accordion = ReturnType<typeof Accordion>;
export default Accordion;
//# sourceMappingURL=Accordion.svelte.d.ts.map