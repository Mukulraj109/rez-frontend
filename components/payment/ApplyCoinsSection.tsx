/**
 * Apply Coins Section
 * 
 * Container for all coin toggles with auto-optimization badge
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@/constants/DesignTokens';
import { AppliedCoins } from '@/types/storePayment.types';
import CoinToggleRow from './CoinToggleRow';
import { useRegion } from '@/contexts/RegionContext';

interface ApplyCoinsSectionProps {
  appliedCoins: AppliedCoins;
  maxCoinRedemptionPercent: number;
  billAmount: number;
  isAutoOptimized: boolean;
  onCoinToggle: (coinType: 'rez' | 'promo' | 'branded', enabled: boolean) => void;
  onCoinAmountChange: (coinType: 'rez' | 'promo' | 'branded', amount: number) => void;
  onAutoOptimize: () => void;
}

export const ApplyCoinsSection: React.FC<ApplyCoinsSectionProps> = ({
  appliedCoins,
  maxCoinRedemptionPercent,
  billAmount,
  isAutoOptimized,
  onCoinToggle,
  onCoinAmountChange,
  onAutoOptimize,
}) => {
  const { getCurrencySymbol } = useRegion();
  const currencySymbol = getCurrencySymbol();
  const maxCoinsAllowed = Math.floor((billAmount * maxCoinRedemptionPercent) / 100);
  const totalAvailable = 
    appliedCoins.rezCoins.available + 
    appliedCoins.promoCoins.available + 
    (appliedCoins.brandedCoins?.available || 0);

  // Calculate max usable for each coin type considering others
  const getMaxUsable = (coinType: 'rez' | 'promo' | 'branded'): number => {
    const otherCoinsUsed = 
      (coinType !== 'rez' ? appliedCoins.rezCoins.using : 0) +
      (coinType !== 'promo' ? appliedCoins.promoCoins.using : 0) +
      (coinType !== 'branded' ? (appliedCoins.brandedCoins?.using || 0) : 0);
    
    const remaining = maxCoinsAllowed - otherCoinsUsed;
    
    switch (coinType) {
      case 'rez':
        return Math.min(appliedCoins.rezCoins.available, Math.max(0, remaining));
      case 'promo':
        return Math.min(appliedCoins.promoCoins.available, Math.max(0, remaining));
      case 'branded':
        return Math.min(appliedCoins.brandedCoins?.available || 0, Math.max(0, remaining));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Image
            source={require('@/assets/images/rez-coin.png')}
            style={styles.headerCoinIcon}
            resizeMode="contain"
          />
          <Text style={styles.sectionTitle}>Use Your Coins</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.autoOptimizeButton, isAutoOptimized && styles.autoOptimizeActive]}
          onPress={onAutoOptimize}
        >
          <Ionicons 
            name={isAutoOptimized ? 'checkmark-circle' : 'sparkles'} 
            size={14} 
            color={isAutoOptimized ? COLORS.success[600] : COLORS.primary[500]} 
          />
          <Text style={[styles.autoOptimizeText, isAutoOptimized && styles.autoOptimizeActiveText]}>
            {isAutoOptimized ? 'Auto-optimized' : 'Auto-optimize'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Use up to {maxCoinRedemptionPercent}% of your bill ({currencySymbol}{maxCoinsAllowed}) with coins
      </Text>

      {totalAvailable === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="wallet-outline" size={32} color={COLORS.neutral[300]} />
          <Text style={styles.emptyText}>No coins available</Text>
          <Text style={styles.emptySubtext}>Earn coins by making purchases!</Text>
        </View>
      ) : (
        <View style={styles.coinsContainer}>
          {/* Promo Coins - First priority (limited-time, max 20% cap) */}
          {appliedCoins.promoCoins.available > 0 && (
            <CoinToggleRow
              type="promo"
              name="Promo Coins"
              available={appliedCoins.promoCoins.available}
              using={appliedCoins.promoCoins.using}
              enabled={appliedCoins.promoCoins.enabled}
              maxUsable={getMaxUsable('promo')}
              expiringToday={appliedCoins.promoCoins.expiringToday}
              expiresIn={(appliedCoins.promoCoins as any).expiresIn}
              customColor={(appliedCoins.promoCoins as any).color || '#FFC857'}
              redemptionCap={(appliedCoins.promoCoins as any).redemptionCap || 20}
              onToggle={(enabled) => onCoinToggle('promo', enabled)}
              onAmountChange={(amount) => onCoinAmountChange('promo', amount)}
            />
          )}

          {/* Branded/Store Coins - Second priority (store-specific, no expiry) */}
          {appliedCoins.brandedCoins && appliedCoins.brandedCoins.available > 0 && (
            <CoinToggleRow
              type="branded"
              name={`${appliedCoins.brandedCoins.storeName} Coins`}
              available={appliedCoins.brandedCoins.available}
              using={appliedCoins.brandedCoins.using}
              enabled={appliedCoins.brandedCoins.enabled}
              maxUsable={getMaxUsable('branded')}
              storeName={appliedCoins.brandedCoins.storeName}
              customColor={(appliedCoins.brandedCoins as any).color || '#6366F1'}
              onToggle={(enabled) => onCoinToggle('branded', enabled)}
              onAmountChange={(amount) => onCoinAmountChange('branded', amount)}
            />
          )}

          {/* ReZ Coins - Third priority (universal, no cap) */}
          {appliedCoins.rezCoins.available > 0 && (
            <CoinToggleRow
              type="rez"
              name="ReZ Coins"
              available={appliedCoins.rezCoins.available}
              using={appliedCoins.rezCoins.using}
              enabled={appliedCoins.rezCoins.enabled}
              maxUsable={getMaxUsable('rez')}
              customColor={(appliedCoins.rezCoins as any).color || '#00C06A'}
              onToggle={(enabled) => onCoinToggle('rez', enabled)}
              onAmountChange={(amount) => onCoinAmountChange('rez', amount)}
            />
          )}
        </View>
      )}

      {/* Coins Applied Total Banner */}
      {appliedCoins.totalApplied > 0 && (
        <View style={styles.appliedBanner}>
          <Ionicons name="checkmark-circle" size={18} color={COLORS.success[600]} />
          <Text style={styles.appliedText}>
            Coins Applied: <Text style={styles.appliedAmount}>{currencySymbol}{appliedCoins.totalApplied}</Text>
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerCoinIcon: {
    width: 24,
    height: 24,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
  },
  autoOptimizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary[50],
    borderWidth: 1,
    borderColor: COLORS.primary[200],
    gap: 4,
  },
  autoOptimizeActive: {
    backgroundColor: COLORS.success[50],
    borderColor: COLORS.success[200],
  },
  autoOptimizeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary[600],
    fontWeight: '600',
  },
  autoOptimizeActiveText: {
    color: COLORS.success[600],
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginBottom: SPACING.lg,
  },
  coinsContainer: {
    marginTop: SPACING.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    marginTop: SPACING.sm,
  },
  emptySubtext: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
    marginTop: 4,
  },
  appliedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  appliedText: {
    ...TYPOGRAPHY.body,
    color: COLORS.success[700],
  },
  appliedAmount: {
    fontWeight: '700',
  },
});

export default ApplyCoinsSection;
