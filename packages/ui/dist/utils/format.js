export function formatCurrency(amount, currency) {
    if (currency === void 0) { currency = '$'; }
    return "".concat(currency).concat(amount.toFixed(2));
}
export function formatNumber(num) {
    if (num >= 1000000) {
        return "".concat((num / 1000000).toFixed(1), "M");
    }
    if (num >= 1000) {
        return "".concat((num / 1000).toFixed(1), "K");
    }
    return num.toString();
}
export function formatDate(date) {
    var d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString();
}
export function formatRelativeTime(date) {
    var d = typeof date === 'string' ? new Date(date) : date;
    var now = new Date();
    var diff = now.getTime() - d.getTime();
    var seconds = Math.floor(diff / 1000);
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);
    var days = Math.floor(hours / 24);
    if (days > 0) {
        return "".concat(days, "d ago");
    }
    if (hours > 0) {
        return "".concat(hours, "h ago");
    }
    if (minutes > 0) {
        return "".concat(minutes, "m ago");
    }
    return 'just now';
}
