/**
 * Wallet Payment Option
 * 
 * Third-party wallet payment option (Paytm, Amazon Pay, Mobikwik)
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/DesignTokens';
import { ExternalWallet } from '@/types/storePayment.types';
import { useRegion } from '@/contexts/RegionContext';

interface WalletPaymentOptionProps {
  wallet: ExternalWallet;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export const WalletPaymentOption: React.FC<WalletPaymentOptionProps> = ({
  wallet,
  isSelected,
  onSelect,
  disabled = false,
}) => {
  const { getCurrencySymbol } = useRegion();
  const currencySymbol = getCurrencySymbol();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.containerSelected,
        disabled && styles.containerDisabled,
      ]}
      onPress={onSelect}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: wallet.color + '20' }]}>
        <Ionicons name={wallet.icon as any} size={20} color={wallet.color} />
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.walletName, disabled && styles.textDisabled]}>
          {wallet.name}
        </Text>
        {wallet.isLinked ? (
          <Text style={styles.linkedText}>
            {wallet.linkedPhone || wallet.linkedEmail || 'Linked'}
          </Text>
        ) : (
          <Text style={styles.linkText}>Tap to link</Text>
        )}
      </View>

      {wallet.balance !== undefined && wallet.isLinked && (
        <Text style={[styles.balance, { color: wallet.color }]}>
          {currencySymbol}{wallet.balance}
        </Text>
      )}

      {isSelected ? (
        <Ionicons name="checkmark-circle" size={20} color={COLORS.primary[500]} />
      ) : wallet.isLinked ? (
        <Ionicons name="ellipse-outline" size={20} color={COLORS.neutral[300]} />
      ) : (
        <Ionicons name="add-circle-outline" size={20} color={COLORS.primary[500]} />
      )}

      {!wallet.isLinked && (
        <View style={styles.comingSoonBadge}>
          <Text style={styles.comingSoonText}>Coming Soon</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  containerSelected: {
    borderColor: COLORS.primary[500],
    backgroundColor: COLORS.primary[50],
  },
  containerDisabled: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  infoContainer: {
    flex: 1,
  },
  walletName: {
    ...TYPOGRAPHY.button,
    color: COLORS.text.primary,
  },
  textDisabled: {
    color: COLORS.text.tertiary,
  },
  linkedText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success[600],
    marginTop: 2,
  },
  linkText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary[500],
    marginTop: 2,
  },
  balance: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    marginRight: SPACING.sm,
  },
  comingSoonBadge: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: COLORS.warning[100],
    borderRadius: BORDER_RADIUS.full,
  },
  comingSoonText: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.warning[700],
  },
});

export default WalletPaymentOption;
