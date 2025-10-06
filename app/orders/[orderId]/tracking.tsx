import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import OrderTimeline from '@/components/orders/OrderTimeline';
import DeliveryMap from '@/components/orders/DeliveryMap';

export default function OrderTrackingScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  const {
    order,
    loading,
    error,
    statusUpdate,
    locationUpdate,
    deliveryPartner,
    timeline,
    isLive,
    isConnected,
    refresh,
  } = useOrderTracking(orderId || null);

  // Show notification when status changes
  useEffect(() => {
    if (statusUpdate) {
      // In production, this would trigger a push notification
      console.log('Status updated:', statusUpdate);
    }
  }, [statusUpdate]);

  const handleRefresh = () => {
    refresh();
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            // Call cancel order API
            console.log('Cancelling order:', orderId);
            // ordersService.cancelOrder(orderId);
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    // Navigate to support page or open chat
    console.log('Contact support for order:', orderId);
  };

  if (loading && !order) {
    return (
      <View style={styles.centered}>
        <Stack.Screen
          options={{
            title: 'Order Tracking',
            headerBackTitle: 'Back',
          }}
        />
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (error && !order) {
    return (
      <View style={styles.centered}>
        <Stack.Screen
          options={{
            title: 'Order Tracking',
            headerBackTitle: 'Back',
          }}
        />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centered}>
        <Stack.Screen
          options={{
            title: 'Order Tracking',
            headerBackTitle: 'Back',
          }}
        />
        <Text style={styles.errorText}>Order not found</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const canCancel = ['placed', 'confirmed', 'preparing'].includes(order.status);
  const showMap = ['dispatched', 'out_for_delivery'].includes(order.status);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: `Order ${order.orderNumber}`,
          headerBackTitle: 'Orders',
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            colors={['#6366f1']}
          />
        }
      >
        {/* Order Header */}
        <View style={styles.headerCard}>
          <View style={styles.orderHeaderRow}>
            <View>
              <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
              <Text style={styles.orderDate}>
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.liveIndicatorContainer}>
              {isLive && isConnected ? (
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              ) : (
                <Text style={styles.offlineText}>Offline</Text>
              )}
            </View>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={styles.statusText}>{getStatusLabel(order.status)}</Text>
          </View>
        </View>

        {/* Delivery Map */}
        {showMap && (
          <View style={styles.section}>
            <DeliveryMap
              locationUpdate={locationUpdate}
              deliveryAddress={order.delivery?.address}
            />
          </View>
        )}

        {/* Order Timeline */}
        <View style={styles.section}>
          <OrderTimeline
            currentStatus={order.status}
            timeline={timeline || order.timeline}
            estimatedDeliveryTime={order.delivery?.estimatedTime || order.estimatedDeliveryTime}
          />
        </View>

        {/* Order Items Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          <View style={styles.itemsSummary}>
            <Text style={styles.itemsCount}>
              {order.items.length} item{order.items.length > 1 ? 's' : ''}
            </Text>
            <Text style={styles.itemsTotal}>₹{order.totals.total}</Text>
          </View>
          {order.items.slice(0, 3).map((item: any, index: number) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name || item.product?.name}
              </Text>
              <Text style={styles.itemQuantity}>x{item.quantity}</Text>
            </View>
          ))}
          {order.items.length > 3 && (
            <Text style={styles.moreItems}>
              +{order.items.length - 3} more item{order.items.length - 3 > 1 ? 's' : ''}
            </Text>
          )}
        </View>

        {/* Delivery Address */}
        {order.delivery?.address && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <View style={styles.addressCard}>
              <Text style={styles.addressName}>{order.delivery.address.name}</Text>
              <Text style={styles.addressText}>
                {order.delivery.address.addressLine1}
                {order.delivery.address.addressLine2 && `, ${order.delivery.address.addressLine2}`}
              </Text>
              <Text style={styles.addressText}>
                {order.delivery.address.city}, {order.delivery.address.state} -{' '}
                {order.delivery.address.pincode}
              </Text>
              <Text style={styles.addressPhone}>{order.delivery.address.phone}</Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {canCancel && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelOrder}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.supportButton}
            onPress={handleContactSupport}
            activeOpacity={0.7}
          >
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'delivered':
      return '#10b981';
    case 'out_for_delivery':
    case 'dispatched':
      return '#3b82f6';
    case 'preparing':
    case 'ready':
      return '#f59e0b';
    case 'cancelled':
      return '#ef4444';
    default:
      return '#6b7280';
  }
}

function getStatusLabel(status: string): string {
  const labels: { [key: string]: string } = {
    placed: 'ORDER PLACED',
    confirmed: 'CONFIRMED',
    preparing: 'PREPARING',
    ready: 'READY FOR DISPATCH',
    dispatched: 'DISPATCHED',
    out_for_delivery: 'OUT FOR DELIVERY',
    delivered: 'DELIVERED',
    cancelled: 'CANCELLED',
  };
  return labels[status] || status.toUpperCase();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  headerCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: '#6b7280',
  },
  liveIndicatorContainer: {
    alignItems: 'flex-end',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10b981',
  },
  offlineText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9ca3af',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    padding: 16,
    paddingBottom: 12,
  },
  itemsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemsCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  itemsTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 12,
  },
  moreItems: {
    fontSize: 13,
    color: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addressCard: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  addressName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  addressPhone: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ef4444',
  },
  supportButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  supportButtonText: {
    fontSize: 15,
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
});
