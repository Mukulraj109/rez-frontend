/**
 * MallLuxuryBrandCard Component
 *
 * Ultra-premium card component for luxury brands
 * Features large image, glass morphism, elegant gold accents
 */

import React, { memo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MallBrand } from '../../../types/mall.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.75;

interface MallLuxuryBrandCardProps {
  brand: MallBrand;
  onPress: (brand: MallBrand) => void;
  index?: number;
}

const MallLuxuryBrandCard: React.FC<MallLuxuryBrandCardProps> = ({
  brand,
  onPress,
  index = 0,
}) => {
  const [imageError, setImageError] = useState(false);

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
      activeOpacity={0.95}
    >
      <View style={styles.card}>
        {/* Banner Image with Overlay */}
        <View style={styles.imageContainer}>
          {!imageError && (brand.banner || brand.logo) ? (
            <Image
              source={{ uri: brand.banner || brand.logo }}
              style={styles.bannerImage}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <LinearGradient
              colors={['#1E293B', '#334155']}
              style={styles.imageFallback}
            >
              <Text style={styles.fallbackText}>{getInitials(brand.name)}</Text>
            </LinearGradient>
          )}

          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(15, 23, 42, 0.8)', 'rgba(15, 23, 42, 0.95)']}
            style={styles.imageOverlay}
          />

          {/* Luxury Badge */}
          <View style={styles.luxuryBadgeContainer}>
            <LinearGradient
              colors={['#FFD700', '#F59E0B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.luxuryBadge}
            >
              <Ionicons name="diamond" size={10} color="#0F172A" />
              <Text style={styles.luxuryBadgeText}>LUXURY</Text>
            </LinearGradient>
          </View>

          {/* Logo Circle */}
          <View style={styles.logoWrapper}>
            <LinearGradient
              colors={['#FFD700', '#F59E0B']}
              style={styles.logoBorder}
            >
              <View style={styles.logoInner}>
                {!imageError && brand.logo ? (
                  <Image
                    source={{ uri: brand.logo }}
                    style={styles.logo}
                    resizeMode="cover"
                  />
                ) : (
                  <LinearGradient
                    colors={['#FFD700', '#F59E0B']}
                    style={styles.logoFallback}
                  >
                    <Text style={styles.logoFallbackText}>{getInitials(brand.name)}</Text>
                  </LinearGradient>
                )}
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Brand Name */}
          <Text style={styles.brandName} numberOfLines={1}>
            {brand.name}
          </Text>

          {/* Description */}
          <Text style={styles.description} numberOfLines={1}>
            {brand.description || 'Premium luxury experience'}
          </Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {/* Rating */}
            {brand.ratings.average > 0 && (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.ratingText}>
                  {brand.ratings.average.toFixed(1)}
                </Text>
              </View>
            )}

            {/* Cashback */}
            <View style={styles.cashbackBadge}>
              <Ionicons name="gift" size={12} color="#00C06A" />
              <Text style={styles.cashbackText}>
                {brand.cashback.percentage}% rewards
              </Text>
            </View>
          </View>

          {/* Explore Button */}
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => onPress(brand)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#FFD700', '#F59E0B', '#D97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.exploreGradient}
            >
              <Text style={styles.exploreButtonText}>Explore Collection</Text>
              <View style={styles.exploreArrow}>
                <Ionicons name="arrow-forward" size={14} color="#FFD700" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Decorative Corner */}
        <View style={styles.cornerDecor}>
          <View style={styles.cornerLine1} />
          <View style={styles.cornerLine2} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginRight: 14,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  imageContainer: {
    height: 140,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontSize: 32,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.3)',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  luxuryBadgeContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  luxuryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  luxuryBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 1,
  },
  logoWrapper: {
    position: 'absolute',
    bottom: -30,
    left: 16,
  },
  logoBorder: {
    width: 64,
    height: 64,
    borderRadius: 16,
    padding: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  logoInner: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
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
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  content: {
    padding: 16,
    paddingTop: 36,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFD700',
  },
  cashbackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 192, 106, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.2)',
  },
  cashbackText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00C06A',
  },
  exploreButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  exploreGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  exploreButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  exploreArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerDecor: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cornerLine1: {
    position: 'absolute',
    top: 20,
    left: 0,
    width: 30,
    height: 1,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
  },
  cornerLine2: {
    position: 'absolute',
    top: 0,
    left: 20,
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
  },
});

export default memo(MallLuxuryBrandCard);
