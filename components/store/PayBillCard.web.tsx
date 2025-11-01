import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeCardForm from '@/components/payment/StripeCardForm';
import walletPayBillService from '@/services/walletPayBillApi';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'expo-router';
import cartApi from '@/services/cartApi';

interface PayBillCardProps {
  productData?: any;
  initialAmount?: string;
  discountPercentage?: number;
}

// Load Stripe publishable key from environment
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

// Validate Stripe key format
if (STRIPE_PUBLISHABLE_KEY && !STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
  console.error('⚠️ Invalid Stripe publishable key format. Key should start with pk_test_ or pk_live_');
}

const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

const PayBillCard: React.FC<PayBillCardProps> = ({ productData, discountPercentage = 20 }) => {
  const router = useRouter();
  const { actions } = useCart();
  const [amount, setAmount] = useState('10');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'upi' | null>(null);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [productAddedToCart, setProductAddedToCart] = useState(false);

  // Input sanitization helper
  const sanitizeAmount = (input: string): string => {
    // Remove non-numeric characters except decimal point
    let sanitized = input.replace(/[^0-9.]/g, '');

    // Ensure only one decimal point
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      sanitized = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      sanitized = parts[0] + '.' + parts[1].slice(0, 2);
    }

    // Limit total length to 10 characters
    sanitized = sanitized.slice(0, 10);

    // Prevent leading zeros (except for decimals like 0.5)
    if (sanitized.length > 1 && sanitized[0] === '0' && sanitized[1] !== '.') {
      sanitized = sanitized.slice(1);
    }

    return sanitized;
  };

  // UPI ID validation helper
  const validateUpiId = (upiId: string): boolean => {
    // Format: username@bankname
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
    return upiRegex.test(upiId);
  };

  // Cleanup sensitive payment data
  const cleanupPaymentData = () => {
    setClientSecret('');
    setPaymentIntentId('');
    setSelectedMethod(null);
    setUpiId('');
  };

  // Get store and product info
  const storeName = productData?.store?.name || productData?.merchant || 'this store';
  const storeId = productData?.store?._id || productData?.store?.id || productData?.storeId;
  const productId = productData?.id || productData?._id;
  const productName = productData?.title || productData?.name || 'Product';
  const productPrice = productData?.price || productData?.pricing?.selling || 299;

  // Product data validation (debug logging removed)

  // Calculate bonus using service method
  const numericAmount = parseFloat(amount) || 0;
  const bonus = walletPayBillService.calculateBonus(numericAmount, discountPercentage);
  const total = numericAmount + bonus;

  // Calculate savings for product
  const productSavings = walletPayBillService.calculateBonus(productPrice, discountPercentage);

  // Load wallet balance on mount with cleanup
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchBalance = async () => {
      if (storeId && isMounted) {
        try {
          const response = await walletPayBillService.getStoreWalletBalance(storeId, {
            signal: controller.signal
          });
          if (response.success && response.data && isMounted) {
            setWalletBalance(response.data.balance);
          }
        } catch (error: any) {
          if (error.name !== 'AbortError' && isMounted && __DEV__) {
            console.error('Error loading wallet balance');
          }
        }
      }
    };

    fetchBalance();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [storeId]);

  const loadWalletBalance = async () => {
    if (!storeId) return;

    try {
      const response = await walletPayBillService.getStoreWalletBalance(storeId, {
        skipCache: true
      });
      if (response.success && response.data) {
        const balance = response.data.balance;
        if (typeof balance === 'number' && !isNaN(balance)) {
          setWalletBalance(balance);
        }
      }
    } catch (error) {
      // Don't update balance if there's an error
      if (__DEV__) {
        console.warn('Failed to load wallet balance, using previous value');
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupPaymentData();
    };
  }, []);

  const handleAddMoney = () => {
    if (numericAmount < 10) {
      setErrorMessage('Minimum amount is ₹10');
      return;
    }
    if (!walletPayBillService.isConfigured()) {
      setErrorMessage('Payment system is not configured. Please contact support.');
      return;
    }
    setErrorMessage('');
    setShowPaymentModal(true);
  };

  const handleMethodSelect = async (method: 'card' | 'upi') => {
    setSelectedMethod(method);
    setShowPaymentModal(false);
    setIsCreatingIntent(true);
    setErrorMessage('');

    // Clear any old payment intent data
    cleanupPaymentData();

    try {
      // Create payment intent using PayBill service
      const response = await walletPayBillService.createPaymentIntent({
        amount: numericAmount,
        bonusAmount: bonus,
        paymentType: method,
        currency: 'INR',
        storeId,
        storeName,
        metadata: {
          bonusPercentage: discountPercentage,
          walletTopup: true,
          productId,
          productName,
          autoAddToCart: (walletBalance + total) >= productPrice,
          platform: 'web'
        }
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create payment intent');
      }

      const { clientSecret: secret, paymentIntentId: intentId } = response.data;
      if (__DEV__) {

      }

      setClientSecret(secret);
      setPaymentIntentId(intentId);

      if (method === 'card') {
        setShowStripeModal(true);
      } else {
        setShowUpiModal(true);
      }
    } catch (error: any) {
      if (__DEV__) {
        console.error('❌ Error creating payment intent');
      }
      setErrorMessage(error.message || 'Failed to initiate payment');
    } finally {
      setIsCreatingIntent(false);
    }
  };

  const handleUpiPayment = async () => {
    if (!upiId) {
      setErrorMessage('Please enter your UPI ID');
      return;
    }

    // Validate UPI ID format
    if (!validateUpiId(upiId)) {
      setErrorMessage('Invalid UPI ID format. Please use format: username@bankname');
      return;
    }

    setIsProcessing(true);
    try {
      // Process UPI payment (currently simulated for web)
      if (__DEV__) {

      }

      // Since Stripe doesn't support UPI directly on web,
      // we'll need to implement a different flow or redirect
      const confirmResponse = await walletPayBillService.confirmPayment({
        paymentIntentId,
        timestamp: new Date().toISOString()
      });

      if (confirmResponse.success && confirmResponse.data) {
        await handlePaymentSuccess(confirmResponse.data);
      } else {
        throw new Error(confirmResponse.error || 'UPI payment failed');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'UPI payment failed');
    } finally {
      setIsProcessing(false);
      setShowUpiModal(false);
    }
  };

  const handlePaymentSuccess = async (confirmData?: any) => {
    if (__DEV__) {

    }
    setShowStripeModal(false);
    setShowUpiModal(false);

    try {
      // If confirmData is not provided, confirm with backend
      let responseData = confirmData;

      if (!responseData) {
        const confirmResponse = await walletPayBillService.confirmPayment({
          paymentIntentId,
          timestamp: new Date().toISOString()
        });

        if (!confirmResponse.success || !confirmResponse.data) {
          throw new Error(confirmResponse.error || 'Failed to confirm payment');
        }

        responseData = confirmResponse.data;
      }

      if (__DEV__) {

      }

      // Update wallet balance with proper validation
      // Backend returns wallet.balance.paybill for paybill balance
      const paybillBalance = responseData?.paybillBalance ||
                             responseData?.wallet?.balance?.paybill ||
                             responseData?.wallet?.newBalance;

      // Validate the new balance is a number
      if (typeof paybillBalance === 'number' && !isNaN(paybillBalance)) {

        setWalletBalance(paybillBalance);
      } else {
        // Fallback: Calculate balance locally if backend doesn't return it
        console.warn('Invalid or missing balance from backend, calculating locally');
        const calculatedBalance = walletBalance + total;
        setWalletBalance(calculatedBalance);

        // Also try to fetch the actual balance from backend
        loadWalletBalance();
      }

      // Check if we should auto-add product to cart
      const finalBalance = paybillBalance || (walletBalance + total);
      const shouldAutoAdd = productId && productPrice > 0 && finalBalance >= productPrice;

      if (__DEV__) {

      }

      if (shouldAutoAdd) {
        if (__DEV__) {

        }

        try {
          // Add product to cart
          const addToCartResponse = await cartApi.addToCart({
            productId: productId,
            quantity: 1
          });

          if (addToCartResponse.success) {
            if (__DEV__) {

            }
            setProductAddedToCart(true);
            // Update cart context
            await actions.loadCart();
          } else {
            setProductAddedToCart(false);
            console.warn('Failed to add product to cart:', addToCartResponse.error);
          }
        } catch (error) {
          console.warn('Failed to auto-add product to cart:', error);
          setProductAddedToCart(false);
        }
      } else if (productId && productPrice > 0) {
        if (__DEV__) {

        }
        setProductAddedToCart(false);
      } else {
        setProductAddedToCart(false);
      }

      // Cleanup sensitive payment data after successful payment
      cleanupPaymentData();

      setShowSuccessModal(true);
    } catch (error: any) {
      if (__DEV__) {
        console.error('❌ Error confirming payment');
      }
      setErrorMessage(error.message || 'Payment confirmation failed');
      // Also cleanup on error
      cleanupPaymentData();
    }
  };

  const handlePaymentError = (error: string) => {
    if (__DEV__) {
      console.error('❌ Payment error occurred');
    }
    setShowStripeModal(false);
    setErrorMessage(error);
    cleanupPaymentData();
  };

  const handlePaymentCancel = () => {
    if (__DEV__) {

    }
    setShowStripeModal(false);
    setShowUpiModal(false);
    cleanupPaymentData();
  };

  // Get supported payment methods for current platform
  const supportedMethods = walletPayBillService.getSupportedPaymentMethods('web');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="wallet" size={24} color="#8B5CF6" />
          </View>
          <View>
            <Text style={styles.title}>Add Money to PayBill</Text>
            <Text style={styles.subtitle}>Get {discountPercentage}% extra on every topup!</Text>
          </View>
        </View>
        <View style={styles.savingsBadge}>
          <Text style={styles.savingsLabel}>Save {discountPercentage}%</Text>
          <Text style={styles.savingsAmount}>
            {walletPayBillService.formatCurrency(productSavings, 'INR')}
          </Text>
        </View>
      </View>

      {errorMessage && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={16} color="#EF4444" />
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity onPress={() => setErrorMessage('')}>
            <Ionicons name="close" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.breakdownContainer}>
        {walletBalance > 0 && (
          <View style={[styles.breakdownRow, styles.walletBalanceRow]}>
            <Text style={styles.walletBalanceLabel}>Current Balance:</Text>
            <Text style={styles.walletBalanceAmount}>
              {walletPayBillService.formatCurrency(walletBalance, 'INR')}
            </Text>
          </View>
        )}

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>You pay:</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={(text) => setAmount(sanitizeAmount(text))}
              keyboardType="numeric"
              placeholder="10"
              placeholderTextColor="#999"
              maxLength={10}
            />
          </View>
        </View>

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Bonus ({discountPercentage}%):</Text>
          <Text style={styles.bonusAmount}>
            +{walletPayBillService.formatCurrency(bonus, 'INR')}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.breakdownRow}>
          <Text style={styles.totalLabel}>You get:</Text>
          <Text style={styles.totalAmount}>
            {walletPayBillService.formatCurrency(total, 'INR')}
          </Text>
        </View>

        {productPrice > 0 && (
          <View style={styles.breakdownRow}>
            <Text style={styles.productPriceLabel}>After topup balance:</Text>
            <Text style={[
              styles.afterBalanceAmount,
              (walletBalance + total) >= productPrice && styles.sufficientBalance
            ]}>
              {walletPayBillService.formatCurrency(walletBalance + total, 'INR')}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.addMoneyButton, isCreatingIntent && styles.buttonDisabled]}
        onPress={handleAddMoney}
        activeOpacity={0.8}
        disabled={isCreatingIntent}
      >
        <Text style={styles.addMoneyButtonText}>
          {isCreatingIntent ? 'Processing...' : 'Add Money'}
        </Text>
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Ionicons name="information-circle-outline" size={16} color="#8B5CF6" />
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
              {supportedMethods.includes('card') && (
                <TouchableOpacity
                  style={[styles.paymentOption, isCreatingIntent && styles.optionDisabled]}
                  onPress={() => handleMethodSelect('card')}
                  activeOpacity={0.7}
                  disabled={isCreatingIntent}
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
              )}

              <TouchableOpacity
                style={[styles.paymentOption, styles.optionDisabled]}
                disabled={true}
              >
                <View style={styles.optionIcon}>
                  <Ionicons name="qr-code" size={32} color="#999" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, { color: '#999' }]}>UPI</Text>
                  <Text style={styles.optionSubtitle}>Available on mobile app only</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#DDD" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalFooter}>
              <View style={styles.securePayment}>
                <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                <Text style={styles.secureText}>100% Secure Payment</Text>
              </View>
              <Text style={styles.amountSummary}>
                Amount to pay: {walletPayBillService.formatCurrency(numericAmount, 'INR')}
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Stripe Payment Modal */}
      {showStripeModal && clientSecret && (
        <Modal
          visible={showStripeModal}
          transparent={true}
          animationType="fade"
          onRequestClose={handlePaymentCancel}
        >
          <View style={styles.modalOverlay}>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripeCardForm
                clientSecret={clientSecret}
                amount={numericAmount}
                displayAmount={total}
                title={`Add ${walletPayBillService.formatCurrency(total, 'INR')} to Wallet`}
                description={`Pay ${walletPayBillService.formatCurrency(numericAmount, 'INR')} and get ${walletPayBillService.formatCurrency(bonus, 'INR')} bonus`}
                onSuccess={() => handlePaymentSuccess()}
                onError={handlePaymentError}
                onCancel={handlePaymentCancel}
              />
            </Elements>
          </View>
        </Modal>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
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
                {walletPayBillService.formatCurrency(total, 'INR')} has been added to your {storeName} wallet!
              </Text>

              <View style={styles.successBreakdown}>
                <View style={styles.successRow}>
                  <Text style={styles.successLabel}>Paid Amount:</Text>
                  <Text style={styles.successValue}>
                    {walletPayBillService.formatCurrency(numericAmount, 'INR')}
                  </Text>
                </View>
                <View style={styles.successRow}>
                  <Text style={styles.successLabel}>Bonus ({discountPercentage}%):</Text>
                  <Text style={styles.successBonus}>
                    +{walletPayBillService.formatCurrency(bonus, 'INR')}
                  </Text>
                </View>
                <View style={[styles.successRow, styles.successTotal]}>
                  <Text style={styles.successTotalLabel}>Wallet Balance:</Text>
                  <Text style={styles.successTotalValue}>
                    {walletPayBillService.formatCurrency(walletBalance, 'INR')}
                  </Text>
                </View>
              </View>

              {productAddedToCart && (
                <View style={styles.cartNotification}>
                  <Ionicons name="cart" size={20} color="#10B981" />
                  <Text style={styles.cartNotificationText}>
                    Product added to cart!
                  </Text>
                </View>
              )}

              <View style={styles.successActions}>
                <TouchableOpacity
                  style={styles.successButton}
                  onPress={() => {
                    setShowSuccessModal(false);
                    setAmount('10');
                    setProductAddedToCart(false); // Reset cart state
                    loadWalletBalance(); // Refresh balance
                  }}
                >
                  <Text style={styles.successButtonText}>Done</Text>
                </TouchableOpacity>

                {productAddedToCart && (
                  <TouchableOpacity
                    style={[styles.successButton, styles.cartButton]}
                    onPress={() => {
                      setShowSuccessModal(false);
                      setProductAddedToCart(false); // Reset state
                      router.push('/CartPage');
                    }}
                  >
                    <Ionicons name="cart" size={20} color="#fff" />
                    <Text style={styles.successButtonText}>Go to Cart</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F4FF',
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
    color: '#8B5CF6',
    fontWeight: '600',
  },
  savingsAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#EF4444',
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
  walletBalanceRow: {
    backgroundColor: '#F0FDF4',
    padding: 8,
    borderRadius: 6,
    marginBottom: 16,
  },
  walletBalanceLabel: {
    fontSize: 13,
    color: '#047857',
    fontWeight: '600',
  },
  walletBalanceAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#047857',
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
    color: '#8B5CF6',
  },
  productPriceLabel: {
    fontSize: 13,
    color: '#666',
  },
  afterBalanceAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  sufficientBalance: {
    color: '#10B981',
  },
  addMoneyButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    backgroundColor: '#C0B4D6',
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
    color: '#8B5CF6',
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
  optionDisabled: {
    opacity: 0.5,
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
  successContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 32,
    alignItems: 'center',
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
  cartNotification: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  cartNotificationText: {
    fontSize: 14,
    color: '#047857',
    fontWeight: '600',
  },
  successActions: {
    flexDirection: 'column',
    gap: 12,
    width: '100%',
  },
  successButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  cartButton: {
    backgroundColor: '#8B5CF6',
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default PayBillCard;