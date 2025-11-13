// Detailed Order Tracking Page
// Shows comprehensive tracking information for a specific order

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  SafeAreaView,
  RefreshControl,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { PROFILE_COLORS } from '@/types/profile.types';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import { Order } from '@/services/ordersApi';
import ordersService from '@/services/ordersApi';
import ContactStoreModal from '@/components/store/ContactStoreModal';

interface DeliveryPartner {
  name: string;
  phone: string;
  rating: number;
  vehicleNumber: string;
  photo?: string;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface TrackingUpdate {
  id: string;
  status: string;
  description: string;
  timestamp: string;
  location?: string;
  isActive: boolean;
  isCompleted: boolean;
}

interface DetailedOrder {
  id: string;
  orderNumber: string;
  merchantName: string;
  merchantPhone: string;
  merchantAddress: string;
  status: 'PREPARING' | 'ON_THE_WAY' | 'DELIVERED' | 'CANCELLED';
  statusColor: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  total: number;
  deliveryAddress: string;
  deliveryInstructions?: string;
  deliveryPartner?: DeliveryPartner;
  trackingUpdates: TrackingUpdate[];
  paymentMethod: string;
  orderDate: string;
}

export default function DetailedOrderTrackingPage() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();

  // Use real-time order tracking hook
  const {
    order: realOrder,
    loading: isLoading,
    error,
    statusUpdate,
    locationUpdate,
    deliveryPartner: liveDeliveryPartner,
    timeline,
    isLive,
    refresh,
    isConnected,
  } = useOrderTracking(orderId as string, undefined, true);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  // Map backend order data to UI format
  const order = useMemo(() => {
    if (!realOrder) return null;

    // Get merchant/store info from first item
    const firstItem = realOrder.items?.[0];
    const storeName = firstItem?.product?.store?.name || 'Store';

    // Determine status and color
    const statusMap: Record<string, { display: string; color: string; icon: string }> = {
      placed: { display: 'Order Placed', color: PROFILE_COLORS.primary, icon: 'receipt' },
      confirmed: { display: 'Confirmed', color: PROFILE_COLORS.success, icon: 'checkmark-circle' },
      preparing: { display: 'Preparing', color: PROFILE_COLORS.warning, icon: 'restaurant' },
      ready: { display: 'Ready for Pickup', color: PROFILE_COLORS.primary, icon: 'cube' },
      dispatched: { display: 'Dispatched', color: PROFILE_COLORS.primary, icon: 'send' },
      out_for_delivery: { display: 'Out for Delivery', color: PROFILE_COLORS.warning, icon: 'car' },
      delivered: { display: 'Delivered', color: PROFILE_COLORS.success, icon: 'checkmark-circle' },
      cancelled: { display: 'Cancelled', color: PROFILE_COLORS.error, icon: 'close-circle' },
      pending: { display: 'Pending', color: PROFILE_COLORS.textSecondary, icon: 'time' },
      processing: { display: 'Processing', color: PROFILE_COLORS.warning, icon: 'sync' },
      shipped: { display: 'Shipped', color: PROFILE_COLORS.primary, icon: 'airplane' },
    };

    const statusInfo = statusMap[realOrder.status] || statusMap.pending;

    // Format delivery partner info
    const deliveryPartnerData = liveDeliveryPartner || (locationUpdate?.deliveryPartner ? {
      name: locationUpdate.deliveryPartner.name,
      phone: locationUpdate.deliveryPartner.phone,
      rating: 0,
      vehicleNumber: locationUpdate.deliveryPartner.vehicle || 'N/A',
    } : null);

    return {
      ...realOrder,
      merchantName: storeName,
      statusDisplay: statusInfo.display,
      statusColor: statusInfo.color,
      statusIcon: statusInfo.icon,
      deliveryPartnerData,
      locationData: locationUpdate,
    };
  }, [realOrder, liveDeliveryPartner, locationUpdate]);

  // Handle navigation
  const handleBackPress = () => {
    router.back();
  };

  // Handle calling store/merchant - Now opens Contact Store Modal
  const handleCallMerchant = () => {
    setShowContactModal(true);
  };

  // Handle calling delivery partner
  const handleCallDeliveryPartner = () => {
    if (order?.deliveryPartnerData?.phone) {
      Linking.openURL(`tel:${order.deliveryPartnerData.phone}`);
    } else {
      Alert.alert('Not Available', 'Delivery partner contact not available yet.');
    }
  };

  // Handle order cancellation with backend API
  const handleCancelOrder = () => {
    if (!order) return;

    // Check if order can be cancelled
    const cancellableStatuses = ['placed', 'confirmed', 'pending', 'processing'];
    if (!cancellableStatuses.includes(order.status)) {
      Alert.alert(
        'Cannot Cancel',
        'This order cannot be cancelled at this stage. Please contact support if you need assistance.'
      );
      return;
    }

    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsCancelling(true);
              const response = await ordersService.cancelOrder(order._id || order.id, 'Customer requested cancellation');

              if (response.success) {
                Alert.alert('Order Cancelled', 'Your order has been cancelled successfully.');
                refresh(); // Refresh order data
              } else {
                Alert.alert('Error', response.error || 'Failed to cancel order');
              }
            } catch (error) {
              console.error('Error cancelling order:', error);
              Alert.alert('Error', 'Failed to cancel order. Please try again.');
            } finally {
              setIsCancelling(false);
            }
          }
        }
      ]
    );
  };

  // Get status icon based on status
  const getStatusIcon = (status: string) => {
    const statusMap: Record<string, string> = {
      placed: 'receipt',
      confirmed: 'checkmark-circle',
      preparing: 'restaurant',
      ready: 'cube',
      dispatched: 'send',
      out_for_delivery: 'car',
      delivered: 'checkmark-circle',
      cancelled: 'close-circle',
      pending: 'time',
      processing: 'sync',
      shipped: 'airplane',
    };
    return statusMap[status] || 'time';
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: string | Date) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return diffMins === 0 ? 'Just now' : `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Render timeline update from real backend data
  const renderTimelineUpdate = (update: any, index: number, totalItems: number) => {
    const isLast = index === totalItems - 1;
    const isActive = index === totalItems - 1 && order?.status !== 'delivered' && order?.status !== 'cancelled';
    const isCompleted = !isActive || order?.status === 'delivered';

    return (
      <View
        key={update._id || index}
        style={styles.trackingUpdate}
        accessibilityLabel={`${update.status || 'Update'}. ${update.message || 'Order status updated'}. ${update.timestamp ? formatTimestamp(update.timestamp) : ''}`}
        accessibilityRole="text"
      >
        <View style={styles.updateIndicator}>
          <View style={[
            styles.updateCircle,
            isCompleted && styles.updateCompleted,
            isActive && styles.updateActive,
          ]}>
            {isCompleted ? (
              <Ionicons name="checkmark" size={12} color="white" />
            ) : (
              <View style={[
                styles.updateDot,
                isActive && styles.updateActiveDot,
              ]} />
            )}
          </View>
          {!isLast && (
            <View style={[
              styles.updateLine,
              isCompleted && styles.updateLineCompleted,
            ]} />
          )}
        </View>

        <View style={styles.updateContent}>
          <ThemedText style={[
            styles.updateStatus,
            isActive && styles.updateActiveStatus,
            isCompleted && styles.updateCompletedStatus,
          ]}>
            {update.status || 'Update'}
          </ThemedText>
          <ThemedText style={styles.updateDescription}>
            {update.message || 'Order status updated'}
          </ThemedText>
          {update.timestamp && (
            <ThemedText style={styles.updateTimestamp}>
              {formatTimestamp(update.timestamp)}
            </ThemedText>
          )}
        </View>
      </View>
    );
  };

  // Render order item from real backend data
  const renderOrderItem = (item: any, index: number) => (
    <View key={item.id || index} style={styles.orderItem}>
      <View style={styles.itemInfo}>
        <ThemedText style={styles.itemName}>
          {item.product?.name || item.productName || 'Product'}
        </ThemedText>
        <ThemedText style={styles.itemDetails}>
          Qty: {item.quantity} × ₹{item.unitPrice?.toLocaleString() || item.price?.toLocaleString() || '0'}
        </ThemedText>
      </View>
      <ThemedText style={styles.itemTotal}>
        ₹{(item.totalPrice || item.subtotal || 0).toLocaleString()}
      </ThemedText>
    </View>
  );

  // Show loading state
  if (isLoading && !order) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={PROFILE_COLORS.primary}
          translucent={false}
        />
        <LinearGradient
          colors={[PROFILE_COLORS.primary, PROFILE_COLORS.primaryLight]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.headerButton} onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <ThemedText style={styles.headerTitle}>Order Tracking</ThemedText>
            </View>
            <View style={styles.headerButton} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PROFILE_COLORS.primary} />
          <ThemedText style={styles.loadingText}>Loading order details...</ThemedText>
          {isConnected && (
            <ThemedText style={styles.liveIndicator}>
              Live tracking enabled
            </ThemedText>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={PROFILE_COLORS.primary}
          translucent={false}
        />
        <LinearGradient
          colors={[PROFILE_COLORS.primary, PROFILE_COLORS.primaryLight]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.headerButton} onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <ThemedText style={styles.headerTitle}>Order Tracking</ThemedText>
            </View>
            <View style={styles.headerButton} />
          </View>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#666" />
          <ThemedText style={styles.errorTitle}>
            {error ? 'Error Loading Order' : 'Order Not Found'}
          </ThemedText>
          <ThemedText style={styles.errorText}>
            {error || 'The order you are looking for could not be found.'}
          </ThemedText>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: PROFILE_COLORS.primary, marginTop: 12 }]}
            onPress={refresh}
          >
            <ThemedText style={styles.backButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={PROFILE_COLORS.primary}
        translucent={false}
      />
      
      {/* Header */}
      <LinearGradient
        colors={[PROFILE_COLORS.primary, PROFILE_COLORS.primaryLight]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleBackPress}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            accessibilityHint="Navigate to previous screen"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <ThemedText style={styles.headerTitle}>Order #{order.orderNumber}</ThemedText>
            <ThemedText style={styles.headerSubtitle}>{order.merchantName}</ThemedText>
            {isLive && (
              <View style={styles.liveBadge}>
                <View style={styles.liveIndicatorDot} />
                <ThemedText style={styles.liveText}>Live</ThemedText>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleRefresh}
            accessibilityLabel="Refresh order status"
            accessibilityRole="button"
            accessibilityHint="Double tap to refresh order information"
          >
            <Ionicons name="refresh" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={PROFILE_COLORS.primary}
            colors={[PROFILE_COLORS.primary]}
          />
        }
      >
        {/* Status Card */}
        <View
          style={styles.statusCard}
          accessibilityLabel={`Order status: ${order.statusDisplay}`}
          accessibilityRole="text"
        >
          <View style={styles.statusHeader}>
            <View style={[styles.statusBadge, { backgroundColor: order.statusColor + '20' }]}>
              <Ionicons
                name={order.statusIcon as any}
                size={20}
                color={order.statusColor}
              />
              <ThemedText style={[styles.statusText, { color: order.statusColor }]}>
                {order.statusDisplay}
              </ThemedText>
            </View>
          </View>

          {/* Real-time status update message */}
          {statusUpdate && (
            <View style={styles.statusUpdateBanner}>
              <Ionicons name="information-circle" size={16} color={PROFILE_COLORS.primary} />
              <ThemedText style={styles.statusUpdateText}>{statusUpdate.message}</ThemedText>
            </View>
          )}

          {/* Estimated delivery time */}
          {order.tracking?.estimatedDelivery && order.status !== 'delivered' && order.status !== 'cancelled' && (
            <ThemedText style={styles.estimatedDelivery}>
              Estimated delivery: {formatTimestamp(order.tracking.estimatedDelivery)}
            </ThemedText>
          )}

          {/* Location update if available */}
          {locationUpdate && order.status === 'out_for_delivery' && (
            <View style={styles.locationUpdateCard}>
              <Ionicons name="location" size={16} color={PROFILE_COLORS.primary} />
              <ThemedText style={styles.locationUpdateText}>
                {locationUpdate.location.address || `${locationUpdate.distanceToDestination || '0'} km away`}
              </ThemedText>
            </View>
          )}

          {/* Cancel order button */}
          {order.status !== 'delivered' && order.status !== 'cancelled' && order.status !== 'shipped' && (
            <TouchableOpacity
              style={[styles.cancelButton, isCancelling && styles.cancelButtonDisabled]}
              onPress={handleCancelOrder}
              disabled={isCancelling}
              accessibilityLabel={`Cancel order ${order.orderNumber}`}
              accessibilityRole="button"
              accessibilityHint="Double tap to cancel this order"
              accessibilityState={{ disabled: isCancelling }}
            >
              {isCancelling ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <ThemedText style={styles.cancelButtonText}>Cancel Order</ThemedText>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Delivery Partner Card */}
        {order.deliveryPartnerData && (order.status === 'out_for_delivery' || order.status === 'dispatched') && (
          <View style={styles.deliveryPartnerCard}>
            <ThemedText style={styles.cardTitle}>Delivery Partner</ThemedText>

            <View style={styles.partnerInfo}>
              <View style={styles.partnerDetails}>
                <ThemedText style={styles.partnerName}>{order.deliveryPartnerData.name}</ThemedText>
                {order.deliveryPartnerData.rating > 0 && (
                  <View style={styles.partnerRating}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <ThemedText style={styles.ratingText}>{order.deliveryPartnerData.rating.toFixed(1)}</ThemedText>
                  </View>
                )}
                {order.deliveryPartnerData.vehicleNumber && (
                  <ThemedText style={styles.vehicleNumber}>
                    Vehicle: {order.deliveryPartnerData.vehicleNumber}
                  </ThemedText>
                )}
              </View>

              <TouchableOpacity
                style={styles.callButton}
                onPress={handleCallDeliveryPartner}
              >
                <Ionicons name="call" size={20} color="white" />
                <ThemedText style={styles.callButtonText}>Call</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tracking Timeline */}
        <View style={styles.trackingCard}>
          <ThemedText style={styles.cardTitle}>Order Timeline</ThemedText>

          <View style={styles.trackingTimeline}>
            {(timeline && timeline.length > 0) ? (
              timeline.map((update, index) =>
                renderTimelineUpdate(update, index, timeline.length)
              )
            ) : (
              <View style={styles.noTimelineContainer}>
                <Ionicons name="time-outline" size={32} color="#999" />
                <ThemedText style={styles.noTimelineText}>No tracking updates yet</ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.itemsCard}>
          <ThemedText style={styles.cardTitle}>Order Items</ThemedText>

          <View style={styles.itemsList}>
            {order.items && order.items.length > 0 ? (
              order.items.map((item: any, index: number) => renderOrderItem(item, index))
            ) : (
              <ThemedText style={styles.noItemsText}>No items found</ThemedText>
            )}
          </View>

          {/* Order Summary */}
          <View style={styles.orderSummary}>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Subtotal</ThemedText>
              <ThemedText style={styles.summaryValue}>
                ₹{(order.totals?.subtotal || order.summary?.subtotal || 0).toLocaleString()}
              </ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Delivery Fee</ThemedText>
              <ThemedText style={styles.summaryValue}>
                ₹{(order.totals?.delivery || order.delivery?.deliveryFee || 0).toLocaleString()}
              </ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Taxes</ThemedText>
              <ThemedText style={styles.summaryValue}>
                ₹{(order.totals?.tax || order.summary?.tax || 0).toLocaleString()}
              </ThemedText>
            </View>
            {order.totals?.discount > 0 && (
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>Discount</ThemedText>
                <ThemedText style={[styles.summaryValue, { color: PROFILE_COLORS.success }]}>
                  -₹{order.totals.discount.toLocaleString()}
                </ThemedText>
              </View>
            )}
            {order.payment?.coinsUsed && (order.payment.coinsUsed.wasilCoins > 0 || order.payment.coinsUsed.promoCoins > 0 || order.payment.coinsUsed.storePromoCoins > 0) && (
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>
                  💎 Coins Used
                  {order.payment.coinsUsed.storePromoCoins > 0 && ' (includes Store Promo)'}
                </ThemedText>
                <ThemedText style={[styles.summaryValue, { color: '#8B5CF6' }]}>
                  -₹{order.payment.coinsUsed.totalCoinsValue || 0}
                </ThemedText>
              </View>
            )}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <ThemedText style={styles.totalLabel}>Total</ThemedText>
              <ThemedText style={styles.totalValue}>
                ₹{(order.totals?.total || order.summary?.total || 0).toLocaleString()}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Order Details */}
        <View style={styles.detailsCard}>
          <ThemedText style={styles.cardTitle}>Order Details</ThemedText>

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Order Date</ThemedText>
            <ThemedText style={styles.detailValue}>
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Payment Method</ThemedText>
            <ThemedText style={styles.detailValue}>
              {order.payment?.method?.toUpperCase() || 'N/A'}
            </ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Payment Status</ThemedText>
            <ThemedText style={[
              styles.detailValue,
              { color: order.payment?.status === 'paid' ? PROFILE_COLORS.success : PROFILE_COLORS.warning }
            ]}>
              {order.payment?.status?.toUpperCase() || 'PENDING'}
            </ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Delivery Address</ThemedText>
            <ThemedText style={styles.detailValue}>
              {order.delivery?.address ?
                `${order.delivery.address.addressLine1}, ${order.delivery.address.city}, ${order.delivery.address.state} ${order.delivery.address.pincode}` :
                'Address not available'
              }
            </ThemedText>
          </View>

          {order.specialInstructions && (
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Special Instructions</ThemedText>
              <ThemedText style={styles.detailValue}>{order.specialInstructions}</ThemedText>
            </View>
          )}

          {order.couponCode && (
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Coupon Applied</ThemedText>
              <ThemedText style={[styles.detailValue, { color: PROFILE_COLORS.success }]}>
                {order.couponCode}
              </ThemedText>
            </View>
          )}

          <TouchableOpacity
            style={styles.contactMerchant}
            onPress={handleCallMerchant}
            accessibilityLabel={`Contact ${order?.merchantName || 'store'}`}
            accessibilityRole="button"
            accessibilityHint="Double tap to contact the store"
          >
            <Ionicons name="call-outline" size={20} color={PROFILE_COLORS.primary} />
            <ThemedText style={styles.contactMerchantText}>Contact Store</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Contact Store Modal */}
      <ContactStoreModal
        visible={showContactModal}
        onClose={() => setShowContactModal(false)}
        storeId={order?.items?.[0]?.product?.store?.id || ''}
        storeName={order?.merchantName || 'Store'}
        storePhone={order?.items?.[0]?.product?.store?.phone}
        storeEmail={order?.items?.[0]?.product?.store?.email}
        orderId={order?._id || order?.id}
        orderNumber={order?.orderNumber}
      />
    </SafeAreaView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PROFILE_COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  liveIndicator: {
    fontSize: 12,
    color: PROFILE_COLORS.success,
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 20 : 0,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  liveIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  
  // Cards
  statusCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  statusHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  estimatedDelivery: {
    fontSize: 16,
    fontWeight: '600',
    color: PROFILE_COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  statusUpdateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PROFILE_COLORS.primary + '10',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  statusUpdateText: {
    fontSize: 13,
    color: PROFILE_COLORS.text,
    marginLeft: 8,
    flex: 1,
  },
  locationUpdateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  locationUpdateText: {
    fontSize: 12,
    color: PROFILE_COLORS.text,
    marginLeft: 8,
    flex: 1,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  cancelButtonDisabled: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  
  // Delivery Partner Card
  deliveryPartnerCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: PROFILE_COLORS.text,
    marginBottom: 16,
  },
  partnerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partnerDetails: {
    flex: 1,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: PROFILE_COLORS.text,
    marginBottom: 4,
  },
  partnerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    color: PROFILE_COLORS.text,
    marginLeft: 4,
  },
  vehicleNumber: {
    fontSize: 12,
    color: PROFILE_COLORS.textSecondary,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PROFILE_COLORS.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  callButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
  },
  
  // Tracking Card
  trackingCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  trackingTimeline: {
    paddingLeft: 8,
  },
  trackingUpdate: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  updateIndicator: {
    alignItems: 'center',
    marginRight: 16,
  },
  updateCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: PROFILE_COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateCompleted: {
    backgroundColor: PROFILE_COLORS.success,
  },
  updateActive: {
    backgroundColor: PROFILE_COLORS.primary,
  },
  updateDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PROFILE_COLORS.textSecondary,
  },
  updateActiveDot: {
    backgroundColor: 'white',
  },
  updateLine: {
    width: 2,
    height: 40,
    backgroundColor: PROFILE_COLORS.border,
    marginTop: 8,
  },
  updateLineCompleted: {
    backgroundColor: PROFILE_COLORS.success,
  },
  updateContent: {
    flex: 1,
  },
  updateStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: PROFILE_COLORS.text,
    marginBottom: 4,
  },
  updateActiveStatus: {
    color: PROFILE_COLORS.primary,
  },
  updateCompletedStatus: {
    color: PROFILE_COLORS.success,
  },
  updateDescription: {
    fontSize: 14,
    color: PROFILE_COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  updateLocation: {
    fontSize: 12,
    color: PROFILE_COLORS.primary,
    marginBottom: 4,
  },
  updateTimestamp: {
    fontSize: 12,
    color: PROFILE_COLORS.textSecondary,
    fontWeight: '500',
  },
  noTimelineContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noTimelineText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },

  // Items Card
  itemsCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  itemsList: {
    marginBottom: 16,
  },
  noItemsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: PROFILE_COLORS.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: PROFILE_COLORS.text,
    marginBottom: 2,
  },
  itemDetails: {
    fontSize: 12,
    color: PROFILE_COLORS.textSecondary,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: PROFILE_COLORS.text,
  },
  orderSummary: {
    borderTopWidth: 1,
    borderTopColor: PROFILE_COLORS.border,
    paddingTop: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: PROFILE_COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: PROFILE_COLORS.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: PROFILE_COLORS.border,
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: PROFILE_COLORS.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: PROFILE_COLORS.primary,
  },
  
  // Details Card
  detailsCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: PROFILE_COLORS.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: PROFILE_COLORS.text,
    lineHeight: 18,
  },
  contactMerchant: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: PROFILE_COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 8,
  },
  contactMerchantText: {
    color: PROFILE_COLORS.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  bottomSpace: {
    height: 20,
  },
});