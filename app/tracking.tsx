// Order Tracking Screen
// Track active orders and deliveries

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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { PROFILE_COLORS } from '@/types/profile.types';

interface OrderStatus {
  step: number;
  title: string;
  description: string;
  timestamp?: string;
  isCompleted: boolean;
  isActive: boolean;
}

interface TrackingOrder {
  id: string;
  orderNumber: string;
  merchantName: string;
  merchantLogo?: string;
  totalAmount: number;
  status: 'PREPARING' | 'ON_THE_WAY' | 'DELIVERED' | 'CANCELLED';
  statusColor: string;
  estimatedDelivery: string;
  trackingSteps: OrderStatus[];
  items: string[];
  deliveryAddress: string;
}

export default function OrderTrackingScreen() {
  const router = useRouter();
  const [activeOrders, setActiveOrders] = useState<TrackingOrder[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadActiveOrders();
  }, []);

  const loadActiveOrders = async () => {
    // Mock data - in real app, this would fetch from API
    const mockOrders: TrackingOrder[] = [
      {
        id: '1',
        orderNumber: 'WAS123456',
        merchantName: 'Tasty Bites Restaurant',
        totalAmount: 1250,
        status: 'ON_THE_WAY',
        statusColor: PROFILE_COLORS.warning,
        estimatedDelivery: '25 minutes',
        trackingSteps: [
          {
            step: 1,
            title: 'Order Confirmed',
            description: 'Your order has been confirmed',
            timestamp: '2:30 PM',
            isCompleted: true,
            isActive: false,
          },
          {
            step: 2,
            title: 'Preparing',
            description: 'Restaurant is preparing your order',
            timestamp: '2:35 PM',
            isCompleted: true,
            isActive: false,
          },
          {
            step: 3,
            title: 'On the way',
            description: 'Delivery partner picked up your order',
            timestamp: '3:10 PM',
            isCompleted: false,
            isActive: true,
          },
          {
            step: 4,
            title: 'Delivered',
            description: 'Order delivered to your location',
            isCompleted: false,
            isActive: false,
          },
        ],
        items: ['Pizza Margherita', 'Garlic Bread', 'Coke'],
        deliveryAddress: '123 Main Street, Apartment 4B',
      },
      {
        id: '2',
        orderNumber: 'WAS789012',
        merchantName: 'Fashion Store',
        totalAmount: 2100,
        status: 'PREPARING',
        statusColor: PROFILE_COLORS.info,
        estimatedDelivery: '2-3 business days',
        trackingSteps: [
          {
            step: 1,
            title: 'Order Placed',
            description: 'Your order has been placed successfully',
            timestamp: 'Today, 11:30 AM',
            isCompleted: true,
            isActive: false,
          },
          {
            step: 2,
            title: 'Order Processing',
            description: 'Merchant is preparing your items',
            isCompleted: false,
            isActive: true,
          },
          {
            step: 3,
            title: 'Shipped',
            description: 'Order has been shipped',
            isCompleted: false,
            isActive: false,
          },
          {
            step: 4,
            title: 'Out for Delivery',
            description: 'Order is out for delivery',
            isCompleted: false,
            isActive: false,
          },
          {
            step: 5,
            title: 'Delivered',
            description: 'Order delivered successfully',
            isCompleted: false,
            isActive: false,
          },
        ],
        items: ['Cotton T-Shirt', 'Denim Jeans'],
        deliveryAddress: '123 Main Street, Apartment 4B',
      },
    ];

    setActiveOrders(mockOrders);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadActiveOrders();
    setIsRefreshing(false);
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleOrderPress = (order: TrackingOrder) => {
    console.log('Order pressed:', order.orderNumber);
    // Could navigate to detailed tracking view
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

  const renderTrackingStep = (step: OrderStatus, isLast: boolean) => (
    <View key={step.step} style={styles.trackingStep}>
      <View style={styles.stepIndicator}>
        <View style={[
          styles.stepCircle,
          step.isCompleted && styles.stepCompleted,
          step.isActive && styles.stepActive,
        ]}>
          {step.isCompleted ? (
            <Ionicons name="checkmark" size={12} color="white" />
          ) : (
            <View style={[
              styles.stepDot,
              step.isActive && styles.stepActiveDot,
            ]} />
          )}
        </View>
        {!isLast && (
          <View style={[
            styles.stepLine,
            step.isCompleted && styles.stepLineCompleted,
          ]} />
        )}
      </View>
      
      <View style={styles.stepContent}>
        <ThemedText style={[
          styles.stepTitle,
          step.isActive && styles.stepActiveTitle,
          step.isCompleted && styles.stepCompletedTitle,
        ]}>
          {step.title}
        </ThemedText>
        <ThemedText style={styles.stepDescription}>
          {step.description}
        </ThemedText>
        {step.timestamp && (
          <ThemedText style={styles.stepTimestamp}>
            {step.timestamp}
          </ThemedText>
        )}
      </View>
    </View>
  );

  const renderOrderCard = (order: TrackingOrder) => (
    <TouchableOpacity
      key={order.id}
      style={styles.orderCard}
      onPress={() => handleOrderPress(order)}
      activeOpacity={0.8}
    >
      {/* Order Header */}
      <View style={styles.orderHeader}>
        <View style={styles.orderHeaderLeft}>
          <View style={styles.merchantInfo}>
            <ThemedText style={styles.orderNumber}>#{order.orderNumber}</ThemedText>
            <ThemedText style={styles.merchantName}>{order.merchantName}</ThemedText>
          </View>
        </View>
        
        <View style={styles.orderHeaderRight}>
          <View style={[styles.statusBadge, { backgroundColor: order.statusColor + '20' }]}>
            <Ionicons 
              name={getStatusIcon(order.status) as any} 
              size={16} 
              color={order.statusColor} 
            />
            <ThemedText style={[styles.statusText, { color: order.statusColor }]}>
              {order.status.replace('_', ' ')}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Order Items */}
      <View style={styles.orderItems}>
        <ThemedText style={styles.itemsTitle}>Items:</ThemedText>
        <ThemedText style={styles.itemsList}>
          {order.items.join(', ')}
        </ThemedText>
      </View>

      {/* Estimated Delivery */}
      <View style={styles.deliveryInfo}>
        <Ionicons name="time-outline" size={16} color={PROFILE_COLORS.textSecondary} />
        <ThemedText style={styles.deliveryText}>
          Estimated delivery: {order.estimatedDelivery}
        </ThemedText>
      </View>

      {/* Tracking Steps */}
      <View style={styles.trackingContainer}>
        <ThemedText style={styles.trackingTitle}>Tracking Status</ThemedText>
        <View style={styles.trackingSteps}>
          {order.trackingSteps.map((step, index) => 
            renderTrackingStep(step, index === order.trackingSteps.length - 1)
          )}
        </View>
      </View>

      {/* Order Total */}
      <View style={styles.orderFooter}>
        <ThemedText style={styles.totalLabel}>Total Amount:</ThemedText>
        <ThemedText style={styles.totalAmount}>₹{order.totalAmount}</ThemedText>
      </View>
    </TouchableOpacity>
  );

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
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <ThemedText style={styles.headerTitle}>Order Tracking</ThemedText>
          
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Ionicons name="refresh" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={PROFILE_COLORS.primary}
            colors={[PROFILE_COLORS.primary]}
          />
        }
      >
        {activeOrders.length > 0 ? (
          <>
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                Active Orders ({activeOrders.length})
              </ThemedText>
              <ThemedText style={styles.sectionSubtitle}>
                Track your ongoing orders and deliveries
              </ThemedText>
            </View>

            {activeOrders.map(renderOrderCard)}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color={PROFILE_COLORS.textSecondary} />
            <ThemedText style={styles.emptyTitle}>No Active Orders</ThemedText>
            <ThemedText style={styles.emptyDescription}>
              You don't have any orders to track right now.{'\n'}
              Start shopping to see your orders here!
            </ThemedText>
          </View>
        )}

        {/* Footer Space */}
        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PROFILE_COLORS.background,
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
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: PROFILE_COLORS.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: PROFILE_COLORS.textSecondary,
  },
  
  // Order Cards
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    shadowColor: PROFILE_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  merchantInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: PROFILE_COLORS.text,
    marginBottom: 4,
  },
  merchantName: {
    fontSize: 14,
    color: PROFILE_COLORS.textSecondary,
  },
  orderHeaderRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  
  // Order Items
  orderItems: {
    marginBottom: 12,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: PROFILE_COLORS.text,
    marginBottom: 4,
  },
  itemsList: {
    fontSize: 13,
    color: PROFILE_COLORS.textSecondary,
    lineHeight: 18,
  },
  
  // Delivery Info
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: PROFILE_COLORS.surface,
    borderRadius: 8,
  },
  deliveryText: {
    fontSize: 13,
    color: PROFILE_COLORS.textSecondary,
    marginLeft: 8,
    fontWeight: '500',
  },
  
  // Tracking Steps
  trackingContainer: {
    marginBottom: 16,
  },
  trackingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: PROFILE_COLORS.text,
    marginBottom: 12,
  },
  trackingSteps: {
    paddingLeft: 8,
  },
  trackingStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: PROFILE_COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCompleted: {
    backgroundColor: PROFILE_COLORS.success,
  },
  stepActive: {
    backgroundColor: PROFILE_COLORS.primary,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PROFILE_COLORS.textSecondary,
  },
  stepActiveDot: {
    backgroundColor: 'white',
  },
  stepLine: {
    width: 2,
    height: 30,
    backgroundColor: PROFILE_COLORS.border,
  },
  stepLineCompleted: {
    backgroundColor: PROFILE_COLORS.success,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 20,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: PROFILE_COLORS.text,
    marginBottom: 2,
  },
  stepActiveTitle: {
    color: PROFILE_COLORS.primary,
  },
  stepCompletedTitle: {
    color: PROFILE_COLORS.success,
  },
  stepDescription: {
    fontSize: 12,
    color: PROFILE_COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: 4,
  },
  stepTimestamp: {
    fontSize: 11,
    color: PROFILE_COLORS.textSecondary,
    fontWeight: '500',
  },
  
  // Order Footer
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: PROFILE_COLORS.border,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: PROFILE_COLORS.text,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: PROFILE_COLORS.primary,
  },
  
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: PROFILE_COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: PROFILE_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  footer: {
    height: 40,
  },
});