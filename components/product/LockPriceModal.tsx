// LockPriceModal.tsx - 3-hour lock at 5% with PayBill top-up flow
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
import { paybillApi } from '@/services/paybillApi';
import { triggerImpact, triggerNotification } from '@/utils/haptics';
import AddMoneyModal from './AddMoneyModal';
import {
  Colors,
  Spacing,
  Shadows,
  BorderRadius,
  Typography,
} from '@/constants/DesignSystem';

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

type PaymentMethod = 'wallet' | 'paybill';

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
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const { state: authState } = useAuth();
  const { walletState, refreshWallet } = useWallet({
    userId: authState?.user?.id || '',
    autoFetch: true
  });
  const walletData = walletState?.data;

  const [lockOptions, setLockOptions] = useState<LockFeeOption[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('wallet');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paybillBalanceState, setPaybillBalanceState] = useState<number>(0);
  const [isPaybillLoading, setIsPaybillLoading] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [pendingAutoLock, setPendingAutoLock] = useState(false);

  const totalPrice = productPrice * quantity;

  // Get the 3-hour lock option or calculate fee manually
  const lockOption = lockOptions.find(opt => opt.duration === LOCK_DURATION);
  const lockFee = lockOption?.fee || Math.ceil((totalPrice * LOCK_PERCENTAGE) / 100);

  // Get wallet balance (available balance, excludes paybill) from wallet API
  const walletBalance = walletData?.availableBalance || 0;
  // PayBill balance is fetched separately from paybillApi
  const paybillBalance = paybillBalanceState;

  // Check if selected payment method has enough balance
  const currentBalance = selectedPaymentMethod === 'wallet' ? walletBalance : paybillBalance;
  const hasEnoughBalance = currentBalance >= lockFee;

  // Fetch PayBill balance
  const fetchPaybillBalance = async () => {
    setIsPaybillLoading(true);
    console.log('🔒 [LockModal] Fetching PayBill balance...');
    try {
      const response = await paybillApi.getBalance();
      console.log('🔒 [LockModal] PayBill balance response:', JSON.stringify(response, null, 2));
      if (response.success && response.data) {
        const balance = response.data.paybillBalance || 0;
        console.log('🔒 [LockModal] Setting PayBill balance:', balance);
        setPaybillBalanceState(balance);
      } else {
        console.error('🔒 [LockModal] Failed to get PayBill balance:', response.error);
        setPaybillBalanceState(0);
      }
    } catch (error) {
      console.error('🔒 [LockModal] Error fetching PayBill balance:', error);
      setPaybillBalanceState(0);
    } finally {
      setIsPaybillLoading(false);
    }
  };

  // Fetch lock fee options and balances when modal opens
  useEffect(() => {
    if (visible && productId) {
      fetchLockOptions();
      refreshWallet(true);
      fetchPaybillBalance();
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
    setIsLoading(true);
    setError(null);
    triggerImpact('Medium');

    console.log('🔒 [LockModal] ========== EXECUTING LOCK ==========');
    console.log('🔒 [LockModal] LOCK_DURATION constant:', LOCK_DURATION);
    console.log('🔒 [LockModal] Selected payment method:', selectedPaymentMethod);

    try {
      const request: LockWithPaymentRequest = {
        productId,
        quantity,
        variant,
        duration: LOCK_DURATION,
        paymentMethod: selectedPaymentMethod,
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
      setPendingAutoLock(false);
    }
  }, [productId, quantity, variant, selectedPaymentMethod, onLockSuccess, onClose]);

  // Handle lock button press
  const handleLockPress = useCallback(async () => {
    // Check if selected payment method has enough balance
    if (selectedPaymentMethod === 'wallet') {
      if (walletBalance >= lockFee) {
        // Wallet has enough - proceed with lock
        await executeLock();
      } else {
        // Wallet insufficient - open PayBill top-up modal
        // After top-up, lock will proceed with PayBill
        console.log('🔒 [LockModal] Wallet insufficient, opening top-up modal');
        setShowTopupModal(true);
      }
    } else {
      // PayBill selected
      if (paybillBalance >= lockFee) {
        // PayBill has enough - proceed with lock
        await executeLock();
      } else {
        // PayBill insufficient - open top-up modal
        console.log('🔒 [LockModal] PayBill insufficient, opening top-up modal');
        setShowTopupModal(true);
      }
    }
  }, [walletBalance, paybillBalance, lockFee, selectedPaymentMethod, executeLock]);

  // Handle successful top-up - auto-lock
  const handleTopupSuccess = useCallback(async (newBalance: number) => {
    console.log('🔒 [LockModal] Top-up callback received! Balance from modal:', newBalance);
    setShowTopupModal(false);

    // Always fetch the actual balance from the server to ensure accuracy
    console.log('🔒 [LockModal] Fetching actual PayBill balance from server...');
    try {
      const response = await paybillApi.getBalance();
      if (response.success && response.data) {
        const actualBalance = response.data.paybillBalance || 0;
        console.log('🔒 [LockModal] Actual PayBill balance from server:', actualBalance);
        setPaybillBalanceState(actualBalance);

        // Only proceed with auto-lock if actual balance is sufficient
        if (actualBalance >= lockFee) {
          console.log('🔒 [LockModal] Balance sufficient, setting up auto-lock with PayBill...');
          setSelectedPaymentMethod('paybill');
          setPendingAutoLock(true);
        } else {
          console.error('🔒 [LockModal] Balance still insufficient after top-up. Expected:', lockFee, 'Got:', actualBalance);
          setError(`Top-up succeeded but balance (₹${actualBalance}) is still less than lock fee (₹${lockFee}). Please try again.`);
        }
      } else {
        console.error('🔒 [LockModal] Failed to verify balance:', response.error);
        // Fall back to the balance passed from modal
        setPaybillBalanceState(newBalance);
        if (newBalance >= lockFee) {
          setSelectedPaymentMethod('paybill');
          setPendingAutoLock(true);
        }
      }
    } catch (error) {
      console.error('🔒 [LockModal] Error fetching balance after top-up:', error);
      // Fall back to the balance passed from modal
      setPaybillBalanceState(newBalance);
      if (newBalance >= lockFee) {
        setSelectedPaymentMethod('paybill');
        setPendingAutoLock(true);
      }
    }
  }, [lockFee]);

  // Auto-execute lock after top-up
  useEffect(() => {
    if (pendingAutoLock && paybillBalanceState >= lockFee) {
      console.log('🔒 [LockModal] Auto-executing lock after top-up...');
      console.log('🔒 [LockModal] PayBill balance:', paybillBalanceState, 'Lock fee:', lockFee);
      executeLock();
    }
  }, [pendingAutoLock, paybillBalanceState, lockFee, executeLock]);

  const renderPaymentMethod = (method: PaymentMethod, label: string, balance: number, icon: string) => {
    const isSelected = selectedPaymentMethod === method;
    const hasBalance = balance >= lockFee;

    return (
      <TouchableOpacity
        style={[
          styles.paymentOption,
          isSelected && styles.paymentOptionSelected,
        ]}
        onPress={() => {
          triggerImpact('Light');
          setSelectedPaymentMethod(method);
          setError(null);
        }}
        activeOpacity={0.7}
      >
        <Ionicons
          name={icon as any}
          size={24}
          color={isSelected ? '#7C3AED' : '#6B7280'}
        />
        <View style={styles.paymentInfo}>
          <ThemedText style={[
            styles.paymentLabel,
            isSelected && styles.paymentLabelSelected,
          ]}>
            {label}
          </ThemedText>
          <ThemedText style={[
            styles.paymentBalance,
            !hasBalance && styles.paymentBalanceInsufficient,
            hasBalance && styles.paymentBalanceSufficient,
          ]}>
            ₹{balance.toFixed(0)} {!hasBalance && '(Add Money)'}
          </ThemedText>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color="#7C3AED" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
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
                  <ThemedText style={styles.productPrice}>₹{totalPrice.toLocaleString()}</ThemedText>
                </View>
                {quantity > 1 && (
                  <ThemedText style={styles.quantityNote}>
                    Qty: {quantity} × ₹{productPrice.toLocaleString()}
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
                        {LOCK_PERCENTAGE}% lock fee = <ThemedText style={styles.lockDurationFeeAmount}>₹{lockFee}</ThemedText>
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.lockDurationNote}>
                      Price will be locked for 3 hours at the current rate
                    </ThemedText>
                  </View>

                  {/* Payment Method */}
                  <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Payment Method</ThemedText>
                    <View style={styles.paymentList}>
                      {renderPaymentMethod('wallet', 'Wallet', walletBalance, 'wallet-outline')}
                      {renderPaymentMethod('paybill', 'PayBill', paybillBalance, 'card-outline')}
                    </View>
                  </View>

                  {/* Fee Summary */}
                  <View style={styles.summarySection}>
                    <View style={styles.summaryRow}>
                      <ThemedText style={styles.summaryLabel}>Lock Fee ({LOCK_PERCENTAGE}%)</ThemedText>
                      <ThemedText style={styles.summaryValue}>₹{lockFee}</ThemedText>
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
                </>
              )}
            </ScrollView>

            {/* Footer */}
            {!isLoadingOptions && (
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[
                    styles.lockButton,
                    isLoading && styles.lockButtonDisabled,
                  ]}
                  onPress={handleLockPress}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={!isLoading ? ['#7C3AED', '#6D28D9'] : ['#9CA3AF', '#6B7280']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.lockButtonGradient}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : hasEnoughBalance ? (
                      <>
                        <Ionicons name="lock-closed" size={20} color="#FFFFFF" />
                        <ThemedText style={styles.lockButtonText}>
                          Lock for ₹{lockFee}
                        </ThemedText>
                      </>
                    ) : (
                      <>
                        <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                        <ThemedText style={styles.lockButtonText}>
                          Add Money & Lock
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

      {/* Add Money Modal */}
      <AddMoneyModal
        visible={showTopupModal}
        onClose={() => setShowTopupModal(false)}
        onSuccess={handleTopupSuccess}
        requiredAmount={lockFee}
        currentBalance={paybillBalance}
        discountPercentage={20}
      />
    </>
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
  paymentList: {
    gap: Spacing.sm,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  paymentOptionSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#FAF5FF',
  },
  paymentInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  paymentLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  paymentLabelSelected: {
    color: '#7C3AED',
  },
  paymentBalance: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  paymentBalanceInsufficient: {
    color: '#F59E0B',
  },
  paymentBalanceSufficient: {
    color: '#10B981',
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
