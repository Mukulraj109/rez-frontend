// LockPriceModal.tsx - 3-hour lock at 5% with wallet payment
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import cartService, { LockFeeOption, LockWithPaymentRequest } from '@/services/cartApi';
import { triggerImpact, triggerNotification } from '@/utils/haptics';
import {
  Spacing,
  Shadows,
  BorderRadius,
} from '@/constants/DesignSystem';
import { useRegion } from '@/contexts/RegionContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LockPriceModalProps {
  visible: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  variant?: { type: string; value: string };
  onLockSuccess: (lockDetails: {
    lockFee: number;
    duration: number;
    expiresAt: string;
    message: string;
  }) => void;
}

// Fixed 3-hour lock duration
const LOCK_DURATION = 3;
const LOCK_PERCENTAGE = 5;

export default function LockPriceModal({
  visible,
  onClose,
  productId,
  productName,
  productPrice,
  quantity,
  variant,
  onLockSuccess,
}: LockPriceModalProps) {
  const { getCurrencySymbol } = useRegion();
  const currencySymbol = getCurrencySymbol();
  const backgroundColor = useThemeColor({}, 'background');
  const { state: authState } = useAuth();
  const { walletState, refreshWallet } = useWallet({
    userId: authState?.user?.id || '',
    autoFetch: true
  });
  const walletData = walletState?.data;

  const [lockOptions, setLockOptions] = useState<LockFeeOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPrice = productPrice * quantity;

  // Get the 3-hour lock option or calculate fee manually
  const lockOption = lockOptions.find(opt => opt.duration === LOCK_DURATION);
  const lockFee = lockOption?.fee || Math.ceil((totalPrice * LOCK_PERCENTAGE) / 100);

  // Get wallet balance
  const walletBalance = walletData?.availableBalance || 0;
  const hasEnoughBalance = walletBalance >= lockFee;

  // Fetch lock fee options when modal opens
  useEffect(() => {
    if (visible && productId) {
      fetchLockOptions();
      refreshWallet(true);
    }
  }, [visible, productId, quantity]);

  const fetchLockOptions = async () => {
    setIsLoadingOptions(true);
    setError(null);
    console.log('🔒 [LockModal] Fetching lock options for productId:', productId, 'quantity:', quantity);

    try {
      const response = await cartService.getLockFeeOptions(productId, quantity);
      console.log('🔒 [LockModal] Lock options response:', response);
      if (response.success && response.data) {
        console.log('🔒 [LockModal] Lock options received:', response.data.lockOptions);
        setLockOptions(response.data.lockOptions);
      } else {
        console.error('🔒 [LockModal] Failed to get lock options:', response.error);
        setError(response.error || 'Failed to load lock options');
      }
    } catch (err) {
      console.error('🔒 [LockModal] Error fetching lock options:', err);
      setError('Failed to load lock options. Please try again.');
    } finally {
      setIsLoadingOptions(false);
    }
  };

  // Execute the lock operation
  const executeLock = useCallback(async () => {
    if (!hasEnoughBalance) {
      setError(`Insufficient wallet balance. You need ${currencySymbol}${lockFee} but have ${currencySymbol}${walletBalance}`);
      return;
    }

    setIsLoading(true);
    setError(null);
    triggerImpact('Medium');

    console.log('🔒 [LockModal] ========== EXECUTING LOCK ==========');
    console.log('🔒 [LockModal] LOCK_DURATION constant:', LOCK_DURATION);

    try {
      const request: LockWithPaymentRequest = {
        productId,
        quantity,
        variant,
        duration: LOCK_DURATION,
        paymentMethod: 'wallet',
      };

      console.log('🔒 [LockModal] Lock request being sent:', JSON.stringify(request, null, 2));

      const response = await cartService.lockItemWithPayment(request);

      console.log('🔒 [LockModal] Lock response received:', response);

      if (response.success && response.data) {
        console.log('🔒 [LockModal] ✅ Lock successful! Details:', response.data.lockDetails);
        triggerNotification('Success');
        onLockSuccess({
          lockFee: response.data.lockDetails.lockFee,
          duration: response.data.lockDetails.duration,
          expiresAt: response.data.lockDetails.expiresAt,
          message: response.data.lockDetails.message,
        });
        onClose();
      } else {
        console.error('🔒 [LockModal] ❌ Lock failed:', response.error);
        setError(response.error || 'Failed to lock item');
        triggerNotification('Error');
      }
    } catch (err: any) {
      console.error('🔒 [LockModal] ❌ Lock exception:', err);
      setError(err.message || 'Failed to lock item. Please try again.');
      triggerNotification('Error');
    } finally {
      setIsLoading(false);
    }
  }, [productId, quantity, variant, hasEnoughBalance, lockFee, walletBalance, onLockSuccess, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="lock-closed" size={24} color="#7C3AED" />
            </View>
            <ThemedText style={styles.headerTitle}>Lock This Price</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Product Info */}
            <View style={styles.productInfo}>
              <ThemedText style={styles.productName} numberOfLines={2}>
                {productName}
              </ThemedText>
              <View style={styles.productPriceRow}>
                <ThemedText style={styles.productPriceLabel}>Current Price:</ThemedText>
                <ThemedText style={styles.productPrice}>{currencySymbol}{totalPrice.toLocaleString()}</ThemedText>
              </View>
              {quantity > 1 && (
                <ThemedText style={styles.quantityNote}>
                  Qty: {quantity} × {currencySymbol}{productPrice.toLocaleString()}
                </ThemedText>
              )}
            </View>

            {/* Loading State */}
            {isLoadingOptions ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7C3AED" />
                <ThemedText style={styles.loadingText}>Loading...</ThemedText>
              </View>
            ) : (
              <>
                {/* Lock Duration Info - Fixed 3 hours */}
                <View style={styles.lockDurationCard}>
                  <View style={styles.lockDurationHeader}>
                    <Ionicons name="time-outline" size={20} color="#7C3AED" />
                    <ThemedText style={styles.lockDurationTitle}>Lock Duration</ThemedText>
                  </View>
                  <View style={styles.lockDurationContent}>
                    <View style={styles.lockDurationBadge}>
                      <ThemedText style={styles.lockDurationValue}>3 Hours</ThemedText>
                    </View>
                    <ThemedText style={styles.lockDurationFeeText}>
                      {LOCK_PERCENTAGE}% lock fee = <ThemedText style={styles.lockDurationFeeAmount}>{currencySymbol}{lockFee}</ThemedText>
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.lockDurationNote}>
                    Price will be locked for 3 hours at the current rate
                  </ThemedText>
                </View>

                {/* Wallet Balance */}
                <View style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>Payment from Wallet</ThemedText>
                  <View style={styles.walletCard}>
                    <Ionicons name="wallet-outline" size={24} color="#7C3AED" />
                    <View style={styles.walletInfo}>
                      <ThemedText style={styles.walletLabel}>Available Balance</ThemedText>
                      <ThemedText style={[
                        styles.walletBalance,
                        hasEnoughBalance ? styles.balanceSufficient : styles.balanceInsufficient,
                      ]}>
                        {currencySymbol}{walletBalance.toFixed(0)}
                      </ThemedText>
                    </View>
                    {hasEnoughBalance ? (
                      <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                    ) : (
                      <Ionicons name="alert-circle" size={24} color="#F59E0B" />
                    )}
                  </View>
                </View>

                {/* Fee Summary */}
                <View style={styles.summarySection}>
                  <View style={styles.summaryRow}>
                    <ThemedText style={styles.summaryLabel}>Lock Fee ({LOCK_PERCENTAGE}%)</ThemedText>
                    <ThemedText style={styles.summaryValue}>{currencySymbol}{lockFee}</ThemedText>
                  </View>
                  <View style={styles.summaryNote}>
                    <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
                    <ThemedText style={styles.summaryNoteText}>
                      This amount will be deducted from your final payment at checkout
                    </ThemedText>
                  </View>
                </View>

                {/* Error Message */}
                {error && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={20} color="#EF4444" />
                    <ThemedText style={styles.errorText}>{error}</ThemedText>
                  </View>
                )}

                {/* Insufficient Balance Warning */}
                {!hasEnoughBalance && (
                  <View style={styles.warningContainer}>
                    <Ionicons name="wallet-outline" size={20} color="#F59E0B" />
                    <ThemedText style={styles.warningText}>
                      Add {currencySymbol}{(lockFee - walletBalance).toFixed(0)} to your wallet to lock this price
                    </ThemedText>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* Footer */}
          {!isLoadingOptions && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.lockButton,
                  (isLoading || !hasEnoughBalance) && styles.lockButtonDisabled,
                ]}
                onPress={executeLock}
                disabled={isLoading || !hasEnoughBalance}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={hasEnoughBalance && !isLoading ? ['#7C3AED', '#6D28D9'] : ['#9CA3AF', '#6B7280']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.lockButtonGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="lock-closed" size={20} color="#FFFFFF" />
                      <ThemedText style={styles.lockButtonText}>
                        {hasEnoughBalance ? `Lock for ${currencySymbol}${lockFee}` : 'Insufficient Balance'}
                      </ThemedText>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '90%',
    ...Shadows.large,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: Spacing.xs,
  },
  content: {
    padding: Spacing.lg,
  },
  productInfo: {
    backgroundColor: '#F9FAFB',
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: Spacing.xs,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPriceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7C3AED',
  },
  quantityNote: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: Spacing.xs,
  },
  lockDurationCard: {
    backgroundColor: '#FAF5FF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  lockDurationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  lockDurationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
  },
  lockDurationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  lockDurationBadge: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  lockDurationValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lockDurationFeeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  lockDurationFeeAmount: {
    fontWeight: '700',
    color: '#7C3AED',
  },
  lockDurationNote: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: Spacing.sm,
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: '#7C3AED',
    backgroundColor: '#FAF5FF',
  },
  walletInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  walletLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  walletBalance: {
    fontSize: 18,
    fontWeight: '700',
  },
  balanceSufficient: {
    color: '#10B981',
  },
  balanceInsufficient: {
    color: '#F59E0B',
  },
  summarySection: {
    backgroundColor: '#F9FAFB',
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  summaryNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },
  summaryNoteText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#EF4444',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#D97706',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: Spacing['2xl'],
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: 14,
    color: '#6B7280',
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  lockButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  lockButtonDisabled: {
    opacity: 0.7,
  },
  lockButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  lockButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
