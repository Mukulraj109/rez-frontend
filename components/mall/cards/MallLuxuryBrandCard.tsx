/**
 * MallLuxuryBrandCard Component
 *
 * Premium card component for luxury brands with dark+gold theme
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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MallBrand } from '../../../types/mall.types';

interface MallLuxuryBrandCardProps {
  brand: MallBrand;
  onPress: (brand: MallBrand) => void;
}

const MallLuxuryBrandCard: React.FC<MallLuxuryBrandCardProps> = ({
  brand,
  onPress,
}) => {
  const cashbackDisplay = brand.cashback.maxAmount
    ? `Earn up to ₹${brand.cashback.maxAmount.toLocaleString()} cashback`
    : `${brand.cashback.percentage}% cashback`;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(brand)}
      activeOpacity={0.9}
    >
      <View style={styles.card}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: brand.logo }}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Luxury Badge */}
          <View style={styles.luxuryBadge}>
            <Text style={styles.luxuryBadgeText}>Luxury</Text>
          </View>
        </View>

        {/* Brand Name */}
        <Text style={styles.brandName} numberOfLines={1}>
          {brand.name}
        </Text>

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {brand.description || cashbackDisplay}
        </Text>

        {/* Rating and Cashback Row */}
        <View style={styles.statsRow}>
          {brand.ratings.average > 0 && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>
                {brand.ratings.average.toFixed(1)}
              </Text>
            </View>
          )}
          <Text style={styles.cashbackText}>
            {brand.cashback.percentage}% cashback
          </Text>
        </View>

        {/* Explore Button */}
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => onPress(brand)}
        >
          <LinearGradient
            colors={['#FFD700', '#FFC107', '#F59E0B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.exploreGradient}
          >
            <Text style={styles.exploreButtonText}>Explore Collection</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  logoContainer: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  logo: {
    width: 44,
    height: 44,
  },
  luxuryBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  luxuryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFD700',
    letterSpacing: 0.5,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
  },
  cashbackText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  exploreButton: {
    overflow: 'hidden',
    borderRadius: 10,
  },
  exploreGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  exploreButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B2240',
    letterSpacing: 0.3,
  },
});

export default memo(MallLuxuryBrandCard);
