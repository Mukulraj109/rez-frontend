// Checkout Page
// Complete checkout flow with payment options and order summary

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
  SafeAreaView,
  TextInput,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string;
}

interface DeliveryAddress {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'CARD' | 'UPI' | 'WALLET' | 'COD' | 'NETBANKING';
  title: string;
  subtitle?: string;
  icon: string;
  enabled: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<DeliveryAddress | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderStep, setOrderStep] = useState<'REVIEW' | 'PAYMENT' | 'CONFIRMATION'>('REVIEW');

  // Mock data
  const [addresses] = useState<DeliveryAddress[]>([
    {
      id: '1',
      name: 'Home',
      phone: '+91 9876543210',
      address: '123 Main Street, Apartment 4B',
      city: 'Bangalore',
      pincode: '560001',
      isDefault: true,
    },
    {
      id: '2',
      name: 'Office',
      phone: '+91 9876543210',
      address: '456 Business Park, Floor 3',
      city: 'Bangalore',
      pincode: '560038',
      isDefault: false,
    },
  ]);

  const [paymentMethods] = useState<PaymentMethod[]>([
    { id: 'wallet', type: 'WALLET', title: 'REZ Wallet', subtitle: 'Balance: ₹1,250', icon: 'wallet', enabled: true },
    { id: 'upi', type: 'UPI', title: 'UPI Payment', subtitle: 'Pay via any UPI app', icon: 'phone-portrait', enabled: true },
    { id: 'card', type: 'CARD', title: 'Credit/Debit Card', subtitle: 'Visa, Mastercard, RuPay', icon: 'card', enabled: true },
    { id: 'netbanking', type: 'NETBANKING', title: 'Net Banking', subtitle: 'All major banks supported', icon: 'business', enabled: true },
    { id: 'cod', type: 'COD', title: 'Cash on Delivery', subtitle: 'Pay when you receive', icon: 'cash', enabled: true },
  ]);

  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    delivery: 50,
    taxes: 0,
    discount: 0,
    walletUsed: 0,
    total: 0,
  });

  useEffect(() => {
    loadCheckoutData();
    setSelectedAddress(addresses.find(addr => addr.isDefault) || addresses[0]);
    setSelectedPayment(paymentMethods[0]);
  }, []);

  const loadCheckoutData = () => {
    // Mock checkout items - in real app, this would come from cart or product selection
    const mockItems: CheckoutItem[] = [
      { id: '1', name: 'Premium Wireless Headphones', price: 2999, quantity: 1, variant: 'Black' },
      { id: '2', name: 'Bluetooth Speaker', price: 1499, quantity: 2 },
    ];
    
    setItems(mockItems);
    
    const subtotal = mockItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxes = Math.round(subtotal * 0.18); // 18% GST
    const total = subtotal + orderSummary.delivery + taxes;
    
    setOrderSummary(prev => ({
      ...prev,
      subtotal,
      taxes,
      total: total - prev.discount - prev.walletUsed,
    }));
  };

  const handleBackPress = () => {
    if (orderStep === 'PAYMENT') {
      setOrderStep('REVIEW');
    } else if (orderStep === 'CONFIRMATION') {
      // Navigate to orders/tracking page
      router.replace('/tracking');
    } else {
      router.back();
    }
  };

  const handleAddressSelect = (address: DeliveryAddress) => {
    setSelectedAddress(address);
  };

  const handlePaymentSelect = (payment: PaymentMethod) => {
    setSelectedPayment(payment);
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      Alert.alert('Error', 'Please enter a coupon code');
      return;
    }

    // Mock coupon validation
    const validCoupons = {
      'SAVE10': { discount: 100, message: 'SAVE10 applied! ₹100 off' },
      'FIRST50': { discount: 200, message: 'FIRST50 applied! ₹200 off' },
      'WELCOME': { discount: 150, message: 'WELCOME applied! ₹150 off' },
    };

    const coupon = validCoupons[couponCode.toUpperCase() as keyof typeof validCoupons];
    if (coupon) {
      setAppliedCoupon(couponCode.toUpperCase());
      setOrderSummary(prev => ({
        ...prev,
        discount: coupon.discount,
        total: prev.subtotal + prev.delivery + prev.taxes - coupon.discount - prev.walletUsed,
      }));
      Alert.alert('Success', coupon.message);
      setCouponCode('');
    } else {
      Alert.alert('Invalid Coupon', 'This coupon code is not valid');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setOrderSummary(prev => ({
      ...prev,
      discount: 0,
      total: prev.subtotal + prev.delivery + prev.taxes - prev.walletUsed,
    }));
  };

  const handleWalletToggle = (value: boolean) => {
    setUseWalletBalance(value);
    const walletAmount = value ? Math.min(1250, orderSummary.total) : 0;
    setOrderSummary(prev => ({
      ...prev,
      walletUsed: walletAmount,
      total: prev.subtotal + prev.delivery + prev.taxes - prev.discount - walletAmount,
    }));
  };

  const handleProceedToPayment = () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }
    setOrderStep('PAYMENT');
  };

  const handlePlaceOrder = async () => {
    if (!selectedPayment) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    setIsPlacingOrder(true);
    
    try {
      // Mock order placement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setOrderStep('CONFIRMATION');
    } catch (error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const renderOrderItem = (item: CheckoutItem) => (
    <View key={item.id} style={styles.orderItem}>
      <View style={styles.itemImage}>
        <Ionicons name="cube" size={24} color="#8B5CF6" />
      </View>
      <View style={styles.itemDetails}>
        <ThemedText style={styles.itemName}>{item.name}</ThemedText>
        {item.variant && (
          <ThemedText style={styles.itemVariant}>Variant: {item.variant}</ThemedText>
        )}
        <ThemedText style={styles.itemPrice}>₹{item.price.toLocaleString()} × {item.quantity}</ThemedText>
      </View>
      <ThemedText style={styles.itemTotal}>₹{(item.price * item.quantity).toLocaleString()}</ThemedText>
    </View>
  );

  const renderAddress = (address: DeliveryAddress) => (
    <TouchableOpacity
      key={address.id}
      style={[
        styles.addressCard,
        selectedAddress?.id === address.id && styles.selectedCard
      ]}
      onPress={() => handleAddressSelect(address)}
      activeOpacity={0.7}
    >
      <View style={styles.addressHeader}>
        <ThemedText style={styles.addressName}>{address.name}</ThemedText>
        {address.isDefault && (
          <View style={styles.defaultBadge}>
            <ThemedText style={styles.defaultText}>Default</ThemedText>
          </View>
        )}
        {selectedAddress?.id === address.id && (
          <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
        )}
      </View>
      <ThemedText style={styles.addressText}>
        {address.address}, {address.city} - {address.pincode}
      </ThemedText>
      <ThemedText style={styles.addressPhone}>{address.phone}</ThemedText>
    </TouchableOpacity>
  );

  const renderPaymentMethod = (method: PaymentMethod) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.paymentCard,
        selectedPayment?.id === method.id && styles.selectedCard
      ]}
      onPress={() => handlePaymentSelect(method)}
      activeOpacity={0.7}
      disabled={!method.enabled}
    >
      <View style={styles.paymentHeader}>
        <Ionicons name={method.icon as any} size={24} color="#8B5CF6" />
        <View style={styles.paymentDetails}>
          <ThemedText style={styles.paymentTitle}>{method.title}</ThemedText>
          {method.subtitle && (
            <ThemedText style={styles.paymentSubtitle}>{method.subtitle}</ThemedText>
          )}
        </View>
        {selectedPayment?.id === method.id && (
          <Ionicons name="radio-button-on" size={20} color="#8B5CF6" />
        )}
        {selectedPayment?.id !== method.id && (
          <Ionicons name="radio-button-off" size={20} color="#D1D5DB" />
        )}
      </View>
    </TouchableOpacity>
  );

  if (orderStep === 'CONFIRMATION') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#22C55E" />
        
        <LinearGradient
          colors={['#22C55E', '#16A34A']}
          style={styles.confirmationContainer}
        >
          <View style={styles.confirmationContent}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={80} color="white" />
            </View>
            
            <ThemedText style={styles.successTitle}>Order Placed Successfully!</ThemedText>
            <ThemedText style={styles.successMessage}>
              Your order has been confirmed and will be delivered to your selected address.
            </ThemedText>
            
            <View style={styles.orderInfo}>
              <ThemedText style={styles.orderNumber}>Order #WAS123456</ThemedText>
              <ThemedText style={styles.estimatedDelivery}>
                Estimated Delivery: 2-3 business days
              </ThemedText>
            </View>
            
            <View style={styles.confirmationActions}>
              <TouchableOpacity
                style={styles.trackOrderButton}
                onPress={() => router.replace('/tracking')}
              >
                <ThemedText style={styles.trackOrderText}>Track Order</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.continueShoppingButton}
                onPress={() => router.replace('/(tabs)/')}
              >
                <ThemedText style={styles.continueShoppingText}>Continue Shopping</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
      
      {/* Header */}
      <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <ThemedText style={styles.headerTitle}>
            {orderStep === 'REVIEW' ? 'Checkout' : 'Payment'}
          </ThemedText>
          
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {orderStep === 'REVIEW' ? (
          <>
            {/* Order Items */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Order Items ({items.length})</ThemedText>
              {items.map(renderOrderItem)}
            </View>

            {/* Delivery Address */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>Delivery Address</ThemedText>
                <TouchableOpacity>
                  <ThemedText style={styles.addNew}>+ Add New</ThemedText>
                </TouchableOpacity>
              </View>
              {addresses.map(renderAddress)}
            </View>

            {/* Coupon Section */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Coupons & Offers</ThemedText>
              {appliedCoupon ? (
                <View style={styles.appliedCoupon}>
                  <Ionicons name="pricetag" size={20} color="#22C55E" />
                  <ThemedText style={styles.couponCode}>{appliedCoupon}</ThemedText>
                  <ThemedText style={styles.couponDiscount}>-₹{orderSummary.discount}</ThemedText>
                  <TouchableOpacity onPress={handleRemoveCoupon}>
                    <Ionicons name="close" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.couponInput}>
                  <TextInput
                    style={styles.couponField}
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChangeText={setCouponCode}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity style={styles.applyButton} onPress={handleApplyCoupon}>
                    <ThemedText style={styles.applyText}>Apply</ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Wallet Balance */}
            <View style={styles.section}>
              <View style={styles.walletRow}>
                <View style={styles.walletInfo}>
                  <Ionicons name="wallet" size={20} color="#8B5CF6" />
                  <ThemedText style={styles.walletTitle}>Use Wallet Balance (₹1,250)</ThemedText>
                </View>
                <Switch
                  value={useWalletBalance}
                  onValueChange={handleWalletToggle}
                  trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                  thumbColor={useWalletBalance ? '#FFFFFF' : '#F3F4F6'}
                />
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Payment Methods */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Select Payment Method</ThemedText>
              {paymentMethods.map(renderPaymentMethod)}
            </View>
          </>
        )}

        {/* Order Summary */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Order Summary</ThemedText>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Subtotal</ThemedText>
            <ThemedText style={styles.summaryValue}>₹{orderSummary.subtotal.toLocaleString()}</ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Delivery Charges</ThemedText>
            <ThemedText style={styles.summaryValue}>₹{orderSummary.delivery}</ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Taxes & Fees</ThemedText>
            <ThemedText style={styles.summaryValue}>₹{orderSummary.taxes}</ThemedText>
          </View>
          {orderSummary.discount > 0 && (
            <View style={styles.summaryRow}>
              <ThemedText style={[styles.summaryLabel, { color: '#22C55E' }]}>Discount</ThemedText>
              <ThemedText style={[styles.summaryValue, { color: '#22C55E' }]}>-₹{orderSummary.discount}</ThemedText>
            </View>
          )}
          {orderSummary.walletUsed > 0 && (
            <View style={styles.summaryRow}>
              <ThemedText style={[styles.summaryLabel, { color: '#8B5CF6' }]}>Wallet Used</ThemedText>
              <ThemedText style={[styles.summaryValue, { color: '#8B5CF6' }]}>-₹{orderSummary.walletUsed}</ThemedText>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <ThemedText style={styles.totalLabel}>Total Amount</ThemedText>
            <ThemedText style={styles.totalValue}>₹{orderSummary.total.toLocaleString()}</ThemedText>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.actionButton, isPlacingOrder && styles.actionButtonDisabled]}
          onPress={orderStep === 'REVIEW' ? handleProceedToPayment : handlePlaceOrder}
          disabled={isPlacingOrder}
          activeOpacity={0.8}
        >
          {isPlacingOrder ? (
            <ThemedText style={styles.actionButtonText}>Placing Order...</ThemedText>
          ) : (
            <>
              <ThemedText style={styles.actionButtonText}>
                {orderStep === 'REVIEW' ? 'Proceed to Payment' : 'Place Order'}
              </ThemedText>
              <ThemedText style={styles.actionButtonPrice}>₹{orderSummary.total.toLocaleString()}</ThemedText>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 20 : 0,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  addNew: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  
  // Order Items
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  itemVariant: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  
  // Address Cards
  addressCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedCard: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F8F7FF',
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  defaultBadge: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  defaultText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  addressPhone: {
    fontSize: 14,
    color: '#666',
  },
  
  // Coupon Section
  couponInput: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  couponField: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  applyButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyText: {
    color: 'white',
    fontWeight: '600',
  },
  appliedCoupon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#22C55E',
    borderRadius: 8,
    padding: 12,
  },
  couponCode: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#22C55E',
    marginLeft: 8,
  },
  couponDiscount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#22C55E',
    marginRight: 8,
  },
  
  // Wallet Section
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  walletTitle: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  
  // Payment Methods
  paymentCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentDetails: {
    flex: 1,
    marginLeft: 12,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  paymentSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  
  // Order Summary
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  
  // Bottom Action
  bottomSpace: {
    height: 100,
  },
  bottomBar: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  actionButtonPrice: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  
  // Confirmation Page
  confirmationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  successIcon: {
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  orderInfo: {
    alignItems: 'center',
    marginBottom: 48,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  estimatedDelivery: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  confirmationActions: {
    width: '100%',
  },
  trackOrderButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  trackOrderText: {
    color: '#22C55E',
    fontSize: 16,
    fontWeight: '700',
  },
  continueShoppingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueShoppingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});