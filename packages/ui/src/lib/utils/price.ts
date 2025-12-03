export const BUYER_PROTECTION_RATE = 0.05; // 5%
export const BUYER_PROTECTION_FIXED = 0.70; // 0.70 currency units

/**
 * Calculate the buyer protection fee based on the item price.
 * Formula: 5% of item price + 0.70 fixed fee.
 */
export function calculateBuyerProtectionFee(price: number): number {
  return (price * BUYER_PROTECTION_RATE) + BUYER_PROTECTION_FIXED;
}

/**
 * Calculate the total price including buyer protection fee.
 */
export function calculateTotalPrice(price: number): number {
  return price + calculateBuyerProtectionFee(price);
}
