import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  SafeAreaView,
  RefreshControl,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import ordersApi, { Order } from '@/services/ordersApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  deliveryPersonName?: string;
  deliveryPersonPhone?: string;
  progress: number; // 0-100
}

// Helper to map backend order to TrackingOrder
const mapOrderToTracking = (order: Order): TrackingOrder => {
  // Map backend status to tracking status
  const statusMap: Record<string, 'PREPARING' | 'ON_THE_WAY' | 'DELIVERED' | 'CANCELLED'> = {
    'placed': 'PREPARING',
    'pending': 'PREPARING',
    'confirmed': 'PREPARING',
    'preparing': 'PREPARING',
    'processing': 'PREPARING',
    'ready': 'PREPARING',
    'dispatched': 'ON_THE_WAY',
    'shipped': 'ON_THE_WAY',
    'out_for_delivery': 'ON_THE_WAY',
    'delivered': 'DELIVERED',
    'cancelled': 'CANCELLED',
    'refunded': 'CANCELLED',
  };

  const trackingStatus = statusMap[order.status] || 'PREPARING';

  // Map status to color
  const colorMap = {
    'PREPARING': '#F59E0B',
    'ON_THE_WAY': '#3B82F6',
    'DELIVERED': '#10B981',
    'CANCELLED': '#EF4444',
  };

  // Calculate progress
  const progressMap = {
    'PREPARING': 25,
    'ON_THE_WAY': 65,
    'DELIVERED': 100,
    'CANCELLED': 0,
  };

  // Create tracking steps from order timeline
  const steps: OrderStatus[] = order.timeline?.map((event, index) => ({
    step: index + 1,
    title: event.status.charAt(0).toUpperCase() + event.status.slice(1).replace('_', ' '),
    description: event.message,
    timestamp: new Date(event.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    isCompleted: true,
    isActive: index === order.timeline.length - 1,
  })) || [];

  // Get item names
  const items = order.items?.map(item => item.product?.name || 'Product') || [];

  // Format address - use delivery.address from backend
  const addr = order.delivery?.address || order.shippingAddress;
  const deliveryAddress = addr
    ? order.delivery?.address
      ? `${addr.addressLine1}, ${addr.city}, ${addr.state} ${addr.pincode}`
      : `${(addr as any).address1}, ${addr.city}, ${addr.state} ${(addr as any).zipCode}`
    : 'Address not available';

  // Get store info - it might be populated or just an ID
  const firstItem = order.items?.[0];
  const storeName = typeof firstItem?.store === 'object'
    ? (firstItem.store as any).name
    : firstItem?.name || 'Store';
  const storeLogo = typeof firstItem?.store === 'object'
    ? (firstItem.store as any).logo
    : undefined;

  // Calculate total if it's 0 (fallback calculation)
  let totalAmount = order.totals?.total || order.summary?.total || 0;
  if (totalAmount === 0 && order.totals) {
    // Recalculate: subtotal + tax + delivery - discount
    totalAmount = (order.totals.subtotal || 0) +
                  (order.totals.tax || 0) +
                  (order.totals.delivery || 0) -
                  (order.totals.discount || 0);
    console.log('⚠️ [ORDER TRACKING] Total was 0, recalculated:', {
      orderNumber: order.orderNumber,
      subtotal: order.totals.subtotal,
      tax: order.totals.tax,
      delivery: order.totals.delivery,
      discount: order.totals.discount,
      calculatedTotal: totalAmount
    });
  }

  return {
    id: order._id || order.id,
    orderNumber: order.orderNumber,
    merchantName: storeName,
    merchantLogo: storeLogo,
    totalAmount,
    status: trackingStatus,
    statusColor: colorMap[trackingStatus],
    estimatedDelivery: order.tracking?.estimatedDelivery || 'Calculating...',
    trackingSteps: steps,
    items,
    deliveryAddress,
    deliveryPersonName: order.tracking?.carrier,
    deliveryPersonPhone: order.tracking?.number,
    progress: progressMap[trackingStatus],
  };
};

export default function OrderTrackingScreen() {
  const router = useRouter();
  const [activeOrders, setActiveOrders] = useState<TrackingOrder[]>([]);
  const [deliveredOrders, setDeliveredOrders] = useState<TrackingOrder[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'active' | 'delivered'>('active');

  const loadActiveOrders = useCallback(async (isRefresh: boolean = false) => {
    console.log('📦 [ORDER TRACKING] Loading orders from real API...');

    if (!isRefresh) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await ordersApi.getOrders({
        page: 1,
        limit: 50,
      });

      console.log('📦 [ORDER TRACKING] API Response:', {
        success: response.success,
        ordersCount: response.data?.orders?.length || 0,
      });

      if (response.success && response.data?.orders) {
        console.log('📊 [ORDER TRACKING] Raw orders from API:', response.data.orders.length);

        const allOrders = response.data.orders.map(mapOrderToTracking);

        console.log('📊 [ORDER TRACKING] Mapped orders:', allOrders);

        // Separate active and delivered
        const active = allOrders.filter(o =>
          o.status === 'PREPARING' || o.status === 'ON_THE_WAY'
        );

        const delivered = allOrders.filter(o =>
          o.status === 'DELIVERED' || o.status === 'CANCELLED'
        );

        setActiveOrders(active);
        setDeliveredOrders(delivered);

        console.log('✅ [ORDER TRACKING] Orders loaded:', {
          total: allOrders.length,
          active: active.length,
          delivered: delivered.length,
          activeOrders: active,
          deliveredOrders: delivered
        });
      } else {
        throw new Error(response.message || 'Failed to fetch orders');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load orders';
      console.error('❌ [ORDER TRACKING] Error:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadActiveOrders();
  }, [loadActiveOrders]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadActiveOrders(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PREPARING': return 'restaurant';
      case 'ON_THE_WAY': return 'car-sport';
      case 'DELIVERED': return 'checkmark-circle';
      case 'CANCELLED': return 'close-circle';
      default: return 'time';
    }
  };

  const renderModernTrackingStep = (step: OrderStatus, isLast: boolean, progress: number) => (
    <View key={step.step} style={styles.modernStep}>
      <View style={styles.stepLeftColumn}>
        <View style={[
          styles.modernStepCircle,
          step.isCompleted && styles.stepCompleted,
          step.isActive && styles.stepActive,
        ]}>
          {step.isCompleted ? (
            <Ionicons name="checkmark" size={14} color="white" />
          ) : step.isActive ? (
            <View style={styles.pulsingDot}>
              <Animated.View style={[styles.pulse, styles.pulse1]} />
              <Animated.View style={[styles.pulse, styles.pulse2]} />
              <View style={styles.centerDot} />
            </View>
          ) : (
            <View style={styles.inactiveStepDot} />
          )}
        </View>
        {!isLast && (
          <View style={[
            styles.modernStepLine,
            step.isCompleted && styles.stepLineCompleted,
          ]} />
        )}
      </View>
      
      <View style={styles.stepRightColumn}>
        <View style={styles.stepTextContainer}>
          <ThemedText style={[
            styles.modernStepTitle,
            step.isActive && styles.stepActiveTitle,
            step.isCompleted && styles.stepCompletedTitle,
          ]}>
            {step.title}
          </ThemedText>
          <ThemedText style={styles.modernStepDescription}>
            {step.description}
          </ThemedText>
          {step.timestamp && (
            <ThemedText style={styles.modernStepTimestamp}>
              {step.timestamp}
            </ThemedText>
          )}
        </View>
      </View>
    </View>
  );

  const renderModernOrderCard = (order: TrackingOrder) => (
    <View key={order.id} style={styles.modernOrderCard}>
      {/* Status Header with Progress */}
      <LinearGradient
        colors={[order.statusColor + '15', order.statusColor + '05']}
        style={styles.orderStatusHeader}
      >
        <View style={styles.statusHeaderContent}>
          <View style={styles.statusLeft}>
            <View style={[styles.modernStatusIcon, { backgroundColor: order.statusColor + '20' }]}>
              <Ionicons 
                name={getStatusIcon(order.status) as any} 
                size={20} 
                color={order.statusColor} 
              />
            </View>
            <View>
              <ThemedText style={styles.orderNumberLarge}>#{order.orderNumber}</ThemedText>
              <ThemedText style={[styles.statusTextLarge, { color: order.statusColor }]}>
                {order.status.replace('_', ' ')}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.statusRight}>
            <ThemedText style={styles.estimatedTime}>{order.estimatedDelivery}</ThemedText>
            <ThemedText style={styles.estimatedLabel}>Estimated</ThemedText>
          </View>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <LinearGradient
              colors={[order.statusColor, order.statusColor + '80']}
              style={[styles.progressBar, { width: `${order.progress}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
          <ThemedText style={styles.progressText}>{order.progress}% Complete</ThemedText>
        </View>
      </LinearGradient>

      {/* Merchant Info */}
      <View style={styles.merchantSection}>
        <View style={styles.merchantAvatar}>
          <ThemedText style={styles.merchantInitial}>
            {order.merchantName.charAt(0)}
          </ThemedText>
        </View>
        <View style={styles.merchantInfo}>
          <ThemedText style={styles.merchantName}>{order.merchantName}</ThemedText>
          <ThemedText style={styles.orderItems}>
            {order.items.join(' • ')}
          </ThemedText>
        </View>
        <ThemedText style={styles.orderAmount}>₹{order.totalAmount}</ThemedText>
      </View>

      {/* Delivery Person Info (if on the way) */}
      {order.status === 'ON_THE_WAY' && order.deliveryPersonName && (
        <View style={styles.deliveryPersonCard}>
          <View style={styles.deliveryPersonLeft}>
            <View style={styles.deliveryPersonAvatar}>
              <Ionicons name="person" size={18} color="#8B5CF6" />
            </View>
            <View>
              <ThemedText style={styles.deliveryPersonName}>
                {order.deliveryPersonName}
              </ThemedText>
              <ThemedText style={styles.deliveryPersonRole}>Delivery Partner</ThemedText>
            </View>
          </View>
          <TouchableOpacity style={styles.callButton}>
            <Ionicons name="call" size={18} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* Modern Tracking Steps */}
      <View style={styles.modernTrackingContainer}>
        <ThemedText style={styles.trackingHeader}>Order Journey</ThemedText>
        <View style={styles.modernTrackingSteps}>
          {order.trackingSteps.map((step, index) => 
            renderModernTrackingStep(step, index === order.trackingSteps.length - 1, order.progress)
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push(`/orders/${order.id}` as any)}
        >
          <Ionicons name="receipt-outline" size={16} color="#8B5CF6" />
          <ThemedText style={styles.secondaryButtonText}>View Details</ThemedText>
        </TouchableOpacity>

        {order.status === 'ON_THE_WAY' && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push(`/orders/${order.id}/tracking` as any)}
          >
            <Ionicons name="location" size={16} color="white" />
            <ThemedText style={styles.primaryButtonText}>Track Live</ThemedText>
          </TouchableOpacity>
        )}

        {order.status === 'DELIVERED' && (
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => router.push(`/social-media?orderId=${order.id}` as any)}
          >
            <Ionicons name="share-social" size={16} color="#10B981" />
            <ThemedText style={styles.shareButtonText}>Share & Earn 5%</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
      {/* Modern Header */}
      <View
        style={styles.modernHeader}
      >
        <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.modernBackButton} 
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={22} color="white" />
            </TouchableOpacity>
            
            <View style={styles.headerCenter}>
              <ThemedText style={styles.headerTitle}>Order Tracking</ThemedText>
              <ThemedText style={styles.headerSubtitle}>
                {selectedTab === 'active'
                  ? `${activeOrders.length} active order${activeOrders.length !== 1 ? 's' : ''}`
                  : `${deliveredOrders.length} past order${deliveredOrders.length !== 1 ? 's' : ''}`
                }
              </ThemedText>
            </View>
            
            <TouchableOpacity 
              style={styles.modernRefreshButton} 
              onPress={handleRefresh}
            >
              <Ionicons name="refresh" size={22} color="white" />
            </TouchableOpacity>
          </View>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'active' && styles.activeTab]}
          onPress={() => setSelectedTab('active')}
        >
          <ThemedText style={[
            styles.tabText, 
            selectedTab === 'active' && styles.activeTabText
          ]}>
            Active Orders
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'delivered' && styles.activeTab]}
          onPress={() => setSelectedTab('delivered')}
        >
          <ThemedText style={[
            styles.tabText, 
            selectedTab === 'delivered' && styles.activeTabText
          ]}>
            Past Orders
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#8B5CF6"
            colors={['#8B5CF6']}
          />
        }
      >
        {loading ? (
          <View style={styles.modernEmptyState}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <ThemedText style={[styles.emptyDescription, { marginTop: 20 }]}>
              Loading your orders...
            </ThemedText>
          </View>
        ) : error ? (
          <View style={styles.modernEmptyState}>
            <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
            <ThemedText style={styles.emptyTitle}>Failed to Load Orders</ThemedText>
            <ThemedText style={styles.emptyDescription}>{error}</ThemedText>
            <TouchableOpacity style={styles.emptyActionButton} onPress={() => loadActiveOrders()}>
              <ThemedText style={styles.emptyActionText}>Try Again</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {selectedTab === 'active' && (
              activeOrders.length > 0 ? (
                activeOrders.map(renderModernOrderCard)
              ) : (
                <View style={styles.modernEmptyState}>
                  <LinearGradient
                    colors={['#F3F4F6', '#F9FAFB']}
                    style={styles.emptyIconContainer}
                  >
                    <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
                  </LinearGradient>
                  <ThemedText style={styles.emptyTitle}>No Active Orders</ThemedText>
                  <ThemedText style={styles.emptyDescription}>
                    You don't have any orders to track right now.{'\n'}
                    Start shopping to see your orders here!
                  </ThemedText>
                  <TouchableOpacity style={styles.emptyActionButton} onPress={() => router.push('/')}>
                    <ThemedText style={styles.emptyActionText}>Browse Stores</ThemedText>
                  </TouchableOpacity>
                </View>
              )
            )}

            {selectedTab === 'delivered' && (
              deliveredOrders.length > 0 ? (
                deliveredOrders.map(renderModernOrderCard)
              ) : (
                <View style={styles.modernEmptyState}>
                  <LinearGradient
                    colors={['#F3F4F6', '#F9FAFB']}
                    style={styles.emptyIconContainer}
                  >
                    <Ionicons name="checkmark-done-circle-outline" size={48} color="#9CA3AF" />
                  </LinearGradient>
                  <ThemedText style={styles.emptyTitle}>No Past Orders</ThemedText>
                  <ThemedText style={styles.emptyDescription}>
                    Your order history will appear here
                  </ThemedText>
                </View>
              )
            )}
          </>
        )}

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Modern Header
  modernHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 25,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#8B5CF6',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modernBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(20px)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  modernRefreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Tab Container
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: -10,
    borderRadius: 16,
    padding: 4,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: 'white',
  },

  // Content
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },

  // Modern Order Card
  modernOrderCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    marginHorizontal: 20,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },

  // Status Header
  orderStatusHeader: {
    padding: 20,
    paddingBottom: 16,
  },
  statusHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernStatusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderNumberLarge: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  statusTextLarge: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusRight: {
    alignItems: 'flex-end',
  },
  estimatedTime: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  estimatedLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Progress Bar
  progressContainer: {
    marginTop: 8,
  },
  progressBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'right',
  },

  // Merchant Section
  merchantSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  merchantAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  merchantInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  merchantInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  orderItems: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B5CF6',
  },

  // Delivery Person Card
  deliveryPersonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8F9FF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  deliveryPersonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deliveryPersonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deliveryPersonName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  deliveryPersonRole: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Modern Tracking
  modernTrackingContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  trackingHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  modernTrackingSteps: {
    paddingLeft: 8,
  },
  modernStep: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepLeftColumn: {
    alignItems: 'center',
    marginRight: 16,
  },
  modernStepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCompleted: {
    backgroundColor: '#10B981',
  },
  stepActive: {
    backgroundColor: '#8B5CF6',
  },
  pulsingDot: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulse: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  pulse1: {
    transform: [{ scale: 1 }],
  },
  pulse2: {
    transform: [{ scale: 1.4 }],
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
  },
  inactiveStepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D1D5DB',
  },
  modernStepLine: {
    width: 2,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  stepLineCompleted: {
    backgroundColor: '#10B981',
  },
  stepRightColumn: {
    flex: 1,
  },
  stepTextContainer: {
    paddingTop: 2,
  },
  modernStepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  stepActiveTitle: {
    color: '#8B5CF6',
  },
  stepCompletedTitle: {
    color: '#10B981',
  },
  modernStepDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 4,
  },
  modernStepTimestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    marginLeft: 6,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginLeft: 6,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 6,
  },

  // Modern Empty State
  modernEmptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  emptyActionButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
  },
  emptyActionText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },

  footer: {
    height: 40,
  },
});