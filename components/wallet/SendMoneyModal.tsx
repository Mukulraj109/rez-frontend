// Send Money Modal
// Allows users to send money from their RezPay wallet to others

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

interface SendMoneyModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (amount: number, recipient: string) => void;
  currentBalance: number;
}

type RecipientType = 'phone' | 'upi' | 'email';

export default function SendMoneyModal({
  visible,
  onClose,
  onSuccess,
  currentBalance,
}: SendMoneyModalProps) {
  const [recipientType, setRecipientType] = useState<RecipientType>('phone');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'confirm'>('input');

  const handleAmountChange = (text: string) => {
    // Only allow numbers
    const numericValue = text.replace(/[^0-9]/g, '');
    setAmount(numericValue);
  };

  const getRecipientPlaceholder = () => {
    switch (recipientType) {
      case 'phone':
        return 'Enter phone number';
      case 'upi':
        return 'Enter UPI ID (e.g., user@bank)';
      case 'email':
        return 'Enter email address';
    }
  };

  const validateRecipient = (): boolean => {
    if (!recipient.trim()) {
      Alert.alert('Error', 'Please enter recipient details');
      return false;
    }

    switch (recipientType) {
      case 'phone':
        if (!/^\d{10}$/.test(recipient)) {
          Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number');
          return false;
        }
        break;
      case 'upi':
        if (!/^[\w.-]+@[\w.-]+$/.test(recipient)) {
          Alert.alert('Invalid UPI', 'Please enter a valid UPI ID');
          return false;
        }
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
          Alert.alert('Invalid Email', 'Please enter a valid email address');
          return false;
        }
        break;
    }

    return true;
  };

  const validateAmount = (): boolean => {
    const amountNum = parseInt(amount, 10);

    if (!amount || amountNum <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return false;
    }

    if (amountNum < 1) {
      Alert.alert('Minimum Amount', 'Minimum transfer amount is ₹1');
      return false;
    }

    if (amountNum > currentBalance) {
      Alert.alert('Insufficient Balance', 'You don\'t have enough balance');
      return false;
    }

    if (amountNum > 50000) {
      Alert.alert('Maximum Amount', 'Maximum transfer amount is ₹50,000 per transaction');
      return false;
    }

    return true;
  };

  const handleProceed = () => {
    if (!validateRecipient() || !validateAmount()) {
      return;
    }

    setStep('confirm');
  };

  const handleConfirmSend = async () => {
    setLoading(true);
    try {
      const amountNum = parseInt(amount, 10);

      // TODO: Integrate with backend transfer API
      // await walletApi.transfer({ recipient, amount: amountNum, note });

      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setLoading(false);
      handleClose();

      Alert.alert(
        'Money Sent!',
        `₹${amountNum.toLocaleString()} has been sent successfully`,
        [{ text: 'OK' }]
      );

      onSuccess(amountNum, recipient);
    } catch (error) {
      setLoading(false);
      Alert.alert(
        'Transfer Failed',
        'Unable to process transfer. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleClose = () => {
    if (!loading) {
      setRecipient('');
      setAmount('');
      setNote('');
      setStep('input');
      onClose();
    }
  };

  const handleBack = () => {
    setStep('input');
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
              {step === 'confirm' && (
                <TouchableOpacity onPress={handleBack} disabled={loading}>
                  <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
              )}
              <ThemedText style={styles.modalTitle}>
                {step === 'input' ? 'Send Money' : 'Confirm Transfer'}
              </ThemedText>
              <TouchableOpacity onPress={handleClose} disabled={loading}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <ThemedText style={styles.currentBalanceText}>
              Available Balance: ₹{currentBalance.toLocaleString()}
            </ThemedText>
          </LinearGradient>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {step === 'input' ? (
              <>
                {/* Recipient Type Selection */}
                <View style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>Send To</ThemedText>
                  <View style={styles.recipientTypeButtons}>
                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        recipientType === 'phone' && styles.typeButtonSelected,
                      ]}
                      onPress={() => setRecipientType('phone')}
                    >
                      <Ionicons
                        name="phone-portrait"
                        size={20}
                        color={recipientType === 'phone' ? ACCOUNT_COLORS.primary : ACCOUNT_COLORS.textSecondary}
                      />
                      <ThemedText
                        style={[
                          styles.typeButtonText,
                          recipientType === 'phone' && styles.typeButtonTextSelected,
                        ]}
                      >
                        Phone
                      </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        recipientType === 'upi' && styles.typeButtonSelected,
                      ]}
                      onPress={() => setRecipientType('upi')}
                    >
                      <Ionicons
                        name="swap-horizontal"
                        size={20}
                        color={recipientType === 'upi' ? ACCOUNT_COLORS.primary : ACCOUNT_COLORS.textSecondary}
                      />
                      <ThemedText
                        style={[
                          styles.typeButtonText,
                          recipientType === 'upi' && styles.typeButtonTextSelected,
                        ]}
                      >
                        UPI
                      </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        recipientType === 'email' && styles.typeButtonSelected,
                      ]}
                      onPress={() => setRecipientType('email')}
                    >
                      <Ionicons
                        name="mail"
                        size={20}
                        color={recipientType === 'email' ? ACCOUNT_COLORS.primary : ACCOUNT_COLORS.textSecondary}
                      />
                      <ThemedText
                        style={[
                          styles.typeButtonText,
                          recipientType === 'email' && styles.typeButtonTextSelected,
                        ]}
                      >
                        Email
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Recipient Input */}
                <View style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>Recipient</ThemedText>
                  <TextInput
                    style={styles.input}
                    value={recipient}
                    onChangeText={setRecipient}
                    placeholder={getRecipientPlaceholder()}
                    placeholderTextColor={ACCOUNT_COLORS.textSecondary}
                    keyboardType={recipientType === 'phone' ? 'phone-pad' : 'default'}
                    autoCapitalize="none"
                  />
                </View>

                {/* Amount Input */}
                <View style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>Amount</ThemedText>
                  <View style={styles.amountContainer}>
                    <ThemedText style={styles.currencySymbol}>₹</ThemedText>
                    <TextInput
                      style={styles.amountInput}
                      value={amount}
                      onChangeText={handleAmountChange}
                      placeholder="0"
                      placeholderTextColor={ACCOUNT_COLORS.textSecondary}
                      keyboardType="numeric"
                      maxLength={6}
                    />
                  </View>
                  <ThemedText style={styles.helperText}>
                    Minimum: ₹1 • Maximum: ₹50,000
                  </ThemedText>
                </View>

                {/* Note (Optional) */}
                <View style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>
                    Add Note (Optional)
                  </ThemedText>
                  <TextInput
                    style={[styles.input, styles.noteInput]}
                    value={note}
                    onChangeText={setNote}
                    placeholder="Add a message"
                    placeholderTextColor={ACCOUNT_COLORS.textSecondary}
                    maxLength={100}
                    multiline
                  />
                </View>
              </>
            ) : (
              <>
                {/* Confirmation View */}
                <View style={styles.confirmationCard}>
                  <View style={styles.confirmationHeader}>
                    <View style={styles.confirmationIconContainer}>
                      <Ionicons name="send" size={32} color={ACCOUNT_COLORS.primary} />
                    </View>
                    <ThemedText style={styles.confirmationAmount}>
                      ₹{parseInt(amount, 10).toLocaleString()}
                    </ThemedText>
                  </View>

                  <View style={styles.confirmationDivider} />

                  <View style={styles.confirmationDetail}>
                    <ThemedText style={styles.confirmationLabel}>Sending to</ThemedText>
                    <ThemedText style={styles.confirmationValue}>{recipient}</ThemedText>
                  </View>

                  <View style={styles.confirmationDetail}>
                    <ThemedText style={styles.confirmationLabel}>Via</ThemedText>
                    <ThemedText style={styles.confirmationValue}>
                      {recipientType.toUpperCase()}
                    </ThemedText>
                  </View>

                  {note && (
                    <View style={styles.confirmationDetail}>
                      <ThemedText style={styles.confirmationLabel}>Note</ThemedText>
                      <ThemedText style={styles.confirmationValue}>{note}</ThemedText>
                    </View>
                  )}

                  <View style={styles.confirmationDivider} />

                  <View style={styles.confirmationDetail}>
                    <ThemedText style={styles.confirmationLabel}>
                      New Balance
                    </ThemedText>
                    <ThemedText style={styles.confirmationNewBalance}>
                      ₹{(currentBalance - parseInt(amount, 10)).toLocaleString()}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.warningCard}>
                  <Ionicons name="information-circle" size={20} color={ACCOUNT_COLORS.warning} />
                  <ThemedText style={styles.warningText}>
                    Please verify recipient details carefully. This transaction cannot be reversed.
                  </ThemedText>
                </View>
              </>
            )}
          </ScrollView>

          {/* Footer with Action Button */}
          <View style={styles.modalFooter}>
            {step === 'input' ? (
              <TouchableOpacity
                style={[
                  styles.proceedButton,
                  (!recipient || !amount || loading) && styles.proceedButtonDisabled,
                ]}
                onPress={handleProceed}
                disabled={!recipient || !amount || loading}
              >
                <ThemedText style={styles.proceedButtonText}>Continue</ThemedText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.proceedButton, loading && styles.proceedButtonDisabled]}
                onPress={handleConfirmSend}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                    <ThemedText style={styles.proceedButtonText}>
                      Confirm & Send
                    </ThemedText>
                  </>
                )}
              </TouchableOpacity>
            )}
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
    flex: 1,
    textAlign: 'center',
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
  recipientTypeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: ACCOUNT_COLORS.border,
  },
  typeButtonSelected: {
    borderColor: ACCOUNT_COLORS.primary,
    backgroundColor: ACCOUNT_COLORS.primary + '10',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: ACCOUNT_COLORS.textSecondary,
  },
  typeButtonTextSelected: {
    color: ACCOUNT_COLORS.primary,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: ACCOUNT_COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: ACCOUNT_COLORS.text,
  },
  noteInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: ACCOUNT_COLORS.border,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '600',
    color: ACCOUNT_COLORS.text,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '600',
    color: ACCOUNT_COLORS.text,
    paddingVertical: 16,
  },
  helperText: {
    fontSize: 12,
    color: ACCOUNT_COLORS.textSecondary,
    marginTop: 8,
  },
  confirmationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: ACCOUNT_COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmationHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmationIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: ACCOUNT_COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmationAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: ACCOUNT_COLORS.text,
  },
  confirmationDivider: {
    height: 1,
    backgroundColor: ACCOUNT_COLORS.border,
    marginVertical: 16,
  },
  confirmationDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmationLabel: {
    fontSize: 14,
    color: ACCOUNT_COLORS.textSecondary,
  },
  confirmationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: ACCOUNT_COLORS.text,
    maxWidth: '60%',
    textAlign: 'right',
  },
  confirmationNewBalance: {
    fontSize: 16,
    fontWeight: '700',
    color: ACCOUNT_COLORS.success,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: ACCOUNT_COLORS.warning + '15',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: ACCOUNT_COLORS.text,
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
