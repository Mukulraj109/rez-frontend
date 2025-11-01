// Incomplete Transactions Page
// Displays orders that are pending, failed, or cancelled

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import ordersApi, { Order } from '@/services/ordersApi';

const INCOMPLETE_STATUSES = ['pending', 'payment_failed', 'cancelled', 'payment_pending'];

const IncompleteTransactionsPage = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIncompleteOrders = useCallback(async (refresh: boolean = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await ordersApi.getOrders({
        page: 1,
        limit: 50,
      });

      if (response.success && response.data) {
        // Filter for incomplete orders
        const incompleteOrders = response.data.orders.filter((order: Order) =>
          INCOMPLETE_STATUSES.includes(order.status as any)
        );
        setOrders(incompleteOrders);
      } else {
        throw new Error(response.message || 'Failed to fetch orders');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch incomplete transactions';
      setError(errorMessage);
      console.error('Error fetching incomplete orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchIncompleteOrders();
  }, [fetchIncompleteOrders]);

  const onRefresh = () => {
    fetchIncompleteOrders(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'payment_pending':
        return '#F59E0B';
      case 'payment_failed':
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'payment_pending':
        return 'time-outline';
      case 'payment_failed':
        return 'close-circle-outline';
      case 'cancelled':
        return 'ban-outline';
      default:
        return 'alert-circle-outline';
    }
  };

  const getActionLabel = (status: string) => {
    switch (status) {
      case 'payment_pending':
      case 'payment_failed':
        return 'Retry Payment';
      case 'pending':
        return 'View Details';
      case 'cancelled':
        return 'Reorder';
      default:
        return 'View';
    }
  };

  const handleAction = (order: Order) => {
    switch (order.status as any) {
      case 'payment_pending':
      case 'payment_failed':
        // Navigate to checkout to retry payment
        router.push(`/checkout?orderId=${order._id}` as any);
        break;
      case 'cancelled':
        // Navigate to order details where user can reorder
        router.push(`/orders/${order._id}` as any);
        break;
      default:
        // View order details
        router.push(`/orders/${order._id}` as any);
        break;
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderHeaderLeft}>
          <Ionicons
            name={getStatusIcon(item.status as any) as any}
            size={24}
            color={getStatusColor(item.status as any)}
          />
          <View style={styles.orderInfo}>
            <ThemedText style={styles.orderId}>Order #{item.orderNumber || item._id.substring(0, 8)}</ThemedText>
            <ThemedText style={styles.orderDate}>
              {new Date(item.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </ThemedText>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status as any)}20` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status as any) }]}>
            {(item.status as any).replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.orderBody}>
        <View style={styles.orderDetail}>
          <ThemedText style={styles.orderLabel}>Total Amount</ThemedText>
          <ThemedText style={styles.orderValue}>
            ₹{(item.totals?.total || item.summary?.total || 0).toFixed(2)}
          </ThemedText>
        </View>
        <View style={styles.orderDetail}>
          <ThemedText style={styles.orderLabel}>Items</ThemedText>
          <ThemedText style={styles.orderValue}>{item.items?.length || 0} items</ThemedText>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.actionButton, { borderColor: getStatusColor(item.status as any) }]}
        onPress={() => handleAction(item)}
      >
        <Text style={[styles.actionButtonText, { color: getStatusColor(item.status as any) }]}>
          {getActionLabel(item.status as any)}
        </Text>
        <Ionicons name="arrow-forward" size={16} color={getStatusColor(item.status as any)} />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="checkmark-circle-outline" size={64} color="#10B981" />
      <ThemedText style={styles.emptyTitle}>All Clear!</ThemedText>
      <ThemedText style={styles.emptyMessage}>
        You don't have any incomplete transactions
      </ThemedText>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />

      {/* Header */}
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Incomplete Transactions</ThemedText>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      {/* Content */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <ThemedText style={styles.loadingText}>Loading transactions...</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchIncompleteOrders()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#8B5CF6"
              colors={['#8B5CF6']}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  listContainer: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderInfo: {
    marginLeft: 12,
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  orderBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  orderDetail: {
    flex: 1,
  },
  orderLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  orderValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default IncompleteTransactionsPage;
