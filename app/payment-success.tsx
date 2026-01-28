import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  BackHandler,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import ordersApi from '@/services/ordersApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totals: {
    subtotal: number;
    discount: number;
    total: number;
    paidAmount: number;
  };
  payment: {
    method: string;
    status: string;
    coinsUsed?: {
      rezCoins?: number;
      promoCoins?: number;
      storePromoCoins?: number;
      totalCoinsValue?: number;
    };
  };
  createdAt: string;
}

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { orderId, transactionId, paymentMethod } = useLocalSearchParams<{
    orderId: string;
    transactionId: string;
    paymentMethod: string;
  }>();

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const response = await ordersApi.getOrderById(orderId);
        if (response.success && response.data) {
          const orderData = response.data;
          console.log('📦 [PAYMENT SUCCESS] Order data received:', JSON.stringify(orderData, null, 2));
          setOrder({
            id: orderData.id || orderData._id,
            orderNumber: orderData.orderNumber || `REZ${Date.now().toString().slice(-8)}`,
            status: orderData.status || 'placed',
            items: orderData.items || [],
            totals: {
              subtotal: orderData.totals?.subtotal || orderData.summary?.subtotal || 0,
              discount: orderData.totals?.discount || orderData.summary?.discount || 0,
              total: orderData.totals?.total || orderData.summary?.total || 0,
              paidAmount: orderData.totals?.paidAmount || 0,
            },
            payment: {
              method: orderData.payment?.method || paymentMethod || 'unknown',
              status: orderData.payment?.status || 'completed',
              coinsUsed: orderData.payment?.coinsUsed || {
                rezCoins: 0,
                promoCoins: 0,
                storePromoCoins: 0,
                totalCoinsValue: 0,
              },
            },
            createdAt: orderData.createdAt || new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error('Failed to fetch order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, paymentMethod]);

  // Handle hardware back button - redirect to home
  useEffect(() => {
    const backAction = () => {
      router.replace('/(tabs)/' as any);
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [router]);

  const handleTrackOrder = () => {
    if (orderId) {
      router.push(`/tracking?orderId=${orderId}` as any);
    } else {
      router.push('/tracking' as any);
    }
  };

  const handleGoHome = () => {
    router.replace('/(tabs)/' as any);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cod': return 'cash';
      case 'wallet': return 'diamond';
      case 'razorpay':
      case 'card':
      case 'upi': return 'card';
      default: return 'checkmark-circle';
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cod': return 'Cash on Delivery';
      case 'wallet': return 'ReZ Wallet';
      case 'razorpay': return 'Online Payment';
      case 'card': return 'Credit/Debit Card';
      case 'upi': return 'UPI';
      default: return 'Payment';
    }
  };

  // Calculate estimated delivery (30-45 mins from order)
  const getEstimatedDelivery = () => {
    const orderDate = order?.createdAt ? new Date(order.createdAt) : new Date();
    const minDelivery = new Date(orderDate.getTime() + 30 * 60000);
    const maxDelivery = new Date(orderDate.getTime() + 45 * 60000);
    const formatTime = (date: Date) =>
      date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return `${formatTime(minDelivery)} - ${formatTime(maxDelivery)}`;
  };

  const method = paymentMethod || order?.payment?.method || '';
  const isCod = method === 'cod';
  const coinsUsedValue = order?.payment?.coinsUsed?.totalCoinsValue || 0;
  const orderTotal = order?.totals?.total || 0;
  const payableAmount = isCod ? orderTotal - coinsUsedValue : (order?.totals?.paidAmount || orderTotal);
  const itemCount = order?.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#16A34A" />

      {/* Fixed Header */}
      <LinearGradient
        colors={['#22C55E', '#16A34A']}
        style={styles.headerGradient}
      >
        {/* Success Icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={32} color="#22C55E" />
        </View>

        <ThemedText style={styles.successTitle}>Payment Successful!</ThemedText>
        <ThemedText style={styles.successMessage}>
          {isCod
            ? 'Your order has been placed. Pay when you receive your order.'
            : 'Your payment has been processed successfully.'}
        </ThemedText>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentArea}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#22C55E" />
              <ThemedText style={styles.loadingText}>Loading order details...</ThemedText>
            </View>
          ) : (
            <>
              {/* Order Number Card */}
              <View style={styles.orderNumberCard}>
                <ThemedText style={styles.orderNumberLabel}>Order Number</ThemedText>
                <ThemedText style={styles.orderNumber} numberOfLines={1} adjustsFontSizeToFit>
                  #{order?.orderNumber || `REZ${orderId?.slice(-8) || '000000'}`}
                </ThemedText>
              </View>

              {/* Details Card */}
              <View style={styles.detailsCard}>
                {/* Transaction ID */}
                {transactionId && (
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Transaction ID</ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {transactionId.length > 16
                        ? `${transactionId.slice(0, 8)}...${transactionId.slice(-8)}`
                        : transactionId}
                    </ThemedText>
                  </View>
                )}

                {/* Payment Method */}
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Payment Method</ThemedText>
                  <View style={styles.methodBadge}>
                    <Ionicons name={getPaymentMethodIcon(method)} size={13} color="#16A34A" />
                    <ThemedText style={styles.methodText}>
                      {getPaymentMethodLabel(method)}
                    </ThemedText>
                  </View>
                </View>

                {/* Coins Used */}
                {coinsUsedValue > 0 && (
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>ReZ Coins Used</ThemedText>
                    <ThemedText style={styles.coinsValue}>
                      -₹{coinsUsedValue.toLocaleString()}
                    </ThemedText>
                  </View>
                )}

                {/* Separator */}
                <View style={styles.separator} />

                {/* Amount */}
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>
                    {isCod ? 'Pay on Delivery' : 'Amount Paid'}
                  </ThemedText>
                  <ThemedText style={styles.amountValue}>
                    ₹{payableAmount.toLocaleString()}
                  </ThemedText>
                </View>

                {/* Order Total (if different from payable) */}
                {coinsUsedValue > 0 && (
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Order Total</ThemedText>
                    <ThemedText style={styles.detailValueBold}>
                      ₹{orderTotal.toLocaleString()}
                    </ThemedText>
                  </View>
                )}

                {/* Items */}
                {itemCount > 0 && (
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Items</ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {itemCount} item{itemCount !== 1 ? 's' : ''}
                    </ThemedText>
                  </View>
                )}
              </View>

              {/* Estimated Delivery */}
              <View style={styles.deliveryCard}>
                <View style={styles.deliveryIconWrap}>
                  <Ionicons name="bicycle-outline" size={18} color="#16A34A" />
                </View>
                <View style={styles.deliveryInfo}>
                  <ThemedText style={styles.deliveryLabel}>Estimated Delivery</ThemedText>
                  <ThemedText style={styles.deliveryTime}>{getEstimatedDelivery()}</ThemedText>
                </View>
              </View>

              {/* Email Notice */}
              <View style={styles.emailNotice}>
                <Ionicons name="mail-outline" size={14} color="#9CA3AF" />
                <ThemedText style={styles.emailText}>
                  Confirmation sent to your registered email
                </ThemedText>
              </View>
            </>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.trackButton}
              onPress={handleTrackOrder}
              activeOpacity={0.8}
              accessibilityLabel="Track your order"
              accessibilityRole="button"
            >
              <Ionicons name="location-outline" size={18} color="#FFFFFF" />
              <ThemedText style={styles.trackButtonText}>Track Order</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.homeButton}
              onPress={handleGoHome}
              activeOpacity={0.8}
              accessibilityLabel="Back to home"
              accessibilityRole="button"
            >
              <Ionicons name="home-outline" size={18} color="#22C55E" />
              <ThemedText style={styles.homeButtonText}>Back to Home</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.select({ ios: 100, android: 90, default: 100 }),
  },

  // --- Header ---
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    zIndex: 1,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6 },
      android: { elevation: 6 },
      web: { boxShadow: '0 3px 12px rgba(0,0,0,0.15)' },
    }),
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  successMessage: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 16,
  },

  // --- Content ---
  contentArea: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 10,
  },

  // --- Order Number ---
  orderNumberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 2 },
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    }),
  },
  orderNumberLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.3,
  },

  // --- Details Card ---
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 2 },
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    }),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  detailValueBold: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  methodText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
  },
  coinsValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A34A',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 2,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#16A34A',
  },

  // --- Delivery Card ---
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 10,
  },
  deliveryIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 1,
  },
  deliveryTime: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16A34A',
  },

  // --- Email Notice ---
  emailNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 24,
    paddingTop: 4,
  },
  emailText: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  // --- Action Buttons ---
  actions: {
    gap: 10,
  },
  trackButton: {
    backgroundColor: '#22C55E',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Platform.select({
      ios: { shadowColor: '#22C55E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 4 },
      web: { boxShadow: '0 4px 14px rgba(34,197,94,0.3)' },
    }),
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  homeButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  homeButtonText: {
    color: '#22C55E',
    fontSize: 15,
    fontWeight: '700',
  },
});
