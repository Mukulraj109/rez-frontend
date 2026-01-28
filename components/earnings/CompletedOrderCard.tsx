import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Order } from '@/services/ordersApi';
import { useRegion } from '@/contexts/RegionContext';

type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'credited' | null;

interface CompletedOrderCardProps {
  order: Order;
  onEarnPress: (order: Order) => void;
  alreadyEarned?: boolean;
  submissionStatus?: SubmissionStatus;
}

export default function CompletedOrderCard({
  order,
  onEarnPress,
  alreadyEarned = false,
  submissionStatus = null,
}: CompletedOrderCardProps) {
  const { getCurrencySymbol } = useRegion();
  const currencySymbol = getCurrencySymbol();

  // Get first product image from order items
  const firstItem = order.items?.[0];
  const productImage = firstItem?.product?.images?.[0]?.url;
  const productName = firstItem?.product?.name || 'Product';
  const storeName = firstItem?.product?.store?.name || 'Store';
  const totalAmount = order.totals?.total || 0;
  const cashbackAmount = (totalAmount * 5) / 100;
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View style={styles.container}>
      <View style={styles.orderCard}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {productImage ? (
            <Image
              source={{ uri: productImage }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="cube-outline" size={32} color="#9CA3AF" />
            </View>
          )}
        </View>

        {/* Order Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.orderHeader}>
            <ThemedText style={styles.orderNumber}>
              #{order.orderNumber}
            </ThemedText>
            <View style={styles.deliveredBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#059669" />
              <ThemedText style={styles.deliveredText}>Delivered</ThemedText>
            </View>
          </View>

          <ThemedText style={styles.productName} numberOfLines={2}>
            {productName}
          </ThemedText>

          <ThemedText style={styles.storeName}>
            from {storeName}
          </ThemedText>

          <View style={styles.priceRow}>
            <ThemedText style={styles.orderAmount}>
              {currencySymbol}{totalAmount.toFixed(2)}
            </ThemedText>
            <ThemedText style={styles.orderDate}>
              {orderDate}
            </ThemedText>
          </View>

          {/* Cashback Info */}
          <View style={styles.cashbackInfo}>
            <Ionicons name="gift-outline" size={14} color="#8B5CF6" />
            <ThemedText style={styles.cashbackText}>
              Earn {currencySymbol}{cashbackAmount.toFixed(2)} cashback
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Earn Button or Status */}
      {submissionStatus === 'pending' ? (
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, styles.pendingBadge]}>
            <Ionicons name="time-outline" size={16} color="#D97706" />
            <ThemedText style={styles.pendingText}>Pending Review</ThemedText>
          </View>
          <ThemedText style={styles.statusHint}>Merchant will verify within 24 hours</ThemedText>
        </View>
      ) : submissionStatus === 'approved' || submissionStatus === 'credited' || alreadyEarned ? (
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, styles.earnedBadge]}>
            <Ionicons name="checkmark-circle" size={16} color="#059669" />
            <ThemedText style={styles.earnedText}>
              {submissionStatus === 'credited' ? 'Coins Credited' : 'Approved'}
            </ThemedText>
          </View>
        </View>
      ) : submissionStatus === 'rejected' ? (
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, styles.rejectedBadge]}>
            <Ionicons name="close-circle" size={16} color="#DC2626" />
            <ThemedText style={styles.rejectedText}>Rejected</ThemedText>
          </View>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => onEarnPress(order)}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.earnButton}
          onPress={() => onEarnPress(order)}
          activeOpacity={0.8}
          accessibilityLabel={`Earn cashback for order ${order.orderNumber}`}
          accessibilityRole="button"
          accessibilityHint="Opens cashback info modal to submit social media post"
        >
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            style={styles.earnButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="share-social-outline" size={18} color="white" />
            <ThemedText style={styles.earnButtonText}>Earn</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orderCard: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    flex: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  deliveredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  deliveredText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
    lineHeight: 20,
  },
  storeName: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  orderDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  cashbackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  cashbackText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  earnButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  earnButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  earnButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  earnedContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  earnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  earnedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  pendingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D97706',
  },
  rejectedBadge: {
    backgroundColor: '#FEE2E2',
  },
  rejectedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  statusHint: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  retryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
});
