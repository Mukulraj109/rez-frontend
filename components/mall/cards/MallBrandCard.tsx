/**
 * MallBrandCard Component
 *
 * Card component for displaying mall store information
 * Redesigned for better visual appeal
 */

import React, { memo, useState } from 'react';
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

// Vibrant gradient colors for fallback backgrounds
const GRADIENT_COLORS: string[][] = [
  ['#667eea', '#764ba2'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'],
  ['#fa709a', '#fee140'],
  ['#a18cd1', '#fbc2eb'],
  ['#ff9a9e', '#fecfef'],
  ['#ffecd2', '#fcb69f'],
];

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
  width = 160,
  showCategory = false,
}) => {
  const [imageError, setImageError] = useState(false);

  // For in-app stores (no externalUrl), show ReZ Coins. For external brands, show cashback.
  const isInAppStore = !brand.externalUrl;
  const rewardDisplay = isInAppStore
    ? (brand.cashback.percentage > 0
        ? `Earn ${brand.cashback.percentage}% coins`
        : 'Earn ReZ Coins')
    : (brand.cashback.maxAmount
        ? `Earn ₹${brand.cashback.maxAmount} cashback`
        : `Earn ${brand.cashback.percentage}% cashback`);

  // Get initials for fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get consistent gradient based on brand name
  const getGradientColors = (name: string): string[] => {
    const index = name.charCodeAt(0) % GRADIENT_COLORS.length;
    return GRADIENT_COLORS[index];
  };

  const gradientColors = getGradientColors(brand.name);

  return (
    <TouchableOpacity
      style={[styles.container, { width }]}
      onPress={() => onPress(brand)}
      activeOpacity={0.9}
    >
      <View style={styles.card}>
        {/* Logo Container with gradient background */}
        <View style={styles.logoWrapper}>
          {!imageError && brand.logo ? (
            <View style={styles.logoContainer}>
              <Image
                source={{ uri: brand.logo }}
                style={styles.logo}
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
            </View>
          ) : (
            <LinearGradient
              colors={gradientColors as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoFallback}
            >
              <Text style={styles.logoFallbackText}>{getInitials(brand.name)}</Text>
            </LinearGradient>
          )}

          {/* New Badge Overlay */}
          {brand.isNewArrival && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
        </View>

        {/* Brand Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.brandName} numberOfLines={1}>
            {brand.name}
          </Text>

          {/* Rating Row */}
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#FFC107" />
            <Text style={styles.ratingText}>
              {brand.ratings.average > 0 ? brand.ratings.average.toFixed(1) : '5.0'}
            </Text>
          </View>

          {/* Reward (Coins for stores, Cashback for external brands) */}
          <View style={styles.rewardContainer}>
            <Ionicons
              name={isInAppStore ? "flash" : "cash-outline"}
              size={12}
              color="#00C06A"
            />
            <Text style={styles.cashbackText}>{rewardDisplay}</Text>
          </View>

          {/* Badges */}
          {brand.badges && brand.badges.length > 0 && (
            <View style={styles.badgesContainer}>
              {[...new Set(brand.badges)].filter(b => b !== brand.tier).slice(0, 1).map((badge) => (
                <View
                  key={badge}
                  style={[
                    styles.badge,
                    { backgroundColor: BADGE_COLORS[badge]?.bg || '#00C06A' },
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {badge.charAt(0).toUpperCase() + badge.slice(1)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Category */}
          {showCategory && brand.mallCategory && (
            <Text style={styles.categoryText} numberOfLines={1}>
              {brand.mallCategory.name}
            </Text>
          )}
        </View>
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
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  logoWrapper: {
    width: '100%',
    height: 90,
    position: 'relative',
  },
  logoContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
      android: {
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
      web: {
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
      },
    }),
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  newBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  infoContainer: {
    padding: 12,
  },
  brandName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
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
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  cashbackText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00C06A',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  categoryText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
  },
});

export default memo(MallBrandCard);
