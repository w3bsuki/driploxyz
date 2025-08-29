interface Props {
    items: Array<{
        title: string;
        content: string;
    }>;
    allowMultiple?: boolean;
}
declare const Accordion: import("svelte").Component<Props, {}, "">;
type Accordion = ReturnType<typeof Accordion>;
export default Accordion;
