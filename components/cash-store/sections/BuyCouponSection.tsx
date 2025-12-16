/**
 * BuyCouponSection Component
 *
 * Section for buying gift cards/coupons with discounts
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GiftCardBrand } from '../../../types/cash-store.types';

interface BuyCouponSectionProps {
  brands: GiftCardBrand[];
  isLoading?: boolean;
  onBrandPress: (brand: GiftCardBrand) => void;
  onViewAllPress: () => void;
}

const GiftCardCard: React.FC<{
  brand: GiftCardBrand;
  onPress: () => void;
}> = ({ brand, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
    {/* Brand Header */}
    <View style={[styles.cardHeader, { backgroundColor: brand.backgroundColor || '#F3F4F6' }]}>
      {brand.logo ? (
        <Image source={{ uri: brand.logo }} style={styles.brandLogo} resizeMode="contain" />
      ) : (
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoInitial}>{brand.name.charAt(0)}</Text>
        </View>
      )}
    </View>

    {/* Content */}
    <View style={styles.cardContent}>
      <Text style={styles.brandName} numberOfLines={1}>
        {brand.name}
      </Text>

      {/* Denominations Preview */}
      <Text style={styles.denominationsText}>
        ₹{brand.denominations[0]} - ₹{brand.denominations[brand.denominations.length - 1]}
      </Text>

      {/* Cashback */}
      <View style={styles.cashbackRow}>
        <Ionicons name="gift-outline" size={14} color="#00C06A" />
        <Text style={styles.cashbackText}>{brand.cashbackRate}% Cashback</Text>
      </View>

      {/* Badges */}
      <View style={styles.badgeRow}>
        {brand.isNewlyAdded && (
          <View style={[styles.badge, { backgroundColor: '#DBEAFE' }]}>
            <Text style={[styles.badgeText, { color: '#3B82F6' }]}>NEW</Text>
          </View>
        )}
        {brand.isFeatured && (
          <View style={[styles.badge, { backgroundColor: '#FEF3C7' }]}>
            <Text style={[styles.badgeText, { color: '#F59E0B' }]}>Featured</Text>
          </View>
        )}
      </View>
    </View>

    {/* Buy Button */}
    <TouchableOpacity style={styles.buyButton} onPress={onPress}>
      <Text style={styles.buyButtonText}>Buy Now</Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

const SkeletonCard: React.FC = () => (
  <View style={styles.card}>
    <View style={[styles.cardHeader, styles.skeleton]} />
    <View style={styles.cardContent}>
      <View style={[styles.skeletonText, { width: 80 }]} />
      <View style={[styles.skeletonText, { width: 60 }]} />
    </View>
  </View>
);

const BuyCouponSection: React.FC<BuyCouponSectionProps> = ({
  brands,
  isLoading = false,
  onBrandPress,
  onViewAllPress,
}) => {
  if (brands.length === 0 && !isLoading) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Buy Coupon & Save Instantly</Text>
          <Text style={styles.subtitle}>Get extra cashback on gift cards</Text>
        </View>
        <TouchableOpacity onPress={onViewAllPress} style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color="#00C06A" />
        </TouchableOpacity>
      </View>

      {/* Horizontal List */}
      <FlatList
        data={isLoading ? Array.from({ length: 4 }) : brands}
        renderItem={({ item, index }) =>
          isLoading ? (
            <SkeletonCard key={`skeleton-${index}`} />
          ) : (
            <GiftCardCard
              brand={item as GiftCardBrand}
              onPress={() => onBrandPress(item as GiftCardBrand)}
            />
          )
        }
        keyExtractor={(item, index) => (isLoading ? `skeleton-${index}` : (item as GiftCardBrand).id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00C06A',
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandLogo: {
    width: 60,
    height: 60,
  },
  logoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6B7280',
  },
  cardContent: {
    padding: 12,
  },
  brandName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  denominationsText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  cashbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  cashbackText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00C06A',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '600',
  },
  buyButton: {
    backgroundColor: '#00C06A',
    paddingVertical: 10,
    alignItems: 'center',
  },
  buyButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Skeleton
  skeleton: {
    backgroundColor: '#E5E7EB',
  },
  skeletonText: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 6,
  },
});

export default memo(BuyCouponSection);
