/**
 * Pay In Store - Enter Amount Screen
 *
 * Allows users to enter the bill amount and see:
 * - Preview of rewards they'll earn
 * - Option to check offers or pay directly
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@/constants/DesignTokens';
import { EnterAmountParams, StorePaymentInfo, StoreRewardRules } from '@/types/storePayment.types';
import apiClient from '@/services/apiClient';

export default function EnterAmountScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<EnterAmountParams>();
  const { storeId, storeName, storeLogo } = params;

  const [amount, setAmount] = useState('');
  const [store, setStore] = useState<StorePaymentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStoreDetails();
  }, [storeId]);

  const loadStoreDetails = async () => {
    if (!storeId) {
      setError('Store ID is required');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // Use the lookup endpoint to get store payment info
      const response = await apiClient.get(`/stores/${storeId}`);
      if (response.data?.success) {
        setStore(response.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load store:', err);
      // Continue anyway - we have the basic info from params
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (value: string) => {
    // Remove non-numeric characters except decimal
    const cleaned = value.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].slice(0, 2);
    }
    return cleaned;
  };

  const handleAmountChange = (value: string) => {
    setAmount(formatAmount(value));
    setError(null);
  };

  const numericAmount = parseFloat(amount) || 0;
  const rewardRules = store?.rewardRules;

  // Calculate estimated rewards
  const estimatedCashback = rewardRules
    ? Math.floor((numericAmount * (rewardRules.baseCashbackPercent || 5)) / 100)
    : Math.floor(numericAmount * 0.05);

  const estimatedCoins = rewardRules
    ? Math.floor(numericAmount / 10) // 1 coin per ₹10 spent (default)
    : Math.floor(numericAmount / 10);

  const meetsMinimum = !rewardRules?.minimumAmountForReward ||
    numericAmount >= rewardRules.minimumAmountForReward;

  const handlePayNow = () => {
    if (!validateAmount()) return;

    router.push({
      pathname: '/pay-in-store/payment',
      params: {
        storeId,
        storeName,
        amount: numericAmount.toString(),
      },
    });
  };

  const handleCheckOffers = () => {
    if (!validateAmount()) return;

    router.push({
      pathname: '/pay-in-store/offers',
      params: {
        storeId,
        storeName,
        amount: numericAmount.toString(),
      },
    });
  };

  const validateAmount = (): boolean => {
    if (!amount || numericAmount <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    if (numericAmount < 1) {
      setError('Minimum amount is ₹1');
      return false;
    }
    if (numericAmount > 100000) {
      setError('Maximum amount is ₹1,00,000');
      return false;
    }
    return true;
  };

  const quickAmounts = [100, 200, 500, 1000, 2000];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Enter Amount</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Store Info */}
          <View style={styles.storeCard}>
            <View style={styles.storeIconContainer}>
              {storeLogo ? (
                <Image source={{ uri: storeLogo }} style={styles.storeLogo} />
              ) : (
                <Ionicons name="storefront" size={32} color={COLORS.primary[500]} />
              )}
            </View>
            <View style={styles.storeInfo}>
              <Text style={styles.storeName}>{storeName || 'Store'}</Text>
              {store?.category?.name && (
                <Text style={styles.storeCategory}>{store.category.name}</Text>
              )}
            </View>
            {store?.ratings && store.ratings.count > 0 && (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.ratingText}>{store.ratings.average.toFixed(1)}</Text>
              </View>
            )}
          </View>

          {/* Amount Input */}
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Bill Amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={COLORS.text.tertiary}
                maxLength={8}
                autoFocus
              />
            </View>

            {/* Quick Amount Buttons */}
            <View style={styles.quickAmounts}>
              {quickAmounts.map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  style={[
                    styles.quickAmountButton,
                    numericAmount === quickAmount && styles.quickAmountButtonActive,
                  ]}
                  onPress={() => setAmount(quickAmount.toString())}
                >
                  <Text
                    style={[
                      styles.quickAmountText,
                      numericAmount === quickAmount && styles.quickAmountTextActive,
                    ]}
                  >
                    ₹{quickAmount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={COLORS.error[500]} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>

          {/* Rewards Preview */}
          {numericAmount > 0 && (
            <View style={styles.rewardsPreview}>
              <Text style={styles.rewardsTitle}>You'll Earn</Text>

              <View style={styles.rewardsGrid}>
                <View style={styles.rewardItem}>
                  <View style={[styles.rewardIcon, { backgroundColor: COLORS.success[50] }]}>
                    <Ionicons name="cash-outline" size={20} color={COLORS.success[500]} />
                  </View>
                  <Text style={styles.rewardValue}>
                    ₹{meetsMinimum ? estimatedCashback : 0}
                  </Text>
                  <Text style={styles.rewardLabel}>Cashback</Text>
                </View>

                <View style={styles.rewardDivider} />

                <View style={styles.rewardItem}>
                  <View style={[styles.rewardIcon, { backgroundColor: COLORS.primary[50] }]}>
                    <Ionicons name="diamond-outline" size={20} color={COLORS.primary[500]} />
                  </View>
                  <Text style={styles.rewardValue}>
                    {meetsMinimum ? estimatedCoins : 0}
                  </Text>
                  <Text style={styles.rewardLabel}>ReZ Coins</Text>
                </View>
              </View>

              {!meetsMinimum && rewardRules?.minimumAmountForReward && (
                <View style={styles.minimumWarning}>
                  <Ionicons name="information-circle" size={16} color={COLORS.warning[500]} />
                  <Text style={styles.minimumWarningText}>
                    Spend ₹{rewardRules.minimumAmountForReward} or more to earn rewards
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Extra Reward Banner */}
          {rewardRules?.extraRewardThreshold && numericAmount >= rewardRules.extraRewardThreshold && (
            <LinearGradient
              colors={[COLORS.secondary[500], COLORS.secondary[600]]}
              style={styles.extraRewardBanner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="gift" size={24} color="#FFFFFF" />
              <View style={styles.extraRewardContent}>
                <Text style={styles.extraRewardTitle}>Bonus Reward!</Text>
                <Text style={styles.extraRewardText}>
                  Earn extra {rewardRules.extraRewardCoins} coins for spending ₹{rewardRules.extraRewardThreshold}+
                </Text>
              </View>
            </LinearGradient>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Bottom Action Buttons */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.checkOffersButton}
            onPress={handleCheckOffers}
            disabled={!amount || numericAmount <= 0}
          >
            <Ionicons name="pricetag-outline" size={20} color={COLORS.primary[500]} />
            <Text style={styles.checkOffersText}>Check Offers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.payNowButton,
              (!amount || numericAmount <= 0) && styles.payNowButtonDisabled,
            ]}
            onPress={handlePayNow}
            disabled={!amount || numericAmount <= 0}
          >
            <Text style={styles.payNowText}>Pay Now</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  storeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  storeLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  storeInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  storeName: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
  },
  storeCategory: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning[50],
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  ratingText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.warning[700],
    fontWeight: '600',
    marginLeft: 4,
  },
  amountSection: {
    backgroundColor: COLORS.background.primary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  amountLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary[500],
    paddingBottom: SPACING.sm,
  },
  currencySymbol: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginRight: SPACING.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.text.primary,
    padding: 0,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  quickAmountButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.neutral[100],
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  quickAmountButtonActive: {
    backgroundColor: COLORS.primary[50],
    borderColor: COLORS.primary[500],
  },
  quickAmountText: {
    ...TYPOGRAPHY.buttonSmall,
    color: COLORS.text.secondary,
  },
  quickAmountTextActive: {
    color: COLORS.primary[600],
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.error[50],
    borderRadius: BORDER_RADIUS.md,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error[500],
    marginLeft: SPACING.xs,
  },
  rewardsPreview: {
    backgroundColor: COLORS.background.primary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  rewardsTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  rewardsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardItem: {
    flex: 1,
    alignItems: 'center',
  },
  rewardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  rewardValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
  },
  rewardLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  rewardDivider: {
    width: 1,
    height: 60,
    backgroundColor: COLORS.border.light,
    marginHorizontal: SPACING.md,
  },
  minimumWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.warning[50],
    borderRadius: BORDER_RADIUS.md,
  },
  minimumWarningText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.warning[700],
    marginLeft: SPACING.xs,
    flex: 1,
  },
  extraRewardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  extraRewardContent: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  extraRewardTitle: {
    ...TYPOGRAPHY.button,
    color: '#FFFFFF',
  },
  extraRewardText: {
    ...TYPOGRAPHY.caption,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.md,
    backgroundColor: COLORS.background.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    gap: SPACING.md,
  },
  checkOffersButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.primary[500],
    gap: SPACING.sm,
  },
  checkOffersText: {
    ...TYPOGRAPHY.button,
    color: COLORS.primary[500],
  },
  payNowButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary[500],
    gap: SPACING.sm,
  },
  payNowButtonDisabled: {
    backgroundColor: COLORS.neutral[300],
  },
  payNowText: {
    ...TYPOGRAPHY.button,
    color: '#FFFFFF',
  },
});
