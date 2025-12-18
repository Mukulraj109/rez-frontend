// Order Confirmation Page
// Shows order success, summary, and next actions

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
  Share,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ordersService, { Order } from '@/services/ordersApi';

export default function OrderConfirmationPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Animation values
  const [successAnim] = useState(new Animated.Value(0));
  const [contentAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    } else {
      setError('Order ID not provided');
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (order) {
      // Animate success icon
      Animated.sequence([
        Animated.spring(successAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(contentAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [order]);

  const loadOrderDetails = async () => {
    try {

      setLoading(true);
      setError(null);

      const response = await ordersService.getOrderById(orderId);

      if (response.success && response.data) {

        setOrder(response.data);
      } else {
        console.error('📦 [ORDER CONFIRMATION] Failed to load order:', response.error);
        setError(response.error || 'Failed to load order details');
      }
    } catch (error) {
      console.error('📦 [ORDER CONFIRMATION] Error loading order:', error);
      setError(error instanceof Error ? error.message : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackOrder = () => {
    if (order) {
      router.push(`/tracking?orderId=${order._id || order.id}`);
    }
  };

  const handleContinueShopping = () => {
    router.replace('/(tabs)');
  };

  const handleShareOrder = async () => {
    if (!order) return;

    try {
      const message = `I just placed an order on REZ!\n\nOrder #${order.orderNumber}\nTotal: ₹${order.totals.total}\nStatus: ${order.status}\n\nTrack your orders on REZ app!`;

      await Share.share({
        message,
        title: 'My REZ Order',
      });
    } catch (error) {
      console.error('📦 [ORDER CONFIRMATION] Share error:', error);
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

  const getPaymentMethodDisplay = (method: string) => {
    const methods: Record<string, string> = {
      wallet: 'Wallet',
      card: 'Card',
      upi: 'UPI',
      cod: 'Cash on Delivery',
      netbanking: 'Net Banking',
    };
    return methods[method] || method;
  };

  const getEstimatedDelivery = () => {
    if (!order) return 'Calculating...';

    // Calculate estimated delivery (3-5 days from now)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 4);

    return deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    });
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
        <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <ThemedText style={styles.headerTitle}>Loading Order...</ThemedText>
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <ThemedText style={styles.loadingText}>Loading order details...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error || !order) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
        <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <ThemedText style={styles.headerTitle}>Order Not Found</ThemedText>
          </View>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <ThemedText style={styles.errorTitle}>Order Not Found</ThemedText>
          <ThemedText style={styles.errorMessage}>{error || 'Unable to load order details'}</ThemedText>
          <TouchableOpacity style={styles.primaryButton} onPress={handleContinueShopping}>
            <ThemedText style={styles.primaryButtonText}>Go to Home</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />

      {/* Header */}
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Order Confirmed</ThemedText>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Animation */}
        <Animated.View
          style={[
            styles.successSection,
            {
              opacity: successAnim,
              transform: [
                {
                  scale: successAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#22C55E" />
          </View>
          <ThemedText style={styles.successTitle}>Order Placed Successfully!</ThemedText>
          <ThemedText style={styles.successSubtitle}>
            Thank you for your purchase
          </ThemedText>
        </Animated.View>

        {/* Order Details Card */}
        <Animated.View style={[styles.card, { opacity: contentAnim }]}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Order Details</ThemedText>
            <TouchableOpacity onPress={handleShareOrder} style={styles.shareButton}>
              <Ionicons name="share-outline" size={20} color="#8B5CF6" />
            </TouchableOpacity>
          </View>

          <View style={styles.orderInfo}>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Order Number</ThemedText>
              <ThemedText style={styles.infoValue}>{order.orderNumber}</ThemedText>
            </View>

            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Order Date</ThemedText>
              <ThemedText style={styles.infoValue}>{formatDate(order.createdAt)}</ThemedText>
            </View>

            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Payment Method</ThemedText>
              <ThemedText style={styles.infoValue}>
                {getPaymentMethodDisplay(order.payment.method)}
              </ThemedText>
            </View>

            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Payment Status</ThemedText>
              <View style={[styles.statusBadge, styles.paidBadge]}>
                <ThemedText style={styles.statusText}>
                  {order.payment.status === 'paid' ? 'Paid' : 'Pending'}
                </ThemedText>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Delivery Information */}
        <Animated.View style={[styles.card, { opacity: contentAnim }]}>
          <ThemedText style={styles.cardTitle}>Delivery Information</ThemedText>

          <View style={styles.deliveryInfo}>
            <View style={styles.deliveryIconContainer}>
              <Ionicons name="location" size={24} color="#8B5CF6" />
            </View>
            <View style={styles.deliveryDetails}>
              <ThemedText style={styles.deliveryAddress}>
                {order.delivery.address.name}
              </ThemedText>
              <ThemedText style={styles.deliveryAddressText}>
                {order.delivery.address.addressLine1}
                {order.delivery.address.addressLine2 ? `, ${order.delivery.address.addressLine2}` : ''}
              </ThemedText>
              <ThemedText style={styles.deliveryAddressText}>
                {order.delivery.address.city}, {order.delivery.address.state} - {order.delivery.address.pincode}
              </ThemedText>
              <ThemedText style={styles.deliveryPhone}>
                {order.delivery.address.phone}
              </ThemedText>
            </View>
          </View>

          <View style={styles.estimatedDelivery}>
            <Ionicons name="time-outline" size={20} color="#10B981" />
            <ThemedText style={styles.estimatedDeliveryText}>
              Estimated Delivery: {getEstimatedDelivery()}
            </ThemedText>
          </View>
        </Animated.View>

        {/* Order Items */}
        <Animated.View style={[styles.card, { opacity: contentAnim }]}>
          <ThemedText style={styles.cardTitle}>Order Items ({order.items.length})</ThemedText>

          {order.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <ThemedText style={styles.itemName}>{item.product?.name || 'Product'}</ThemedText>
                {item.variant && (
                  <ThemedText style={styles.itemVariant}>
                    Variant: {item.variant.name}
                  </ThemedText>
                )}
                <ThemedText style={styles.itemQuantity}>Qty: {item.quantity}</ThemedText>
              </View>
              <ThemedText style={styles.itemPrice}>₹{item.totalPrice}</ThemedText>
            </View>
          ))}
        </Animated.View>

        {/* Order Summary */}
        <Animated.View style={[styles.card, { opacity: contentAnim }]}>
          <ThemedText style={styles.cardTitle}>Order Summary</ThemedText>

          <View style={styles.summaryRows}>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Subtotal</ThemedText>
              <ThemedText style={styles.summaryValue}>₹{order.totals.subtotal}</ThemedText>
            </View>

            {order.totals.delivery > 0 && (
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>Delivery Fee</ThemedText>
                <ThemedText style={styles.summaryValue}>₹{order.totals.delivery}</ThemedText>
              </View>
            )}

            {order.totals.tax > 0 && (
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>Tax</ThemedText>
                <ThemedText style={styles.summaryValue}>₹{order.totals.tax}</ThemedText>
              </View>
            )}

            {order.totals.discount > 0 && (
              <View style={styles.summaryRow}>
                <ThemedText style={[styles.summaryLabel, { color: '#22C55E' }]}>
                  Discount
                </ThemedText>
                <ThemedText style={[styles.summaryValue, { color: '#22C55E' }]}>
                  -₹{order.totals.discount}
                </ThemedText>
              </View>
            )}

            {(order.payment as any)?.coinsUsed && ((order.payment as any).coinsUsed.wasilCoins > 0 || (order.payment as any).coinsUsed.promoCoins > 0 || (order.payment as any).coinsUsed.storePromoCoins > 0) && (
              <View style={styles.summaryRow}>
                <ThemedText style={[styles.summaryLabel, { color: '#8B5CF6' }]}>
                  💎 Coins Used
                  {(order.payment as any).coinsUsed.storePromoCoins > 0 && ' (includes Store Promo)'}
                </ThemedText>
                <ThemedText style={[styles.summaryValue, { color: '#8B5CF6' }]}>
                  -₹{(order.payment as any).coinsUsed.totalCoinsValue || 0}
                </ThemedText>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <ThemedText style={styles.totalLabel}>Total Paid</ThemedText>
              <ThemedText style={styles.totalValue}>₹{order.totals.total}</ThemedText>
            </View>

            {order.totals.cashback > 0 && (
              <View style={styles.cashbackRow}>
                <Ionicons name="gift" size={16} color="#F59E0B" />
                <ThemedText style={styles.cashbackText}>
                  You earned ₹{order.totals.cashback} cashback!
                </ThemedText>
              </View>
            )}
          </View>
        </Animated.View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleContinueShopping}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.secondaryButtonText}>Continue Shopping</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleTrackOrder}
          activeOpacity={0.7}
        >
          <Ionicons name="location" size={20} color="white" />
          <ThemedText style={styles.primaryButtonText}>Track Order</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  successSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  shareButton: {
    padding: 8,
  },
  orderInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paidBadge: {
    backgroundColor: '#ECFDF5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22C55E',
  },
  deliveryInfo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  deliveryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryDetails: {
    flex: 1,
  },
  deliveryAddress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  deliveryAddressText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  deliveryPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  estimatedDelivery: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 8,
  },
  estimatedDeliveryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  itemVariant: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#6B7280',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  summaryRows: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  cashbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3E2',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  cashbackText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F59E0B',
  },
  bottomSpacing: {
    height: 100,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
