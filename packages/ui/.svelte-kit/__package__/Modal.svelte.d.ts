interface Props {
    open?: boolean;
    onClose?: () => void;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    closeOnOutsideClick?: boolean;
    class?: string;
    header?: import('svelte').Snippet;
    body?: import('svelte').Snippet<[{
        close: () => void;
    }]>;
    footer?: import('svelte').Snippet<[{
        close: () => void;
    }]>;
    children?: import('svelte').Snippet;
}
declare const Modal: import("svelte").Component<Props, {}, "">;
type Modal = ReturnType<typeof Modal>;
export default Modal;
