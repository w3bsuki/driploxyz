import type { ButtonVariant, ButtonSize } from './types.js';
interface Props {
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    href?: string;
    type?: 'button' | 'submit' | 'reset';
    form?: string;
    onclick?: (event: MouseEvent) => void;
    class?: string;
    children?: import('svelte').Snippet;
}
declare const Button: import("svelte").Component<Props, {}, "">;
type Button = ReturnType<typeof Button>;
export default Button;
//# sourceMappingURL=Button.svelte.d.ts.map