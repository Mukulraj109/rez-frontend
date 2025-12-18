/**
 * CashbackCard Component
 *
 * Displays cashback information
 * Shows: "Cashback ₹X" + "Instant credit to wallet"
 *
 * Based on reference design from ProductPage redesign
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CashbackCardProps {
  /** Cashback amount in currency */
  cashbackAmount: number;
  /** Currency symbol */
  currency?: string;
  /** Subtitle text */
  subtitle?: string;
  /** Custom style */
  style?: any;
}

/**
 * Format price with locale
 */
const formatPrice = (price: number): string => {
  return price.toLocaleString('en-IN');
};

export const CashbackCard: React.FC<CashbackCardProps> = ({
  cashbackAmount,
  currency = '₹',
  subtitle = 'Instant credit to wallet',
  style,
}) => {
  if (cashbackAmount <= 0) return null;

  return (
    <View style={[styles.container, style]}>
      {/* Icon */}
      <View style={styles.iconContainer}>
        <Ionicons name="wallet-outline" size={24} color="#10B981" />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Cashback</Text>
          <Text style={styles.amount}>{currency}{formatPrice(cashbackAmount)}</Text>
        </View>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  content: {
    flex: 1,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },

  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },

  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },

  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '400',
  },
});

export default CashbackCard;
