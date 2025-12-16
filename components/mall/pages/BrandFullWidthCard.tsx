/**
 * BrandFullWidthCard Component
 *
 * Full-width list card for brand listings
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MallBrand, BrandBadge, BrandTier } from '../../../types/mall.types';

interface BrandFullWidthCardProps {
  brand: MallBrand;
  onPress: (brand: MallBrand) => void;
}

const BADGE_COLORS: Record<BrandBadge, { bg: string; text: string }> = {
  exclusive: { bg: '#00C06A', text: '#FFFFFF' },
  premium: { bg: '#8B5CF6', text: '#FFFFFF' },
  new: { bg: '#F59E0B', text: '#FFFFFF' },
  trending: { bg: '#EC4899', text: '#FFFFFF' },
  'top-rated': { bg: '#3B82F6', text: '#FFFFFF' },
  verified: { bg: '#10B981', text: '#FFFFFF' },
};

const TIER_COLORS: Record<BrandTier, { bg: string; text: string; border: string }> = {
  standard: { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' },
  premium: { bg: '#EDE9FE', text: '#7C3AED', border: '#C4B5FD' },
  exclusive: { bg: '#D1FAE5', text: '#059669', border: '#6EE7B7' },
  luxury: { bg: '#FEF3C7', text: '#B45309', border: '#FCD34D' },
};

const BrandFullWidthCard: React.FC<BrandFullWidthCardProps> = ({
  brand,
  onPress,
}) => {
  const cashbackDisplay = brand.cashback.maxAmount
    ? `Up to ₹${brand.cashback.maxAmount}`
    : `${brand.cashback.percentage}% cashback`;

  const tierStyle = TIER_COLORS[brand.tier];

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(brand)}
      activeOpacity={0.85}
    >
      <View style={styles.card}>
        {/* Left: Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: brand.logo }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Middle: Info */}
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.brandName} numberOfLines={1}>
              {brand.name}
            </Text>
            {brand.isNewArrival && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            )}
          </View>

          {/* Rating & Success Rate */}
          <View style={styles.ratingRow}>
            {brand.ratings.average > 0 && (
              <>
                <Ionicons name="star" size={14} color="#FFC107" />
                <Text style={styles.ratingText}>
                  {brand.ratings.average.toFixed(1)}
                </Text>
                <Text style={styles.ratingCount}>
                  ({brand.ratings.count})
                </Text>
                <View style={styles.dot} />
              </>
            )}
            <Text style={styles.successRate}>
              {brand.ratings.successRate}% success
            </Text>
          </View>

          {/* Cashback */}
          <Text style={styles.cashbackText}>{cashbackDisplay}</Text>

          {/* Badges Row */}
          <View style={styles.badgesRow}>
            {/* Tier Badge */}
            <View
              style={[
                styles.tierBadge,
                {
                  backgroundColor: tierStyle.bg,
                  borderColor: tierStyle.border,
                },
              ]}
            >
              <Text style={[styles.tierBadgeText, { color: tierStyle.text }]}>
                {brand.tier.charAt(0).toUpperCase() + brand.tier.slice(1)}
              </Text>
            </View>

            {/* Other Badges */}
            {brand.badges.slice(0, 2).map((badge) => (
              <View
                key={badge}
                style={[
                  styles.badge,
                  { backgroundColor: BADGE_COLORS[badge]?.bg || '#6B7280' },
                ]}
              >
                <Text style={styles.badgeText}>
                  {badge.charAt(0).toUpperCase() + badge.slice(1).replace('-', ' ')}
                </Text>
              </View>
            ))}
          </View>

          {/* Category */}
          {brand.mallCategory && (
            <Text style={styles.categoryText} numberOfLines={1}>
              {brand.mallCategory.name}
            </Text>
          )}
        </View>

        {/* Right: Arrow */}
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
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
    }),
  },
  logoContainer: {
    width: 70,
    height: 70,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  logo: {
    width: '75%',
    height: '75%',
  },
  infoContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  newBadge: {
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
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 2,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 8,
  },
  successRate: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10B981',
  },
  cashbackText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00C06A',
    marginBottom: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  tierBadgeText: {
    fontSize: 10,
    fontWeight: '600',
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
    fontSize: 12,
    color: '#9CA3AF',
  },
  arrowContainer: {
    paddingLeft: 8,
  },
});

export default memo(BrandFullWidthCard);
