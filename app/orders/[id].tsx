import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams, Stack, useNavigation } from 'expo-router';
import ordersService, { Order } from '@/services/ordersApi';
import { mapBackendOrderToFrontend } from '@/utils/dataMappers';
import ReorderButton from '@/components/orders/ReorderButton';

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBackPress = () => {
    // Check if we can go back in navigation stack
    if (navigation.canGoBack()) {
      router.back();
    } else {
      // If no history, go to tracking page (order history)
      router.replace('/tracking');
    }
  };

  useEffect(() => {
    if (id) {
      loadOrderDetails();
    }
  }, [id]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      console.log('📦 [Order Details] Loading order:', id);

      const response = await ordersService.getOrderById(id as string);

      if (response.success && response.data) {
        console.log('📦 [Order Details] Backend response:', JSON.stringify(response.data, null, 2));
        const mappedOrder = mapBackendOrderToFrontend(response.data);
        console.log('📦 [Order Details] Mapped order:', JSON.stringify(mappedOrder, null, 2));
        console.log('📦 [Order Details] Delivery address check:', {
          hasDeliveryAddress: !!mappedOrder.deliveryAddress,
          deliveryAddress: mappedOrder.deliveryAddress
        });
        setOrder(mappedOrder);
        setError(null);
      }
    } catch (err) {
      console.error('📦 [Order Details] Failed to load order:', err);
      setError(err instanceof Error ? err.message : 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = () => {
    console.log('🚫 [Order Details] Cancel button clicked', {
      orderId: order?.id,
      orderNumber: order?.orderNumber,
      status: order?.status,
      canCancel: order ? canCancelOrder(order.status) : false
    });

    // Use window.confirm for web, Alert for mobile
    if (typeof window !== 'undefined' && window.confirm) {
      const confirmed = window.confirm('Are you sure you want to cancel this order?');
      console.log('🚫 [Order Details] Confirmation result:', confirmed);
      if (confirmed) {
        confirmCancelOrder();
      }
    } else {
      Alert.alert(
        'Cancel Order',
        'Are you sure you want to cancel this order?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: confirmCancelOrder,
          },
        ]
      );
    }
  };

  const confirmCancelOrder = async () => {
    if (!order) return;

    try {
      setCancelling(true);
      console.log('📦 [Order Details] Cancelling order:', order.id);

      const response = await ordersService.cancelOrder(order.id, 'Customer requested cancellation');

      console.log('📦 [Order Details] Cancel response:', response);

      if (response.success) {
        // Use window.alert for web, Alert for mobile
        if (typeof window !== 'undefined' && window.alert) {
          window.alert('Order cancelled successfully');
          router.back();
        } else {
          Alert.alert('Success', 'Order cancelled successfully', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        }
      } else {
        throw new Error(response.message || 'Failed to cancel order');
      }
    } catch (err: any) {
      console.error('📦 [Order Details] Failed to cancel order:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to cancel order. Please try again.';

      if (typeof window !== 'undefined' && window.alert) {
        window.alert('Error: ' + errorMsg);
      } else {
        Alert.alert('Error', errorMsg);
      }
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return '#10b981';
      case 'shipped':
      case 'dispatched':
      case 'out_for_delivery':
        return '#3b82f6';
      case 'processing':
      case 'preparing':
      case 'ready':
      case 'confirmed':
        return '#f59e0b';
      case 'cancelled':
      case 'refunded':
        return '#ef4444';
      case 'placed':
      case 'pending':
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canCancelOrder = (status: string) => {
    return ['pending', 'placed', 'confirmed', 'processing', 'preparing', 'ready'].includes(status);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Order not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadOrderDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Custom Header with Back Button */}
        <View style={styles.customHeader}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.customHeaderTitle}>Order Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Order Info Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
          </View>

      {/* Order Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items Ordered</Text>
        {order.items.map((item, index) => {
          // Handle both backend formats - full product object or minimal product
          const productImage = item.product?.images?.[0]?.url ||
                              item.product?.images?.[0] ||
                              item.image ||
                              'https://via.placeholder.com/100';
          const productName = item.product?.name || item.name || 'Product';

          // Handle store - can be string (ObjectId), object {id, name}, or nested object
          let storeName = 'Store';
          if (typeof item.store === 'string') {
            storeName = item.store;
          } else if (typeof item.store === 'object' && item.store?.name) {
            storeName = item.store.name;
          } else if (item.product?.store?.name) {
            storeName = item.product.store.name;
          }

          return (
            <View key={index} style={styles.itemCard}>
              <Image
                source={{ uri: productImage }}
                style={styles.itemImage}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{productName}</Text>
                <Text style={styles.storeName}>{storeName}</Text>
                {item.variant && (
                  <Text style={styles.variantText}>Variant: {item.variant.name}</Text>
                )}
                <View style={styles.itemFooter}>
                  <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                  <Text style={styles.itemPrice}>₹{item.price || item.unitPrice || 0} each</Text>
                </View>
              </View>
              <Text style={styles.itemTotal}>₹{item.subtotal || item.totalPrice || 0}</Text>
            </View>
          );
        })}
      </View>

      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              ₹{(order.totals?.subtotal || order.summary?.subtotal || 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryValue}>
              ₹{(order.totals?.delivery || order.summary?.shipping || 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>
              ₹{(order.totals?.tax || order.summary?.tax || 0).toFixed(2)}
            </Text>
          </View>
          {(order.totals?.discount || order.summary?.discount || 0) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, styles.discountLabel]}>Discount</Text>
              <Text style={[styles.summaryValue, styles.discountValue]}>
                -₹{(order.totals?.discount || order.summary?.discount || 0).toFixed(2)}
              </Text>
            </View>
          )}
          {(order.totals?.cashback || 0) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, styles.discountLabel]}>Cashback</Text>
              <Text style={[styles.summaryValue, styles.discountValue]}>
                +₹{(order.totals.cashback).toFixed(2)}
              </Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              ₹{(order.totals?.total || order.summary?.total || 0).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Shipping Address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <View style={styles.addressCard}>
          {order.deliveryAddress ? (
            <>
              <Text style={styles.addressName}>{order.deliveryAddress.name}</Text>
              <Text style={styles.addressText}>{order.deliveryAddress.addressLine1 || order.deliveryAddress.address1}</Text>
              {(order.deliveryAddress.addressLine2 || order.deliveryAddress.address2) && (
                <Text style={styles.addressText}>{order.deliveryAddress.addressLine2 || order.deliveryAddress.address2}</Text>
              )}
              {order.deliveryAddress.landmark && (
                <Text style={styles.addressText}>Landmark: {order.deliveryAddress.landmark}</Text>
              )}
              <Text style={styles.addressText}>
                {order.deliveryAddress.city}, {order.deliveryAddress.state}
              </Text>
              <Text style={styles.addressText}>{order.deliveryAddress.pincode || order.deliveryAddress.zipCode}</Text>
              {order.deliveryAddress.phone && (
                <Text style={styles.addressPhone}>Phone: {order.deliveryAddress.phone}</Text>
              )}
            </>
          ) : (
            <Text style={styles.addressText}>No delivery address available</Text>
          )}
        </View>
      </View>

      {/* Payment Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Status</Text>
        <View style={styles.paymentCard}>
          <Text
            style={[
              styles.paymentStatus,
              {
                color:
                  (order.payment?.status || order.paymentStatus) === 'paid'
                    ? '#10b981'
                    : (order.payment?.status || order.paymentStatus) === 'failed'
                    ? '#ef4444'
                    : '#f59e0b',
              },
            ]}
          >
            {(order.payment?.status || order.paymentStatus || 'pending').toUpperCase()}
          </Text>
          <Text style={styles.paymentMethod}>
            Method: {(order.payment?.method || 'N/A').toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Order Timeline */}
      {order.timeline && order.timeline.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Timeline</Text>
          <View style={styles.timelineCard}>
            {order.timeline.map((event, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                {index < order.timeline.length - 1 && <View style={styles.timelineLine} />}
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineStatus}>{event.status}</Text>
                  <Text style={styles.timelineMessage}>{event.message}</Text>
                  <Text style={styles.timelineDate}>{formatDate(event.timestamp)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Tracking Info */}
      {order.tracking && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tracking Information</Text>
          <View style={styles.trackingCard}>
            <View style={styles.trackingRow}>
              <Text style={styles.trackingLabel}>Tracking Number</Text>
              <Text style={styles.trackingValue}>{order.tracking.number}</Text>
            </View>
            <View style={styles.trackingRow}>
              <Text style={styles.trackingLabel}>Carrier</Text>
              <Text style={styles.trackingValue}>{order.tracking.carrier}</Text>
            </View>
            {order.tracking.estimatedDelivery && (
              <View style={styles.trackingRow}>
                <Text style={styles.trackingLabel}>Estimated Delivery</Text>
                <Text style={styles.trackingValue}>
                  {formatDate(order.tracking.estimatedDelivery)}
                </Text>
              </View>
            )}
            {order.tracking.url && (
              <TouchableOpacity style={styles.trackButton}>
                <Text style={styles.trackButtonText}>Track Package</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        {(order.status === 'delivered' || order.status === 'cancelled') && (
          <View style={styles.reorderContainer}>
            <ReorderButton
              orderId={order.id}
              orderNumber={order.orderNumber}
              variant="primary"
              size="large"
              fullWidth
              onSuccess={() => router.push('/CartPage')}
            />
          </View>
        )}

        {canCancelOrder(order.status) && (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={handleCancelOrder}
            disabled={cancelling}
          >
            {cancelling ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            )}
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/')}>
          <Text style={styles.actionButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#111827',
  },
  customHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  orderDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  variantText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#6b7280',
  },
  itemPrice: {
    fontSize: 12,
    color: '#6b7280',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  discountLabel: {
    color: '#10b981',
  },
  discountValue: {
    color: '#10b981',
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginTop: 4,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  addressPhone: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentStatus: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  paymentMethod: {
    fontSize: 14,
    color: '#6b7280',
  },
  timelineCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timelineItem: {
    flexDirection: 'row',
    position: 'relative',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6366f1',
    marginRight: 12,
    marginTop: 4,
  },
  timelineLine: {
    position: 'absolute',
    left: 5.5,
    top: 16,
    bottom: -16,
    width: 1,
    backgroundColor: '#e5e7eb',
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  timelineMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  trackingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  trackingRow: {
    marginBottom: 12,
  },
  trackingLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  trackingValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  trackButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  trackButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  actions: {
    marginTop: 8,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  reorderContainer: {
    marginBottom: 12,
  },
});