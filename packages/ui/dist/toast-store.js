var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { writable } from 'svelte/store';
function createToastStore() {
    var _a = writable([]), subscribe = _a.subscribe, update = _a.update;
    return {
        subscribe: subscribe,
        show: function (message, type, duration) {
            if (type === void 0) { type = 'info'; }
            if (duration === void 0) { duration = 5000; }
            var id = Date.now().toString();
            update(function (toasts) { return __spreadArray(__spreadArray([], toasts, true), [{ id: id, message: message, type: type, duration: duration }], false); });
            return id;
        },
        success: function (message, duration) {
            if (duration === void 0) { duration = 5000; }
            return this.show(message, 'success', duration);
        },
        error: function (message, duration) {
            if (duration === void 0) { duration = 5000; }
            return this.show(message, 'error', duration);
        },
        warning: function (message, duration) {
            if (duration === void 0) { duration = 5000; }
            return this.show(message, 'warning', duration);
        },
        info: function (message, duration) {
            if (duration === void 0) { duration = 5000; }
            return this.show(message, 'info', duration);
        },
        remove: function (id) {
            update(function (toasts) { return toasts.filter(function (t) { return t.id !== id; }); });
        },
        clear: function () {
            update(function () { return []; });
        }
    };
}
export var toasts = createToastStore();
