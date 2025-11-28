/**
 * Price Formatting Utilities
 *
 * This module provides functions for formatting prices, calculating discounts,
 * and validating price data across the application.
 */

/**
 * Default currency symbol
 */
const DEFAULT_CURRENCY = '₹';

/**
 * Supported currency symbols and their codes
 */
const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
};

/**
 * Validates if a price value is valid
 *
 * @param price - Price value to validate
 * @returns Valid number or null if invalid
 *
 * @example
 * validatePrice(100) // 100
 * validatePrice('100') // 100
 * validatePrice(null) // null
 * validatePrice(undefined) // null
 * validatePrice(-10) // null
 */
export function validatePrice(price: any): number | null {
  // Handle null/undefined
  if (price == null) {
    return null;
  }

  // Convert to number if string
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  // Check if valid number
  if (typeof numPrice !== 'number' || isNaN(numPrice)) {
    return null;
  }

  // Check if positive (prices cannot be negative)
  if (numPrice < 0) {
    return null;
  }

  // Check for infinity
  if (!isFinite(numPrice)) {
    return null;
  }

  return numPrice;
}

/**
 * Formats a price value with currency symbol and proper decimal places
 *
 * @param price - Price value to format
 * @param currency - Currency code (INR, USD, EUR, etc.) or custom symbol
 * @param showDecimals - Whether to show decimal places (default: true)
 * @returns Formatted price string or null if invalid
 *
 * @example
 * formatPrice(1234.56) // '₹1,234.56'
 * formatPrice(1234.56, 'USD') // '$1,234.56'
 * formatPrice(1234, 'INR', false) // '₹1,234'
 * formatPrice(null) // null
 * formatPrice(0) // '₹0.00'
 */
export function formatPrice(
  price: number | null | undefined,
  currency: string = 'INR',
  showDecimals: boolean = true
): string | null {
  const validPrice = validatePrice(price);

  if (validPrice === null) {
    return null;
  }

  // Get currency symbol
  const currencySymbol = CURRENCY_SYMBOLS[currency] || currency || DEFAULT_CURRENCY;

  // Format with decimals or without
  const decimals = showDecimals ? 2 : 0;
  const formattedNumber = validPrice.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${currencySymbol}${formattedNumber}`;
}

/**
 * Formats a price range (min-max)
 *
 * @param minPrice - Minimum price
 * @param maxPrice - Maximum price
 * @param currency - Currency code
 * @returns Formatted price range or single price if min equals max
 *
 * @example
 * formatPriceRange(100, 200) // '₹100 - ₹200'
 * formatPriceRange(100, 100) // '₹100.00'
 * formatPriceRange(null, 200) // '₹200.00'
 */
export function formatPriceRange(
  minPrice: number | null | undefined,
  maxPrice: number | null | undefined,
  currency: string = 'INR'
): string | null {
  const validMin = validatePrice(minPrice);
  const validMax = validatePrice(maxPrice);

  // If both are null, return null
  if (validMin === null && validMax === null) {
    return null;
  }

  // If only one is valid, format that one
  if (validMin === null) {
    return formatPrice(validMax, currency);
  }

  if (validMax === null) {
    return formatPrice(validMin, currency);
  }

  // If both are equal, show single price
  if (validMin === validMax) {
    return formatPrice(validMin, currency);
  }

  // Format range
  const formattedMin = formatPrice(validMin, currency);
  const formattedMax = formatPrice(validMax, currency);

  return `${formattedMin} - ${formattedMax}`;
}

/**
 * Calculates discount percentage between original and current price
 *
 * @param originalPrice - Original/MRP price
 * @param currentPrice - Current/selling price
 * @returns Discount percentage (rounded) or null if invalid
 *
 * @example
 * formatDiscount(100, 80) // 20
 * formatDiscount(100, 100) // 0
 * formatDiscount(100, 120) // null (current price higher than original)
 * formatDiscount(null, 80) // null
 */
export function formatDiscount(
  originalPrice: number | null | undefined,
  currentPrice: number | null | undefined
): number | null {
  const validOriginal = validatePrice(originalPrice);
  const validCurrent = validatePrice(currentPrice);

  // Both prices must be valid
  if (validOriginal === null || validCurrent === null) {
    return null;
  }

  // Original price must be greater than current price
  if (validOriginal <= validCurrent) {
    return null;
  }

  // Avoid division by zero
  if (validOriginal === 0) {
    return null;
  }

  // Calculate percentage
  const discountPercent = ((validOriginal - validCurrent) / validOriginal) * 100;

  // Round to nearest integer
  return Math.round(discountPercent);
}

/**
 * Formats discount as a string with percentage symbol
 *
 * @param originalPrice - Original/MRP price
 * @param currentPrice - Current/selling price
 * @returns Formatted discount string or null if invalid
 *
 * @example
 * formatDiscountString(100, 80) // '20% OFF'
 * formatDiscountString(100, 100) // null
 */
export function formatDiscountString(
  originalPrice: number | null | undefined,
  currentPrice: number | null | undefined
): string | null {
  const discount = formatDiscount(originalPrice, currentPrice);

  if (discount === null || discount === 0) {
    return null;
  }

  return `${discount}% OFF`;
}

/**
 * Calculates the amount saved between original and current price
 *
 * @param originalPrice - Original/MRP price
 * @param currentPrice - Current/selling price
 * @returns Amount saved or null if invalid
 *
 * @example
 * calculateSavings(100, 80) // 20
 * calculateSavings(100, 100) // 0
 */
export function calculateSavings(
  originalPrice: number | null | undefined,
  currentPrice: number | null | undefined
): number | null {
  const validOriginal = validatePrice(originalPrice);
  const validCurrent = validatePrice(currentPrice);

  if (validOriginal === null || validCurrent === null) {
    return null;
  }

  if (validOriginal <= validCurrent) {
    return 0;
  }

  return validOriginal - validCurrent;
}

/**
 * Formats savings amount with currency
 *
 * @param originalPrice - Original/MRP price
 * @param currentPrice - Current/selling price
 * @param currency - Currency code
 * @returns Formatted savings string or null if invalid
 *
 * @example
 * formatSavings(100, 80) // 'Save ₹20.00'
 * formatSavings(100, 100) // null
 */
export function formatSavings(
  originalPrice: number | null | undefined,
  currentPrice: number | null | undefined,
  currency: string = 'INR'
): string | null {
  const savings = calculateSavings(originalPrice, currentPrice);

  if (savings === null || savings === 0) {
    return null;
  }

  const formattedSavings = formatPrice(savings, currency);

  if (!formattedSavings) {
    return null;
  }

  return `Save ${formattedSavings}`;
}

/**
 * Formats a complete price display with original, current, and discount
 *
 * @param originalPrice - Original/MRP price
 * @param currentPrice - Current/selling price
 * @param currency - Currency code
 * @returns Object with formatted price components
 *
 * @example
 * formatPriceDisplay(100, 80)
 * // {
 * //   current: '₹80.00',
 * //   original: '₹100.00',
 * //   discount: '20% OFF',
 * //   savings: 'Save ₹20.00'
 * // }
 */
export function formatPriceDisplay(
  originalPrice: number | null | undefined,
  currentPrice: number | null | undefined,
  currency: string = 'INR'
): {
  current: string | null;
  original: string | null;
  discount: string | null;
  savings: string | null;
} {
  return {
    current: formatPrice(currentPrice, currency),
    original: formatPrice(originalPrice, currency),
    discount: formatDiscountString(originalPrice, currentPrice),
    savings: formatSavings(originalPrice, currentPrice, currency),
  };
}

/**
 * Parses a price string and extracts the numeric value
 *
 * @param priceString - Price string (e.g., '₹1,234.56' or '$100')
 * @returns Numeric price value or null if invalid
 *
 * @example
 * parsePrice('₹1,234.56') // 1234.56
 * parsePrice('$100') // 100
 * parsePrice('invalid') // null
 */
export function parsePrice(priceString: string | null | undefined): number | null {
  if (!priceString || typeof priceString !== 'string') {
    return null;
  }

  // Remove currency symbols and commas
  const cleaned = priceString.replace(/[₹$€£¥,\s]/g, '');

  // Parse as float
  const parsed = parseFloat(cleaned);

  return validatePrice(parsed);
}

/**
 * Compares two prices and returns comparison result
 *
 * @param price1 - First price
 * @param price2 - Second price
 * @returns 1 if price1 > price2, -1 if price1 < price2, 0 if equal, null if invalid
 *
 * @example
 * comparePrice(100, 80) // 1
 * comparePrice(80, 100) // -1
 * comparePrice(100, 100) // 0
 */
export function comparePrice(
  price1: number | null | undefined,
  price2: number | null | undefined
): 1 | -1 | 0 | null {
  const valid1 = validatePrice(price1);
  const valid2 = validatePrice(price2);

  if (valid1 === null || valid2 === null) {
    return null;
  }

  if (valid1 > valid2) return 1;
  if (valid1 < valid2) return -1;
  return 0;
}

/**
 * Checks if a price is within a given range
 *
 * @param price - Price to check
 * @param minPrice - Minimum price (inclusive)
 * @param maxPrice - Maximum price (inclusive)
 * @returns True if within range, false otherwise
 *
 * @example
 * isPriceInRange(50, 0, 100) // true
 * isPriceInRange(150, 0, 100) // false
 */
export function isPriceInRange(
  price: number | null | undefined,
  minPrice: number | null | undefined,
  maxPrice: number | null | undefined
): boolean {
  const validPrice = validatePrice(price);
  const validMin = validatePrice(minPrice);
  const validMax = validatePrice(maxPrice);

  if (validPrice === null) {
    return false;
  }

  if (validMin !== null && validPrice < validMin) {
    return false;
  }

  if (validMax !== null && validPrice > validMax) {
    return false;
  }

  return true;
}
