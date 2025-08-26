import type { InputType } from '../types';
interface Props {
    type?: InputType;
    value?: string;
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    class?: string;
    id?: string;
    name?: string;
    autocomplete?: string;
    oninput?: (event: Event) => void;
    onchange?: (event: Event) => void;
    onfocus?: (event: FocusEvent) => void;
    onblur?: (event: FocusEvent) => void;
}
declare const Input: import("svelte").Component<Props, {}, "value">;
type Input = ReturnType<typeof Input>;
export default Input;
//# sourceMappingURL=Input.svelte.d.ts.map