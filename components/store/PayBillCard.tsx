import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import paybillApi from '@/services/paybillApi';
import { showAlert } from '@/components/common/CrossPlatformAlert';

interface PayBillCardProps {
  productData?: any;
  initialAmount?: string;
  discountPercentage?: number;
}

const PayBillCard: React.FC<PayBillCardProps> = ({ productData, discountPercentage = 20 }) => {
  const [amount, setAmount] = useState('10');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'upi' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get store and product info
  const storeName = productData?.store?.name || productData?.merchant || 'this store';
  const productPrice = productData?.price || productData?.pricing?.selling || 299;

  // Calculate bonus
  const calculateBonus = (amt: number) => {
    return Math.round(amt * (discountPercentage / 100));
  };

  const numericAmount = parseFloat(amount) || 0;
  const bonus = calculateBonus(numericAmount);
  const total = numericAmount + bonus;

  // Calculate savings for product
  const productSavings = Math.round(productPrice * (discountPercentage / 100));

  const handleAddMoney = () => {
    if (numericAmount < 10) {
      showAlert('Invalid Amount', 'Minimum amount is ₹10', [{ text: 'OK' }], 'error');
      return;
    }
    setShowPaymentModal(true);
  };

  const handleMethodSelect = async (method: 'card' | 'upi') => {
    setSelectedMethod(method);
    setShowPaymentModal(false);
    setIsLoading(true);

    try {
      // Call the backend API to add PayBill balance
      const response = await paybillApi.addBalance({
        amount: numericAmount,
        paymentMethod: method,
        discountPercentage: discountPercentage
      });

      if (response.success && response.data) {
        showAlert(
          'Success!',
          `₹${response.data.finalAmount} added to PayBill (including ₹${response.data.discount} bonus)`,
          [{ text: 'OK' }],
          'success'
        );
        // Reset amount after successful topup
        setAmount('10');
      } else {
        showAlert(
          'Error',
          response.error || 'Failed to add money to PayBill',
          [{ text: 'OK' }],
          'error'
        );
      }
    } catch (error: any) {
      console.error('PayBill topup error:', error);
      showAlert(
        'Error',
        error.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }],
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="wallet" size={24} color="#059669" />
          </View>
          <View>
            <Text style={styles.title}>Add Money to PayBill</Text>
            <Text style={styles.subtitle}>Get {discountPercentage}% extra on every topup!</Text>
          </View>
        </View>
        <View style={styles.savingsBadge}>
          <Text style={styles.savingsLabel}>Save {discountPercentage}%</Text>
          <Text style={styles.savingsAmount}>₹{productSavings}</Text>
        </View>
      </View>

      <View style={styles.breakdownContainer}>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>You pay:</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="10"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Bonus ({discountPercentage}%):</Text>
          <Text style={styles.bonusAmount}>+₹{bonus}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.breakdownRow}>
          <Text style={styles.totalLabel}>You get:</Text>
          <Text style={styles.totalAmount}>₹{total}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.addMoneyButton, isLoading && styles.addMoneyButtonDisabled]}
        onPress={handleAddMoney}
        activeOpacity={0.8}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.addMoneyButtonText}>Add Money</Text>
        )}
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Ionicons name="information-circle-outline" size={16} color="#059669" />
        <Text style={styles.infoText}>
          Add money now, use it later at checkout. Get {discountPercentage}% extra bonus on every topup!
        </Text>
      </View>

      {/* Payment Method Selection Modal */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Payment Method</Text>
              <TouchableOpacity
                onPress={() => setShowPaymentModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.paymentOptions}>
              <TouchableOpacity
                style={styles.paymentOption}
                onPress={() => handleMethodSelect('card')}
                activeOpacity={0.7}
              >
                <View style={styles.optionIcon}>
                  <Ionicons name="card" size={32} color="#4A90E2" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Credit/Debit Card</Text>
                  <Text style={styles.optionSubtitle}>Pay securely with your card</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#999" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.paymentOption}
                onPress={() => handleMethodSelect('upi')}
                activeOpacity={0.7}
              >
                <View style={styles.optionIcon}>
                  <Ionicons name="qr-code" size={32} color="#10B981" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>UPI</Text>
                  <Text style={styles.optionSubtitle}>Pay using any UPI app</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalFooter}>
              <View style={styles.securePayment}>
                <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                <Text style={styles.secureText}>100% Secure Payment</Text>
              </View>
              <Text style={styles.amountSummary}>
                Amount to pay: ₹{numericAmount}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  savingsBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  savingsLabel: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  savingsAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00C06A',
  },
  breakdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#666',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
  },
  currencySymbol: {
    fontSize: 16,
    color: '#333',
    marginRight: 4,
  },
  amountInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    minWidth: 40,
  },
  bonusAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00C06A',
  },
  addMoneyButton: {
    backgroundColor: '#00C06A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  addMoneyButtonDisabled: {
    opacity: 0.7,
  },
  addMoneyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#059669',
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  paymentOptions: {
    paddingHorizontal: 20,
    gap: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    marginTop: 16,
  },
  securePayment: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 8,
  },
  secureText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  amountSummary: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default PayBillCard;