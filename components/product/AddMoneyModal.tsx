// AddMoneyModal.tsx - Modal for adding money to PayBill when lock balance is insufficient
import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeCardForm from '@/components/payment/StripeCardForm';
import walletPayBillService from '@/services/walletPayBillApi';
import { paybillApi } from '@/services/paybillApi';
import {
  Spacing,
  BorderRadius,
} from '@/constants/DesignSystem';

// Load Stripe publishable key from environment
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

interface AddMoneyModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (newBalance: number) => void;
  requiredAmount: number; // Minimum amount needed (lock fee)
  currentBalance: number;
  discountPercentage?: number;
}

export default function AddMoneyModal({
  visible,
  onClose,
  onSuccess,
  requiredAmount,
  currentBalance,
  discountPercentage = 20,
}: AddMoneyModalProps) {
  // Calculate minimum amount needed to cover the lock fee
  const shortfall = Math.max(0, requiredAmount - currentBalance);
  const suggestedAmount = Math.ceil(shortfall / (1 + discountPercentage / 100)); // Account for bonus

  const [amount, setAmount] = useState(suggestedAmount > 10 ? suggestedAmount.toString() : '50');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      const newSuggested = Math.ceil(shortfall / (1 + discountPercentage / 100));
      setAmount(newSuggested > 10 ? newSuggested.toString() : '50');
      setErrorMessage('');
      setShowPaymentModal(false);
      setShowStripeModal(false);
    }
  }, [visible, shortfall, discountPercentage]);

  // Input sanitization
  const sanitizeAmount = (input: string): string => {
    let sanitized = input.replace(/[^0-9]/g, '');
    sanitized = sanitized.slice(0, 6);
    if (sanitized.length > 1 && sanitized[0] === '0') {
      sanitized = sanitized.slice(1);
    }
    return sanitized;
  };

  // Calculate bonus
  const numericAmount = parseFloat(amount) || 0;
  const bonus = Math.round((numericAmount * discountPercentage) / 100);
  const total = numericAmount + bonus;
  const newBalance = currentBalance + total;
  const willCoverLockFee = newBalance >= requiredAmount;

  // Cleanup payment data
  const cleanupPaymentData = () => {
    setClientSecret('');
    setPaymentIntentId('');
  };

  const handleAddMoney = () => {
    if (numericAmount < 10) {
      setErrorMessage('Minimum amount is ₹10');
      return;
    }
    if (!willCoverLockFee) {
      setErrorMessage(`Add at least ₹${Math.ceil(shortfall / (1 + discountPercentage / 100))} to cover the lock fee`);
      return;
    }
    setErrorMessage('');
    setShowPaymentModal(true);
  };

  const handleMethodSelect = async (method: 'card' | 'upi') => {
    setShowPaymentModal(false);
    setIsCreatingIntent(true);
    setErrorMessage('');
    cleanupPaymentData();

    try {
      const response = await walletPayBillService.createPaymentIntent({
        amount: numericAmount,
        bonusAmount: bonus,
        paymentType: method,
        currency: 'INR',
        discountPercentage: discountPercentage, // Backend expects this to calculate bonus
        metadata: {
          bonusPercentage: discountPercentage,
          walletTopup: true,
          platform: Platform.OS,
          purpose: 'lock_fee_topup'
        }
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create payment intent');
      }

      const { clientSecret: secret, paymentIntentId: intentId } = response.data;
      setClientSecret(secret);
      setPaymentIntentId(intentId);

      if (method === 'card') {
        setShowStripeModal(true);
      }
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      setErrorMessage(error.message || 'Failed to initiate payment');
    } finally {
      setIsCreatingIntent(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setShowStripeModal(false);
    setIsProcessing(true);

    try {
      console.log('💳 [AddMoneyModal] Confirming payment with intent:', paymentIntentId);

      const confirmResponse = await walletPayBillService.confirmPayment({
        paymentIntentId,
        timestamp: new Date().toISOString()
      });

      console.log('💳 [AddMoneyModal] Confirm response:', JSON.stringify(confirmResponse, null, 2));

      if (!confirmResponse.success || !confirmResponse.data) {
        throw new Error(confirmResponse.error || 'Failed to confirm payment');
      }

      // Get the new balance - prioritize backend's paybillBalance
      // Backend returns: { paybillBalance: number, wallet: { newBalance }, ... }
      let finalPaybillBalance: number;

      if (typeof confirmResponse.data.paybillBalance === 'number') {
        // Backend explicitly returned paybillBalance - use this
        finalPaybillBalance = confirmResponse.data.paybillBalance;
        console.log('💳 [AddMoneyModal] Using backend paybillBalance:', finalPaybillBalance);
      } else if (typeof confirmResponse.data.wallet?.newBalance === 'number') {
        // Fallback to wallet.newBalance (which is the paybill balance after addition)
        finalPaybillBalance = confirmResponse.data.wallet.newBalance;
        console.log('💳 [AddMoneyModal] Using wallet.newBalance:', finalPaybillBalance);
      } else {
        // Last resort: use calculated value
        console.warn('💳 [AddMoneyModal] No balance in response, using calculated:', newBalance);
        finalPaybillBalance = newBalance;
      }

      cleanupPaymentData();

      console.log('💳 [AddMoneyModal] Calling onSuccess with balance:', finalPaybillBalance);

      // Call onSuccess with new balance - this will trigger auto-lock
      onSuccess(finalPaybillBalance);
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      setErrorMessage(error.message || 'Payment confirmation failed');
      cleanupPaymentData();
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error: string) => {
    setShowStripeModal(false);
    setErrorMessage(error);
    cleanupPaymentData();
  };

  const handlePaymentCancel = () => {
    setShowStripeModal(false);
    cleanupPaymentData();
  };

  // Quick amount buttons
  const quickAmounts = [50, 100, 200, 500];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="wallet" size={24} color="#8B5CF6" />
            </View>
            <ThemedText style={styles.headerTitle}>Add Money to PayBill</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={20} color="#8B5CF6" />
            <ThemedText style={styles.infoText}>
              Add ₹{Math.ceil(shortfall / (1 + discountPercentage / 100))} or more to cover the lock fee of ₹{requiredAmount}
            </ThemedText>
          </View>

          {/* Error Message */}
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color="#EF4444" />
              <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
            </View>
          ) : null}

          {/* Quick Amount Buttons */}
          <View style={styles.quickAmounts}>
            {quickAmounts.map((amt) => (
              <TouchableOpacity
                key={amt}
                style={[
                  styles.quickAmountBtn,
                  numericAmount === amt && styles.quickAmountBtnActive,
                ]}
                onPress={() => setAmount(amt.toString())}
              >
                <ThemedText
                  style={[
                    styles.quickAmountText,
                    numericAmount === amt && styles.quickAmountTextActive,
                  ]}
                >
                  ₹{amt}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount Input */}
          <View style={styles.amountSection}>
            <View style={styles.amountRow}>
              <ThemedText style={styles.label}>You pay:</ThemedText>
              <View style={styles.amountInputContainer}>
                <ThemedText style={styles.currencySymbol}>₹</ThemedText>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={(text) => setAmount(sanitizeAmount(text))}
                  keyboardType="numeric"
                  placeholder="50"
                  placeholderTextColor="#999"
                  maxLength={6}
                />
              </View>
            </View>

            <View style={styles.amountRow}>
              <ThemedText style={styles.label}>Bonus ({discountPercentage}%):</ThemedText>
              <ThemedText style={styles.bonusAmount}>+₹{bonus}</ThemedText>
            </View>

            <View style={styles.divider} />

            <View style={styles.amountRow}>
              <ThemedText style={styles.totalLabel}>You get:</ThemedText>
              <ThemedText style={styles.totalAmount}>₹{total}</ThemedText>
            </View>

            <View style={styles.amountRow}>
              <ThemedText style={styles.label}>New PayBill Balance:</ThemedText>
              <ThemedText style={[
                styles.balanceAmount,
                willCoverLockFee && styles.sufficientBalance,
              ]}>
                ₹{newBalance}
              </ThemedText>
            </View>

            {willCoverLockFee && (
              <View style={styles.successBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <ThemedText style={styles.successBadgeText}>
                  Sufficient to cover lock fee (₹{requiredAmount})
                </ThemedText>
              </View>
            )}
          </View>

          {/* Add Money Button */}
          <TouchableOpacity
            style={[
              styles.addMoneyButton,
              (!willCoverLockFee || isCreatingIntent || isProcessing) && styles.buttonDisabled,
            ]}
            onPress={handleAddMoney}
            disabled={!willCoverLockFee || isCreatingIntent || isProcessing}
          >
            {isCreatingIntent || isProcessing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                <ThemedText style={styles.addMoneyButtonText}>
                  Add ₹{numericAmount} & Lock Price
                </ThemedText>
              </>
            )}
          </TouchableOpacity>

          <ThemedText style={styles.noteText}>
            Get {discountPercentage}% extra on every topup!
          </ThemedText>
        </View>

        {/* Payment Method Selection Modal */}
        <Modal
          visible={showPaymentModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPaymentModal(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.paymentModalContainer}>
              <View style={styles.paymentModalHeader}>
                <ThemedText style={styles.paymentModalTitle}>Select Payment Method</ThemedText>
                <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.paymentOption}
                onPress={() => handleMethodSelect('card')}
              >
                <View style={styles.paymentOptionIcon}>
                  <Ionicons name="card" size={28} color="#4A90E2" />
                </View>
                <View style={styles.paymentOptionContent}>
                  <ThemedText style={styles.paymentOptionTitle}>Credit/Debit Card</ThemedText>
                  <ThemedText style={styles.paymentOptionSubtitle}>Pay securely with your card</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>

              <View style={styles.paymentFooter}>
                <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                <ThemedText style={styles.secureText}>100% Secure Payment</ThemedText>
              </View>
            </View>
          </View>
        </Modal>

        {/* Stripe Payment Modal */}
        {showStripeModal && clientSecret && stripePromise && (
          <Modal
            visible={showStripeModal}
            transparent
            animationType="fade"
            onRequestClose={handlePaymentCancel}
          >
            <View style={styles.overlay}>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripeCardForm
                  clientSecret={clientSecret}
                  amount={numericAmount}
                  displayAmount={total}
                  title={`Add ₹${total} to PayBill`}
                  description={`Pay ₹${numericAmount} and get ₹${bonus} bonus`}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onCancel={handlePaymentCancel}
                />
              </Elements>
            </View>
          </Modal>
        )}
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
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.base,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#7C3AED',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.base,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#EF4444',
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  quickAmountBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    marginHorizontal: 4,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  quickAmountBtnActive: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3E8FF',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  quickAmountTextActive: {
    color: '#8B5CF6',
  },
  amountSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  currencySymbol: {
    fontSize: 16,
    color: '#111827',
    marginRight: 4,
  },
  amountInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    minWidth: 60,
  },
  bonusAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: Spacing.sm,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  balanceAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  sufficientBalance: {
    color: '#10B981',
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
    gap: 6,
  },
  successBadgeText: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '500',
  },
  addMoneyButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.lg,
    gap: 8,
    marginBottom: Spacing.sm,
  },
  buttonDisabled: {
    backgroundColor: '#C4B5FD',
  },
  addMoneyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  noteText: {
    fontSize: 12,
    color: '#8B5CF6',
    textAlign: 'center',
  },
  paymentModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  paymentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  paymentModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.base,
  },
  paymentOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.base,
  },
  paymentOptionContent: {
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  paymentOptionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  paymentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  secureText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
});
