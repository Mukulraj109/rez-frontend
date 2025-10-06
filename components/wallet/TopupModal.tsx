// Topup Wallet Modal
// Allows users to add money to their RezPay wallet

import React, { useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ACCOUNT_COLORS } from '@/types/account.types';

interface TopupModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
  currentBalance: number;
}

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];

export default function TopupModal({
  visible,
  onClose,
  onSuccess,
  currentBalance,
}: TopupModalProps) {
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (text: string) => {
    // Only allow numbers
    const numericValue = text.replace(/[^0-9]/g, '');
    setCustomAmount(numericValue);
    setSelectedAmount(null);
  };

  const getFinalAmount = (): number => {
    if (selectedAmount) return selectedAmount;
    if (customAmount) return parseInt(customAmount, 10);
    return 0;
  };

  const handleProceedToPayment = async () => {
    const amount = getFinalAmount();

    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (amount < 10) {
      Alert.alert('Minimum Amount', 'Minimum topup amount is ₹10');
      return;
    }

    if (amount > 100000) {
      Alert.alert('Maximum Amount', 'Maximum topup amount is ₹1,00,000');
      return;
    }

    Alert.alert(
      'Confirm Topup',
      `Add ₹${amount.toLocaleString()} to your RezPay wallet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          onPress: () => processTopup(amount),
        },
      ]
    );
  };

  const processTopup = async (amount: number) => {
    setLoading(true);
    try {
      // This will be integrated with Stripe payment gateway
      // For now, simulating the flow

      // TODO: Integrate Stripe payment sheet
      // const paymentIntent = await createPaymentIntent(amount);
      // const { error } = await presentPaymentSheet();

      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Success
      setLoading(false);
      setSelectedAmount(null);
      setCustomAmount('');
      onSuccess(amount);
      onClose();

      Alert.alert(
        'Topup Successful!',
        `₹${amount.toLocaleString()} has been added to your wallet`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      setLoading(false);
      Alert.alert(
        'Topup Failed',
        'Unable to process payment. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedAmount(null);
      setCustomAmount('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <LinearGradient
            colors={[ACCOUNT_COLORS.primary, ACCOUNT_COLORS.primaryLight]}
            style={styles.modalHeader}
          >
            <View style={styles.modalHeaderContent}>
              <ThemedText style={styles.modalTitle}>Add Money</ThemedText>
              <TouchableOpacity onPress={handleClose} disabled={loading}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <ThemedText style={styles.currentBalanceText}>
              Current Balance: ₹{currentBalance.toLocaleString()}
            </ThemedText>
          </LinearGradient>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Quick Amount Buttons */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Quick Amount</ThemedText>
              <View style={styles.quickAmountsGrid}>
                {QUICK_AMOUNTS.map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={[
                      styles.quickAmountButton,
                      selectedAmount === amount && styles.quickAmountButtonSelected,
                    ]}
                    onPress={() => handleAmountSelect(amount)}
                    disabled={loading}
                  >
                    <ThemedText
                      style={[
                        styles.quickAmountText,
                        selectedAmount === amount && styles.quickAmountTextSelected,
                      ]}
                    >
                      ₹{amount.toLocaleString()}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Custom Amount */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Or Enter Amount</ThemedText>
              <View style={styles.customAmountContainer}>
                <ThemedText style={styles.currencySymbol}>₹</ThemedText>
                <TextInput
                  style={styles.customAmountInput}
                  value={customAmount}
                  onChangeText={handleCustomAmountChange}
                  placeholder="Enter amount"
                  placeholderTextColor={ACCOUNT_COLORS.textSecondary}
                  keyboardType="numeric"
                  maxLength={6}
                  editable={!loading}
                />
              </View>
              <ThemedText style={styles.helperText}>
                Minimum: ₹10 • Maximum: ₹1,00,000
              </ThemedText>
            </View>

            {/* Summary */}
            {getFinalAmount() > 0 && (
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryLabel}>Amount to Add</ThemedText>
                  <ThemedText style={styles.summaryAmount}>
                    ₹{getFinalAmount().toLocaleString()}
                  </ThemedText>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryLabel}>New Balance</ThemedText>
                  <ThemedText style={styles.summaryNewBalance}>
                    ₹{(currentBalance + getFinalAmount()).toLocaleString()}
                  </ThemedText>
                </View>
              </View>
            )}

            {/* Payment Info */}
            <View style={styles.infoCard}>
              <Ionicons name="shield-checkmark" size={20} color={ACCOUNT_COLORS.success} />
              <View style={styles.infoText}>
                <ThemedText style={styles.infoTitle}>Secure Payment</ThemedText>
                <ThemedText style={styles.infoDescription}>
                  Your payment is processed securely via Stripe. We never store your card details.
                </ThemedText>
              </View>
            </View>
          </ScrollView>

          {/* Footer with Action Button */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[
                styles.proceedButton,
                (getFinalAmount() <= 0 || loading) && styles.proceedButtonDisabled,
              ]}
              onPress={handleProceedToPayment}
              disabled={getFinalAmount() <= 0 || loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="card" size={20} color="white" />
                  <ThemedText style={styles.proceedButtonText}>
                    Proceed to Payment
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: ACCOUNT_COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 20,
    paddingTop: 24,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  currentBalanceText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ACCOUNT_COLORS.text,
    marginBottom: 12,
  },
  quickAmountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAmountButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: ACCOUNT_COLORS.border,
    minWidth: 100,
    alignItems: 'center',
  },
  quickAmountButtonSelected: {
    borderColor: ACCOUNT_COLORS.primary,
    backgroundColor: ACCOUNT_COLORS.primary + '10',
  },
  quickAmountText: {
    fontSize: 16,
    fontWeight: '600',
    color: ACCOUNT_COLORS.text,
  },
  quickAmountTextSelected: {
    color: ACCOUNT_COLORS.primary,
  },
  customAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: ACCOUNT_COLORS.border,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: ACCOUNT_COLORS.text,
    marginRight: 8,
  },
  customAmountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: ACCOUNT_COLORS.text,
    paddingVertical: 16,
  },
  helperText: {
    fontSize: 12,
    color: ACCOUNT_COLORS.textSecondary,
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: ACCOUNT_COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: ACCOUNT_COLORS.border,
    marginVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: ACCOUNT_COLORS.textSecondary,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: ACCOUNT_COLORS.text,
  },
  summaryNewBalance: {
    fontSize: 18,
    fontWeight: '700',
    color: ACCOUNT_COLORS.success,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: ACCOUNT_COLORS.success + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: ACCOUNT_COLORS.text,
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 12,
    color: ACCOUNT_COLORS.textSecondary,
    lineHeight: 18,
  },
  modalFooter: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: ACCOUNT_COLORS.border,
  },
  proceedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCOUNT_COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  proceedButtonDisabled: {
    backgroundColor: ACCOUNT_COLORS.border,
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});
