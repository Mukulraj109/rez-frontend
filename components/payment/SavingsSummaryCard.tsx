/**
 * Savings Summary Card
 * 
 * "You saved today" card showing breakdown of all savings
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@/constants/DesignTokens';
import { SavingsSummary } from '@/types/storePayment.types';
import { useRegion } from '@/contexts/RegionContext';

interface SavingsSummaryCardProps {
  savings: SavingsSummary;
  showCelebration?: boolean;
}

export const SavingsSummaryCard: React.FC<SavingsSummaryCardProps> = ({
  savings,
  showCelebration = true,
}) => {
  const { getCurrencySymbol } = useRegion();
  const currencySymbol = getCurrencySymbol();

  if (savings.totalSaved === 0) {
    return null;
  }

  const savingsBreakdown = [
    { label: 'Coins Used', value: savings.coinsUsed, icon: 'diamond', color: COLORS.primary[500] },
    { label: 'Bank/UPI Offers', value: savings.bankOffers, icon: 'card', color: COLORS.info[500] },
    { label: 'Loyalty Benefit', value: savings.loyaltyBenefit, icon: 'star', color: COLORS.secondary[500] },
  ].filter(item => item.value > 0);

  return (
    <LinearGradient
      colors={[COLORS.success[50], COLORS.success[100]]}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {showCelebration && (
            <Text style={styles.emoji}>🎉</Text>
          )}
          <Text style={styles.title}>You Saved Today!</Text>
        </View>
        {showCelebration && savings.totalSaved >= 100 && (
          <View style={styles.amazingBadge}>
            <Ionicons name="sparkles" size={12} color="#FFFFFF" />
            <Text style={styles.amazingText}>Amazing!</Text>
          </View>
        )}
      </View>

      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total Saved</Text>
        <Text style={styles.totalAmount}>{currencySymbol}{savings.totalSaved}</Text>
      </View>

      {savingsBreakdown.length > 0 && (
        <View style={styles.breakdownContainer}>
          {savingsBreakdown.map((item, index) => (
            <View key={index} style={styles.breakdownRow}>
              <View style={[styles.breakdownIcon, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon as any} size={14} color={item.color} />
              </View>
              <Text style={styles.breakdownLabel}>{item.label}</Text>
              <Text style={styles.breakdownValue}>{currencySymbol}{item.value}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Ionicons name="checkmark-circle" size={16} color={COLORS.success[600]} />
        <Text style={styles.footerText}>
          Smart savings automatically applied by ReZ
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.success[200],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  emoji: {
    fontSize: 18,
  },
  title: {
    ...TYPOGRAPHY.h4,
    color: COLORS.success[800],
  },
  amazingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success[500],
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  amazingText: {
    ...TYPOGRAPHY.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  totalContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.success[200],
    marginBottom: SPACING.md,
  },
  totalLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success[700],
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.success[700],
  },
  breakdownContainer: {
    marginBottom: SPACING.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  breakdownIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  breakdownLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.success[800],
    flex: 1,
  },
  breakdownValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.success[700],
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  footerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success[700],
  },
});

export default SavingsSummaryCard;
