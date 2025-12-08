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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import ordersApi from '@/services/ordersApi';

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
  };
  payment: {
    method: string;
    status: string;
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
          setOrder({
            id: orderData.id || orderData._id,
            orderNumber: orderData.orderNumber || `REZ${Date.now().toString().slice(-8)}`,
            status: orderData.status || 'placed',
            items: orderData.items || [],
            totals: {
              subtotal: orderData.totals?.subtotal || orderData.summary?.subtotal || 0,
              discount: orderData.totals?.discount || orderData.summary?.discount || 0,
              total: orderData.totals?.total || orderData.summary?.total || 0,
            },
            payment: {
              method: orderData.payment?.method || paymentMethod || 'unknown',
              status: orderData.payment?.status || 'completed',
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
      return true; // Prevent default back behavior
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
      case 'cod':
        return 'cash';
      case 'paybill':
        return 'wallet';
      case 'wallet':
        return 'diamond';
      case 'razorpay':
      case 'card':
      case 'upi':
        return 'card';
      default:
        return 'checkmark-circle';
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cod':
        return 'Cash on Delivery';
      case 'paybill':
        return 'PayBill';
      case 'wallet':
        return 'REZ Wallet';
      case 'razorpay':
        return 'Online Payment';
      case 'card':
        return 'Credit/Debit Card';
      case 'upi':
        return 'UPI';
      default:
        return 'Payment';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#22C55E" />

      <LinearGradient
        colors={['#22C55E', '#16A34A']}
        style={styles.successContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.successContent}>
            {/* Success Icon */}
            <View
              style={styles.successIcon}
              accessible={true}
              accessibilityLabel="Payment successful"
              accessibilityRole="image"
            >
              <View style={styles.iconCircle}>
                <Ionicons name="checkmark" size={50} color="#22C55E" />
              </View>
            </View>

            {/* Success Title */}
            <ThemedText
              style={styles.successTitle}
              accessibilityRole="header"
            >
              Payment Successful!
            </ThemedText>
            <ThemedText style={styles.successMessage}>
              {paymentMethod === 'cod'
                ? 'Your order has been placed. Pay when you receive your order.'
                : 'Your payment has been processed successfully.'}
            </ThemedText>

            {/* Order Info Card */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="white" />
                <ThemedText style={styles.loadingText}>Loading order details...</ThemedText>
              </View>
            ) : (
              <View style={styles.orderCard}>
                {/* Order Number */}
                <View style={styles.orderHeader}>
                  <ThemedText style={styles.orderLabel}>Order Number</ThemedText>
                  <ThemedText style={styles.orderNumber}>
                    #{order?.orderNumber || `REZ${orderId?.slice(-8) || '000000'}`}
                  </ThemedText>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Transaction ID */}
                {transactionId && (
                  <View style={styles.orderRow}>
                    <ThemedText style={styles.rowLabel}>Transaction ID</ThemedText>
                    <ThemedText style={styles.rowValue}>
                      {transactionId.length > 16
                        ? `${transactionId.slice(0, 8)}...${transactionId.slice(-8)}`
                        : transactionId}
                    </ThemedText>
                  </View>
                )}

                {/* Payment Method */}
                <View style={styles.orderRow}>
                  <ThemedText style={styles.rowLabel}>Payment Method</ThemedText>
                  <View style={styles.paymentMethodBadge}>
                    <Ionicons
                      name={getPaymentMethodIcon(paymentMethod || order?.payment?.method || '')}
                      size={14}
                      color="#22C55E"
                    />
                    <ThemedText style={styles.paymentMethodText}>
                      {getPaymentMethodLabel(paymentMethod || order?.payment?.method || '')}
                    </ThemedText>
                  </View>
                </View>

                {/* Amount Paid */}
                <View style={styles.orderRow}>
                  <ThemedText style={styles.rowLabel}>Amount Paid</ThemedText>
                  <ThemedText style={styles.amountValue}>
                    ₹{(order?.totals?.total || 0).toLocaleString()}
                  </ThemedText>
                </View>

                {/* Items Count */}
                {order?.items && order.items.length > 0 && (
                  <View style={styles.orderRow}>
                    <ThemedText style={styles.rowLabel}>Items</ThemedText>
                    <ThemedText style={styles.rowValue}>
                      {order.items.reduce((sum, item) => sum + (item.quantity || 1), 0)} item(s)
                    </ThemedText>
                  </View>
                )}

                {/* Estimated Delivery */}
                <View style={styles.deliverySection}>
                  <Ionicons name="time-outline" size={18} color="#22C55E" />
                  <View style={styles.deliveryInfo}>
                    <ThemedText style={styles.deliveryLabel}>Estimated Delivery</ThemedText>
                    <ThemedText style={styles.deliveryTime}>{getEstimatedDelivery()}</ThemedText>
                  </View>
                </View>
              </View>
            )}

            {/* Email Notification */}
            <View style={styles.emailNotice}>
              <Ionicons name="mail-outline" size={18} color="rgba(255,255,255,0.8)" />
              <ThemedText style={styles.emailText}>
                Confirmation details sent to your registered email
              </ThemedText>
            </View>

            {/* Action Buttons */}
            <View style={styles.successActions}>
              <TouchableOpacity
                style={styles.trackOrderButton}
                onPress={handleTrackOrder}
                accessibilityLabel="Track your order"
                accessibilityRole="button"
                accessibilityHint="Double tap to view order tracking details"
              >
                <Ionicons name="location-outline" size={20} color="#22C55E" />
                <ThemedText style={styles.trackOrderText}>Track Order</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.continueShoppingButton}
                onPress={handleGoHome}
                accessibilityLabel="Continue shopping"
                accessibilityRole="button"
                accessibilityHint="Double tap to return to home page"
              >
                <Ionicons name="home-outline" size={20} color="white" />
                <ThemedText style={styles.continueShoppingText}>Back to Home</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  successContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  successContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successIcon: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 12,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  orderHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  orderLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#22C55E',
  },
  paymentMethodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  paymentMethodText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#22C55E',
  },
  deliverySection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
    gap: 12,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  deliveryTime: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22C55E',
  },
  emailNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
    paddingHorizontal: 16,
  },
  emailText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    flex: 1,
  },
  successActions: {
    width: '100%',
    gap: 12,
  },
  trackOrderButton: {
    backgroundColor: 'white',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trackOrderText: {
    color: '#22C55E',
    fontSize: 16,
    fontWeight: '700',
  },
  continueShoppingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  continueShoppingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
