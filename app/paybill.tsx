// paybill.tsx
// Bill payment page for service-based stores

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import paybillApi from '@/services/paybillApi';
import paymentService from '@/services/paymentService';

interface BillDetails {
  billNumber: string;
  tableNumber?: string;
  bookingId?: string;
  storeId: string;
  storeName: string;
  amount: number;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  taxes?: number;
  serviceCharge?: number;
  discount?: number;
}

export default function PayBillPage() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Form states
  const [billNumber, setBillNumber] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [billDetails, setBillDetails] = useState<BillDetails | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('paybill');

  // Payment methods
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  const storeId = params.storeId as string;
  const storeName = (params.storeName as string) || 'Store';

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const response = await paymentService.getPaymentMethods();
      if (response.success && response.data) {
        // Add PayBill as first payment method
        const methods = [
          {
            id: 'paybill',
            name: 'PayBill Balance',
            type: 'wallet',
            icon: '💰',
            isAvailable: true,
            processingFee: 0,
            processingTime: 'Instant',
            description: 'Pay from your PayBill balance',
          },
          ...response.data,
        ];
        setPaymentMethods(methods);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const handleFetchBill = async () => {
    if (!billNumber && !tableNumber && !bookingId) {
      Alert.alert('Input Required', 'Please enter bill number, table number, or booking ID');
      return;
    }

    setLoading(true);
    try {
      // Mock bill details - replace with actual API call
      const mockBillDetails: BillDetails = {
        billNumber: billNumber || `BILL-${Date.now()}`,
        tableNumber: tableNumber || undefined,
        bookingId: bookingId || undefined,
        storeId: storeId,
        storeName: storeName,
        amount: 1250,
        items: [
          { name: 'Item 1', quantity: 2, price: 500 },
          { name: 'Item 2', quantity: 1, price: 450 },
        ],
        taxes: 150,
        serviceCharge: 100,
        discount: 50,
      };

      setBillDetails(mockBillDetails);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch bill details');
      console.error('Error fetching bill:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (!billDetails) {
      Alert.alert('Error', 'No bill details available');
      return;
    }

    setLoading(true);
    try {
      if (selectedPaymentMethod === 'paybill') {
        // Use PayBill balance
        const response = await paybillApi.useBalance({
          amount: billDetails.amount,
          orderId: billDetails.billNumber,
          description: `Bill payment for ${storeName}`,
        });

        if (response.success) {
          Alert.alert(
            'Payment Successful',
            `Your bill of ₹${billDetails.amount} has been paid successfully.`,
            [
              {
                text: 'View Receipt',
                onPress: () =>
                  router.push(`/payment-success?billNumber=${billDetails.billNumber}`),
              },
              { text: 'OK', onPress: () => router.back() },
            ]
          );
        } else {
          Alert.alert('Payment Failed', response.error || 'Failed to process payment');
        }
      } else {
        // Use other payment methods
        const paymentResponse = await paymentService.initiatePayment({
          amount: billDetails.amount,
          currency: 'INR',
          paymentMethod: selectedPaymentMethod,
          metadata: {
            billNumber: billDetails.billNumber,
            storeId: storeId,
            storeName: storeName,
          },
        });

        if (paymentResponse.success && paymentResponse.data) {
          Alert.alert(
            'Payment Initiated',
            'Please complete the payment process.',
            [{ text: 'OK', onPress: () => router.back() }]
          );
        } else {
          Alert.alert('Error', 'Failed to initiate payment');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Payment processing failed');
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#7C3AED', '#8B5CF6']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pay Your Bill</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Store Info */}
        <View style={styles.storeCard}>
          <Ionicons name="storefront" size={32} color="#7C3AED" />
          <View style={styles.storeInfo}>
            <Text style={styles.storeName}>{storeName}</Text>
            <Text style={styles.storeSubtext}>Enter your bill details below</Text>
          </View>
        </View>

        {/* Input Section */}
        {!billDetails && (
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Bill Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bill Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter bill number"
                placeholderTextColor="#9CA3AF"
                value={billNumber}
                onChangeText={setBillNumber}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.orDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Table Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter table number"
                placeholderTextColor="#9CA3AF"
                value={tableNumber}
                onChangeText={setTableNumber}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.orDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Booking ID</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter booking ID"
                placeholderTextColor="#9CA3AF"
                value={bookingId}
                onChangeText={setBookingId}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={styles.fetchButton}
              onPress={handleFetchBill}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="search" size={20} color="#FFFFFF" />
                  <Text style={styles.fetchButtonText}>Fetch Bill Details</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Bill Details Section */}
        {billDetails && (
          <>
            <View style={styles.billDetailsSection}>
              <View style={styles.billHeader}>
                <Text style={styles.sectionTitle}>Bill Details</Text>
                <TouchableOpacity onPress={() => setBillDetails(null)}>
                  <Text style={styles.changeButton}>Change</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.billCard}>
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Bill Number:</Text>
                  <Text style={styles.billValue}>{billDetails.billNumber}</Text>
                </View>
                {billDetails.tableNumber && (
                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Table Number:</Text>
                    <Text style={styles.billValue}>{billDetails.tableNumber}</Text>
                  </View>
                )}

                {billDetails.items && billDetails.items.length > 0 && (
                  <>
                    <View style={styles.divider} />
                    <Text style={styles.itemsTitle}>Items</Text>
                    {billDetails.items.map((item, index) => (
                      <View key={index} style={styles.itemRow}>
                        <Text style={styles.itemName}>
                          {item.name} x{item.quantity}
                        </Text>
                        <Text style={styles.itemPrice}>₹{item.price}</Text>
                      </View>
                    ))}
                  </>
                )}

                <View style={styles.divider} />

                {billDetails.discount && billDetails.discount > 0 && (
                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Discount:</Text>
                    <Text style={styles.discountValue}>-₹{billDetails.discount}</Text>
                  </View>
                )}
                {billDetails.taxes && (
                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Taxes:</Text>
                    <Text style={styles.billValue}>₹{billDetails.taxes}</Text>
                  </View>
                )}
                {billDetails.serviceCharge && (
                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Service Charge:</Text>
                    <Text style={styles.billValue}>₹{billDetails.serviceCharge}</Text>
                  </View>
                )}

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalAmount}>₹{billDetails.amount}</Text>
                </View>
              </View>
            </View>

            {/* Payment Method Selection */}
            <View style={styles.paymentSection}>
              <Text style={styles.sectionTitle}>Payment Method</Text>
              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentMethod,
                    selectedPaymentMethod === method.id && styles.paymentMethodSelected,
                  ]}
                  onPress={() => setSelectedPaymentMethod(method.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.paymentMethodLeft}>
                    <Text style={styles.paymentIcon}>{method.icon}</Text>
                    <View>
                      <Text style={styles.paymentName}>{method.name}</Text>
                      <Text style={styles.paymentDesc}>{method.description || method.processingTime}</Text>
                    </View>
                  </View>
                  <View style={styles.radioButton}>
                    {selectedPaymentMethod === method.id && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Pay Button */}
            <TouchableOpacity
              style={styles.payButton}
              onPress={handlePayNow}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="card" size={20} color="#FFFFFF" />
                  <Text style={styles.payButtonText}>Pay ₹{billDetails.amount}</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color="#7C3AED" />
          <Text style={styles.infoText}>
            Use your PayBill balance to get instant discounts. Pay now and enjoy your meal!
          </Text>
        </View>
      </ScrollView>
    </View>
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
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  storeInfo: {
    marginLeft: 16,
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  storeSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  inputSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  orText: {
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  fetchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    marginTop: 8,
  },
  fetchButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  billDetailsSection: {
    marginBottom: 16,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  changeButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
  },
  billCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  billLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  billValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  discountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    color: '#6B7280',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F3E8FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7C3AED',
  },
  paymentSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  paymentMethodSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3E8FF',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  paymentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  paymentDesc: {
    fontSize: 12,
    color: '#6B7280',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#7C3AED',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    marginBottom: 16,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#7C3AED',
    lineHeight: 18,
  },
});
