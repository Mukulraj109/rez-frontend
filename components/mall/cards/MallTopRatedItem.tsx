/**
 * MallTopRatedItem Component
 *
 * Premium list item component for displaying top rated brands
 * with ranking badges, enhanced visuals, and modern styling
 */

import React, { memo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MallBrand } from '../../../types/mall.types';

interface MallTopRatedItemProps {
  brand: MallBrand;
  onPress: (brand: MallBrand) => void;
  rank?: number;
}

// Rank badge colors for top 3
const getRankColors = (rank: number): [string, string] => {
  switch (rank) {
    case 1:
      return ['#FFD700', '#FFA500']; // Gold
    case 2:
      return ['#E8E8E8', '#C0C0C0']; // Silver
    case 3:
      return ['#CD7F32', '#B8860B']; // Bronze
    default:
      return ['#E5E7EB', '#D1D5DB']; // Gray
  }
};

const MallTopRatedItem: React.FC<MallTopRatedItemProps> = ({
  brand,
  onPress,
  rank = 0,
}) => {
  const [imageError, setImageError] = useState(false);
  const isTopThree = rank >= 1 && rank <= 3;
  const rankColors = getRankColors(rank);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(brand)}
      activeOpacity={0.85}
    >
      <View style={[styles.card, isTopThree && styles.topThreeCard]}>
        {/* Rank Badge */}
        {rank > 0 && (
          <View style={styles.rankBadgeContainer}>
            <LinearGradient
              colors={rankColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.rankBadge,
                isTopThree && styles.topThreeRankBadge,
              ]}
            >
              {isTopThree ? (
                <Ionicons
                  name={rank === 1 ? 'trophy' : 'medal'}
                  size={12}
                  color={rank === 1 ? '#92400E' : rank === 2 ? '#4B5563' : '#78350F'}
                />
              ) : (
                <Text style={styles.rankText}>{rank}</Text>
              )}
            </LinearGradient>
          </View>
        )}

        {/* Logo */}
        <View style={[styles.logoContainer, isTopThree && styles.topThreeLogoContainer]}>
          {!imageError && brand.logo ? (
            <Image
              source={{ uri: brand.logo }}
              style={styles.logo}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <LinearGradient
              colors={['#FFC107', '#F59E0B']}
              style={styles.logoFallback}
            >
              <Text style={styles.logoFallbackText}>{getInitials(brand.name)}</Text>
            </LinearGradient>
          )}
        </View>

        {/* Brand Info */}
        <View style={styles.infoContainer}>
          {/* Name Row */}
          <View style={styles.nameRow}>
            <Text style={styles.brandName} numberOfLines={1}>
              {brand.name}
            </Text>
            {brand.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#00C06A" />
              </View>
            )}
          </View>

          {/* Category */}
          {brand.mallCategory && (
            <View style={styles.categoryRow}>
              <Ionicons name="pricetag-outline" size={11} color="#9CA3AF" />
              <Text style={styles.categoryText} numberOfLines={1}>
                {brand.mallCategory.name}
              </Text>
            </View>
          )}

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {/* Cashback Badge */}
            <View style={styles.cashbackBadge}>
              <Ionicons name="wallet-outline" size={12} color="#059669" />
              <Text style={styles.cashbackText}>
                {brand.cashback.percentage}%
              </Text>
            </View>

            {/* Success Rate Badge */}
            <View style={styles.successBadge}>
              <Ionicons name="trending-up" size={12} color="#6B7280" />
              <Text style={styles.successText}>
                {brand.ratings.successRate}%
              </Text>
            </View>
          </View>
        </View>

        {/* Rating Badge */}
        <View style={styles.ratingSection}>
          <LinearGradient
            colors={['#FFC107', '#F59E0B']}
            style={styles.ratingBadge}
          >
            <Ionicons name="star" size={12} color="#FFFFFF" />
            <Text style={styles.ratingText}>
              {brand.ratings.average.toFixed(1)}
            </Text>
          </LinearGradient>
          <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    paddingLeft: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  topThreeCard: {
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  rankBadgeContainer: {
    marginRight: 10,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topThreeRankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  rankText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  logoContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  topThreeLogoContainer: {
    borderColor: 'rgba(255, 193, 7, 0.4)',
    borderWidth: 2,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  logoFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoFallbackText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  brandName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  verifiedBadge: {
    marginLeft: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cashbackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cashbackText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  successText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  ratingSection: {
    alignItems: 'center',
    gap: 6,
    marginLeft: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default memo(MallTopRatedItem);
