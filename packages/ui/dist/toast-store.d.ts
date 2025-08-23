export interface ToastMessage {
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}
export declare const toasts: {
    subscribe: (this: void, run: import("svelte/store").Subscriber<ToastMessage[]>, invalidate?: () => void) => import("svelte/store").Unsubscriber;
    show(message: string, type?: ToastMessage["type"], duration?: number): string;
    success(message: string, duration?: number): any;
    error(message: string, duration?: number): any;
    warning(message: string, duration?: number): any;
    info(message: string, duration?: number): any;
    remove(id: string): void;
    clear(): void;
};
//# sourceMappingURL=toast-store.d.ts.map