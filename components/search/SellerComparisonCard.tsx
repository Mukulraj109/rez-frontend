import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SellerOption } from '@/types/search.types';

interface SellerComparisonCardProps {
  seller: SellerOption;
  onPress: (seller: SellerOption) => void;
  onFavorite?: (seller: SellerOption) => void;
  onShare?: (seller: SellerOption) => void;
}

export default function SellerComparisonCard({
  seller,
  onPress,
  onFavorite,
  onShare,
}: SellerComparisonCardProps) {
  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const formatReviewCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const getAvailabilityColor = () => {
    switch (seller.availability) {
      case 'in_stock':
        return '#00C06A'; // ReZ Green
      case 'low_stock':
        return '#FFC857'; // ReZ Gold
      case 'out_of_stock':
        return '#EF4444'; // Red
      default:
        return '#6B7280';
    }
  };

  const getAvailabilityText = () => {
    switch (seller.availability) {
      case 'in_stock':
        return 'In Stock';
      case 'low_stock':
        return 'Few Left';
      case 'out_of_stock':
        return 'Out of Stock';
      default:
        return 'Check Availability';
    }
  };

  const getDeliveryIcon = () => {
    switch (seller.delivery.type) {
      case 'express':
        return 'flash';
      case 'pickup':
        return 'storefront';
      default:
        return 'car';
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(seller)}
      activeOpacity={0.9}
    >
      {/* Store Logo/Icon */}
      <View style={styles.storeLogoContainer}>
        {seller.storeLogo ? (
          <Image
            source={{ uri: seller.storeLogo }}
            style={styles.storeLogo}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.storeLogoPlaceholder}>
            <Ionicons name="storefront" size={24} color="#00C06A" />
          </View>
        )}
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Store Name and Verified Badge */}
        <View style={styles.storeNameRow}>
          <Text style={styles.storeName} numberOfLines={1}>
            {seller.storeName}
          </Text>
          {seller.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
            </View>
          )}
        </View>

        {/* Location and Distance */}
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={12} color="#6B7280" />
          <Text style={styles.locationText} numberOfLines={1}>
            {seller.distance 
              ? `${seller.location} • ${formatDistance(seller.distance)}`
              : seller.location
            }
          </Text>
        </View>

        {/* Rating */}
        <View style={styles.ratingSection}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color="#F59E0B" />
            <Text style={styles.ratingText}>
              {seller.rating.toFixed(1)}
            </Text>
            <Text style={styles.reviewCountText}>
              ({formatReviewCount(seller.reviewCount)})
            </Text>
          </View>
          <View style={[styles.availabilityBadge, { backgroundColor: `${getAvailabilityColor()}20` }]}>
            <View style={[styles.availabilityDot, { backgroundColor: getAvailabilityColor() }]} />
            <Text style={[styles.availabilityText, { color: getAvailabilityColor() }]}>
              {getAvailabilityText()}
            </Text>
          </View>
        </View>

        {/* Price and Savings */}
        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.currentPrice}>
              {formatPrice(seller.price.current)}
            </Text>
            {seller.price.original && seller.price.original > seller.price.current && (
              <Text style={styles.originalPrice}>
                {formatPrice(seller.price.original)}
              </Text>
            )}
          </View>
          {seller.savings > 0 && (
            <View style={styles.savingsContainer}>
              <Ionicons name="information-circle-outline" size={14} color="#00C06A" />
              <Text style={styles.savingsText}>You Save {formatPrice(seller.savings)}</Text>
            </View>
          )}
        </View>

        {/* Cashback and RezCoins */}
        <View style={styles.rewardsRow}>
          <View style={styles.rewardsContainer}>
            <Ionicons name="cash-outline" size={12} color="#00C06A" />
            <Text style={styles.rewardsText}>
              {formatPrice(seller.cashback.amount)} + {seller.cashback.coins} rezcoins
            </Text>
          </View>
        </View>

        {/* Delivery Information */}
        <View style={styles.deliveryRow}>
          <View style={styles.deliveryContainer}>
            <Ionicons name={getDeliveryIcon()} size={12} color="#6B7280" />
            <Text style={styles.deliveryText}>{seller.delivery.time}</Text>
          </View>
        </View>

        {/* Badges */}
        {seller.badges && seller.badges.length > 0 && (
          <View style={styles.badgesRow}>
            {seller.badges.map((badge, index) => (
              <View key={index} style={styles.badge}>
                {badge === 'Hot Deal' && <Ionicons name="flame" size={10} color="#EF4444" />}
                {badge === 'Limited Stock' && <Ionicons name="time-outline" size={10} color="#F59E0B" />}
                {badge === 'Lock Available' && <Ionicons name="lock-closed" size={10} color="#00C06A" />}
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.viewDealButton}
          onPress={() => onPress(seller)}
          activeOpacity={0.8}
        >
          <Text style={styles.viewDealText}>View Deal</Text>
        </TouchableOpacity>
        <View style={styles.iconButtons}>
          {onFavorite && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => onFavorite(seller)}
              activeOpacity={0.7}
            >
              <Ionicons name="heart-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
          {onShare && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => onShare(seller)}
              activeOpacity={0.7}
            >
              <Ionicons name="share-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  storeLogoContainer: {
    marginRight: 10,
  },
  storeLogo: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  storeLogoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginRight: 10,
  },
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  storeName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginRight: 5,
  },
  verifiedBadge: {
    marginLeft: 3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  locationText: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 3,
    flex: 1,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '700',
    marginLeft: 2,
  },
  reviewCountText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  availabilityDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  availabilityText: {
    fontSize: 9,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  priceLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  originalPrice: {
    fontSize: 13,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  savingsText: {
    fontSize: 11,
    color: '#00C06A',
    fontWeight: '600',
  },
  rewardsRow: {
    marginBottom: 5,
  },
  rewardsText: {
    fontSize: 12,
    color: '#00C06A',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  deliveryRow: {
    marginBottom: 6,
  },
  deliveryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deliveryText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  badgeText: {
    fontSize: 9,
    color: '#92400E',
    fontWeight: '600',
  },
  actionsContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minWidth: 100,
  },
  viewDealButton: {
    backgroundColor: '#00C06A',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 12,
    marginBottom: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#00C06A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 10px rgba(0, 192, 106, 0.3)',
      },
    }),
  },
  viewDealText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  iconButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

