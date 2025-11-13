// OrderHistoryItem Component
// Displays individual order in the order history list

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order, OrderStatus } from '@/types/order';

interface OrderHistoryItemProps {
  order: Order;
  onPress: () => void;
}

const OrderHistoryItem: React.FC<OrderHistoryItemProps> = ({ order, onPress }) => {
  // Safety checks for order data
  if (!order) {
    return null;
  }

  const safeOrder = {
    orderNumber: order.orderNumber || 'N/A',
    createdAt: order.createdAt || new Date().toISOString(),
    status: order.status || 'pending',
    currency: order.currency || '₹',
    total: order.total || 0,
    items: order.items || []
  };
  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'confirmed':
        return '#3B82F6';
      case 'processing':
        return '#8B5CF6';
      case 'shipped':
        return '#10B981';
      case 'delivered':
        return '#059669';
      case 'cancelled':
        return '#EF4444';
      case 'refunded':
        return '#6B7280';
      case 'returned':
        return '#F97316';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: OrderStatus): string => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'confirmed':
        return 'checkmark-circle-outline';
      case 'processing':
        return 'cog-outline';
      case 'shipped':
        return 'car-outline';
      case 'delivered':
        return 'checkmark-done-outline';
      case 'cancelled':
        return 'close-circle-outline';
      case 'refunded':
        return 'refresh-outline';
      case 'returned':
        return 'return-up-back-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatStatus = (status: OrderStatus): string => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  const itemCount = safeOrder.items.length;
  const storeName = safeOrder.items[0]?.storeName || 'Store';
  const statusLabel = formatStatus(safeOrder.status);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={`Order number ${safeOrder.orderNumber}. Status: ${statusLabel}. ${itemCount} ${itemCount === 1 ? 'item' : 'items'}. Total: rupees ${safeOrder.total.toFixed(2)}. Ordered from ${storeName} on ${formatDate(safeOrder.createdAt)}`}
      accessibilityRole="button"
      accessibilityHint="Double tap to view order details"
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>#{safeOrder.orderNumber}</Text>
          <Text style={styles.orderDate}>{formatDate(safeOrder.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(safeOrder.status) }]}>
          <Ionicons 
            name={getStatusIcon(safeOrder.status) as any} 
            size={12} 
            color="#FFFFFF" 
          />
          <Text style={styles.statusText}>{formatStatus(safeOrder.status)}</Text>
        </View>
      </View>

      {/* Items */}
      <View
        style={styles.itemsContainer}
        accessibilityLabel={`Order items: ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
      >
        {safeOrder.items.slice(0, 2).map((item, index) => (
          <View
            key={`${item.id}-${index}`}
            style={styles.itemRow}
            accessibilityLabel={`${item.productName}. Quantity: ${item.quantity}. Price: rupees ${(item.subtotal || 0).toFixed(2)}`}
          >
            <View style={styles.itemImageContainer}>
              {item.productImage ? (
                <Image
                  source={{ uri: item.productImage }}
                  style={styles.itemImage}
                  accessibilityLabel={`${item.productName} product image`}
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="image-outline" size={24} color="#9CA3AF" />
                </View>
              )}
            </View>
            <View style={styles.itemDetails}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.productName}
              </Text>
              <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              {item.variant && (
                <Text style={styles.itemVariant}>
                  {Object.values(item.variant).filter(Boolean).join(', ')}
                </Text>
              )}
            </View>
            <Text style={styles.itemPrice}>
              {safeOrder.currency} {(item.subtotal || 0).toFixed(2)}
            </Text>
          </View>
        ))}

        {safeOrder.items.length > 2 && (
          <Text
            style={styles.moreItems}
            accessibilityLabel={`Plus ${safeOrder.items.length - 2} more ${safeOrder.items.length - 2 > 1 ? 'items' : 'item'}`}
          >
            +{safeOrder.items.length - 2} more item{safeOrder.items.length - 2 > 1 ? 's' : ''}
          </Text>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>
            {safeOrder.currency} {(safeOrder.total || 0).toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.actions}>
          {safeOrder.status === 'delivered' && (
            <TouchableOpacity
              style={styles.actionButton}
              accessibilityLabel={`Reorder order ${safeOrder.orderNumber}`}
              accessibilityRole="button"
              accessibilityHint="Double tap to reorder these items"
            >
              <Text style={styles.actionButtonText}>Reorder</Text>
            </TouchableOpacity>
          )}
          {safeOrder.status === 'shipped' && (
            <TouchableOpacity
              style={styles.actionButton}
              accessibilityLabel={`Track order ${safeOrder.orderNumber}`}
              accessibilityRole="button"
              accessibilityHint="Double tap to view live tracking"
            >
              <Text style={styles.actionButtonText}>Track</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            accessibilityLabel={`View details for order ${safeOrder.orderNumber}`}
            accessibilityRole="button"
            accessibilityHint="Double tap to see full order details"
          >
            <Text style={styles.actionButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  itemsContainer: {
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  itemDetails: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  itemVariant: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  moreItems: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
});

export default OrderHistoryItem;
