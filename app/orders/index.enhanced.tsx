import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { router, Stack } from 'expo-router';
import ordersService, { Order } from '@/services/ordersApi';
import { mapBackendOrderToFrontend } from '@/utils/dataMappers';

type OrderStatus = 'all' | 'placed' | 'confirmed' | 'preparing' | 'dispatched' | 'delivered' | 'cancelled';

interface FilterState {
  status: OrderStatus;
  dateRange: 'all' | 'week' | 'month' | '3months' | 'custom';
  storeId?: string;
}

export default function OrdersListScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    dateRange: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  // Apply filters and search
  useEffect(() => {
    applyFilters();
  }, [orders, searchQuery, filters]);

  const loadOrders = async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await ordersService.getOrders({
        page: pageNum,
        limit: 20,
        sort: 'newest',
        status: filters.status !== 'all' ? filters.status : undefined,
      });

      if (response.success && response.data) {
        const mappedOrders = response.data.orders.map(mapBackendOrderToFrontend);

        if (refresh || pageNum === 1) {
          setOrders(mappedOrders);
        } else {
          setOrders(prev => [...prev, ...mappedOrders]);
        }

        setHasMore(response.data.pagination.current < response.data.pagination.pages);
        setPage(pageNum);
        setError(null);
      }
    } catch (err) {
      console.error('📦 [Orders] Failed to load orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...orders];

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (filters.dateRange) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '3months':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }

      filtered = filtered.filter(order => new Date(order.createdAt) >= startDate);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(order => {
        // Search in order number
        if (order.orderNumber.toLowerCase().includes(query)) return true;

        // Search in product names
        const hasMatchingProduct = order.items.some(item =>
          item.product?.name?.toLowerCase().includes(query)
        );
        if (hasMatchingProduct) return true;

        return false;
      });
    }

    setFilteredOrders(filtered);
  }, [orders, filters, searchQuery]);

  const handleRefresh = () => {
    loadOrders(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadOrders(page + 1);
    }
  };

  const handleOrderPress = (orderId: string) => {
    router.push(`/orders/${orderId}/tracking`);
  };

  const handleStatusFilterChange = (status: OrderStatus) => {
    setFilters(prev => ({ ...prev, status }));
    setShowFilters(false);
    // Reload orders with new filter
    loadOrders(1, true);
  };

  const handleDateRangeChange = (dateRange: FilterState['dateRange']) => {
    setFilters(prev => ({ ...prev, dateRange }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      dateRange: 'all',
    });
    setSearchQuery('');
    loadOrders(1, true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return '#10b981';
      case 'dispatched':
      case 'out_for_delivery':
        return '#3b82f6';
      case 'preparing':
      case 'ready':
        return '#f59e0b';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => handleOrderPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
          <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.orderItems}>
        {item.items.slice(0, 3).map((orderItem, index) => (
          <View key={index} style={styles.itemRow}>
            {orderItem.product?.images?.[0]?.url && (
              <Image
                source={{ uri: orderItem.product.images[0].url }}
                style={styles.itemImage}
              />
            )}
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>
                {orderItem.product?.name || (orderItem as any).name}
              </Text>
              <Text style={styles.itemQuantity}>Qty: {orderItem.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>₹{(orderItem as any).subtotal}</Text>
          </View>
        ))}
        {item.items.length > 3 && (
          <Text style={styles.moreItems}>
            +{item.items.length - 3} more item{item.items.length - 3 > 1 ? 's' : ''}
          </Text>
        )}
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>₹{item.summary?.total}</Text>
        </View>
        <TouchableOpacity
          style={styles.trackButton}
          onPress={() => handleOrderPress(item.id)}
        >
          <Text style={styles.trackButtonText}>Track Order</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>
        {searchQuery || filters.status !== 'all' || filters.dateRange !== 'all'
          ? 'No orders match your filters'
          : 'No orders yet'}
      </Text>
      <Text style={styles.emptySubtext}>
        {searchQuery || filters.status !== 'all' || filters.dateRange !== 'all'
          ? 'Try adjusting your filters'
          : 'Start shopping to see your orders here'}
      </Text>
      {(searchQuery || filters.status !== 'all' || filters.dateRange !== 'all') ? (
        <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
          <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/')}>
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!loading || page === 1) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#6366f1" />
      </View>
    );
  };

  const activeFiltersCount =
    (filters.status !== 'all' ? 1 : 0) + (filters.dateRange !== 'all' ? 1 : 0);

  if (loading && page === 1) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: 'My Orders' }} />
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  if (error && orders.length === 0) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: 'My Orders' }} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadOrders()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'My Orders' }} />

      {/* Search and Filter Bar */}
      <View style={styles.searchFilterBar}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by order number or product..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterIcon}>⚙️</Text>
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          filteredOrders.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#6366f1']}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Status Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Order Status</Text>
                {(['all', 'placed', 'confirmed', 'preparing', 'dispatched', 'delivered', 'cancelled'] as OrderStatus[]).map(
                  status => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.filterOption,
                        filters.status === status && styles.filterOptionActive,
                      ]}
                      onPress={() => handleStatusFilterChange(status)}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          filters.status === status && styles.filterOptionTextActive,
                        ]}
                      >
                        {status === 'all' ? 'All Orders' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                      {filters.status === status && (
                        <Text style={styles.filterOptionCheck}>✓</Text>
                      )}
                    </TouchableOpacity>
                  )
                )}
              </View>

              {/* Date Range Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Date Range</Text>
                {(['all', 'week', 'month', '3months'] as FilterState['dateRange'][]).map(range => (
                  <TouchableOpacity
                    key={range}
                    style={[
                      styles.filterOption,
                      filters.dateRange === range && styles.filterOptionActive,
                    ]}
                    onPress={() => handleDateRangeChange(range)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        filters.dateRange === range && styles.filterOptionTextActive,
                      ]}
                    >
                      {range === 'all'
                        ? 'All Time'
                        : range === 'week'
                        ? 'Last Week'
                        : range === 'month'
                        ? 'Last Month'
                        : 'Last 3 Months'}
                    </Text>
                    {filters.dateRange === range && (
                      <Text style={styles.filterOptionCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.clearFiltersButtonModal}
                onPress={clearFilters}
              >
                <Text style={styles.clearFiltersButtonTextModal}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyFiltersButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyFiltersButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
);
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
  searchFilterBar: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#111827',
  },
  clearIcon: {
    fontSize: 18,
    color: '#9ca3af',
    padding: 4,
  },
  filterButton: {
    width: 48,
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterIcon: {
    fontSize: 18,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#6b7280',
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
  orderItems: {
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#6b7280',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  moreItems: {
    fontSize: 12,
    color: '#6366f1',
    marginTop: 4,
    marginLeft: 62,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  totalSection: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  trackButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  trackButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  clearFiltersButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearFiltersButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  shopButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    fontSize: 14,
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
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalClose: {
    fontSize: 24,
    color: '#6b7280',
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  filterOptionActive: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  filterOptionText: {
    fontSize: 15,
    color: '#374151',
  },
  filterOptionTextActive: {
    color: '#6366f1',
    fontWeight: '600',
  },
  filterOptionCheck: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: 'bold',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  clearFiltersButtonModal: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearFiltersButtonTextModal: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  applyFiltersButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyFiltersButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
