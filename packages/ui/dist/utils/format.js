/**
 * Format currency values
 */
export function formatCurrency(amount, currency = '€') {
    return `${currency}${amount.toFixed(2)}`;
}
/**
 * Format numbers with thousand separators
 */
export function formatNumber(num) {
    return num.toLocaleString();
}
/**
 * Format file sizes
 */
export function formatBytes(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
}
