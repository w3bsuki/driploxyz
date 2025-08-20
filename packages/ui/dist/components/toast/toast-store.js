import { writable } from 'svelte/store';
function createToastStore() {
    const { subscribe, update } = writable([]);
    return {
        subscribe,
        show(message, type = 'info', duration = 5000) {
            const id = Date.now().toString();
            update(toasts => [...toasts, { id, message, type, duration }]);
            return id;
        },
        success(message, duration = 5000) {
            return this.show(message, 'success', duration);
        },
        error(message, duration = 5000) {
            return this.show(message, 'error', duration);
        },
        warning(message, duration = 5000) {
            return this.show(message, 'warning', duration);
        },
        info(message, duration = 5000) {
            return this.show(message, 'info', duration);
        },
        remove(id) {
            update(toasts => toasts.filter(t => t.id !== id));
        },
        clear() {
            update(() => []);
        }
    };
}
export const toasts = createToastStore();
