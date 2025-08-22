// Detailed Order Tracking Page
// Shows comprehensive tracking information for a specific order

import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { PROFILE_COLORS } from '@/types/profile.types';

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
  const [order, setOrder] = useState<DetailedOrder | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrderDetails(orderId as string);
    
    // Set up real-time updates (simulate with interval)
    const interval = setInterval(() => {
      // In real app, this would listen to WebSocket or polling
      updateOrderStatus();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [orderId]);

  const loadOrderDetails = async (orderNumber: string) => {
    try {
      setIsLoading(true);
      
      // Mock detailed order data
      const mockOrder: DetailedOrder = {
        id: orderNumber,
        orderNumber: 'WAS123456',
        merchantName: 'TechHub Electronics',
        merchantPhone: '+1 (555) 123-4567',
        merchantAddress: '123 Tech Street, Digital City',
        status: 'ON_THE_WAY',
        statusColor: PROFILE_COLORS.warning,
        estimatedDelivery: '15-20 minutes',
        items: [
          {
            id: 'i1',
            name: 'Premium Wireless Headphones',
            quantity: 1,
            price: 2999,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
          },
          {
            id: 'i2',
            name: 'USB-C Cable',
            quantity: 2,
            price: 299,
            image: 'https://images.unsplash.com/photo-1558618047-0c90205020c5?w=300',
          },
        ],
        subtotal: 3597,
        deliveryFee: 99,
        taxes: 304,
        total: 4000,
        deliveryAddress: '123 Main Street, Apartment 4B, Digital City, 12345',
        deliveryInstructions: 'Ring the doorbell twice. Leave at door if no answer.',
        deliveryPartner: {
          name: 'Rajesh Kumar',
          phone: '+1 (555) 987-6543',
          rating: 4.8,
          vehicleNumber: 'DL01AB1234',
          photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        },
        trackingUpdates: [
          {
            id: 't1',
            status: 'Order Placed',
            description: 'Your order has been successfully placed and confirmed',
            timestamp: 'Today, 2:30 PM',
            location: 'TechHub Electronics',
            isCompleted: true,
            isActive: false,
          },
          {
            id: 't2',
            status: 'Order Confirmed',
            description: 'Merchant has confirmed your order and started processing',
            timestamp: 'Today, 2:32 PM',
            location: 'TechHub Electronics',
            isCompleted: true,
            isActive: false,
          },
          {
            id: 't3',
            status: 'Preparing Order',
            description: 'Your items are being prepared and packed',
            timestamp: 'Today, 2:35 PM',
            location: 'TechHub Electronics',
            isCompleted: true,
            isActive: false,
          },
          {
            id: 't4',
            status: 'Out for Pickup',
            description: 'Delivery partner is on the way to pickup your order',
            timestamp: 'Today, 3:05 PM',
            location: 'En route to TechHub Electronics',
            isCompleted: true,
            isActive: false,
          },
          {
            id: 't5',
            status: 'Order Picked Up',
            description: 'Delivery partner has picked up your order',
            timestamp: 'Today, 3:15 PM',
            location: 'TechHub Electronics',
            isCompleted: true,
            isActive: false,
          },
          {
            id: 't6',
            status: 'On the Way',
            description: 'Your order is on the way to your delivery address',
            timestamp: 'Today, 3:18 PM',
            location: '2.5 km from your location',
            isCompleted: false,
            isActive: true,
          },
          {
            id: 't7',
            status: 'Delivered',
            description: 'Order will be delivered to your address',
            timestamp: '',
            isCompleted: false,
            isActive: false,
          },
        ],
        paymentMethod: 'Credit Card ending in 4242',
        orderDate: 'Today, 2:30 PM',
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setOrder(mockOrder);
    } catch (error) {
      console.error('Error loading order details:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async () => {
    // Simulate real-time updates
    if (order && order.status === 'ON_THE_WAY') {
      // Could update estimated delivery time, location, etc.
      console.log('Checking for order updates...');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadOrderDetails(orderId as string);
    setIsRefreshing(false);
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleCallMerchant = () => {
    if (order?.merchantPhone) {
      Linking.openURL(`tel:${order.merchantPhone}`);
    }
  };

  const handleCallDeliveryPartner = () => {
    if (order?.deliveryPartner?.phone) {
      Linking.openURL(`tel:${order.deliveryPartner.phone}`);
    }
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            // Handle order cancellation
            Alert.alert('Order Cancelled', 'Your order has been cancelled successfully.');
          }
        }
      ]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PREPARING': return 'restaurant';
      case 'ON_THE_WAY': return 'car';
      case 'DELIVERED': return 'checkmark-circle';
      case 'CANCELLED': return 'close-circle';
      default: return 'time';
    }
  };

  const renderTrackingUpdate = (update: TrackingUpdate, index: number) => (
    <View key={update.id} style={styles.trackingUpdate}>
      <View style={styles.updateIndicator}>
        <View style={[
          styles.updateCircle,
          update.isCompleted && styles.updateCompleted,
          update.isActive && styles.updateActive,
        ]}>
          {update.isCompleted ? (
            <Ionicons name="checkmark" size={12} color="white" />
          ) : (
            <View style={[
              styles.updateDot,
              update.isActive && styles.updateActiveDot,
            ]} />
          )}
        </View>
        {index < (order?.trackingUpdates.length ?? 0) - 1 && (
          <View style={[
            styles.updateLine,
            update.isCompleted && styles.updateLineCompleted,
          ]} />
        )}
      </View>
      
      <View style={styles.updateContent}>
        <ThemedText style={[
          styles.updateStatus,
          update.isActive && styles.updateActiveStatus,
          update.isCompleted && styles.updateCompletedStatus,
        ]}>
          {update.status}
        </ThemedText>
        <ThemedText style={styles.updateDescription}>
          {update.description}
        </ThemedText>
        {update.location && (
          <ThemedText style={styles.updateLocation}>
            📍 {update.location}
          </ThemedText>
        )}
        {update.timestamp && (
          <ThemedText style={styles.updateTimestamp}>
            {update.timestamp}
          </ThemedText>
        )}
      </View>
    </View>
  );

  const renderOrderItem = (item: OrderItem) => (
    <View key={item.id} style={styles.orderItem}>
      <View style={styles.itemInfo}>
        <ThemedText style={styles.itemName}>{item.name}</ThemedText>
        <ThemedText style={styles.itemDetails}>
          Qty: {item.quantity} × ₹{item.price.toLocaleString()}
        </ThemedText>
      </View>
      <ThemedText style={styles.itemTotal}>
        ₹{(item.quantity * item.price).toLocaleString()}
      </ThemedText>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading order details...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#666" />
          <ThemedText style={styles.errorTitle}>Order Not Found</ThemedText>
          <ThemedText style={styles.errorText}>
            The order you're looking for could not be found.
          </ThemedText>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
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
          <TouchableOpacity style={styles.headerButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <ThemedText style={styles.headerTitle}>Order #{order.orderNumber}</ThemedText>
            <ThemedText style={styles.headerSubtitle}>{order.merchantName}</ThemedText>
          </View>
          
          <TouchableOpacity style={styles.headerButton} onPress={handleRefresh}>
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
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusBadge, { backgroundColor: order.statusColor + '20' }]}>
              <Ionicons 
                name={getStatusIcon(order.status) as any} 
                size={20} 
                color={order.statusColor} 
              />
              <ThemedText style={[styles.statusText, { color: order.statusColor }]}>
                {order.status.replace('_', ' ')}
              </ThemedText>
            </View>
          </View>
          
          <ThemedText style={styles.estimatedDelivery}>
            Estimated delivery: {order.estimatedDelivery}
          </ThemedText>
          
          {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelOrder}>
              <ThemedText style={styles.cancelButtonText}>Cancel Order</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Delivery Partner Card */}
        {order.deliveryPartner && order.status === 'ON_THE_WAY' && (
          <View style={styles.deliveryPartnerCard}>
            <ThemedText style={styles.cardTitle}>Delivery Partner</ThemedText>
            
            <View style={styles.partnerInfo}>
              <View style={styles.partnerDetails}>
                <ThemedText style={styles.partnerName}>{order.deliveryPartner.name}</ThemedText>
                <View style={styles.partnerRating}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <ThemedText style={styles.ratingText}>{order.deliveryPartner.rating}</ThemedText>
                </View>
                <ThemedText style={styles.vehicleNumber}>
                  Vehicle: {order.deliveryPartner.vehicleNumber}
                </ThemedText>
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
            {order.trackingUpdates.map((update, index) => 
              renderTrackingUpdate(update, index)
            )}
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.itemsCard}>
          <ThemedText style={styles.cardTitle}>Order Items</ThemedText>
          
          <View style={styles.itemsList}>
            {order.items.map(renderOrderItem)}
          </View>
          
          {/* Order Summary */}
          <View style={styles.orderSummary}>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Subtotal</ThemedText>
              <ThemedText style={styles.summaryValue}>₹{order.subtotal.toLocaleString()}</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Delivery Fee</ThemedText>
              <ThemedText style={styles.summaryValue}>₹{order.deliveryFee.toLocaleString()}</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Taxes</ThemedText>
              <ThemedText style={styles.summaryValue}>₹{order.taxes.toLocaleString()}</ThemedText>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <ThemedText style={styles.totalLabel}>Total</ThemedText>
              <ThemedText style={styles.totalValue}>₹{order.total.toLocaleString()}</ThemedText>
            </View>
          </View>
        </View>

        {/* Order Details */}
        <View style={styles.detailsCard}>
          <ThemedText style={styles.cardTitle}>Order Details</ThemedText>
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Order Date</ThemedText>
            <ThemedText style={styles.detailValue}>{order.orderDate}</ThemedText>
          </View>
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Payment Method</ThemedText>
            <ThemedText style={styles.detailValue}>{order.paymentMethod}</ThemedText>
          </View>
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Delivery Address</ThemedText>
            <ThemedText style={styles.detailValue}>{order.deliveryAddress}</ThemedText>
          </View>
          
          {order.deliveryInstructions && (
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Instructions</ThemedText>
              <ThemedText style={styles.detailValue}>{order.deliveryInstructions}</ThemedText>
            </View>
          )}
          
          <TouchableOpacity style={styles.contactMerchant} onPress={handleCallMerchant}>
            <Ionicons name="call-outline" size={20} color={PROFILE_COLORS.primary} />
            <ThemedText style={styles.contactMerchantText}>Contact Merchant</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
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
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
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
  cancelButton: {
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
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