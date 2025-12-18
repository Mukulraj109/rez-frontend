/**
 * PriceSectionCard Component
 *
 * Displays product pricing with:
 * - Original price (struck through) + discount badge
 * - ReZ Price (large, prominent)
 * - Savings highlight with checkmark
 *
 * Based on reference design from ProductPage redesign
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PriceSectionCardProps {
  /** Original price before discount */
  originalPrice: number;
  /** Current selling price (ReZ Price) */
  sellingPrice: number;
  /** Discount percentage (optional - will calculate if not provided) */
  discountPercentage?: number;
  /** Currency symbol */
  currency?: string;
  /** Custom style */
  style?: any;
}

/**
 * Format price with Indian locale
 */
const formatPrice = (price: number): string => {
  return price.toLocaleString('en-IN');
};

export const PriceSectionCard: React.FC<PriceSectionCardProps> = ({
  originalPrice,
  sellingPrice,
  discountPercentage,
  currency = '₹',
  style,
}) => {
  // Calculate discount if not provided
  const discount = discountPercentage ??
    (originalPrice > sellingPrice
      ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100)
      : 0);

  // Calculate savings
  const savings = originalPrice - sellingPrice;
  const hasSavings = savings > 0;

  return (
    <View style={[styles.container, style]}>
      {/* Original Price + Discount Badge Row */}
      <View style={styles.originalPriceRow}>
        {hasSavings && (
          <>
            <Text style={styles.originalPrice}>
              {currency}{formatPrice(originalPrice)}
            </Text>
            {discount > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{discount}% OFF</Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* ReZ Price Row */}
      <View style={styles.rezPriceRow}>
        <Text style={styles.rezPrice}>
          {currency}{formatPrice(sellingPrice)}
        </Text>
        <Text style={styles.rezPriceLabel}>ReZ Price</Text>
      </View>

      {/* Savings Highlight */}
      {hasSavings && (
        <View style={styles.savingsRow}>
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text style={styles.savingsText}>
            You Save {currency}{formatPrice(savings)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  // Original price row
  originalPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },

  originalPrice: {
    fontSize: 16,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },

  discountBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },

  discountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
    letterSpacing: 0.3,
  },

  // ReZ Price row
  rezPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 12,
  },

  rezPrice: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },

  rezPriceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },

  // Savings row
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },

  savingsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
});

export default PriceSectionCard;
