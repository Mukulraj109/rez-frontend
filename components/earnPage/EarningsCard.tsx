import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { EarningsCardProps } from '@/types/earnPage.types';
import { EARN_COLORS } from '@/constants/EarnPageColors';

export default function EarningsCard({ 
  earnings, 
  onSeeWallet 
}: EarningsCardProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.title}>Your earnings</ThemedText>
          <View style={styles.earningAmount}>
            <ThemedText style={styles.amount}>
              {earnings.currency}{earnings.totalEarned}
            </ThemedText>
            <ThemedText style={styles.earned}>Earned</ThemedText>
          </View>
        </View>

        {/* Wallet Button */}
        <TouchableOpacity 
          style={styles.seeWalletButton}
          onPress={onSeeWallet}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.seeWalletText}>See wallet</ThemedText>
          <Ionicons name="arrow-forward" size={16} color={EARN_COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Breakdown */}
      <View style={styles.breakdown}>
        {[
          { label: 'Projects', value: earnings.breakdown.projects },
          { label: 'Referrals', value: earnings.breakdown.referrals },
          { label: 'Share & earn', value: earnings.breakdown.shareAndEarn },
          { label: 'Spin', value: earnings.breakdown.spin },
        ].map((item, idx) => (
          <View 
            key={idx} 
            style={[
              styles.breakdownItem, 
              idx !== 0 && styles.breakdownDivider
            ]}
          >
            <ThemedText style={styles.breakdownAmount}>
              {earnings.currency}{item.value}
            </ThemedText>
            <ThemedText style={styles.breakdownLabel}>
              {item.label}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: EARN_COLORS.backgroundCard,
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 18,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: EARN_COLORS.textSecondary,
    marginBottom: 6,
  },
  earningAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  amount: {
    fontSize: 22,
    fontWeight: '800',
    color: EARN_COLORS.primary,
  },
  earned: {
    fontSize: 14,
    color: EARN_COLORS.textSecondary,
    fontWeight: '500',
  },
  seeWalletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: `${EARN_COLORS.primary}15`, // light pill background
  },
  seeWalletText: {
    fontSize: 14,
    fontWeight: '600',
    color: EARN_COLORS.primary,
    marginRight: 4,
  },
  breakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: EARN_COLORS.borderLight,
    paddingTop: 18,
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  breakdownDivider: {
    borderLeftWidth: 1,
    borderLeftColor: EARN_COLORS.borderLight,
  },
  breakdownAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: EARN_COLORS.textPrimary,
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: 12,
    color: EARN_COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
});
