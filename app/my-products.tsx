// My Products Page
// Shows all products the user has purchased from their order history

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import ordersService from '@/services/ordersApi';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeNavigation } from '@/hooks/useSafeNavigation';
import { HeaderBackButton } from '@/components/navigation';
import { useReorder } from '@/hooks/useReorder';
import { useCart } from '@/contexts/CartContext';

type ProductStatus = 'all' | 'delivered' | 'in_transit' | 'cancelled';

interface PurchasedProduct {
  id: string;
  productId: string;
  orderId: string;
  name: string;
  image: string;
  variant?: {
    type: string;
    value: string;
  };
  price: number;
  quantity: number;
  orderDate: string;
  deliveryStatus: 'delivered' | 'in_transit' | 'cancelled' | 'pending';
  canReorder: boolean;
  canReview: boolean;
}

const MyProductsPage = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { state: authState } = useAuth();
  const { goBack } = useSafeNavigation();
  const [products, setProducts] = useState<PurchasedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<ProductStatus>('all');
  const [reorderingProductId, setReorderingProductId] = useState<string | null>(null);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [reorderModalData, setReorderModalData] = useState<{
    addedCount: number;
    skippedCount: number;
    skippedItems: Array<{ productId: string; reason: string }>;
  } | null>(null);

  const { reorderFull, reordering, validation, error: reorderError } = useReorder();
  const { refreshCart } = useCart();

  const handleBackPress = useCallback(() => {
    goBack('/profile' as any);
  }, [goBack]);

  const mapOrderStatusToDelivery = (status: string): 'delivered' | 'in_transit' | 'cancelled' | 'pending' => {
    const statusMap: Record<string, 'delivered' | 'in_transit' | 'cancelled' | 'pending'> = {
      'delivered': 'delivered',
      'shipped': 'in_transit',
      'dispatched': 'in_transit',
      'processing': 'in_transit',
      'cancelled': 'cancelled',
      'refunded': 'cancelled',
      'pending': 'pending',
      'confirmed': 'pending',
    };
    return statusMap[status] || 'pending';
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      // Wait for auth to be ready
      if (authState.isLoading) {

        return;
      }

      if (!authState.isAuthenticated || !authState.token) {

        setProducts([]);
        setLoading(false);
        return;
      }

      // Fetch orders from API
      const params: any = {
        page: 1,
        limit: 50
      };

      // Only add status if not 'all'
      if (activeTab !== 'all') {
        params.status = activeTab;
      }

      const response = await ordersService.getOrders(params);

      if (response.data?.orders) {
        // Map backend order format to frontend PurchasedProduct format
        const mappedProducts: PurchasedProduct[] = response.data.orders.flatMap(order =>
          order.items.map(item => ({
            id: item.id,
            productId: item.product.id,
            orderId: order.orderNumber,
            name: item.product.name,
            image: item.product.images[0]?.url || 'https://via.placeholder.com/80',
            variant: item.variant ? {
              type: Object.keys(item.variant.attributes || {})[0] || 'Variant',
              value: Object.values(item.variant.attributes || {})[0]?.toString() || item.variant.name
            } : undefined,
            price: item.unitPrice,
            quantity: item.quantity,
            orderDate: order.createdAt,
            deliveryStatus: mapOrderStatusToDelivery(order.status),
            canReorder: order.status === 'delivered',
            canReview: order.status === 'delivered'
          }))
        );
        setProducts(mappedProducts);
      }
    } catch (error: any) {
      console.error('❌ Error fetching products:', error);
      console.error('❌ Error response:', error?.response?.data);
      console.error('❌ Error status:', error?.response?.status);
      console.error('❌ Full error:', JSON.stringify(error, null, 2));
      // Keep empty array on error
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, authState.isLoading, authState.isAuthenticated, authState.token]);

  useEffect(() => {
    // Only fetch when auth is ready
    if (!authState.isLoading && authState.isAuthenticated) {
      fetchProducts();
    }
  }, [fetchProducts, authState.isLoading, authState.isAuthenticated]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products.filter((product) => {
    if (activeTab === 'all') return true;
    return product.deliveryStatus === activeTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return '#10B981';
      case 'in_transit':
        return '#F59E0B';
      case 'cancelled':
        return '#EF4444';
      case 'pending':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'in_transit':
        return 'In Transit';
      case 'cancelled':
        return 'Cancelled';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  const handleReorder = useCallback(async (product: PurchasedProduct) => {
    if (reordering) {

      return;
    }

    try {
      setReorderingProductId(product.orderId);

      // Show confirmation dialog
      Alert.alert(
        'Reorder Confirmation',
        `Would you like to reorder all items from order #${product.orderId}?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setReorderingProductId(null)
          },
          {
            text: 'Reorder',
            onPress: async () => {
              try {

                const success = await reorderFull(product.orderId);

                if (success && validation) {
                  // Refresh cart to show new items
                  await refreshCart();

                  // Show result modal with details
                  setReorderModalData({
                    addedCount: validation.items.filter(item => item.isAvailable).length,
                    skippedCount: validation.unavailableItems.length,
                    skippedItems: validation.unavailableItems.map(item => ({
                      productId: item.productId,
                      reason: item.reason
                    }))
                  });
                  setShowReorderModal(true);

                  // If all items were added, navigate to cart
                  if (validation.unavailableItems.length === 0) {
                    setTimeout(() => {
                      setShowReorderModal(false);
                      router.push('/CartPage' as any);
                    }, 2000);
                  }
                } else {
                  // Show error
                  Alert.alert(
                    'Reorder Failed',
                    reorderError || 'Unable to reorder this order. Please try again.',
                    [{ text: 'OK' }]
                  );
                }
              } catch (error) {
                console.error('Reorder error:', error);
                Alert.alert(
                  'Error',
                  'An unexpected error occurred while reordering.',
                  [{ text: 'OK' }]
                );
              } finally {
                setReorderingProductId(null);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error in handleReorder:', error);
      setReorderingProductId(null);
    }
  }, [reordering, reorderFull, validation, reorderError, refreshCart, router]);

  const handleReview = (product: PurchasedProduct) => {
    // TODO: Navigate to review page

    router.push('/ReviewPage' as any);
  };

  const renderProduct = ({ item }: { item: PurchasedProduct }) => {
    const productLabel = `${item.name}${item.variant ? `, ${item.variant.type}: ${item.variant.value}` : ''}. Price: ${item.price} rupees. Quantity: ${item.quantity}. Order number ${item.orderId}, placed on ${new Date(item.orderDate).toLocaleDateString()}. Status: ${getStatusText(item.deliveryStatus)}`;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => router.push(`/ProductPage?cardId=${item.productId}&cardType=product` as any)}
        activeOpacity={0.7}
        accessibilityLabel={productLabel}
        accessibilityRole="button"
        accessibilityHint="Double tap to view product details"
      >
        <Image
          source={{ uri: item.image }}
          style={styles.productImage}
          accessibilityLabel={`Product image for ${item.name}`}
          accessible={true}
        />

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>

          {item.variant && (
            <Text style={styles.productVariant}>
              {item.variant.type}: {item.variant.value}
            </Text>
          )}

          <View
            style={styles.productDetails}
            accessibilityLabel={`Price: ${item.price} rupees. Quantity: ${item.quantity}`}
            accessibilityRole="text"
          >
            <Text style={styles.productPrice}>₹{item.price}</Text>
            <Text style={styles.productQuantity}>Qty: {item.quantity}</Text>
          </View>

          <Text
            style={styles.orderInfo}
            accessibilityLabel={`Order number ${item.orderId}, placed on ${new Date(item.orderDate).toLocaleDateString()}`}
          >
            Order #{item.orderId} • {new Date(item.orderDate).toLocaleDateString()}
          </Text>

          <View
            style={styles.statusBadge}
            accessibilityLabel={`Delivery status: ${getStatusText(item.deliveryStatus)}`}
            accessibilityRole="text"
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(item.deliveryStatus) },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.deliveryStatus) },
              ]}
            >
              {getStatusText(item.deliveryStatus)}
            </Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          {item.canReorder && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                reorderingProductId === item.orderId && styles.actionButtonDisabled
              ]}
              onPress={() => handleReorder(item)}
              disabled={reorderingProductId === item.orderId}
              accessibilityLabel={reorderingProductId === item.orderId ? 'Reordering product' : 'Reorder this product'}
              accessibilityRole="button"
              accessibilityHint="Double tap to add all items from this order to your cart"
              accessibilityState={{ disabled: reorderingProductId === item.orderId }}
            >
              {reorderingProductId === item.orderId ? (
                <ActivityIndicator size="small" color="#8B5CF6" />
              ) : (
                <>
                  <Ionicons name="repeat-outline" size={20} color="#8B5CF6" />
                  <Text style={styles.actionText}>Reorder</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {item.canReview && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleReview(item)}
              accessibilityLabel="Write a review for this product"
              accessibilityRole="button"
              accessibilityHint="Double tap to submit a product review"
            >
              <Ionicons name="star-outline" size={20} color="#F59E0B" />
              <Text style={styles.actionText}>Review</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cube-outline" size={80} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No Products Yet</Text>
      <Text style={styles.emptyText}>
        Products you purchase will appear here
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => router.push('/(tabs)/explore' as any)}
      >
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  const tabs: { key: ProductStatus; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'in_transit', label: 'In Transit' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
        <LinearGradient colors={['#7C3AED', '#8B5CF6']} style={styles.header}>
          <View style={styles.headerContent}>
            <HeaderBackButton
              onPress={handleBackPress}
              iconColor="#FFFFFF"
              style={styles.backButton}
            />
            <Text style={styles.headerTitle}>My Products</Text>
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />

      {/* Header */}
      <LinearGradient colors={['#7C3AED', '#8B5CF6']} style={styles.header}>
        <View style={styles.headerContent}>
          <HeaderBackButton
            onPress={handleBackPress}
            iconColor="#FFFFFF"
            style={styles.backButton}
          />
          <Text style={styles.headerTitle}>My Products</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.activeTab,
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />

      {/* Reorder Result Modal */}
      <Modal
        visible={showReorderModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReorderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              {reorderModalData?.skippedCount === 0 ? (
                <Ionicons name="checkmark-circle" size={48} color="#10B981" />
              ) : (
                <Ionicons name="alert-circle" size={48} color="#F59E0B" />
              )}
              <Text style={styles.modalTitle}>
                {reorderModalData?.skippedCount === 0
                  ? 'Reorder Successful!'
                  : 'Reorder Completed'}
              </Text>
            </View>

            <View style={styles.modalBody}>
              {reorderModalData && reorderModalData.addedCount > 0 && (
                <View style={styles.modalRow}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
                  <Text style={styles.modalSuccessText}>
                    {reorderModalData.addedCount} item(s) added to cart
                  </Text>
                </View>
              )}

              {reorderModalData && reorderModalData.skippedCount > 0 && (
                <>
                  <View style={styles.modalRow}>
                    <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
                    <Text style={styles.modalErrorText}>
                      {reorderModalData.skippedCount} item(s) unavailable
                    </Text>
                  </View>

                  <View style={styles.skippedItemsList}>
                    {reorderModalData.skippedItems.map((item, index) => (
                      <Text key={index} style={styles.skippedItemText}>
                        {item.reason}
                      </Text>
                    ))}
                  </View>
                </>
              )}
            </View>

            <View style={styles.modalActions}>
              {reorderModalData?.addedCount && reorderModalData.addedCount > 0 ? (
                <>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonSecondary]}
                    onPress={() => setShowReorderModal(false)}
                  >
                    <Text style={styles.modalButtonTextSecondary}>Continue Shopping</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonPrimary]}
                    onPress={() => {
                      setShowReorderModal(false);
                      router.push('/CartPage' as any);
                    }}
                  >
                    <Text style={styles.modalButtonTextPrimary}>View Cart</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={() => setShowReorderModal(false)}
                >
                  <Text style={styles.modalButtonTextPrimary}>Close</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activeTabText: {
    color: '#8B5CF6',
  },
  listContainer: {
    padding: 16,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  productVariant: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  productDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5CF6',
    marginRight: 12,
  },
  productQuantity: {
    fontSize: 12,
    color: '#6B7280',
  },
  orderInfo: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionsContainer: {
    justifyContent: 'center',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    minWidth: 70,
    justifyContent: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 12,
    textAlign: 'center',
  },
  modalBody: {
    marginBottom: 24,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  modalSuccessText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  modalErrorText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
  skippedItemsList: {
    marginTop: 8,
    paddingLeft: 28,
  },
  skippedItemText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#8B5CF6',
  },
  modalButtonSecondary: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
});

export default MyProductsPage;
