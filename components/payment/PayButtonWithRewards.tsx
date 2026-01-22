/**
 * Pay Button With Rewards
 * 
 * Pay button showing amount and rewards preview
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/DesignTokens';
import { RewardsPreview } from '@/types/storePayment.types';
import { useRegion } from '@/contexts/RegionContext';


interface PayButtonWithRewardsProps {
  amountToPay: number;
  rewardsPreview?: RewardsPreview;
  isProcessing?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export const PayButtonWithRewards: React.FC<PayButtonWithRewardsProps> = ({
  amountToPay,
  rewardsPreview,
  isProcessing = false,
  disabled = false,
  onPress,
}) => {
  const { getCurrencySymbol } = useRegion();
  const currencySymbol = getCurrencySymbol();
  const isFreePayment = amountToPay === 0;
  const hasRewards = rewardsPreview && (rewardsPreview.cashback > 0 || rewardsPreview.coinsToEarn > 0);

  return (
    <View style={styles.container}>
      {/* Rewards Preview */}
      {hasRewards && (
        <View style={styles.rewardsPreview}>
          <Ionicons name="gift" size={14} color={COLORS.success[600]} />
          <Text style={styles.rewardsText}>
            You'll earn{' '}
            {rewardsPreview.cashback > 0 && (
              <Text style={styles.rewardsHighlight}>{currencySymbol}{rewardsPreview.cashback} cashback</Text>
            )}
            {rewardsPreview.cashback > 0 && rewardsPreview.coinsToEarn > 0 && ' + '}
            {rewardsPreview.coinsToEarn > 0 && (
              <Text style={styles.rewardsHighlight}>{rewardsPreview.coinsToEarn} coins</Text>
            )}
            {' '}after payment
          </Text>
        </View>
      )}

      {/* Pay Button */}
      <View style={styles.buttonRow}>
        <View style={styles.amountInfo}>
          <Text style={styles.amountLabel}>Total</Text>
          <Text style={styles.amountValue}>{currencySymbol}{amountToPay.toFixed(0)}</Text>
        </View>

        <TouchableOpacity
          style={styles.buttonWrapper}
          onPress={onPress}
          disabled={isProcessing || disabled}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              isProcessing || disabled
                ? [COLORS.neutral[400], COLORS.neutral[500]]
                : isFreePayment
                ? [COLORS.success[500], COLORS.success[600]]
                : [COLORS.primary[500], COLORS.primary[600]]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.buttonText}>
                  {isFreePayment ? 'Confirm Payment' : `Pay ${currencySymbol}${amountToPay.toFixed(0)}`}
                </Text>
                {!isFreePayment && hasRewards && (
                  <View style={styles.earnBadge}>
                    <Text style={styles.earnText}>& Earn Rewards</Text>
                  </View>
                )}
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Security Note */}
      <View style={styles.securityNote}>
        <Ionicons name="shield-checkmark" size={12} color={COLORS.text.tertiary} />
        <Text style={styles.securityText}>
          Secured by 256-bit encryption
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.md,
    backgroundColor: COLORS.background.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  rewardsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success[50],
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  rewardsText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success[700],
  },
  rewardsHighlight: {
    fontWeight: '700',
    color: COLORS.success[700],
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  amountInfo: {
    alignItems: 'flex-start',
  },
  amountLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  amountValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
  },
  buttonWrapper: {
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  buttonText: {
    ...TYPOGRAPHY.button,
    color: '#FFFFFF',
    fontSize: 17,
  },
  earnBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  earnText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    gap: 4,
  },
  securityText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.text.tertiary,
  },
});

export default PayButtonWithRewards;
