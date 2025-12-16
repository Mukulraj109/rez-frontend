/**
 * MallBrandCard Component
 *
 * Card component for displaying mall brand information
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MallBrand, BrandBadge } from '../../../types/mall.types';

interface MallBrandCardProps {
  brand: MallBrand;
  onPress: (brand: MallBrand) => void;
  width?: number;
  showCategory?: boolean;
}

const BADGE_COLORS: Record<BrandBadge, { bg: string; text: string }> = {
  exclusive: { bg: '#00C06A', text: '#FFFFFF' },
  premium: { bg: '#8B5CF6', text: '#FFFFFF' },
  new: { bg: '#F59E0B', text: '#FFFFFF' },
  trending: { bg: '#EC4899', text: '#FFFFFF' },
  'top-rated': { bg: '#3B82F6', text: '#FFFFFF' },
  verified: { bg: '#10B981', text: '#FFFFFF' },
};

const MallBrandCard: React.FC<MallBrandCardProps> = ({
  brand,
  onPress,
  width = 150,
  showCategory = false,
}) => {
  const cashbackDisplay = brand.cashback.maxAmount
    ? `Earn ₹${brand.cashback.maxAmount} cashback`
    : `Earn ${brand.cashback.percentage}% cashback`;

  return (
    <TouchableOpacity
      style={[styles.container, { width }]}
      onPress={() => onPress(brand)}
      activeOpacity={0.85}
    >
      <View style={styles.card}>
        {/* Logo Container */}
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: brand.logo }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Brand Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.brandName} numberOfLines={1}>
            {brand.name}
          </Text>

          {/* Rating */}
          {brand.ratings.average > 0 && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#FFC107" />
              <Text style={styles.ratingText}>{brand.ratings.average.toFixed(1)}</Text>
            </View>
          )}

          {/* Cashback */}
          <Text style={styles.cashbackText}>{cashbackDisplay}</Text>

          {/* Badges */}
          <View style={styles.badgesContainer}>
            {brand.badges.slice(0, 2).map((badge, index) => (
              <View
                key={badge}
                style={[
                  styles.badge,
                  { backgroundColor: BADGE_COLORS[badge]?.bg || '#6B7280' },
                ]}
              >
                <Text style={styles.badgeText}>
                  {badge.charAt(0).toUpperCase() + badge.slice(1)}
                </Text>
              </View>
            ))}
          </View>

          {/* Category */}
          {showCategory && brand.mallCategory && (
            <Text style={styles.categoryText} numberOfLines={1}>
              {brand.mallCategory.name}
            </Text>
          )}
        </View>

        {/* New Badge Overlay */}
        {brand.isNewArrival && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
    marginVertical: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  logoContainer: {
    width: '100%',
    height: 60,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logo: {
    width: '70%',
    height: '70%',
  },
  infoContainer: {
    flex: 1,
  },
  brandName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 4,
  },
  cashbackText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00C06A',
    marginBottom: 8,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  categoryText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default memo(MallBrandCard);
