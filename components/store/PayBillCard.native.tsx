import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import StripeCardForm from '@/components/payment/StripeCardForm';
import { stripeApi } from '@/services/stripeApi';

interface PayBillCardProps {
  productData?: any;
  initialAmount?: string;
  discountPercentage?: number;
}

interface TopUpOption {
  id: string;
  amount: number;
  bonus: number;
  popular?: boolean;
}

// Load Stripe publishable key from environment
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

// Inner component that uses Stripe hooks
const PayBillCardContent: React.FC<PayBillCardProps> = ({ productData, discountPercentage = 20 }) => {
  const stripe = useStripe();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [currentTopUp, setCurrentTopUp] = useState<TopUpOption | null>(null);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);

  // Get store name from product data
  const storeName = productData?.store?.name || productData?.merchant || 'this store';
  const storeId = productData?.store?._id || productData?.store?.id || productData?.storeId;

  // Predefined top-up options with 20% bonus
  const topUpOptions: TopUpOption[] = [
    { id: '1', amount: 100, bonus: 20 },
    { id: '2', amount: 250, bonus: 50 },
    { id: '3', amount: 500, bonus: 100, popular: true },
    { id: '4', amount: 1000, bonus: 200 },
    { id: '5', amount: 2000, bonus: 400 },
    { id: '6', amount: 5000, bonus: 1000 },
  ];

  const handleTopUp = async (option: TopUpOption) => {

    setCurrentTopUp(option);
    setIsCreatingIntent(true);
    setErrorMessage('');

    try {
      // Create payment intent with backend for wallet top-up
      const response = await stripeApi.createPaymentIntent(
        option.amount, // Base amount
        option.bonus, // Bonus amount
        'card', // Payment type
        {
          storeId,
          storeName,
          bonusPercentage: discountPercentage,
          walletTopup: true
        }
      );

      if (!response.success || !('data' in response) || !response.data) {
        throw new Error(response.error || 'Failed to create payment intent');
      }

      const { clientSecret: secret } = (response as any).data;

      setClientSecret(secret);
      setShowPaymentModal(true);
    } catch (error: any) {
      console.error('❌ [Native] Error creating payment intent:', error);
      setErrorMessage(error.message || 'Failed to initiate payment');
      Alert.alert('Error', error.message || 'Failed to initiate payment');
    } finally {
      setIsCreatingIntent(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {

    setShowPaymentModal(false);

    try {
      const confirmResponse = await stripeApi.confirmPayment(paymentIntentId);

      if (!confirmResponse.success) {
        throw new Error(confirmResponse.error || 'Failed to confirm payment');
      }

      // Update wallet balance
      if (currentTopUp) {
        const newBalance = walletBalance + currentTopUp.amount + currentTopUp.bonus;
        setWalletBalance(newBalance);
      }

      setShowSuccessModal(true);
      setSelectedOption(null);
    } catch (error: any) {
      console.error('❌ [Native] Error confirming payment:', error);
      Alert.alert('Error', error.message || 'Payment confirmation failed');
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('❌ [Native] Payment error:', error);
    setShowPaymentModal(false);
    Alert.alert('Payment Failed', error);
  };

  const handlePaymentCancel = () => {

    setShowPaymentModal(false);
    setClientSecret('');
    setCurrentTopUp(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Store Wallet</Text>
          <Text style={styles.subtitle}>Add money & get {discountPercentage}% bonus</Text>
        </View>
        <View style={styles.bonusBadge}>
          <Text style={styles.bonusText}>{discountPercentage}%</Text>
          <Text style={styles.bonusLabel}>BONUS</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={20} color="#10B981" />
        <Text style={styles.infoText}>
          Add money to your {storeName} wallet and get {discountPercentage}% extra! Use it for faster checkout.
        </Text>
      </View>

      {errorMessage && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={20} color="#EF4444" />
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity onPress={() => setErrorMessage('')}>
            <Ionicons name="close" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.optionsContainer}
      >
        {topUpOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionCard,
              selectedOption === option.id && styles.selectedOptionCard,
              option.popular && styles.popularCard,
            ]}
            onPress={() => setSelectedOption(option.id)}
            activeOpacity={0.8}
          >
            {option.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>POPULAR</Text>
              </View>
            )}

            <Text style={styles.amountText}>₹{option.amount}</Text>
            <View style={styles.bonusContainer}>
              <Text style={styles.plusText}>+</Text>
              <Text style={styles.bonusAmount}>₹{option.bonus}</Text>
            </View>
            <Text style={styles.totalText}>Total: ₹{option.amount + option.bonus}</Text>

            {selectedOption === option.id && (
              <TouchableOpacity
                style={[styles.addButton, isCreatingIntent && styles.addButtonDisabled]}
                onPress={() => handleTopUp(option)}
                disabled={isCreatingIntent}
              >
                <Text style={styles.addButtonText}>
                  {isCreatingIntent ? 'Processing...' : 'Add Money'}
                </Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.walletInfo}>
        <View style={styles.walletBalance}>
          <Ionicons name="wallet-outline" size={24} color="#4A90E2" />
          <View>
            <Text style={styles.walletLabel}>Current Balance</Text>
            <Text style={styles.walletAmount}>₹{walletBalance.toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.historyButton}>
          <Ionicons name="time-outline" size={20} color="#666" />
          <Text style={styles.historyText}>History</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.features}>
        <View style={styles.featureItem}>
          <Ionicons name="card-outline" size={20} color="#4A90E2" />
          <Text style={styles.featureText}>Card/UPI</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="shield-checkmark" size={20} color="#10B981" />
          <Text style={styles.featureText}>Secure</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="gift" size={20} color="#8B5CF6" />
          <Text style={styles.featureText}>{discountPercentage}% bonus</Text>
        </View>
      </View>

      {/* Stripe Payment Modal - Native */}
      {showPaymentModal && clientSecret && currentTopUp && (
        <Modal
          visible={showPaymentModal}
          transparent={true}
          animationType="slide"
          onRequestClose={handlePaymentCancel}
        >
          <View style={styles.modalOverlay}>
            <StripeCardForm
              clientSecret={clientSecret}
              amount={currentTopUp.amount}
              displayAmount={currentTopUp.amount + currentTopUp.bonus}
              title={`Add ₹${currentTopUp.amount + currentTopUp.bonus} to Wallet`}
              description={`Pay ₹${currentTopUp.amount} and get ₹${currentTopUp.bonus} bonus`}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={handlePaymentCancel}
            />
          </View>
        </Modal>
      )}

      {/* Success Modal */}
      {showSuccessModal && currentTopUp && (
        <Modal
          visible={showSuccessModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowSuccessModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={64} color="#10B981" />
              </View>
              <Text style={styles.successTitle}>Wallet Topped Up!</Text>
              <Text style={styles.successMessage}>
                ₹{currentTopUp.amount + currentTopUp.bonus} has been added to your {storeName} wallet!
              </Text>
              <View style={styles.successBreakdown}>
                <View style={styles.successRow}>
                  <Text style={styles.successLabel}>Paid Amount:</Text>
                  <Text style={styles.successValue}>₹{currentTopUp.amount}</Text>
                </View>
                <View style={styles.successRow}>
                  <Text style={styles.successLabel}>Bonus ({discountPercentage}%):</Text>
                  <Text style={styles.successBonus}>+₹{currentTopUp.bonus}</Text>
                </View>
                <View style={[styles.successRow, styles.successTotal]}>
                  <Text style={styles.successTotalLabel}>New Balance:</Text>
                  <Text style={styles.successTotalValue}>₹{walletBalance.toFixed(2)}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.successButton}
                onPress={() => {
                  setShowSuccessModal(false);
                  setCurrentTopUp(null);
                }}
              >
                <Text style={styles.successButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

// Main component with StripeProvider wrapper
const PayBillCard: React.FC<PayBillCardProps> = (props) => {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <PayBillCardContent {...props} />
    </StripeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  bonusBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  bonusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  bonusLabel: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#047857',
    lineHeight: 18,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#EF4444',
    marginLeft: 8,
    marginRight: 8,
  },
  optionsContainer: {
    paddingVertical: 8,
  },
  optionCard: {
    width: 120,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  selectedOptionCard: {
    borderColor: '#4A90E2',
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  popularCard: {
    borderColor: '#10B981',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  popularText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  amountText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  bonusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  plusText: {
    fontSize: 14,
    color: '#10B981',
    marginRight: 4,
  },
  bonusAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  totalText: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 8,
  },
  addButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  walletInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  walletBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walletLabel: {
    fontSize: 12,
    color: '#666',
  },
  walletAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  historyText: {
    fontSize: 13,
    color: '#666',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  successBreakdown: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  successRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  successLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  successValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  successBonus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  successTotal: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    marginTop: 8,
    marginBottom: 0,
  },
  successTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  successTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  successButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 12,
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default PayBillCard;