import type { Snippet } from 'svelte';
interface Option {
    value: string;
    label: string;
}
interface Props {
    value?: string;
    options?: Option[] | string[];
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    class?: string;
    id?: string;
    name?: string;
    onchange?: (event: Event) => void;
    onblur?: (event: Event) => void;
    children?: Snippet;
}
declare const Select: import("svelte").Component<Props, {}, "value">;
type Select = ReturnType<typeof Select>;
export default Select;
