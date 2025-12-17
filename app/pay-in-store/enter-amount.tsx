/**
 * Pay In Store - Enter Amount Screen
 *
 * Allows users to enter the bill amount and see:
 * - Preview of rewards they'll earn
 * - Option to check offers or pay directly
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/DesignTokens';
import { EnterAmountParams, StorePaymentInfo } from '@/types/storePayment.types';
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
      const response = await apiClient.get(`/stores/${storeId}`);
      if (response.success && response.data) {
        setStore(response.data);
      }
    } catch (err: any) {
      console.error('Failed to load store:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
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

  const estimatedCashback = rewardRules
    ? Math.floor((numericAmount * (rewardRules.baseCashbackPercent || 5)) / 100)
    : Math.floor(numericAmount * 0.05);

  const estimatedCoins = rewardRules
    ? Math.floor(numericAmount / 10)
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
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Enter Amount</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Store Info */}
          <View style={styles.storeCard}>
            <View style={styles.storeIconContainer}>
              {storeLogo ? (
                <Image source={{ uri: storeLogo }} style={styles.storeLogo} />
              ) : (
                <Ionicons name="storefront" size={24} color="#9CA3AF" />
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
            <Text style={styles.amountLabel}>BILL AMOUNT</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                maxLength={8}
                autoFocus
              />
            </View>

            {/* Quick Amount Buttons */}
            <View style={styles.quickAmountsContainer}>
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
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
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
                  <View style={[styles.rewardIcon, { backgroundColor: '#DCFCE7' }]}>
                    <Ionicons name="cash-outline" size={20} color="#16A34A" />
                  </View>
                  <Text style={styles.rewardValue}>
                    ₹{meetsMinimum ? estimatedCashback : 0}
                  </Text>
                  <Text style={styles.rewardLabel}>Cashback</Text>
                </View>

                <View style={styles.rewardDivider} />

                <View style={styles.rewardItem}>
                  <View style={[styles.rewardIcon, { backgroundColor: '#FFF8E1' }]}>
                    <Image
                      source={require('@/assets/images/rez-coin.png')}
                      style={styles.coinImage}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.rewardValue}>
                    {meetsMinimum ? estimatedCoins : 0}
                  </Text>
                  <Text style={styles.rewardLabel}>ReZ Coins</Text>
                </View>
              </View>

              {!meetsMinimum && rewardRules?.minimumAmountForReward && (
                <View style={styles.minimumWarning}>
                  <Ionicons name="information-circle" size={16} color="#F59E0B" />
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
              colors={['#FFC857', '#F59E0B']}
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

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom Action Buttons */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.checkOffersButton}
            onPress={handleCheckOffers}
            disabled={!amount || numericAmount <= 0}
          >
            <Ionicons name="pricetag-outline" size={18} color="#00C06A" />
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
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingLeft: 90,
    paddingRight: 10,
    marginLeft: 70,
    marginRight: -130,
  },
  storeCard: {
    
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  storeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  storeLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  storeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  storeCategory: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#B45309',
    fontWeight: '600',
    marginLeft: 4,
  },
  amountSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    letterSpacing: 1,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#00C06A',
    paddingBottom: 8,
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 40,
    fontWeight: '700',
    color: '#111827',
    padding: 0,
  },
  quickAmountsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickAmountButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickAmountButtonActive: {
    backgroundColor: '#E8FFF3',
    borderColor: '#00C06A',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  quickAmountTextActive: {
    color: '#00C06A',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    marginLeft: 6,
  },
  rewardsPreview: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  rewardsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  coinImage: {
    width: 24,
    height: 24,
  },
  rewardValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  rewardLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  rewardDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  minimumWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 10,
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
  },
  minimumWarningText: {
    fontSize: 12,
    color: '#B45309',
    marginLeft: 6,
    flex: 1,
  },
  extraRewardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  extraRewardContent: {
    marginLeft: 12,
    flex: 1,
  },
  extraRewardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  extraRewardText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  checkOffersButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00C06A',
    gap: 6,
  },
  checkOffersText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00C06A',
  },
  payNowButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#00C06A',
    gap: 6,
  },
  payNowButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  payNowText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
